import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Loader2, Layers, Trash2, Edit2, Save, X, Image as ImageIcon } from 'lucide-react';

interface Album {
  id: string;
  title: string;
  coverUrl: string;
  hoverImages: string[];
  createdAt: any;
}

export const AlbumManager: React.FC = () => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Album>>({});

  useEffect(() => {
    const q = query(collection(db, 'albums'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAlbums(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Album[]);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleEdit = (album: Album) => {
    setEditingId(album.id);
    setEditData(album);
  };

  const handleSave = async (id: string) => {
    try {
      await updateDoc(doc(db, 'albums', id), editData);
      setEditingId(null);
      alert('Álbum actualizado');
    } catch (error) {
      console.error(error);
      alert('Error al actualizar');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este álbum?')) return;
    try {
      await deleteDoc(doc(db, 'albums', id));
      alert('Álbum eliminado');
    } catch (error) {
      console.error(error);
      alert('Error al eliminar');
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 mb-8">
        <h3 className="text-emerald-900 font-medium mb-2 flex items-center gap-2">
          <Layers size={18} />
          Sobre esta sección: Gestión de Colecciones (Álbumes)
        </h3>
        <p className="text-emerald-800/80 text-sm leading-relaxed">
          Aquí puedes gestionar tus colecciones de álbumes. Puedes editar el título, la imagen de portada y las imágenes que aparecen al pasar el ratón. 
          Estas colecciones son las que se muestran en la galería principal de la web.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {albums.map(album => (
          <div key={album.id} className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100">
            {editingId === album.id ? (
              <div className="space-y-4">
                <input 
                  value={editData.title || ''} 
                  onChange={e => setEditData({...editData, title: e.target.value})}
                  className="w-full p-3 border rounded-xl"
                  placeholder="Título del álbum"
                />
                <input 
                  value={editData.coverUrl || ''} 
                  onChange={e => setEditData({...editData, coverUrl: e.target.value})}
                  className="w-full p-3 border rounded-xl"
                  placeholder="URL Portada"
                />
                <div className="flex gap-2">
                  <button onClick={() => handleSave(album.id)} className="px-4 py-2 bg-black text-white rounded-xl flex items-center gap-2">
                    <Save size={16} /> Guardar
                  </button>
                  <button onClick={() => setEditingId(null)} className="px-4 py-2 bg-gray-100 rounded-xl flex items-center gap-2">
                    <X size={16} /> Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                    <img src={album.coverUrl} className="w-20 h-20 object-cover rounded-xl" />
                    <div>
                      <h4 className="text-lg font-medium">{album.title}</h4>
                      <p className="text-xs text-gray-400">{album.hoverImages?.length || 0} imágenes de hover</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(album)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDelete(album.id)} className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {album.hoverImages?.map((img, idx) => (
                    <img key={idx} src={img} className="w-12 h-12 object-cover rounded-md flex-shrink-0" />
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
