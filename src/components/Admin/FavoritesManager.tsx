import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { Photo } from '../../hooks/usePhotos';
import { Loader2, Star, Save, ArrowUp, ArrowDown } from 'lucide-react';

export const FavoritesManager: React.FC = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'photos'), 
      where('isFavorite', '==', true),
      orderBy('favoriteScore', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPhotos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Photo[]);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const updateScore = async (id: string, newScore: number) => {
    try {
      await updateDoc(doc(db, 'photos', id), { favoriteScore: newScore });
    } catch (error) {
      console.error(error);
      alert('Error al actualizar la posición');
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 mb-8">
        <h3 className="text-amber-900 font-medium mb-2 flex items-center gap-2">
          <Star size={18} fill="currentColor" />
          Sobre esta sección: Gestión de Favoritas
        </h3>
        <p className="text-amber-800/80 text-sm leading-relaxed">
          Aquí aparecen las fotos que has marcado como "Favoritas". 
          El orden en la web se basa en el "Score" (Puntuación). 
          A mayor puntuación, más arriba aparecerá la foto. Puedes ajustar este valor para reordenarlas a tu gusto.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {photos.map(photo => (
          <div key={photo.id} className="bg-white p-4 rounded-2xl shadow-sm border border-neutral-100 space-y-4">
            <img src={photo.url} className="w-full aspect-square object-cover rounded-xl" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-gray-400 uppercase">Score:</span>
                <input 
                  type="number" 
                  value={photo.favoriteScore} 
                  onChange={e => updateScore(photo.id, parseInt(e.target.value) || 0)}
                  className="w-20 p-2 border rounded-lg text-center font-medium"
                />
              </div>
              <div className="flex gap-1">
                <button onClick={() => updateScore(photo.id, photo.favoriteScore + 1)} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowUp size={16} /></button>
                <button onClick={() => updateScore(photo.id, photo.favoriteScore - 1)} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowDown size={16} /></button>
              </div>
            </div>
            <p className="text-sm font-medium truncate">{photo.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
