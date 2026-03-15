import React, { useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import { Login } from '../components/Admin/Login';
import { UploadForm } from '../components/Admin/UploadForm';
import { motion } from 'motion/react';
import { LogOut, LayoutDashboard, Image as ImageIcon, Settings, User, MapPin, Clock } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { JourneyForm } from '../components/Admin/JourneyForm';
import { StoryForm } from '../components/Admin/StoryForm';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

export const AdminPage: React.FC = () => {
  const [user, loading] = useAuthState(auth);
  const [activeTab, setActiveTab] = useState<'photos' | 'journeys' | 'stories'>('photos');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#E4E3E0]">
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

  return (
    <div className="min-h-screen bg-[#E4E3E0]">
      {/* Admin Header */}
      <header className="bg-white/50 backdrop-blur-xl border-bottom border-black/5 sticky top-0 z-50">
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
                onClick={() => setActiveTab('stories')}
                className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all", activeTab === 'stories' ? "bg-black text-white" : "text-gray-500 hover:bg-white")}
              >
                <Clock size={18} />
                Gestionar Historias
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
                  {activeTab === 'photos' ? 'Nueva Publicación' : activeTab === 'journeys' ? 'Nuevo Viaje' : 'Nueva Historia'}
                </h2>
                <p className="text-gray-500">
                  {activeTab === 'photos' ? 'Sube una imagen y completa los metadatos.' : activeTab === 'journeys' ? 'Crea un nuevo viaje para agrupar tus fotografías.' : 'Crea una nueva historia narrativa.'}
                </p>
              </div>
              
              {activeTab === 'photos' && <UploadForm />}
              {activeTab === 'journeys' && <JourneyForm />}
              {activeTab === 'stories' && <StoryForm />}
            </motion.div>
          </section>
        </div>
      </main>
    </div>
  );
};
