import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Globe, Calendar, Award } from 'lucide-react';
import { Photo } from '../hooks/usePhotos';

interface LightboxProps {
  photo: Photo | null;
  onClose: () => void;
}

export const Lightbox: React.FC<LightboxProps> = ({ photo, onClose }) => {
  return (
    <AnimatePresence>
      {photo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] glass-dark flex items-center justify-center p-4 md:p-12"
          onClick={onClose}
        >
          <motion.button
            whileHover={{ rotate: 90, scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="absolute top-8 right-8 text-white/50 hover:text-white z-[110]"
          >
            <X size={40} strokeWidth={1.5} />
          </motion.button>

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="w-full h-full max-w-6xl flex flex-col items-center justify-center gap-4 md:gap-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full flex-1 min-h-0 flex items-center justify-center">
              <img
                src={photo.url}
                alt={photo.title}
                referrerPolicy="no-referrer"
                className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
              />
            </div>

            <div className="text-center text-white max-w-2xl flex-shrink-0 overflow-y-auto max-h-[30vh] px-4 pb-4">
              <motion.h2 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl md:text-4xl font-serif italic mb-4"
              >
                {photo.title}
              </motion.h2>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap justify-center gap-6 text-sm font-mono opacity-60"
              >
                <div className="flex items-center gap-2">
                  <Globe size={14} />
                  <span>{photo.country}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={14} />
                  <span>{photo.year}</span>
                </div>
                {photo.isLFI && (
                  <div className="flex items-center gap-2 text-brand-accent opacity-100">
                    <Award size={14} />
                    <span>LFI Selection</span>
                  </div>
                )}
              </motion.div>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-8 flex flex-wrap justify-center gap-2"
              >
                {photo.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 rounded-full bg-white/10 text-[10px] uppercase tracking-widest border border-white/5">
                    #{tag}
                  </span>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
