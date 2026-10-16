import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Award, ArrowRight, ExternalLink } from 'lucide-react';

interface GpsBannerProps {
  lang: 'es' | 'en' | 'ca';
  onNavigate?: () => void;
}

export const GpsBanner: React.FC<GpsBannerProps> = ({ lang, onNavigate }) => {
  const shouldReduceMotion = useReducedMotion();

  const texts = {
    es: {
      overtitle: 'MI NUEVO LIBRO',
      authors: 'Gabriel Brau · Pep Amores · Tino Soriano',
      foreword: 'Prólogo de Steve McCurry',
      forewordTag: 'MAGNUM PHOTOS',
      description: '312 fotografías de 42 países. 300 ejemplares numerados y firmados.',
      ctaPrimary: 'DESCUBRIR EL LIBRO',
      ctaSecondary: 'WEB OFICIAL DEL LIBRO',
      bookAlt: 'Libro GPS de Gabriel Brau, Pep Amores y Tino Soriano',
    },
    ca: {
      overtitle: 'EL MEU NOU LLIBRE',
      authors: 'Gabriel Brau · Pep Amores · Tino Soriano',
      foreword: 'Pròleg de Steve McCurry',
      forewordTag: 'MAGNUM PHOTOS',
      description: '312 fotografies de 42 països. 300 exemplars numerats i signats.',
      ctaPrimary: 'DESCOBRIR EL LLIBRE',
      ctaSecondary: 'WEB OFICIAL DEL LLIBRE',
      bookAlt: 'Llibre GPS de Gabriel Brau, Pep Amores i Tino Soriano',
    },
    en: {
      overtitle: 'MY NEW BOOK',
      authors: 'Gabriel Brau · Pep Amores · Tino Soriano',
      foreword: 'Foreword by Steve McCurry',
      forewordTag: 'MAGNUM PHOTOS',
      description: '312 photographs from 42 countries. 300 numbered and signed copies.',
      ctaPrimary: 'DISCOVER THE BOOK',
      ctaSecondary: 'OFFICIAL BOOK WEBSITE',
      bookAlt: 'The book GPS by Gabriel Brau, Pep Amores and Tino Soriano',
    },
  }[lang];

  const handleNavigate = () => {
    if (onNavigate) {
      onNavigate();
    } else {
      window.history.pushState(null, '', '/gps');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBannerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Avoid double trigger if clicking a button inside
    const target = e.target as HTMLElement;
    if (target.closest('a') || target.closest('button')) {
      return;
    }
    handleNavigate();
  };

  return (
    <div className="gps-scope w-full px-4 sm:px-6">
      <div
        role="button"
        tabIndex={0}
        onClick={handleBannerClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleNavigate();
          }
        }}
        className="group relative block w-full max-w-[1200px] mx-auto mt-6 mb-2 md:mt-8 md:mb-4 bg-gradient-to-br from-[#FCFAF7] via-[#FAF6F0] to-[#F5EFE6] border border-[#EBE4DA] hover:border-[#283583]/50 rounded-2xl md:rounded-3xl shadow-[0_8px_30px_rgba(180,83,9,0.04),0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_40px_rgba(40,53,131,0.14),0_4px_12px_rgba(0,0,0,0.04)] transition-all duration-300 cursor-pointer overflow-hidden text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#283583]"
        style={{ fontFamily: "'Inter', sans-serif" }}
        aria-label={`GPS - ${texts.overtitle}`}
      >
        {/* Crisp GPS Blue top accent line */}
        <div className="absolute top-0 inset-x-0 h-[3px] bg-[#283583] z-10 transition-colors duration-300 group-hover:bg-[#1B2459]" />

        <div className="relative p-6 sm:p-8 md:p-10 lg:p-11 flex flex-col md:flex-row items-center gap-7 md:gap-10 lg:gap-14">
          {/* Left Column: 3D Book on crisp, luminous gallery background */}
          <div className="w-full md:w-[32%] flex items-center justify-center shrink-0">
            <div className="relative transition-transform duration-500 ease-out group-hover:-translate-y-2">
              <motion.div
                animate={shouldReduceMotion ? {} : { y: [-4, 4, -4] }}
                transition={{
                  repeat: Infinity,
                  duration: 5.2,
                  ease: 'easeInOut',
                }}
              >
                <img
                  src="https://gpsphotobook.vercel.app/kit/libro-gps.webp"
                  alt={texts.bookAlt}
                  decoding="async"
                  className="w-full max-w-[170px] sm:max-w-[200px] md:max-w-[230px] h-auto object-contain select-none drop-shadow-[0_18px_24px_rgba(0,0,0,0.22)] transition-all duration-500 group-hover:drop-shadow-[0_24px_32px_rgba(40,53,131,0.28)]"
                />
              </motion.div>
            </div>
          </div>

          {/* Right Column: Clean, sharp, high-end editorial details */}
          <div className="flex-1 min-w-0 flex flex-col items-start space-y-3.5 md:space-y-4">
            {/* 1. Sobretítulo nítido con línea horizontal azul */}
            <div className="flex items-center gap-3">
              <span className="w-8 h-[2px] bg-[#283583] rounded-full" />
              <span className="text-[12px] font-bold text-[#283583] uppercase tracking-[0.155em]">
                {texts.overtitle}
              </span>
            </div>

            {/* 2. Título GPS con máxima presencia y limpieza editorial */}
            <h2
              className="text-[64px] sm:text-[76px] md:text-[92px] lg:text-[100px] font-bold text-[#14141A] tracking-[-0.03em] leading-none transition-colors duration-300 group-hover:text-[#283583]"
              style={{
                fontFamily: "'Playfair Display', serif",
                fontStyle: 'normal',
                lineHeight: 0.92,
              }}
            >
              GPS
            </h2>

            {/* 3. Autores */}
            <p
              className="text-[18px] sm:text-[20px] md:text-[22px] font-bold text-[#14141A] tracking-[-0.024em] leading-snug"
              style={{
                fontFamily: "'Playfair Display', serif",
                fontStyle: 'normal',
              }}
            >
              {texts.authors}
            </p>

            {/* 4. Prólogo de Steve McCurry — Resaltado, limpio, luminoso */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#EEF0FA] border border-[#283583]/20 shadow-xs transition-colors duration-200 group-hover:bg-[#E3E7F8] group-hover:border-[#283583]/30">
              <Award className="w-3.5 h-3.5 text-[#283583] shrink-0" strokeWidth={2.5} />
              <span className="text-[12px] md:text-[12.5px] font-bold text-[#1B2459] tracking-[0.06em] uppercase">
                {texts.foreword}
              </span>
              <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-[#283583]/40" />
              <span className="hidden sm:inline-block text-[10px] font-semibold text-[#283583] tracking-wider uppercase opacity-85">
                {texts.forewordTag}
              </span>
            </div>

            {/* 5. Frase descriptiva limpia y con excelente legibilidad */}
            <p className="text-[15px] md:text-[16px] text-[#4A4A55] leading-relaxed max-w-[48ch]">
              {texts.description}
            </p>

            {/* 6. Opción 1: Dos botones complementarios (descubrir libro + web oficial directa) */}
            <div className="pt-2 sm:pt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full">
              {/* Botón Principal: Ver en el portfolio (/gps) */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNavigate();
                }}
                className="group/btn inline-flex items-center justify-center bg-[#283583] hover:bg-[#1B2459] text-white text-[13px] md:text-[13.5px] font-bold uppercase tracking-[0.11em] px-6 sm:px-7 py-3.5 sm:py-4 rounded-xl shadow-[0_4px_16px_rgba(40,53,131,0.25)] hover:shadow-[0_8px_24px_rgba(40,53,131,0.35)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 cursor-pointer select-none"
              >
                <span>{texts.ctaPrimary}</span>
                <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover/btn:translate-x-1" strokeWidth={2.5} />
              </button>

              {/* Botón Secundario: Web oficial del libro (enlace externo en pestaña nueva) */}
              <a
                href="https://gpsphotobook.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="group/ext inline-flex items-center justify-center bg-white/95 hover:bg-white text-[#283583] hover:text-[#1B2459] border border-[#283583]/30 hover:border-[#283583] text-[13px] md:text-[13.5px] font-bold uppercase tracking-[0.11em] px-5 sm:px-6 py-3.5 sm:py-4 rounded-xl shadow-[0_2px_10px_rgba(40,53,131,0.08)] hover:shadow-[0_6px_20px_rgba(40,53,131,0.18)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 cursor-pointer select-none"
              >
                <span>{texts.ctaSecondary}</span>
                <ExternalLink className="w-4 h-4 ml-2 transition-transform duration-300 group-hover/ext:translate-x-0.5 group-hover/ext:-translate-y-0.5" strokeWidth={2.5} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

