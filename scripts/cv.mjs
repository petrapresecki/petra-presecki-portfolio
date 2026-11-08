// Prints cv/cv.html to public/Petra-Presecki-CV.pdf (A4) with the installed Google Chrome, plus page images in public/cv/.
//   pnpm cv
// A tailored copy prints next to its source:
//   pnpm cv applications/posthog/cv.html
// The Grid version's CV (cv/grid.css laid over cv/cv.html) prints to public/Petra-Presecki-CV-Grid.pdf and public/cv/grid/:
//   pnpm cv --grid
// The Clean version's (cv/clean.css, the site's default) to public/Petra-Presecki-CV-Clean.pdf and public/cv/clean/:
//   pnpm cv --clean
import { chromium } from 'playwright-core'
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { spawnSync } from 'node:child_process'

// a look laid over cv.html: its stylesheet, its fonts, and where it prints
const LOOKS = {
  grid: { fonts: 'family=Inter+Tight:wght@400;500;600', faces: ['400 10pt "Inter Tight"', '500 10pt "Inter Tight"', '600 10pt "Inter Tight"'], name: 'Grid' },
  clean: { fonts: 'family=Archivo:wght@400;500;600&family=IBM+Plex+Mono:wght@400', faces: ['400 10pt Archivo', '500 10pt Archivo', '600 10pt Archivo', '400 10pt "IBM Plex Mono"'], name: 'Clean' },
}
const lookId = Object.keys(LOOKS).find(k => process.argv.includes(`--${k}`))
const look = lookId && LOOKS[lookId]
const arg = process.argv.slice(2).find(a => !a.startsWith('--'))
const SRC = path.resolve(arg ?? 'cv/cv.html')
const OUT = arg
  ? path.join(path.dirname(SRC), 'Petra-Presecki-CV.pdf')
  : path.resolve(look ? `public/Petra-Presecki-CV-${look.name}.pdf` : 'public/Petra-Presecki-CV.pdf')

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage()
await page.goto(pathToFileURL(SRC).href, { waitUntil: 'networkidle' })
if (look) {
  await page.addStyleTag({ url: `https://fonts.googleapis.com/css2?${look.fonts}&display=swap` })
  await page.addStyleTag({ path: path.resolve(`cv/${lookId}.css`) })
  await page.evaluate(faces => Promise.all(faces.map(f => document.fonts.load(f))), look.faces)
}
// the Clean CV names the job as the site does: the company now, the product it was in brackets
if (lookId === 'clean')
  await page.evaluate(() => {
    for (const b of document.querySelectorAll('h3 b')) if (b.textContent === 'Coinme (now Polygon Labs)') b.textContent = 'Polygon (Coinme)'
  })
await page.evaluate(() => document.fonts.ready)
await page.pdf({ path: OUT, format: 'A4', printBackground: true, preferCSSPageSize: true })
await browser.close()
// it should stay two pages; print the count so an overflow gets noticed
const pages = fs.readFileSync(OUT, 'latin1').match(/\/Type\s*\/Page[^s]/g)?.length
console.log(`${path.relative(process.cwd(), OUT)} · ${pages} pages`)

// the site's own CV also goes out as page images, for the paper view (macOS: PDFKit via Swift)
if (!arg) {
  const r = spawnSync('swift', ['scripts/cv-pages.swift', OUT, look ? `public/cv/${lookId}` : 'public/cv'], { stdio: 'inherit' })
  if (r.status !== 0) console.warn('Page images not updated: needs Swift on macOS')
}
