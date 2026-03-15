import React, { useState, useEffect, useRef, HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';
import { Slider } from './slider';

export interface GalleryItem {
  common: string;
  binomial: string;
  photo: {
    url: string; 
    text: string;
    pos?: string;
    by: string;
    orientation?: 'landscape' | 'portrait' | 'square';
    badge?: string;
  };
}

interface CircularGalleryProps extends HTMLAttributes<HTMLDivElement> {
  items: GalleryItem[];
  radius?: number;
  autoRotateSpeed?: number;
}

const CircularGallery = React.forwardRef<HTMLDivElement, CircularGalleryProps>(
  ({ items, className, radius = 400, autoRotateSpeed = 0.05, ...props }, ref) => {
    const [rotation, setRotation] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const animationFrameRef = useRef<number | null>(null);

    // Effect for auto-rotation when not dragging the slider
    useEffect(() => {
      const autoRotate = () => {
        if (!isDragging) {
          setRotation(prev => (prev + autoRotateSpeed) % 360);
        }
        animationFrameRef.current = requestAnimationFrame(autoRotate);
      };

      animationFrameRef.current = requestAnimationFrame(autoRotate);

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }, [isDragging, autoRotateSpeed]);

    const anglePerItem = 360 / items.length;
    
    return (
      <div className="flex flex-col items-center justify-center w-full h-full overflow-x-hidden overflow-y-visible py-12 md:py-20">
        <div
          ref={ref}
          role="region"
          aria-label="Circular 3D Gallery"
          className={cn("relative w-full flex-1 flex items-center justify-center min-h-[500px] md:min-h-[600px]", className)}
          style={{ perspective: '2500px' }}
          {...props}
        >
          <div
            className="relative w-full h-full flex items-center justify-center"
            style={{
              transform: `rotateY(${rotation}deg)`,
              transformStyle: 'preserve-3d',
              transition: isDragging ? 'none' : 'transform 0.1s linear'
            }}
          >
            {items.map((item, i) => {
              const itemAngle = i * anglePerItem;
              const totalRotation = rotation % 360;
              const relativeAngle = (itemAngle + totalRotation + 360) % 360;
              const normalizedAngle = Math.abs(relativeAngle > 180 ? 360 - relativeAngle : relativeAngle);
              const opacity = Math.max(0.1, 1 - (normalizedAngle / 180));
              const isFront = normalizedAngle < 90;
              const zIndex = Math.round(180 - normalizedAngle);

              // Determinar las dimensiones según la orientación
              const isLandscape = item.photo.orientation === 'landscape';
              const isSquare = item.photo.orientation === 'square';
              
              const dimClass = isLandscape 
                ? "w-[260px] h-[180px] md:w-[400px] md:h-[260px]" 
                : isSquare
                ? "w-[220px] h-[220px] md:w-[320px] md:h-[320px]"
                : "w-[180px] h-[250px] md:w-[260px] md:h-[360px]"; // portrait por defecto

              return (
                <div
                  key={item.photo.url} 
                  role="group"
                  aria-label={item.common}
                  className="absolute left-1/2 top-1/2"
                  style={{
                    transform: `rotateY(${itemAngle}deg) translateZ(${radius}px)`,
                    opacity: opacity,
                    zIndex: zIndex,
                    transition: 'opacity 0.3s linear',
                    pointerEvents: isFront ? 'auto' : 'none'
                  }}
                >
                  <div className={cn("relative -translate-x-1/2 -translate-y-1/2 rounded-2xl shadow-2xl overflow-hidden group border border-white/10 bg-black/50 backdrop-blur-md", dimClass)}>
                    <img
                      src={item.photo.url}
                      alt={item.photo.text}
                      className="absolute inset-0 w-full h-full object-cover"
                      style={{ objectPosition: item.photo.pos || 'center' }}
                    />
                    {item.photo.badge && (
                      <div className="absolute top-4 left-4 z-10">
                        <span className="px-3 py-1 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest rounded-full border border-white/20">
                          {item.photo.badge}
                        </span>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent text-white">
                      <h2 className="text-xl font-bold font-serif italic">{item.common}</h2>
                      <p className="text-xs mt-2 opacity-70 font-mono uppercase tracking-widest">{item.photo.by}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        
        {/* Slider Control */}
        <div className="w-full max-w-md px-6 pb-12 pt-8 z-10">
          <Slider
            value={[rotation]}
            max={360}
            step={0.1}
            onValueChange={(val) => {
              setRotation(val[0]);
            }}
            onPointerDown={() => setIsDragging(true)}
            onPointerUp={() => setIsDragging(false)}
            className="w-full"
          />
        </div>
      </div>
    );
  }
);

CircularGallery.displayName = 'CircularGallery';

export { CircularGallery };
