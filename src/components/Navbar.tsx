import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Menu, X, Instagram, Facebook, Linkedin, ExternalLink, Aperture } from 'lucide-react';
import { cn } from '../lib/utils';
import { Strings } from '../data';
import { Tabs } from './ui/vercel-tabs';

interface NavbarProps {
  lang: 'es' | 'en' | 'ca';
  setLang: (l: 'es' | 'en' | 'ca') => void;
  currentSection: string;
  onNavigate: (id: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ lang, setLang, currentSection, onNavigate }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [shutterPhase, setShutterPhase] = useState<'idle' | 'closing' | 'opening'>('idle');
  const [isFlashing, setIsFlashing] = useState(false);

  const handleOpenMenu = () => {
    if (shutterPhase !== 'idle') return;
    setShutterPhase('closing');
    setTimeout(() => {
      setIsFlashing(true);
      setIsMenuOpen(true);
      setShutterPhase('opening');
      setTimeout(() => setIsFlashing(false), 150);
      setTimeout(() => setShutterPhase('idle'), 300);
    }, 300);
  };

  const handleCloseMenu = () => {
    if (shutterPhase !== 'idle') return;
    setShutterPhase('closing');
    setTimeout(() => {
      setIsFlashing(true);
      setIsMenuOpen(false);
      setShutterPhase('opening');
      setTimeout(() => setIsFlashing(false), 150);
      setTimeout(() => setShutterPhase('idle'), 300);
    }, 300);
  };

  // Close menu on escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMenuOpen) handleCloseMenu();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isMenuOpen, shutterPhase]);

  // Prevent scrolling when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMenuOpen]);

  const s = Strings[lang];
  const links = [
    { label: s.nav[0], id: 'home' },
    { label: s.nav[1], id: 'journeys' },
    { label: s.nav[2], id: 'special-sessions' },
    { label: s.nav[3], id: 'explore' },
    { label: s.nav[4], id: 'favorites' },
    { label: lang === 'es' ? 'Últimas 50' : lang === 'ca' ? 'Últimes 50' : 'Latest 50', id: 'latest' },
    { label: s.nav[5], id: 'lfi' },
    { label: s.nav[6], id: 'my-movies' },
    { label: lang === 'es' ? 'Sobre mí' : lang === 'ca' ? 'Sobre mi' : 'About', id: 'about' },
    { label: s.nav[7], id: 'contact' },
  ];

  return (
    <>
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 h-[calc(5rem+env(safe-area-inset-top))] pt-[env(safe-area-inset-top)] bg-white/70 backdrop-blur-md border-b border-black/5 z-40 flex items-center justify-between px-6 md:px-12 text-black"
      >
        <div className="flex items-center gap-4">
          <button 
            onClick={handleOpenMenu}
            className="p-2 -ml-2 text-neutral-500 hover:text-[#B45309] transition-colors relative w-10 h-10 flex items-center justify-center xl:hidden"
            aria-label="Menu"
          >
            <AnimatePresence mode="wait">
              {shutterPhase === 'closing' && !isMenuOpen ? (
                <motion.div
                  key="shutter-close"
                  initial={{ scale: 1, rotate: 0 }}
                  animate={{ scale: 0, rotate: 180 }}
                  transition={{ duration: 0.3, ease: "easeIn" }}
                  className="absolute text-[#B45309]"
                >
                  <Aperture size={24} />
                </motion.div>
              ) : shutterPhase === 'opening' && !isMenuOpen ? (
                <motion.div
                  key="shutter-open"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="absolute text-[#B45309]"
                >
                  <Aperture size={24} />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.2 }}
                  className="absolute"
                >
                  <Menu size={24} />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
          <button 
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3 group"
          >
            <div className="w-10 h-10 bg-brand-accent rounded-full flex items-center justify-center text-white transition-transform group-hover:rotate-12">
              <Camera size={20} />
            </div>
            <span className="text-lg md:text-xl font-extrabold tracking-tighter uppercase block transition-colors group-hover:text-[#B45309]">Pep Amores</span>
          </button>
        </div>

        <nav className="hidden xl:block">
          <Tabs 
            tabs={links} 
            activeTab={currentSection} 
            onTabChange={onNavigate} 
          />
        </nav>

        <div className="flex gap-4 items-center">
          {(['es', 'en', 'ca'] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={cn(
                "flex flex-col items-center gap-1.5 transition-opacity duration-200 transform-gpu group",
                lang === l ? "opacity-100" : "opacity-40 hover:opacity-100"
              )}
            >
              <span className={cn("text-[10px] font-black uppercase tracking-tighter leading-none transition-colors", lang === l ? "text-[#B45309]" : "text-neutral-400 group-hover:text-[#B45309]")}>{l}</span>
              {l === 'es' && (
                <svg viewBox="0 0 6 4" className="w-4 h-3 rounded-[2px] overflow-hidden">
                  <rect width="6" height="4" fill="#c60b1e"/>
                  <rect width="6" height="2" y="1" fill="#ffc400"/>
                </svg>
              )}
              {l === 'en' && (
                <svg viewBox="0 0 60 30" className="w-4 h-3 rounded-[2px] overflow-hidden">
                  <rect width="60" height="30" fill="#012169"/>
                  <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
                  <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="4"/>
                  <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
                  <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
                </svg>
              )}
              {l === 'ca' && (
                <svg viewBox="0 0 9 9" className="w-4 h-3 rounded-[2px] overflow-hidden">
                  <rect width="9" height="9" fill="#ffc400"/>
                  <rect width="9" height="1" y="1" fill="#c60b1e"/>
                  <rect width="9" height="1" y="3" fill="#c60b1e"/>
                  <rect width="9" height="1" y="5" fill="#c60b1e"/>
                  <rect width="9" height="1" y="7" fill="#c60b1e"/>
                </svg>
              )}
            </button>
          ))}
        </div>
      </motion.header>

