import React, { useRef, useMemo, useState, useEffect, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useTexture, Html } from "@react-three/drei";
import * as THREE from "three";

type ImageItem = string | { src: string; alt?: string };

interface FadeSettings {
  fadeIn: { start: number; end: number };
  fadeOut: { start: number; end: number };
}

interface BlurSettings {
  blurIn: { start: number; end: number };
  blurOut: { start: number; end: number };
  maxBlur: number;
}

interface InfiniteGalleryProps {
  images: ImageItem[];
  speed?: number;
  zSpacing?: number;
  visibleCount?: number;
  falloff?: { near: number; far: number };
  fadeSettings?: FadeSettings;
  blurSettings?: BlurSettings;
  className?: string;
  style?: React.CSSProperties;
}

interface PlaneData {
  index: number;
  z: number;
  imageIndex: number;
  x: number;
  y: number;
}

const DEPTH_RANGE = 50;

// Shader simplificado — sin deformación, sin hover, solo textura + opacity + blur
const createMaterial = () => {
  return new THREE.ShaderMaterial({
    transparent: true,
    uniforms: {
      map: { value: null },
      opacity: { value: 1.0 },
      blurAmount: { value: 0.0 },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D map;
      uniform float opacity;
      uniform float blurAmount;
      varying vec2 vUv;
      void main() {
        vec4 color = texture2D(map, vUv);
        if (blurAmount > 0.0) {
          vec2 texelSize = 1.0 / vec2(textureSize(map, 0));
          vec4 blurred = vec4(0.0);
          float total = 0.0;
          for (float x = -2.0; x <= 2.0; x += 1.0) {
            for (float y = -2.0; y <= 2.0; y += 1.0) {
              vec2 offset = vec2(x, y) * texelSize * blurAmount;
              float weight = 1.0 / (1.0 + length(vec2(x, y)));
              blurred += texture2D(map, vUv + offset) * weight;
              total += weight;
            }
          }
          color = blurred / total;
        }
        gl_FragColor = vec4(color.rgb, color.a * opacity);
      }
    `,
  });
};

function ImagePlane({
  texture,
  position,
  scale,
  material,
}: {
  texture: THREE.Texture;
  position: [number, number, number];
  scale: [number, number, number];
  material: THREE.ShaderMaterial;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    if (material && texture) {
      material.uniforms.map.value = texture;
    }
  }, [material, texture]);

  return (
    <mesh ref={meshRef} position={position} scale={scale} material={material}>
      <planeGeometry args={[1, 1, 1, 1]} />
    </mesh>
  );
}

function GalleryScene({
  images,
  speed = 1,
  visibleCount = 10,
  fadeSettings = {
    fadeIn: { start: 0.0, end: 0.15 },
    fadeOut: { start: 0.35, end: 0.45 },
  },
  blurSettings = {
    blurIn: { start: 0.0, end: 0.12 },
    blurOut: { start: 0.33, end: 0.43 },
    maxBlur: 8.0,
  },
  isMobile = false,
}: Omit<InfiniteGalleryProps, "className" | "style"> & { isMobile?: boolean }) {
  const normalizedImages = useMemo(
    () => images
      .map((img) => (typeof img === "string" ? { src: img, alt: "" } : img))
      .filter(img => img && img.src),
    [images]
  );

  const proxiedUrls = useMemo(() => {
    return normalizedImages.map(img => {
      // Use CORS proxy for Firebase Storage to avoid WebGL tainting issues
      if (img.src.includes('firebasestorage.googleapis.com')) {
        return `https://images.weserv.nl/?url=${encodeURIComponent(img.src)}`;
      }
      return img.src;
    });
  }, [normalizedImages]);

  const textureResult = useTexture(proxiedUrls);
  const textures = Array.isArray(textureResult) ? textureResult : [textureResult];

  const materials = useMemo(
    () => Array.from({ length: visibleCount }, () => createMaterial()),
    [visibleCount]
  );

  // Posiciones X/Y fijas para cada slot — distribuidas usando ángulo áureo
  const spatialPositions = useMemo(() => {
    const positions: { x: number; y: number }[] = [];

    // Rangos diferentes para móvil vs desktop
    const rangeX = isMobile ? 4 : 12;
    const rangeY = isMobile ? 5 : 10;
    const deadX = isMobile ? 1.5 : 3;
    const deadY = isMobile ? 1.0 : 1.5;

    for (let i = 0; i < visibleCount; i++) {
      const hAngle = (i * 2.618) % (Math.PI * 2);
      const vAngle = (i * 1.618 + Math.PI / 3) % (Math.PI * 2);
      const hRadius = (i % 3) * 1.2;
      const vRadius = ((i + 1) % 4) * 0.8;

      let x = (Math.sin(hAngle) * hRadius * rangeX) / (isMobile ? 4 : 2.5);
      let y = (Math.cos(vAngle) * vRadius * rangeY) / (isMobile ? 3.5 : 3);

      // Zona muerta central
      if (Math.abs(x) < deadX && Math.abs(y) < deadY) {
        x = x >= 0 ? x + deadX + 0.5 : x - deadX - 0.5;
        y = y >= 0 ? y + deadY + 0.5 : y - deadY - 0.5;
      }

      positions.push({ x, y });
    }
    return positions;
  }, [visibleCount, isMobile]);

  const totalImages = normalizedImages.length;

  // Datos mutables de cada plano — se actualizan en useFrame sin causar re-renders
  const planesRef = useRef<PlaneData[]>(
    Array.from({ length: visibleCount }, (_, i) => ({
      index: i,
      z: (DEPTH_RANGE / visibleCount) * i,
      imageIndex: totalImages > 0 ? i % totalImages : 0,
      x: spatialPositions[i]?.x ?? 0,
      y: spatialPositions[i]?.y ?? 0,
    }))
  );

  // Reinicializar cuando cambian las props
  useEffect(() => {
    planesRef.current = Array.from({ length: visibleCount }, (_, i) => ({
      index: i,
      z: (DEPTH_RANGE / Math.max(visibleCount, 1)) * i,
      imageIndex: totalImages > 0 ? i % totalImages : 0,
      x: spatialPositions[i]?.x ?? 0,
      y: spatialPositions[i]?.y ?? 0,
    }));
  }, [visibleCount, totalImages, spatialPositions]);

  // Refs para acceso directo a los meshes — permite mover posiciones sin re-render
  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);

  // VELOCIDAD CONSTANTE — nunca cambia, no es estado de React
  const MOVE_SPEED = speed * 1.7;

  useFrame((_state, delta) => {
    if (totalImages === 0) return;

    const imageAdvance = visibleCount % totalImages || totalImages;

    planesRef.current.forEach((plane, i) => {
      // Mover hacia la cámara (incrementar Z)
      plane.z += MOVE_SPEED * delta;

      // Si sale por delante, reciclar al fondo
      if (plane.z >= DEPTH_RANGE) {
        const wraps = Math.floor(plane.z / DEPTH_RANGE);
        plane.z -= DEPTH_RANGE * wraps;
        if (imageAdvance > 0) {
          plane.imageIndex = (plane.imageIndex + wraps * imageAdvance) % totalImages;
        }
      }

      // Posición normalizada: 0 = fondo (lejos), 1 = cerca
      const norm = plane.z / DEPTH_RANGE;

      // Opacidad
      let opacity = 1;
      if (norm < fadeSettings.fadeIn.end) {
        opacity = norm < fadeSettings.fadeIn.start ? 0 : (norm - fadeSettings.fadeIn.start) / (fadeSettings.fadeIn.end - fadeSettings.fadeIn.start);
      } else if (norm > fadeSettings.fadeOut.start) {
        opacity = norm > fadeSettings.fadeOut.end ? 0 : 1 - (norm - fadeSettings.fadeOut.start) / (fadeSettings.fadeOut.end - fadeSettings.fadeOut.start);
      }
      opacity = Math.max(0, Math.min(1, opacity));

      // Blur
      let blur = 0;
      if (norm < blurSettings.blurIn.end) {
        const t = norm < blurSettings.blurIn.start ? 0 : (norm - blurSettings.blurIn.start) / (blurSettings.blurIn.end - blurSettings.blurIn.start);
        blur = blurSettings.maxBlur * (1 - t);
      } else if (norm > blurSettings.blurOut.start) {
        const t = norm > blurSettings.blurOut.end ? 1 : (norm - blurSettings.blurOut.start) / (blurSettings.blurOut.end - blurSettings.blurOut.start);
        blur = blurSettings.maxBlur * t;
      }

      // Actualizar uniforms del material
      const mat = materials[i];
      if (mat?.uniforms) {
        mat.uniforms.opacity.value = opacity;
        mat.uniforms.blurAmount.value = blur;

        // Actualizar textura si cambió la imagen
        const tex = textures[plane.imageIndex];
        if (tex && mat.uniforms.map.value !== tex) {
          mat.uniforms.map.value = tex;
        }
      }

      // Mover mesh directamente (sin re-render de React)
      const mesh = meshRefs.current[i];
      if (mesh) {
        const worldZ = plane.z - DEPTH_RANGE / 2;
        mesh.position.set(plane.x, plane.y, worldZ);
      }
    });
  });

  if (normalizedImages.length === 0) return null;

  return (
    <>
      {planesRef.current.map((plane, i) => {
        const texture = textures[plane.imageIndex];
        const material = materials[i];
        if (!texture || !material) return null;

        const worldZ = plane.z - DEPTH_RANGE / 2;
        const aspect = texture.image ? (texture.image as HTMLImageElement).width / (texture.image as HTMLImageElement).height : 1;
        const baseSize = 1.8;
        const s: [number, number, number] = aspect > 1 ? [baseSize * aspect, baseSize, 1] : [baseSize, baseSize / aspect, 1];

        return (
          <mesh
            key={plane.index}
            ref={(el) => { meshRefs.current[i] = el; }}
            position={[plane.x, plane.y, worldZ]}
            scale={s}
            material={material}
          >
            <planeGeometry args={[1, 1, 1, 1]} />
          </mesh>
        );
      })}
    </>
  );
}

