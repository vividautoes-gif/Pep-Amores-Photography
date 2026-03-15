import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { Photo } from '../../hooks/usePhotos';
import { Loader2, Award, Save, X } from 'lucide-react';

export const LFIManager: React.FC = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'photos'), 
      where('isLFI', '==', true),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPhotos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Photo[]);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const updateLFIType = async (id: string, type: string) => {
    try {
      await updateDoc(doc(db, 'photos', id), { lfiType: type });
    } catch (error) {
      console.error(error);
      alert('Error al actualizar');
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="bg-red-50 p-6 rounded-2xl border border-red-100 mb-8">
        <h3 className="text-red-900 font-medium mb-2 flex items-center gap-2">
          <Award size={18} />
          Sobre esta sección: Gestión de Reconocimientos LFI
        </h3>
        <p className="text-red-800/80 text-sm leading-relaxed">
          Aquí puedes gestionar las fotografías que han recibido algún reconocimiento en Leica Fotografie International (LFI). 
          Puedes cambiar la categoría del reconocimiento (Mastershot, Exhibition, Picture of the Week) para cada foto.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {photos.map(photo => (
          <div key={photo.id} className="bg-white p-4 rounded-2xl shadow-sm border border-neutral-100 space-y-4">
            <img src={photo.url} className="w-full aspect-video object-cover rounded-xl" />
            <div className="space-y-2">
              <label className="text-[10px] font-mono uppercase text-gray-400">Categoría LFI:</label>
              <select 
                value={photo.lfiType}
                onChange={e => updateLFIType(photo.id, e.target.value)}
                className="w-full p-2 border rounded-lg text-sm bg-gray-50"
              >
                <option value="lfimastershot">#LFImastershot</option>
                <option value="lfiexhibition">#LFIexhibition</option>
                <option value="lfi-picture-of-the-week">#LFIpictureoftheweek</option>
                <option value="none">Ninguno (Quitar)</option>
              </select>
            </div>
            <p className="text-sm font-medium truncate">{photo.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
