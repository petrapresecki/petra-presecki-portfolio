// Every word on the site. Facts only: names, roles, years, what was built and how.

export const person = {
  name: 'Petra Presečki',
  role: 'Frontend & product engineer',
  stack: 'React · React Native · TS',
  place: 'Zagreb, CET · remote',
  email: 'petra.presecki123@gmail.com',
  linkedin: 'https://www.linkedin.com/in/petra-prese%C4%8Dki-a4039932b',
  cv: '/Petra-Presecki-CV.pdf',
}

// Live builds; VITE_IVA_URL / VITE_BYKRESO_URL override them (e.g. to point at local servers)
const IVA_URL = import.meta.env.VITE_IVA_URL ?? 'https://iva-presecki.pages.dev/v3'
const BYKRESO_URL = import.meta.env.VITE_BYKRESO_URL ?? 'https://bykreso.pages.dev/'

export interface Media {
  src: string
  /** file name shown as the caption */
  name: string
  poster?: string
}

export interface Project {
  id: string
  title: string
  kind: string
  year: string
  url?: string
  /** shown instead of a live link when there isn't one */
  note?: string
  /** the big recording, four cells beside it, then two wide clips under them */
  hero: Media
  cells: Media[]
  wide: Media[]
  summary: string
  facts: [string, string][]
  details: string[]
}

/** A recording from scripts/record.mjs: public/work/clips/<name>.webm with its first frame as the poster */
const clip = (name: string): Media => ({ src: `/work/clips/${name}.webm`, poster: `/work/clips/${name}.jpg`, name: `${name.replace('-', '_')}.webm` })

export const projects: Project[] = [
  {
    id: 'iva',
    title: 'Iva Presečki',
    kind: 'Portfolio · three.js',
    year: '2026',
    url: IVA_URL,
    hero: clip('iva-keyring'),
    cells: [clip('iva-rool'), clip('iva-apuro'), clip('iva-gabagool'), clip('iva-about')],
    wide: [clip('iva-pull'), clip('iva-booklet')],
    summary:
      'Portfolio for Iva Presečki, a graphic designer working across branding, packaging, motion and 3D. Her four projects hang from a chrome keyring as charms. Pull one off the ring and its project floods open in its own colours.',
    facts: [
      ['Client', 'Iva Presečki'],
      ['Role', 'Concept, design, development'],
      ['Stack', 'React 19, TypeScript, three.js / R3F, GSAP, Lenis, Tailwind'],
    ],
    details: [
      'The keyring is a React Three Fiber scene: charms hang from jump rings, sway with pointer speed and twist on their chains',
      'Pull a charm until it snaps and the project page floods open in the shape of that charm',
      'Each charm sits on its own depth layer, so a turned charm never cuts into its neighbour',
      'Started as a 2D paper prototype; a separate keyring layout for phones',
    ],
  },
  {
    id: 'bykreso',
    title: 'bykreso',
    kind: 'Portfolio · video',
    year: '2026',
    url: BYKRESO_URL,
    hero: clip('bykreso-strip'),
    cells: [clip('bykreso-colour'), clip('bykreso-work'), clip('bykreso-about'), clip('bykreso-list')],
    wide: [clip('bykreso-player'), clip('bykreso-page')],
    summary:
      'Portfolio for Krešo, who films and grades weddings, bands, bars and cities in Zagreb. His films run past in a greyscale strip; the one in the viewfinder plays in colour and the whole page takes on its colour. Rebuilt from a screen recording after the original site was lost.',
    facts: [
      ['Client', 'Krešo (@bykreso)'],
      ['Role', 'Design, development'],
      ['Stack', 'React 19, TypeScript, GSAP, Lenis, Tailwind, Swift for tooling'],
    ],
    details: [
      'A looping film strip under four corner marks; the wheel drives the strip near the centre, the page scrolls from the sides',
      'Every film has its own colour: the page fades to it, flips its ink on dark films and prints the hex in the corner',
      'The work list shows each film as a barcode, one column per frame, generated from the videos by a small Swift script',
      'The player grows out of the clicked clip; arrow keys switch films, Esc closes',
    ],
  },
  {
    id: 'kit',
    title: 'creative-kit',
    kind: 'Library · motion blocks',
    year: '2026',
    note: 'Private repo · opens the recording',
    hero: clip('kit-orbit'),
    cells: [clip('kit-dither'), clip('kit-strips'), clip('kit-index'), clip('kit-inspo')],
    wide: [clip('kit-home'), clip('kit-blocks')],
    summary:
      'My library of building blocks for creative websites: 33 motion and effect blocks, 8 themes, grids, a starter template and 86 inspiration pins, with a showcase site that runs everything live. Blocks start from sites I love and get reworked for each project; the best ones started in my own work.',
    facts: [
      ['Type', 'Personal library'],
      ['Contents', '33 blocks, 8 themes, 86 pins'],
      ['Stack', 'React, TypeScript, GSAP, three.js, WebGL2, a Node CLI'],
    ],
    details: [
      'A CLI copies blocks into a new site as source, with their dependencies, so each site can change them freely',
      'Themes are design tokens in JSON, shared by the CLI and the showcase site',
      'A Claude Code skill reads the whole library and turns it into concepts for a new site',
      'This portfolio uses it too: scramble text and the column curtain come from the kit',
    ],
  },
]

