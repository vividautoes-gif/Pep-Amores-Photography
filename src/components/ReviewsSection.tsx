import { useState } from 'react';
import { useReviews } from '../hooks/useReviews';
import { StaggerTestimonials } from './ui/stagger-testimonials';
import { FlowButton } from './ui/flow-button';
import { Strings } from '../data';
import { motion, AnimatePresence } from 'motion/react';
import { Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

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

  const t = Strings[lang];

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif tracking-tight mb-4">
            {lang === 'es' ? 'Reseñas' : lang === 'en' ? 'Reviews' : 'Ressenyes'}
          </h2>
          <div className="w-24 h-1 bg-primary mx-auto opacity-20" />
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary/40" />
          </div>
        ) : error ? (
          <div className="text-center text-destructive py-12">
            {error}
          </div>
        ) : reviews.length > 0 ? (
          <StaggerTestimonials testimonials={reviews} />
        ) : (
          <div className="text-center text-muted-foreground py-12 italic">
            {lang === 'es' ? 'Aún no hay reseñas aprobadas.' : lang === 'en' ? 'No approved reviews yet.' : 'Encara no hi ha ressenyes aprovades.'}
          </div>
        )}

        {showSeeMore && (
          <div className="flex justify-center mt-12">
            <FlowButton 
              onClick={onSeeMore || (() => window.location.hash = '#reviews')}
              text={lang === 'es' ? 'Ver más reseñas' : lang === 'en' ? 'See more reviews' : 'Veure més ressenyes'}
            />
          </div>
        )}

        {/* Submission Form */}
        <div className="max-w-2xl mx-auto mt-24 pt-24 border-t border-primary/10">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-serif mb-2">
              {lang === 'es' ? 'Deja tu reseña' : lang === 'en' ? 'Leave a review' : 'Deixa la teva ressenya'}
            </h3>
            <p className="text-muted-foreground">
              {lang === 'es' ? 'Comparte tu experiencia conmigo.' : lang === 'en' ? 'Share your experience with me.' : 'Comparteix la teva experiència amb mi.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium uppercase tracking-wider opacity-60">
                {t.labels.name}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-transparent border-b border-primary/20 py-3 focus:outline-none focus:border-primary transition-colors"
                placeholder={lang === 'es' ? 'Tu nombre' : lang === 'en' ? 'Your name' : 'El teu nom'}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium uppercase tracking-wider opacity-60">
                {lang === 'es' ? 'Reseña' : lang === 'en' ? 'Review' : 'Ressenya'}
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                required
                rows={4}
                className="w-full bg-transparent border border-primary/10 rounded-lg p-4 focus:outline-none focus:border-primary transition-colors resize-none"
                placeholder={lang === 'es' ? 'Escribe aquí tu experiencia...' : lang === 'en' ? 'Write your experience here...' : 'Escriu aquí la teva experiència...'}
              />
            </div>

            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center justify-center gap-2 text-green-600 bg-green-50 py-4 rounded-lg"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>
                    {lang === 'es' ? '¡Gracias! Tu reseña aparecerá tras ser moderada.' : lang === 'en' ? 'Thank you! Your review will appear after moderation.' : 'Gràcies! La teva ressenya apareixerà després de ser moderada.'}
                  </span>
                </motion.div>
              ) : submitError ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center justify-center gap-2 text-destructive bg-destructive/5 py-4 rounded-lg"
                >
                  <AlertCircle className="w-5 h-5" />
                  <span>{submitError}</span>
                </motion.div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={submitting}
                  className="w-full bg-primary text-primary-foreground py-4 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50 transition-opacity"
                >
                  {submitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>{lang === 'es' ? 'Enviar reseña' : lang === 'en' ? 'Send review' : 'Enviar ressenya'}</span>
                    </>
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
