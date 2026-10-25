// Prints cv/cv.html to public/Petra-Presecki-CV.pdf (A4) with the installed Google Chrome, plus page images in public/cv/.
//   pnpm cv
// A tailored copy prints next to its source:
//   pnpm cv applications/posthog/cv.html
import { chromium } from 'playwright-core'
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { spawnSync } from 'node:child_process'

const SRC = path.resolve(process.argv[2] ?? 'cv/cv.html')
const OUT = process.argv[2]
  ? path.join(path.dirname(SRC), 'Petra-Presecki-CV.pdf')
  : path.resolve('public/Petra-Presecki-CV.pdf')

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage()
await page.goto(pathToFileURL(SRC).href, { waitUntil: 'networkidle' })
await page.evaluate(() => document.fonts.ready)
await page.pdf({ path: OUT, format: 'A4', printBackground: true, preferCSSPageSize: true })
await browser.close()
// it should stay two pages; print the count so an overflow gets noticed
const pages = fs.readFileSync(OUT, 'latin1').match(/\/Type\s*\/Page[^s]/g)?.length
console.log(`${path.relative(process.cwd(), OUT)} · ${pages} pages`)

// the site's own CV also goes out as page images, for the paper view (macOS: PDFKit via Swift)
if (!process.argv[2]) {
  const r = spawnSync('swift', ['scripts/cv-pages.swift', OUT, 'public/cv'], { stdio: 'inherit' })
  if (r.status !== 0) console.warn('Page images not updated: needs Swift on macOS')
}
