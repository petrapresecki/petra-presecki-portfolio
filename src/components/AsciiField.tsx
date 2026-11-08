import { useEffect, useRef } from 'react'
import { readToken } from '@/lib/kit/tokens'

/** Dark to bright, as in the Kaspar reference: punctuation in shadow, digits and @ in the light */
const RAMP = '.:-=+*1%#0@'
const FONT = 10
const FPS = 30
/** Phones get a lighter knot: fewer points, fewer frames, a 1x canvas */
const PHONE = matchMedia('(pointer: coarse)').matches

type Vec = [number, number, number]

/** Where the knot sits: x/y as fractions of the viewport */
type Pose = { x: number; y: number; size: number; alpha: number }

/**
 * A (2,3) torus knot printed in ASCII, floating behind the page (after the
 * Kaspar inspo in creative-kit). Scroll walks it through the sections: beside the
 * hero, into the left column for Experience, faint behind the work, large again at
 * Contact. It also turns slowly, winds on with scroll and leans toward the pointer.
 * Each frame is z-buffered into a character grid and shaded by one light, so the
 * glyphs shimmer as the surface turns.
 */
export default function AsciiField() {
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const el = canvas.current!
    const ctx = el.getContext('2d')!
    const color = readToken('--color-muted', '#77746d')
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches
    const mesh = PHONE ? knot(420, 28) : knot()

    let cw = 6
    let cols = 0
    let rows = 0
    let zbuf = new Float32Array(0)
    let lum = new Float32Array(0)
    let keys: { at: number; pose: Pose }[] = []

    // scroll positions where each pose is reached, read from the sections themselves
    const measure = () => {
      const top = (id: string) => (document.getElementById(id)?.getBoundingClientRect().top ?? 0) + scrollY
      const h = innerHeight
      const end = document.documentElement.scrollHeight - h
      const m = innerWidth < 760
      const hero: Pose = m ? { x: 0.6, y: 0.32, size: 1, alpha: 1 } : { x: 0.7, y: 0.48, size: 1, alpha: 1 }
      const side: Pose = m ? { x: 0.8, y: 0.5, size: 0.75, alpha: 0.5 } : { x: 0.15, y: 0.55, size: 0.6, alpha: 1 }
      const faint: Pose = { x: 0.5, y: 0.5, size: 1.1, alpha: 0.15 }
      const close: Pose = m ? { x: 0.62, y: 0.68, size: 1.1, alpha: 1 } : { x: 0.66, y: 0.6, size: 1.25, alpha: 1 }
      keys = [
        { at: 0, pose: hero },
        { at: top('experience') - h * 0.25, pose: side },
        { at: top('work') - h * 0.7, pose: side },
        { at: top('work') - h * 0.1, pose: faint },
        { at: top('about') - h * 0.6, pose: faint },
        { at: Math.max(end, top('about')), pose: close },
      ]
    }

    const resize = () => {
      const dpr = PHONE ? 1 : Math.min(devicePixelRatio, 2)
      el.width = innerWidth * dpr
      el.height = innerHeight * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.font = `${FONT}px ui-monospace, Menlo, monospace`
      ctx.textBaseline = 'top'
      ctx.fillStyle = color
      cw = ctx.measureText('0').width
      cols = Math.ceil(innerWidth / cw)
      rows = Math.ceil(innerHeight / FONT)
      zbuf = new Float32Array(cols * rows)
      lum = new Float32Array(cols * rows)
      measure()
    }

    // pointer as -1..1 from the centre, eased so the lean trails the cursor
    const target = { x: 0, y: 0 }
    const tilt = { x: 0, y: 0 }
    const onMove = (e: PointerEvent) => {
      target.x = (e.clientX / innerWidth) * 2 - 1
      target.y = (e.clientY / innerHeight) * 2 - 1
    }

    // the pose eases toward the scroll target, so even a flick of the wheel glides
    const pose: Pose = { ...poseAt(keys, 0) }

    const draw = (t: number, ease = 0.12) => {
      const goal = poseAt(keys, scrollY)
      for (const k of Object.keys(pose) as (keyof Pose)[]) pose[k] += (goal[k] - pose[k]) * ease
      tilt.x += (target.x - tilt.x) * 0.05
      tilt.y += (target.y - tilt.y) * 0.05

      ctx.clearRect(0, 0, innerWidth, innerHeight)
      if (pose.alpha < 0.01) return

      const ay = t * 0.25 + scrollY * 0.0015 + tilt.x * 0.6
      const ax = 0.5 + tilt.y * 0.4
      const az = t * 0.1
      const [sy, cy, sx, cx, sz, cz] = [Math.sin(ay), Math.cos(ay), Math.sin(ax), Math.cos(ax), Math.sin(az), Math.cos(az)]

      const scale = Math.min(innerWidth, innerHeight) * 0.105 * pose.size
      const ox = innerWidth * pose.x
      const oy = innerHeight * pose.y

      zbuf.fill(-Infinity)
      lum.fill(0)
      const { pos, nrm } = mesh
      for (let i = 0; i < pos.length; i += 3) {
        // rotate Z, then Y, then X; the same for the normal (written into `out`, no allocation per point)
        rot(nrm, i, sz, cz, sy, cy, sx, cx)
        const nx = out[0], ny = out[1], nz = out[2]
        if (nz < -0.15) continue // facing away
        rot(pos, i, sz, cz, sy, cy, sx, cx)
        let x = out[0], y = out[1]
        const z = out[2]

        const p = 5 / (5 - z) // gentle perspective
        x = ox + x * scale * p
        y = oy + y * scale * p
        const c = (x / cw) | 0
        const r = (y / FONT) | 0
        if (c < 0 || r < 0 || c >= cols || r >= rows) continue
        const k = r * cols + c
        if (z <= zbuf[k]) continue
        zbuf[k] = z
        // light from upper left, a little in front
        lum[k] = Math.max(0.05, -nx * 0.5 - ny * 0.55 + nz * 0.67)
      }

      ctx.globalAlpha = pose.alpha
      for (let k = 0; k < lum.length; k++) {
        if (zbuf[k] === -Infinity) continue
        // a little noise in the index keeps the glyphs alive between frames
        const j = Math.floor(lum[k] * RAMP.length + (Math.random() - 0.5) * 1.2)
        ctx.fillText(RAMP[Math.max(0, Math.min(RAMP.length - 1, j))], (k % cols) * cw, ((k / cols) | 0) * FONT)
      }
    }

    // opening a job's details changes where the later sections start
    const ro = new ResizeObserver(measure)
    ro.observe(document.body)
    resize()

    if (still) {
      // reduced motion: one pose, redrawn only when the window changes
      const redraw = () => (resize(), draw(2, 1))
      draw(2, 1)
      addEventListener('resize', redraw)
      return () => (removeEventListener('resize', redraw), ro.disconnect())
    }

    let raf = 0
    let last = 0
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop)
      if (document.hidden || now - last < 1000 / (PHONE ? 20 : FPS)) return
      last = now
      draw(now / 1000)
    }
    raf = requestAnimationFrame(loop)
    addEventListener('resize', resize)
    addEventListener('pointermove', onMove, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      removeEventListener('resize', resize)
      removeEventListener('pointermove', onMove)
    }
  }, [])

  return <canvas ref={canvas} aria-hidden className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-35" />
}

