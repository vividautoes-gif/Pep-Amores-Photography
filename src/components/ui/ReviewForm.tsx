import React, { useState } from 'react';
import { useReviews } from '../../hooks/useReviews';
import { Send, Loader2 } from 'lucide-react';

export const ReviewForm: React.FC = () => {
  const { addReview } = useReviews();
  const [name, setName] = useState('');
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !review.trim()) return;

    setLoading(true);
    const result = await addReview(name, review);
    setLoading(false);

    if (result) {
      setSuccess(true);
      setName('');
      setReview('');
      setTimeout(() => setSuccess(false), 5000);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-12 mb-8 bg-white/50 backdrop-blur-sm p-8 rounded-3xl border border-black/5">
      <h3 className="text-2xl font-serif italic mb-6 text-center">Añadir Reseña</h3>
      {success ? (
        <div className="text-center text-green-600 font-medium py-8">
          ¡Gracias por tu reseña!
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">Nombre</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-black outline-none transition-all"
              placeholder="Tu nombre"
            />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">Reseña</label>
            <textarea
              required
              value={review}
              onChange={(e) => setReview(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-black outline-none transition-all h-24 resize-none"
              placeholder="Escribe tu reseña aquí..."
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-black text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
            {loading ? 'Enviando...' : 'Enviar Reseña'}
          </button>
        </form>
      )}
    </div>
  );
};
