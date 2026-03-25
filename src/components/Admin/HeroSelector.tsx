import React, { useState, useRef } from 'react';
import { usePhotos } from '../../hooks/usePhotos';
import { db, storage, auth } from '../../firebase';
import { doc, updateDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Check, Image as ImageIcon, Loader2, Upload } from 'lucide-react';

export const HeroSelector: React.FC = () => {
  const { photos, loading } = usePhotos();
  const [updating, setUpdating] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const heroPhotos = photos.filter(p => p.isHero);

  const toggleHero = async (photoId: string, currentStatus: boolean) => {
    setUpdating(photoId);
    try {
      const photoRef = doc(db, 'photos', photoId);
      await updateDoc(photoRef, {
        isHero: !currentStatus
      });
    } catch (error) {
      console.error('Error updating hero status:', error);
      alert('Error al actualizar el estado. Por favor, inténtalo de nuevo.');
    } finally {
      setUpdating(null);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const files = Array.from(e.target.files);
    
    if (heroPhotos.length + files.length > 25) {
      alert(`Solo puedes tener hasta 25 fotos en el Hero. Actualmente tienes ${heroPhotos.length}, y estás intentando añadir ${files.length}.`);
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    let completed = 0;

    for (const file of files) {
      try {
        const storageRef = ref(storage, `hero/${Date.now()}_${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        await new Promise<void>((resolve, reject) => {
          uploadTask.on('state_changed', 
            (snapshot) => {
              // Optional progress tracking
            },
            (error) => reject(error),
            async () => {
              try {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                
                const img = new Image();
                img.onload = async () => {
                  const ratio = img.width / img.height;
                  let orientation = 'square';
                  if (ratio > 1.2) orientation = 'landscape';
                  else if (ratio < 0.8) orientation = 'portrait';

                  await addDoc(collection(db, 'photos'), {
                    title: file.name.split('.')[0],
                    caption: '',
                    caption_en: '',
                    caption_ca: '',
                    url: downloadURL,
                    tags: ['hero'],
                    isHero: true,
                    isFavorite: false,
                    favoriteScore: 50,
                    isLFI: false,
                    lfiType: 'none',
                    orientation,
                    country: '',
                    city: '',
                    year: new Date().getFullYear(),
                    authorUid: auth.currentUser?.uid || '',
                    createdAt: serverTimestamp()
                  });
                  resolve();
                };
                img.onerror = async () => {
                  // Fallback if image cannot be loaded (e.g. unsupported format in browser)
                  await addDoc(collection(db, 'photos'), {
                    title: file.name.split('.')[0],
                    caption: '',
                    caption_en: '',
                    caption_ca: '',
                    url: downloadURL,
                    tags: ['hero'],
                    isHero: true,
                    isFavorite: false,
                    favoriteScore: 50,
                    isLFI: false,
                    lfiType: 'none',
                    orientation: 'landscape',
                    country: '',
                    city: '',
                    year: new Date().getFullYear(),
                    authorUid: auth.currentUser?.uid || '',
                    createdAt: serverTimestamp()
                  });
                  resolve();
                };
                img.src = URL.createObjectURL(file);
              } catch (err) {
                reject(err);
              }
            }
          );
        });
        
        completed++;
        setUploadProgress(Math.round((completed / files.length) * 100));
      } catch (error) {
        console.error('Error uploading file:', error);
        alert(`Error al subir ${file.name}`);
      }
    }

    setUploading(false);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h3 className="text-xl font-serif italic mb-2 flex items-center gap-2">
              <ImageIcon size={20} className="text-brand-accent" />
              Fotos del Hero ({heroPhotos.length}/25)
            </h3>
            <p className="text-sm text-brand-secondary">
              Añade hasta 25 fotos de cualquier formato para mostrar en la galería 3D de la página de inicio.
            </p>
          </div>
          
          <div>
            <input 
              type="file" 
              multiple 
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden" 
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || heroPhotos.length >= 25}
              className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              {uploading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Subiendo... {uploadProgress}%
                </>
              ) : (
                <>
                  <Upload size={18} />
                  Añadir imágenes
                </>
              )}
            </button>
          </div>
        </div>

        {heroPhotos.length === 0 ? (
          <p className="text-sm text-brand-secondary italic text-center py-8">
            No hay fotos en el Hero. Sube algunas imágenes.
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {heroPhotos.map(photo => (
              <div key={photo.id} className="relative group rounded-xl overflow-hidden aspect-square bg-neutral-100">
                <img src={photo.url} alt={photo.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={() => toggleHero(photo.id, true)}
                    disabled={updating === photo.id}
                    className="px-4 py-2 bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {updating === photo.id ? 'Actualizando...' : 'Quitar'}
                  </button>
                </div>
                <div className="absolute top-2 right-2 w-6 h-6 bg-brand-accent rounded-full flex items-center justify-center shadow-lg">
                  <Check size={14} className="text-white" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
