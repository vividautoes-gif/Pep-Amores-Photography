import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Journey } from '../../hooks/usePhotos';
import { translateMetadata, translateObject } from '../../services/geminiService';
import { Loader2, Edit2, Trash2, Save, X, MapPin } from 'lucide-react';

export const JourneyManager: React.FC = () => {
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Journey>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'journeys'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setJourneys(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Journey[]);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleEdit = (journey: Journey) => {
    setEditingId(journey.id);
    setEditData({
      ...journey,
      subthemes: journey.subthemes.join(', ')
    } as any);
  };

  const handleSave = async (id: string) => {
    try {
      setSaving(true);
      console.log("Saving journey with translation...", editData);
      const finalData = { ...editData };
      
      if (typeof (finalData as any).subthemes === 'string') {
        finalData.subthemes = (finalData as any).subthemes.split(',').map((t: string) => t.trim()).filter((t: string) => t);
      }

      const originalJourney = journeys.find(j => j.id === id);
      const titleChanged = originalJourney && originalJourney.title !== finalData.title;
      const introChanged = originalJourney && originalJourney.intro !== finalData.intro;
      const subthemesChanged = originalJourney && JSON.stringify(originalJourney.subthemes) !== JSON.stringify(finalData.subthemes);

      // Translate fields
      const fieldsToTranslate: any = {};
      if (finalData.title && titleChanged && (!finalData.title_en || !finalData.title_ca)) {
        fieldsToTranslate.title = finalData.title;
      }
      if (finalData.intro && introChanged && (!finalData.intro_en || !finalData.intro_ca)) {
        fieldsToTranslate.intro = finalData.intro;
      }
      if (finalData.subthemes && finalData.subthemes.length > 0 && subthemesChanged && (!finalData.subthemes_en || !finalData.subthemes_ca)) {
        fieldsToTranslate.subthemes = Array.isArray(finalData.subthemes) ? finalData.subthemes.join(', ') : finalData.subthemes;
      }
      if (!finalData.country_en || !finalData.country_ca) fieldsToTranslate.country = finalData.country || '';
      if (!finalData.city_en || !finalData.city_ca) fieldsToTranslate.city = finalData.city || '';

      if (Object.keys(fieldsToTranslate).length > 0) {
        const objTrans = await translateObject(fieldsToTranslate, ['es', 'en', 'ca']);
        
        if (objTrans.es) {
          if (objTrans.es.title && titleChanged) finalData.title = objTrans.es.title;
          if (objTrans.es.intro && introChanged) finalData.intro = objTrans.es.intro;
          if (objTrans.es.country) finalData.country = finalData.country || objTrans.es.country;
          if (objTrans.es.city) finalData.city = finalData.city || objTrans.es.city;
          if (objTrans.es.subthemes && subthemesChanged) finalData.subthemes = objTrans.es.subthemes.split(',').map((s: string) => s.trim());
        }
        if (objTrans.en) {
          if (objTrans.en.title && titleChanged && !finalData.title_en) finalData.title_en = objTrans.en.title;
          if (objTrans.en.intro && introChanged && !finalData.intro_en) finalData.intro_en = objTrans.en.intro;
          if (objTrans.en.country) finalData.country_en = finalData.country_en || objTrans.en.country;
          if (objTrans.en.city) finalData.city_en = finalData.city_en || objTrans.en.city;
          if (objTrans.en.subthemes && subthemesChanged && !finalData.subthemes_en) finalData.subthemes_en = objTrans.en.subthemes.split(',').map((s: string) => s.trim());
        }
        if (objTrans.ca) {
          if (objTrans.ca.title && titleChanged && !finalData.title_ca) finalData.title_ca = objTrans.ca.title;
          if (objTrans.ca.intro && introChanged && !finalData.intro_ca) finalData.intro_ca = objTrans.ca.intro;
          if (objTrans.ca.country) finalData.country_ca = finalData.country_ca || objTrans.ca.country;
          if (objTrans.ca.city) finalData.city_ca = finalData.city_ca || objTrans.ca.city;
          if (objTrans.ca.subthemes && subthemesChanged && !finalData.subthemes_ca) finalData.subthemes_ca = objTrans.ca.subthemes.split(',').map((s: string) => s.trim());
        }
      }

      console.log("Final data to save:", finalData);
      await updateDoc(doc(db, 'journeys', id), finalData);
      setEditingId(null);
      setSaving(false);
      alert('Viaje actualizado con éxito');
    } catch (error) {
      console.error(error);
      setSaving(false);
      alert('Error al actualizar el viaje');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este viaje? Las fotos asociadas no se borrarán, pero perderán su vinculación.')) return;
    try {
      await deleteDoc(doc(db, 'journeys', id));
      alert('Viaje eliminado');
    } catch (error) {
      console.error(error);
      alert('Error al eliminar el viaje');
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 mb-8">
        <h3 className="text-blue-900 font-medium mb-2 flex items-center gap-2">
          <MapPin size={18} />
          Sobre esta sección: Gestión de Viajes
        </h3>
        <p className="text-blue-800/80 text-sm leading-relaxed">
          Aquí puedes ver todos los viajes que has creado. Puedes editar sus títulos, descripciones y localizaciones. 
          Los viajes sirven para agrupar series de fotografías bajo una misma narrativa o expedición.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {journeys.map(journey => (
          <div key={journey.id} className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100">
            {editingId === journey.id ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <textarea 
                    value={editData.title || ''} 
                    onChange={e => setEditData({...editData, title: e.target.value})}
                    className="w-full p-3 border rounded-xl resize-none"
                    placeholder="Título (ES)"
                    rows={2}
                  />
                  <textarea 
                    value={editData.title_en || ''} 
                    onChange={e => setEditData({...editData, title_en: e.target.value})}
                    className="w-full p-3 border rounded-xl resize-none"
                    placeholder="Título (EN)"
                    rows={2}
                  />
                  <textarea 
                    value={editData.title_ca || ''} 
                    onChange={e => setEditData({...editData, title_ca: e.target.value})}
                    className="w-full p-3 border rounded-xl resize-none"
                    placeholder="Título (CA)"
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input 
                    value={editData.country || ''} 
                    onChange={e => setEditData({...editData, country: e.target.value})}
                    className="w-full p-3 border rounded-xl"
                    placeholder="País (ES)"
                  />
                  <input 
                    value={editData.country_en || ''} 
                    onChange={e => setEditData({...editData, country_en: e.target.value})}
                    className="w-full p-3 border rounded-xl"
                    placeholder="País (EN)"
                  />
                  <input 
                    value={editData.country_ca || ''} 
                    onChange={e => setEditData({...editData, country_ca: e.target.value})}
                    className="w-full p-3 border rounded-xl"
                    placeholder="País (CA)"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input 
                    value={editData.city || ''} 
                    onChange={e => setEditData({...editData, city: e.target.value})}
                    className="w-full p-3 border rounded-xl"
                    placeholder="Ciudad (ES)"
                  />
                  <input 
                    value={editData.city_en || ''} 
                    onChange={e => setEditData({...editData, city_en: e.target.value})}
                    className="w-full p-3 border rounded-xl"
                    placeholder="Ciudad (EN)"
                  />
                  <input 
                    value={editData.city_ca || ''} 
                    onChange={e => setEditData({...editData, city_ca: e.target.value})}
                    className="w-full p-3 border rounded-xl"
                    placeholder="Ciudad (CA)"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <textarea 
                    value={editData.intro || ''} 
                    onChange={e => setEditData({...editData, intro: e.target.value})}
                    className="w-full p-3 border rounded-xl h-32"
                    placeholder="Introducción (ES)"
                  />
                  <textarea 
                    value={editData.intro_en || ''} 
                    onChange={e => setEditData({...editData, intro_en: e.target.value})}
                    className="w-full p-3 border rounded-xl h-32"
                    placeholder="Introducción (EN)"
                  />
                  <textarea 
                    value={editData.intro_ca || ''} 
                    onChange={e => setEditData({...editData, intro_ca: e.target.value})}
                    className="w-full p-3 border rounded-xl h-32"
                    placeholder="Introducción (CA)"
                  />
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <input 
                    value={Array.isArray(editData.subthemes) ? editData.subthemes.join(', ') : (editData.subthemes || '')} 
                    onChange={e => setEditData({...editData, subthemes: e.target.value as any})}
                    className="w-full p-3 border rounded-xl"
                    placeholder="Subtemas (separados por comas)"
                  />
                </div>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${editData.isSpecial ? 'bg-brand-accent border-brand-accent text-white' : 'border-gray-300 group-hover:border-brand-accent'}`}>
                    <input 
                      type="checkbox" 
                      className="hidden" 
                      checked={editData.isSpecial || false} 
                      onChange={e => setEditData(prev => ({ ...prev, isSpecial: e.target.checked }))} 
                    />
                    {editData.isSpecial && <Save size={14} className="rotate-45" />}
                  </div>
                  <span className="text-sm font-medium">Sesión Especial (Sesiones Especiales)</span>
                </label>
                <div className="flex gap-2">
                  <button onClick={() => handleSave(journey.id)} disabled={saving} className="px-4 py-2 bg-black text-white rounded-xl flex items-center gap-2 disabled:opacity-50">
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
                    {saving ? 'Guardando...' : 'Guardar'}
                  </button>
                  <button onClick={() => setEditingId(null)} disabled={saving} className="px-4 py-2 bg-gray-100 rounded-xl flex items-center gap-2 disabled:opacity-50">
                    <X size={16} /> Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-xl font-medium">{journey.title}</h4>
                  <p className="text-gray-500 text-sm">{journey.country}</p>
                  <p className="text-gray-600 mt-2 line-clamp-2">{journey.intro}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(journey)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDelete(journey.id)} className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
