import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ExternalLink, Info, X, Star, Film, Video, PlayCircle, Clapperboard } from 'lucide-react';

interface MyMoviesProps {
  lang: 'es' | 'en' | 'ca';
}

interface Movie {
  id: string;
  title: string;
  year: string | number;
  type: string;
  role: string;
  character?: string;
  status?: string;
  score?: number | null;
  imdbLink?: string;
  description?: string;
  image?: string;
}

const knownFor: Movie[] = [
  {
    id: 'kf1',
    title: 'Els pares dels Àngels',
    year: 2021,
    type: 'Cortometraje',
    role: 'Executive Producer / Producer / Co-creator',
  },
  {
    id: 'kf2',
    title: 'JOSB - Un somni in crescendo',
    year: 'En producción',
    type: 'Película',
    role: 'Executive Producer / Producer / Writer',
  },
  {
    id: 'kf3',
    title: 'La Passió segons Pep Amores',
    year: 2021,
    type: 'Película (Comedia / Documental)',
    score: 8.6,
    role: 'Executive Producer / Producer / Actor (como "Pep")',
  },
  {
    id: 'kf4',
    title: 'Camino a Chicuelo',
    year: 2022,
    type: 'Documental',
    score: 8.2,
    role: 'Producer',
  }
];

const producerUpcoming: Movie[] = [
  {
    id: 'pu1',
    title: 'Muros Invisibles',
    year: 'Desconocida',
    type: 'Cortometraje (Short)',
    role: 'Executive Producer',
    status: 'Pre-production',
  },
  {
    id: 'pu2',
    title: 'Ukraine, the Last War',
    year: 'Desconocida',
    type: 'Película',
    role: 'Producer',
    status: 'In Production',
  },
  {
    id: 'pu3',
    title: 'JOSB - Un somni in crescendo',
    year: 'Desconocida',
    type: 'Película',
    role: 'Executive Producer, Producer',
    status: 'In Production',
  }
];

const producerPrevious: Movie[] = [
  {
    id: 'pp1',
    title: 'Camino a Chicuelo',
    year: 2022,
    type: 'Documental',
    role: 'Producer',
    score: 8.2,
    imdbLink: 'https://www.imdb.com/title/tt21441412/',
    description: 'Documental musical sobre Juan Gómez "Chicuelo", compositor y guitarrista flamenco. Producido por Morris Films, dirigido por Luís Gibert. 5 candidaturas a las nominaciones de los Premios Goya 2023.'
  },
  {
    id: 'pp2',
    title: 'Els pares dels Àngels',
    year: 2021,
    type: 'Cortometraje (Short)',
    role: 'Executive Producer / Producer',
    score: null,
    description: 'Cortometraje co-creado por Pep Amores.'
  },
  {
    id: 'pp3',
    title: 'La Passió segons Pep Amores',
    year: 2021,
    type: 'Película (Comedia)',
    role: 'Executive Producer / Producer',
    score: 8.6,
    imdbLink: 'https://www.imdb.com/title/tt14233396/',
    description: 'Pep reúne a tres directores de informática, músicos amateur, para proponerles hacer una película que termine con un gran concierto que les lleve a la fama. Dirigida por Júlia Girós, Pol Picas y Nina Solà.'
  },
  {
    id: 'pp4',
    title: "La llum d'Elna",
    year: 2017,
    type: 'TV Movie',
    role: 'Associate Producer',
    score: 6.8,
    description: 'Película para televisión.'
  },
  {
    id: 'pp5',
    title: 'Voyeur',
    year: 2016,
    type: 'Película',
    role: 'Associate Producer',
    score: 7.5,
    description: 'Película en la que Pep Amores participó como associate producer.'
  },
  {
    id: 'pp6',
    title: 'La Xirgu',
    year: 2015,
    type: 'TV Movie',
    role: 'Associate Producer',
    score: 7.4,
    imdbLink: 'https://www.imdb.com/title/tt4521400/',
    description: 'Película biográfica para televisión dirigida por Sílvia Quer, con Laia Marull y Fran Perea.'
  },
  {
    id: 'pp7',
    title: 'How Jimmy Got Leverage',
    year: 2012,
    type: 'Cortometraje (Short)',
    role: 'Executive Producer',
    score: null,
    description: 'Cortometraje producido ejecutivamente por Pep Amores.'
  },
  {
    id: 'pp8',
    title: 'Concepción Arenal, la visitadora de cárceles',
    year: 2012,
    type: 'TV Movie',
    role: 'Associate Producer',
    score: 7.2,
    imdbLink: 'https://www.imdb.com/title/tt2207519/',
    description: 'Película biográfica para televisión sobre Concepción Arenal, pionera feminista y visitadora de cárceles en España. Dirigida por Laura Mañá, protagonizada por Blanca Portillo.'
  },
  {
    id: 'pp9',
    title: 'The Wild Ones (Los salvajes)',
    year: 2012,
    type: 'Película',
    role: 'Associate Producer',
    score: 6.2,
    imdbLink: 'https://www.imdb.com/title/tt1986825/',
    description: 'Película en la que Pep Amores participó tanto como associate producer como actor (papel de Miquel).'
  },
  {
    id: 'pp10',
    title: 'Clara Campoamor. La mujer olvidada',
    year: 2011,
    type: 'TV Movie',
    role: 'Associate Producer',
    score: 6.8,
    imdbLink: 'https://www.imdb.com/title/tt1743229/',
    description: 'Película biográfica para televisión sobre Clara Campoamor, la primera mujer en dirigirse a la asamblea constituyente de España defendiendo el sufragio femenino. Dirigida por Laura Mañá, con Elvira Mínguez y Antonio de la Torre.'
  },
  {
    id: 'pp11',
    title: 'The Great Vazquez (El gran Vázquez)',
    year: 2010,
    type: 'Película',
    role: 'Associate Producer',
    score: 6.2,
    imdbLink: 'https://www.imdb.com/title/tt1525915/',
    description: 'Comedia biográfica sobre Manuel Vázquez, el mejor dibujante de cómics de la España de los años 60. Dirigida por Óscar Aibar, protagonizada por Santiago Segura. Nominada al Goya al mejor actor secundario. Presentada en el Festival de San Sebastián 2010.'
  }
];

