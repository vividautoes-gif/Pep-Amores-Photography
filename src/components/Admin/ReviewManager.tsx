import React from 'react';
import { useReviews, Review } from '../../hooks/useReviews';
import { Check, X, Trash2, Clock, User, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatDate } from '../../lib/utils';

export const ReviewManager: React.FC = () => {
  const { reviews, loading, error, approveReview, deleteReview } = useReviews(true);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-2xl text-center">
        {error}
      </div>
    );
  }

  const pendingReviews = reviews.filter(r => !r.isApproved);
  const approvedReviews = reviews.filter(r => r.isApproved);

  const ReviewCard = ({ review, isPending }: { review: Review, isPending: boolean }) => (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm space-y-4"
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center">
            <User size={18} className="text-gray-400" />
          </div>
          <div>
            <h4 className="font-medium">{review.name}</h4>
            <div className="flex items-center gap-2 text-[10px] text-gray-400 uppercase tracking-widest">
              <Clock size={10} />
              {review.createdAt ? formatDate(review.createdAt.toDate()) : 'Reciente'}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {isPending ? (
            <button
              onClick={() => approveReview(review.id, true)}
              className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
              title="Aprobar"
            >
              <Check size={18} />
            </button>
          ) : (
            <button
              onClick={() => approveReview(review.id, false)}
              className="p-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors"
              title="Desaprobar"
            >
              <X size={18} />
            </button>
          )}
          <button
            onClick={() => {
              if (window.confirm('¿Estás seguro de que quieres eliminar esta reseña?')) {
                deleteReview(review.id);
              }
            }}
            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
            title="Eliminar"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
      
      <div className="flex gap-3 text-gray-600 bg-zinc-50 p-4 rounded-xl italic text-sm">
        <MessageSquare size={16} className="shrink-0 mt-1 opacity-40" />
        <p>{review.text}</p>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-12">
      {/* Pending Section */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <h3 className="text-xl font-serif italic">Pendientes de Aprobación</h3>
          <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
            {pendingReviews.length}
          </span>
        </div>
        
        {pendingReviews.length === 0 ? (
          <div className="bg-zinc-100/50 border border-dashed border-zinc-200 rounded-2xl p-12 text-center">
            <p className="text-gray-400 italic">No hay reseñas pendientes.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence mode="popLayout">
              {pendingReviews.map(review => (
                <ReviewCard key={review.id} review={review} isPending={true} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      {/* Approved Section */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <h3 className="text-xl font-serif italic">Reseñas Aprobadas</h3>
          <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
            {approvedReviews.length}
          </span>
        </div>
        
        {approvedReviews.length === 0 ? (
          <div className="bg-zinc-100/50 border border-dashed border-zinc-200 rounded-2xl p-12 text-center">
            <p className="text-gray-400 italic">No hay reseñas aprobadas aún.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence mode="popLayout">
              {approvedReviews.map(review => (
                <ReviewCard key={review.id} review={review} isPending={false} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>
    </div>
  );
};
