import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Globe, Monitor, Smartphone, Clock, ChevronDown, ChevronUp, Users, Plus, Minus, RotateCcw } from 'lucide-react';
import { formatDate } from '../../lib/utils';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { scaleLinear } from "d3-scale";

const geoUrl = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json";

interface Session {
  id: string;
  country: string;
  city: string;
  region?: string;
  device: string;
  browser?: string;
  timestamp: any;
}

export const SessionManager: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCountry, setExpandedCountry] = useState<string | null>(null);
  const [position, setPosition] = useState({ coordinates: [0, 0] as [number, number], zoom: 1 });

  useEffect(() => {
    const q = query(collection(db, 'sessions'), orderBy('timestamp', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setSessions(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Session[]);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  function handleZoomIn() {
    if (position.zoom >= 8) return;
    setPosition((pos) => ({ ...pos, zoom: pos.zoom * 1.5 }));
  }

  function handleZoomOut() {
    if (position.zoom <= 1) return;
    setPosition((pos) => ({ ...pos, zoom: pos.zoom / 1.5 }));
  }

  function handleReset() {
    setPosition({ coordinates: [0, 0], zoom: 1 });
  }

  function handleMoveEnd(position: { coordinates: [number, number]; zoom: number }) {
    setPosition(position);
  }

  const stats = useMemo(() => {
    const total = sessions.length;
    const byCountry: Record<string, { count: number, regions: Record<string, { count: number, cities: Record<string, number> }> }> = {};
    const byDevice: Record<string, number> = { 'Mobile': 0, 'Desktop': 0 };

    sessions.forEach(session => {
      const country = session.country || 'Unknown';
      const region = session.region || 'Unknown';
      const city = session.city || 'Unknown';
      const device = session.device || 'Desktop';

      if (!byCountry[country]) {
        byCountry[country] = { count: 0, regions: {} };
      }
      byCountry[country].count++;

      if (!byCountry[country].regions[region]) {
        byCountry[country].regions[region] = { count: 0, cities: {} };
      }
      byCountry[country].regions[region].count++;

      if (!byCountry[country].regions[region].cities[city]) {
        byCountry[country].regions[region].cities[city] = 0;
      }
      byCountry[country].regions[region].cities[city]++;

      if (device === 'Mobile') byDevice['Mobile']++;
      else byDevice['Desktop']++;
    });

    const countriesArray = Object.entries(byCountry).map(([name, data]) => ({
      name,
      count: data.count,
      percentage: total > 0 ? (data.count / total) * 100 : 0,
      regions: Object.entries(data.regions).map(([regionName, regionData]) => ({
        name: regionName,
        count: regionData.count,
        percentage: (regionData.count / data.count) * 100,
        cities: Object.entries(regionData.cities).map(([cityName, cityCount]) => ({
          name: cityName,
          count: cityCount,
          percentage: (cityCount / regionData.count) * 100
        })).sort((a, b) => b.count - a.count)
      })).sort((a, b) => b.count - a.count)
    })).sort((a, b) => b.count - a.count);

    return { total, countries: countriesArray, byDevice };
  }, [sessions]);

  const maxSessions = useMemo(() => {
    return Math.max(...stats.countries.map(c => c.count), 1);
  }, [stats]);

  const colorScale = scaleLinear<string>()
    .domain([0, maxSessions])
    .range(["#fef3c7", "#B45309"]); // Very light amber to brand tertiary

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Cargando estadísticas...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-serif italic mb-2">Estadísticas de Visitas</h2>
          <p className="text-gray-500">Analiza de dónde vienen tus visitantes y qué dispositivos usan.</p>
        </div>
        <div className="bg-brand-accent/10 border border-brand-accent/20 px-6 py-4 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 bg-brand-accent rounded-full flex items-center justify-center text-white">
            <Users size={24} />
          </div>
          <div>
            <div className="text-sm text-brand-accent font-bold uppercase tracking-widest">Total Sesiones</div>
            <div className="text-3xl font-serif italic">{stats.total}</div>
          </div>
        </div>
        
        <div className="bg-white border border-gray-100 px-6 py-4 rounded-2xl flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
              <Monitor size={16} />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Desktop</div>
              <div className="text-lg font-bold">{stats.byDevice['Desktop']}</div>
            </div>
          </div>
          <div className="w-px h-8 bg-gray-100" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
              <Smartphone size={16} />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Mobile</div>
              <div className="text-lg font-bold">{stats.byDevice['Mobile']}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-serif italic">Mapa de Visitantes</h3>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleZoomIn}
              className="p-2 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-100 text-gray-600 transition-colors"
              title="Aumentar zoom"
            >
              <Plus size={18} />
            </button>
            <button 
              onClick={handleZoomOut}
              className="p-2 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-100 text-gray-600 transition-colors"
              title="Disminuir zoom"
            >
              <Minus size={18} />
            </button>
            <button 
              onClick={handleReset}
              className="p-2 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-100 text-gray-600 transition-colors"
              title="Restablecer vista"
            >
              <RotateCcw size={18} />
            </button>
            <button 
              onClick={() => {
                setPosition({ coordinates: [-3.7, 40.4], zoom: 4 });
                setExpandedCountry('Spain');
              }}
              className="px-3 py-2 bg-brand-accent/10 hover:bg-brand-accent/20 rounded-lg border border-brand-accent/20 text-brand-accent text-xs font-bold transition-colors"
            >
              Ver España
            </button>
          </div>
        </div>
        
        <div className="w-full h-[400px] bg-neutral-50 rounded-2xl overflow-hidden border border-gray-100 relative group">
          <div className="absolute top-4 left-4 z-10 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-gray-100 text-[10px] font-bold uppercase tracking-widest text-gray-500 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
            Usa el ratón o gestos para mover y hacer zoom
          </div>
          
          <ComposableMap projectionConfig={{ scale: 140 }} width={800} height={400} className="w-full h-full touch-none">
            <ZoomableGroup
              zoom={position.zoom}
              center={position.coordinates}
              onMoveEnd={handleMoveEnd}
              maxZoom={8}
              minZoom={1}
            >
              <Geographies geography={geoUrl}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const countryName = geo.properties.name;
                    const countryData = stats.countries.find(c => 
                      c.name === countryName || 
                      (c.name === 'United States' && countryName === 'United States of America') ||
                      (c.name === 'Spain' && countryName === 'Spain')
                    );
                    const count = countryData ? countryData.count : 0;
                    
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={count > 0 ? colorScale(count) : "#EAEAEC"}
                        stroke="#FFFFFF"
                        strokeWidth={0.5}
                        style={{
                          default: { outline: "none" },
                          hover: { fill: count > 0 ? "#92400e" : "#D6D6DA", outline: "none", cursor: count > 0 ? "pointer" : "default" },
                          pressed: { outline: "none" },
                        }}
                        onClick={() => {
                          if (countryData) {
                            setExpandedCountry(expandedCountry === countryData.name ? null : countryData.name);
                            document.getElementById('countries-list')?.scrollIntoView({ behavior: 'smooth' });
                          }
                        }}
                      />
                    );
                  })
                }
              </Geographies>
            </ZoomableGroup>
          </ComposableMap>
        </div>
        <div className="flex items-center justify-end gap-2 mt-4 text-xs text-gray-500">
          <span>Menos visitas</span>
          <div className="w-24 h-2 bg-gradient-to-r from-[#fef3c7] to-[#B45309] rounded-full"></div>
          <span>Más visitas</span>
        </div>
      </div>

      {/* Countries List */}
      <div id="countries-list" className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <h3 className="text-xl font-serif italic mb-6">Desglose por Ubicación</h3>
        
        <div className="space-y-4">
          {stats.countries.map((country) => (
            <div key={country.name} className="border border-gray-100 rounded-2xl overflow-hidden">
              <button
                onClick={() => setExpandedCountry(expandedCountry === country.name ? null : country.name)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-brand-accent/10 rounded-full flex items-center justify-center text-brand-accent">
                    <Globe size={16} />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-gray-900">{country.name}</div>
                    <div className="text-xs text-gray-500">{country.percentage.toFixed(1)}% de las visitas</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-bold text-gray-900">{country.count}</div>
                    <div className="text-xs text-gray-500">sesiones</div>
                  </div>
                  {expandedCountry === country.name ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                </div>
              </button>

              <AnimatePresence>
                {expandedCountry === country.name && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 bg-white border-t border-gray-100">
                      <div className="space-y-6">
                        {country.regions.map(region => (
                          <div key={region.name} className="pl-4 border-l-2 border-brand-accent/20">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <div className="font-bold text-gray-800">{region.name}</div>
                                <div className="text-xs text-gray-500">{region.percentage.toFixed(1)}% de {country.name}</div>
                              </div>
                              <div className="text-sm font-medium text-gray-700">{region.count} sesiones</div>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                              {region.cities.map(city => (
                                <div key={city.name} className="bg-gray-50 p-3 rounded-xl flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <MapPin size={14} className="text-brand-accent" />
                                    <span className="text-sm text-gray-700">{city.name}</span>
                                  </div>
                                  <span className="text-xs font-bold bg-white px-2 py-1 rounded-md border border-gray-100">
                                    {city.count}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
          
          {stats.countries.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No hay datos de ubicación disponibles.
            </div>
          )}
        </div>
      </div>
      
      {/* Recent Sessions List */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <h3 className="text-xl font-serif italic mb-6">Últimas 20 Sesiones</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sessions.slice(0, 20).map((session) => (
            <div
              key={session.id}
              className="bg-gray-50 p-4 rounded-2xl border border-gray-100"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-gray-400 shadow-sm">
                    {session.device === 'Mobile' ? <Smartphone size={14} /> : <Monitor size={14} />}
                  </div>
                  <div>
                    <div className="font-medium text-sm text-gray-900">{session.city !== 'Unknown' ? session.city : session.country}</div>
                    <div className="text-[10px] text-gray-500">{session.country}</div>
                  </div>
                </div>
                <div className="text-[10px] text-gray-400 bg-white px-2 py-1 rounded-md border border-gray-100">
                  {session.browser || 'Browser'}
                </div>
              </div>
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <Clock size={12} />
                {formatDate(session.timestamp)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
