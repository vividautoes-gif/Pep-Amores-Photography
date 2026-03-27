import { useState, useEffect } from 'react';
import { useReviews } from '../hooks/useReviews';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Loader2, Globe } from 'lucide-react';
import { cn } from '../lib/utils';
import { FlowButton } from './ui/flow-button';

interface ReviewsSectionProps {
  lang: 'es' | 'en' | 'ca';
  showSeeMore?: boolean;
  onSeeMore?: () => void;
}

export function ReviewsSection({ lang, showSeeMore = true, onSeeMore }: ReviewsSectionProps) {
  const { reviews, loading, error, addReview } = useReviews();
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [limit, setLimit] = useState(12);

  useEffect(() => {
    const updateLimit = () => {
      if (window.innerWidth < 768) {
        setLimit(8);
      } else if (window.innerWidth < 1024) {
        setLimit(10);
      } else {
        setLimit(12);
      }
    };
    updateLimit();
    window.addEventListener('resize', updateLimit);
    return () => window.removeEventListener('resize', updateLimit);
  }, []);

  const displayedReviews = showSeeMore ? reviews.slice(0, limit) : reviews;
  const hasMore = reviews.length > limit;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !text.trim()) return;

    setSubmitting(true);
    setSubmitError(null);
    const result = await addReview(name, text);
    setSubmitting(false);

    if (result.success) {
      setSubmitted(true);
      setName('');
      setText('');
      setTimeout(() => setSubmitted(false), 5000);
    } else {
      setSubmitError('Error al enviar la reseña. Por favor, inténtalo de nuevo.');
    }
  };

  const getLanguageName = (code: string, displayLang: string) => {
    const names: Record<string, Record<string, string>> = {
      'es': { 'es': 'Español', 'en': 'Spanish', 'ca': 'Espanyol' },
      'en': { 'es': 'Inglés', 'en': 'English', 'ca': 'Anglès' },
      'ca': { 'es': 'Catalán', 'en': 'Catalan', 'ca': 'Català' },
      'fr': { 'es': 'Francés', 'en': 'French', 'ca': 'Francès' },
      'de': { 'es': 'Alemán', 'en': 'German', 'ca': 'Alemany' },
      'it': { 'es': 'Italiano', 'en': 'Italian', 'ca': 'Italià' },
      'zh': { 'es': 'Chino', 'en': 'Chinese', 'ca': 'Xinès' },
      'ja': { 'es': 'Japonés', 'en': 'Japanese', 'ca': 'Japonès' },
    };
    return names[code]?.[displayLang] || code.toUpperCase();
  };

  const getTranslatedText = (displayLang: string) => {
    if (displayLang === 'es') return 'Traducido del';
    if (displayLang === 'ca') return 'Traduït del';
    return 'Translated from';
  };

  return (
    <section className="py-16 bg-white relative overflow-hidden" id="reviews">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-serif italic mb-4">
            {lang === 'es' ? 'Reseñas' : lang === 'en' ? 'Reviews' : 'Ressenyes'}
          </h2>
        </div>

        {/* Reviews Body */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-brand-primary/40" />
          </div>
        ) : error ? (
          <div className="text-center text-red-600 py-12">
            {error}
          </div>
        ) : reviews.length > 0 ? (
          <div className="max-w-5xl mx-auto">
            <div className="relative">
              <div className="space-y-6 mb-12">
                {displayedReviews.map((r, index) => {
                  const reviewText = lang === 'en' && r.text_en ? r.text_en : lang === 'ca' && r.text_ca ? r.text_ca : r.text_es || r.text;
                  const isTranslated = r.originalLang && r.originalLang !== lang;
                  const isLast = index === displayedReviews.length - 1 && showSeeMore && hasMore;
                  
                  return (
                    <div 
                      key={r.id} 
                      className={cn(
                        "relative bg-white p-6 rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-white/50 transition-all hover:shadow-[0_15px_50px_rgba(0,0,0,0.06)]",
                        isLast && "mb-12"
                      )}
                    >
                      <div className="flex flex-col gap-2">
                        <span className="font-serif italic text-lg text-brand-primary">
                          {r.name}
                        </span>
                        <p className="text-brand-secondary text-sm leading-relaxed font-light">
                          {reviewText}
                        </p>
                        {isTranslated && (
                          <div className="flex items-center gap-1.5 mt-2 opacity-40">
                            <Globe size={12} />
                            <span className="text-[10px] uppercase tracking-widest font-bold">
                              {getTranslatedText(lang)} {getLanguageName(r.originalLang, lang)}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {isLast && (
                        <div className="absolute -bottom-4 left-0 w-full h-32 bg-gradient-to-t from-white via-white/90 to-transparent pointer-events-none z-10 rounded-b-[2rem]" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            
            {showSeeMore && (
              <div className="flex justify-center mt-8">
                <FlowButton 
                  onClick={onSeeMore || (() => window.location.hash = '#reviews')}
                  text={lang === 'es' ? 'Ver más reseñas' : lang === 'en' ? 'See more reviews' : 'Veure més ressenyes'}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-brand-secondary py-12 italic">
            {lang === 'es' ? 'Aún no hay reseñas aprobadas.' : lang === 'en' ? 'No approved reviews yet.' : 'Encara no hi ha ressenyes aprovades.'}
          </div>
        )}

        {/* Separator Line 2 */}
        <div className="w-full h-px bg-gray-200 my-12" />

        {/* Form Header */}
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-serif italic mb-2">
              {lang === 'es' ? 'Deja tu reseña' : lang === 'en' ? 'Leave your review' : 'Deixa la teva ressenya'}
            </h3>
          </div>

          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-brand-primary">
                {lang === 'es' ? 'Nombre' : lang === 'en' ? 'Name' : 'Nom'}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-white border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-brand-primary">
                {lang === 'es' ? 'Tu reseña' : lang === 'en' ? 'Your review' : 'La teva ressenya'}
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                required
                rows={5}
                className="w-full bg-white border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all outline-none resize-none"
              />
            </div>

            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center justify-center gap-2 text-green-600 bg-green-50 py-4 rounded-lg border border-green-100"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-sm font-medium">
                    {lang === 'es' ? '¡Gracias! Tu reseña aparecerá tras ser moderada.' : lang === 'en' ? 'Thank you! Your review will appear after moderation.' : 'Gràcies! La teva ressenya apareixerà després de ser moderada.'}
                  </span>
                </motion.div>
              ) : submitError ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center justify-center gap-2 text-red-600 bg-red-50 py-4 rounded-lg border border-red-100"
                >
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">{submitError}</span>
                </motion.div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  disabled={submitting}
                  className="w-full bg-black text-white py-4 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:bg-zinc-800"
                >
                  {submitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <span>{lang === 'es' ? 'Enviar reseña' : lang === 'en' ? 'Submit review' : 'Enviar ressenya'}</span>
                  )}
                </motion.button>
              )}
            </AnimatePresence>
          </form>
        </div>
      </div>
    </section>
  );
}
