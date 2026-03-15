"use client"

import { useEffect, useRef, useCallback } from "react"
import { cn } from "../../lib/utils"

interface IrisSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Predefined sizes: sm = 40px, md = 64px, lg = 96px */
  size?: "sm" | "md" | "lg"
  /** Number of iris blades: 6 = classic photo, 8 = cinema lens */
  blades?: 6 | 8
  /** Blade color. Accepts any CSS color. Default: light metallic gray */
  color?: string
  /** Full open→close cycle duration in milliseconds. Default: 2400 */
  cycleDuration?: number
}

/**
 * IrisSpinner
 *
 * A loading spinner that replicates a real camera iris diaphragm.
 * Rendered on a Canvas 2D element with requestAnimationFrame.
 *
 * GEOMETRY PER BLADE:
 * - Shape: asymmetric parallelogram (wide at outer edge, narrow at center)
 * - Pivot point: on the outer ring at angle (i × 360/N)
 * - When rotation = 0° → blades overlap, center is covered (CLOSED)
 * - When rotation = maxAngle° → blades swing out, center hole is visible (OPEN)
 * - Blade is shifted asymmetrically so neighbors overlap like shingles
 *
 * ANIMATION TIMELINE (one cycle):
 * 0%  → 20%  : ease open (closed → fully open)
 * 20% → 48%  : hold open (aperture visible)
 * 48% → 68%  : ease close (fully open → closed)
 * 68% → 100% : hold closed (solid circle)
 */
export function IrisSpinner({
  className,
  size = "md",
  blades: numBlades = 6,
  color,
  cycleDuration = 2400,
  ...props
}: IrisSpinnerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)

  // Resolve pixel size
  const pxSize = size === "sm" ? 40 : size === "md" ? 64 : 96
  // Use 2x resolution for crisp rendering on retina
  const canvasSize = pxSize * 2

  const draw = useCallback(
    (timestamp: number) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      const W = canvas.width
      const H = canvas.height
      const cx = W / 2
      const cy = H / 2
      const R = Math.min(W, H) * 0.46

      // --- Aperture factor 0..1 ---
      const t = (timestamp % cycleDuration) / cycleDuration
      let aperture: number
      if (t < 0.20)      aperture = easeInOutCubic(t / 0.20)
      else if (t < 0.48) aperture = 1.0
      else if (t < 0.68) aperture = 1.0 - easeInOutCubic((t - 0.48) / 0.20)
      else                aperture = 0.0

      // Max rotation angle depends on blade count
      const maxAngle = numBlades === 8 ? 26 : 36
      const rotRad = (aperture * maxAngle * Math.PI) / 180

      ctx.clearRect(0, 0, W, H)

      // --- Outer ring ---
      ctx.beginPath()
      ctx.arc(cx, cy, R + 1, 0, Math.PI * 2)
      ctx.strokeStyle = "rgba(0,0,0,0.10)" // Updated for light background
      ctx.lineWidth = 1.2
      ctx.stroke()

      // --- Clip to outer circle ---
      ctx.save()
      ctx.beginPath()
      ctx.arc(cx, cy, R, 0, Math.PI * 2)
      ctx.clip()

      const step = (2 * Math.PI) / numBlades

      for (let i = 0; i < numBlades; i++) {
        const base = step * i

        // --- Pivot: pin on the outer ring ---
        const px = cx + R * Math.cos(base)
        const py = cy + R * Math.sin(base)

        // Direction vectors
        const toCenter = base + Math.PI
        const perp = toCenter + Math.PI / 2

        // --- Blade geometry ---
        // These values create a wide asymmetric parallelogram that:
        // (a) covers past the center when closed
        // (b) overlaps neighbors due to the asymmetric shift
        const len = R * 1.2        // blade length (extends past center)
        const wWide = R * 0.50     // half-width at the wide (outer) end
        const wNarrow = R * 0.10   // half-width at the narrow (center) end
        const shift = R * 0.22     // asymmetric side-shift for overlap

        // 4 corners of the blade parallelogram
        const corners = [
          // Wide end — left side (shifted outward for overlap)
          {
            x: px + Math.cos(perp) * (wWide + shift),
            y: py + Math.sin(perp) * (wWide + shift),
          },
          // Wide end — right side
          {
            x: px - Math.cos(perp) * (wWide * 0.25 - shift),
            y: py - Math.sin(perp) * (wWide * 0.25 - shift),
          },
          // Narrow end — right side (toward center)
          {
            x:
              px +
              Math.cos(toCenter) * len -
              Math.cos(perp) * (wNarrow * 0.3 - shift * 0.4),
            y:
              py +
              Math.sin(toCenter) * len -
              Math.sin(perp) * (wNarrow * 0.3 - shift * 0.4),
          },
          // Narrow end — left side (toward center)
          {
            x:
              px +
              Math.cos(toCenter) * len +
              Math.cos(perp) * (wNarrow + shift * 0.6),
            y:
              py +
              Math.sin(toCenter) * len +
              Math.sin(perp) * (wNarrow + shift * 0.6),
          },
        ]

        // Rotate corners around pivot
        const rotated = corners.map((c) => rotatePoint(c.x, c.y, px, py, rotRad))

        // --- Metallic gradient fill ---
        const grd = ctx.createLinearGradient(
          rotated[0].x, rotated[0].y,
          rotated[2].x, rotated[2].y
        )
        if (color) {
          grd.addColorStop(0, color)
          grd.addColorStop(0.5, color)
          grd.addColorStop(1, color)
        } else {
          // Darker metallic for light backgrounds
          grd.addColorStop(0, `rgba(40,45,50,${0.94 - i * 0.008})`)
          grd.addColorStop(0.4, `rgba(30,35,40,${0.90 - i * 0.008})`)
          grd.addColorStop(1, `rgba(20,25,30,${0.86 - i * 0.008})`)
        }

        // Draw blade
        ctx.beginPath()
        ctx.moveTo(rotated[0].x, rotated[0].y)
        ctx.lineTo(rotated[1].x, rotated[1].y)
        ctx.lineTo(rotated[2].x, rotated[2].y)
        ctx.lineTo(rotated[3].x, rotated[3].y)
        ctx.closePath()
        ctx.fillStyle = grd
        ctx.fill()

        // Subtle edge line
        ctx.strokeStyle = "rgba(255,255,255,0.18)" // Updated for dark blades
        ctx.lineWidth = 0.6
        ctx.stroke()
      }

      ctx.restore()
      animRef.current = requestAnimationFrame(draw)
    },
    [numBlades, color, cycleDuration, canvasSize]
  )

  useEffect(() => {
    animRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animRef.current)
  }, [draw])

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center",
        className
      )}
      style={{ width: pxSize, height: pxSize }}
      {...props}
    >
      <canvas
        ref={canvasRef}
        width={canvasSize}
        height={canvasSize}
        style={{ width: pxSize, height: pxSize }}
      />
    </div>
  )
}

// --- Utility functions ---

function rotatePoint(
  x: number, y: number,
  px: number, py: number,
  angle: number
) {
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  const dx = x - px
  const dy = y - py
  return {
    x: px + dx * cos - dy * sin,
    y: py + dx * sin + dy * cos,
  }
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}
