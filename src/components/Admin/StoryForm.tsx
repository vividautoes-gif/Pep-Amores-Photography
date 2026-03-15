import React, { useState } from 'react';
import { db, auth } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Clock, Send, Loader2 } from 'lucide-react';

export const StoryForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    coverUrl: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'stories'), {
        ...formData,
        createdAt: serverTimestamp()
      });
      setFormData({ title: '', description: '', coverUrl: '' });
      alert("Historia creada con éxito");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6 bg-white p-8 rounded-3xl shadow-sm">
      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="block text-xs font-mono uppercase tracking-widest text-gray-400 mb-2">Título de la Historia</label>
          <input 
            type="text" required value={formData.title}
            onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full bg-neutral-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-black outline-none transition-all"
            placeholder="Ej: Retratos de la Medina"
          />
        </div>
        <div>
          <label className="block text-xs font-mono uppercase tracking-widest text-gray-400 mb-2">URL de Portada (Opcional)</label>
          <input 
            type="text" value={formData.coverUrl}
            onChange={e => setFormData(prev => ({ ...prev, coverUrl: e.target.value }))}
            className="w-full bg-neutral-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-black outline-none transition-all"
            placeholder="https://..."
          />
        </div>
        <div>
          <label className="block text-xs font-mono uppercase tracking-widest text-gray-400 mb-2">Descripción / Ensayo</label>
          <textarea 
            required value={formData.description}
            onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full bg-neutral-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-black outline-none transition-all h-48 resize-none"
            placeholder="Escribe el ensayo narrativo de esta serie..."
          />
        </div>
      </div>
      <button
        type="submit" disabled={loading}
        className="w-full py-4 bg-black text-white rounded-2xl font-medium flex items-center justify-center gap-3 hover:bg-zinc-800 transition-all disabled:opacity-50"
      >
        {loading ? <Loader2 className="animate-spin" size={20} /> : <><Send size={18} /> Crear Historia</>}
      </button>
    </form>
  );
};
