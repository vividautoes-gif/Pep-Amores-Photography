import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { Login } from '../components/Admin/Login';
import { UploadForm } from '../components/Admin/UploadForm';
import { motion } from 'motion/react';
import { LogOut, LayoutDashboard, Image as ImageIcon, Settings, User, MapPin, Clock, ShieldAlert, Layers, Hash, Star, Award, Mail, MessageSquare, BarChart3 } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { JourneyForm } from '../components/Admin/JourneyForm';
import { HeroSelector } from '../components/Admin/HeroSelector';
import { AlbumForm } from '../components/Admin/AlbumForm';
import { PhotoManager } from '../components/Admin/PhotoManager';
import { JourneyManager } from '../components/Admin/JourneyManager';
import { AlbumManager } from '../components/Admin/AlbumManager';
import { TagManager } from '../components/Admin/TagManager';
import { FavoritesManager } from '../components/Admin/FavoritesManager';
import { RecentPhotosManager } from '../components/Admin/RecentPhotosManager';
import { LFIManager } from '../components/Admin/LFIManager';
import { AboutMeEditor } from '../components/Admin/AboutMeEditor';
import { ContactMessages } from '../components/Admin/ContactMessages';
import { ReviewManager } from '../components/Admin/ReviewManager';
import { HomeCollectionsManager } from '../components/Admin/HomeCollectionsManager';
import { SessionManager } from '../components/Admin/SessionManager';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

