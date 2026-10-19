// High-res recording through Chrome's own screencast. Playwright's recordVideo captures at 1x,
// so instead: launch Chrome with --force-device-scale-factor=2 (deviceScaleFactor alone still
// screencasts at 1x), collect the JPEG frames with their timestamps, lay them on a steady
// frame-rate timeline and encode them with ffmpeg (VP9).
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

export const FFMPEG = path.join(os.homedir(), 'Library/Caches/ms-playwright/ffmpeg-1013/ffmpeg-mac')

/** Start collecting frames from `page`. Returns `stop()`, which resolves to the frames. */
export async function startScreencast(page, { width, height, quality = 90 }) {
  const cdp = await page.context().newCDPSession(page)
  const frames = []
  cdp.on('Page.screencastFrame', async f => {
    frames.push({ t: f.metadata.timestamp, data: Buffer.from(f.data, 'base64') })
    await cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {})
  })
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality, maxWidth: width, maxHeight: height, everyNthFrame: 1 })
  // Chrome only sends a frame when the screen changes, so a still moment sends nothing. The clip
  // therefore runs from mark() to stop() by the clock, holding the last frame through quiet spells.
  const now = () => Date.now() / 1000
  return {
    /** Mark where the clip should start: drops everything before, keeping what was on screen */
    mark: () => {
      const last = frames.at(-1)
      frames.length = 0
      if (last) frames.push({ ...last, t: now() })
    },
    stop: async () => {
      await cdp.send('Page.stopScreencast').catch(() => {})
      await cdp.detach().catch(() => {})
      const last = frames.at(-1)
      if (last) frames.push({ ...last, t: now() })
      return frames
    },
  }
}

/** Encode frames to VP9 WebM at `fps`, holding each frame until the next one arrives.
 *  This ffmpeg build has no pipe protocol, so the frames go through one MJPEG file. */
export function encode(frames, file, { fps = 30, width, height, crf = 31 } = {}) {
  if (!frames.length) throw new Error('no frames')
  const stream = `${file}.mjpeg`
  const fd = fs.openSync(stream, 'w')
  const start = frames[0].t
  const end = frames.at(-1).t
  let k = 0
  for (let t = start; t <= end; t += 1 / fps) {
    while (k + 1 < frames.length && frames[k + 1].t <= t) k++
    fs.writeSync(fd, frames[k].data)
  }
  fs.closeSync(fd)
  const args = ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', stream]
  if (width) args.push('-vf', `scale=${width}:${height}:flags=lanczos`)
  args.push('-an', '-c:v', 'libvpx-vp9', '-crf', String(crf), '-b:v', '0', '-deadline', 'good', '-cpu-used', '3', '-row-mt', '1', '-pix_fmt', 'yuv420p', file)
  try {
    execFileSync(FFMPEG, args)
  } finally {
    fs.rmSync(stream, { force: true })
  }
  return file
}

/** The first frame as a JPEG poster */
export const poster = frames => frames[0]?.data
