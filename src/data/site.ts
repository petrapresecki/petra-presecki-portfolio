// Every word on the site. Facts only: names, roles, years, what was built and how.

export const person = {
  name: 'Petra Presečki',
  role: 'Frontend engineer',
  focus: 'Design systems, product UI, AI agent tooling',
  stack: 'React · React Native · TS',
  place: 'Zagreb, CET · remote',
  email: 'petra.presecki123@gmail.com',
  linkedin: 'https://www.linkedin.com/in/petra-prese%C4%8Dki-a4039932b',
  github: 'https://github.com/petrapresecki',
  cv: '/Petra-Presecki-CV.pdf',
}

// Live builds; VITE_IVA_URL / VITE_BYKRESO_URL override them (e.g. to point at local servers)
const IVA_URL = import.meta.env.VITE_IVA_URL ?? 'https://iva-presecki.pages.dev/'
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
    hero: clip('kit-home'),
    cells: [clip('kit-dither'), clip('kit-strips'), clip('kit-index'), clip('kit-inspo')],
    wide: [clip('kit-orbit'), clip('kit-blocks')],
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

export interface Case {
  id: string
  title: string
  kind: string
  /** the label in the experience list */
  short: string
  summary: string
  link?: { label: string; url: string }
  /** the small exhibit beside the text */
  visual: 'theme' | 'flows' | 'sdk' | 'agent'
  sections: { title: string; items: string[] }[]
}

/** Selected work at Coinme, told without internal names, code or screens */
export const cases: Case[] = [
  {
    id: 'design-system',
    short: 'Design system',
    title: 'A design system partners rebrand by config',
    kind: 'Founded and led · 2025 – 2026',
    summary:
      'One React Native codebase that renders every screen of a white-label crypto widget on iOS, Android and the web. Fintech and wallet apps embed it, and each one rebrands it by sending a partial theme instead of forking the code.',
    visual: 'theme',
    sections: [
      {
        title: 'What I did',
        items: [
          'Started the library on day one and set its foundations: tooling, Storybook, an Expo example app, the React Native 0.77 upgrade',
          'Designed the theming model: design tokens, dark mode and a “host theme wins” deep merge, so a partner sends only the tokens it changes',
          'Built 13+ components, among them stacked bottom sheets, an OTP input, swipeable tabs and an interactive SVG price chart for web and native (Reanimated, Gesture Handler)',
          'A cross-platform icon system that ships only the current platform’s SVGs in each bundle',
        ],
      },
      {
        title: 'Decisions',
        items: [
          'Partners override tokens, never components: the contract stays small enough to keep stable across 137 releases',
          'Separate web and native implementations where the platforms really differ (charts, icons), one API on top',
        ],
      },
    ],
  },
  {
    id: 'flows',
    short: 'Flows & orchestrator',
    title: 'One widget, a different app for every partner',
    kind: 'Built flows, wired them into the orchestrator · 2025 – 2026',
    summary:
      'The widget is an orchestrator: it reads a partner’s configuration and mounts self-contained flows, like signing up, verifying identity, buying with cash or selling at an ATM. Each partner gets its own mix without its own code. I built or co-built six of those flows and wired them into the orchestrator. Trust Wallet’s Cash Deposits runs on it, from the Coinme sign-in onward.',
    link: {
      label: 'Trust Wallet: Cash Deposits',
      url: 'https://trustwallet.com/blog/company/introducing-cash-deposits-on-trust-wallet-turn-cash-into-digital-money',
    },
    visual: 'flows',
    sections: [
      {
        title: 'What I did',
        items: [
          'Built the identity-verification failure paths (wrong SSN, phone mismatch, declines), the due-diligence questionnaire for flagged users, and most of the cash-out-at-an-ATM flow',
          'Built the wallet from scratch: balances across several blockchains, sending by QR code, a live price chart',
          'Built the cash-buy screens, tax documents and the cash-location finder, and cleared the launch blockers for a major wallet partner',
        ],
      },
      {
        title: 'In the orchestrator',
        items: [
          'Wrote four of its eighteen flow integrations, including the routing that holds flagged users before any transaction',
          'Partner config sets the defaults: amounts, landing screen, which networks show in which region',
          'A CLI that updates every flow package at once, now the team’s standard command',
        ],
      },
      {
        title: 'Decisions',
        items: [
          'A flow never knows which partner it runs in: everything partner-specific arrives as config through one shared contract',
          'Every flow is a state machine, and anything the backend doesn’t clearly confirm counts as a no',
        ],
      },
    ],
  },
  {
    id: 'sdks',
    short: 'Partner SDKs',
    title: 'Partner SDKs that keep card and SSN data out of partner code',
    kind: 'Built · 2026',
    summary:
      'Apps that build their own screens still need to collect card numbers and social security numbers. These SDKs put those fields in vault-hosted inputs, so raw values never touch the partner’s code and partners stay out of PCI DSS scope.',
    visual: 'sdk',
    sections: [
      {
        title: 'What I did',
        items: [
          'Built most of the card-collection SDK, for vanilla JS, React and React Native: a provider and hook API, secure fields on the vault, and a form-validity registry on useSyncExternalStore',
          'Built the customer-onboarding SDK for JS and React Native, and took the React Native one from first commit to production v1.0 in six days: dual ESM/CJS packaging, CI and releases, typed errors',
          'An accessible masked SSN field in an iframe for the web, a React-free core so Vue, Angular and vanilla JS apps can integrate, and example apps that keep secrets out of the bundle',
          'Ran end-to-end security testing on iOS and Android and corrected the partner security guidance where it didn’t match the SDK',
        ],
      },
      {
        title: 'Decisions',
        items: [
          'A typed interface for phone verification, so three engineers built its core, hooks and UI at the same time',
          'Docs written for partners and their coding agents: TSDoc on every export and agent skills on the partner docs site',
        ],
      },
    ],
  },
  {
    id: 'ai',
    short: 'AI agent tooling',
    title: 'AI agent tooling for the whole frontend team',
    kind: 'Built and contributed · 2026',
    summary:
      'I was among the first on the team to build coding agents into everyday work. What started as commands in three repos grew into the team’s shared Claude Code plugins, with commands, agents, hooks and an MCP server, plus a context layer that tells every session how the platform’s 27 repos fit together. A conversation becomes a ticket, a tested change and a merge request, and a human still merges.',
    visual: 'agent',
    sections: [
      {
        title: 'Built',
        items: [
          'An MCP integration and agent that syncs missing translation keys to Tolgee, a post-push hook that flags them, and least-privilege credentials when it went org-wide',
          'A CLI that bumps every pinned package across the platform’s repos on matching release channels; the team’s standard update command',
          'The first Claude Code commands and agents for review, tests, component scaffolding and MR submission',
          'An incremental CI code reviewer that reviews only what changed since its last pass',
        ],
      },
      {
        title: 'Contributed to',
        items: [
          'The plugin marketplace: 2 plugins, 17 commands and 11 agents covering tickets, shipping a change end to end, release promotion, code review, scaffolding, and docs and translations that stay in step with code',
          'Shared rules synced into every repo, so each agent writes components, tests and types the way the team does',
          'The context layer: one hand-curated file, a map generated from git, and a session-start hook that loads a short card for each neighbouring repo, cutting loaded context 6–16×',
        ],
      },
      {
        title: 'How it’s designed',
        items: [
          'A command asks every question up front, then hands the work to an agent with a pinned model and only the tools it needs. If the agent hits an open question, it comes back to you and resumes',
          'Nothing merges or deploys on its own: every path ends in a merge request. Release promotion runs in a throwaway git worktree and stops if the code has drifted',
          'The right model for each job: a stronger one for breaking work into tickets, a cheaper one for mechanical git, Jira and Slack steps',
          'Waiting for a merge is a background shell loop that costs nothing, instead of an agent polling at about a dollar an hour',
        ],
      },
    ],
  },
]

