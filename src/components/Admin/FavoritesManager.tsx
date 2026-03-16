import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, writeBatch } from 'firebase/firestore';
import { Photo } from '../../hooks/usePhotos';
import { Loader2, Star, Save, ArrowUp, ArrowDown, GripVertical } from 'lucide-react';

export const FavoritesManager: React.FC = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

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

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
    // Small delay to allow the drag image to be generated before adding opacity
    setTimeout(() => {
      const el = document.getElementById(`fav-${id}`);
      if (el) el.style.opacity = '0.5';
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent, id: string) => {
    setDraggedId(null);
    const el = document.getElementById(`fav-${id}`);
    if (el) el.style.opacity = '1';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    const newPhotos = [...photos];
    const draggedIndex = newPhotos.findIndex(p => p.id === draggedId);
    const targetIndex = newPhotos.findIndex(p => p.id === targetId);

    const [draggedPhoto] = newPhotos.splice(draggedIndex, 1);
    newPhotos.splice(targetIndex, 0, draggedPhoto);

    setPhotos(newPhotos); // Optimistic update

    // Save new order to Firestore
    setIsSavingOrder(true);
    try {
      // Assign scores from 1000 down to 1000 - length
      const baseScore = 1000;
      
      // Chunk into batches of 400
      const chunkSize = 400;
      for (let i = 0; i < newPhotos.length; i += chunkSize) {
        const chunk = newPhotos.slice(i, i + chunkSize);
        const batch = writeBatch(db);
        
        chunk.forEach((photo, index) => {
          const newScore = baseScore - (i + index);
          if (photo.favoriteScore !== newScore) {
            batch.update(doc(db, 'photos', photo.id), { favoriteScore: newScore });
          }
        });
        
        await batch.commit();
      }
    } catch (error) {
      console.error('Error saving new order:', error);
      alert('Error al guardar el nuevo orden');
    } finally {
      setIsSavingOrder(false);
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
          A mayor puntuación, más arriba aparecerá la foto. <strong>Puedes arrastrar y soltar las fotos</strong> para reordenarlas fácilmente, o ajustar el valor manualmente.
        </p>
      </div>

      {isSavingOrder && (
        <div className="flex items-center gap-2 text-sm text-brand-primary mb-4">
          <Loader2 size={16} className="animate-spin" /> Guardando nuevo orden...
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {photos.map(photo => (
          <div 
            id={`fav-${photo.id}`}
            key={photo.id} 
            draggable
            onDragStart={(e) => handleDragStart(e, photo.id)}
            onDragEnd={(e) => handleDragEnd(e, photo.id)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, photo.id)}
            className="bg-white p-4 rounded-2xl shadow-sm border border-neutral-100 space-y-4 cursor-move hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <GripVertical className="text-gray-400" size={20} />
              <span className="text-xs font-mono text-gray-400 uppercase">Score: {photo.favoriteScore}</span>
            </div>
            <img src={photo.url} className="w-full aspect-square object-cover rounded-xl pointer-events-none" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  value={photo.favoriteScore} 
                  onChange={e => updateScore(photo.id, parseInt(e.target.value) || 0)}
                  className="w-20 p-2 border rounded-lg text-center font-medium"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <div className="flex gap-1">
                <button onClick={(e) => { e.stopPropagation(); updateScore(photo.id, photo.favoriteScore + 1); }} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowUp size={16} /></button>
                <button onClick={(e) => { e.stopPropagation(); updateScore(photo.id, photo.favoriteScore - 1); }} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowDown size={16} /></button>
              </div>
            </div>
            <p className="text-sm font-medium truncate">{photo.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
