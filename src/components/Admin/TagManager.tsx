import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, doc, updateDoc, writeBatch } from 'firebase/firestore';
import { Photo } from '../../hooks/usePhotos';
import { Loader2, Hash, Edit2, Save, X } from 'lucide-react';

export const TagManager: React.FC = () => {
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [newTagName, setNewTagName] = useState('');

  useEffect(() => {
    const fetchTags = async () => {
      const snapshot = await getDocs(collection(db, 'photos'));
      const allTags = new Set<string>();
      snapshot.docs.forEach(doc => {
        const data = doc.data() as Photo;
        if (data.tags) {
          data.tags.forEach(tag => allTags.add(tag.toLowerCase().trim()));
        }
      });
      setTags(Array.from(allTags).sort());
      setLoading(false);
    };
    fetchTags();
  }, []);

  const handleRename = async (oldTag: string) => {
    if (!newTagName || oldTag === newTagName) return;
    
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'photos'));
      const batch = writeBatch(db);
      let count = 0;

      snapshot.docs.forEach(photoDoc => {
        const data = photoDoc.data() as Photo;
        if (data.tags && data.tags.some(t => t.toLowerCase() === oldTag.toLowerCase())) {
          const updatedTags = data.tags.map(t => t.toLowerCase() === oldTag.toLowerCase() ? newTagName.toLowerCase().trim() : t);
          batch.update(photoDoc.ref, { tags: updatedTags });
          count++;
        }
      });

      await batch.commit();
      setTags(prev => prev.map(t => t === oldTag ? newTagName.toLowerCase().trim() : t).sort());
      setEditingTag(null);
      alert(`Tag renombrado en ${count} fotografías.`);
    } catch (error) {
      console.error(error);
      alert('Error al renombrar el tag');
    }
    setLoading(false);
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100 mb-8">
        <h3 className="text-purple-900 font-medium mb-2 flex items-center gap-2">
          <Hash size={18} />
          Sobre esta sección: Gestión de Hashtags
        </h3>
        <p className="text-purple-800/80 text-sm leading-relaxed">
          Aquí puedes ver todos los hashtags únicos utilizados en tus fotografías. 
          Si renombras un tag aquí, se actualizará automáticamente en todas las fotos que lo utilicen. 
          Esto es útil para corregir errores tipográficos o unificar categorías.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {tags.map(tag => (
          <div key={tag} className="bg-white px-4 py-2 rounded-xl border border-neutral-200 flex items-center gap-3 shadow-sm">
            {editingTag === tag ? (
              <div className="flex items-center gap-2">
                <input 
                  value={newTagName} 
                  onChange={e => setNewTagName(e.target.value)}
                  className="w-32 p-1 border rounded text-sm"
                  autoFocus
                />
                <button onClick={() => handleRename(tag)} className="text-green-600"><Save size={16} /></button>
                <button onClick={() => setEditingTag(null)} className="text-gray-400"><X size={16} /></button>
              </div>
            ) : (
              <>
                <span className="text-sm font-medium text-gray-700">#{tag}</span>
                <button 
                  onClick={() => { setEditingTag(tag); setNewTagName(tag); }}
                  className="text-gray-400 hover:text-black transition-colors"
                >
                  <Edit2 size={14} />
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
