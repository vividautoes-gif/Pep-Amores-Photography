import React, { useState, useMemo, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, Send, MapPin, ChevronRight, Camera, AlertTriangle, Star, Award, Clock, User, MessageSquare, BarChart3, Lock, Image as ImageIcon, Aperture } from 'lucide-react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { PhotoCard } from './components/PhotoCard';
import { Lightbox } from './components/Lightbox';
import { FlowButton } from './components/ui/flow-button';
import { AdminPage } from './pages/AdminPage';
import { usePhotos, useJourneys, Photo as PhotoType, Journey } from './hooks/usePhotos';
import { Strings } from './data';
import { cn, formatDate } from './lib/utils';
import { db, auth } from './firebase';
import { collection, addDoc, serverTimestamp, query, where, orderBy, onSnapshot } from 'firebase/firestore';

import InfiniteGallery from './components/ui/3d-gallery-photography';
import { CardStack3D } from './components/ui/3d-flip-card';
import { Footer } from './components/ui/footer-section';

// --- Components ---


const CommentSection = ({ targetId, targetType }: { targetId: string, targetType: 'photo' | 'journey' | 'guestbook' }) => {
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const q = query(
      collection(db, 'comments'), 
      where('targetId', '==', targetId),
      where('targetType', '==', targetType),
      where('isApproved', '==', true),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snap) => {
      setComments(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, [targetId, targetType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment || !userName) return;
    await addDoc(collection(db, 'comments'), {
      targetId,
      targetType,
      userName,
      text: newComment,
      isApproved: false, // Moderation by default
      createdAt: serverTimestamp()
    });
    setNewComment('');
    alert("Comentario enviado. Aparecerá tras ser moderado.");
  };

  return (
    <div className="mt-12 pt-12 border-t border-neutral-100">
      <h3 className="text-xl font-serif italic mb-8 flex items-center gap-2">
        <MessageSquare size={20} />
        Comentarios
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input 
            type="text" placeholder="Tu nombre" value={userName} onChange={e => setUserName(e.target.value)}
            className="w-full bg-neutral-50 border-none rounded-xl p-4 text-sm outline-none focus:ring-2 focus:ring-brand-primary/10"
          />
        </div>
        <textarea 
          placeholder="Escribe tu comentario..." value={newComment} onChange={e => setNewComment(e.target.value)}
          className="w-full bg-neutral-50 border-none rounded-xl p-4 text-sm outline-none focus:ring-2 focus:ring-brand-primary/10 h-32 resize-none"
        />
        <FlowButton 
          type="submit"
          text="Enviar Comentario"
        />
      </form>

      <div className="space-y-6">
        {comments.map(c => (
          <div key={c.id} className="bg-neutral-50 p-6 rounded-2xl">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-xs uppercase tracking-widest">{c.userName}</span>
              <span className="text-[10px] text-brand-secondary font-mono">
                {formatDate(c.createdAt)}
              </span>
            </div>
            <p className="text-sm text-brand-secondary leading-relaxed">{c.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Main Gallery ---

interface GalleryItem {
  common: string;
  binomial: string;
  photo: {
    url: string;
    text: string;
    by: string;
    orientation: 'landscape' | 'portrait' | 'square';
  };
}

const PREVIEW_ITEMS: GalleryItem[] = [
  {
    common: 'Street Life',
    binomial: 'Tokyo, Japan',
    photo: {
      url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1200&q=80',
      text: 'City lights at night',
      by: 'Pep Amores',
      orientation: 'landscape'
    }
  },
  {
    common: 'The Look',
    binomial: 'Portrait Series',
    photo: {
      url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1200&q=80',
      text: 'Close up portrait',
      by: 'Pep Amores',
      orientation: 'portrait'
    }
  },
  {
    common: 'High Peaks',
    binomial: 'Alps, Switzerland',
    photo: {
      url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80',
      text: 'Mountain range',
      by: 'Pep Amores',
      orientation: 'landscape'
    }
  },
  {
    common: 'Modern Lines',
    binomial: 'Architecture',
    photo: {
      url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80',
      text: 'Skyscraper geometry',
      by: 'Pep Amores',
      orientation: 'portrait'
    }
  },
  {
    common: 'Deep Forest',
    binomial: 'Nature Study',
    photo: {
      url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=80',
      text: 'Sunlight through trees',
      by: 'Pep Amores',
      orientation: 'landscape'
    }
  },
  {
    common: 'Parisian Mornings',
    binomial: 'Paris, France',
    photo: {
      url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=80',
      text: 'Eiffel tower view',
      by: 'Pep Amores',
      orientation: 'portrait'
    }
  },
  {
    common: 'Minimal Space',
    binomial: 'Interior Design',
    photo: {
      url: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=1200&q=80',
      text: 'Clean room design',
      by: 'Pep Amores',
      orientation: 'landscape'
    }
  },
  {
    common: 'Timeless',
    binomial: 'Black & White',
    photo: {
      url: 'https://images.unsplash.com/photo-1501139083538-0139583c060f?w=1200&q=80',
      text: 'Monochrome clock',
      by: 'Pep Amores',
      orientation: 'square'
    }
  },
  {
    common: 'Neon Nights',
    binomial: 'Hong Kong',
    photo: {
      url: 'https://images.unsplash.com/photo-1470219556762-1771e7f9427d?w=1200&q=80',
      text: 'Night city skyline',
      by: 'Pep Amores',
      orientation: 'landscape'
    }
  },
  {
    common: 'Abstract Flow',
    binomial: 'Color Study',
    photo: {
      url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600&q=60',
      text: 'Fluid art colors',
      by: 'Pep Amores',
      orientation: 'portrait'
    }
  }
];

const EXTENDED_PREVIEW_ITEMS = [...PREVIEW_ITEMS, ...PREVIEW_ITEMS, ...PREVIEW_ITEMS, ...PREVIEW_ITEMS, ...PREVIEW_ITEMS];

const MOCK_DB: PhotoType[] = EXTENDED_PREVIEW_ITEMS.map((item, i) => {
  const baseTags = ['mock', 'preview', item.common.toLowerCase().replace(' ', '-')];
  
  // Añadir tags de tipo de foto y localización para probar los filtros AND/OR
  const photoTypes = ['portrait', 'landscape', 'street', 'macro', 'architecture', 'documentary', 'wildlife', 'abstract'];
  const locations = ['china', 'peru', 'japan', 'spain', 'france', 'switzerland', 'usa', 'italy'];
  
  const typeTag = photoTypes[i % photoTypes.length];
  const locationTag = locations[(i * 3) % locations.length]; // Desfasado para que haya combinaciones
  
  return {
    id: `mock-photo-${i}`,
    title: item.photo.text,
    title_en: item.photo.text,
    title_ca: item.photo.text,
    url: item.photo.url,
    orientation: item.photo.orientation || 'landscape',
    country: item.binomial.split(', ')[1] || 'Unknown',
    city: item.binomial.split(', ')[0] || 'Unknown',
    year: 2024,
    tags: [...baseTags, typeTag, locationTag],
    isLFI: i % 3 === 0,
    lfiType: i % 3 === 0 ? 'lfimastershot' : 'none',
    isFavorite: i % 2 === 0,
    favoriteScore: i,
    caption: 'Esta es una foto de prueba. Muestra cómo quedará el diseño una vez que subas tus propias fotos a la base de datos.',
    caption_en: 'This is a preview photo. It shows how the design will look once you upload your own photos to the database.',
    caption_ca: 'Aquesta és una foto de prova. Mostra com quedarà el disseny un cop pugis les teves pròpies fotos a la base de dades.',
    createdAt: { toMillis: () => Date.now() - i * 10000, toDate: () => new Date() },
    authorUid: 'mock-author',
    journeyId: i % 2 === 0 ? 'mock-journey-1' : 'mock-journey-2',
  };
});

const MOCK_JDB: Journey[] = [
  {
    id: 'mock-journey-1',
    title: 'Japan Diaries',
    country: 'Japan',
    intro: 'Un viaje visual por las calles de neón de Tokio y los templos serenos de Kioto. (Viaje de prueba)',
    coverUrl: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&q=60',
    subthemes: ['Street', 'Night', 'Culture'],
    createdAt: { toMillis: () => Date.now(), toDate: () => new Date() }
  },
  {
    id: 'mock-journey-2',
    title: 'Alpine Escapes',
    country: 'Switzerland',
    intro: 'Explorando los altos picos y los profundos valles de los Alpes suizos. (Viaje de prueba)',
    coverUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=60',
    subthemes: ['Nature', 'Mountains', 'Snow'],
    createdAt: { toMillis: () => Date.now(), toDate: () => new Date() }
  }
];

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center">
          <AlertTriangle size={48} className="text-red-500 mb-4" />
          <h1 className="text-2xl font-serif italic mb-2">Algo ha salido mal</h1>
          <p className="text-brand-secondary mb-6 max-w-md">
            {this.state.error?.message || "Ha ocurrido un error inesperado al renderizar la página."}
          </p>
          <FlowButton 
            onClick={() => window.location.reload()} 
            text="Recargar página"
          />
        </div>
      );
    }

    return this.props.children;
  }
}

function Gallery() {
  console.log("Rendering Gallery...");
  const { photos: rawPhotos, loading: photosLoading, error: photosError } = usePhotos();
  const { journeys: rawJourneys, loading: journeysLoading } = useJourneys();
  
  const loading = photosLoading || journeysLoading;
  
  // Sanitización de datos: Asegurarse de que las fotos tengan URL y los campos necesarios
  const realDB = useMemo(() => rawPhotos.filter(p => p && p.url && p.id), [rawPhotos]);
  const realJDB = useMemo(() => rawJourneys.filter(j => j && j.id && j.title), [rawJourneys]);

  const DB = realDB.length > 0 ? realDB : MOCK_DB;
  const JDB = realJDB.length > 0 ? realJDB : MOCK_JDB;
  
  const [lang, setLang] = useState<'es' | 'en' | 'ca'>('es');
  const [isMobile, setIsMobile] = useState(false);

  const heroImages = useMemo(() => {
    let dbImages = DB.filter(p => p.isHero).length > 0 
      ? DB.filter(p => p.isHero).map(p => ({ src: p.url, alt: p.title }))
      : DB.map(p => ({ src: p.url, alt: p.title }));
    
    if (dbImages.length === 0) {
      dbImages = PREVIEW_ITEMS.map(p => ({ src: p.photo.url, alt: p.photo.text }));
    }

    let combined = [...dbImages];
    if (combined.length > 0) {
      const targetCount = isMobile ? 15 : 25;
      while (combined.length < targetCount && combined.length > 0) {
        combined = [...combined, ...dbImages];
      }
      return combined.slice(0, targetCount);
    }
    return combined;
  }, [DB, isMobile]);

  const [currentSection, setCurrentSection] = useState('home');

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'IMG' || target.tagName === 'CANVAS') {
        e.preventDefault();
      }
    };
    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, []);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoType | null>(null);
  const [selectedJourney, setSelectedJourney] = useState<Journey | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
  const [filterLogic, setFilterLogic] = useState<'and' | 'or'>('and');
  const [lfiFilter, setLfiFilter] = useState<'all' | 'lfimastershot' | 'lfiexhibition' | 'lfi-picture-of-the-week'>('all');
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [isSending, setIsSending] = useState(false);

  const s = Strings[lang];

  const allTags = useMemo(() => {
    if (!DB) return [];
    return [...new Set(DB.flatMap(p => Array.isArray(p.tags) ? p.tags.filter(t => typeof t === 'string') : []))].sort();
  }, [DB]);

  const filteredPhotos = useMemo(() => {
    if (!DB) return [];
    return DB.filter(p => {
      const query = searchQuery.toLowerCase();
      const title = lang === 'es' ? p.title : lang === 'en' ? p.title_en : p.title_ca;
      const tags = Array.isArray(p.tags) ? p.tags.filter(t => typeof t === 'string') : [];
      const matchText = (title || '').toLowerCase().includes(query) || 
                        (p.country || '').toLowerCase().includes(query) || 
                        (p.city || '').toLowerCase().includes(query) ||
                        tags.some(t => t.toLowerCase().includes(query));
      
      const activeFiltersArray = Array.from(activeFilters);
      const matchTags = activeFiltersArray.length === 0 ? true :
        filterLogic === 'and'
          ? activeFiltersArray.every((t: string) => tags.includes(t))
          : activeFiltersArray.some((t: string) => tags.includes(t));
          
      return matchText && matchTags;
    });
  }, [DB, searchQuery, activeFilters, filterLogic, lang]);

  const toggleFilter = (tag: string) => {
    const newFilters = new Set(activeFilters);
    if (newFilters.has(tag)) newFilters.delete(tag);
    else newFilters.add(tag);
    setActiveFilters(newFilters);
  };

  const clearFilters = () => {
    setActiveFilters(new Set());
    setSearchQuery('');
  };

  const currentPhotoList = useMemo(() => {
    if (currentSection === 'home' || currentSection === 'explore') return filteredPhotos;
    if (currentSection === 'favorites') return DB.filter(p => p.isFavorite).sort((a,b) => (b.favoriteScore || 0) - (a.favoriteScore || 0)).slice(0, 40);
    if (currentSection === 'latest') return DB.slice(0, 50);
    if (currentSection === 'lfi') return DB.filter(p => p.isLFI && (lfiFilter === 'all' || p.lfiType === lfiFilter))
      .sort((a, b) => {
        const getTime = (dateInput: any) => {
          if (!dateInput) return 0;
          try {
            const date = typeof dateInput.toDate === 'function' ? dateInput.toDate() : new Date(dateInput);
            return isNaN(date.getTime()) ? 0 : date.getTime();
          } catch (e) {
            return 0;
          }
        };
        return getTime(b.lfiDate) - getTime(a.lfiDate);
      });
    if (currentSection === 'journeys' && selectedJourney) return DB.filter(p => p.journeyId === selectedJourney.id);
    return DB;
  }, [currentSection, filteredPhotos, DB, selectedJourney, lfiFilter]);

  if (photosLoading && realDB.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <motion.div
          animate={{ scale: [0.8, 1.2, 0.8], rotate: [0, 180, 360] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="text-[#B45309]"
        >
          <Aperture size={48} strokeWidth={1.5} />
        </motion.div>
      </div>
    );
  }

  if (photosError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center">
        <AlertTriangle size={48} className="text-brand-accent mb-4" />
        <h1 className="text-2xl font-serif italic mb-2">
          {lang === 'es' ? 'Error de conexión' : lang === 'ca' ? 'Error de connexió' : 'Connection Error'}
        </h1>
        <p className="text-brand-secondary mb-6 max-w-md">{photosError.message}</p>
        <FlowButton 
          onClick={() => window.location.reload()} 
          text={lang === 'es' ? 'Reintentar' : lang === 'ca' ? 'Reintentar' : 'Retry'}
        />
      </div>
    );
  }

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      alert(lang === 'es' ? 'Por favor, rellena todos los campos.' : lang === 'ca' ? 'Si us plau, omple tots els camps.' : 'Please fill in all fields.');
      return;
    }

    setIsSending(true);
    try {
      await addDoc(collection(db, 'messages'), {
        ...contactForm,
        subject: 'Contacto desde la web',
        isRead: false,
        createdAt: serverTimestamp()
      });
      setContactForm({ name: '', email: '', message: '' });
      alert(lang === 'es' ? 'Mensaje enviado correctamente.' : lang === 'ca' ? 'Missatge enviat correctament.' : 'Message sent successfully.');
    } catch (error) {
      console.error("Error sending message:", error);
      alert(lang === 'es' ? 'Error al enviar el mensaje.' : lang === 'ca' ? 'Error en enviar el missatge.' : 'Error sending message.');
    } finally {
      setIsSending(false);
    }
  };

  const currentIndex = selectedPhoto ? currentPhotoList.findIndex(p => p.id === selectedPhoto.id) : -1;
  const handleNext = currentIndex >= 0 && currentIndex < currentPhotoList.length - 1 ? () => setSelectedPhoto(currentPhotoList[currentIndex + 1]) : undefined;
  const handlePrev = currentIndex > 0 ? () => setSelectedPhoto(currentPhotoList[currentIndex - 1]) : undefined;

  return (
    <div className="min-h-screen bg-white">
      <Navbar lang={lang} setLang={setLang} currentSection={currentSection} onNavigate={(id) => { setCurrentSection(id); setSelectedJourney(null); }} />

      <main className="pt-20">
        <AnimatePresence mode="wait">
          {currentSection === 'home' && (
            <motion.section key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full flex flex-col items-center justify-center">
              <div className="relative h-screen w-full overflow-hidden bg-white">
                {/* CAPA 1: Canvas 3D de fondo (z-index más bajo) */}
                <div className="absolute inset-0 z-0">
                  <InfiniteGallery 
                    images={heroImages} 
                    visibleCount={isMobile ? 10 : 12}
                    speed={1.2}
                    className="h-full w-full"
                  />
                </div>

                {/* CAPA 2: Texto Hero centrado (z-index intermedio, pointer-events-none para no bloquear hover de imágenes) */}
                <div className="absolute inset-0 z-10 pointer-events-none flex flex-col items-center justify-center text-center px-6 mix-blend-exclusion text-white">
                  <motion.h1 
                    initial={{ y: 20, opacity: 0 }} 
                    animate={{ y: 0, opacity: 1 }} 
                    className="font-serif text-6xl md:text-7xl lg:text-8xl tracking-tighter mb-6"
                  >
                    <span className="italic block leading-none">{s.titles.home}</span>
                  </motion.h1>
                  <motion.p 
                    initial={{ y: 20, opacity: 0 }} 
                    animate={{ y: 0, opacity: 1 }} 
                    transition={{ delay: 0.1 }} 
                    className="text-base md:text-xl font-light tracking-[0.2em] uppercase mb-10 text-white/90 max-w-[280px] md:max-w-none mx-auto leading-relaxed"
                  >
                    {s.subtitles.home}
                  </motion.p>
                  
                  <div className="pointer-events-auto">
                    <button 
                      onClick={() => {
                        const exploreSection = document.getElementById('navigation-folders');
                        if (exploreSection) exploreSection.scrollIntoView({ behavior: 'smooth' });
                        else setCurrentSection('explore');
                      }} 
                      className="group relative px-12 py-4 bg-white text-black text-xs font-bold uppercase tracking-[0.3em] overflow-hidden rounded-full transition-all hover:scale-105 active:scale-95 shadow-2xl"
                    >
                      <span className="relative z-10 group-hover:text-brand-primary transition-colors duration-300">{s.nav[2]}</span>
                      <div className="absolute inset-0 bg-brand-tertiary translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Navigation Folders (3D Flip Cards) */}
              <section id="navigation-folders" className="w-full py-24 bg-neutral-50 border-b border-neutral-200 overflow-hidden">
                <div className="container mx-auto px-6">
                  <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-serif italic mb-4">
                      {lang === 'es' ? 'Explorar Colecciones' : lang === 'en' ? 'Explore Collections' : 'Explorar Col·leccions'}
                    </h2>
                    <p className="text-brand-secondary font-light max-w-xl mx-auto">
                      {lang === 'es' ? 'Descubre el archivo a través de nuestras selecciones temáticas.' : lang === 'en' ? 'Discover the archive through our thematic selections.' : 'Descobreix l\'arxiu a través de les nostres seleccions temàtiques.'}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-20 max-w-6xl mx-auto">
                    {[
                      { 
                        id: 'journeys', 
                        title: s.nav[1], 
                        desc: lang === 'es' ? 'Colecciones' : lang === 'ca' ? 'Col·leccions' : 'Collections',
                        images: JDB.slice(0, 4).map(j => ({ src: j.coverUrl || DB[0]?.url, alt: j.title }))
                      },
                      { 
                        id: 'explore', 
                        title: s.nav[2], 
                        desc: lang === 'es' ? 'Archivo completo' : lang === 'ca' ? 'Arxiu complet' : 'Full archive',
                        images: DB.slice(0, 4).map(p => ({ src: p.url, alt: p.title }))
                      },
                      { 
                        id: 'favorites', 
                        title: s.nav[3], 
                        desc: lang === 'es' ? 'Selección' : lang === 'ca' ? 'Selecció' : 'Selection',
                        images: DB.filter(p => p.isFavorite).sort((a,b) => (b.favoriteScore || 0) - (a.favoriteScore || 0)).slice(0, 4).map(p => ({ src: p.url, alt: p.title }))
                      },
                      { 
                        id: 'latest', 
                        title: lang === 'es' ? 'Últimas 50' : lang === 'ca' ? 'Últimes 50' : 'Latest 50', 
                        desc: lang === 'es' ? 'Recientes' : lang === 'ca' ? 'Recents' : 'Recent',
                        images: DB.slice(0, 4).map(p => ({ src: p.url, alt: p.title }))
                      },
                      { 
                        id: 'lfi', 
                        title: s.nav[4], 
                        desc: 'Leica Gallery',
                        images: DB.filter(p => p.isLFI)
                          .sort((a, b) => {
                            const getTime = (dateInput: any) => {
                              if (!dateInput) return 0;
                              try {
                                const date = typeof dateInput.toDate === 'function' ? dateInput.toDate() : new Date(dateInput);
                                return isNaN(date.getTime()) ? 0 : date.getTime();
                              } catch (e) {
                                return 0;
                              }
                            };
                            return getTime(b.lfiDate) - getTime(a.lfiDate);
                          })
                          .slice(0, 4)
                          .map(p => ({ src: p.url, alt: p.title }))
                      },
                      { 
                        id: 'about', 
                        title: 'About', 
                        desc: lang === 'es' ? 'Sobre mí' : lang === 'ca' ? 'Sobre mi' : 'About me',
                        images: DB.slice(4, 8).map(p => ({ src: p.url, alt: p.title }))
                      }
                    ].map((item, index) => {
                      // Aseguramos tener exactamente 4 imágenes para que el efecto se vea bien
                      let stackImages = item.images.length >= 4 
                        ? item.images.slice(0, 4) 
                        : [...item.images, ...DB.slice(0, 4 - item.images.length).map(p => ({ src: p.url, alt: p.title }))];
                      
                      // Si aún no hay 4 (porque la base de datos está vacía o tiene pocas fotos), usamos PREVIEW_ITEMS
                      if (stackImages.length < 4) {
                        const fallback = PREVIEW_ITEMS.map(p => ({ src: p.photo.url, alt: p.photo.text }));
                        // Rotamos el array de fallback según el índice para que cada carpeta muestre fotos distintas
                        const rotatedFallback = [...fallback.slice(index % fallback.length), ...fallback.slice(0, index % fallback.length)];
                        stackImages = [...stackImages, ...rotatedFallback.slice(0, 4 - stackImages.length)];
                      }
                      
                      return (
                        <div key={item.id} className="flex flex-col items-center">
                          <CardStack3D 
                            images={stackImages} 
                            cardWidth={220}
                            cardHeight={280}
                            spacing={{ x: 30, y: 30 }}
                            onCardClick={() => setCurrentSection(item.id)}
                          />
                          <div className="mt-6 text-center z-10">
                            <h3 className="font-serif italic text-2xl mb-2">{item.title}</h3>
                            <p className="text-[10px] uppercase tracking-widest text-brand-secondary mb-4">{item.desc}</p>
                            <FlowButton 
                              onClick={() => setCurrentSection(item.id)}
                              text={lang === 'es' ? 'Ver sección' : lang === 'en' ? 'View section' : 'Veure secció'}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>

              {/* Featured Journeys */}
              <section className="w-full py-24 bg-white">
                <div className="container mx-auto px-6">
                  <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                    <div>
                      <h2 className="text-4xl md:text-5xl font-serif italic mb-4">{s.titles.journeys}</h2>
                      <p className="text-brand-secondary font-light max-w-xl">
                        {lang === 'es' ? 'Explora el mundo a través de colecciones fotográficas únicas.' : lang === 'en' ? 'Explore the world through unique photographic collections.' : 'Explora el món a través de col·leccions fotogràfiques úniques.'}
                      </p>
                    </div>
                    <button onClick={() => setCurrentSection('journeys')} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-primary hover:text-brand-accent transition-colors">
                      {lang === 'es' ? 'Ver todos los viajes' : lang === 'en' ? 'View all journeys' : 'Veure tots els viatges'} <ChevronRight size={16} />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-20 max-w-6xl mx-auto">
                    {JDB.slice(0, 3).map(journey => {
                      const journeyPhotos = DB.filter(p => p.journeyId === journey.id);
                      let stackImages = journeyPhotos.map(p => ({ src: p.url, alt: p.title }));
                      
                      if (stackImages.length < 4) {
                        const fallback = PREVIEW_ITEMS.map(p => ({ src: p.photo.url, alt: p.photo.text }));
                        const rotatedFallback = [...fallback.slice(JDB.indexOf(journey) % fallback.length), ...fallback.slice(0, JDB.indexOf(journey) % fallback.length)];
                        stackImages = [...stackImages, ...rotatedFallback.slice(0, 4 - stackImages.length)];
                      }
                      
                      return (
                        <div key={journey.id} className="flex flex-col items-center">
                          <CardStack3D 
                            images={stackImages.slice(0, 4)} 
                            cardWidth={220}
                            cardHeight={280}
                            spacing={{ x: 30, y: 30 }}
                            onCardClick={() => { setSelectedJourney(journey); setCurrentSection('journeys'); }}
                          />
                          <div className="mt-6 text-center z-10">
                            <h3 className="font-serif italic text-2xl mb-2">
                              {lang === 'es' ? journey.title : lang === 'en' ? (journey.title_en || journey.title) : (journey.title_ca || journey.title)}
                            </h3>
                            <p className="text-[10px] uppercase tracking-widest text-brand-secondary mb-4">
                              {lang === 'es' ? journey.country : lang === 'en' ? (journey.country_en || journey.country) : (journey.country_ca || journey.country)}
                            </p>
                            <FlowButton 
                              onClick={() => { setSelectedJourney(journey); setCurrentSection('journeys'); }}
                              text={lang === 'es' ? 'Ver viaje' : lang === 'en' ? 'View journey' : 'Veure viatge'}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            </motion.section>
          )}

          {currentSection === 'journeys' && !selectedJourney && (
            <motion.section key="journeys" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="container mx-auto px-6 py-12">
              <div className="text-center mb-16">
                <h1 className="text-5xl font-serif italic mb-4">{s.titles.journeys}</h1>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-20 max-w-6xl mx-auto">
                {JDB.map(journey => {
                  const journeyPhotos = DB.filter(p => p.journeyId === journey.id);
                  let stackImages = journeyPhotos.map(p => ({ src: p.url, alt: p.title }));
                  
                  if (stackImages.length < 4) {
                    const fallback = PREVIEW_ITEMS.map(p => ({ src: p.photo.url, alt: p.photo.text }));
                    const rotatedFallback = [...fallback.slice(JDB.indexOf(journey) % fallback.length), ...fallback.slice(0, JDB.indexOf(journey) % fallback.length)];
                    stackImages = [...stackImages, ...rotatedFallback.slice(0, 4 - stackImages.length)];
                  }
                  
                  return (
                    <div key={journey.id} className="flex flex-col items-center">
                      <CardStack3D 
                        images={stackImages.slice(0, 4)} 
                        cardWidth={220}
                        cardHeight={280}
                        spacing={{ x: 30, y: 30 }}
                        onCardClick={() => setSelectedJourney(journey)}
                      />
                      <div className="mt-6 text-center z-10">
                        <h3 className="font-serif italic text-2xl mb-2">
                          {lang === 'es' ? journey.title : lang === 'en' ? (journey.title_en || journey.title) : (journey.title_ca || journey.title)}
                        </h3>
                        <p className="text-[10px] uppercase tracking-widest text-brand-secondary mb-4">
                          {lang === 'es' ? journey.country : lang === 'en' ? (journey.country_en || journey.country) : (journey.country_ca || journey.country)}
                        </p>
                        <FlowButton 
                          onClick={() => setSelectedJourney(journey)}
                          text={lang === 'es' ? 'Ver viaje' : lang === 'en' ? 'View journey' : 'Veure viatge'}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.section>
          )}

          {currentSection === 'journeys' && selectedJourney && (
            <motion.section key={`journey-${selectedJourney.id}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="container mx-auto px-6 py-12">
              <button onClick={() => setSelectedJourney(null)} className="mb-12 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-brand-secondary hover:text-brand-primary transition-colors">
                <ChevronRight size={12} className="rotate-180" />
                {lang === 'es' ? 'Volver a Viajes' : lang === 'en' ? 'Back to Journeys' : 'Tornar a Viatges'}
              </button>
              <div className="max-w-4xl mx-auto mb-16 text-center">
                <h1 className="text-6xl font-serif italic mb-6">
                  {lang === 'es' ? selectedJourney.title : lang === 'en' ? (selectedJourney.title_en || selectedJourney.title) : (selectedJourney.title_ca || selectedJourney.title)}
                </h1>
                <p className="text-lg text-brand-secondary font-light leading-relaxed mb-8">
                  {lang === 'es' ? selectedJourney.intro : lang === 'en' ? (selectedJourney.intro_en || selectedJourney.intro) : (selectedJourney.intro_ca || selectedJourney.intro)}
                </p>
                <div className="flex justify-center gap-4">
                  {((lang === 'es' ? selectedJourney.subthemes : lang === 'en' ? (selectedJourney.subthemes_en || selectedJourney.subthemes) : (selectedJourney.subthemes_ca || selectedJourney.subthemes)) || []).map((st, i) => (
                    <span key={i} className="px-4 py-2 bg-neutral-50 rounded-full text-[10px] font-bold uppercase tracking-widest text-brand-secondary">
                      {st}
                    </span>
                  ))}
                </div>
              </div>
              <div className="justified-gallery">
                {DB.filter(p => p.journeyId === selectedJourney.id).map(photo => (
                  <PhotoCard lang={lang} key={photo.id} photo={photo} onClick={(id) => setSelectedPhoto(DB.find(p => p.id === id) || null)} />
                ))}
              </div>
              <CommentSection targetId={selectedJourney.id} targetType="journey" />
            </motion.section>
          )}

          {currentSection === 'explore' && (
            <motion.section key="explore" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="container mx-auto px-6 py-12">
              <div className="max-w-3xl mx-auto mb-16">
                <div className="relative mb-8 group">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-secondary group-focus-within:text-brand-primary transition-colors" size={20} />
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={s.labels.search} className="w-full pl-16 pr-6 py-6 bg-neutral-50 border-none rounded-2xl text-xl font-light focus:ring-2 focus:ring-brand-primary/10 transition-all outline-none" />
                </div>
                
                <div className="mb-10 bg-neutral-50 p-6 md:p-8 rounded-3xl border border-neutral-100">
                  <div className="flex flex-col items-center mb-8">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-brand-accent mb-4 text-center">
                      {lang === 'es' ? 'Modo de combinación de Hashtags' : lang === 'en' ? 'Hashtag Combination Mode' : 'Mode de combinació de Hashtags'}
                    </h3>
                    <div className="bg-white p-1.5 rounded-full flex items-center shadow-sm border border-neutral-200 w-full max-w-md relative">
                      <button 
                        onClick={() => setFilterLogic('and')}
                        className={cn("flex-1 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all z-10", filterLogic === 'and' ? "text-white" : "text-brand-secondary hover:text-brand-accent")}
                      >
                        {lang === 'es' ? 'Todas (Y)' : lang === 'en' ? 'All (AND)' : 'Totes (I)'}
                      </button>
                      <button 
                        onClick={() => setFilterLogic('or')}
                        className={cn("flex-1 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all z-10", filterLogic === 'or' ? "text-white" : "text-brand-secondary hover:text-brand-accent")}
                      >
                        {lang === 'es' ? 'Cualquiera (O)' : lang === 'en' ? 'Any (OR)' : 'Qualsevol (O)'}
                      </button>
                      <div className={cn("absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-brand-accent rounded-full transition-all duration-300 ease-in-out", filterLogic === 'and' ? "left-1.5" : "left-[calc(50%+3px)]")} />
                    </div>
                    <p className="mt-6 text-sm text-brand-secondary font-light text-center max-w-lg leading-relaxed">
                      {filterLogic === 'and' 
                        ? (lang === 'es' ? 'Se mostrarán las fotos que tengan TODOS los hashtags a la vez. Es decir, la foto debe tener el hashtag #1 Y el #2 Y el #3.' : lang === 'en' ? 'Showing photos that have ALL selected hashtags at once. The photo must have #1 AND #2 AND #3.' : 'Es mostraran les fotos que tinguin TOTS els hashtags alhora. És a dir, la foto ha de tenir el hashtag #1 I el #2 I el #3.')
                        : (lang === 'es' ? 'Se mostrarán las fotos que tengan CUALQUIERA de los hashtags. Es decir, la foto puede tener el hashtag #1 O el #2 O el #3.' : lang === 'en' ? 'Showing photos that have ANY of the selected hashtags. The photo can have #1 OR #2 OR #3.' : 'Es mostraran les fotos que tinguin QUALSEVOL dels hashtags. És a dir, la foto pot tenir el hashtag #1 O el #2 O el #3.')}
                    </p>
                  </div>

                  {activeFilters.size > 0 && (
                    <div className="mb-8 p-6 bg-white rounded-2xl border border-neutral-200 text-center shadow-sm">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-brand-secondary block mb-4">
                        {lang === 'es' ? 'Buscando fotos que contengan:' : lang === 'en' ? 'Searching photos containing:' : 'Buscant fotos que continguin:'}
                      </span>
                      <div className="text-brand-primary font-mono text-sm md:text-base font-bold flex flex-wrap justify-center items-center gap-2">
                        {Array.from(activeFilters).map((t, i, arr) => (
                          <React.Fragment key={t}>
                            <span className="bg-brand-primary/10 px-3 py-1.5 rounded-lg">#{t}</span>
                            {i < arr.length - 1 && (
                              <span className="text-brand-accent px-2 text-xs">
                                {filterLogic === 'and' ? (lang === 'en' ? 'AND' : lang === 'ca' ? 'I' : 'Y') : (lang === 'en' ? 'OR' : 'O')}
                              </span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap justify-center gap-2">
                    {allTags.map(tag => (
                      <button key={tag} onClick={() => toggleFilter(tag)} className={cn("px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border", activeFilters.has(tag) ? "bg-brand-primary text-white border-brand-primary shadow-md" : "bg-white text-brand-secondary border-neutral-200 hover:border-brand-primary hover:text-brand-primary")}>#{tag}</button>
                    ))}
                  </div>
                </div>
              </div>
              {photosLoading && filteredPhotos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 gap-6">
                  <motion.div
                    animate={{ scale: [0.8, 1.2, 0.8], rotate: [0, 180, 360] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="text-[#B45309]"
                  >
                    <Aperture size={32} strokeWidth={1.5} />
                  </motion.div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-brand-secondary animate-pulse">
                    {lang === 'es' ? 'Cargando archivo...' : lang === 'en' ? 'Loading archive...' : 'Carregant arxiu...'}
                  </p>
                </div>
              ) : (
                <div className="justified-gallery">
                  {filteredPhotos.map(photo => (
                    <PhotoCard lang={lang} key={photo.id} photo={photo} onClick={(id) => setSelectedPhoto(DB.find(p => p.id === id) || null)} />
                  ))}
                </div>
              )}
            </motion.section>
          )}

          {currentSection === 'favorites' && (
            <motion.section key="favorites" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="container mx-auto px-6 py-12">
              <div className="text-center mb-16">
                <h1 className="text-5xl font-serif italic mb-8">{s.titles.fav}</h1>
              </div>
              {loading && DB.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 gap-6">
                  <motion.div
                    animate={{ scale: [0.8, 1.2, 0.8], rotate: [0, 180, 360] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="text-[#B45309]"
                  >
                    <Aperture size={32} strokeWidth={1.5} />
                  </motion.div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-brand-secondary animate-pulse">
                    {lang === 'es' ? 'Cargando archivo...' : lang === 'en' ? 'Loading archive...' : 'Carregant arxiu...'}
                  </p>
                </div>
              ) : (
                <div className="justified-gallery">
                  {DB.filter(p => p.isFavorite).sort((a,b) => (b.favoriteScore || 0) - (a.favoriteScore || 0)).slice(0, 40).map(photo => (
                    <PhotoCard lang={lang} key={photo.id} photo={photo} onClick={(id) => setSelectedPhoto(DB.find(p => p.id === id) || null)} />
                  ))}
                </div>
              )}
            </motion.section>
          )}

          {currentSection === 'latest' && (
            <motion.section key="latest" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="container mx-auto px-6 py-12">
              <div className="text-center mb-16">
                <h1 className="text-5xl font-serif italic mb-4">{lang === 'es' ? 'Últimas 50' : lang === 'ca' ? 'Últimes 50' : 'Latest 50'}</h1>
                <p className="text-brand-secondary font-light">
                  {lang === 'es' ? 'Las últimas capturas publicadas' : lang === 'ca' ? 'Les últimes captures publicades' : 'The latest published captures'}
                </p>
              </div>
              {loading && DB.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 gap-6">
                  <motion.div
                    animate={{ scale: [0.8, 1.2, 0.8], rotate: [0, 180, 360] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="text-[#B45309]"
                  >
                    <Aperture size={32} strokeWidth={1.5} />
                  </motion.div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-brand-secondary animate-pulse">
                    {lang === 'es' ? 'Cargando archivo...' : lang === 'en' ? 'Loading archive...' : 'Carregant arxiu...'}
                  </p>
                </div>
              ) : (
                <div className="justified-gallery">
                  {DB.slice(0, 50).map(photo => (
                    <PhotoCard lang={lang} key={photo.id} photo={photo} onClick={(id) => setSelectedPhoto(DB.find(p => p.id === id) || null)} />
                  ))}
                </div>
              )}
            </motion.section>
          )}

          {currentSection === 'lfi' && (
            <motion.section key="lfi" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="container mx-auto px-6 py-12">
              <div className="text-center mb-16">
                <h1 className="text-6xl font-serif italic mb-4 tracking-tighter">LFI Gallery</h1>
                <p className="text-brand-secondary font-light mb-12">{s.subtitles.lfi}</p>
                <div className="flex justify-center gap-4 mb-12">
                  {['all', 'lfimastershot', 'lfiexhibition', 'lfi-picture-of-the-week'].map(type => (
                    <button key={type} onClick={() => setLfiFilter(type as any)} className={cn("px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border", lfiFilter === type ? "bg-leica-red text-white border-leica-red" : "bg-white text-brand-secondary border-neutral-200 hover:border-leica-red hover:text-leica-red")}>
                      {type === 'all' ? (lang === 'es' ? 'Todo LFI' : lang === 'ca' ? 'Tot LFI' : 'All LFI') : 
                       type === 'lfimastershot' ? 'Mastershot' : 
                       type === 'lfiexhibition' ? 'Exhibition' : 
                       'Picture of the Week'}
                    </button>
                  ))}
                </div>
              </div>
              {loading && DB.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 gap-6">
                  <motion.div
                    animate={{ scale: [0.8, 1.2, 0.8], rotate: [0, 180, 360] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="text-[#B45309]"
                  >
                    <Aperture size={32} strokeWidth={1.5} />
                  </motion.div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-brand-secondary animate-pulse">
                    {lang === 'es' ? 'Cargando archivo...' : lang === 'en' ? 'Loading archive...' : 'Carregant arxiu...'}
                  </p>
                </div>
              ) : (
                <div className="justified-gallery">
                  {currentPhotoList.map(photo => (
                    <PhotoCard lang={lang} key={photo.id} photo={photo} onClick={(id) => setSelectedPhoto(DB.find(p => p.id === id) || null)} />
                  ))}
                </div>
              )}
            </motion.section>
          )}

          {currentSection === 'about' && (
            <motion.section key="about" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="container mx-auto px-6 py-12">
              <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-16 items-center">
                {/* Mobile Header */}
                <div className="md:hidden text-center space-y-4 w-full">
                  <h1 className="text-5xl font-serif italic tracking-tighter">Pep Amores</h1>
                  <p className="text-lg text-brand-primary font-serif italic">
                    {lang === 'es' ? 'Emprendedor y Fotógrafo' : lang === 'ca' ? 'Emprenedor i Fotògraf' : 'Entrepreneur & Photographer'}
                  </p>
                </div>

                <div className="flex-1 aspect-[1198/1245] rounded-3xl overflow-hidden shadow-2xl w-full">
                  <img src="https://i.imgur.com/diHGiy8.jpg" alt="Pep Amores" className="w-full h-full object-cover" />
                </div>
                
                <div className="flex-1 space-y-8">
                  {/* Desktop Header */}
                  <div className="hidden md:block space-y-8">
                    <h1 className="text-6xl font-serif italic tracking-tighter">Pep Amores</h1>
                    <p className="text-xl text-brand-primary font-serif italic">
                      {lang === 'es' ? 'Emprendedor y Fotógrafo' : lang === 'ca' ? 'Emprenedor i Fotògraf' : 'Entrepreneur & Photographer'}
                    </p>
                  </div>
                  
                  <div className="space-y-4 text-brand-secondary font-light leading-relaxed text-sm">
                    <p>
                      {lang === 'es' ? 'La vida es corta. Extrañamente corta. Y cuanto más lo pienso, más consciente soy de lo poco que sabemos sobre ella. No sé por qué existimos ni qué ocurre cuando dejamos de hacerlo. Esa incertidumbre, lejos de inquietarme, siempre me ha empujado a vivir con intensidad y a intentar estar presente en cada etapa del camino.' :
                       lang === 'en' ? 'Life is short. Strangely short. And the more I think about it, the more aware I am of how little we know about it. I don\'t know why we exist or what happens when we cease to do so. That uncertainty, far from unsettling me, has always pushed me to live with intensity and try to be present at every stage of the journey.' :
                       'La vida és curta. Estranyament curta. I com més hi penso, més conscient sóc del poc que en sabem. No sé per què existim ni què passa quan deixem de fer-ho. Aquesta incertesa, lluny d\'inquietar-me, sempre m\'ha empès a viure amb intensitat i a intentar estar present en cada etapa del camí.'}
                    </p>
                    <p>
                      {lang === 'es' ? 'Quizá por eso he sido emprendedor toda mi vida. He creado empresas en el sector tecnológico y también produzco películas. Siempre he sentido la necesidad de construir, de explorar, de transformar ideas e inquietudes en algo real.' :
                       lang === 'en' ? 'Perhaps that is why I have been an entrepreneur all my life. I have created companies in the technology sector and I also produce films. I have always felt the need to build, to explore, to transform ideas and concerns into something real.' :
                       'Potser per això he estat emprenedor tota la meva vida. He creat empreses en el sector tecnològic i també produeixo pel·lícules. Sempre he sentit la necessitat de construir, d\'explorar, de transformar idees i inquietuds en alguna cosa real.'}
                    </p>
                    <p>
                      {lang === 'es' ? 'Pero hay una parte más íntima de ese impulso creativo que encuentra su lugar en la fotografía.' :
                       lang === 'en' ? 'But there is a more intimate part of that creative impulse that finds its place in photography.' :
                       'Però hi ha una part més íntima d\'aquest impuls creatiu que troba el seu lloc en la fotografia.'}
                    </p>
                    <p>
                      {lang === 'es' ? 'Fotografiar es, para mí, una forma de mirar el mundo con más atención. De detener el tiempo por un instante y de atrapar aquello que normalmente pasa desapercibido: una luz que aparece de forma inesperada, una mirada fugaz, una emoción que apenas dura unos segundos.' :
                       lang === 'en' ? 'Photographing is, for me, a way of looking at the world with more attention. Of stopping time for an instant and catching what normally goes unnoticed: a light that appears unexpectedly, a fleeting glance, an emotion that barely lasts a few seconds.' :
                       'Fotografiar és, per a mi, una manera de mirar el món amb més atenció. D\'aturar el temps per un instant i d\'atrapar allò que normalment passa desapercebut: una llum que apareix de manera inesperada, una mirada fugaç, una emoció que amb prou feines dura uns segons.'}
                    </p>
                    <p>
                      {lang === 'es' ? 'La cámara se convierte entonces en una forma de canalizar inquietudes artísticas y emocionales. Un espacio de libertad donde no hay estrategia ni objetivo más allá de observar, sentir y crear.' :
                       lang === 'en' ? 'The camera then becomes a way to channel artistic and emotional concerns. A space of freedom where there is no strategy or objective beyond observing, feeling, and creating.' :
                       'La càmera es converteix llavors en una manera de canalitzar inquietuds artístiques i emocionals. Un espai de llibertat on no hi ha estratègia ni objectiu més enllà d\'observar, sentir i crear.'}
                    </p>
                    <p>
                      {lang === 'es' ? 'También creo profundamente en el aprendizaje continuo. Me gusta aprender de quienes saben más que yo. La humildad es tan necesaria para crecer como la ambición. Por eso participo siempre que puedo en talleres con fotógrafos a los que admiro.' :
                       lang === 'en' ? 'I also believe deeply in continuous learning. I like to learn from those who know more than I do. Humility is as necessary to grow as ambition. That is why I participate whenever I can in workshops with photographers I admire.' :
                       'També crec profundament en l\'aprenentatge continu. M\'agrada aprendre dels que en saben més que jo. La humilitat és tan necessària per créixer com l\'ambició. Per això participo sempre que puc en tallers amb fotògrafs als quals admiro.'}
                    </p>
                    <p>
                      {lang === 'es' ? 'He tenido la suerte de compartir aprendizaje con Thorsten Overgaard, Todd Hido, Tino Soriano, Gabriel Brau, César Viera, Javier Alonso, Eugenia Hanganu y Joan Boira. Y pronto tendré la oportunidad de hacerlo también con Steve McCurry.' :
                       lang === 'en' ? 'I have been lucky enough to share learning with Thorsten Overgaard, Todd Hido, Tino Soriano, Gabriel Brau, César Viera, Javier Alonso, Eugenia Hanganu, and Joan Boira. And soon I will have the opportunity to do so with Steve McCurry as well.' :
                       'He tingut la sort de compartir aprenentatge amb Thorsten Overgaard, Todd Hido, Tino Soriano, Gabriel Brau, César Viera, Javier Alonso, Eugenia Hanganu i Joan Boira. I aviat tindré l\'oportunitat de fer-ho també amb Steve McCurry.'}
                    </p>
                    <p>
                      {lang === 'es' ? 'Intento vivir de la forma más consciente posible. Disfrutar de mi familia, de mis amigos, de las personas que me rodean. De conversaciones largas a conversaciones que dejan huella, de los viajes, de los pequeños momentos que muchas veces pasan desapercibidos.' :
                       lang === 'en' ? 'I try to live as consciously as possible. To enjoy my family, my friends, the people around me. From long conversations to conversations that leave a mark, trips, the small moments that often go unnoticed.' :
                       'Intento viure de la manera més conscient possible. Gaudir de la meva família, dels meus amics, de les persones que m\'envolten. De converses llargues a converses que deixen petjada, dels viatges, dels petits moments que moltes vegades passen desapercebuts.'}
                    </p>
                    <p>
                      {lang === 'es' ? 'Porque, al final, la vida está hecha precisamente de eso: de instantes breves y valiosos.' :
                       lang === 'en' ? 'Because, in the end, life is made precisely of that: brief and valuable moments.' :
                       'Perquè, al final, la vida està feta precisament d\'això: d\'instants breus i valuosos.'}
                    </p>
                    <p className="font-medium italic">
                      {lang === 'es' ? 'La fotografía es mi manera de prestarle atención.' :
                       lang === 'en' ? 'Photography is my way of paying attention to it.' :
                       'La fotografia és la meva manera de prestar-hi atenció.'}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-8 pt-8 border-t border-neutral-100">
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-widest mb-2">
                        {lang === 'es' ? 'Equipo' : lang === 'ca' ? 'Equip' : 'Gear'}
                      </h4>
                      <p className="text-sm font-mono text-brand-secondary">Leica SL3<br />Leica Q3</p>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-widest mb-2">
                        {lang === 'es' ? 'Base' : lang === 'ca' ? 'Base' : 'Based in'}
                      </h4>
                      <p className="text-sm font-mono text-brand-secondary">Barcelona, Spain</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {currentSection === 'contact' && (
            <motion.section key="contact" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="container mx-auto px-6 py-12">
              <div className="max-w-xl mx-auto">
                <div className="text-center mb-12">
                  <h1 className="text-5xl font-serif italic mb-4">{s.titles.contact}</h1>
                </div>
                <form onSubmit={handleContactSubmit} className="glass p-8 md:p-12 rounded-3xl shadow-2xl space-y-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-secondary">{s.labels.name}</label>
                    <input 
                      type="text" 
                      value={contactForm.name}
                      onChange={e => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-neutral-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-brand-primary/10 transition-all outline-none" 
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-secondary">Email</label>
                    <input 
                      type="email" 
                      value={contactForm.email}
                      onChange={e => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full bg-neutral-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-brand-primary/10 transition-all outline-none" 
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-secondary">{s.labels.msg}</label>
                    <textarea 
                      rows={5} 
                      value={contactForm.message}
                      onChange={e => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                      className="w-full bg-neutral-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-brand-primary/10 transition-all outline-none resize-none" 
                      required
                    />
                  </div>
                  <div className="flex justify-center">
                    <FlowButton 
                      type="submit"
                      disabled={isSending}
                      text={isSending ? (lang === 'es' ? 'Enviando...' : 'Sending...') : s.labels.send}
                    />
                  </div>
                </form>
                <CommentSection targetId="guestbook" targetType="guestbook" />
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      <Lightbox lang={lang} photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} onNext={handleNext} onPrev={handlePrev} />

      <Footer onNavigate={(id) => { setCurrentSection(id); setSelectedJourney(null); window.scrollTo(0,0); }} lang={lang} />
    </div>
  );
}

// --- Admin Panel ---

const PepPanel = () => {
  const { photos } = usePhotos();
  const { journeys } = useJourneys();
  const [comments, setComments] = useState<any[]>([]);
  const [editors, setEditors] = useState<any[]>([]);
  const [newEditorEmail, setNewEditorEmail] = useState('');
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      if (!auth.currentUser || !auth.currentUser.email) {
        setIsAuthorized(false);
        return;
      }
      
      const hardcodedAdmins = ['eduard.kun115@gmail.com', 'pep.amores@gmail.com'];
      if (hardcodedAdmins.includes(auth.currentUser.email)) {
        setIsAuthorized(true);
        return;
      }

      try {
        const { doc, getDoc } = await import('firebase/firestore');
        const editorDoc = await getDoc(doc(db, 'editors', auth.currentUser.email));
        setIsAuthorized(editorDoc.exists());
      } catch (error) {
        console.error("Error checking editor status:", error);
        setIsAuthorized(false);
      }
    };

    checkAuth();
  }, [auth.currentUser]);

  useEffect(() => {
    if (!isAuthorized) return;
    const q = query(collection(db, 'comments'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snap) => setComments(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
  }, [isAuthorized]);

  useEffect(() => {
    if (!isAuthorized) return;
    const q = query(collection(db, 'editors'));
    return onSnapshot(q, (snap) => setEditors(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
  }, [isAuthorized]);

  const handleAddEditor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEditorEmail) return;
    try {
      // We use the email as the document ID for the editors collection
      const { doc, setDoc } = await import('firebase/firestore');
      await setDoc(doc(db, 'editors', newEditorEmail.toLowerCase()), {
        addedAt: serverTimestamp(),
        addedBy: auth.currentUser?.email
      });
      setNewEditorEmail('');
      alert('Editor añadido correctamente.');
    } catch (error: any) {
      alert('Error al añadir editor: ' + error.message);
    }
  };

  const handleRemoveEditor = async (email: string) => {
    if (confirm(`¿Seguro que quieres eliminar a ${email} como editor?`)) {
      try {
        const { doc, deleteDoc } = await import('firebase/firestore');
        await deleteDoc(doc(db, 'editors', email));
      } catch (error: any) {
        alert('Error al eliminar editor: ' + error.message);
      }
    }
  };

  if (isAuthorized === null) {
    return <div className="p-20 text-center">Verificando permisos...</div>;
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 p-4 text-center">
        <h1 className="text-3xl font-serif italic mb-2">Acceso Denegado</h1>
        <p className="text-gray-500 mb-8 max-w-md">Tu cuenta no tiene permisos para acceder a este panel.</p>
        <Link to="/" className="px-8 py-4 bg-black text-white rounded-2xl font-medium hover:bg-zinc-800 transition-all">
          Volver al Inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 p-8 md:p-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-serif italic">Panel Privado de Pep</h1>
          <Link to="/admin" className="px-6 py-2 bg-white rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm hover:shadow-md transition-all">Gestionar Fotos</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {[
            { label: 'Total Fotos', value: photos.length, icon: ImageIcon },
            { label: 'Viajes', value: journeys.length, icon: MapPin },
            { label: 'Comentarios', value: comments.length, icon: MessageSquare },
          ].map(stat => (
            <div key={stat.label} className="bg-white p-8 rounded-3xl shadow-sm">
              <stat.icon className="text-brand-accent mb-4" size={24} />
              <p className="text-[10px] font-bold uppercase tracking-widest text-brand-secondary mb-1">{stat.label}</p>
              <p className="text-3xl font-serif italic">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-3xl shadow-sm lg:col-span-2">
            <h3 className="text-xl font-serif italic mb-6">Moderación de Comentarios</h3>
            <div className="space-y-4">
              {comments.filter(c => !c.isApproved).map(c => (
                <div key={c.id} className="p-4 bg-neutral-50 rounded-2xl flex justify-between items-start">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest mb-1">{c.userName} <span className="text-brand-secondary font-normal">en {c.targetType}</span></p>
                    <p className="text-sm text-brand-secondary">{c.text}</p>
                  </div>
                  <button 
                    onClick={async () => {
                      try {
                        const { doc, updateDoc } = await import('firebase/firestore');
                        await updateDoc(doc(db, 'comments', c.id), { isApproved: true });
                      } catch (error: any) {
                        alert('Error al aprobar comentario: ' + error.message);
                      }
                    }}
                    className="text-brand-accent hover:underline text-[10px] font-bold uppercase tracking-widest"
                  >
                    Aprobar
                  </button>
                </div>
              ))}
              {comments.filter(c => !c.isApproved).length === 0 && <p className="text-sm text-brand-secondary italic">No hay comentarios pendientes.</p>}
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm">
              <h3 className="text-xl font-serif italic mb-6">Top Fotos (Favoritas)</h3>
              <div className="space-y-4">
                {photos.filter(p => p.isFavorite).sort((a,b) => (b.favoriteScore || 0) - (a.favoriteScore || 0)).slice(0, 5).map(p => (
                  <div key={p.id} className="flex items-center gap-4">
                    <img src={p.url} className="w-12 h-12 rounded-lg object-cover" />
                    <div className="flex-1">
                      <p className="text-sm font-bold truncate">{p.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm">
              <h3 className="text-xl font-serif italic mb-6 flex items-center gap-2">
                <User size={20} />
                Editores
              </h3>
              <p className="text-xs text-brand-secondary mb-4">Añade el email de Google de las personas que quieras que puedan subir fotos.</p>
              
              <form onSubmit={handleAddEditor} className="flex gap-2 mb-6">
                <input 
                  type="email" 
                  value={newEditorEmail}
                  onChange={(e) => setNewEditorEmail(e.target.value)}
                  placeholder="email@gmail.com"
                  className="flex-1 bg-neutral-50 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-brand-primary/10 outline-none"
                />
                <button type="submit" className="px-4 py-2 bg-black text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-zinc-800">
                  Añadir
                </button>
              </form>

              <div className="space-y-2">
                <div className="flex justify-between items-center p-3 bg-neutral-50 rounded-xl">
                  <span className="text-sm font-medium">eduard.kun115@gmail.com</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-brand-accent">Propietario</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-neutral-50 rounded-xl">
                  <span className="text-sm font-medium">pep.amores@gmail.com</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-brand-accent">Propietario</span>
                </div>
                {editors.map(editor => (
                  <div key={editor.id} className="flex justify-between items-center p-3 bg-neutral-50 rounded-xl">
                    <span className="text-sm">{editor.id}</span>
                    <button 
                      onClick={() => handleRemoveEditor(editor.id)}
                      className="text-[10px] font-bold uppercase tracking-widest text-red-500 hover:underline"
                    >
                      Eliminar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/pep-panel" element={<PepPanel />} />
          <Route path="/" element={<Gallery />} />
          <Route path="*" element={<Gallery />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
