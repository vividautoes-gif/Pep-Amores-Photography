import React, { useState, useRef } from 'react';
import { db, storage, auth } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Image as ImageIcon, Loader2, Upload, X } from 'lucide-react';

export const AlbumForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    coverUrl: '',
    hoverImageUrls: [] as string[]
  });
  const [uploading, setUploading] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const hoverInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File, type: 'cover' | 'hover') => {
    setUploading(true);
    try {
      const storageRef = ref(storage, `albums/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);
      const snapshot = await uploadTask;
      const downloadURL = await getDownloadURL(snapshot.ref);

      if (type === 'cover') {
        setFormData(prev => ({ ...prev, coverUrl: downloadURL }));
      } else {
        setFormData(prev => ({ ...prev, hoverImageUrls: [...prev.hoverImageUrls, downloadURL] }));
      }
    } catch (error) {
      console.error('Error uploading:', error);
      alert('Error al subir la imagen');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'albums'), {
        ...formData,
        authorUid: auth.currentUser.uid,
        createdAt: serverTimestamp()
      });
      setFormData({ title: '', coverUrl: '', hoverImageUrls: [] });
      alert("Álbum creado con éxito");
    } catch (error) {
      console.error(error);
      alert("Error al crear el álbum");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6 bg-white p-8 rounded-3xl shadow-sm border border-neutral-100">
      <div>
        <label className="block text-xs font-mono uppercase tracking-widest text-gray-400 mb-2">Título del Álbum</label>
        <input 
          type="text" required value={formData.title}
          onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
          className="w-full bg-neutral-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-black outline-none transition-all"
          placeholder="Ej: Colección Verano 2026"
        />
      </div>

      <div>
        <label className="block text-xs font-mono uppercase tracking-widest text-gray-400 mb-2">Imagen de Portada</label>
        <div className="flex items-center gap-4">
          {formData.coverUrl && <img src={formData.coverUrl} className="w-20 h-20 object-cover rounded-xl" />}
          <input type="file" ref={coverInputRef} className="hidden" onChange={e => e.target.files && handleUpload(e.target.files[0], 'cover')} />
          <button type="button" onClick={() => coverInputRef.current?.click()} className="px-4 py-2 bg-neutral-100 rounded-xl text-sm">Seleccionar Portada</button>
        </div>
      </div>

      <div>
        <label className="block text-xs font-mono uppercase tracking-widest text-gray-400 mb-2">Imágenes de Hover</label>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {formData.hoverImageUrls.map((url, i) => (
            <div key={i} className="relative">
              <img src={url} className="w-full aspect-square object-cover rounded-xl" />
              <button type="button" onClick={() => setFormData(prev => ({ ...prev, hoverImageUrls: prev.hoverImageUrls.filter((_, idx) => idx !== i) }))} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><X size={12} /></button>
            </div>
          ))}
        </div>
        <input type="file" ref={hoverInputRef} className="hidden" onChange={e => e.target.files && handleUpload(e.target.files[0], 'hover')} />
        <button type="button" onClick={() => hoverInputRef.current?.click()} className="px-4 py-2 bg-neutral-100 rounded-xl text-sm">Añadir imagen de hover</button>
      </div>

      <button
        type="submit" disabled={loading || uploading}
        className="w-full py-4 bg-black text-white rounded-2xl font-medium flex items-center justify-center gap-3 hover:bg-zinc-800 transition-all disabled:opacity-50"
      >
        {loading || uploading ? <Loader2 className="animate-spin" size={20} /> : 'Crear Álbum'}
      </button>
    </form>
  );
};
