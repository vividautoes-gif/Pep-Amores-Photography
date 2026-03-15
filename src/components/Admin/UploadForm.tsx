import React, { useState, useEffect } from 'react';
import { db, storage, auth } from '../../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { motion } from 'motion/react';
import { Upload, X, Check, Loader2, Globe, Image as ImageIcon, Send, Award, Star, MapPin } from 'lucide-react';
import { translateMetadata } from '../../services/geminiService';
import { Journey, Story } from '../../hooks/usePhotos';

export const UploadForm: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState('');
  const [progress, setProgress] = useState(0);
  const [translating, setTranslating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [stories, setStories] = useState<Story[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    country: '',
    city: '',
    neighborhood: '',
    year: new Date().getFullYear(),
    tags: '',
    orientation: 'landscape' as 'landscape' | 'portrait' | 'square',
    isFavorite: false,
    favoriteScore: 50,
    isLFI: false,
    lfiType: 'none' as 'lfimastershot' | 'lfiexhibition' | 'lfi-picture-of-the-week' | 'none',
    isHero: false,
    isJourneyCover: false,
    caption: '',
    journeyId: '',
    subtheme: '',
    storyId: '',
    cameraModel: '',
    lens: '',
    focalLength: '',
    exposureTime: '',
    aperture: '',
    iso: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      const jSnap = await getDocs(query(collection(db, 'journeys'), orderBy('createdAt', 'desc')));
      const sSnap = await getDocs(query(collection(db, 'stories'), orderBy('createdAt', 'desc')));
      setJourneys(jSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Journey[]);
      setStories(sSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Story[]);
    };
    fetchData();
  }, []);

  const handleFileSelection = (selectedFile: File) => {
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    
    const img = new Image();
    img.onload = () => {
      const ratio = img.width / img.height;
      if (ratio > 1.2) setFormData(prev => ({ ...prev, orientation: 'landscape' }));
      else if (ratio < 0.8) setFormData(prev => ({ ...prev, orientation: 'portrait' }));
      else setFormData(prev => ({ ...prev, orientation: 'square' }));
    };
    img.src = URL.createObjectURL(selectedFile);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !auth.currentUser) {
      alert("Falta el archivo o no has iniciado sesión.");
      return;
    }

    setUploading(true);
    setUploadStep('Traduciendo textos (1/3)...');
    
    try {
      setTranslating(true);
      const translations = await translateMetadata(formData.title, ['en', 'ca']);
      const captionTranslations = formData.caption ? await translateMetadata(formData.caption, ['en', 'ca']) : {};
      setTranslating(false);

      setUploadStep('Subiendo imagen a Firebase Storage (2/3)...');
      const storageRef = ref(storage, `photos/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed', 
        (snapshot) => {
          const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(p);
        },
        (error) => {
          console.error("Upload error:", error);
          setUploading(false);
          setUploadStep('');
          alert("Error al subir la imagen: " + error.message + "\n\n¿Has activado Firebase Storage en la consola de Firebase?");
        },
        async () => {
          try {
            setUploadStep('Guardando datos en la base de datos (3/3)...');
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            
            await addDoc(collection(db, 'photos'), {
              ...formData,
              title_en: translations.en || formData.title,
              title_ca: translations.ca || formData.title,
              caption_en: captionTranslations.en || formData.caption,
              caption_ca: captionTranslations.ca || formData.caption,
              url: downloadURL,
              tags: formData.tags.split(',').map(t => t.trim().toLowerCase()).filter(t => t),
              authorUid: auth.currentUser?.uid,
              createdAt: serverTimestamp()
            });

            if (formData.isJourneyCover && formData.journeyId) {
              await updateDoc(doc(db, 'journeys', formData.journeyId), {
                coverUrl: downloadURL
              });
            }

            setFile(null);
            setPreview(null);
            setUploading(false);
            setUploadStep('');
            setProgress(0);
            setFormData({
              title: '', country: '', city: '', neighborhood: '', year: new Date().getFullYear(),
              tags: '', orientation: 'landscape', isFavorite: false, favoriteScore: 50,
              isLFI: false, lfiType: 'none', isHero: false, isJourneyCover: false, caption: '', journeyId: '', subtheme: '', storyId: '',
              cameraModel: '', lens: '', focalLength: '', exposureTime: '', aperture: '', iso: ''
            });
            alert("¡Fotografía publicada con éxito!");
          } catch (err: any) {
            console.error("Error saving to Firestore:", err);
            setUploading(false);
            setUploadStep('');
            alert("Error al guardar los datos en la base de datos: " + err.message);
          }
        }
      );
    } catch (error: any) {
      console.error("Error submitting form:", error);
      setUploading(false);
      setUploadStep('');
      alert("Error general: " + error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-4">
          <label className="block text-xs font-mono uppercase tracking-widest text-gray-400 mb-2">Imagen</label>
          <div 
            className={`relative aspect-[4/3] rounded-3xl border-2 border-dashed transition-all overflow-hidden flex items-center justify-center ${preview ? 'border-transparent' : isDragging ? 'border-black bg-black/5' : 'border-gray-300 hover:border-black bg-white/50'}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {preview ? (
              <>
                <img src={preview} alt="Preview" className="w-full h-full object-contain" />
                <button 
                  type="button"
                  onClick={() => { setFile(null); setPreview(null); }}
                  className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-md text-white rounded-full hover:bg-black transition-colors"
                >
                  <X size={20} />
                </button>
              </>
            ) : (
              <label className="cursor-pointer flex flex-col items-center gap-4 p-12 text-center">
                <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center text-gray-400">
                  <Upload size={32} />
                </div>
                <div>
                  <p className="font-medium">Haz clic para subir o arrastra una imagen</p>
                  <p className="text-sm text-gray-400 mt-1">Máxima calidad recomendada</p>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
              </label>
            )}
          </div>
          
          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span>{uploadStep || 'Subiendo...'}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-black"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-xs font-mono uppercase tracking-widest text-gray-400 mb-2">Título (ES)</label>
              <input 
                type="text" required value={formData.title}
                onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full bg-white border-none rounded-2xl p-4 focus:ring-2 focus:ring-black outline-none transition-all"
                placeholder="Ej: El Monje Solitario"
              />
            </div>
            
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-gray-400 mb-2">País</label>
              <input 
                type="text" required value={formData.country}
                onChange={e => setFormData(prev => ({ ...prev, country: e.target.value }))}
                className="w-full bg-white border-none rounded-2xl p-4 focus:ring-2 focus:ring-black outline-none transition-all"
                placeholder="Marruecos"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-gray-400 mb-2">Ciudad / Localización</label>
              <input 
                type="text" value={formData.city}
                onChange={e => setFormData(prev => ({ ...prev, city: e.target.value }))}
                className="w-full bg-white border-none rounded-2xl p-4 focus:ring-2 focus:ring-black outline-none transition-all"
                placeholder="Marrakech"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-gray-400 mb-2">Barrio (Opcional)</label>
              <input 
                type="text" value={formData.neighborhood}
                onChange={e => setFormData(prev => ({ ...prev, neighborhood: e.target.value }))}
                className="w-full bg-white border-none rounded-2xl p-4 focus:ring-2 focus:ring-black outline-none transition-all"
                placeholder="Medina"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-gray-400 mb-2">Año</label>
              <input 
                type="number" required value={formData.year}
                onChange={e => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                className="w-full bg-white border-none rounded-2xl p-4 focus:ring-2 focus:ring-black outline-none transition-all"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-mono uppercase tracking-widest text-gray-400 mb-2">Viaje (Journey)</label>
              <select 
                value={formData.journeyId}
                onChange={e => setFormData(prev => ({ ...prev, journeyId: e.target.value }))}
                className="w-full bg-white border-none rounded-2xl p-4 focus:ring-2 focus:ring-black outline-none transition-all"
              >
                <option value="">Ninguno</option>
                {journeys.map(j => <option key={j.id} value={j.id}>{j.title} ({j.country})</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-gray-400 mb-2">Subtema (Ej: Chinatown)</label>
              <input 
                type="text" value={formData.subtheme}
                onChange={e => setFormData(prev => ({ ...prev, subtheme: e.target.value }))}
                className="w-full bg-white border-none rounded-2xl p-4 focus:ring-2 focus:ring-black outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-gray-400 mb-2">Historia (Story)</label>
              <select 
                value={formData.storyId}
                onChange={e => setFormData(prev => ({ ...prev, storyId: e.target.value }))}
                className="w-full bg-white border-none rounded-2xl p-4 focus:ring-2 focus:ring-black outline-none transition-all"
              >
                <option value="">Ninguna</option>
                {stories.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-mono uppercase tracking-widest text-gray-400 mb-2">Hashtags (separados por comas)</label>
              <input 
                type="text" value={formData.tags}
                onChange={e => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                className="w-full bg-white border-none rounded-2xl p-4 focus:ring-2 focus:ring-black outline-none transition-all"
                placeholder="portrait, street, market, bw, landscape..."
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-mono uppercase tracking-widest text-gray-400 mb-2">Caption / Historia (ES)</label>
              <textarea 
                value={formData.caption}
                onChange={e => setFormData(prev => ({ ...prev, caption: e.target.value }))}
                className="w-full bg-white border-none rounded-2xl p-4 focus:ring-2 focus:ring-black outline-none transition-all h-32 resize-none"
                placeholder="Cuenta la historia detrás de la foto..."
              />
            </div>

            {/* EXIF Data Section */}
            <div className="col-span-2 mt-8">
              <h3 className="text-sm font-mono uppercase tracking-widest text-black mb-4 border-b border-gray-200 pb-2">Datos EXIF (Cámara)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-gray-400 mb-2">Cámara</label>
                  <input 
                    type="text" value={formData.cameraModel} required
                    onChange={e => setFormData(prev => ({ ...prev, cameraModel: e.target.value }))}
                    className="w-full bg-white border-none rounded-2xl p-4 focus:ring-2 focus:ring-black outline-none transition-all"
                    placeholder="Ej: SL3"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-mono uppercase tracking-widest text-gray-400 mb-2">Lente</label>
                  <input 
                    type="text" value={formData.lens} required
                    onChange={e => setFormData(prev => ({ ...prev, lens: e.target.value }))}
                    className="w-full bg-white border-none rounded-2xl p-4 focus:ring-2 focus:ring-black outline-none transition-all"
                    placeholder="Ej: Vario-Elmarit-SL 24-90 f/2.8-4 Asph"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-gray-400 mb-2">Distancia Focal</label>
                  <input 
                    type="text" value={formData.focalLength} required
                    onChange={e => setFormData(prev => ({ ...prev, focalLength: e.target.value }))}
                    className="w-full bg-white border-none rounded-2xl p-4 focus:ring-2 focus:ring-black outline-none transition-all"
                    placeholder="Ej: 89"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-gray-400 mb-2">Tiempo de Exposición</label>
                  <input 
                    type="text" value={formData.exposureTime} required
                    onChange={e => setFormData(prev => ({ ...prev, exposureTime: e.target.value }))}
                    className="w-full bg-white border-none rounded-2xl p-4 focus:ring-2 focus:ring-black outline-none transition-all"
                    placeholder="Ej: 1/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-gray-400 mb-2">Apertura</label>
                  <input 
                    type="text" value={formData.aperture} required
                    onChange={e => setFormData(prev => ({ ...prev, aperture: e.target.value }))}
                    className="w-full bg-white border-none rounded-2xl p-4 focus:ring-2 focus:ring-black outline-none transition-all"
                    placeholder="Ej: 4.5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-gray-400 mb-2">ISO</label>
                  <input 
                    type="text" value={formData.iso} required
                    onChange={e => setFormData(prev => ({ ...prev, iso: e.target.value }))}
                    className="w-full bg-white border-none rounded-2xl p-4 focus:ring-2 focus:ring-black outline-none transition-all"
                    placeholder="Ej: 125"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${formData.isFavorite ? 'bg-black border-black text-white' : 'border-gray-300 group-hover:border-black'}`}>
                  <input type="checkbox" className="hidden" checked={formData.isFavorite} onChange={e => setFormData(prev => ({ ...prev, isFavorite: e.target.checked }))} />
                  {formData.isFavorite && <Star size={14} fill="currentColor" />}
                </div>
                <span className="text-sm font-medium">Favorita</span>
              </label>

              {formData.isFavorite && (
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-gray-400 uppercase">Score (1-100):</span>
                  <input 
                    type="number" min="1" max="100" value={formData.favoriteScore}
                    onChange={e => setFormData(prev => ({ ...prev, favoriteScore: parseInt(e.target.value) }))}
                    className="w-16 bg-white border-none rounded-lg p-2 text-center text-sm focus:ring-2 focus:ring-black"
                  />
                </div>
              )}
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${formData.isLFI ? 'bg-red-600 border-red-600 text-white' : 'border-gray-300 group-hover:border-red-600'}`}>
                  <input type="checkbox" className="hidden" checked={formData.isLFI} onChange={e => setFormData(prev => ({ ...prev, isLFI: e.target.checked }))} />
                  {formData.isLFI && <Award size={14} />}
                </div>
                <span className="text-sm font-medium">LFI Recognition</span>
              </label>

              {formData.isLFI && (
                <select 
                  value={formData.lfiType}
                  onChange={e => setFormData(prev => ({ ...prev, lfiType: e.target.value as any }))}
                  className="w-full bg-white border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-600"
                >
                  <option value="none">Seleccionar Tipo LFI</option>
                  <option value="lfimastershot">#LFImastershot</option>
                  <option value="lfiexhibition">#LFIexhibition</option>
                  <option value="lfi-picture-of-the-week">#LFIpictureoftheweek</option>
                </select>
              )}
            </div>

            <div className="flex flex-wrap gap-6 pt-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${formData.isHero ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 group-hover:border-blue-600'}`}>
                  <input type="checkbox" className="hidden" checked={formData.isHero} onChange={e => setFormData(prev => ({ ...prev, isHero: e.target.checked }))} />
                  {formData.isHero && <Check size={14} />}
                </div>
                <span className="text-sm font-medium">Mostrar en Hero (Inicio)</span>
              </label>

              {formData.journeyId && (
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${formData.isJourneyCover ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-gray-300 group-hover:border-emerald-600'}`}>
                    <input type="checkbox" className="hidden" checked={formData.isJourneyCover} onChange={e => setFormData(prev => ({ ...prev, isJourneyCover: e.target.checked }))} />
                    {formData.isJourneyCover && <Check size={14} />}
                  </div>
                  <span className="text-sm font-medium">Usar como Portada del Viaje</span>
                </label>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={uploading || !file}
            className="w-full py-5 bg-black text-white rounded-2xl font-medium flex items-center justify-center gap-3 hover:bg-zinc-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-black/10 mt-8"
          >
            {uploading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                {translating ? 'Traduciendo con IA...' : 'Subiendo Fotografía...'}
              </>
            ) : (
              <>
                <Send size={20} />
                Publicar Fotografía
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};