const actorPrevious: Movie[] = [
  {
    id: 'ap1',
    title: 'La Passió segons Pep Amores',
    year: 2021,
    type: 'Película (Comedia)',
    role: 'Actor',
    character: 'Pep',
    score: 8.6,
    imdbLink: 'https://www.imdb.com/title/tt14233396/'
  },
  {
    id: 'ap2',
    title: 'La Xirgu',
    year: 2015,
    type: 'TV Movie',
    role: 'Actor',
    character: 'Aduladors',
    score: 7.4,
    imdbLink: 'https://www.imdb.com/title/tt4521400/'
  },
  {
    id: 'ap3',
    title: 'Concepción Arenal, la visitadora de cárceles',
    year: 2012,
    type: 'TV Movie',
    role: 'Actor',
    character: 'Juez 2',
    score: 7.2,
    imdbLink: 'https://www.imdb.com/title/tt2207519/'
  },
  {
    id: 'ap4',
    title: 'The Wild Ones (Los salvajes)',
    year: 2012,
    type: 'Película',
    role: 'Actor',
    character: 'Miquel',
    score: 6.2,
    imdbLink: 'https://www.imdb.com/title/tt1986825/'
  },
  {
    id: 'ap5',
    title: 'Clara Campoamor. La mujer olvidada',
    year: 2011,
    type: 'TV Movie',
    role: 'Actor',
    character: 'Suárez Picallo',
    score: 6.8,
    imdbLink: 'https://www.imdb.com/title/tt1743229/'
  }
];

const writerUpcoming: Movie[] = [
  {
    id: 'wu1',
    title: 'JOSB - Un somni in crescendo',
    year: 'Desconocida',
    type: 'Película',
    role: 'Writer',
    status: 'In Production'
  }
];

const writerPrevious: Movie[] = [
  {
    id: 'wp1',
    title: 'Els pares dels Àngels',
    year: 2021,
    type: 'Cortometraje (Short)',
    role: 'Co-creator (Creator)',
    score: null
  }
];

const Badge = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>
    {children}
  </span>
);

