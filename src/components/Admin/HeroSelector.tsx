import React, { useState } from 'react';
import { usePhotos } from '../../hooks/usePhotos';
import { db } from '../../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Check, Image as ImageIcon, Loader2 } from 'lucide-react';

export const HeroSelector: React.FC = () => {
  const { photos, loading } = usePhotos();
  const [updating, setUpdating] = useState<string | null>(null);

  const toggleHero = async (photoId: string, currentStatus: boolean) => {
    setUpdating(photoId);
    try {
      const photoRef = doc(db, 'photos', photoId);
      await updateDoc(photoRef, {
        isHero: !currentStatus
      });
    } catch (error) {
      console.error('Error updating hero status:', error);
      alert('Error al actualizar el estado. Por favor, inténtalo de nuevo.');
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
      </div>
    );
  }

  const heroPhotos = photos.filter(p => p.isHero);
  const otherPhotos = photos.filter(p => !p.isHero);

  return (
    <div className="space-y-12">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100">
        <h3 className="text-xl font-serif italic mb-2 flex items-center gap-2">
          <ImageIcon size={20} className="text-brand-accent" />
          Fotos Seleccionadas para el Giro ({heroPhotos.length})
        </h3>
        <p className="text-sm text-brand-secondary mb-6">
          Estas son las fotos que aparecerán en la galería 3D de la página de inicio.
        </p>

        {heroPhotos.length === 0 ? (
          <p className="text-sm text-brand-secondary italic text-center py-8">
            No hay fotos seleccionadas. Selecciona algunas de la lista de abajo.
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {heroPhotos.map(photo => (
              <div key={photo.id} className="relative group rounded-xl overflow-hidden aspect-square bg-neutral-100">
                <img src={photo.url} alt={photo.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={() => toggleHero(photo.id, true)}
                    disabled={updating === photo.id}
                    className="px-4 py-2 bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {updating === photo.id ? 'Actualizando...' : 'Quitar'}
                  </button>
                </div>
                <div className="absolute top-2 right-2 w-6 h-6 bg-brand-accent rounded-full flex items-center justify-center shadow-lg">
                  <Check size={14} className="text-white" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-xl font-serif italic mb-6">Todas las fotos</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {otherPhotos.map(photo => (
            <div key={photo.id} className="relative group rounded-xl overflow-hidden aspect-square bg-neutral-100">
              <img src={photo.url} alt={photo.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={() => toggleHero(photo.id, false)}
                  disabled={updating === photo.id}
                  className="px-4 py-2 bg-white text-black text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-neutral-200 transition-colors disabled:opacity-50"
                >
                  {updating === photo.id ? 'Actualizando...' : 'Añadir al Giro'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
