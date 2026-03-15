import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, orderBy, limit, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { Photo } from '../../hooks/usePhotos';
import { Loader2, Clock, Edit2, Save, X } from 'lucide-react';

export const RecentPhotosManager: React.FC = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  useEffect(() => {
    const q = query(
      collection(db, 'photos'), 
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPhotos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Photo[]);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSave = async (id: string) => {
    try {
      await updateDoc(doc(db, 'photos', id), { title: editTitle });
      setEditingId(null);
    } catch (error) {
      console.error(error);
      alert('Error al actualizar');
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 mb-8">
        <h3 className="text-emerald-900 font-medium mb-2 flex items-center gap-2">
          <Clock size={18} />
          Sobre esta sección: Últimas 50 Fotografías
        </h3>
        <p className="text-emerald-800/80 text-sm leading-relaxed">
          Aquí puedes ver y editar rápidamente los títulos de las últimas 50 fotografías que has subido. 
          Es una forma rápida de revisar tus publicaciones más recientes sin tener que navegar por toda la galería.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {photos.map(photo => (
          <div key={photo.id} className="bg-white p-4 rounded-2xl shadow-sm border border-neutral-100 flex gap-4 items-center">
            <img src={photo.url} className="w-16 h-16 object-cover rounded-xl" />
            <div className="flex-1">
              {editingId === photo.id ? (
                <div className="flex gap-2">
                  <input 
                    value={editTitle} 
                    onChange={e => setEditTitle(e.target.value)}
                    className="flex-1 p-2 border rounded-lg text-sm"
                  />
                  <button onClick={() => handleSave(photo.id)} className="text-green-600"><Save size={18} /></button>
                  <button onClick={() => setEditingId(null)} className="text-gray-400"><X size={18} /></button>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium truncate max-w-[200px]">{photo.title || 'Sin título'}</span>
                  <button onClick={() => { setEditingId(photo.id); setEditTitle(photo.title || ''); }} className="text-gray-400 hover:text-black">
                    <Edit2 size={16} />
                  </button>
                </div>
              )}
              <p className="text-[10px] text-gray-400 uppercase font-mono mt-1">
                {photo.createdAt?.toDate().toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
