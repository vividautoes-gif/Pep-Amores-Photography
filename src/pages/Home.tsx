import { useReviews } from '../hooks/useReviews';
import { TestimonialsSection } from '../components/ui/testimonials-section';
import { ReviewForm } from '../components/ui/ReviewForm';
import { motion } from 'framer-motion';
import { ArrowRight, Code2, Palette, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Home() {
  const { reviews, loading } = useReviews();

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white pt-24 pb-32">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="container relative mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-3xl"
          >
            <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 sm:text-7xl mb-6">
              Creando experiencias web <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">excepcionales</span>
            </h1>
            <p className="mt-6 text-xl leading-8 text-gray-600 mb-10">
              Desarrollador Full Stack apasionado por construir aplicaciones rápidas, accesibles y hermosas que resuelven problemas reales.
            </p>
            <div className="flex items-center justify-center gap-x-6">
              <Link
                to="/about"
                className="rounded-full bg-black px-8 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black transition-all flex items-center gap-2"
              >
                Conóceme <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Todo lo que necesitas</h2>
            <p className="mt-4 text-lg leading-8 text-gray-600">
              Construyo aplicaciones modernas utilizando las mejores herramientas del ecosistema.
            </p>
          </div>
          <div className="mx-auto max-w-5xl grid grid-cols-1 gap-8 sm:grid-cols-3">
            {[
              {
                title: 'Desarrollo Frontend',
                description: 'Interfaces interactivas y reactivas con React, Vue y Tailwind CSS.',
                icon: <Palette className="h-6 w-6 text-blue-600" />,
              },
              {
                title: 'Arquitectura Backend',
                description: 'APIs robustas y escalables con Node.js, Express y bases de datos modernas.',
                icon: <Code2 className="h-6 w-6 text-indigo-600" />,
              },
              {
                title: 'Rendimiento Óptimo',
                description: 'Optimización de carga, SEO y experiencia de usuario fluida.',
                icon: <Zap className="h-6 w-6 text-yellow-500" />,
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="relative flex flex-col gap-6 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200/50"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50 ring-1 ring-gray-200/50">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold leading-8 text-gray-900">{feature.title}</h3>
                  <p className="mt-2 text-base leading-7 text-gray-600">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-24 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            </div>
          ) : reviews.length > 0 ? (
            <TestimonialsSection reviews={reviews} />
          ) : (
            <div className="text-center py-20 text-gray-500 bg-gray-50 rounded-2xl border border-gray-100">
              Aún no hay reseñas. ¡Sé el primero en dejar una!
            </div>
          )}

          <div className="mt-16">
            <ReviewForm />
          </div>
        </div>
      </section>
    </div>
  );
}
