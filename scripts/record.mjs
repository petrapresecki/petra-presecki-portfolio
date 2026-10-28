// Records every clip on the site into public/work/clips/, at 2x, from the sites running locally:
// iva :4301 (vite preview of iva-v2), bykreso :4302, creative-kit :4303 (its showcase dev server).
//   node scripts/record.mjs            all takes
//   node scripts/record.mjs iva-       takes whose name starts with "iva-"
// Each take navigates, waits for the site to settle, calls mark() where the clip should start,
// then drives the site. Uses the installed Google Chrome and Playwright's ffmpeg.
import { chromium } from 'playwright-core'
import fs from 'node:fs'
import path from 'node:path'
import { startScreencast, encode } from './screencast.mjs'

const OUT = path.resolve('public/work/clips')
const IVA = 'http://localhost:4301'
const KRESO = 'http://localhost:4302'
const KIT = 'http://localhost:4303'
// Frame Score is recorded from the live build; the still is loaded through "your frame" and never kept in the repo
const FRAME = 'https://frame-score.pages.dev'
const STILL = process.env.FRAME_STILL ?? path.join(process.env.HOME, 'Desktop/the-grand-budapest-hotel.jpg')
const wait = ms => new Promise(r => setTimeout(r, ms))

// output sizes: the hero and the wide clips span two columns, cells one
const SIZES = { hero: [2400, 1500, 34], wide: [2400, 1500, 35], cell: [1600, 1000, 36] }

let pointer = [720, 450]
async function glide(page, to, steps = 45) {
  const [x, y] = pointer
  for (let i = 1; i <= steps; i++) {
    const t = i / steps
    const e = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2
    await page.mouse.move(x + (to[0] - x) * e, y + (to[1] - y) * e)
    await wait(16)
  }
  pointer = to
}
async function scroll(page, px, steps = 160) {
  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, px / steps)
    await wait(26)
  }
}
/** Pull a keyring charm straight down until it snaps */
async function pull(page, at) {
  await glide(page, at)
  await wait(500)
  await page.mouse.down()
  await glide(page, [at[0] + 30, at[1] + 340], 50)
  await page.mouse.up()
}
/** Pin a kit block's live demo over the whole window ([data-demo] marks its theme scope) */
const fillWindow = page =>
  page.evaluate(() => {
    const scope = document.querySelector('[data-demo]').parentElement
    Object.assign(scope.style, { position: 'fixed', inset: '0', zIndex: '9999', minHeight: '0' })
    document.body.style.overflow = 'hidden'
    for (const el of scope.querySelectorAll(':scope > :not([data-demo]), :scope > :not([data-demo]) [class*="h-["]')) el.style.height = '100vh'
    window.dispatchEvent(new Event('resize'))
  })
/** Open Frame Score with the still at the gate, or one of its plates (0-2) */
async function frame(page, plate) {
  await page.goto(`${FRAME}/`)
  await wait(2500)
  if (plate === undefined) await page.locator('input[type=file]').setInputFiles(STILL)
  else await page.locator(`button[title^="Plate 0${plate + 1}"]`).click()
  await wait(1500)
}
const play = page => page.getByRole('button', { name: 'play', exact: true }).click()
/** Drag a printer-points numeral sideways by some points (9 px each) */
async function grade(page, label, points, steps = 50) {
  const box = await page.getByRole('slider', { name: `${label}, printer points` }).boundingBox()
  const at = [box.x + box.width / 2, box.y + box.height / 3]
  await glide(page, at, 30)
  await page.mouse.down()
  await glide(page, [at[0] + points * 9, at[1]], steps)
  await page.mouse.up()
}
const charms = { rool: [620, 380], booklet: [860, 470], apuro: [640, 640], gabagool: [880, 720] }

