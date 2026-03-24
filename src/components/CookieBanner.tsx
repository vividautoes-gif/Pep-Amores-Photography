import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../firebase';
import { doc, setDoc, increment } from 'firebase/firestore';

interface CookieBannerProps {
  lang: 'es' | 'en' | 'ca';
}

export const CookieBanner: React.FC<CookieBannerProps> = ({ lang }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = async () => {
    setIsVisible(false);
    localStorage.setItem('cookieConsent', 'accepted');
    
    // Check if we already counted this visitor
    const hasVisited = localStorage.getItem('hasVisited');
    if (!hasVisited) {
      try {
        const statsRef = doc(db, 'stats', 'visitors');
        await setDoc(statsRef, { count: increment(1) }, { merge: true });
        localStorage.setItem('hasVisited', 'true');
      } catch (error) {
        console.error('Error updating visitor count:', error);
      }
    }
  };

  const handleReject = () => {
    setIsVisible(false);
    localStorage.setItem('cookieConsent', 'rejected');
  };

  const t = {
    es: {
      text: "Utilizamos cookies para mejorar tu experiencia y analizar el tráfico de nuestro sitio web. Al hacer clic en 'Aceptar', consientes el uso de todas las cookies.",
      accept: "Aceptar",
      reject: "Rechazar"
    },
    en: {
      text: "We use cookies to improve your experience and analyze our website traffic. By clicking 'Accept', you consent to the use of all cookies.",
      accept: "Accept",
      reject: "Reject"
    },
    ca: {
      text: "Utilitzem cookies per millorar la teva experiència i analitzar el trànsit del nostre lloc web. En fer clic a 'Acceptar', consents l'ús de totes les cookies.",
      accept: "Acceptar",
      reject: "Rebutjar"
    }
  }[lang];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 pointer-events-none"
        >
          <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-xl border border-neutral-200 shadow-2xl rounded-2xl p-6 pointer-events-auto flex flex-col md:flex-row items-center gap-6">
            <p className="text-sm text-neutral-600 flex-1">
              {t.text}
            </p>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                onClick={handleReject}
                className="flex-1 md:flex-none px-6 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors"
              >
                {t.reject}
              </button>
              <button
                onClick={handleAccept}
                className="flex-1 md:flex-none px-6 py-2.5 text-sm font-medium bg-black text-white hover:bg-neutral-800 rounded-xl transition-colors"
              >
                {t.accept}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
