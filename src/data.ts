export interface Photo {
  id: number;
  title: string;
  country: string;
  year: number;
  tags: string[];
  lfi?: string;
  fav: boolean;
  score: number;
  img: string;
}

export const DB: Photo[] = [
  { id: 1, title: "El Monje Solitario", country: "Myanmar", year: 2023, tags: ["retrato", "asia", "bw", "espiritual"], lfi: "mastershot", fav: true, score: 98, img: "https://images.unsplash.com/photo-1505676101150-1c23f2603893?auto=format&fit=crop&w=1200&q=80" },
  { id: 2, title: "Geometría Urbana", country: "Japón", year: 2024, tags: ["urbano", "arquitectura", "asia", "moderno"], lfi: "exhibition", fav: true, score: 92, img: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80" },
  { id: 3, title: "Ojos del Desierto", country: "Marruecos", year: 2022, tags: ["retrato", "africa", "color"], lfi: "mastershot", fav: true, score: 99, img: "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?auto=format&fit=crop&w=1200&q=80" },
  { id: 4, title: "Lluvia en Tokio", country: "Japón", year: 2024, tags: ["calle", "noche", "asia", "neon"], fav: true, score: 95, img: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80" },
  { id: 5, title: "Amanecer Andino", country: "Perú", year: 2021, tags: ["paisaje", "americalatina", "naturaleza"], fav: true, score: 88, img: "https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=1200&q=80" },
  { id: 6, title: "Mercado de Especias", country: "India", year: 2023, tags: ["mercado", "asia", "color", "gente"], fav: true, score: 85, img: "https://images.unsplash.com/photo-1544646738-42299b908757?auto=format&fit=crop&w=1200&q=80" },
  { id: 7, title: "Invierno en Pirineos", country: "España", year: 2024, tags: ["paisaje", "europa", "nieve", "blanco"], fav: true, score: 90, img: "https://images.unsplash.com/photo-1483664852095-d6cc6870702d?auto=format&fit=crop&w=1200&q=80" },
  { id: 8, title: "Silencio Azul", country: "Islandia", year: 2022, tags: ["paisaje", "europa", "minimal"], fav: false, score: 70, img: "https://images.unsplash.com/photo-1476610182048-b716b8518aae?auto=format&fit=crop&w=1200&q=80" },
  { id: 9, title: "Caos Organizado", country: "Vietnam", year: 2023, tags: ["calle", "asia", "trafico"], fav: false, score: 65, img: "https://images.unsplash.com/photo-1495570689269-d88366224d8b?auto=format&fit=crop&w=1200&q=80" },
  { id: 10, title: "Sombras Catalanas", country: "España", year: 2023, tags: ["calle", "europa", "bw"], fav: true, score: 82, img: "https://images.unsplash.com/photo-1511527661048-92f03943d053?auto=format&fit=crop&w=1200&q=80" },
  { id: 11, title: "Retrato de Pekín", country: "China", year: 2020, tags: ["retrato", "asia", "cultura"], fav: false, score: 60, img: "https://images.unsplash.com/photo-1535498730771-e735b998cd64?auto=format&fit=crop&w=1200&q=80" },
  { id: 12, title: "La Habana Vieja", country: "Cuba", year: 2021, tags: ["calle", "americalatina", "color"], fav: false, score: 65, img: "https://images.unsplash.com/photo-1503917988258-f87a78e3c995?auto=format&fit=crop&w=1200&q=80" },
  { id: 13, title: "Muralla Invernal", country: "China", year: 2020, tags: ["paisaje", "asia", "historia"], fav: true, score: 80, img: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=1200&q=80" },
  { id: 14, title: "Autos Clásicos", country: "Cuba", year: 2021, tags: ["calle", "americalatina", "coches"], fav: true, score: 75, img: "https://images.unsplash.com/photo-1524230659092-07f99a75c013?auto=format&fit=crop&w=1200&q=80" }
];

export const Strings = {
  es: { 
    nav: ["Inicio", "Viajes", "Explorar", "Favoritas", "LFI", "Contacto"], 
    titles: { home: "Historias Visuales", explore: "Explorar Archivo", fav: "Colección Favorita", lfi: "Leica Fotografie International", journeys: "Diarios de Viaje", contact: "Contacto" },
    subtitles: { home: "Fotografía Documental y de Viajes", lfi: "Selecciones Oficiales LFI Gallery" },
    labels: { search: "Buscar foto, país o tag...", clear: "Limpiar filtros", results: "fotos encontradas", viewTrip: "Ver Álbum", name: "Nombre", msg: "Mensaje", send: "Enviar Mensaje" }
  },
  en: { 
    nav: ["Home", "Journeys", "Explore", "Favorites", "LFI", "Contact"], 
    titles: { home: "Visual Stories", explore: "Explore Archive", fav: "Curated Favorites", lfi: "Leica Fotografie International", journeys: "Travel Journals", contact: "Contact" },
    subtitles: { home: "Documentary & Travel Photography", lfi: "Official LFI Gallery Selections" },
    labels: { search: "Search photo, country or tag...", clear: "Clear filters", results: "photos found", viewTrip: "View Album", name: "Name", msg: "Message", send: "Send Message" }
  },
  ca: { 
    nav: ["Inici", "Viatges", "Explorar", "Preferides", "LFI", "Contacte"], 
    titles: { home: "Històries Visuals", explore: "Explorar Arxiu", fav: "Col·lecció Preferida", lfi: "Leica Fotografie International", journeys: "Diaris de Viatge", contact: "Contacte" },
    subtitles: { home: "Fotografia Documental i de Viatges", lfi: "Seleccions Oficials LFI Gallery" },
    labels: { search: "Cerca foto, país o tag...", clear: "Netejar filtres", results: "fotos trobades", viewTrip: "Veure Àlbum", name: "Nom", msg: "Missatge", send: "Enviar Missatge" }
  }
};