export const about = {
  lines: [
    'I’m Petra, a frontend and product engineer in Zagreb. For five years I’ve built web and mobile products in React, React Native and TypeScript, mostly in consulting teams next to designers, strategists and clients.',
    'At Coinme I founded and led a cross-platform design system, one React Native codebase on iOS, Android and web, and owned product flows from the first commit to production. AI is part of how I build: Claude Code agents, MCP integrations and AI code review that became shared tooling for the frontend team.',
    'Outside client work I build sites for creative people and keep creative-kit, my library of motion blocks, themes and inspiration.',
  ],
  facts: [
    ['Based', 'Zagreb, Croatia'],
    ['Works', 'Remote, CET'],
    ['Studied', 'BSc Computer Science, FER Zagreb'],
    ['Languages', 'English, Croatian'],
  ] as [string, string][],
}

export const experience = [
  {
    company: 'Coinme',
    note: 'acquired by Polygon',
    links: [{ label: 'Polygon Labs', url: 'https://polygon.technology/' }],
    role: 'Web Engineer',
    dates: '2024 — 2026',
    context:
      'A white-label crypto widget that fintech and wallet apps embed in their iOS, Android and web apps: one deployment, rebranded per partner at runtime. Via Endava until Feb 2026, then employed directly by Polygon. Frontend team of 7–10; about 270 merged MRs across 11 repositories.',
    groups: [
      {
        title: 'Design system & UI craft',
        items: [
          'Founded and led the cross-platform design system for two years: one React Native codebase on iOS, Android and web, behind every screen across 137 releases',
          'Built 13+ of its 34 components, including an interactive SVG price chart with gesture-driven animation (Reanimated, Gesture Handler)',
          'Designed the theming and white-label model (tokens, dark mode, a “host theme wins” merge order), so partners rebrand through configuration',
        ],
      },
      {
        title: 'AI-native engineering',
        items: [
          'Claude Code commands and agents for review, tests, scaffolding and end-to-end MR submission across GitLab, Jira and Slack; they became the org’s shared plugin marketplace',
          'An MCP integration that syncs missing translation keys to Tolgee, plus a post-push hook that flags them',
          'Made the CI AI code reviewer incremental; co-built a context layer for coding agents across 27 repos, cutting loaded context 6–16×',
        ],
      },
      {
        title: 'Product flows, end to end',
        items: [
          'Identity verification, enhanced due diligence and cash-out at ATMs with live quotes, OTP and real-time status over server-sent events, each as an explicit state machine',
          'Main developer of the multi-chain wallet; large parts of the buy journey and the cash-location finder',
        ],
      },
      {
        title: 'SDKs, tooling & delivery',
        items: [
          'Took the React Native onboarding SDK from first commit to production v1.0 in six days; a framework-free web core for Vue, Angular and vanilla JS',
          'A Node.js CLI that became the team’s standard package-update command; SDK docs and agent skills for the partner docs',
        ],
      },
    ],
  },
  {
    company: 'Endava',
    note: 'ex FIVE',
    links: [{ label: 'Endava', url: 'https://www.endava.com/' }],
    role: 'React / React Native Developer',
    dates: '2021 — 2026',
    context:
      'Consulting: web and mobile products for clients in fintech, hospitality and entertainment, working directly with client designers, backend teams and stakeholders. From Oct 2024 seconded to Coinme.',
    groups: [
      {
        title: 'Practice',
        items: [
          'Architecture and development standards in modular monorepos (Redux Toolkit, RTK Query, TanStack Query, Jotai); faster CI/CD with lazy loading and code splitting',
          'Accessible (WCAG) interfaces with over 80% unit-test coverage',
          'Led an in-house project and mentored a junior developer; ran technical interviews and client demos',
        ],
      },
      {
        title: 'Selected clients',
        items: [
          'ASCAP, 2023–24 · React Native app for artists to register works and manage royalties: a 12-step registration flow, onboarding animations with Reanimated and Lottie',
          'Opayo, 2023 · Web payment gateway for a banking client, fully WCAG-compliant forms with React Hook Form and Material UI',
          'Cooking Light Diet, 2021–22 · Meal-planning app and web admin built from the ground up: a React Admin CMS and reusable React Native components',
        ],
      },
    ],
  },
]

export const skills: [string, string][] = [
  ['Frontend & mobile', 'React, React Native, Expo, TypeScript, react-native-web'],
  ['UI & motion', 'Design tokens, theming, Reanimated, Gesture Handler, Lottie, GSAP, three.js, Tailwind, Storybook, WCAG'],
  ['AI-assisted', 'Claude Code (agents, skills, hooks, plugins), MCP, AI review in CI, context engineering'],
  ['State & data', 'Redux Toolkit, RTK Query, TanStack Query, Jotai, React Hook Form, SSE'],
  ['Tooling', 'Node.js, CLIs, SDK design, npm, Jest, Vitest, RTL, MSW, Vite, Turborepo, GitLab CI'],
]
