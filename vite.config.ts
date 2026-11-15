import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'

// Two editions from one codebase. The default site reads src/data/site.ts; `--mode crypto` (pnpm dev:crypto,
// pnpm build:crypto) swaps in src/data/crypto.ts, the page's head and llms.txt, and builds to dist-crypto.
export default defineConfig(({ mode }) => {
  const crypto = mode === 'crypto'
  return {
    plugins: [react(), tailwindcss(), crypto && cryptoEdition()],
    resolve: {
      alias: [
        ...(crypto ? [{ find: /^@\/data\/site$/, replacement: path.resolve(__dirname, './src/data/crypto.ts') }] : []),
        { find: '@', replacement: path.resolve(__dirname, './src') },
      ],
    },
    build: crypto ? { outDir: 'dist-crypto' } : {},
  }
})

const TITLE = 'Petra Presečki · Product Engineer, crypto & onchain'
const DESCRIPTION =
  'Petra Presečki, product engineer in Zagreb: a multi-chain wallet, KYC and AML flows, ATM cash-out and partner SDKs for a crypto on/off-ramp, now part of Polygon.'

/** The crypto edition's head (title, description, share image) and its own llms.txt */
function cryptoEdition(): Plugin {
  const llms = path.resolve(__dirname, 'src/data/llms.crypto.txt')
  return {
    name: 'crypto-edition',
    transformIndexHtml: html =>
      html
        .replace(/<title>.*<\/title>/, `<title>${TITLE}</title>`)
        .replace(/(property="og:title" content=")[^"]*/, `$1${TITLE}`)
        .replace(/(name="description" content=")[^"]*/, `$1${DESCRIPTION}`)
        .replace(/(property="og:description" content=")[^"]*/, `$1${DESCRIPTION}`)
        .replace(/(property="og:image" content=")[^"]*/, '$1/work/solana-checkout.jpg'),
    configureServer(server) {
      server.middlewares.use('/llms.txt', (_req, res) => {
        res.setHeader('Content-Type', 'text/plain; charset=utf-8')
        res.end(fs.readFileSync(llms))
      })
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'llms.txt', source: fs.readFileSync(llms, 'utf8') })
    },
  }
}