      <AnimatePresence>
        {isFlashing && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 bg-white z-[100] pointer-events-none"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={handleCloseMenu}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
            />
            
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-white/80 backdrop-blur-xl border-r border-black/5 z-[70] shadow-2xl flex flex-col overflow-y-auto text-black"
            >
              <div className="p-6 flex items-center justify-between border-b border-black/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-brand-accent rounded-full flex items-center justify-center text-white">
                    <Camera size={14} />
                  </div>
                  <span className="text-lg font-extrabold tracking-tighter uppercase">Pep Amores</span>
                </div>
                <button onClick={handleCloseMenu} className="p-2 -mr-2 text-neutral-500 hover:text-[#B45309] transition-colors relative w-10 h-10 flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    {shutterPhase === 'closing' && isMenuOpen ? (
                      <motion.div
                        key="shutter-close-drawer"
                        initial={{ scale: 1, rotate: 0 }}
                        animate={{ scale: 0, rotate: 180 }}
                        transition={{ duration: 0.3, ease: "easeIn" }}
                        className="absolute text-[#B45309]"
                      >
                        <Aperture size={24} />
                      </motion.div>
                    ) : shutterPhase === 'opening' && isMenuOpen ? (
                      <motion.div
                        key="shutter-open-drawer"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="absolute text-[#B45309]"
                      >
                        <Aperture size={24} />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="close"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        transition={{ duration: 0.2 }}
                        className="absolute"
                      >
                        <X size={24} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </div>

              <div className="flex-1 py-6 px-4 flex flex-col gap-1">
                {links.map(link => (
                  <button
                    key={link.id}
                    onClick={() => {
                      onNavigate(link.id);
                      handleCloseMenu();
                    }}
                    className={cn(
                      "text-left py-3.5 px-4 rounded-xl text-sm font-bold uppercase tracking-widest transition-all",
                      currentSection === link.id 
                        ? "bg-[#B45309]/10 text-[#B45309]" 
                        : "text-neutral-600 hover:bg-[#B45309]/10 hover:text-[#B45309]"
                    )}
                  >
                    {link.label}
                  </button>
                ))}

                <div className="my-6 h-px bg-black/5 w-full" />
                
                <div className="flex flex-col gap-1">
                  <a href="https://www.instagram.com/pepamores?igsh=dGp3ODZxaWdqcnd0" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 py-3.5 px-4 rounded-xl text-sm font-bold uppercase tracking-widest text-neutral-600 hover:bg-[#B45309]/5 transition-all">
                    <Instagram size={18} className="group-hover:text-[#E1306C] transition-colors" />
                    <span className="group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-tr group-hover:from-[#f09433] group-hover:via-[#dc2743] group-hover:to-[#bc1888] transition-all">Instagram</span>
                  </a>
                  <a href="https://www.linkedin.com/in/josepamores?utm_source=share_via&utm_content=profile&utm_medium=member_ios" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 py-3.5 px-4 rounded-xl text-sm font-bold uppercase tracking-widest text-neutral-600 hover:bg-[#B45309]/5 transition-all">
                    <Linkedin size={18} className="group-hover:text-[#0A66C2] transition-colors" />
                    <span className="group-hover:text-[#0A66C2] transition-colors">LinkedIn</span>
                  </a>
                  <a href="https://lfi-online.de/en/gallery/Pep-Amores-874174.html" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 py-3.5 px-4 rounded-xl text-sm font-bold uppercase tracking-widest text-neutral-600 hover:bg-[#B45309]/5 transition-all">
                    <ExternalLink size={18} className="group-hover:text-red-600 transition-colors" />
                    <span className="group-hover:text-red-600 transition-colors">LFI Online</span>
                  </a>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
