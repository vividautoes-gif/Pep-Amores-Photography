import React, { useState } from 'react';
import { db, storage } from '../../firebase';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { usePhotos, Photo } from '../../hooks/usePhotos';
import { Loader2, Trash2, Save, Edit2, X } from 'lucide-react';

export const PhotoManager: React.FC = () => {
  const { photos, loading } = usePhotos();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Photo>>({});

  const handleEdit = (photo: Photo) => {
    setEditingId(photo.id);
    setEditData(photo);
  };

  const handleSave = async (id: string) => {
    try {
      await updateDoc(doc(db, 'photos', id), editData);
      setEditingId(null);
      alert('Foto actualizada');
    } catch (error) {
      console.error(error);
      alert('Error al actualizar');
    }
  };

  const handleDelete = async (photo: Photo) => {
    if (!confirm('¿Seguro que quieres eliminar esta foto?')) return;
    try {
      await deleteDoc(doc(db, 'photos', photo.id));
      // Intentar borrar de storage si es posible (basado en la URL)
      try {
        const storageRef = ref(storage, photo.url);
        await deleteObject(storageRef);
      } catch (e) {
        console.warn('No se pudo borrar el archivo de storage:', e);
      }
      alert('Foto eliminada');
    } catch (error) {
      console.error(error);
      alert('Error al eliminar');
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-serif italic">Gestionar Fotografías</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {photos.map(photo => (
          <div key={photo.id} className="bg-white p-4 rounded-2xl shadow-sm border border-neutral-100 flex gap-4">
            <img src={photo.url} className="w-24 h-24 object-cover rounded-xl" />
            <div className="flex-1 space-y-2">
              {editingId === photo.id ? (
                <>
                  <input value={editData.title || ''} onChange={e => setEditData({...editData, title: e.target.value})} className="w-full p-2 border rounded" placeholder="Título" />
                  <input value={editData.tags?.join(', ') || ''} onChange={e => setEditData({...editData, tags: e.target.value.split(',').map(t => t.trim())})} className="w-full p-2 border rounded" placeholder="Tags (separados por comas)" />
                  <div className="flex gap-2">
                    <button onClick={() => handleSave(photo.id)} className="p-2 bg-black text-white rounded-lg"><Save size={16} /></button>
                    <button onClick={() => setEditingId(null)} className="p-2 bg-gray-200 rounded-lg"><X size={16} /></button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="font-medium">{photo.title || 'Sin título'}</h3>
                  <p className="text-xs text-gray-500">{photo.tags?.join(', ')}</p>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(photo)} className="p-2 bg-neutral-100 rounded-lg"><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(photo)} className="p-2 bg-red-50 text-red-600 rounded-lg"><Trash2 size={16} /></button>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
