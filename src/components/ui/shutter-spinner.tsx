"use client"

import { useEffect, useRef, useMemo } from "react"
import { cn } from "../../lib/utils"

interface ShutterSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Predefined sizes: sm = 40px, md = 64px, lg = 96px */
  size?: "sm" | "md" | "lg"
  /** Number of iris blades. 6 = classic, 8 = mechanical */
  blades?: 6 | 8
  /** Override blade color. Defaults to current text color (--foreground) */
  color?: string
  /** Full cycle duration in seconds. Default: 1.8 */
  speed?: number
}

/**
 * ShutterSpinner
 * 
 * A loading spinner that replicates a real camera iris diaphragm.
 * Uses SVG blades that ROTATE around pivot points on the outer ring
 * to open and close, revealing and covering a center aperture hole.
 * 
 * GEOMETRY:
 * - Each blade is a quadrilateral (trapezoid).
 * - Wide end sits on the outer ring, narrow end reaches toward center.
 * - Pivot point is on the outer ring at evenly spaced angles.
 * - At rotation 0° (closed): blades overlap, covering center completely.
 * - At rotation N° (open): blades swing outward, revealing center hole.
 */
export function ShutterSpinner({
  className,
  size = "md",
  blades: bladeCount = 6,
  color,
  speed = 1.8,
  ...props
}: ShutterSpinnerProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  // Build blade geometry
  const bladeData = useMemo(() => {
    const cx = 50, cy = 50
    const outerR = 46
    const innerR = 8
    const result = []

    for (let i = 0; i < bladeCount; i++) {
      const angle = (360 / bladeCount) * i
      const spreadFactor = 360 / bladeCount

      // --- Pivot: point on the outer ring ---
      const pivotRad = (angle * Math.PI) / 180
      const pivotX = cx + outerR * Math.cos(pivotRad)
      const pivotY = cy + outerR * Math.sin(pivotRad)

      // --- Blade polygon: 4 points forming a trapezoid ---
      // Two outer points (wide end, near the ring)
      const outerA1 = ((angle - spreadFactor * 0.15) * Math.PI) / 180
      const outerA2 = ((angle + spreadFactor * 0.65) * Math.PI) / 180
      const p1x = cx + outerR * 0.92 * Math.cos(outerA1)
      const p1y = cy + outerR * 0.92 * Math.sin(outerA1)
      const p2x = cx + outerR * 0.92 * Math.cos(outerA2)
      const p2y = cy + outerR * 0.92 * Math.sin(outerA2)

      // Two inner points (narrow end, near center — these create the overlap)
      const innerA1 = ((angle + spreadFactor * 0.25) * Math.PI) / 180
      const innerA2 = ((angle + spreadFactor * 0.55) * Math.PI) / 180
      const p3x = cx + innerR * 1.8 * Math.cos(innerA2)
      const p3y = cy + innerR * 1.8 * Math.sin(innerA2)
      const p4x = cx + innerR * 1.2 * Math.cos(innerA1)
      const p4y = cy + innerR * 1.2 * Math.sin(innerA1)

      result.push({
        pivotX,
        pivotY,
        path: `M ${p1x.toFixed(2)} ${p1y.toFixed(2)} L ${p2x.toFixed(2)} ${p2y.toFixed(2)} L ${p3x.toFixed(2)} ${p3y.toFixed(2)} L ${p4x.toFixed(2)} ${p4y.toFixed(2)} Z`,
        delay: -(i * 0.04), // slight stagger for mechanical feel
      })
    }
    return result
  }, [bladeCount])

  // Inject scoped keyframes once
  useEffect(() => {
    const styleId = "shutter-spinner-keyframes"
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style")
      style.id = styleId
      style.textContent = `
        @keyframes shutterBladeSwing {
          0%   { transform: rotate(0deg); }
          30%  { transform: rotate(var(--shutter-open-angle)); }
          70%  { transform: rotate(var(--shutter-open-angle)); }
          100% { transform: rotate(0deg); }
        }
        @keyframes shutterGlobalRotate {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `
      document.head.appendChild(style)
    }
  }, [])

  const openAngle = bladeCount === 8 ? -40 : -52

  return (
    <div
      className={cn(
        "shutter-spinner relative inline-flex items-center justify-center rounded-full",
        size === "sm" && "h-10 w-10",
        size === "md" && "h-16 w-16",
        size === "lg" && "h-24 w-24",
        className
      )}
      {...props}
    >
      {/* Outer lens barrel ring */}
      <div className="absolute inset-0 rounded-full border-2 border-current opacity-15" />

      {/* SVG shutter — slow global rotation for realism */}
      <svg
        ref={svgRef}
        viewBox="0 0 100 100"
        className="h-[80%] w-[80%]"
        style={{
          animation: `shutterGlobalRotate 8s linear infinite`,
        }}
      >
        {bladeData.map((blade, i) => (
          <g
            key={i}
            style={{
              transformOrigin: `${blade.pivotX}px ${blade.pivotY}px`,
              animation: `shutterBladeSwing ${speed}s ease-in-out infinite`,
              animationDelay: `${blade.delay}s`,
              ["--shutter-open-angle" as string]: `${openAngle}deg`,
            }}
          >
            <path
              d={blade.path}
              fill={color || "currentColor"}
              opacity={0.85}
            />
          </g>
        ))}
      </svg>

      {/* Center pin / lens reflection */}
      <div className="absolute h-[6%] w-[6%] rounded-full bg-current opacity-10" />
    </div>
  )
}