const MoviePlaceholder = ({ type }: { type?: string }) => {
  return (
    <div className="w-full h-full bg-neutral-100 flex items-center justify-center text-neutral-300 rounded-lg border border-neutral-200">
      {type?.toLowerCase().includes('tv') ? <Video size={32} /> : 
       type?.toLowerCase().includes('corto') || type?.toLowerCase().includes('short') ? <Clapperboard size={32} /> : 
       <Film size={32} />}
    </div>
  );
};

export const MyMovies: React.FC<MyMoviesProps> = ({ lang }) => {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  const t = {
    es: {
      title: "Las Películas de Pep Amores",
      desc: "Además de ser fotógrafo y emprendedor, Pep Amores tiene una faceta como actor, productor y guionista en la industria cinematográfica. Pep ha participado en la producción de numerosas películas y cortometrajes, ha actuado en varias producciones y ha co-creado guiones. Su filmografía abarca desde documentales hasta películas de televisión y cortometrajes.",
      roles: ["Productor", "Actor", "Guionista"],
      imdbBtn: "Ver perfil en IMDb",
      knownFor: "Conocido por",
      producer: "Productor",
      actor: "Actor",
      writer: "Guionista",
      upcoming: "Próximamente",
      previous: "Anteriores",
      production: "Producción",
      viewImdb: "Ver en IMDb",
      close: "Cerrar"
    },
    en: {
      title: "Pep Amores' Movies",
      desc: "In addition to being a photographer and entrepreneur, Pep Amores has a facet as an actor, producer, and screenwriter in the film industry. Pep has participated in the production of numerous films and short films, has acted in several productions, and has co-created scripts. His filmography ranges from documentaries to television movies and short films.",
      roles: ["Producer", "Actor", "Writer"],
      imdbBtn: "View IMDb profile",
      knownFor: "Known for",
      producer: "Producer",
      actor: "Actor",
      writer: "Writer",
      upcoming: "Upcoming",
      previous: "Previous",
      production: "Production",
      viewImdb: "View on IMDb",
      close: "Close"
    },
    ca: {
      title: "Les Pel·lícules de Pep Amores",
      desc: "A més de ser fotògraf i emprenedor, Pep Amores té una faceta com a actor, productor i guionista a la indústria cinematogràfica. Pep ha participat en la producció de nombroses pel·lícules i curtmetratges, ha actuat en diverses produccions i ha co-creat guions. La seva filmografia abasta des de documentals fins a pel·lícules de televisió i curtmetratges.",
      roles: ["Productor", "Actor", "Guionista"],
      imdbBtn: "Veure perfil a IMDb",
      knownFor: "Conegut per",
      producer: "Productor",
      actor: "Actor",
      writer: "Guionista",
      upcoming: "Pròximament",
      previous: "Anteriors",
      production: "Producció",
      viewImdb: "Veure a IMDb",
      close: "Tancar"
    }
  }[lang];

  const renderMovieRow = (movie: Movie, isUpcoming = false) => (
    <motion.div 
      key={movie.id}
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`flex items-center gap-4 p-4 rounded-2xl transition-all hover:bg-neutral-50 border border-transparent hover:border-neutral-100 ${isUpcoming ? 'opacity-80 border-dashed border-neutral-200' : ''}`}
    >
      <div className="w-16 h-24 md:w-20 md:h-28 shrink-0">
        {movie.image ? (
          <img src={movie.image} alt={movie.title} className="w-full h-full object-cover rounded-lg shadow-sm" />
        ) : (
          <MoviePlaceholder type={movie.type} />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-lg text-neutral-900 truncate">{movie.title}</h4>
        <div className="text-sm text-neutral-600 mt-1">
          <span className="font-medium">{movie.role}</span>
          {movie.character && <span className="text-neutral-500"> como <span className="italic">{movie.character}</span></span>}
        </div>
        <div className="text-xs text-neutral-500 mt-1 flex items-center gap-2">
          <span>{movie.type}</span>
          {movie.status && (
            <>
              <span>•</span>
              <span className="text-[#B45309]">{movie.status}</span>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col items-end gap-2 shrink-0">
        <div className="text-sm font-medium text-neutral-500">{movie.year}</div>
        {!isUpcoming && (
          <div className="flex items-center gap-1 text-sm font-medium">
            {movie.score ? (
              <>
                <Star size={14} className="fill-[#f5c518] text-[#f5c518]" />
                <span>{movie.score.toFixed(1)}</span>
              </>
            ) : (
              <span className="text-neutral-400">—</span>
            )}
          </div>
        )}
        <button 
          onClick={() => setSelectedMovie(movie)}
          className="p-2 text-neutral-400 hover:text-[#B45309] hover:bg-[#B45309]/10 rounded-full transition-colors mt-1"
          aria-label="Info"
        >
          <Info size={18} />
        </button>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-white pt-32 pb-24 px-6 md:px-12 max-w-6xl mx-auto">
      {/* HERO SECTION */}
      <section className="mb-20">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold tracking-tight text-neutral-900 mb-6"
        >
          {t.title}
        </motion.h1>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-3xl"
        >
          <p className="text-lg text-neutral-600 leading-relaxed mb-8">
            {t.desc}
          </p>
          
          <div className="flex flex-wrap items-center gap-3 mb-8">
            {t.roles.map((role, i) => (
              <React.Fragment key={role}>
                <span className="text-sm font-medium tracking-wider uppercase text-neutral-800 bg-neutral-100 px-4 py-1.5 rounded-full">
                  {role}
                </span>
                {i < t.roles.length - 1 && <span className="text-neutral-300">•</span>}
              </React.Fragment>
            ))}
          </div>

          <a 
            href="https://www.imdb.com/es-es/name/nm4055880/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#f5c518] hover:bg-[#e2b616] text-black font-semibold rounded-xl transition-colors shadow-sm"
          >
            <PlayCircle size={18} />
            {t.imdbBtn}
            <ExternalLink size={14} className="ml-1 opacity-70" />
          </a>
        </motion.div>
      </section>

      {/* KNOWN FOR */}
      <section className="mb-24">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-1 h-6 bg-[#f5c518] rounded-full"></div>
          <h2 className="text-2xl font-bold text-neutral-900">{t.knownFor}</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {knownFor.map((movie, i) => (
            <motion.div 
              key={movie.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group flex flex-col bg-white rounded-2xl border border-neutral-100 shadow-sm hover:shadow-md transition-all overflow-hidden cursor-pointer"
              onClick={() => setSelectedMovie(movie)}
            >
              <div className="aspect-[2/3] w-full bg-neutral-100 relative overflow-hidden">
                {movie.image ? (
                  <img src={movie.image} alt={movie.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <MoviePlaceholder type={movie.type} />
                )}
                {movie.score && (
                  <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md text-white px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1">
                    <Star size={12} className="fill-[#f5c518] text-[#f5c518]" />
                    {movie.score.toFixed(1)}
                  </div>
                )}
              </div>
              <div className="p-5 flex flex-col flex-1">
                <h3 className="font-semibold text-neutral-900 line-clamp-2 mb-1 group-hover:text-[#B45309] transition-colors">{movie.title}</h3>
                <div className="text-sm text-neutral-500 mb-3">{movie.year} • {movie.type}</div>
                <div className="mt-auto text-xs font-medium text-neutral-600 line-clamp-2">{movie.role}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* PRODUCER CREDITS */}
      <section className="mb-20">
        <div className="flex items-center gap-3 mb-8 border-b border-neutral-100 pb-4">
          <h2 className="text-2xl font-bold text-neutral-900">{t.producer}</h2>
          <Badge className="bg-neutral-100 text-neutral-600">14</Badge>
        </div>

        {/* Upcoming */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6 px-4">
            <h3 className="text-lg font-semibold text-neutral-800">{t.upcoming}</h3>
            <Badge className="bg-blue-50 text-blue-600">3</Badge>
          </div>
          <div className="flex flex-col gap-2">
            {producerUpcoming.map(m => renderMovieRow(m, true))}
          </div>
        </div>

        {/* Previous */}
        <div>
          <div className="flex items-center gap-3 mb-6 px-4">
            <h3 className="text-lg font-semibold text-neutral-800">{t.previous}</h3>
            <Badge className="bg-neutral-100 text-neutral-600">11</Badge>
          </div>
          <div className="flex flex-col gap-2">
            {producerPrevious.map(m => renderMovieRow(m))}
          </div>
        </div>
      </section>

      {/* ACTOR CREDITS */}
      <section className="mb-20">
        <div className="flex items-center gap-3 mb-8 border-b border-neutral-100 pb-4">
          <h2 className="text-2xl font-bold text-neutral-900">{t.actor}</h2>
          <Badge className="bg-neutral-100 text-neutral-600">5</Badge>
        </div>

        <div>
          <div className="flex items-center gap-3 mb-6 px-4">
            <h3 className="text-lg font-semibold text-neutral-800">{t.previous}</h3>
            <Badge className="bg-neutral-100 text-neutral-600">5</Badge>
          </div>
          <div className="flex flex-col gap-2">
            {actorPrevious.map(m => renderMovieRow(m))}
          </div>
        </div>
      </section>

      {/* WRITER CREDITS */}
      <section className="mb-20">
        <div className="flex items-center gap-3 mb-8 border-b border-neutral-100 pb-4">
          <h2 className="text-2xl font-bold text-neutral-900">{t.writer}</h2>
          <Badge className="bg-neutral-100 text-neutral-600">2</Badge>
        </div>

        {/* Upcoming */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6 px-4">
            <h3 className="text-lg font-semibold text-neutral-800">{t.upcoming}</h3>
            <Badge className="bg-blue-50 text-blue-600">1</Badge>
          </div>
          <div className="flex flex-col gap-2">
            {writerUpcoming.map(m => renderMovieRow(m, true))}
          </div>
        </div>

        {/* Previous */}
        <div>
          <div className="flex items-center gap-3 mb-6 px-4">
            <h3 className="text-lg font-semibold text-neutral-800">{t.previous}</h3>
            <Badge className="bg-neutral-100 text-neutral-600">1</Badge>
          </div>
          <div className="flex flex-col gap-2">
            {writerPrevious.map(m => renderMovieRow(m))}
          </div>
        </div>
      </section>

      {/* MODAL */}
      <AnimatePresence>
        {selectedMovie && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMovie(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <button 
                onClick={() => setSelectedMovie(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-black/10 hover:bg-black/20 text-black rounded-full backdrop-blur-md transition-colors"
              >
                <X size={20} />
              </button>

              <div className="flex flex-col sm:flex-row h-full overflow-y-auto">
                <div className="w-full sm:w-2/5 bg-neutral-100 shrink-0 aspect-[2/3] sm:aspect-auto relative">
                  {selectedMovie.image ? (
                    <img src={selectedMovie.image} alt={selectedMovie.title} className="w-full h-full object-cover" />
                  ) : (
                    <MoviePlaceholder type={selectedMovie.type} />
                  )}
                </div>
                
                <div className="p-6 sm:p-8 flex flex-col flex-1">
                  <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">{selectedMovie.title}</h2>
                  
                  <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-600 mb-6">
                    <span className="font-medium">{selectedMovie.year}</span>
                    <span>•</span>
                    <span>{selectedMovie.type}</span>
                    {selectedMovie.score && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-medium text-neutral-900">
                          <Star size={14} className="fill-[#f5c518] text-[#f5c518]" />
                          {selectedMovie.score.toFixed(1)}
                        </span>
                      </>
                    )}
                  </div>

                  <div className="space-y-4 mb-8 flex-1">
                    <div>
                      <div className="text-xs font-mono uppercase tracking-widest text-neutral-400 mb-1">Rol</div>
                      <div className="font-medium text-neutral-900">{selectedMovie.role}</div>
                    </div>
                    
                    {selectedMovie.character && (
                      <div>
                        <div className="text-xs font-mono uppercase tracking-widest text-neutral-400 mb-1">Personaje</div>
                        <div className="font-medium text-neutral-900">{selectedMovie.character}</div>
                      </div>
                    )}

                    {selectedMovie.description && (
                      <div>
                        <div className="text-xs font-mono uppercase tracking-widest text-neutral-400 mb-1">Sinopsis</div>
                        <p className="text-neutral-700 leading-relaxed text-sm">{selectedMovie.description}</p>
                      </div>
                    )}
                  </div>

                  {selectedMovie.imdbLink && (
                    <a 
                      href={selectedMovie.imdbLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-auto w-full py-3 px-4 bg-[#f5c518] hover:bg-[#e2b616] text-black font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
                    >
                      <PlayCircle size={18} />
                      {t.viewImdb}
                      <ExternalLink size={14} className="opacity-70" />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
