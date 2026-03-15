import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Journey } from '../../hooks/usePhotos';
import { Loader2, Edit2, Trash2, Save, X, MapPin } from 'lucide-react';

export const JourneyManager: React.FC = () => {
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Journey>>({});

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
      await updateDoc(doc(db, 'journeys', id), editData);
      setEditingId(null);
      alert('Viaje actualizado con éxito');
    } catch (error) {
      console.error(error);
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
                  <button onClick={() => handleSave(journey.id)} className="px-4 py-2 bg-black text-white rounded-xl flex items-center gap-2">
                    <Save size={16} /> Guardar
                  </button>
                  <button onClick={() => setEditingId(null)} className="px-4 py-2 bg-gray-100 rounded-xl flex items-center gap-2">
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