export const about = {
  lines: [
    'I’m Petra, a frontend engineer in Zagreb. For five years I’ve built web and mobile products in React, React Native and TypeScript, mostly in consulting teams next to designers, strategists and clients.',
    'At Coinme I founded and led a cross-platform design system, one React Native codebase on iOS, Android and web, and owned regulated product flows from the first commit to production. AI is part of how I build: agents, MCP integrations and AI code review that became shared tooling for the frontend team.',
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
      'A white-label crypto widget that fintech and wallet apps embed in their iOS, Android and web apps: one deployment, rebranded per partner at runtime. Joined through Endava; hired directly by Polygon in Feb 2026. Frontend team of 7–10; about 270 merged MRs across 11 repositories.',
    groups: [
      {
        title: 'Design system & UI craft',
        case: 'design-system',
        items: [
          'Founded the cross-platform design system and led it for two years: one React Native codebase behind every screen on iOS, Android and web, across 137 releases',
          'Built 13+ of its 34 components, including an interactive SVG price chart with gesture-driven animation (Reanimated, Gesture Handler)',
          'Designed the theming and white-label model: design tokens, dark mode and a “host theme wins” merge, so partners rebrand through configuration, not code',
        ],
      },
      {
        title: 'Product flows & the orchestrator',
        case: 'flows',
        items: [
          'Owned identity verification (KYC), enhanced due diligence (AML) and cash-out at ATMs end to end, each an explicit state machine that fails closed',
          'Main developer of the multi-chain wallet; large parts of the cash-buy journey that runs in Trust Wallet’s Cash Deposits',
          'Wired them into the orchestrator that mounts each partner’s mix of flows; cleared a major wallet partner’s launch blockers',
        ],
      },
      {
        title: 'Partner SDKs',
        case: 'sdks',
        items: [
          'Built most of the card-collection SDK for vanilla JS, React and React Native: card numbers and SSNs stay in vault-hosted fields, keeping partners out of PCI DSS scope',
          'Built the customer-onboarding SDK for JS and React Native, taking the React Native one from first commit to production v1.0 in six days',
          'Ran end-to-end security testing on iOS and Android, corrected the partner security guidance, and wrote the SDK docs and agent skills',
        ],
      },
      {
        title: 'AI-native engineering',
        case: 'ai',
        items: [
          'Among the first on the team to build Claude Code agents into daily work; the commands I started grew into the org’s shared plugin marketplace',
          'Built an MCP integration that syncs missing translation keys to Tolgee, plus a post-push hook that flags them',
          'Made the CI AI code reviewer incremental; contributed to a context layer that cut agents’ loaded context 6–16× across 27 repos',
        ],
      },
      {
        title: 'Tooling & delivery',
        items: [
          'A Node.js CLI that bumps every pinned flow package on matching release channels; it became the team’s standard update command',
          'Brought API mocking (MSW) into Storybook and into the template every new flow starts from',
          'First project: led the consumer web wallet’s move from i18next to Tolgee across about 43 components',
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
  ['Product engineering', 'React, React Native, TypeScript, Next.js, Expo, react-native-web, Redux Toolkit, TanStack Query, Node.js'],
  ['UI systems & motion', 'Design tokens, theming, accessibility (WCAG), Storybook, Reanimated, Gesture Handler, GSAP, three.js, Tailwind'],
  ['AI & delivery', 'Claude Code (agents, skills, hooks, plugins), MCP, AI review in CI, Vitest, Jest, MSW, Vite, Turborepo, GitLab CI'],
]
