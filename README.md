# petra-presecki-portfolio

![Scrolling through the portfolio](docs/preview.gif)

Portfolio of Petra Presečki, frontend and product engineer. Live at [petra-presecki.pages.dev](https://petra-presecki.pages.dev/).

React 19, TypeScript, Vite, Tailwind 4, GSAP and Lenis, with blocks from my creative-kit (scramble text, roll text, column curtain).

```sh
pnpm install
pnpm dev
pnpm build   # VITE_IVA_URL / VITE_BYKRESO_URL override the live links
```

- `src/data/site.ts`: every word on the site
- `src/versions/`: the layouts. `Clean` is the default (after ksusharmony.com, with mariamarago.com's cursor); `?v=grid` and `?v=original` keep the earlier ones
- `src/components/`: the page, the full-screen view for a closer look at Coinme work and side projects, and the interactive demos (design system, flows, agents)
- `cv/cv.html`: the CV; `pnpm cv` prints it to `public/Petra-Presecki-CV.pdf` (A4, two pages) with the installed Chrome. `pnpm cv <file>` prints a tailored copy next to its source (`applications/` is gitignored)
- `public/llms.txt`: the site's facts for AI agents; keep it in step with `src/data/site.ts`
- `public/work/clips/`: the recordings, made by `scripts/record.mjs` from the real sites at 2x through Chrome's screencast (`scripts/screencast.mjs`)

Deployed to Cloudflare Pages: `wrangler pages deploy dist --project-name petra-presecki --branch main`.

## Crypto edition

The same site for crypto teams, at its own URL: the Coinme onchain cases (wallet, KYC & AML, ATM cash-out, partner SDKs) from the 2026 crypto portfolio and Solana checkout in Side work, and the crypto CV. Clean layout only.

```sh
pnpm dev:crypto     # vite --mode crypto
pnpm build:crypto   # to dist-crypto/
```

- `src/data/crypto.ts`: its words. In crypto mode `vite.config.ts` points `@/data/site` here; it re-exports everything else from `site.ts`
- `src/data/llms.crypto.txt`: served as its `/llms.txt`; the page title and description are swapped in `vite.config.ts`
- CV: `public/crypto/` holds the crypto CV in the Clean look, printed from `applications/crypto/cv.html` with `pnpm cv <copy of it> --clean`, pages made with `swift scripts/cv-pages.swift <pdf> public/crypto/cv`
- Deploy: `wrangler pages deploy dist-crypto --project-name petra-presecki-crypto --branch main`
