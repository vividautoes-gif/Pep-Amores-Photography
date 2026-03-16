import React, { useState } from 'react';
import { db, auth } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { translateMetadata, translateObject } from '../../services/geminiService';
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
      console.log("Creating journey with translation...", formData.title);
      let title_es = formData.title;
      let title_en = formData.title;
      let title_ca = formData.title;
      let intro_es = formData.intro;
      let intro_en = formData.intro;
      let intro_ca = formData.intro;
      let country_es = formData.country;
      let country_en = formData.country;
      let country_ca = formData.country;
      let subthemes_es: string[] = [];
      let subthemes_en: string[] = [];
      let subthemes_ca: string[] = [];

      if (formData.title) {
        const titleTrans = await translateMetadata(formData.title, ['es', 'en', 'ca']);
        if (Object.keys(titleTrans).length > 0) {
          title_es = titleTrans.es || formData.title;
          title_en = titleTrans.en || formData.title;
          title_ca = titleTrans.ca || formData.title;
        }
      }
      if (formData.intro) {
        const introTrans = await translateMetadata(formData.intro, ['es', 'en', 'ca']);
        if (Object.keys(introTrans).length > 0) {
          intro_es = introTrans.es || formData.intro;
          intro_en = introTrans.en || formData.intro;
          intro_ca = introTrans.ca || formData.intro;
        }
      }
      if (formData.country) {
        const objTrans = await translateObject({ country: formData.country }, ['es', 'en', 'ca']);
        if (objTrans.es?.country) country_es = objTrans.es.country;
        if (objTrans.en?.country) country_en = objTrans.en.country;
        if (objTrans.ca?.country) country_ca = objTrans.ca.country;
      }
      
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
        title_en,
        title_ca,
        intro: intro_es,
        intro_en,
        intro_ca,
        country: country_es,
        country_en,
        country_ca,
        subthemes: subthemes_es,
        subthemes_en,
        subthemes_ca,
        createdAt: serverTimestamp()
      };
      console.log("Final journey data to add:", finalData);
      await addDoc(collection(db, 'journeys'), finalData);
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
        {loading && ' Creando y traduciendo...'}
      </button>
    </form>
  );
};