/** The pose for a scroll position: eased between the two keys either side of it */
function poseAt(keys: { at: number; pose: Pose }[], s: number): Pose {
  if (!keys.length) return { x: 0.7, y: 0.48, size: 1, alpha: 1 }
  let i = 0
  while (i < keys.length - 2 && s > keys[i + 1].at) i++
  const a = keys[i]
  const b = keys[Math.min(i + 1, keys.length - 1)]
  const u = Math.min(Math.max((s - a.at) / (b.at - a.at || 1), 0), 1)
  const e = u * u * (3 - 2 * u)
  const out = { ...a.pose }
  for (const k of Object.keys(out) as (keyof Pose)[]) out[k] = a.pose[k] + (b.pose[k] - a.pose[k]) * e
  return out
}

const out = new Float64Array(3)

function rot(v: Float32Array, i: number, sz: number, cz: number, sy: number, cy: number, sx: number, cx: number) {
  const x0 = v[i] * cz - v[i + 1] * sz
  const y0 = v[i] * sz + v[i + 1] * cz
  const x1 = x0 * cy + v[i + 2] * sy
  const z0 = -x0 * sy + v[i + 2] * cy
  out[0] = x1
  out[1] = y0 * cx - z0 * sx
  out[2] = y0 * sx + z0 * cx
}

/** Points and normals on a tube around a (2,3) torus knot, built once */
function knot(U = 900, V = 56, tube = 0.42) {
  const curve = (t: number): Vec => {
    const r = 2 + Math.cos(3 * t)
    return [r * Math.cos(2 * t), Math.sin(3 * t) * 1.1, r * Math.sin(2 * t)]
  }
  const sub = (a: Vec, b: Vec): Vec => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
  const cross = (a: Vec, b: Vec): Vec => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
  const norm = (a: Vec): Vec => {
    const l = Math.hypot(...a) || 1
    return [a[0] / l, a[1] / l, a[2] / l]
  }

  const pos = new Float32Array(U * V * 3)
  const nrm = new Float32Array(U * V * 3)
  const e = 1e-3
  let o = 0
  for (let i = 0; i < U; i++) {
    const t = (i / U) * Math.PI * 2
    const c = curve(t)
    const T = norm(sub(curve(t + e), curve(t - e)))
    // Frenet normal from the second difference; the knot never straightens, so it never vanishes
    const acc = sub(sub(curve(t + e), c), sub(c, curve(t - e)))
    const B = norm(cross(T, acc))
    const N = cross(B, T)
    for (let j = 0; j < V; j++) {
      const v = (j / V) * Math.PI * 2
      const [cv, sv] = [Math.cos(v), Math.sin(v)]
      const n: Vec = [N[0] * cv + B[0] * sv, N[1] * cv + B[1] * sv, N[2] * cv + B[2] * sv]
      pos.set([c[0] + n[0] * tube, c[1] + n[1] * tube, c[2] + n[2] * tube], o)
      nrm.set(n, o)
      o += 3
    }
  }
  return { pos, nrm }
}
