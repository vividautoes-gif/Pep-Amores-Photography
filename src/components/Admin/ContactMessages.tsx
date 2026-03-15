import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, orderBy, onSnapshot, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { Loader2, Mail, Trash2, CheckCircle, Clock } from 'lucide-react';

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: any;
}

export const ContactMessages: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Message[]);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'messages', id), { isRead: true });
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este mensaje?')) return;
    try {
      await deleteDoc(doc(db, 'messages', id));
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 mb-8">
        <h3 className="text-blue-900 font-medium mb-2 flex items-center gap-2">
          <Mail size={18} />
          Sobre esta sección: Mensajes de Contacto
        </h3>
        <p className="text-blue-800/80 text-sm leading-relaxed">
          Aquí puedes leer todos los mensajes que los visitantes te envían a través del formulario de contacto de la web. 
          Puedes marcarlos como leídos o eliminarlos una vez gestionados.
        </p>
      </div>

      <div className="space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
            <p className="text-gray-400">No hay mensajes nuevos.</p>
          </div>
        ) : (
          messages.map(msg => (
            <div 
              key={msg.id} 
              className={`bg-white p-6 rounded-2xl border transition-all ${msg.isRead ? 'border-neutral-100 opacity-75' : 'border-blue-200 shadow-md shadow-blue-500/5'}`}
              onClick={() => !msg.isRead && markAsRead(msg.id)}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-lg">{msg.name}</h4>
                  <p className="text-blue-600 text-sm">{msg.email}</p>
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    <Clock size={12} />
                    {msg.createdAt?.toDate().toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  {!msg.isRead && (
                    <button onClick={() => markAsRead(msg.id)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg">
                      <CheckCircle size={20} />
                    </button>
                  )}
                  <button onClick={() => handleDelete(msg.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-xs font-mono uppercase text-gray-400 mb-2">Asunto: {msg.subject}</p>
                <p className="text-gray-700 whitespace-pre-wrap">{msg.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
