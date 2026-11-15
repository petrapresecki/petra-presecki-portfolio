import type { Media } from '@/data/site'

// asked once: whether this browser plays VP9 WebM (some Safari versions don't, and get the H.264 copy instead)
const vp9 = typeof document !== 'undefined' && document.createElement('video').canPlayType('video/webm; codecs="vp9"') !== ''

/** The file of a recording this browser can play */
export const playable = (m: { src: string; mp4?: string }) => (vp9 || !m.mp4 ? m.src : m.mp4)

/** The small hover loop of a recording, in a format this browser can play */
export const peekSrc = (m: Media) => m.peek && (vp9 ? m.peek.webm : m.peek.mp4)
