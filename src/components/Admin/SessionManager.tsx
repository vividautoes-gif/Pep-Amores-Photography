import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { motion } from 'motion/react';
import { MapPin, Globe, Monitor, Smartphone, Clock } from 'lucide-react';
import { formatDate } from '../../lib/utils';

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

  useEffect(() => {
    const q = query(collection(db, 'sessions'), orderBy('timestamp', 'desc'), limit(100));
    const unsub = onSnapshot(q, (snap) => {
      setSessions(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Session[]);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Cargando sesiones...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-serif italic">Últimos Visitantes</h2>
        <div className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-100">
          Mostrando los últimos 100
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sessions.map((session) => (
          <motion.div
            key={session.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-brand-accent/10 rounded-xl flex items-center justify-center text-brand-accent">
                  <Globe size={20} />
                </div>
                <div>
                  <div className="font-bold text-gray-900">{session.country}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <MapPin size={10} />
                    {session.city}{session.region ? `, ${session.region}` : ''}
                  </div>
                </div>
              </div>
              <div className="text-gray-400">
                {session.device === 'Mobile' ? <Smartphone size={18} /> : <Monitor size={18} />}
              </div>
            </div>

            <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
              <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                {session.browser || 'Browser'}
              </div>
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <Clock size={12} />
                {formatDate(session.timestamp)}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {sessions.length === 0 && (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <Globe size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">Aún no hay sesiones registradas.</p>
        </div>
      )}
    </div>
  );
};