export const AdminPage: React.FC = () => {
  const [user, loading] = useAuthState(auth);
  const [activeTab, setActiveTab] = useState<'photos' | 'journeys' | 'hero' | 'albums' | 'manage-photos' | 'manage-journeys' | 'manage-albums' | 'manage-tags' | 'manage-favorites' | 'manage-recent' | 'manage-lfi' | 'manage-about' | 'manage-messages' | 'manage-home-collections' | 'manage-reviews' | 'manage-sessions'>('photos');
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [visitorCount, setVisitorCount] = useState<number>(0);

  useEffect(() => {
    if (!isAuthorized) return;
    const unsub = onSnapshot(doc(db, 'stats', 'visitors'), (docSnap) => {
      if (docSnap.exists()) {
        setVisitorCount(docSnap.data().count || 0);
      }
    });
    return () => unsub();
  }, [isAuthorized]);

  useEffect(() => {
    const checkAuth = async () => {
      if (!user || !user.email) {
        setIsAuthorized(false);
        return;
      }
      
      const hardcodedAdmins = ['eduard.kun115@gmail.com', 'pep.amores@gmail.com', 'pepamores@gmail.com'];
      if (hardcodedAdmins.includes(user.email)) {
        setIsAuthorized(true);
        return;
      }

      try {
        const editorDoc = await getDoc(doc(db, 'editors', user.email));
        setIsAuthorized(editorDoc.exists());
      } catch (error) {
        console.error("Error checking editor status:", error);
        setIsAuthorized(false);
      }
    };

    if (user) {
      checkAuth();
    }
  }, [user]);

  if (loading || (user && isAuthorized === null)) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-[#E4E3E0]">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-4 border-black border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  if (isAuthorized === false) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-[#E4E3E0] p-4 text-center">
        <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-red-600/20">
          <ShieldAlert className="text-white w-8 h-8" />
        </div>
        <h1 className="text-3xl font-serif italic mb-2">Acceso Denegado</h1>
        <p className="text-gray-500 mb-8 max-w-md">Tu cuenta ({user.email}) no tiene permisos de administrador para acceder a este panel.</p>
        <button onClick={() => signOut(auth)} className="px-8 py-4 bg-black text-white rounded-2xl font-medium hover:bg-zinc-800 transition-all">
          Cerrar Sesión y volver
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#E4E3E0]">
      {/* Admin Header */}
      <header className="bg-neutral-50/50 backdrop-blur-xl border-bottom border-black/5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white">
              <LayoutDashboard size={20} />
            </div>
            <div>
              <h1 className="font-serif italic text-xl">Panel de Control</h1>
              <p className="text-[10px] uppercase tracking-widest text-gray-400">Pep Amores Photography</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full text-sm font-medium">
              <User size={14} />
              <span>{visitorCount} Visitas</span>
            </div>
            <Link to="/pep-panel" className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black flex items-center gap-2">
              <LayoutDashboard size={14} />
              Dashboard
            </Link>
            <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-white rounded-full border border-black/5">
              <div className="w-6 h-6 bg-zinc-200 rounded-full flex items-center justify-center">
                <User size={12} className="text-gray-500" />
              </div>
              <span className="text-sm font-medium">{user.displayName || user.email}</span>
            </div>
            <button 
              onClick={() => signOut(auth)}
              className="p-3 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all group"
              title="Cerrar Sesión"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-1 space-y-2">
            <nav className="space-y-1">
              <button 
                onClick={() => setActiveTab('photos')}
                className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all", activeTab === 'photos' ? "bg-black text-white" : "text-gray-500 hover:bg-white")}
              >
                <ImageIcon size={18} />
                Subir Fotos
              </button>
              <button 
                onClick={() => setActiveTab('journeys')}
                className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all", activeTab === 'journeys' ? "bg-black text-white" : "text-gray-500 hover:bg-white")}
              >
                <MapPin size={18} />
                Gestionar Viajes
              </button>
              <button 
                onClick={() => setActiveTab('hero')}
                className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all", activeTab === 'hero' ? "bg-black text-white" : "text-gray-500 hover:bg-white")}
              >
                <ImageIcon size={18} />
                Fotos del Hero
              </button>
              <button 
                onClick={() => setActiveTab('albums')}
                className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all", activeTab === 'albums' ? "bg-black text-white" : "text-gray-500 hover:bg-white")}
              >
                <Layers size={18} />
                Colecciones
              </button>
              <button 
                onClick={() => setActiveTab('manage-photos')}
                className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all", activeTab === 'manage-photos' ? "bg-black text-white" : "text-gray-500 hover:bg-white")}
              >
                <ImageIcon size={18} />
                Gestionar Fotos
              </button>
              <button 
                onClick={() => setActiveTab('manage-journeys')}
                className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all", activeTab === 'manage-journeys' ? "bg-black text-white" : "text-gray-500 hover:bg-white")}
              >
                <MapPin size={18} />
                Gestionar Viajes
              </button>
              <button 
                onClick={() => setActiveTab('manage-albums')}
                className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all", activeTab === 'manage-albums' ? "bg-black text-white" : "text-gray-500 hover:bg-white")}
              >
                <Layers size={18} />
                Gestionar Álbumes
              </button>
              <button 
                onClick={() => setActiveTab('manage-tags')}
                className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all", activeTab === 'manage-tags' ? "bg-black text-white" : "text-gray-500 hover:bg-white")}
              >
                <Hash size={18} />
                Gestionar Hashtags
              </button>
              <button 
                onClick={() => setActiveTab('manage-favorites')}
                className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all", activeTab === 'manage-favorites' ? "bg-black text-white" : "text-gray-500 hover:bg-white")}
              >
                <Star size={18} />
                Gestionar Favoritas
              </button>
              <button 
                onClick={() => setActiveTab('manage-recent')}
                className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all", activeTab === 'manage-recent' ? "bg-black text-white" : "text-gray-500 hover:bg-white")}
              >
                <Clock size={18} />
                Últimas
              </button>
              <button 
                onClick={() => setActiveTab('manage-lfi')}
                className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all", activeTab === 'manage-lfi' ? "bg-black text-white" : "text-gray-500 hover:bg-white")}
              >
                <Award size={18} />
                Gestionar LFI
              </button>
              <button 
                onClick={() => setActiveTab('manage-about')}
                className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all", activeTab === 'manage-about' ? "bg-black text-white" : "text-gray-500 hover:bg-white")}
              >
                <User size={18} />
                Sobre Mí
              </button>
              <button 
                onClick={() => setActiveTab('manage-home-collections')}
                className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all", activeTab === 'manage-home-collections' ? "bg-black text-white" : "text-gray-500 hover:bg-white")}
              >
                <Layers size={18} />
                Home Colecciones
              </button>
              <button 
                onClick={() => setActiveTab('manage-messages')}
                className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all", activeTab === 'manage-messages' ? "bg-black text-white" : "text-gray-500 hover:bg-white")}
              >
                <Mail size={18} />
                Mensajes
              </button>
              <button 
                onClick={() => setActiveTab('manage-reviews')}
                className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all", activeTab === 'manage-reviews' ? "bg-black text-white" : "text-gray-500 hover:bg-white")}
              >
                <MessageSquare size={18} />
                Reseñas
              </button>
              <button 
                onClick={() => setActiveTab('manage-sessions')}
                className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all", activeTab === 'manage-sessions' ? "bg-black text-white" : "text-gray-500 hover:bg-white")}
              >
                <BarChart3 size={18} />
                Estadísticas
              </button>
            </nav>
          </aside>

          {/* Main Content Area */}
          <section className="lg:col-span-3">
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-50/50 backdrop-blur-sm rounded-[2.5rem] p-8 lg:p-12 border border-white shadow-sm"
            >
              <div className="mb-12">
                <h2 className="text-3xl font-serif italic mb-2">
                  {activeTab === 'photos' && 'Nueva Publicación'}
                  {activeTab === 'journeys' && 'Nuevo Viaje'}
                  {activeTab === 'hero' && 'Fotos del Hero'}
                  {activeTab === 'albums' && 'Nueva Colección'}
                  {activeTab === 'manage-photos' && 'Gestionar Fotos'}
                  {activeTab === 'manage-journeys' && 'Gestionar Viajes'}
                  {activeTab === 'manage-albums' && 'Gestionar Álbumes'}
                  {activeTab === 'manage-tags' && 'Gestionar Hashtags'}
                  {activeTab === 'manage-favorites' && 'Gestionar Favoritas'}
                  {activeTab === 'manage-recent' && 'Últimas'}
                  {activeTab === 'manage-lfi' && 'Gestionar LFI'}
                  {activeTab === 'manage-about' && 'Sobre Mí'}
                  {activeTab === 'manage-home-collections' && 'Home Colecciones'}
                  {activeTab === 'manage-messages' && 'Mensajes'}
                  {activeTab === 'manage-reviews' && 'Gestionar Reseñas'}
                  {activeTab === 'manage-sessions' && 'Estadísticas de Visitas'}
                </h2>
                <p className="text-gray-500">
                  {activeTab === 'photos' && 'Sube una imagen y completa los metadatos.'}
                  {activeTab === 'journeys' && 'Crea un nuevo viaje para agrupar tus fotografías.'}
                  {activeTab === 'hero' && 'Selecciona qué fotos quieres que aparezcan en la galería 3D.'}
                  {activeTab === 'albums' && 'Crea una nueva colección de álbumes.'}
                  {activeTab === 'manage-photos' && 'Edita o elimina tus fotografías.'}
                  {activeTab === 'manage-journeys' && 'Edita o elimina tus viajes.'}
                  {activeTab === 'manage-albums' && 'Edita o elimina tus colecciones.'}
                  {activeTab === 'manage-tags' && 'Renombra hashtags en toda la galería.'}
                  {activeTab === 'manage-favorites' && 'Reordena tus fotos favoritas.'}
                  {activeTab === 'manage-recent' && 'Revisa las últimas 50 fotos subidas.'}
                  {activeTab === 'manage-lfi' && 'Gestionar reconocimientos LFI.'}
                  {activeTab === 'manage-about' && 'Edita tu biografía y perfil.'}
                  {activeTab === 'manage-home-collections' && 'Selecciona las 4 fotos para cada álbum de la Home.'}
                  {activeTab === 'manage-messages' && 'Lee los mensajes recibidos.'}
                  {activeTab === 'manage-reviews' && 'Aprobar o eliminar reseñas de clientes.'}
                  {activeTab === 'manage-sessions' && 'Analiza de dónde vienen tus visitantes y qué dispositivos usan.'}
                </p>
              </div>
              
              {activeTab === 'photos' && <UploadForm />}
              {activeTab === 'journeys' && <JourneyForm />}
              {activeTab === 'hero' && <HeroSelector />}
              {activeTab === 'albums' && <AlbumForm />}
              {activeTab === 'manage-photos' && <PhotoManager />}
              {activeTab === 'manage-journeys' && <JourneyManager />}
              {activeTab === 'manage-albums' && <AlbumManager />}
              {activeTab === 'manage-tags' && <TagManager />}
              {activeTab === 'manage-favorites' && <FavoritesManager />}
              {activeTab === 'manage-recent' && <RecentPhotosManager />}
              {activeTab === 'manage-lfi' && <LFIManager />}
              {activeTab === 'manage-about' && <AboutMeEditor />}
              {activeTab === 'manage-home-collections' && <HomeCollectionsManager />}
              {activeTab === 'manage-messages' && <ContactMessages />}
              {activeTab === 'manage-reviews' && <ReviewManager />}
              {activeTab === 'manage-sessions' && <SessionManager />}
            </motion.div>
          </section>
        </div>
      </main>
    </div>
  );
};
