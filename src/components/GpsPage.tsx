import React, { useEffect, useState, useRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';

interface GpsPageProps {
  lang: 'es' | 'en' | 'ca';
}

// Single constant for reserved copies as required
export const RESERVADOS = 98;
const TOTAL_EJEMPLARES = 300;
const QUEDAN = TOTAL_EJEMPLARES - RESERVADOS; // 202

// Component to smoothly count up when in view
function AnimatedCounter({ end, duration = 1200 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion) {
      setCount(end);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
          const startTime = performance.now();
          const animate = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(easeOut * end));
            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration, hasStarted, shouldReduceMotion]);

  return <span ref={ref}>{shouldReduceMotion ? end : count}</span>;
}

export const GpsPage: React.FC<GpsPageProps> = ({ lang }) => {
  const shouldReduceMotion = useReducedMotion();

  // Links to book web according to current language
  const links = {
    home: `https://gpsphotobook.vercel.app/${lang}/`,
    book: `https://gpsphotobook.vercel.app/${lang}/book/`,
    chapters: `https://gpsphotobook.vercel.app/${lang}/chapters/`,
    preview: `https://gpsphotobook.vercel.app/${lang}/preview/`,
    foreword: `https://gpsphotobook.vercel.app/${lang}/foreword/`,
    authors: `https://gpsphotobook.vercel.app/${lang}/authors/`,
    events: `https://gpsphotobook.vercel.app/${lang}/events/`,
    reserve: `https://gpsphotobook.vercel.app/${lang}/reserve/`,
    companies: `https://gpsphotobook.vercel.app/${lang}/companies/`,
    press: `https://gpsphotobook.vercel.app/${lang}/press/`,
    pressArticle: `https://www.elmundofinanciero.com/noticia/129046/libros-recomendados/gps-un-viaje-fotografico-por-42-paises-para-descubrir-el-mundo-a-traves-de-tres-miradas-distintas.html`,
  };

  // SEO, Tab Title, Meta Description, OG Image, and JSON-LD Book structured data
  useEffect(() => {
    const prevTitle = document.title;
    document.title = 'GPS, el libro de Gabriel Brau, Pep Amores y Tino Soriano | Pep Amores';

    let metaDesc = document.querySelector('meta[name="description"]');
    const prevDesc = metaDesc?.getAttribute('content');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute(
      'content',
      'Fotolibro de gran formato con 312 fotografías de 42 países y prólogo de Steve McCurry. Edición limitada de 300 ejemplares numerados y firmados.'
    );

    let metaOgImage = document.querySelector('meta[property="og:image"]');
    const prevOgImage = metaOgImage?.getAttribute('content');
    if (!metaOgImage) {
      metaOgImage = document.createElement('meta');
      metaOgImage.setAttribute('property', 'og:image');
      document.head.appendChild(metaOgImage);
    }
    metaOgImage.setAttribute('content', 'https://gpsphotobook.vercel.app/og-gps.jpg');

    const scriptId = 'gps-book-jsonld';
    let jsonLdScript = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!jsonLdScript) {
      jsonLdScript = document.createElement('script');
      jsonLdScript.id = scriptId;
      jsonLdScript.type = 'application/ld+json';
      document.head.appendChild(jsonLdScript);
    }
    jsonLdScript.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Book',
      name: 'GPS',
      author: [
        { '@type': 'Person', name: 'Gabriel Brau', url: 'https://www.gabrielbrau.com' },
        { '@type': 'Person', name: 'Pep Amores', url: 'https://www.pepamores.com' },
        { '@type': 'Person', name: 'Tino Soriano', url: 'https://www.tinosoriano.com' }
      ],
      numberOfPages: 502,
      isbn: '978-84-09-90712-0',
      inLanguage: ['es', 'ca', 'en'],
      image: 'https://gpsphotobook.vercel.app/kit/portada-gps.jpg',
      url: 'https://gpsphotobook.vercel.app/es/',
      offers: {
        '@type': 'Offer',
        price: 546,
        priceCurrency: 'EUR',
        availability: 'https://schema.org/InStock',
        url: `https://gpsphotobook.vercel.app/${lang}/reserve/`
      }
    });

    return () => {
      document.title = prevTitle;
      if (prevDesc !== undefined && metaDesc) {
        metaDesc.setAttribute('content', prevDesc);
      }
      if (prevOgImage !== undefined && metaOgImage) {
        metaOgImage.setAttribute('content', prevOgImage);
      }
      const s = document.getElementById(scriptId);
      if (s) s.remove();
    };
  }, [lang]);

  // Texts in ES, CA, EN strictly preserving all numbers and exact tone
  const t = {
    hero: {
      eyebrow: lang === 'es' ? 'MI LIBRO' : lang === 'ca' ? 'EL MEU LLIBRE' : 'MY BOOK',
      authors: 'Gabriel Brau · Pep Amores · Tino Soriano',
      foreword: lang === 'es' ? 'PRÓLOGO DE STEVE MCCURRY' : lang === 'ca' ? 'PRÒLEG DE STEVE MCCURRY' : 'FOREWORD BY STEVE MCCURRY',
      p: lang === 'es'
        ? '312 fotografías de 42 países, tres miradas y un solo camino. Un libro de 502 páginas en gran formato, con trescientos ejemplares numerados y firmados por sus autores. Cuando se acaben, no habrá segunda edición.'
        : lang === 'ca'
        ? '312 fotografies de 42 països, tres mirades i un sol camí. Un llibre de 502 pàgines en gran format, amb tres-cents exemplars numerats i signats pels seus autors. Quan s\'acabin, no hi haurà segona edició.'
        : '312 photographs from 42 countries, three perspectives, and a single path. A 502-page large-format book, with three hundred copies numbered and signed by its authors. Once sold out, there will be no second edition.',
      btnPrimary: lang === 'es' ? 'RESERVAR MI EJEMPLAR' : lang === 'ca' ? 'RESERVAR EL MEU EXEMPLAR' : 'RESERVE MY COPY',
      btnSecondary: lang === 'es' ? 'DESCUBRIR EL LIBRO' : lang === 'ca' ? 'DESCOBRIR EL LLIBRE' : 'DISCOVER THE BOOK',
    },
    numbers: {
      photos: lang === 'es' ? 'FOTOGRAFÍAS' : lang === 'ca' ? 'FOTOGRAFIES' : 'PHOTOGRAPHS',
      pages: lang === 'es' ? 'PÁGINAS' : lang === 'ca' ? 'PÀGINES' : 'PAGES',
      cm: lang === 'es' ? 'CENTÍMETROS' : lang === 'ca' ? 'CENTÍMETRES' : 'CENTIMETRES',
      reserved: lang === 'es' ? 'EJEMPLARES RESERVADOS' : lang === 'ca' ? 'EXEMPLARS RESERVATS' : 'COPIES RESERVED',
      of: lang === 'es' ? 'de' : lang === 'ca' ? 'de' : 'of',
    },
    story: {
      eyebrow: lang === 'es' ? 'EL LIBRO' : lang === 'ca' ? 'EL LLIBRE' : 'THE BOOK',
      title: lang === 'es' ? 'Tres miradas, un mismo camino' : lang === 'ca' ? 'Tres mirades, un mateix camí' : 'Three visions, one shared path',
      text: lang === 'es'
        ? 'GPS reúne el trabajo de tres fotógrafos de viaje, Gabriel Brau, Tino Soriano y yo, en un solo libro de gran formato. Son 312 fotografías de 42 países, elegidas entre miles después de años recorriendo el mundo con la cámara. No está ordenado por países, sino por lo que nos mueve al mirar: las personas, los lugares, la espiritualidad y el movimiento.'
        : lang === 'ca'
        ? 'GPS reuneix el treball de tres fotògrafs de viatge, Gabriel Brau, Tino Soriano i jo, en un sol llibre de gran format. Són 312 fotografies de 42 països, triades entre milers després d\'anys recorrent el món amb la càmera. No està ordenat per països, sinó pel que ens mou en mirar: les persones, els llocs, l\'espiritualitat i el moviment.'
        : 'GPS brings together the work of three travel photographers—Gabriel Brau, Tino Soriano, and myself—into a single large-format book. It features 312 photographs from 42 countries, selected from thousands after years of traveling the world with a camera. It is not arranged by country, but by what moves us when we look: people, places, spirituality, and motion.',
      captionDouble1: lang === 'es' ? 'Doubtful Sound, Nueva Zelanda · Pep Amores' : lang === 'ca' ? 'Doubtful Sound, Nova Zelanda · Pep Amores' : 'Doubtful Sound, New Zealand · Pep Amores',
    },
    chapters: {
      eyebrow: lang === 'es' ? 'CAPÍTULOS' : lang === 'ca' ? 'CAPÍTOLS' : 'CHAPTERS',
      title: lang === 'es' ? 'Cuatro maneras de mirar' : lang === 'ca' ? 'Quatre maneres de mirar' : 'Four ways of seeing',
      c1Num: '01',
      c1Title: lang === 'es' ? 'Te veo, me miras' : lang === 'ca' ? 'Et veig, em mires' : 'I see you, you see me',
      c1Desc: lang === 'es' ? 'El retrato y el vínculo entre quien fotografía y quien es fotografiado.' : lang === 'ca' ? 'El retrat i el vincle entre qui fotografia i qui és fotografiat.' : 'The portrait and the bond between photographer and subject.',
      c2Num: '02',
      c2Title: lang === 'es' ? 'El alma de los lugares' : lang === 'ca' ? 'L’ànima dels llocs' : 'The soul of places',
      c2Desc: lang === 'es' ? 'Paisajes y ciudades que se quedan dentro.' : lang === 'ca' ? 'Paisatges i ciutats que es queden a dins.' : 'Landscapes and cities that linger within.',
      c3Num: '03',
      c3Title: lang === 'es' ? 'Lo que nos trasciende' : lang === 'ca' ? 'Allò que ens transcendeix' : 'What transcends us',
      c3Desc: lang === 'es' ? 'La espiritualidad en todas sus formas.' : lang === 'ca' ? 'L’espiritualitat en totes les seves formes.' : 'Spirituality in all its forms.',
      c4Num: '04',
      c4Title: lang === 'es' ? 'Te mueves, te atrapo' : lang === 'ca' ? 'Et mous, t’atrapo' : 'You move, I capture you',
      c4Desc: lang === 'es' ? 'El instante y el movimiento.' : lang === 'ca' ? 'L’instant i el moviment.' : 'The decisive moment and motion.',
      captionDouble2: lang === 'es' ? 'Orante, España · Pep Amores' : lang === 'ca' ? 'Orante, Espanya · Pep Amores' : 'Orante, Spain · Pep Amores',
      captionDouble2Sub: lang === 'es' ? '(apertura del capítulo «Te veo, me miras»)' : lang === 'ca' ? '(obertura del capítol «Et veig, em mires»)' : '(opening of the chapter "I see you, you see me")',
      captionDouble3: lang === 'es' ? 'Sídney, Australia · Pep Amores' : lang === 'ca' ? 'Sydney, Austràlia · Pep Amores' : 'Sydney, Australia · Pep Amores',
      captionDouble3Sub: lang === 'es' ? '(apertura del capítulo «El alma de los lugares»)' : lang === 'ca' ? '(obertura del capítol «L’ànima dels llocs»)' : '(opening of the chapter "The soul of places")',
    },
    foreword: {
      eyebrow: lang === 'es' ? 'PRÓLOGO' : lang === 'ca' ? 'PRÒLEG' : 'FOREWORD',
      title: lang === 'es' ? 'Steve McCurry abre el libro' : lang === 'ca' ? 'Steve McCurry obre el llibre' : 'Steve McCurry opens the book',
      text: lang === 'es'
        ? 'El prólogo lo firma Steve McCurry, autor de la célebre fotografía Afghan Girl y una de las grandes referencias de la fotografía documental.'
        : lang === 'ca'
        ? 'El pròleg el signa Steve McCurry, autor de la cèlebre fotografia Afghan Girl i una de les grans referències de la fotografia documental.'
        : 'The foreword is penned by Steve McCurry, author of the iconic photograph Afghan Girl and one of the towering figures of documentary photography.',
      link: lang === 'es' ? 'Leer el prólogo' : lang === 'ca' ? 'Llegir el pròleg' : 'Read the foreword',
    },
    triptychs: {
      eyebrow: lang === 'es' ? 'TRÍPTICOS DESPLEGABLES' : lang === 'ca' ? 'TRÍPTICS DESPLEGABLES' : 'GATEFOLD TRIPTYCHS',
      sentence: lang === 'es' ? 'El libro se abre en panorámicas de tres páginas.' : lang === 'ca' ? 'El llibre s\'obre en panoràmiques de tres pàgines.' : 'The book opens into breathtaking three-page panoramas.',
      captionTriptych1: lang === 'es' ? 'Rapa Nui, isla de Pascua, Chile · Pep Amores' : lang === 'ca' ? 'Rapa Nui, illa de Pasqua, Xile · Pep Amores' : 'Rapa Nui, Easter Island, Chile · Pep Amores',
      captionTriptych2: lang === 'es' ? 'Desierto de Atacama, Chile · Pep Amores' : lang === 'ca' ? 'Desert d\'Atacama, Xile · Pep Amores' : 'Atacama Desert, Chile · Pep Amores',
      link: lang === 'es' ? 'Hojear el libro' : lang === 'ca' ? 'Fullejar el llibre' : 'Leaf through the book',
    },
    edition: {
      eyebrow: lang === 'es' ? 'LA EDICIÓN' : lang === 'ca' ? 'L’EDICIÓ' : 'THE EDITION',
      title: lang === 'es' ? 'Una pieza para tener en casa' : lang === 'ca' ? 'Una peça per tenir a casa' : 'A piece to treasure at home',
      desc: lang === 'es'
        ? 'Impreso y encuadernado en Barcelona por Agpograf, sobre papeles Symbol Tatami, Munken Print Cream y Sirio Color Black. 300 ejemplares numerados y firmados por los tres autores.'
        : lang === 'ca'
        ? 'Imprès i enquadernat a Barcelona per Agpograf, sobre papers Symbol Tatami, Munken Print Cream i Sirio Color Black. 300 exemplars numerats i signats pels tres autors.'
        : 'Printed and bound in Barcelona by Agpograf, on Symbol Tatami, Munken Print Cream, and Sirio Color Black papers. 300 copies numbered and signed by all three authors.',
      link: lang === 'es' ? 'Ver la ficha técnica completa' : lang === 'ca' ? 'Veure la fitxa tècnica completa' : 'View full specifications',
      formatLabel: lang === 'es' ? 'FORMATO' : lang === 'ca' ? 'FORMAT' : 'FORMAT',
      formatVal: '33 × 45 cm',
      pagesLabel: lang === 'es' ? 'PÁGINAS' : lang === 'ca' ? 'PÀGINES' : 'PAGES',
      pagesVal: '502',
      photosLabel: lang === 'es' ? 'FOTOGRAFÍAS' : lang === 'ca' ? 'FOTOGRAFIES' : 'PHOTOGRAPHS',
      photosVal: '312',
      weightLabel: lang === 'es' ? 'PESO' : lang === 'ca' ? 'PES' : 'WEIGHT',
      weightVal: lang === 'es' ? 'unos 7 kg' : lang === 'ca' ? 'uns 7 kg' : 'approx. 7 kg',
      langsLabel: lang === 'es' ? 'IDIOMAS' : lang === 'ca' ? 'IDIOMES' : 'LANGUAGES',
      langsVal: lang === 'es' ? 'castellano, catalán e inglés' : lang === 'ca' ? 'castellà, català i anglès' : 'Spanish, Catalan and English',
      isbnLabel: 'ISBN',
      isbnVal: '978-84-09-90712-0',
      copiesLabel: lang === 'es' ? 'EJEMPLARES' : lang === 'ca' ? 'EXEMPLARS' : 'COPIES',
      copiesVal: lang === 'es' ? '300, numerados y firmados' : lang === 'ca' ? '300, numerats i signats' : '300, numbered and signed',
    },
    authors: {
      eyebrow: lang === 'es' ? 'AUTORES' : lang === 'ca' ? 'AUTORS' : 'AUTHORS',
      title: lang === 'es' ? 'Tres miradas de autor' : lang === 'ca' ? 'Tres mirades d’autor' : 'Three authorial perspectives',
      link: lang === 'es' ? 'Conocer a los autores' : lang === 'ca' ? 'Conèixer els autors' : 'Meet the authors',
    },
    events: {
      eyebrow: lang === 'es' ? 'PRESENTACIONES' : lang === 'ca' ? 'PRESENTACIONS' : 'BOOK PRESENTATIONS',
      title: lang === 'es' ? 'Ven a conocer el libro' : lang === 'ca' ? 'Vine a conèixer el llibre' : 'Come discover the book',
      octMonth: lang === 'es' ? 'OCTUBRE 2026' : lang === 'ca' ? 'OCTUBRE 2026' : 'OCTOBER 2026',
      novMonth: lang === 'es' ? 'NOVIEMBRE 2026' : lang === 'ca' ? 'NOVEMBRE 2026' : 'NOVEMBER 2026',
      ev1Day: lang === 'es' ? 'Martes' : lang === 'ca' ? 'Dimarts' : 'Tuesday',
      ev2Day: lang === 'es' ? 'Martes' : lang === 'ca' ? 'Dimarts' : 'Tuesday',
      ev3Day: lang === 'es' ? 'Lunes' : lang === 'ca' ? 'Dilluns' : 'Monday',
      time: lang === 'es' ? 'de 18:00 a 20:00' : lang === 'ca' ? 'de 18:00 a 20:00' : '18:00 to 20:00',
      btn: lang === 'es' ? 'VER LAS PRESENTACIONES Y APUNTARSE' : lang === 'ca' ? 'VEURE LES PRESENTACIONS I APUNTAR-SE' : 'VIEW PRESENTATIONS & REGISTER',
    },
    press: {
      eyebrow: lang === 'es' ? 'HAN HABLADO DE GPS' : lang === 'ca' ? 'HAN PARLAT DE GPS' : 'FEATURED IN PRESS',
      outlet: 'EL MUNDO FINANCIERO · LIBROS RECOMENDADOS · 14 DE OCTUBRE DE 2026',
      headline: '«GPS, un viaje fotográfico por 42 países para descubrir el mundo a través de tres miradas distintas»',
      readArticle: lang === 'es' ? 'Leer el artículo ↗' : lang === 'ca' ? 'Llegir l\'article ↗' : 'Read article ↗',
      pressMaterial: lang === 'es' ? 'Material de prensa' : lang === 'ca' ? 'Material de premsa' : 'Press materials',
    },
    finalBand: {
      title: lang === 'es' ? 'Una edición limitada de 300 ejemplares.' : lang === 'ca' ? 'Una edició limitada de 300 exemplars.' : 'A limited edition of 300 copies.',
      details: lang === 'es'
        ? `Quedan ${QUEDAN} · 546 € IVA incluido · Envío a la Península 35 €`
        : lang === 'ca'
        ? `En queden ${QUEDAN} · 546 € IVA inclòs · Enviament a la Península 35 €`
        : `${QUEDAN} remaining · €546 VAT included · Shipping to Iberian Peninsula €35`,
      btnReserve: lang === 'es' ? 'RESERVAR MI EJEMPLAR' : lang === 'ca' ? 'RESERVAR EL MEU EXEMPLAR' : 'RESERVE MY COPY',
      btnCompanies: lang === 'es' ? 'EMPRESAS Y REGALOS' : lang === 'ca' ? 'EMPRESES I REGALS' : 'CORPORATE & GIFTS',
    }
  };

  // Reusable eyebrow element
  const Sobretitulo = ({ text }: { text: string }) => (
    <div className="flex items-center gap-3 mb-4">
      <span className="w-[35px] h-[1px] bg-[#283583] inline-block shrink-0" aria-hidden="true" />
      <span className="font-sans text-[12px] font-semibold uppercase tracking-[0.155em] text-[#283583]">
        {text}
      </span>
    </div>
  );

  return (
    <div className="gps-scope bg-[#FCFBF9] text-[#14141A] font-sans antialiased overflow-x-hidden selection:bg-[#283583] selection:text-white min-h-screen">
      
      {/* 1) PORTADA DE LA PÁGINA (HERO) */}
      <section className="max-w-[1200px] mx-auto px-6 pt-12 md:pt-20 pb-16 md:pb-24">
        <div className="flex flex-col-reverse md:flex-row items-center md:items-start justify-between gap-12 md:gap-8">
          
          {/* Izquierda: Textos y botones */}
          <motion.div 
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex-1 max-w-[620px]"
          >
            <Sobretitulo text={t.hero.eyebrow} />
            
            <h1 className="font-serif font-bold text-[96px] md:text-[160px] leading-[0.92] tracking-[-0.024em] text-[#14141A] mb-4">
              GPS
            </h1>

            <div className="font-serif font-bold text-[22px] md:text-[24px] text-[#14141A] mb-2 leading-tight">
              {t.hero.authors}
            </div>

            <p className="font-sans text-[12px] font-medium tracking-[0.155em] text-[#8C8C97] uppercase mb-8">
              {t.hero.foreword}
            </p>

            <p className="font-sans text-[18px] text-[#4A4A55] leading-relaxed max-w-[52ch] mb-10">
              {t.hero.p}
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <a
                href={links.reserve}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-[2px] bg-[#283583] text-white font-sans text-[14px] font-semibold uppercase tracking-[0.11em] px-[2.4em] py-[1.15em] hover:bg-[#1B2459] hover:-translate-y-[1px] transition-all inline-flex items-center justify-center gap-2 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#283583] focus-visible:ring-offset-2"
              >
                <span>{t.hero.btnPrimary}</span>
                <span className="inline-block transition-transform duration-200 group-hover:translate-x-[5px]">→</span>
              </a>

              <a
                href={links.home}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-[2px] bg-transparent border border-[#283583] text-[#283583] font-sans text-[14px] font-semibold uppercase tracking-[0.11em] px-[2.4em] py-[1.15em] hover:bg-[#283583] hover:text-white hover:-translate-y-[1px] transition-all inline-flex items-center justify-center gap-2 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#283583] focus-visible:ring-offset-2"
              >
                <span>{t.hero.btnSecondary}</span>
                <span className="inline-block transition-transform duration-200 group-hover:translate-x-[5px]">→</span>
              </a>
            </div>
          </motion.div>

          {/* Derecha: Libro en 3D con flotación */}
          <div className="w-full md:w-[420px] flex justify-center items-center shrink-0">
            <a
              href={links.home}
              target="_blank"
              rel="noopener noreferrer"
              className="block group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#283583] focus-visible:ring-offset-4"
              aria-label={t.hero.btnSecondary}
            >
              <motion.div
                animate={shouldReduceMotion ? {} : { y: [-3.5, 3.5, -3.5] }}
                transition={shouldReduceMotion ? {} : { duration: 5.2, repeat: Infinity, ease: 'easeInOut' }}
                className="flex justify-center"
              >
                <img
                  src="https://gpsphotobook.vercel.app/kit/libro-gps.webp"
                  alt="Libro de fotografía GPS - Gabriel Brau, Pep Amores, Tino Soriano"
                  width={380}
                  height={490}
                  className="max-w-[280px] sm:max-w-[340px] md:max-w-[380px] w-full h-auto drop-shadow-[0_30px_30px_rgba(0,0,0,0.28)] transition-transform duration-300 group-hover:scale-[1.02]"
                />
              </motion.div>
            </a>
          </div>

        </div>
      </section>

      {/* 2) CIFRAS (BANDA A TODO EL ANCHO FONDO #F5F3EE) */}
      <section className="w-full bg-[#F5F3EE] border-y border-[#E3DFD7]">
        <div className="max-w-[1200px] mx-auto px-6 py-14 md:py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6 text-center md:text-left">
            
            {/* 312 Fotografías */}
            <motion.div 
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6 }}
              className="flex flex-col"
            >
              <span className="font-serif italic font-normal text-[#283583] text-[48px] md:text-[56px] leading-none whitespace-nowrap">
                312
              </span>
              <span className="font-sans text-[12px] font-semibold uppercase tracking-[0.155em] text-[#8C8C97] mt-3">
                {t.numbers.photos}
              </span>
            </motion.div>

            {/* 502 Páginas */}
            <motion.div 
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex flex-col"
            >
              <span className="font-serif italic font-normal text-[#283583] text-[48px] md:text-[56px] leading-none whitespace-nowrap">
                502
              </span>
              <span className="font-sans text-[12px] font-semibold uppercase tracking-[0.155em] text-[#8C8C97] mt-3">
                {t.numbers.pages}
              </span>
            </motion.div>

            {/* 33 × 45 Centímetros */}
            <motion.div 
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col"
            >
              <span className="font-serif italic font-normal text-[#283583] text-[48px] md:text-[56px] leading-none whitespace-nowrap">
                33 × 45
              </span>
              <span className="font-sans text-[12px] font-semibold uppercase tracking-[0.155em] text-[#8C8C97] mt-3">
                {t.numbers.cm}
              </span>
            </motion.div>

            {/* 98 de 300 Ejemplares Reservados (con contador animado) */}
            <motion.div 
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col"
            >
              <span className="font-serif italic font-normal text-[#283583] text-[48px] md:text-[56px] leading-none whitespace-nowrap">
                <AnimatedCounter end={RESERVADOS} duration={1200} /> {t.numbers.of} {TOTAL_EJEMPLARES}
              </span>
              <span className="font-sans text-[12px] font-semibold uppercase tracking-[0.155em] text-[#8C8C97] mt-3">
                {t.numbers.reserved}
              </span>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 3) LA HISTORIA */}
      <section className="max-w-[1200px] mx-auto px-6 py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6 }}
          className="max-w-[760px] mb-12 md:mb-16"
        >
          <Sobretitulo text={t.story.eyebrow} />
          <h2 className="font-serif font-bold text-[36px] md:text-[48px] leading-[1.04] tracking-[-0.024em] text-[#14141A] mb-6">
            {t.story.title}
          </h2>
          <p className="font-sans text-[17px] text-[#4A4A55] leading-[1.68] max-w-[62ch]">
            {t.story.text}
          </p>
        </motion.div>

        {/* Doble página 1 a todo el ancho */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6 }}
          className="w-full"
        >
          <div className="bg-white border border-[#E3DFD7] p-2 md:p-3 shadow-sm rounded-none">
            <img
              src="https://gpsphotobook.vercel.app/kit/doble-pagina-1.jpg"
              alt="Doble página del libro GPS en Doubtful Sound, Nueva Zelanda"
              loading="lazy"
              className="w-full h-auto block rounded-none"
            />
          </div>
          <figcaption className="font-sans text-[12px] text-[#8C8C97] mt-3 text-right">
            {t.story.captionDouble1}
          </figcaption>
        </motion.div>
      </section>

      {/* 4) LOS CUATRO CAPÍTULOS */}
      <section className="max-w-[1200px] mx-auto px-6 py-16 md:py-24 border-t border-[#E3DFD7]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <Sobretitulo text={t.chapters.eyebrow} />
          <h2 className="font-serif font-bold text-[36px] md:text-[48px] leading-[1.04] tracking-[-0.024em] text-[#14141A]">
            {t.chapters.title}
          </h2>
        </motion.div>

        {/* 4 Tarjetas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          
          {/* Card 01 */}
          <motion.a
            href={links.chapters}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6 }}
            className="group block bg-white border border-[#E3DFD7] border-t-2 border-t-[#283583] rounded-[2px] p-6 shadow-sm hover:shadow-md hover:-translate-y-[2px] transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#283583]"
          >
            <div className="font-serif italic font-normal text-[#283583] text-2xl mb-4 leading-none">
              {t.chapters.c1Num}
            </div>
            <h3 className="font-serif font-bold text-[20px] text-[#14141A] leading-tight mb-3 group-hover:text-[#283583] transition-colors">
              {t.chapters.c1Title}
            </h3>
            <p className="font-sans text-[15px] text-[#4A4A55] leading-relaxed">
              {t.chapters.c1Desc}
            </p>
          </motion.a>

          {/* Card 02 */}
          <motion.a
            href={links.chapters}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="group block bg-white border border-[#E3DFD7] border-t-2 border-t-[#283583] rounded-[2px] p-6 shadow-sm hover:shadow-md hover:-translate-y-[2px] transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#283583]"
          >
            <div className="font-serif italic font-normal text-[#283583] text-2xl mb-4 leading-none">
              {t.chapters.c2Num}
            </div>
            <h3 className="font-serif font-bold text-[20px] text-[#14141A] leading-tight mb-3 group-hover:text-[#283583] transition-colors">
              {t.chapters.c2Title}
            </h3>
            <p className="font-sans text-[15px] text-[#4A4A55] leading-relaxed">
              {t.chapters.c2Desc}
            </p>
          </motion.a>

          {/* Card 03 */}
          <motion.a
            href={links.chapters}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="group block bg-white border border-[#E3DFD7] border-t-2 border-t-[#283583] rounded-[2px] p-6 shadow-sm hover:shadow-md hover:-translate-y-[2px] transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#283583]"
          >
            <div className="font-serif italic font-normal text-[#283583] text-2xl mb-4 leading-none">
              {t.chapters.c3Num}
            </div>
            <h3 className="font-serif font-bold text-[20px] text-[#14141A] leading-tight mb-3 group-hover:text-[#283583] transition-colors">
              {t.chapters.c3Title}
            </h3>
            <p className="font-sans text-[15px] text-[#4A4A55] leading-relaxed">
              {t.chapters.c3Desc}
            </p>
          </motion.a>

          {/* Card 04 */}
          <motion.a
            href={links.chapters}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="group block bg-white border border-[#E3DFD7] border-t-2 border-t-[#283583] rounded-[2px] p-6 shadow-sm hover:shadow-md hover:-translate-y-[2px] transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#283583]"
          >
            <div className="font-serif italic font-normal text-[#283583] text-2xl mb-4 leading-none">
              {t.chapters.c4Num}
            </div>
            <h3 className="font-serif font-bold text-[20px] text-[#14141A] leading-tight mb-3 group-hover:text-[#283583] transition-colors">
              {t.chapters.c4Title}
            </h3>
            <p className="font-sans text-[15px] text-[#4A4A55] leading-relaxed">
              {t.chapters.c4Desc}
            </p>
          </motion.a>

        </div>

        {/* Dobles páginas 2 y 3 en 2 columnas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
          
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6 }}
            className="flex flex-col"
          >
            <div className="bg-white border border-[#E3DFD7] p-2 md:p-3 shadow-sm rounded-none">
              <img
                src="https://gpsphotobook.vercel.app/kit/doble-pagina-2.jpg"
                alt="Apertura del capítulo Te veo, me miras - Orante, España por Pep Amores"
                loading="lazy"
                className="w-full h-auto block rounded-none"
              />
            </div>
            <figcaption className="font-sans text-[12px] text-[#8C8C97] mt-3">
              <span className="font-medium text-[#4A4A55]">{t.chapters.captionDouble2}</span>{' '}
              <span className="text-[#8C8C97]">{t.chapters.captionDouble2Sub}</span>
            </figcaption>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="flex flex-col"
          >
            <div className="bg-white border border-[#E3DFD7] p-2 md:p-3 shadow-sm rounded-none">
              <img
                src="https://gpsphotobook.vercel.app/kit/doble-pagina-3.jpg"
                alt="Apertura del capítulo El alma de los lugares - Sídney, Australia por Pep Amores"
                loading="lazy"
                className="w-full h-auto block rounded-none"
              />
            </div>
            <figcaption className="font-sans text-[12px] text-[#8C8C97] mt-3">
              <span className="font-medium text-[#4A4A55]">{t.chapters.captionDouble3}</span>{' '}
              <span className="text-[#8C8C97]">{t.chapters.captionDouble3Sub}</span>
            </figcaption>
          </motion.div>

        </div>
      </section>

      {/* 5) EL PRÓLOGO */}
      <section className="max-w-[1200px] mx-auto px-6 py-12 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6 }}
          className="bg-[#EEF0FA] border-l-[3px] border-l-[#283583] p-8 md:p-12 rounded-[2px]"
        >
          <Sobretitulo text={t.foreword.eyebrow} />
          
          <h2 className="font-serif font-bold text-[32px] md:text-[40px] leading-[1.08] tracking-[-0.024em] text-[#14141A] mb-4">
            {t.foreword.title}
          </h2>

          <p className="font-sans text-[16px] md:text-[18px] text-[#4A4A55] leading-relaxed max-w-[64ch] mb-8">
            {t.foreword.text}
          </p>

          <a
            href={links.foreword}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 font-sans text-[14px] font-semibold text-[#283583] underline underline-offset-4 decoration-1 hover:text-[#1B2459] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#283583]"
          >
            <span>{t.foreword.link}</span>
            <span className="inline-block transition-transform duration-200 group-hover:translate-x-[5px]">→</span>
          </a>
        </motion.div>
      </section>

      {/* 6) LOS TRÍPTICOS */}
      <section className="max-w-[1200px] mx-auto px-6 py-16 md:py-24 border-t border-[#E3DFD7]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10"
        >
          <div>
            <Sobretitulo text={t.triptychs.eyebrow} />
            <p className="font-serif font-bold text-[28px] md:text-[36px] text-[#14141A] leading-tight">
              {t.triptychs.sentence}
            </p>
          </div>
          <a
            href={links.preview}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 font-sans text-[14px] font-semibold text-[#283583] underline underline-offset-4 decoration-1 hover:text-[#1B2459] shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#283583]"
          >
            <span>{t.triptychs.link}</span>
            <span className="inline-block transition-transform duration-200 group-hover:translate-x-[5px]">→</span>
          </a>
        </motion.div>

        {/* Tríptico 1 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6 }}
          className="mb-14"
        >
          <div className="bg-white border border-[#E3DFD7] p-2 md:p-3 shadow-sm rounded-none">
            <img
              src="https://gpsphotobook.vercel.app/kit/triptico.jpg"
              alt="Tríptico desplegable del libro GPS en Rapa Nui, isla de Pascua, Chile"
              loading="lazy"
              className="w-full h-auto block rounded-none"
            />
          </div>
          <figcaption className="font-sans text-[12px] text-[#8C8C97] mt-3 text-right">
            {t.triptychs.captionTriptych1}
          </figcaption>
        </motion.div>

        {/* Tríptico 2 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="bg-white border border-[#E3DFD7] p-2 md:p-3 shadow-sm rounded-none">
            <img
              src="https://gpsphotobook.vercel.app/kit/triptico-2.jpg"
              alt="Tríptico desplegable del libro GPS en Desierto de Atacama, Chile"
              loading="lazy"
              className="w-full h-auto block rounded-none"
            />
          </div>
          <figcaption className="font-sans text-[12px] text-[#8C8C97] mt-3 text-right">
            {t.triptychs.captionTriptych2}
          </figcaption>
        </motion.div>
      </section>

      {/* 7) LA EDICIÓN */}
      <section className="max-w-[1200px] mx-auto px-6 py-16 md:py-24 border-t border-[#E3DFD7]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Izquierda: Descripción editorial */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5"
          >
            <Sobretitulo text={t.edition.eyebrow} />
            <h2 className="font-serif font-bold text-[36px] md:text-[44px] leading-[1.04] tracking-[-0.024em] text-[#14141A] mb-6">
              {t.edition.title}
            </h2>
            <p className="font-sans text-[16px] text-[#4A4A55] leading-relaxed mb-8">
              {t.edition.desc}
            </p>
            <a
              href={links.book}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 font-sans text-[14px] font-semibold text-[#283583] underline underline-offset-4 decoration-1 hover:text-[#1B2459] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#283583]"
            >
              <span>{t.edition.link}</span>
              <span className="inline-block transition-transform duration-200 group-hover:translate-x-[5px]">→</span>
            </a>
          </motion.div>

          {/* Derecha: Ficha técnica con filetes finos */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="lg:col-span-7 bg-white border border-[#E3DFD7] p-6 md:p-8 rounded-[2px] shadow-sm"
          >
            <div className="divide-y divide-[#E3DFD7]">
              
              <div className="py-3.5 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                <span className="font-sans text-[12px] font-semibold tracking-[0.11em] text-[#8C8C97] uppercase">
                  {t.edition.formatLabel}
                </span>
                <span className="font-serif font-bold text-[18px] text-[#14141A]">
                  {t.edition.formatVal}
                </span>
              </div>

              <div className="py-3.5 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                <span className="font-sans text-[12px] font-semibold tracking-[0.11em] text-[#8C8C97] uppercase">
                  {t.edition.pagesLabel}
                </span>
                <span className="font-serif font-bold text-[18px] text-[#14141A]">
                  {t.edition.pagesVal}
                </span>
              </div>

              <div className="py-3.5 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                <span className="font-sans text-[12px] font-semibold tracking-[0.11em] text-[#8C8C97] uppercase">
                  {t.edition.photosLabel}
                </span>
                <span className="font-serif font-bold text-[18px] text-[#14141A]">
                  {t.edition.photosVal}
                </span>
              </div>

              <div className="py-3.5 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                <span className="font-sans text-[12px] font-semibold tracking-[0.11em] text-[#8C8C97] uppercase">
                  {t.edition.weightLabel}
                </span>
                <span className="font-serif font-bold text-[18px] text-[#14141A]">
                  {t.edition.weightVal}
                </span>
              </div>

              <div className="py-3.5 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                <span className="font-sans text-[12px] font-semibold tracking-[0.11em] text-[#8C8C97] uppercase">
                  {t.edition.langsLabel}
                </span>
                <span className="font-serif font-bold text-[18px] text-[#14141A]">
                  {t.edition.langsVal}
                </span>
              </div>

              <div className="py-3.5 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                <span className="font-sans text-[12px] font-semibold tracking-[0.11em] text-[#8C8C97] uppercase">
                  {t.edition.isbnLabel}
                </span>
                <span className="font-serif font-bold text-[18px] text-[#14141A]">
                  {t.edition.isbnVal}
                </span>
              </div>

              <div className="py-3.5 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                <span className="font-sans text-[12px] font-semibold tracking-[0.11em] text-[#8C8C97] uppercase">
                  {t.edition.copiesLabel}
                </span>
                <span className="font-serif font-bold text-[18px] text-[#14141A]">
                  {t.edition.copiesVal}
                </span>
              </div>

            </div>
          </motion.div>

        </div>
      </section>

      {/* 8) LOS AUTORES */}
      <section className="max-w-[1200px] mx-auto px-6 py-16 md:py-24 border-t border-[#E3DFD7]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <Sobretitulo text={t.authors.eyebrow} />
          <h2 className="font-serif font-bold text-[36px] md:text-[44px] leading-[1.04] tracking-[-0.024em] text-[#14141A]">
            {t.authors.title}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          
          {/* Gabriel Brau */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6 }}
            className="p-6 bg-white border border-[#E3DFD7] rounded-[2px]"
          >
            <h3 className="font-serif font-bold text-[24px] text-[#14141A] mb-2">
              Gabriel Brau
            </h3>
            <a
              href="https://www.gabrielbrau.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-sans text-[14px] text-[#283583] hover:text-[#1B2459] underline underline-offset-4 decoration-1 transition-colors"
            >
              www.gabrielbrau.com
            </a>
          </motion.div>

          {/* Pep Amores */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="p-6 bg-white border border-[#E3DFD7] rounded-[2px]"
          >
            <h3 className="font-serif font-bold text-[24px] text-[#14141A] mb-2">
              Pep Amores
            </h3>
            <span className="font-sans text-[14px] text-[#8C8C97]">
              www.pepamores.com
            </span>
          </motion.div>

          {/* Tino Soriano */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="p-6 bg-white border border-[#E3DFD7] rounded-[2px]"
          >
            <h3 className="font-serif font-bold text-[24px] text-[#14141A] mb-2">
              Tino Soriano
            </h3>
            <a
              href="https://www.tinosoriano.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-sans text-[14px] text-[#283583] hover:text-[#1B2459] underline underline-offset-4 decoration-1 transition-colors"
            >
              www.tinosoriano.com
            </a>
          </motion.div>

        </div>

        <a
          href={links.authors}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-2 font-sans text-[14px] font-semibold text-[#283583] underline underline-offset-4 decoration-1 hover:text-[#1B2459] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#283583]"
        >
          <span>{t.authors.link}</span>
          <span className="inline-block transition-transform duration-200 group-hover:translate-x-[5px]">→</span>
        </a>
      </section>

      {/* 9) PRESENTACIONES */}
      <section className="max-w-[1200px] mx-auto px-6 py-16 md:py-24 border-t border-[#E3DFD7]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <Sobretitulo text={t.events.eyebrow} />
          <h2 className="font-serif font-bold text-[36px] md:text-[44px] leading-[1.04] tracking-[-0.024em] text-[#14141A]">
            {t.events.title}
          </h2>
        </motion.div>

        {/* Lista con filetes finos */}
        <div className="bg-white border border-[#E3DFD7] rounded-[2px] divide-y divide-[#E3DFD7] mb-10 shadow-sm">
          
          {/* Fila 1: 27 Octubre 2026 */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6 }}
            className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-center justify-center min-w-[70px]">
                <span className="font-serif italic text-[#283583] text-[40px] leading-none">
                  27
                </span>
                <span className="font-sans text-[12px] font-semibold uppercase tracking-wider text-[#8C8C97] mt-1">
                  {t.events.octMonth}
                </span>
              </div>
              <div className="h-10 w-px bg-[#E3DFD7] hidden sm:block" />
              <div>
                <span className="font-sans text-[15px] font-semibold text-[#14141A] block">
                  {t.events.ev1Day}, {t.events.time}
                </span>
                <span className="font-serif font-bold text-[18px] text-[#283583]">
                  Leica Store Madrid
                </span>
              </div>
            </div>
          </motion.div>

          {/* Fila 2: 17 Noviembre 2026 */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-center justify-center min-w-[70px]">
                <span className="font-serif italic text-[#283583] text-[40px] leading-none">
                  17
                </span>
                <span className="font-sans text-[12px] font-semibold uppercase tracking-wider text-[#8C8C97] mt-1">
                  {t.events.novMonth}
                </span>
              </div>
              <div className="h-10 w-px bg-[#E3DFD7] hidden sm:block" />
              <div>
                <span className="font-sans text-[15px] font-semibold text-[#14141A] block">
                  {t.events.ev2Day}, {t.events.time}
                </span>
                <span className="font-serif font-bold text-[18px] text-[#283583]">
                  Leica Store Barcelona
                </span>
              </div>
            </div>
          </motion.div>

          {/* Fila 3: 23 Noviembre 2026 */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-center justify-center min-w-[70px]">
                <span className="font-serif italic text-[#283583] text-[40px] leading-none">
                  23
                </span>
                <span className="font-sans text-[12px] font-semibold uppercase tracking-wider text-[#8C8C97] mt-1">
                  {t.events.novMonth}
                </span>
              </div>
              <div className="h-10 w-px bg-[#E3DFD7] hidden sm:block" />
              <div>
                <span className="font-sans text-[15px] font-semibold text-[#14141A] block">
                  {t.events.ev3Day}, {t.events.time}
                </span>
                <span className="font-serif font-bold text-[18px] text-[#283583]">
                  Leica Store Barcelona
                </span>
              </div>
            </div>
          </motion.div>

        </div>

        <div>
          <a
            href={links.events}
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-[2px] bg-transparent border border-[#283583] text-[#283583] font-sans text-[14px] font-semibold uppercase tracking-[0.11em] px-[2.4em] py-[1.15em] hover:bg-[#283583] hover:text-white hover:-translate-y-[1px] transition-all inline-flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#283583]"
          >
            <span>{t.events.btn}</span>
            <span className="inline-block transition-transform duration-200 group-hover:translate-x-[5px]">→</span>
          </a>
        </div>
      </section>

      {/* 10) EN PRENSA (DISCRETO) */}
      <section className="max-w-[1200px] mx-auto px-6 py-16 md:py-20 border-t border-[#E3DFD7]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6 }}
        >
          <Sobretitulo text={t.press.eyebrow} />
          
          <div className="bg-white border border-[#E3DFD7] p-6 md:p-8 rounded-[2px] shadow-sm mb-6">
            <p className="font-sans text-[12px] font-semibold tracking-[0.155em] text-[#8C8C97] uppercase mb-3">
              {t.press.outlet}
            </p>
            <a
              href={links.pressArticle}
              target="_blank"
              rel="noopener noreferrer"
              className="group block"
            >
              <h3 className="font-serif font-bold text-[20px] md:text-[22px] text-[#14141A] group-hover:text-[#283583] transition-colors leading-snug mb-3">
                {t.press.headline}
              </h3>
              <span className="inline-flex items-center gap-1 font-sans text-[13px] font-semibold text-[#283583] group-hover:underline">
                {t.press.readArticle}
              </span>
            </a>
          </div>

          <a
            href={links.press}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 font-sans text-[13px] font-medium text-[#283583] underline underline-offset-4 decoration-1 hover:text-[#1B2459] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#283583]"
          >
            <span>{t.press.pressMaterial}</span>
            <span className="inline-block transition-transform duration-200 group-hover:translate-x-[5px]">→</span>
          </a>
        </motion.div>
      </section>

      {/* 11) LA BANDA AZUL FINAL (FONDO AZUL GPS #283583 A TODO EL ANCHO) */}
      <section className="w-full bg-[#283583] text-white py-16 md:py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10 md:gap-8">
            
            {/* Izquierda: Texto de la edición */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6 }}
              className="max-w-[480px] text-center lg:text-left"
            >
              <h2 className="font-serif font-bold text-[32px] md:text-[40px] leading-tight text-white mb-3">
                {t.finalBand.title}
              </h2>
              <p className="font-sans text-[15px] text-white/80 leading-relaxed">
                {t.finalBand.details}
              </p>
            </motion.div>

            {/* Centro: Libro en 3D pequeño flotando */}
            <div className="shrink-0 flex justify-center">
              <a
                href={links.home}
                target="_blank"
                rel="noopener noreferrer"
                className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
                aria-label={t.hero.btnSecondary}
              >
                <motion.div
                  animate={shouldReduceMotion ? {} : { y: [-3, 3, -3] }}
                  transition={shouldReduceMotion ? {} : { duration: 5.2, repeat: Infinity, ease: 'easeInOut' }}
                  className="flex justify-center"
                >
                  <img
                    src="https://gpsphotobook.vercel.app/kit/libro-gps.webp"
                    alt="Libro de fotografía GPS"
                    width={160}
                    height={206}
                    loading="lazy"
                    className="w-[140px] md:w-[160px] h-auto drop-shadow-2xl transition-transform duration-300 group-hover:scale-105"
                  />
                </motion.div>
              </a>
            </div>

            {/* Derecha: Botones */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6 }}
              className="flex flex-col sm:flex-row lg:flex-col gap-4 w-full sm:w-auto"
            >
              <a
                href={links.reserve}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-[2px] bg-white text-[#283583] font-sans text-[14px] font-semibold uppercase tracking-[0.11em] px-[2.4em] py-[1.15em] hover:bg-[#EEF0FA] hover:-translate-y-[1px] transition-all inline-flex items-center justify-center gap-2 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
              >
                <span>{t.finalBand.btnReserve}</span>
                <span className="inline-block transition-transform duration-200 group-hover:translate-x-[5px]">→</span>
              </a>

              <a
                href={links.companies}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-[2px] bg-transparent border border-white text-white font-sans text-[14px] font-semibold uppercase tracking-[0.11em] px-[2.4em] py-[1.15em] hover:bg-white hover:text-[#283583] hover:-translate-y-[1px] transition-all inline-flex items-center justify-center gap-2 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
              >
                <span>{t.finalBand.btnCompanies}</span>
                <span className="inline-block transition-transform duration-200 group-hover:translate-x-[5px]">→</span>
              </a>
            </motion.div>

          </div>
        </div>
      </section>

    </div>
  );
};