function FallbackGallery({ images }: { images: ImageItem[] }) {
  const normalizedImages = useMemo(
    () => images
      .map((img) => (typeof img === "string" ? { src: img, alt: "" } : img))
      .filter(img => img && img.src),
    [images]
  );
  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-100 p-4">
      <p className="text-gray-600 mb-4">WebGL not supported.</p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
        {normalizedImages.map((img, i) => (
          <img key={i} src={img.src || "/placeholder.svg"} alt={img.alt} className="w-full h-32 object-cover rounded" />
        ))}
      </div>
    </div>
  );
}

class LocalErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Gallery Error caught by local boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export default function InfiniteGallery({
  images,
  speed = 1,
  className = "h-96 w-full",
  style,
  fadeSettings = {
    fadeIn: { start: 0.0, end: 0.15 },
    fadeOut: { start: 0.35, end: 0.45 },
  },
  blurSettings = {
    blurIn: { start: 0.0, end: 0.12 },
    blurOut: { start: 0.33, end: 0.43 },
    maxBlur: 8.0,
  },
  visibleCount = 10,
  zSpacing,
  falloff,
}: InfiniteGalleryProps) {
  const [webglSupported, setWebglSupported] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (!gl) setWebglSupported(false);
    } catch {
      setWebglSupported(false);
    }
  }, []);

  if (!webglSupported) {
    return (
      <div className={className} style={style}>
        <FallbackGallery images={images} />
      </div>
    );
  }

  return (
    <div className={className} style={style}>
      <LocalErrorBoundary fallback={<FallbackGallery images={images} />}>
        <Canvas
          camera={{ position: [0, 0, 0], fov: 55 }}
          gl={{ antialias: true, alpha: true }}
        >
          <Suspense fallback={<Html center><div className="text-brand-secondary font-serif italic">Cargando galería...</div></Html>}>
            <GalleryScene
              images={images}
              speed={speed}
              visibleCount={visibleCount}
              fadeSettings={fadeSettings}
              blurSettings={blurSettings}
              isMobile={isMobile}
            />
          </Suspense>
        </Canvas>
      </LocalErrorBoundary>
    </div>
  );
}
