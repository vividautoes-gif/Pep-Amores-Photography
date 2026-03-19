import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Photo } from '../hooks/usePhotos';
import { formatDate } from '../lib/utils';

interface LightboxProps {
  photo: Photo | null;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  lang: string;
}

export const Lightbox: React.FC<LightboxProps> = ({ photo, onClose, onNext, onPrev, lang }) => {
  const [activeTab, setActiveTab] = useState<'INFO' | 'CAMERA'>('INFO');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && onNext) onNext();
      if (e.key === 'ArrowLeft' && onPrev) onPrev();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNext, onPrev, onClose]);

  // Animation variants for staggered slide-in
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } },
  };

  return (
    <AnimatePresence>
      {photo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-0 md:p-8"
          onClick={onClose}
        >
          <motion.button
            whileHover={{ rotate: 90, scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="absolute top-6 right-6 text-white/50 hover:text-white z-[110] bg-black/50 rounded-full p-2"
          >
            <X size={24} strokeWidth={2} />
          </motion.button>

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full h-full max-w-[1600px] flex flex-col lg:flex-row bg-zinc-950 lg:rounded-3xl overflow-hidden border border-white/5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left: Image Area */}
            <div className="relative flex-1 flex items-center justify-center bg-black p-4 lg:p-8 min-h-[40vh] lg:min-h-0">
              {onPrev && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onPrev(); }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white bg-black/50 hover:bg-black/80 rounded-full p-3 transition-all z-10"
                >
                  <ChevronLeft size={32} strokeWidth={1.5} />
                </button>
              )}
              
              <img
                src={photo.url}
                alt={photo.title}
                referrerPolicy="no-referrer"
                onContextMenu={(e) => e.preventDefault()}
                onDragStart={(e) => e.preventDefault()}
                className="max-w-full max-h-full object-contain"
              />

              {onNext && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onNext(); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white bg-black/50 hover:bg-black/80 rounded-full p-3 transition-all z-10"
                >
                  <ChevronRight size={32} strokeWidth={1.5} />
                </button>
              )}
            </div>

            {/* Right/Bottom: Details Panel */}
            <div className="w-full lg:w-[400px] xl:w-[480px] max-h-[45%] lg:max-h-none flex-shrink-0 bg-zinc-900/80 p-6 lg:p-10 text-white font-sans border-t lg:border-t-0 lg:border-l border-white/5 overflow-y-auto flex flex-col">
              {/* Header */}
              <div className="mb-6 lg:mb-8">
                <h2 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight uppercase leading-tight">
                  {lang === 'es' ? photo.title : lang === 'en' ? (photo.title_en || photo.title) : (photo.title_ca || photo.title)}
                </h2>
                <p className="text-sm text-white/60 mt-2 uppercase tracking-widest">Pep Amores</p>
              </div>

              {/* Tabs */}
              <div className="flex gap-6 border-b border-white/10 mb-8">
                <button
                  onClick={() => setActiveTab('INFO')}
                  className={`pb-3 text-xs font-bold tracking-[0.2em] uppercase transition-colors relative ${
                    activeTab === 'INFO' ? 'text-[#B45309]' : 'text-white/40 hover:text-white/80'
                  }`}
                >
                  INFO
                  {activeTab === 'INFO' && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#B45309]"
                    />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('CAMERA')}
                  className={`pb-3 text-xs font-bold tracking-[0.2em] uppercase transition-colors relative ${
                    activeTab === 'CAMERA' ? 'text-[#B45309]' : 'text-white/40 hover:text-white/80'
                  }`}
                >
                  CAMERA
                  {activeTab === 'CAMERA' && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#B45309]"
                    />
                  )}
                </button>
              </div>

              {/* Tab Content */}
              <div className="flex-1">
                <AnimatePresence mode="wait">
                  {activeTab === 'INFO' && (
                    <motion.div
                      key="info"
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      className="flex flex-col gap-8"
                    >
                      <div className="grid grid-cols-2 gap-6">
                        <motion.div variants={itemVariants} className="flex flex-col gap-1">
                          <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
                            {lang === 'es' ? 'Localización' : lang === 'en' ? 'Location' : 'Localització'}
                          </span>
                          <span className="text-sm font-medium text-white/90">
                            {lang === 'es' ? (photo.city ? `${photo.city}, ` : '') + photo.country :
                             lang === 'en' ? ((photo.city_en || photo.city) ? `${photo.city_en || photo.city}, ` : '') + (photo.country_en || photo.country) :
                             ((photo.city_ca || photo.city) ? `${photo.city_ca || photo.city}, ` : '') + (photo.country_ca || photo.country)}
                          </span>
                        </motion.div>
                        <motion.div variants={itemVariants} className="flex flex-col gap-1">
                          <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
                            {lang === 'es' ? 'Fecha' : lang === 'en' ? 'Date' : 'Data'}
                          </span>
                          <span className="text-sm font-medium text-white/90">{photo.photoDate ? formatDate(photo.photoDate) : (formatDate(photo.createdAt) || photo.year)}</span>
                        </motion.div>
                      </div>

                      {(photo.subtheme || photo.subtheme_en || photo.subtheme_ca) && (
                        <motion.div variants={itemVariants} className="flex flex-col gap-1">
                          <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
                            {lang === 'es' ? 'Subtema' : lang === 'en' ? 'Subtheme' : 'Subtema'}
                          </span>
                          <span className="text-sm font-medium text-white/90">
                            {lang === 'es' ? photo.subtheme : lang === 'en' ? (photo.subtheme_en || photo.subtheme) : (photo.subtheme_ca || photo.subtheme)}
                          </span>
                        </motion.div>
                      )}

                      {(photo.caption || photo.caption_en || photo.caption_ca) && (
                        <motion.div variants={itemVariants} className="flex flex-col gap-2">
                          <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
                            {lang === 'es' ? 'Descripción' : lang === 'en' ? 'Description' : 'Descripció'}
                          </span>
                          <span className="text-sm font-light text-white/70 leading-relaxed">
                            {lang === 'es' ? photo.caption : lang === 'en' ? (photo.caption_en || photo.caption) : (photo.caption_ca || photo.caption)}
                          </span>
                        </motion.div>
                      )}

                      {photo.isLFI && (
                        <motion.div variants={itemVariants} className="flex flex-col mt-4 gap-3">
                          <span className="inline-flex items-center justify-center px-4 py-2 bg-leica-red/10 border border-leica-red/20 rounded-lg text-xs text-leica-red uppercase tracking-widest font-bold">
                            {photo.lfiType === 'lfimastershot' ? 'LFI Mastershot' : 
                             photo.lfiType === 'lfiexhibition' ? 'LFI Exhibition' : 
                             photo.lfiType === 'lfi-picture-of-the-week' ? 'LFI Picture of the Week' : 
                             'LFI Selection'}
                          </span>
                          {photo.lfiDate && (
                            <div className="flex flex-col gap-1 text-center">
                              <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
                                {lang === 'es' ? 'Fecha de publicación LFI' : lang === 'en' ? 'LFI Publication Date' : 'Data de publicació LFI'}
                              </span>
                              <span className="text-sm font-medium text-leica-red/90">{formatDate(photo.lfiDate)}</span>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </motion.div>
                  )}

                  {activeTab === 'CAMERA' && (
                    <motion.div
                      key="camera"
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      className="grid grid-cols-2 gap-y-8 gap-x-6"
                    >
                      <motion.div variants={itemVariants} className="flex flex-col gap-1">
                        <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Camera</span>
                        <span className="text-sm font-mono text-white/90">{photo.cameraModel || 'N/A'}</span>
                      </motion.div>
                      <motion.div variants={itemVariants} className="flex flex-col gap-1">
                        <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Lens</span>
                        <span className="text-sm font-mono text-white/90">{photo.lens || 'N/A'}</span>
                      </motion.div>
                      <motion.div variants={itemVariants} className="flex flex-col gap-1">
                        <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Focal Length</span>
                        <span className="text-sm font-mono text-white/90">{photo.focalLength ? `${photo.focalLength}mm` : 'N/A'}</span>
                      </motion.div>
                      <motion.div variants={itemVariants} className="flex flex-col gap-1">
                        <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Exposure Time</span>
                        <span className="text-sm font-mono text-white/90">{photo.exposureTime ? `${photo.exposureTime}s` : 'N/A'}</span>
                      </motion.div>
                      <motion.div variants={itemVariants} className="flex flex-col gap-1">
                        <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Aperture</span>
                        <span className="text-sm font-mono text-white/90">{photo.aperture ? `f/${photo.aperture}` : 'N/A'}</span>
                      </motion.div>
                      <motion.div variants={itemVariants} className="flex flex-col gap-1">
                        <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">ISO</span>
                        <span className="text-sm font-mono text-white/90">{photo.iso || 'N/A'}</span>
                      </motion.div>
                      <motion.div variants={itemVariants} className="col-span-2 flex flex-col gap-1">
                        <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Upload Date</span>
                        <span className="text-sm font-mono text-white/90">{formatDate(photo.createdAt)}</span>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
