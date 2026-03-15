import React, { useState } from 'react';
import { db, auth } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { MapPin, Send, Loader2 } from 'lucide-react';

export const JourneyForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    country: '',
    intro: '',
    subthemes: '',
    coverUrl: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'journeys'), {
        ...formData,
        subthemes: formData.subthemes.split(',').map(s => s.trim()).filter(s => s),
        createdAt: serverTimestamp()
      });
      setFormData({ title: '', country: '', intro: '', subthemes: '', coverUrl: '' });
      alert("Viaje creado con éxito");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6 bg-white p-8 rounded-3xl shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="col-span-2">
          <label className="block text-xs font-mono uppercase tracking-widest text-gray-400 mb-2">Título del Viaje</label>
          <input 
            type="text" required value={formData.title}
            onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full bg-neutral-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-black outline-none transition-all"
            placeholder="Ej: Japón: El Imperio del Sol Naciente"
          />
        </div>
        <div>
          <label className="block text-xs font-mono uppercase tracking-widest text-gray-400 mb-2">País</label>
          <input 
            type="text" required value={formData.country}
            onChange={e => setFormData(prev => ({ ...prev, country: e.target.value }))}
            className="w-full bg-neutral-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-black outline-none transition-all"
            placeholder="Japón"
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
        <div className="col-span-2">
          <label className="block text-xs font-mono uppercase tracking-widest text-gray-400 mb-2">Subtemas (separados por comas)</label>
          <input 
            type="text" value={formData.subthemes}
            onChange={e => setFormData(prev => ({ ...prev, subthemes: e.target.value }))}
            className="w-full bg-neutral-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-black outline-none transition-all"
            placeholder="Chinatown, Mercados, Street Portraits..."
          />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-mono uppercase tracking-widest text-gray-400 mb-2">Introducción</label>
          <textarea 
            required value={formData.intro}
            onChange={e => setFormData(prev => ({ ...prev, intro: e.target.value }))}
            className="w-full bg-neutral-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-black outline-none transition-all h-32 resize-none"
            placeholder="Breve texto introductorio del viaje..."
          />
        </div>
      </div>
      <button
        type="submit" disabled={loading}
        className="w-full py-4 bg-black text-white rounded-2xl font-medium flex items-center justify-center gap-3 hover:bg-zinc-800 transition-all disabled:opacity-50"
      >
        {loading ? <Loader2 className="animate-spin" size={20} /> : <><Send size={18} /> Crear Viaje</>}
      </button>
    </form>
  );
};
