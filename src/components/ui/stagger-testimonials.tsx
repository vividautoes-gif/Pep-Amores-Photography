import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { cn } from "../../lib/utils";

interface Testimonial {
  id: string;
  name: string;
  text: string;
  originalLang?: string;
  currentLang?: string;
}

interface StaggerTestimonialsProps {
  testimonials: Testimonial[];
  className?: string;
}

export function StaggerTestimonials({ testimonials, className }: StaggerTestimonialsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right

  const next = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  if (testimonials.length === 0) return null;

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
    <div className={cn("relative w-full max-w-4xl mx-auto px-4 py-6", className)}>
      <div className="relative overflow-hidden min-h-[250px] flex items-center justify-center">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            initial={{ opacity: 0, x: direction * 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -direction * 50, scale: 0.95 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full flex flex-col items-center text-center"
          >
            <Quote className="w-10 h-10 text-brand-primary/20 mb-4" />
            <p className="text-xl md:text-2xl font-serif italic text-foreground leading-relaxed mb-4">
              "{testimonials[currentIndex].text}"
            </p>
            <div className="flex flex-col items-center">
              <div className="w-12 h-px bg-brand-tertiary mb-3" />
              <h4 className="text-lg font-medium tracking-wide uppercase mb-1">
                {testimonials[currentIndex].name}
              </h4>
              {testimonials[currentIndex].originalLang && 
               testimonials[currentIndex].currentLang && 
               testimonials[currentIndex].originalLang !== testimonials[currentIndex].currentLang && (
                <span className="text-[10px] text-brand-secondary bg-neutral-100 px-2 py-1 rounded-full">
                  {getTranslatedText(testimonials[currentIndex].currentLang)} {getLanguageName(testimonials[currentIndex].originalLang, testimonials[currentIndex].currentLang)}
                </span>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex justify-center gap-4 mt-8">
        <button
          onClick={prev}
          className="p-2 rounded-full border border-brand-primary/20 hover:bg-brand-primary/5 transition-colors"
          aria-label="Previous testimonial"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2">
          {testimonials.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setDirection(idx > currentIndex ? 1 : -1);
                setCurrentIndex(idx);
              }}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                idx === currentIndex ? "w-6 bg-brand-primary" : "bg-brand-primary/20"
              )}
            />
          ))}
        </div>
        <button
          onClick={next}
          className="p-2 rounded-full border border-brand-primary/20 hover:bg-brand-primary/5 transition-colors"
          aria-label="Next testimonial"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
