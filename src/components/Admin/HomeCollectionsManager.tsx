import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, onSnapshot, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { motion } from 'motion/react';
import { Image as ImageIcon, Save, Check, Search, X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Photo {
  id: string;
  url: string;
  title: string;
  country: string;
}

interface HomeCollection {
  id: string;
  imageUrls: string[];
}

const COLLECTIONS = [
  { id: 'journeys', label: 'Viajes' },
  { id: 'collections', label: 'COLECCIONES' },
  { id: 'special-sessions', label: 'SESIONES ESPECIALES' },
  { id: 'explore', label: 'ARCHIVO COMPLETO' },
  { id: 'favorites', label: 'Favoritas' },
  { id: 'latest', label: 'Últimas' },
  { id: 'recent', label: 'RECIENTES' },
  { id: 'lfi', label: 'LFI' },
];

interface Journey {
  id: string;
  title: string;
  coverUrl?: string;
  hoverImages?: string[];
}

export const HomeCollectionsManager: React.FC = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [homeCollections, setHomeCollections] = useState<Record<string, string[]>>({});
  const [selectedType, setSelectedType] = useState<'home' | 'journeys'>('home');
  const [selectedId, setSelectedId] = useState<string>(COLLECTIONS[0].id);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const unsubPhotos = onSnapshot(collection(db, 'photos'), (snap) => {
      setPhotos(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Photo)));
    });

    const unsubJourneys = onSnapshot(collection(db, 'journeys'), (snap) => {
      setJourneys(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Journey)));
    });

    const unsubHome = onSnapshot(collection(db, 'home_collections'), (snap) => {
      const data: Record<string, string[]> = {};
      snap.docs.forEach(doc => {
        data[doc.id] = doc.data().imageUrls || [];
      });
      setHomeCollections(data);
    });

    return () => {
      unsubPhotos();
      unsubJourneys();
      unsubHome();
    };
  }, []);

  const getCurrentSelection = () => {
    if (selectedType === 'home') {
      return homeCollections[selectedId] || [];
    } else {
      const journey = journeys.find(j => j.id === selectedId);
      if (!journey) return [];
      const selection = [];
      if (journey.coverUrl) selection.push(journey.coverUrl);
      if (journey.hoverImages) selection.push(...journey.hoverImages);
      return selection.slice(0, 4);
    }
  };

  const currentSelection = getCurrentSelection();

  const handleTogglePhoto = (url: string) => {
    const newSelection = [...currentSelection];
    const index = newSelection.indexOf(url);
    
    if (index > -1) {
      newSelection.splice(index, 1);
    } else {
      if (newSelection.length < 4) {
        newSelection.push(url);
      } else {
        return;
      }
    }

    if (selectedType === 'home') {
      setHomeCollections(prev => ({
        ...prev,
        [selectedId]: newSelection
      }));
    } else {
      setJourneys(prev => prev.map(j => {
        if (j.id === selectedId) {
          return {
            ...j,
            coverUrl: newSelection[0] || '',
            hoverImages: newSelection.slice(1)
          };
        }
        return j;
      }));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (selectedType === 'home') {
        await setDoc(doc(db, 'home_collections', selectedId), {
          collectionId: selectedId,
          imageUrls: currentSelection,
          updatedAt: serverTimestamp()
        });
      } else {
        const journey = journeys.find(j => j.id === selectedId);
        if (journey) {
          await setDoc(doc(db, 'journeys', selectedId), {
            coverUrl: currentSelection[0] || '',
            hoverImages: currentSelection.slice(1)
          }, { merge: true });
        }
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error) {
      console.error("Error saving selection:", error);
      alert("Error al guardar la selección.");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredPhotos = photos.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-3xl shadow-sm">
        <h2 className="text-2xl font-serif italic mb-2">Portadas de Colecciones (Home)</h2>
        <p className="text-sm text-zinc-500 mb-8">Selecciona exactamente 4 imágenes para cada colección. La primera será la portada principal y las otras 3 aparecerán detrás al pasar el ratón.</p>

        <div className="flex gap-4 mb-8 border-b border-neutral-100 pb-4">
          <button 
            onClick={() => { setSelectedType('home'); setSelectedId(COLLECTIONS[0].id); }}
            className={cn(
              "text-sm font-bold uppercase tracking-widest pb-2 transition-all border-b-2",
              selectedType === 'home' ? "border-black text-black" : "border-transparent text-zinc-400 hover:text-zinc-600"
            )}
          >
            Colecciones Home
          </button>
          <button 
            onClick={() => { setSelectedType('journeys'); setSelectedId(journeys[0]?.id || ''); }}
            className={cn(
              "text-sm font-bold uppercase tracking-widest pb-2 transition-all border-b-2",
              selectedType === 'journeys' ? "border-black text-black" : "border-transparent text-zinc-400 hover:text-zinc-600"
            )}
          >
            Álbumes (Viajes)
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {selectedType === 'home' ? (
            COLLECTIONS.map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                className={cn(
                  "px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
                  selectedId === c.id 
                    ? "bg-black text-white shadow-lg" 
                    : "bg-neutral-100 text-zinc-500 hover:bg-neutral-200"
                )}
              >
                {c.label} ({homeCollections[c.id]?.length || 0}/4)
              </button>
            ))
          ) : (
            journeys.map(j => (
              <button
                key={j.id}
                onClick={() => setSelectedId(j.id)}
                className={cn(
                  "px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
                  selectedId === j.id 
                    ? "bg-black text-white shadow-lg" 
                    : "bg-neutral-100 text-zinc-500 hover:bg-neutral-200"
                )}
              >
                {j.title} ({ (j.coverUrl ? 1 : 0) + (j.hoverImages?.length || 0) }/4)
              </button>
            ))
          )}
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
            <input
              type="text"
              placeholder="Buscar fotos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-neutral-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
            />
          </div>
          
          <button
            onClick={handleSave}
            disabled={isSaving || currentSelection.length !== 4}
            className={cn(
              "ml-4 px-8 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all",
              currentSelection.length === 4
                ? "bg-black text-white hover:bg-zinc-800 shadow-lg"
                : "bg-neutral-200 text-zinc-400 cursor-not-allowed"
            )}
          >
            {isSaving ? (
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            ) : saveSuccess ? (
              <Check size={16} />
            ) : (
              <Save size={16} />
            )}
            {saveSuccess ? "Guardado" : "Guardar Selección"}
          </button>
        </div>

        {/* Current Selection Preview */}
        <div className="mb-8">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-4">Selección Actual ({currentSelection.length}/4)</h3>
          <div className="grid grid-cols-4 gap-4">
            {[0, 1, 2, 3].map(idx => (
              <div key={idx} className="aspect-[3/4] bg-neutral-100 rounded-2xl overflow-hidden relative group border-2 border-dashed border-neutral-200">
                {currentSelection[idx] ? (
                  <>
                    <img src={currentSelection[idx]} className="w-full h-full object-cover" alt={`Selected ${idx}`} />
                    <button 
                      onClick={() => handleTogglePhoto(currentSelection[idx])}
                      className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 text-white text-[8px] font-bold rounded">
                      {idx === 0 ? "PORTADA" : `FONDO ${idx}`}
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-300">
                    <ImageIcon size={24} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          {filteredPhotos.map(photo => {
            const isSelected = currentSelection.includes(photo.url);
            return (
              <button
                key={photo.id}
                onClick={() => handleTogglePhoto(photo.url)}
                className={cn(
                  "aspect-[3/4] rounded-xl overflow-hidden relative group transition-all",
                  isSelected ? "ring-4 ring-black scale-95" : "hover:scale-105"
                )}
              >
                <img src={photo.url} className="w-full h-full object-cover" alt={photo.title} />
                <div className={cn(
                  "absolute inset-0 flex items-center justify-center transition-all",
                  isSelected ? "bg-black/20" : "bg-black/0 group-hover:bg-black/10"
                )}>
                  {isSelected && (
                    <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center shadow-lg">
                      <Check size={16} />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
