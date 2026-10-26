import { useId, type ReactNode } from 'react'

/**
 * Black slats across a box, and a shape cut out of them where the slats turn thin, after the op-art
 * graphics on abgd.it. The shape is drawn in the box's own units (w × h) and painted in whatever colour
 * it is handed, so the same drawing serves as both masks.
 */
export type Shape = (paint: string, w: number, h: number) => ReactNode

export interface StripeMarkProps {
  shape: Shape
  /** box size in drawing units; it scales to fit its container */
  w?: number
  h?: number
  /** distance from one slat to the next, the slat's weight outside the shape and inside it */
  pitch?: number
  weight?: number
  thin?: number
  /** turns the slats, in degrees */
  angle?: number
  /** rounds the top corners, as the tabs on abgd.it */
  radius?: number
  /** slat weight at the top and at the bottom, for slats that thin out down the box (ignores angle) */
  taper?: [number, number]
  className?: string
}

export default function StripeMark({
  shape,
  w = 400,
  h = 500,
  pitch = 16,
  weight = 10,
  thin = 3,
  angle = 0,
  radius = 14,
  taper,
  className = '',
}: StripeMarkProps) {
  const id = `sm-${useId().replace(/:/g, '')}`
  const slats = (height: number) => (
    <rect y={(pitch - height) / 2} width={pitch} height={height} fill="var(--color-ink)" />
  )
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={`block w-full ${className}`} aria-hidden>
      <defs>
        <pattern id={`${id}-a`} width={pitch} height={pitch} patternUnits="userSpaceOnUse" patternTransform={`rotate(${angle})`}>
          {slats(weight)}
        </pattern>
        <pattern id={`${id}-b`} width={pitch} height={pitch} patternUnits="userSpaceOnUse" patternTransform={`rotate(${angle})`}>
          {slats(thin)}
        </pattern>
        <mask id={`${id}-out`} maskUnits="userSpaceOnUse" x="0" y="0" width={w} height={h}>
          <rect width={w} height={h} fill="#fff" />
          {shape('#000', w, h)}
        </mask>
        <mask id={`${id}-in`} maskUnits="userSpaceOnUse" x="0" y="0" width={w} height={h}>
          {shape('#fff', w, h)}
        </mask>
        <clipPath id={`${id}-box`}>
          <path d={`M0 ${h}V${radius}Q0 0 ${radius} 0H${w - radius}Q${w} 0 ${w} ${radius}V${h}Z`} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}-box)`}>
        {taper ? (
          <g mask={`url(#${id}-out)`} fill="var(--color-ink)">
            {Array.from({ length: Math.ceil(h / pitch) }, (_, i) => {
              const k = taper[0] + ((taper[1] - taper[0]) * i * pitch) / h
              return <rect key={i} y={i * pitch + (pitch - k) / 2} width={w} height={k} />
            })}
          </g>
        ) : (
          <rect width={w} height={h} fill={`url(#${id}-a)`} mask={`url(#${id}-out)`} />
        )}
        <rect width={w} height={h} fill={`url(#${id}-b)`} mask={`url(#${id}-in)`} />
      </g>
    </svg>
  )
}

// heavy, so each stroke spans a few slats and the glyph still reads through them
const TYPE = { fontFamily: 'var(--font-sans)', fontWeight: 700 }

/** A few characters set centred in the box, as large as its width (k) allows and never taller than it */
function glyph(text: string, p: string, w: number, h: number, k: number, spacing: string) {
  return (
    <text
      x={w / 2}
      y={h * 0.52}
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={Math.min(w * k, h * 0.78)}
      fill={p}
      style={{ ...TYPE, letterSpacing: spacing }}
    >
      {text}
    </text>
  )
}

/** The shapes in use, each sized from the box so it sits the same at any ratio */
export const SHAPES: Record<'tag', Shape> = {
  // a code tag, on the home page
  tag: (p, w, h) => glyph('</>', p, w, h, 0.42, '-0.06em'),
}
