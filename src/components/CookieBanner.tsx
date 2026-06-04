import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../firebase';
import { doc, setDoc, increment, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { X, ShieldCheck, Info } from 'lucide-react';

interface CookieBannerProps {
  lang: 'es' | 'en' | 'ca';
}

export const CookieBanner: React.FC<CookieBannerProps> = ({ lang }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);

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
        // Increment global counter
        const statsRef = doc(db, 'stats', 'visitors');
        await setDoc(statsRef, { count: increment(1) }, { merge: true });
        
        // Try to get location and save session
        try {
          let country = 'Unknown';
          let city = 'Unknown';
          let region = 'Unknown';
          
          try {
            const geoResponse = await fetch('https://ipapi.co/json/');
            const geoData = await geoResponse.json();
            
            if (geoData && !geoData.error) {
              country = geoData.country_name || 'Unknown';
              city = geoData.city || 'Unknown';
              region = geoData.region || 'Unknown';
            } else {
              throw new Error("ipapi response error");
            }
          } catch (e) {
            // Fallback API if ipapi.co fails (e.g., adblocker, rate limits)
            const geoResponse2 = await fetch('https://get.geojs.io/v1/ip/geo.json');
            const geoData2 = await geoResponse2.json();
            if (geoData2) {
              country = geoData2.country || 'Unknown';
              city = geoData2.city || 'Unknown';
              region = geoData2.region || 'Unknown';
            }
          }
          
          const sessionsRef = collection(db, 'sessions');
          await addDoc(sessionsRef, {
            country: country,
            city: city,
            region: region,
            device: window.innerWidth < 768 ? 'Mobile' : 'Desktop',
            browser: navigator.userAgent.split(') ')[1]?.split(' ')[0] || 'Unknown',
            timestamp: serverTimestamp()
          });
        } catch (geoError) {
          console.error('Error fetching location:', geoError);
          // Still save a basic session if geo fails Completely
          const sessionsRef = collection(db, 'sessions');
          await addDoc(sessionsRef, {
            country: 'Unknown',
            city: 'Unknown',
            region: 'Unknown',
            device: window.innerWidth < 768 ? 'Mobile' : 'Desktop',
            browser: navigator.userAgent.split(') ')[1]?.split(' ')[0] || 'Unknown',
            timestamp: serverTimestamp()
          });
        }

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
      reject: "Rechazar",
      readMore: "Leer más",
      policyTitle: "Política de Cookies",
      policyIntro: "En Pep Amores, valoramos tu privacidad. Esta política explica cómo utilizamos las cookies en nuestro sitio web.",
      policySection1: "¿Qué son las cookies?",
      policyText1: "Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas un sitio web. Ayudan a que el sitio funcione correctamente y nos proporcionan información sobre cómo interactúas con él.",
      policySection2: "Cookies que utilizamos",
      policyText2: "Utilizamos cookies técnicas necesarias para el funcionamiento del sitio y cookies analíticas para entender el volumen de visitas y la procedencia de nuestros usuarios (país, ciudad, dispositivo).",
      policySection3: "Gestión de cookies",
      policyText3: "Puedes cambiar tus preferencias en cualquier momento a través de la configuración de tu navegador. Ten en cuenta que desactivar ciertas cookies puede afectar la funcionalidad del sitio.",
      close: "Cerrar"
    },
    en: {
      text: "We use cookies to improve your experience and analyze our website traffic. By clicking 'Accept', you consent to the use of all cookies.",
      accept: "Accept",
      reject: "Reject",
      readMore: "Read more",
      policyTitle: "Cookie Policy",
      policyIntro: "At Pep Amores, we value your privacy. This policy explains how we use cookies on our website.",
      policySection1: "What are cookies?",
      policyText1: "Cookies are small text files stored on your device when you visit a website. They help the site function correctly and provide us with information about how you interact with it.",
      policySection2: "Cookies we use",
      policyText2: "We use technical cookies necessary for the site's operation and analytical cookies to understand the volume of visits and the origin of our users (country, city, device).",
      policySection3: "Cookie management",
      policyText3: "You can change your preferences at any time through your browser settings. Please note that disabling certain cookies may affect the site's functionality.",
      close: "Close"
    },
    ca: {
      text: "Utilitzem cookies per millorar la teva experiència i analitzar el trànsit del nostre lloc web. En fer clic a 'Acceptar', consents l'ús de totes les cookies.",
      accept: "Acceptar",
      reject: "Rebutjar",
      readMore: "Llegir més",
      policyTitle: "Política de Cookies",
      policyIntro: "A Pep Amores, valorem la teva privadesa. Aquesta política explica com utilitzem les cookies al nostre lloc web.",
      policySection1: "Què són les cookies?",
      policyText1: "Les cookies són petits fitxers de text que s'emmagatzemen al teu dispositiu quan visites un lloc web. Ajuden a que el lloc funcioni correctament i ens proporcionen informació sobre com interactues amb ell.",
      policySection2: "Cookies que utilitzem",
      policyText2: "Utilitzem cookies tècniques necessàries per al funcionament del lloc i cookies analítiques per entendre el volum de visites i la procedència dels nostres usuaris (país, ciutat, dispositiu).",
      policySection3: "Gestió de cookies",
      policyText3: "Pots canviar les teves preferències en qualsevol moment a través de la configuració del teu navegador. Tingues en cuenta que desactivar certes cookies pot afectar la funcionalitat del lloc.",
      close: "Tancar"
    }
  }[lang];

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 pointer-events-none"
          >
            <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-xl border border-neutral-200 shadow-2xl rounded-2xl p-6 pointer-events-auto flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1">
                <p className="text-sm text-neutral-600">
                  {t.text}
                  <button 
                    onClick={() => setShowPolicy(true)}
                    className="ml-2 text-brand-accent font-bold hover:underline underline-offset-4"
                  >
                    {t.readMore}
                  </button>
                </p>
              </div>
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

      <AnimatePresence>
        {showPolicy && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPolicy(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 md:p-8 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-accent/10 rounded-xl flex items-center justify-center text-brand-accent">
                    <ShieldCheck size={24} />
                  </div>
                  <h2 className="text-2xl font-serif italic text-neutral-900">{t.policyTitle}</h2>
                </div>
                <button 
                  onClick={() => setShowPolicy(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-neutral-200 transition-colors text-neutral-400 hover:text-neutral-900"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 md:p-8 overflow-y-auto space-y-8">
                <p className="text-neutral-600 leading-relaxed">
                  {t.policyIntro}
                </p>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-brand-accent">
                    <Info size={18} />
                    <h3 className="font-bold uppercase tracking-widest text-xs">{t.policySection1}</h3>
                  </div>
                  <p className="text-sm text-neutral-500 leading-relaxed">
                    {t.policyText1}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-brand-accent">
                    <ShieldCheck size={18} />
                    <h3 className="font-bold uppercase tracking-widest text-xs">{t.policySection2}</h3>
                  </div>
                  <p className="text-sm text-neutral-500 leading-relaxed">
                    {t.policyText2}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-brand-accent">
                    <ShieldCheck size={18} />
                    <h3 className="font-bold uppercase tracking-widest text-xs">{t.policySection3}</h3>
                  </div>
                  <p className="text-sm text-neutral-500 leading-relaxed">
                    {t.policyText3}
                  </p>
                </div>
              </div>

              <div className="p-6 md:p-8 border-t border-neutral-100 bg-neutral-50/50 flex justify-end">
                <button
                  onClick={() => setShowPolicy(false)}
                  className="px-8 py-3 bg-black text-white font-bold rounded-xl hover:bg-neutral-800 transition-colors shadow-lg shadow-black/10"
                >
                  {t.close}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