const takes = {
  // Iva Presečki: the paper-home keyring
  'iva-keyring': ['hero', async (page, mark) => {
    await page.goto(`${IVA}/v3`)
    await wait(5000)
    pointer = [200, 450]
    await page.mouse.move(...pointer)
    mark()
    for (const c of ['rool', 'booklet', 'apuro', 'gabagool']) {
      await glide(page, charms[c])
      await wait(1000)
    }
    await pull(page, charms.booklet)
    await wait(3000)
  }],
  ...Object.fromEntries(
    ['rool', 'apuro', 'gabagool'].map(id => [
      `iva-${id}`,
      ['cell', async (page, mark) => {
        await page.goto(`${IVA}/v3/work/${id}`)
        await wait(3500)
        await page.mouse.move(720, 450)
        mark()
        await wait(800)
        await scroll(page, 1500)
        await wait(600)
      }],
    ]),
  ),
  'iva-about': ['cell', async (page, mark) => {
    await page.goto(`${IVA}/v3/about`)
    await wait(3000)
    await page.mouse.move(720, 450)
    mark()
    await wait(800)
    await scroll(page, 900)
    await wait(800)
  }],
  'iva-pull': ['wide', async (page, mark) => {
    await page.goto(`${IVA}/v3`)
    await wait(5000)
    pointer = [1200, 300]
    await page.mouse.move(...pointer)
    mark()
    await glide(page, charms.gabagool)
    await wait(900)
    await pull(page, charms.gabagool)
    await wait(2500)
    await scroll(page, 900, 120)
    await wait(600)
  }],
  'iva-booklet': ['wide', async (page, mark) => {
    await page.goto(`${IVA}/v3/work/booklet`)
    await wait(3500)
    await page.mouse.move(720, 450)
    mark()
    await wait(800)
    await scroll(page, 2400, 220)
    await wait(600)
  }],

  // bykreso: the film strip
  'bykreso-strip': ['hero', async (page, mark) => {
    await page.goto(`${KRESO}/`)
    await wait(3500)
    await page.mouse.move(720, 450)
    mark()
    for (let i = 0; i < 5; i++) {
      for (let s = 0; s < 12; s++) {
        await page.mouse.wheel(0, 22)
        await wait(16)
      }
      await wait(1800)
    }
  }],
  'bykreso-player': ['wide', async (page, mark) => {
    await page.goto(`${KRESO}/`)
    await wait(3500)
    await page.mouse.move(720, 450)
    mark()
    await wait(800)
    await page.mouse.click(720, 450)
    await wait(2800)
    for (let i = 0; i < 2; i++) {
      await page.keyboard.press('ArrowRight')
      await wait(2200)
    }
    await page.keyboard.press('Escape')
    await wait(1600)
  }],
  'bykreso-work': ['cell', async (page, mark) => {
    await page.goto(`${KRESO}/`)
    await wait(3000)
    await page.getByRole('button', { name: 'Rad', exact: true }).click()
    await wait(2600)
    mark()
    const rows = page.locator('[data-row] button')
    for (const i of [0, 2, 3, 5, 7, 9]) {
      await rows.nth(i).hover()
      await wait(700)
    }
  }],
  'bykreso-about': ['cell', async (page, mark) => {
    await page.goto(`${KRESO}/`)
    await wait(3000)
    await page.getByRole('button', { name: 'O meni', exact: true }).click()
    await wait(1200)
    mark()
    await wait(1600)
    await scroll(page, 500, 80)
    await wait(800)
  }],
  'bykreso-colour': ['cell', async (page, mark) => {
    await page.goto(`${KRESO}/`)
    await wait(3500)
    await page.mouse.move(720, 450)
    mark()
    for (let i = 0; i < 6; i++) {
      for (let s = 0; s < 8; s++) {
        await page.mouse.wheel(0, -24)
        await wait(16)
      }
      await wait(1100)
    }
  }],
  // Clicking titles in the strip's side list: the strip runs to that film and the page takes its colour
  'bykreso-list': ['cell', async (page, mark) => {
    await page.goto(`${KRESO}/`)
    await wait(3500)
    pointer = [300, 450]
    await page.mouse.move(...pointer)
    mark()
    for (const y of [420, 495, 405, 480]) {
      await glide(page, [575, y], 30)
      await page.mouse.click(575, y)
      await wait(1700)
    }
  }],
  'bykreso-page': ['wide', async (page, mark) => {
    await page.goto(`${KRESO}/`)
    await wait(3500)
    await page.mouse.move(80, 450)
    mark()
    await wait(800)
    await scroll(page, 2600, 240)
    await wait(800)
  }],

  // creative-kit: blocks running live in the showcase
  'kit-orbit': ['hero', async (page, mark) => {
    await page.goto(`${KIT}/blocks/orbit-gallery`)
    await wait(2500)
    await fillWindow(page)
    await wait(3500)
    pointer = [300, 450]
    mark()
    await glide(page, [720, 420])
    await wait(1500)
    await glide(page, [760, 470])
    await wait(1200)
    await page.mouse.down()
    await glide(page, [300, 480], 40)
    await page.mouse.up()
    await wait(2500)
  }],
  'kit-dither': ['cell', async (page, mark) => {
    await page.goto(`${KIT}/blocks/dither-reveal`)
    await wait(2500)
    await fillWindow(page)
    await wait(2500)
    pointer = [200, 300]
    mark()
    for (const p of [[700, 600], [1200, 250], [900, 700], [400, 450], [1100, 500]]) await glide(page, p, 60)
    await wait(1200)
  }],
  'kit-strips': ['cell', async (page, mark) => {
    await page.goto(`${KIT}/blocks/work-strips`)
    await wait(2500)
    await fillWindow(page)
    await wait(2500)
    pointer = [100, 450]
    mark()
    for (const p of [[520, 450], [900, 450], [1300, 450], [700, 450]]) {
      await glide(page, p)
      await wait(1100)
    }
  }],
  'kit-index': ['cell', async (page, mark) => {
    await page.goto(`${KIT}/blocks/work-index`)
    await wait(2500)
    await fillWindow(page)
    await wait(2500)
    pointer = [300, 120]
    mark()
    for (const y of [220, 380, 540, 700, 460]) {
      await glide(page, [560, y], 35)
      await wait(1000)
    }
  }],
  'kit-inspo': ['cell', async (page, mark) => {
    await page.goto(`${KIT}/inspo`)
    await wait(2500)
    await page.evaluate(() => window.scrollTo(0, 900))
    await wait(1800)
    await page.mouse.move(720, 450)
    mark()
    await scroll(page, 1300, 140)
    await wait(600)
  }],
  'kit-home': ['wide', async (page, mark) => {
    await page.goto(`${KIT}/`)
    await wait(4000)
    pointer = [300, 600]
    await page.mouse.move(...pointer)
    mark()
    await glide(page, [720, 600], 60)
    await wait(1500)
    await scroll(page, 900, 120)
    await wait(1000)
  }],
  'kit-blocks': ['wide', async (page, mark) => {
    await page.goto(`${KIT}/blocks`)
    await wait(3000)
    pointer = [300, 500]
    await page.mouse.move(...pointer)
    mark()
    await glide(page, [700, 520])
    await wait(700)
    await glide(page, [1100, 520])
    await wait(700)
    await scroll(page, 1400, 160)
    await wait(800)
  }],

  // Frame Score: grading a still from The Grand Budapest Hotel while it plays
  'fs-grade': ['hero', async (page, mark) => {
    await frame(page)
    pointer = [900, 450]
    await page.mouse.move(...pointer)
    mark()
    await play(page)
    await wait(3500)
    await grade(page, 'Temperature', 14)
    await wait(1800)
    await grade(page, 'Saturation', 12)
    await wait(1800)
    await grade(page, 'Temperature', -30, 70)
    await wait(2500)
  }],
  'fs-play': ['cell', async (page, mark) => {
    await frame(page)
    pointer = [900, 450]
    await page.mouse.move(...pointer)
    mark()
    await play(page)
    await wait(7000)
  }],
  'fs-temp': ['cell', async (page, mark) => {
    await frame(page)
    pointer = [900, 450]
    mark()
    await grade(page, 'Temperature', 22, 50)
    await wait(600)
    await grade(page, 'Temperature', -44, 90)
    await wait(1000)
  }],
  'fs-contrast': ['cell', async (page, mark) => {
    await frame(page)
    pointer = [900, 450]
    mark()
    await grade(page, 'Contrast', 18)
    await wait(600)
    await grade(page, 'Exposure', -14)
    await wait(1000)
  }],
  // The plates are drawn in code; switching them shows the readout and accent following the picture
  'fs-plates': ['cell', async (page, mark) => {
    await frame(page, 0)
    pointer = [300, 700]
    await page.mouse.move(...pointer)
    mark()
    for (const n of [2, 3, 1]) {
      await wait(1200)
      const box = await page.locator(`button[title^="Plate 0${n}"]`).boundingBox()
      await glide(page, [box.x + box.width / 2, box.y + box.height / 2], 30)
      await page.mouse.click(...pointer)
    }
    await wait(1400)
  }],
  'fs-saturation': ['wide', async (page, mark) => {
    await frame(page)
    pointer = [900, 450]
    await page.mouse.move(...pointer)
    mark()
    await play(page)
    await wait(2500)
    await grade(page, 'Saturation', -25, 60)
    await wait(1500)
    await grade(page, 'Saturation', 45, 90)
    await wait(2500)
  }],
  'fs-exposure': ['wide', async (page, mark) => {
    await frame(page)
    pointer = [900, 450]
    await page.mouse.move(...pointer)
    mark()
    await play(page)
    await wait(2500)
    await grade(page, 'Exposure', -18, 60)
    await wait(2000)
    await grade(page, 'Exposure', 30, 80)
    await wait(2500)
  }],
}

const only = process.argv[2]
fs.mkdirSync(OUT, { recursive: true })
const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--force-device-scale-factor=2'] })
for (const [name, [size, take]] of Object.entries(takes)) {
  if (only && !name.startsWith(only)) continue
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })
  const rec = await startScreencast(page, { width: 2880, height: 1800 })
  try {
    await take(page, rec.mark)
  } catch (e) {
    console.log(`${name}: failed — ${String(e).split('\n')[0]}`)
    await rec.stop()
    await page.close()
    continue
  }
  const frames = await rec.stop()
  await page.close()
  const [w, h, crf] = SIZES[size]
  const file = path.join(OUT, `${name}.webm`)
  encode(frames, file, { width: w, height: h, crf })
  fs.writeFileSync(path.join(OUT, `${name}.jpg`), frames[0].data)
  const secs = frames.at(-1).t - frames[0].t
  console.log(`${name}: ${secs.toFixed(1)}s, ${(frames.length / secs).toFixed(0)} fps → ${(fs.statSync(file).size / 1e6).toFixed(1)} MB`)
}
await browser.close()
