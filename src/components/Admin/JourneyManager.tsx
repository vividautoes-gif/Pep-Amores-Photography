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
    setEditData(journey);
  };

  const handleSave = async (id: string) => {
    try {
      setSaving(true);
      console.log("Saving journey with translation...", editData);
      const finalData = { ...editData };
      
      if (finalData.title) {
        const titleTrans = await translateMetadata(finalData.title, ['es', 'en', 'ca']);
        if (Object.keys(titleTrans).length > 0) {
          finalData.title = titleTrans.es || finalData.title;
          finalData.title_en = titleTrans.en || finalData.title;
          finalData.title_ca = titleTrans.ca || finalData.title;
        }
      }
      if (finalData.intro) {
        const introTrans = await translateMetadata(finalData.intro, ['es', 'en', 'ca']);
        if (Object.keys(introTrans).length > 0) {
          finalData.intro = introTrans.es || finalData.intro;
          finalData.intro_en = introTrans.en || finalData.intro;
          finalData.intro_ca = introTrans.ca || finalData.intro;
        }
      }
      
      const fieldsToTranslate = {
        country: finalData.country || '',
        city: finalData.city || ''
      };
      const objTrans = await translateObject(fieldsToTranslate, ['es', 'en', 'ca']);
      
      if (objTrans.es) {
        if (objTrans.es.country) finalData.country = objTrans.es.country;
        if (objTrans.es.city) finalData.city = objTrans.es.city;
      }
      if (objTrans.en) {
        if (objTrans.en.country) finalData.country_en = objTrans.en.country;
        if (objTrans.en.city) finalData.city_en = objTrans.en.city;
      }
      if (objTrans.ca) {
        if (objTrans.ca.country) finalData.country_ca = objTrans.ca.country;
        if (objTrans.ca.city) finalData.city_ca = objTrans.ca.city;
      }
      
      if (finalData.subthemes && finalData.subthemes.length > 0) {
        const subthemesText = Array.isArray(finalData.subthemes) ? finalData.subthemes.join(', ') : finalData.subthemes;
        const subthemesTrans = await translateMetadata(subthemesText, ['es', 'en', 'ca']);
        if (Object.keys(subthemesTrans).length > 0) {
          finalData.subthemes = (subthemesTrans.es || subthemesText).split(',').map((s: string) => s.trim());
          finalData.subthemes_en = (subthemesTrans.en || subthemesText).split(',').map((s: string) => s.trim());
          finalData.subthemes_ca = (subthemesTrans.ca || subthemesText).split(',').map((s: string) => s.trim());
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
                <input 
                  value={editData.title || ''} 
                  onChange={e => setEditData({...editData, title: e.target.value})}
                  className="w-full p-3 border rounded-xl"
                  placeholder="Título del viaje"
                />
                <input 
                  value={editData.country || ''} 
                  onChange={e => setEditData({...editData, country: e.target.value})}
                  className="w-full p-3 border rounded-xl"
                  placeholder="País"
                />
                <textarea 
                  value={editData.intro || ''} 
                  onChange={e => setEditData({...editData, intro: e.target.value})}
                  className="w-full p-3 border rounded-xl h-32"
                  placeholder="Introducción"
                />
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
