// Prints cv/cv.html to public/Petra-Presecki-CV.pdf (A4) with the installed Google Chrome.
//   pnpm cv
import { chromium } from 'playwright-core'
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const SRC = path.resolve('cv/cv.html')
const OUT = path.resolve('public/Petra-Presecki-CV.pdf')

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage()
await page.goto(pathToFileURL(SRC).href, { waitUntil: 'networkidle' })
await page.evaluate(() => document.fonts.ready)
await page.pdf({ path: OUT, format: 'A4', printBackground: true, preferCSSPageSize: true })
await browser.close()
// it should stay two pages; print the count so an overflow gets noticed
const pages = fs.readFileSync(OUT, 'latin1').match(/\/Type\s*\/Page[^s]/g)?.length
console.log(`${path.relative(process.cwd(), OUT)} · ${pages} pages`)
