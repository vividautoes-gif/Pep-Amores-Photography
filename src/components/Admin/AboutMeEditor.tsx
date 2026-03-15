import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Loader2, User, Save } from 'lucide-react';

export const AboutMeEditor: React.FC = () => {
  const [content, setContent] = useState({
    bio: '',
    bio_en: '',
    bio_ca: '',
    imageUrl: '',
    title: '',
    subtitle: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchAbout = async () => {
      const docSnap = await getDoc(doc(db, 'settings', 'aboutme'));
      if (docSnap.exists()) {
        setContent(docSnap.data() as any);
      }
      setLoading(false);
    };
    fetchAbout();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'aboutme'), content);
      alert('Contenido "Sobre Mí" actualizado');
    } catch (error) {
      console.error(error);
      alert('Error al guardar');
    }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="bg-zinc-100 p-6 rounded-2xl border border-zinc-200 mb-8">
        <h3 className="text-zinc-900 font-medium mb-2 flex items-center gap-2">
          <User size={18} />
          Sobre esta sección: Editor "Sobre Mí"
        </h3>
        <p className="text-zinc-600 text-sm leading-relaxed">
          Aquí puedes editar la información que aparece en tu página de biografía. 
          Puedes actualizar tu texto de presentación en varios idiomas y la URL de tu foto de perfil.
        </p>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-neutral-100 space-y-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-widest text-gray-400">Título Principal</label>
            <input 
              value={content.title} 
              onChange={e => setContent({...content, title: e.target.value})}
              className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black outline-none"
              placeholder="Ej: Eduard Kun"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-widest text-gray-400">Subtítulo / Profesión</label>
            <input 
              value={content.subtitle} 
              onChange={e => setContent({...content, subtitle: e.target.value})}
              className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black outline-none"
              placeholder="Ej: Fotógrafo de Calle"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-mono uppercase tracking-widest text-gray-400">URL Imagen de Perfil</label>
          <input 
            value={content.imageUrl} 
            onChange={e => setContent({...content, imageUrl: e.target.value})}
            className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black outline-none"
            placeholder="https://..."
          />
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-widest text-gray-400">Biografía (ES)</label>
            <textarea 
              value={content.bio} 
              onChange={e => setContent({...content, bio: e.target.value})}
              className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black outline-none h-40 resize-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-widest text-gray-400">Biografía (EN)</label>
            <textarea 
              value={content.bio_en} 
              onChange={e => setContent({...content, bio_en: e.target.value})}
              className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black outline-none h-40 resize-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-widest text-gray-400">Biografía (CA)</label>
            <textarea 
              value={content.bio_ca} 
              onChange={e => setContent({...content, bio_ca: e.target.value})}
              className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black outline-none h-40 resize-none"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-4 bg-black text-white rounded-2xl font-medium flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          Guardar Cambios
        </button>
      </div>
    </div>
  );
};
