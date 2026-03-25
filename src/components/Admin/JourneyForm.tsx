import React, { useState } from 'react';
import { db, auth, handleFirestoreError, OperationType } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { translateMetadata, translateObject } from '../../services/geminiService';
import { MapPin, Send, Loader2 } from 'lucide-react';

export const JourneyForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    country: '',
    country_en: '',
    country_ca: '',
    city: '',
    city_en: '',
    city_ca: '',
    intro: '',
    intro_en: '',
    intro_ca: '',
    subthemes: '',
    coverUrl: '',
    isSpecial: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    setLoading(true);
    const path = 'journeys';
    try {
      console.log("Creating journey with translation...", formData.title);
      let title_es = formData.title;
      let intro_es = formData.intro;
      let intro_en = formData.intro_en || formData.intro;
      let intro_ca = formData.intro_ca || formData.intro;
      let country_es = formData.country;
      let country_en = formData.country_en || formData.country;
      let country_ca = formData.country_ca || formData.country;
      let city_es = formData.city;
      let city_en = formData.city_en || formData.city;
      let city_ca = formData.city_ca || formData.city;
      let subthemes_es: string[] = [];
      let subthemes_en: string[] = [];
      let subthemes_ca: string[] = [];

      const subthemesList = formData.subthemes.split(',').map(s => s.trim()).filter(s => s);
      if (subthemesList.length > 0) {
        const subthemesText = subthemesList.join(', ');
        const subthemesTrans = await translateMetadata(subthemesText, ['es', 'en', 'ca']);
        if (Object.keys(subthemesTrans).length > 0) {
          subthemes_es = (subthemesTrans.es || subthemesText).split(',').map((s: string) => s.trim());
          subthemes_en = (subthemesTrans.en || subthemesText).split(',').map((s: string) => s.trim());
          subthemes_ca = (subthemesTrans.ca || subthemesText).split(',').map((s: string) => s.trim());
        } else {
          subthemes_es = subthemesList;
          subthemes_en = subthemesList;
          subthemes_ca = subthemesList;
        }
      }

      const finalData = {
        ...formData,
        title: title_es,
        intro: intro_es,
        intro_en,
        intro_ca,
        country: country_es,
        country_en,
        country_ca,
        city: city_es,
        city_en,
        city_ca,
        subthemes: subthemes_es,
        subthemes_en,
        subthemes_ca,
        isSpecial: formData.isSpecial,
        createdAt: serverTimestamp()
      };
      console.log("Final journey data to add:", finalData);
      await addDoc(collection(db, path), finalData);
      setFormData({ title: '', country: '', country_en: '', country_ca: '', city: '', city_en: '', city_ca: '', intro: '', intro_en: '', intro_ca: '', subthemes: '', coverUrl: '', isSpecial: false });
      alert("Viaje creado con éxito");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
      alert("Error al crear el viaje: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6 bg-white p-8 rounded-3xl shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="col-span-2 flex justify-between items-center mb-[-1rem]">
          <h3 className="text-sm font-mono uppercase tracking-widest text-black border-b border-gray-200 pb-2 w-full">Títulos</h3>
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-mono uppercase tracking-widest text-gray-400 mb-2">Título</label>
          <input 
            type="text" required value={formData.title}
            onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full bg-neutral-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-black outline-none transition-all"
            placeholder="Ej: Japón: El Imperio del Sol Naciente"
          />
        </div>
        
        <div className="col-span-2 mt-4">
          <h3 className="text-sm font-mono uppercase tracking-widest text-black border-b border-gray-200 pb-2">Localización y Metadatos</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-gray-400 mb-2">País (ES)</label>
            <input 
              type="text" required value={formData.country}
              onChange={e => setFormData(prev => ({ ...prev, country: e.target.value }))}
              className="w-full bg-neutral-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-black outline-none transition-all"
              placeholder="Japón"
            />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-gray-400 mb-2">País (EN)</label>
            <input 
              type="text" value={formData.country_en || ''}
              onChange={e => setFormData(prev => ({ ...prev, country_en: e.target.value }))}
              className="w-full bg-neutral-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-black outline-none transition-all"
              placeholder="Japan"
            />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-gray-400 mb-2">País (CA)</label>
            <input 
              type="text" value={formData.country_ca || ''}
              onChange={e => setFormData(prev => ({ ...prev, country_ca: e.target.value }))}
              className="w-full bg-neutral-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-black outline-none transition-all"
              placeholder="Japó"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-gray-400 mb-2">Ciudad (ES)</label>
            <input 
              type="text" value={formData.city}
              onChange={e => setFormData(prev => ({ ...prev, city: e.target.value }))}
              className="w-full bg-neutral-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-black outline-none transition-all"
              placeholder="Tokio"
            />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-gray-400 mb-2">Ciudad (EN)</label>
            <input 
              type="text" value={formData.city_en || ''}
              onChange={e => setFormData(prev => ({ ...prev, city_en: e.target.value }))}
              className="w-full bg-neutral-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-black outline-none transition-all"
              placeholder="Tokyo"
            />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-gray-400 mb-2">Ciudad (CA)</label>
            <input 
              type="text" value={formData.city_ca || ''}
              onChange={e => setFormData(prev => ({ ...prev, city_ca: e.target.value }))}
              className="w-full bg-neutral-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-black outline-none transition-all"
              placeholder="Tòquio"
            />
          </div>
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
        <div className="col-span-2 flex justify-between items-center mb-[-1rem] mt-4">
          <h3 className="text-sm font-mono uppercase tracking-widest text-black border-b border-gray-200 pb-2 w-full">Introducción</h3>
          <button 
            type="button"
            onClick={async () => {
              if (!formData.intro) return;
              setLoading(true);
              try {
                const translations = await translateMetadata(formData.intro, ['en', 'ca']);
                setFormData(prev => ({
                  ...prev,
                  intro_en: translations.en || prev.intro_en,
                  intro_ca: translations.ca || prev.intro_ca
                }));
              } catch (e) {
                console.error(e);
              }
              setLoading(false);
            }}
            className="ml-4 text-[10px] bg-black text-white px-3 py-1 rounded-full whitespace-nowrap hover:bg-zinc-800 transition-colors"
            disabled={loading || !formData.intro}
          >
            {loading ? 'Traduciendo...' : 'Auto-Traducir'}
          </button>
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-mono uppercase tracking-widest text-gray-400 mb-2">Introducción (ES)</label>
          <textarea 
            required value={formData.intro}
            onChange={e => setFormData(prev => ({ ...prev, intro: e.target.value }))}
            className="w-full bg-neutral-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-black outline-none transition-all h-32 resize-none"
            placeholder="Breve texto introductorio del viaje..."
          />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-mono uppercase tracking-widest text-gray-400 mb-2">Introducción (EN)</label>
          <textarea 
            value={formData.intro_en}
            onChange={e => setFormData(prev => ({ ...prev, intro_en: e.target.value }))}
            className="w-full bg-neutral-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-black outline-none transition-all h-32 resize-none"
            placeholder="Brief introductory text..."
          />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-mono uppercase tracking-widest text-gray-400 mb-2">Introducción (CA)</label>
          <textarea 
            value={formData.intro_ca}
            onChange={e => setFormData(prev => ({ ...prev, intro_ca: e.target.value }))}
            className="w-full bg-neutral-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-black outline-none transition-all h-32 resize-none"
            placeholder="Breu text introductori..."
          />
        </div>
        <div className="col-span-2">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${formData.isSpecial ? 'bg-brand-accent border-brand-accent text-white' : 'border-gray-300 group-hover:border-brand-accent'}`}>
              <input 
                type="checkbox" 
                className="hidden" 
                checked={formData.isSpecial} 
                onChange={e => setFormData(prev => ({ ...prev, isSpecial: e.target.checked }))} 
              />
              {formData.isSpecial && <Send size={14} className="rotate-45" />}
            </div>
            <span className="text-sm font-medium">Marcar como Sesión Especial (Sesiones Especiales)</span>
          </label>
        </div>
      </div>
      <button
        type="submit" disabled={loading}
        className="w-full py-4 bg-black text-white rounded-2xl font-medium flex items-center justify-center gap-3 hover:bg-zinc-800 transition-all disabled:opacity-50"
      >
        {loading ? <Loader2 className="animate-spin" size={20} /> : <><Send size={18} /> Crear Viaje</>}
        {loading && ' Creando y traduciendo...'}
      </button>
    </form>
  );
};
