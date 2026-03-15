import React, { useState } from 'react';
import { auth } from '../../firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { motion } from 'motion/react';
import { LogIn, ShieldAlert } from 'lucide-react';

export const Login: React.FC = () => {
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#E4E3E0] p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/20 text-center"
      >
        <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-600/20">
          <ShieldAlert className="text-white w-8 h-8" />
        </div>
        <h1 className="text-3xl font-serif italic mb-2">Acceso Privado</h1>
        <p className="text-gray-500 mb-8">Panel de gestión para Pep Amores</p>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
            {error}
          </div>
        )}

        <button
          onClick={handleLogin}
          className="w-full py-4 bg-black text-white rounded-2xl font-medium flex items-center justify-center gap-3 hover:bg-zinc-800 transition-all active:scale-[0.98] shadow-xl shadow-black/10"
        >
          <LogIn size={20} />
          Entrar con Google
        </button>
        
        <p className="mt-8 text-xs text-gray-400 uppercase tracking-widest">
          Solo personal autorizado
        </p>
      </motion.div>
    </div>
  );
};
