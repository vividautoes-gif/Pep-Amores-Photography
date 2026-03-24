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
  { id: 'journeys', label: 'Viajes / Journeys' },
  { id: 'special-sessions', label: 'Sesiones Especiales / Special Sessions' },
  { id: 'explore', label: 'Explorar / Explore' },
  { id: 'favorites', label: 'Favoritas / Favorites' },
  { id: 'latest', label: 'Últimas 50 / Latest 50' },
  { id: 'lfi', label: 'LFI' },
];

export const HomeCollectionsManager: React.FC = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [homeCollections, setHomeCollections] = useState<Record<string, string[]>>({});
  const [selectedCollection, setSelectedCollection] = useState<string>(COLLECTIONS[0].id);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const unsubPhotos = onSnapshot(collection(db, 'photos'), (snap) => {
      setPhotos(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Photo)));
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
      unsubHome();
    };
  }, []);

  const currentSelection = homeCollections[selectedCollection] || [];

  const handleTogglePhoto = (url: string) => {
    const newSelection = [...currentSelection];
    const index = newSelection.indexOf(url);
    
    if (index > -1) {
      newSelection.splice(index, 1);
    } else {
      if (newSelection.length < 4) {
        newSelection.push(url);
      } else {
        // Replace the last one if we already have 4? Or just do nothing.
        // Let's do nothing to be safe, user must deselect first.
        return;
      }
    }

    setHomeCollections(prev => ({
      ...prev,
      [selectedCollection]: newSelection
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'home_collections', selectedCollection), {
        collectionId: selectedCollection,
        imageUrls: currentSelection,
        updatedAt: serverTimestamp()
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error) {
      console.error("Error saving home collection:", error);
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

        <div className="flex flex-wrap gap-2 mb-8">
          {COLLECTIONS.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCollection(c.id)}
              className={cn(
                "px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
                selectedCollection === c.id 
                  ? "bg-black text-white shadow-lg" 
                  : "bg-neutral-100 text-zinc-500 hover:bg-neutral-200"
              )}
            >
              {c.label} ({homeCollections[c.id]?.length || 0}/4)
            </button>
          ))}
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
