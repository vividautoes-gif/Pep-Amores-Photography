import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MapPin, Award } from 'lucide-react';
import { Photo } from '../hooks/usePhotos';
import { cn } from '../lib/utils';

interface PhotoCardProps {
  photo: Photo;
  onClick: (id: string) => void;
  priority?: boolean;
  lang: string;
}

export const PhotoCard: React.FC<PhotoCardProps> = ({ photo, onClick, priority, lang }) => {
  // Inicializamos el aspect ratio con un valor por defecto según la orientación
  const [aspectRatio, setAspectRatio] = useState(
    photo.orientation === 'landscape' ? 1.5 : photo.orientation === 'portrait' ? 0.66 : 1
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      onClick={() => onClick(photo.id)}
      className="justified-item group cursor-pointer bg-neutral-100"
      style={{ '--aspect-ratio': aspectRatio } as React.CSSProperties}
    >
      <motion.img
        src={photo.url}
        alt={lang === 'es' ? photo.title : lang === 'en' ? (photo.title_en || photo.title) : (photo.title_ca || photo.title)}
        referrerPolicy="no-referrer"
        onLoad={(e) => {
          const target = e.target as HTMLImageElement;
          if (target.naturalWidth && target.naturalHeight) {
            setAspectRatio(target.naturalWidth / target.naturalHeight);
          }
        }}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 pointer-events-none">
        <div className="text-white translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out">
          <h3 className="text-lg font-bold leading-tight mb-1">
            {lang === 'es' ? photo.title : lang === 'en' ? (photo.title_en || photo.title) : (photo.title_ca || photo.title)}
          </h3>
          <div className="flex items-center gap-2 text-xs opacity-80 font-medium">
            <span>Pep Amores Guevara</span>
          </div>
        </div>
      </div>

      <div className="absolute top-2 right-2 flex flex-col gap-1.5 items-end">
        {photo.isLFI && (
          <span className="bg-leica-red text-white text-[8px] md:text-[9px] font-black uppercase px-1.5 py-0.5 rounded-sm shadow-lg tracking-tighter">
            {photo.lfiType === 'lfimastershot' ? 'LFI Mastershot' : 
             photo.lfiType === 'lfiexhibition' ? 'LFI Exhibition' : 
             photo.lfiType === 'lfi-picture-of-the-week' ? 'LFI Picture of the Week' : 
             'LFI Selection'}
          </span>
        )}
      </div>

      {/* Border beam effect on hover */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-white/20 transition-colors pointer-events-none rounded-xl" />
    </motion.div>
  );
};
