import { motion } from 'framer-motion';
import { GridPattern } from './grid-pattern';
import type { Review } from '../../hooks/useReviews';

export function TestimonialsSection({ reviews }: { reviews: Review[] }) {
  return (
    <section className="relative w-full pt-10 pb-20 px-4">
      <div aria-hidden className="absolute inset-0 isolate z-0 contain-strict">
        <div className="bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,rgba(0,0,0,0.06)_0,rgba(140,140,140,0.02)_50%,rgba(0,0,0,0.01)_80%)] absolute top-0 left-0 h-[320px] w-[140px] -translate-y-[87.5px] -rotate-45 rounded-full" />
        <div className="bg-[radial-gradient(50%_50%_at_50%_50%,rgba(0,0,0,0.04)_0,rgba(0,0,0,0.01)_80%,transparent_100%)] absolute top-0 left-0 h-[320px] w-[60px] translate-x-[5%] -translate-y-1/2 -rotate-45 rounded-full" />
        <div className="bg-[radial-gradient(50%_50%_at_50%_50%,rgba(0,0,0,0.04)_0,rgba(0,0,0,0.01)_80%,transparent_100%)] absolute top-0 left-0 h-[320px] w-[60px] -translate-y-[87.5px] -rotate-45 rounded-full" />
      </div>
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-wide text-balance md:text-4xl lg:text-5xl xl:text-6xl xl:font-extrabold">
            Reseñas
          </h1>
          <p className="text-gray-500 text-sm md:text-base lg:text-lg">
            Lo que dicen sobre mi trabajo.
          </p>
        </div>
        <div className="relative grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map(({ name, review }, index) => (
            <motion.div
              initial={{ filter: 'blur(4px)', translateY: -8, opacity: 0 }}
              whileInView={{
                filter: 'blur(0px)',
                translateY: 0,
                opacity: 1,
              }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * index + 0.1, duration: 0.8 }}
              key={index}
              className="border-gray-200/25 relative grid grid-cols-[1fr] gap-x-3 overflow-hidden border border-dashed p-6 bg-white/50 backdrop-blur-sm"
            >
              <div className="pointer-events-none absolute top-0 left-1/2 -mt-2 -ml-20 h-full w-full [mask-image:linear-gradient(white,transparent)]">
                <div className="from-black/5 to-black/2 absolute inset-0 bg-gradient-to-r [mask-image:radial-gradient(farthest-side_at_top,white,transparent)]">
                  <GridPattern
                    width={25}
                    height={25}
                    x={-12}
                    y={4}
                    strokeDasharray="3"
                    className="stroke-black/20 absolute inset-0 h-full w-full mix-blend-overlay"
                  />
                </div>
              </div>
              <div className="z-10 relative">
                <blockquote className="mb-4">
                  <p className="text-black text-sm font-light tracking-wide italic">
                    "{review}"
                  </p>
                </blockquote>
                <div className="mt-auto">
                  <p className="text-sm md:text-base font-medium text-black">- {name}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
