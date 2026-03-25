import { useState } from 'react';
import { useReviews } from '../hooks/useReviews';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
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
          <div className="relative">
            <div className={cn(
              "columns-1 md:columns-2 lg:columns-4 gap-6",
              showSeeMore ? "max-h-[1200px] md:max-h-[900px] lg:max-h-[800px] overflow-hidden" : ""
            )}>
              {reviews.map(r => {
                const reviewText = lang === 'en' && r.text_en ? r.text_en : lang === 'ca' && r.text_ca ? r.text_ca : r.text_es || r.text;
                const isTranslated = r.originalLang && r.originalLang !== lang;
                
                return (
                  <div key={r.id} className="break-inside-avoid mb-6 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <h4 className="font-medium text-lg mb-3 text-brand-primary">{r.name}</h4>
                    <p className="text-brand-secondary italic leading-relaxed text-sm mb-4">"{reviewText}"</p>
                    {isTranslated && (
                      <div className="text-right mt-2">
                        <span className="text-[10px] text-brand-secondary/70 uppercase tracking-wider">
                          {getTranslatedText(lang)} {getLanguageName(r.originalLang, lang)}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Gradient Cut Effect */}
            {showSeeMore && (
              <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-white to-transparent pointer-events-none" />
            )}
          </div>
        ) : (
          <div className="text-center text-brand-secondary py-12 italic">
            {lang === 'es' ? 'Aún no hay reseñas aprobadas.' : lang === 'en' ? 'No approved reviews yet.' : 'Encara no hi ha ressenyes aprovades.'}
          </div>
        )}

        {/* Separator Line 1 */}
        {showSeeMore && (
          <>
            <div className="w-full h-px bg-gray-200 my-8" />
            
            {/* See More Button */}
            <div className="flex justify-center mb-8">
              <FlowButton 
                onClick={onSeeMore || (() => window.location.hash = '#reviews')}
                text={lang === 'es' ? 'Ver más reseñas' : lang === 'en' ? 'See more reviews' : 'Veure més ressenyes'}
              />
            </div>
          </>
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
