// Prints cv/cv.html to public/Petra-Presecki-CV.pdf (A4) with the installed Google Chrome, plus page images in public/cv/.
//   pnpm cv
// A tailored copy prints next to its source:
//   pnpm cv applications/posthog/cv.html
// The Grid version's CV (cv/grid.css laid over cv/cv.html) prints to public/Petra-Presecki-CV-Grid.pdf and public/cv/grid/:
//   pnpm cv --grid
import { chromium } from 'playwright-core'
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { spawnSync } from 'node:child_process'

const grid = process.argv.includes('--grid')
const arg = process.argv.slice(2).find(a => !a.startsWith('--'))
const SRC = path.resolve(arg ?? 'cv/cv.html')
const OUT = arg
  ? path.join(path.dirname(SRC), 'Petra-Presecki-CV.pdf')
  : path.resolve(grid ? 'public/Petra-Presecki-CV-Grid.pdf' : 'public/Petra-Presecki-CV.pdf')

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage()
await page.goto(pathToFileURL(SRC).href, { waitUntil: 'networkidle' })
if (grid) {
  await page.addStyleTag({ url: 'https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600&display=swap' })
  await page.addStyleTag({ path: path.resolve('cv/grid.css') })
  await page.evaluate(() => Promise.all(['400', '500', '600'].map(w => document.fonts.load(`${w} 10pt "Inter Tight"`))))
}
await page.evaluate(() => document.fonts.ready)
await page.pdf({ path: OUT, format: 'A4', printBackground: true, preferCSSPageSize: true })
await browser.close()
// it should stay two pages; print the count so an overflow gets noticed
const pages = fs.readFileSync(OUT, 'latin1').match(/\/Type\s*\/Page[^s]/g)?.length
console.log(`${path.relative(process.cwd(), OUT)} · ${pages} pages`)

// the site's own CV also goes out as page images, for the paper view (macOS: PDFKit via Swift)
if (!arg) {
  const r = spawnSync('swift', ['scripts/cv-pages.swift', OUT, grid ? 'public/cv/grid' : 'public/cv'], { stdio: 'inherit' })
  if (r.status !== 0) console.warn('Page images not updated: needs Swift on macOS')
}
