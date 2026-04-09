import React, { useState, useEffect } from 'react';
import { db, storage, auth, handleFirestoreError, OperationType } from '../../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { motion } from 'motion/react';
import { Upload, X, Check, Loader2, Globe, Image as ImageIcon, Send, Award, Star, MapPin } from 'lucide-react';
import { translateMetadata, translateObject } from '../../services/geminiService';
import { useJourneys, Journey } from '../../hooks/usePhotos';
import ExifReader from 'exifreader';

export const UploadForm: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState('');
  const [progress, setProgress] = useState(0);
  const [translating, setTranslating] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const { journeys, loading: journeysLoading, error: journeysError } = useJourneys();

  const [formData, setFormData] = useState({
    title: '',
    title_en: '',
    title_ca: '',
    country: '',
    country_en: '',
    country_ca: '',
    city: '',
    city_en: '',
    city_ca: '',
    neighborhood: '',
    neighborhood_en: '',
    neighborhood_ca: '',
    year: new Date().getFullYear(),
    photoDate: '',
    tags: '',
    orientation: 'landscape' as 'landscape' | 'portrait' | 'square',
    isFavorite: false,
    favoriteScore: 50,
    isLFI: false,
    lfiType: 'none' as 'lfimastershot' | 'lfiexhibition' | 'lfi-picture-of-the-week' | 'none',
    lfiDate: '',
    isHero: false,
    isJourneyCover: false,
    caption: '',
    caption_en: '',
    caption_ca: '',
    journeyId: '',
    subtheme: '',
    subtheme_en: '',
    subtheme_ca: '',
    cameraModel: '',
    lens: '',
    focalLength: '',
    exposureTime: '',
    aperture: '',
    iso: ''
  });

  const handleFileSelection = async (selectedFile: File) => {
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));

    // Extraer EXIF automáticamente
    try {
      const tags = await ExifReader.load(selectedFile);
      
      const cameraModel = tags['Model']?.description || '';
      const cameraMake = tags['Make']?.description || '';
      const lens = tags['LensModel']?.description || tags['Lens']?.description || '';
      const focalLength = tags['FocalLength']?.description || '';
      const exposureTime = tags['ExposureTime']?.description || '';
      const aperture = tags['FNumber']?.description || '';
      const iso = tags['ISOSpeedRatings']?.description || '';
      const imageDescription = tags['ImageDescription']?.description || '';
      
      let extractedYear = formData.year;
      let extractedDate = formData.photoDate;
      const dateTimeOriginal = tags['DateTimeOriginal']?.description || tags['DateTime']?.description || '';
      if (dateTimeOriginal) {
        const yearMatch = dateTimeOriginal.match(/^(\d{4})/);
        if (yearMatch) {
          extractedYear = parseInt(yearMatch[1], 10);
        }
        const dateParts = dateTimeOriginal.split(' ')[0].split(':');
        if (dateParts.length === 3) {
          extractedDate = `${dateParts[0]}-${dateParts[1]}-${dateParts[2]}`;
        }
      }

      // Extraer Ubicación (GPS)
      let extractedCity = '';
      let extractedCountry = '';
      let extractedNeighborhood = '';

      if (tags['GPSLatitude'] && tags['GPSLongitude']) {
        const latitude = tags['GPSLatitude'].value as any;
        const longitude = tags['GPSLongitude'].value as any;
        const latRef = tags['GPSLatitudeRef']?.value?.[0] || 'N';
        const lonRef = tags['GPSLongitudeRef']?.value?.[0] || 'E';

        const convertToDecimal = (gpsArray: any[], ref: string) => {
          if (!Array.isArray(gpsArray) || gpsArray.length < 3) return null;
          const toNum = (val: any) => Array.isArray(val) ? val[0] / val[1] : Number(val);
          let decimal = toNum(gpsArray[0]) + toNum(gpsArray[1]) / 60 + toNum(gpsArray[2]) / 3600;
          if (ref === 'S' || ref === 'W') decimal = -decimal;
          return decimal;
        };

        let latDec = typeof tags['GPSLatitude'].description === 'number' 
          ? tags['GPSLatitude'].description 
          : convertToDecimal(latitude, latRef);
          
        let lonDec = typeof tags['GPSLongitude'].description === 'number' 
          ? tags['GPSLongitude'].description 
          : convertToDecimal(longitude, lonRef);

        // Ensure negative signs for S and W if using description directly
        if (typeof tags['GPSLatitude'].description === 'number' && latRef === 'S' && latDec !== null && latDec > 0) latDec = -latDec;
        if (typeof tags['GPSLongitude'].description === 'number' && lonRef === 'W' && lonDec !== null && lonDec > 0) lonDec = -lonDec;

        if (latDec !== null && lonDec !== null) {
          setGeocoding(true);
          try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latDec}&lon=${lonDec}&zoom=18&addressdetails=1&email=eduard.kun115@gmail.com`, {
              headers: { 'Accept-Language': 'es' }
            });
            const data = await response.json();
            if (data.address) {
              extractedCity = data.address.city || data.address.town || data.address.village || '';
              extractedNeighborhood = data.address.suburb || data.address.neighbourhood || data.address.residential || '';
              extractedCountry = data.address.country || '';
            }
          } catch (geoError) {
            console.error('Error en geocodificación inversa:', geoError);
          } finally {
            setGeocoding(false);
          }
        }
      }

      setFormData(prev => ({
        ...prev,
        cameraModel: (() => {
          const model = cameraModel || '';
          const make = cameraMake || '';
          const full = make && !model.toLowerCase().includes(make.toLowerCase()) 
            ? `${make} ${model}` 
            : model;
          
          // Remove redundant "Leica Camera AG" or "Leica Camera" prefixes as requested
          return full
            .replace(/^Leica Camera AG\s+/i, '')
            .replace(/^Leica Camera\s+/i, '')
            .trim() || prev.cameraModel;
        })(),
        lens: lens || prev.lens,
        focalLength: focalLength ? focalLength.replace(/\s*mm/gi, '') : prev.focalLength,
        exposureTime: exposureTime || prev.exposureTime,
        aperture: aperture ? aperture.replace(/f\//gi, '') : prev.aperture,
        iso: iso ? iso.toString() : prev.iso,
        year: extractedYear !== undefined ? extractedYear : prev.year,
        photoDate: extractedDate !== undefined ? extractedDate : prev.photoDate,
        caption: imageDescription || prev.caption,
        city: extractedCity || prev.city,
        country: extractedCountry || prev.country,
        neighborhood: extractedNeighborhood || prev.neighborhood
      }));
    } catch (error) {
      console.error('Error leyendo EXIF:', error);
    }
    
    const img = new Image();
    img.onload = () => {
      const ratio = img.width / img.height;
      if (ratio > 1.2) setFormData(prev => ({ ...prev, orientation: 'landscape' }));
      else if (ratio < 0.8) setFormData(prev => ({ ...prev, orientation: 'portrait' }));
      else setFormData(prev => ({ ...prev, orientation: 'square' }));
    };
    img.src = URL.createObjectURL(selectedFile);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await handleFileSelection(e.target.files[0]);
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

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleAutoTranslate = async () => {
    if (translating) return;
    setTranslating(true);
    try {
      const updates: any = {};
      const promises: Promise<void>[] = [];

      if (formData.country) {
        promises.push(translateMetadata(formData.country, ['en', 'ca']).then(res => {
          updates.country_en = res.en || formData.country_en;
          updates.country_ca = res.ca || formData.country_ca;
        }));
      }
      if (formData.city) {
        promises.push(translateMetadata(formData.city, ['en', 'ca']).then(res => {
          updates.city_en = res.en || formData.city_en;
          updates.city_ca = res.ca || formData.city_ca;
        }));
      }
      if (formData.neighborhood) {
        promises.push(translateMetadata(formData.neighborhood, ['en', 'ca']).then(res => {
          updates.neighborhood_en = res.en || formData.neighborhood_en;
          updates.neighborhood_ca = res.ca || formData.neighborhood_ca;
        }));
      }
      if (formData.subtheme) {
        promises.push(translateMetadata(formData.subtheme, ['en', 'ca']).then(res => {
          updates.subtheme_en = res.en || formData.subtheme_en;
          updates.subtheme_ca = res.ca || formData.subtheme_ca;
        }));
      }
      if (formData.caption) {
        promises.push(translateMetadata(formData.caption, ['en', 'ca']).then(res => {
          updates.caption_en = res.en || formData.caption_en;
          updates.caption_ca = res.ca || formData.caption_ca;
        }));
      }

      if (promises.length === 0) {
        alert("No hay campos nuevos para traducir. Asegúrate de haber rellenado los campos en español.");
        setTranslating(false);
        return;
      }

      await Promise.all(promises);
      
      setFormData(prev => ({
        ...prev,
        ...updates
      }));
      alert("¡Textos traducidos con éxito!");
    } catch (error: any) {
      console.error("Translation error:", error);
      alert("Error al traducir automáticamente: " + (error.message || "Revisa la consola para más detalles."));
    } finally {
      setTranslating(false);
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
      console.log("Translating metadata for new upload...", formData.title);
      
      const fieldsToTranslate: any = {};
      if (!formData.country_en || !formData.country_ca) fieldsToTranslate.country = formData.country;
      if (!formData.city_en || !formData.city_ca) fieldsToTranslate.city = formData.city;
      if (!formData.neighborhood_en || !formData.neighborhood_ca) fieldsToTranslate.neighborhood = formData.neighborhood;
      if (!formData.subtheme_en || !formData.subtheme_ca) fieldsToTranslate.subtheme = formData.subtheme;
      if (formData.caption && (!formData.caption_en || !formData.caption_ca)) fieldsToTranslate.caption = formData.caption;
      
      const objectTranslations = await translateObject(fieldsToTranslate, ['es', 'en', 'ca']);
      console.log("Translations received:", { objectTranslations });
      
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
            
            const finalData = {
              ...formData,
              title: formData.title,
              title_en: formData.title_en || formData.title,
              title_ca: formData.title_ca || formData.title,
              caption: objectTranslations.es?.caption || formData.caption,
              caption_en: formData.caption_en || objectTranslations.en?.caption || formData.caption,
              caption_ca: formData.caption_ca || objectTranslations.ca?.caption || formData.caption,
              country: objectTranslations.es?.country || formData.country,
              country_en: formData.country_en || objectTranslations.en?.country || formData.country,
              country_ca: formData.country_ca || objectTranslations.ca?.country || formData.country,
              city: objectTranslations.es?.city || formData.city,
              city_en: formData.city_en || objectTranslations.en?.city || formData.city,
              city_ca: formData.city_ca || objectTranslations.ca?.city || formData.city,
              neighborhood: objectTranslations.es?.neighborhood || formData.neighborhood,
              neighborhood_en: formData.neighborhood_en || objectTranslations.en?.neighborhood || formData.neighborhood,
              neighborhood_ca: formData.neighborhood_ca || objectTranslations.ca?.neighborhood || formData.neighborhood,
              subtheme: objectTranslations.es?.subtheme || formData.subtheme,
              subtheme_en: formData.subtheme_en || objectTranslations.en?.subtheme || formData.subtheme,
              subtheme_ca: formData.subtheme_ca || objectTranslations.ca?.subtheme || formData.subtheme,
              url: downloadURL,
              tags: formData.tags.split(',').map(t => t.trim().toLowerCase()).filter(t => t),
              authorUid: auth.currentUser?.uid,
              createdAt: serverTimestamp()
            };

            console.log("Final photo data to add:", finalData);
            await addDoc(collection(db, 'photos'), finalData);

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
              title: '', title_en: '', title_ca: '', country: '', country_en: '', country_ca: '', city: '', city_en: '', city_ca: '', neighborhood: '', neighborhood_en: '', neighborhood_ca: '', year: new Date().getFullYear(), photoDate: '',
              tags: '', orientation: 'landscape', isFavorite: false, favoriteScore: 50,
              isLFI: false, lfiType: 'none', lfiDate: '', isHero: false, isJourneyCover: false, caption: '', caption_en: '', caption_ca: '', journeyId: '', subtheme: '', subtheme_en: '', subtheme_ca: '',
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
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
      <div className="flex flex-col gap-8">
        <div className="space-y-4">
          <label className="block text-xs font-mono uppercase tracking-widest text-gray-400 mb-2">Imagen</label>
          <div 
            className={`relative aspect-[4/3] max-h-[500px] rounded-3xl border-2 border-dashed transition-all overflow-hidden flex items-center justify-center ${preview ? 'border-transparent' : isDragging ? 'border-black bg-black/5' : 'border-gray-300 hover:border-black bg-white/50'}`}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-3 flex justify-between items-center mb-[-1rem]">
              <h3 className="text-sm font-mono uppercase tracking-widest text-black border-b border-gray-200 pb-2 w-full">Títulos</h3>
            </div>
            
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-gray-400 mb-2">Título (ES)</label>
              <textarea 
                value={formData.title}
                onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full bg-white border-none rounded-2xl p-4 focus:ring-2 focus:ring-black outline-none transition-all resize-none"
                placeholder="Ej: The Lonely Monk"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-gray-400 mb-2">Título (EN)</label>
              <textarea 
                value={formData.title_en}
                onChange={e => setFormData(prev => ({ ...prev, title_en: e.target.value }))}
                className="w-full bg-white border-none rounded-2xl p-4 focus:ring-2 focus:ring-black outline-none transition-all resize-none"
                placeholder="Ej: The Lonely Monk"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-gray-400 mb-2">Título (CA)</label>
              <textarea 
                value={formData.title_ca}
                onChange={e => setFormData(prev => ({ ...prev, title_ca: e.target.value }))}
                className="w-full bg-white border-none rounded-2xl p-4 focus:ring-2 focus:ring-black outline-none transition-all resize-none"
                placeholder="Ej: El Monjo Solitari"
                rows={2}
              />
            </div>
            
            <div className="col-span-3 mt-4 flex justify-between items-center border-b border-gray-200 pb-2">
              <h3 className="text-sm font-mono uppercase tracking-widest text-black">Localización y Metadatos</h3>
            </div>
            
            <div className="col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-2">
                  País (ES)
                  {geocoding && <Loader2 size={12} className="animate-spin text-red-600" />}
                </label>
                <textarea 
                  value={formData.country}
                  onChange={e => setFormData(prev => ({ ...prev, country: e.target.value }))}
                  className="w-full bg-white border-none rounded-2xl p-4 focus:ring-2 focus:ring-black outline-none transition-all resize-none"
                  placeholder="Marruecos"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-gray-400 mb-2">País (EN)</label>
                <textarea 
                  value={formData.country_en}
                  onChange={e => setFormData(prev => ({ ...prev, country_en: e.target.value }))}
                  className="w-full bg-white border-none rounded-2xl p-4 focus:ring-2 focus:ring-black outline-none transition-all resize-none"
                  placeholder="Morocco"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-gray-400 mb-2">País (CA)</label>
                <textarea 
                  value={formData.country_ca}
                  onChange={e => setFormData(prev => ({ ...prev, country_ca: e.target.value }))}
                  className="w-full bg-white border-none rounded-2xl p-4 focus:ring-2 focus:ring-black outline-none transition-all resize-none"
                  placeholder="Marroc"
                  rows={2}
                />
              </div>
            </div>

            <div className="col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-gray-400 mb-2">Ciudad (ES)</label>
                <textarea 
                  value={formData.city}
                  onChange={e => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  className="w-full bg-white border-none rounded-2xl p-4 focus:ring-2 focus:ring-black outline-none transition-all resize-none"
                  placeholder="Marrakech"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-gray-400 mb-2">Ciudad (EN)</label>
                <textarea 
                  value={formData.city_en}
                  onChange={e => setFormData(prev => ({ ...prev, city_en: e.target.value }))}
                  className="w-full bg-white border-none rounded-2xl p-4 focus:ring-2 focus:ring-black outline-none transition-all resize-none"
                  placeholder="Marrakesh"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-gray-400 mb-2">Ciudad (CA)</label>
                <textarea 
                  value={formData.city_ca}
                  onChange={e => setFormData(prev => ({ ...prev, city_ca: e.target.value }))}
                  className="w-full bg-white border-none rounded-2xl p-4 focus:ring-2 focus:ring-black outline-none transition-all resize-none"
                  placeholder="Marràqueix"
                  rows={2}
                />
              </div>
            </div>

            <div className="col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-gray-400 mb-2">Barrio (ES)</label>
                <textarea 
                  value={formData.neighborhood}
                  onChange={e => setFormData(prev => ({ ...prev, neighborhood: e.target.value }))}
                  className="w-full bg-white border-none rounded-2xl p-4 focus:ring-2 focus:ring-black outline-none transition-all resize-none"
                  placeholder="Medina"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-gray-400 mb-2">Barrio (EN)</label>
                <textarea 
                  value={formData.neighborhood_en}
                  onChange={e => setFormData(prev => ({ ...prev, neighborhood_en: e.target.value }))}
                  className="w-full bg-white border-none rounded-2xl p-4 focus:ring-2 focus:ring-black outline-none transition-all resize-none"
                  placeholder="Medina"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-gray-400 mb-2">Barrio (CA)</label>
                <textarea 
                  value={formData.neighborhood_ca}
                  onChange={e => setFormData(prev => ({ ...prev, neighborhood_ca: e.target.value }))}
                  className="w-full bg-white border-none rounded-2xl p-4 focus:ring-2 focus:ring-black outline-none transition-all resize-none"
                  placeholder="Medina"
                  rows={2}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-gray-400 mb-2">Fecha de la Foto</label>
              <input 
                type="date" value={formData.photoDate}
                onChange={e => setFormData(prev => ({ ...prev, photoDate: e.target.value }))}
                className="w-full bg-white border-none rounded-2xl p-4 focus:ring-2 focus:ring-black outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-gray-400 mb-2">Año</label>
              <input 
                type="number" value={formData.year}
                onChange={e => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                className="w-full bg-white border-none rounded-2xl p-4 focus:ring-2 focus:ring-black outline-none transition-all"
              />
            </div>

            <div className="col-span-3">
              <label className="block text-xs font-mono uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-2">
                Viaje (Journey)
                {journeysLoading && <Loader2 size={12} className="animate-spin" />}
                {journeysError && <span className="text-red-500 text-[10px] normal-case">Error al cargar</span>}
              </label>
              <select 
                value={formData.journeyId}
                onChange={e => setFormData(prev => ({ ...prev, journeyId: e.target.value }))}
                className={`w-full bg-white border-none rounded-2xl p-4 focus:ring-2 focus:ring-black outline-none transition-all ${journeysError ? 'ring-1 ring-red-200' : ''}`}
                disabled={journeysLoading}
              >
                <option value="">{journeysLoading ? 'Cargando viajes...' : journeysError ? 'Error al cargar viajes' : 'Ninguno'}</option>
                {journeys.map(j => (
                  <option key={j.id} value={j.id}>
                    {j.title} ({j.country}) {j.isSpecial ? '— (Sesión ESP.)' : ''}
                  </option>
                ))}
              </select>
              {journeysError && (
                <p className="mt-1 text-[10px] text-red-500 italic">
                  No se han podido cargar los viajes. Comprueba tu conexión o permisos.
                </p>
              )}
            </div>

            <div className="col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-gray-400 mb-2">Subtema (ES)</label>
                <textarea 
                  value={formData.subtheme}
                  onChange={e => setFormData(prev => ({ ...prev, subtheme: e.target.value }))}
                  className="w-full bg-white border-none rounded-2xl p-4 focus:ring-2 focus:ring-black outline-none transition-all resize-none"
                  placeholder="Ej: Chinatown"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-gray-400 mb-2">Subtema (EN)</label>
                <textarea 
                  value={formData.subtheme_en}
                  onChange={e => setFormData(prev => ({ ...prev, subtheme_en: e.target.value }))}
                  className="w-full bg-white border-none rounded-2xl p-4 focus:ring-2 focus:ring-black outline-none transition-all resize-none"
                  placeholder="Ej: Chinatown"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-gray-400 mb-2">Subtema (CA)</label>
                <textarea 
                  value={formData.subtheme_ca}
                  onChange={e => setFormData(prev => ({ ...prev, subtheme_ca: e.target.value }))}
                  className="w-full bg-white border-none rounded-2xl p-4 focus:ring-2 focus:ring-black outline-none transition-all resize-none"
                  placeholder="Ex: Barri Xinès"
                  rows={2}
                />
              </div>
            </div>

            <div className="col-span-3">
              <label className="block text-xs font-mono uppercase tracking-widest text-gray-400 mb-2">Hashtags (Internacional)</label>
              <textarea 
                value={formData.tags}
                onChange={e => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                className="w-full bg-white border-none rounded-2xl p-4 focus:ring-2 focus:ring-black outline-none transition-all resize-none"
                placeholder="portrait, street, market... (separados por comas)"
                rows={2}
              />
            </div>

            <div className="col-span-3 flex justify-between items-center mb-[-1rem] mt-4 border-b border-gray-200 pb-2">
              <h3 className="text-sm font-mono uppercase tracking-widest text-black">Descripción / Historia</h3>
            </div>

            <div className="col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-gray-400 mb-2">Descripción (ES)</label>
                <textarea 
                  value={formData.caption}
                  onChange={e => setFormData(prev => ({ ...prev, caption: e.target.value }))}
                  className="w-full bg-white border-none rounded-2xl p-4 focus:ring-2 focus:ring-black outline-none transition-all h-32 resize-none"
                  placeholder="Cuenta la historia detrás de la foto..."
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-gray-400 mb-2">Descripción (EN)</label>
                <textarea 
                  value={formData.caption_en}
                  onChange={e => setFormData(prev => ({ ...prev, caption_en: e.target.value }))}
                  className="w-full bg-white border-none rounded-2xl p-4 focus:ring-2 focus:ring-black outline-none transition-all h-32 resize-none"
                  placeholder="Tell the story behind the photo..."
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-gray-400 mb-2">Descripción (CA)</label>
                <textarea 
                  value={formData.caption_ca}
                  onChange={e => setFormData(prev => ({ ...prev, caption_ca: e.target.value }))}
                  className="w-full bg-white border-none rounded-2xl p-4 focus:ring-2 focus:ring-black outline-none transition-all h-32 resize-none"
                  placeholder="Explica la història darrere de la foto..."
                />
              </div>
            </div>

            {/* EXIF Data Section */}
            <div className="col-span-3 mt-8">
              <h3 className="text-sm font-mono uppercase tracking-widest text-black mb-4 border-b border-gray-200 pb-2">Datos EXIF (Cámara)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-xs font-mono uppercase tracking-widest text-gray-400 mb-2">Cámara</label>
                  <input 
                    type="text" value={formData.cameraModel}
                    onChange={e => setFormData(prev => ({ ...prev, cameraModel: e.target.value }))}
                    className="w-full bg-white border-none rounded-2xl p-4 focus:ring-2 focus:ring-black outline-none transition-all"
                    placeholder="Ej: SL3"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-mono uppercase tracking-widest text-gray-400 mb-2">Lente</label>
                  <input 
                    type="text" value={formData.lens}
                    onChange={e => setFormData(prev => ({ ...prev, lens: e.target.value }))}
                    className="w-full bg-white border-none rounded-2xl p-4 focus:ring-2 focus:ring-black outline-none transition-all"
                    placeholder="Ej: Vario-Elmarit-SL 24-90 f/2.8-4 Asph"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-gray-400 mb-2">Distancia Focal</label>
                  <input 
                    type="text" value={formData.focalLength}
                    onChange={e => setFormData(prev => ({ ...prev, focalLength: e.target.value }))}
                    className="w-full bg-white border-none rounded-2xl p-4 focus:ring-2 focus:ring-black outline-none transition-all"
                    placeholder="Ej: 89"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-gray-400 mb-2">Tiempo de Exposición</label>
                  <input 
                    type="text" value={formData.exposureTime}
                    onChange={e => setFormData(prev => ({ ...prev, exposureTime: e.target.value }))}
                    className="w-full bg-white border-none rounded-2xl p-4 focus:ring-2 focus:ring-black outline-none transition-all"
                    placeholder="Ej: 1/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-gray-400 mb-2">Apertura</label>
                  <input 
                    type="text" value={formData.aperture}
                    onChange={e => setFormData(prev => ({ ...prev, aperture: e.target.value }))}
                    className="w-full bg-white border-none rounded-2xl p-4 focus:ring-2 focus:ring-black outline-none transition-all"
                    placeholder="Ej: 4.5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-gray-400 mb-2">ISO</label>
                  <input 
                    type="text" value={formData.iso}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <div className="flex flex-col">
                    <label className="text-[10px] font-mono uppercase text-gray-400 mb-1 ml-1">Fecha Publicación LFI</label>
                    <input 
                      type="date"
                      value={formData.lfiDate}
                      onChange={e => setFormData(prev => ({ ...prev, lfiDate: e.target.value }))}
                      className="w-full bg-white border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-600"
                    />
                  </div>
                </div>
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

            {/* Single Translation Button */}
            <div className="pt-4">
              <button
                type="button"
                onClick={handleAutoTranslate}
                disabled={translating}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-neutral-100 text-black text-xs font-bold uppercase tracking-widest rounded-2xl hover:bg-neutral-200 transition-all disabled:opacity-50 border border-neutral-200"
              >
                {translating ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Traduciendo todo con IA...
                  </>
                ) : (
                  <>
                    <Globe size={16} />
                    Traducir todo automáticamente
                  </>
                )}
              </button>
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
