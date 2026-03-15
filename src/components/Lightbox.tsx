import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { Photo } from '../hooks/usePhotos';

interface LightboxProps {
  photo: Photo | null;
  onClose: () => void;
}

export const Lightbox: React.FC<LightboxProps> = ({ photo, onClose }) => {
  const [activeTab, setActiveTab] = useState<'INFO' | 'CAMERA'>('INFO');

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

  // Helper to format date
  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    try {
      const date = typeof timestamp.toDate === 'function' ? timestamp.toDate() : new Date(timestamp);
      if (isNaN(date.getTime())) return '';
      return new Intl.DateTimeFormat('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
      }).format(date);
    } catch (e) {
      return '';
    }
  };

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

            {/* Details Panel */}
            <div className="w-full max-w-2xl flex-shrink-0 bg-black/40 backdrop-blur-md rounded-2xl p-6 md:p-8 text-white font-sans border border-white/10">
              {/* Header */}
              <div className="mb-6 text-center md:text-left">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight uppercase">{photo.title}</h2>
                <p className="text-sm text-white/60 mt-1 uppercase tracking-widest">Pep Amores</p>
              </div>

              {/* Tabs */}
              <div className="flex gap-6 border-b border-white/20 mb-6">
                <button
                  onClick={() => setActiveTab('INFO')}
                  className={`pb-2 text-sm font-medium tracking-widest uppercase transition-colors relative ${
                    activeTab === 'INFO' ? 'text-white' : 'text-white/50 hover:text-white/80'
                  }`}
                >
                  INFO
                  {activeTab === 'INFO' && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"
                    />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('CAMERA')}
                  className={`pb-2 text-sm font-medium tracking-widest uppercase transition-colors relative ${
                    activeTab === 'CAMERA' ? 'text-white' : 'text-white/50 hover:text-white/80'
                  }`}
                >
                  CAMERA
                  {activeTab === 'CAMERA' && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"
                    />
                  )}
                </button>
              </div>

              {/* Tab Content */}
              <div className="min-h-[120px]">
                <AnimatePresence mode="wait">
                  {activeTab === 'INFO' && (
                    <motion.div
                      key="info"
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8"
                    >
                      <motion.div variants={itemVariants} className="flex flex-col">
                        <span className="text-xs text-white/50 uppercase tracking-widest mb-1">Location</span>
                        <span className="text-sm font-medium">{photo.city ? `${photo.city}, ` : ''}{photo.country}</span>
                      </motion.div>
                      <motion.div variants={itemVariants} className="flex flex-col">
                        <span className="text-xs text-white/50 uppercase tracking-widest mb-1">Date</span>
                        <span className="text-sm font-medium">{photo.photoDate ? formatDate(photo.photoDate) : (formatDate(photo.createdAt) || photo.year)}</span>
                      </motion.div>
                      {photo.isLFI && (
                        <motion.div variants={itemVariants} className="flex flex-col col-span-1 md:col-span-2 mt-2">
                          <span className="text-xs text-leica-red uppercase tracking-widest font-bold">
                            {photo.lfiType === 'lfimastershot' ? 'LFI Mastershot' : 
                             photo.lfiType === 'lfiexhibition' ? 'LFI Exhibition' : 
                             photo.lfiType === 'lfi-picture-of-the-week' ? 'LFI Picture of the Week' : 
                             'LFI Selection'}
                          </span>
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
                      className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-8"
                    >
                      <motion.div variants={itemVariants} className="flex flex-col">
                        <span className="text-xs text-white/50 uppercase tracking-widest mb-1">Camera</span>
                        <span className="text-sm font-bold">{photo.cameraModel || 'N/A'}</span>
                      </motion.div>
                      <motion.div variants={itemVariants} className="flex flex-col">
                        <span className="text-xs text-white/50 uppercase tracking-widest mb-1">Lens</span>
                        <span className="text-sm font-bold">{photo.lens || 'N/A'}</span>
                      </motion.div>
                      <motion.div variants={itemVariants} className="flex flex-col">
                        <span className="text-xs text-white/50 uppercase tracking-widest mb-1">Focal Length</span>
                        <span className="text-sm font-bold">{photo.focalLength ? `${photo.focalLength}mm` : 'N/A'}</span>
                      </motion.div>
                      <motion.div variants={itemVariants} className="flex flex-col">
                        <span className="text-xs text-white/50 uppercase tracking-widest mb-1">Exposure Time</span>
                        <span className="text-sm font-bold">{photo.exposureTime ? `${photo.exposureTime}s` : 'N/A'}</span>
                      </motion.div>
                      <motion.div variants={itemVariants} className="flex flex-col">
                        <span className="text-xs text-white/50 uppercase tracking-widest mb-1">Aperture</span>
                        <span className="text-sm font-bold">{photo.aperture ? `f/${photo.aperture}` : 'N/A'}</span>
                      </motion.div>
                      <motion.div variants={itemVariants} className="flex flex-col">
                        <span className="text-xs text-white/50 uppercase tracking-widest mb-1">ISO</span>
                        <span className="text-sm font-bold">{photo.iso || 'N/A'}</span>
                      </motion.div>
                      <motion.div variants={itemVariants} className="flex flex-col">
                        <span className="text-xs text-white/50 uppercase tracking-widest mb-1">Upload</span>
                        <span className="text-sm font-bold">{formatDate(photo.createdAt)}</span>
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
