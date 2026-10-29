// Every word on the site. Facts only: names, roles, years, what was built and how.

export const person = {
  name: 'Petra Presečki',
  role: 'Frontend engineer',
  focus: 'Design systems, product UI, AI agent tooling',
  stack: 'React · React Native · TS',
  place: 'Zagreb, CET · remote',
  email: 'petra.presecki123@gmail.com',
  linkedin: 'https://www.linkedin.com/in/petrapresecki',
  github: 'https://github.com/petrapresecki',
  cv: '/Petra-Presecki-CV.pdf',
}

// Live builds; VITE_IVA_URL / VITE_BYKRESO_URL override them (e.g. to point at local servers)
const IVA_URL = import.meta.env.VITE_IVA_URL ?? 'https://ivapresecki.com/'
const BYKRESO_URL = import.meta.env.VITE_BYKRESO_URL ?? 'https://bykreso.com/'

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
  /** the big recording, four cells beside it, then two wide clips under them (either can be empty) */
  hero: Media
  cells: Media[]
  wide: Media[]
  summary: string
  facts: [string, string][]
  details: string[]
}

// /work/* is cached for a week, so bump this whenever clips are re-recorded or browsers keep the old ones
const CLIPS = '2026-10-29.2'
/** A recording from scripts/record.mjs: public/work/clips/<name>.webm with its first frame as the poster */
const clip = (name: string): Media => ({ src: `/work/clips/${name}.webm?v=${CLIPS}`, poster: `/work/clips/${name}.jpg?v=${CLIPS}`, name: `${name.replace('-', '_')}.webm` })

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
    id: 'frame-score',
    title: 'Frame Score',
    kind: 'Instrument · Web Audio',
    year: '2026',
    url: 'https://frame-score.pages.dev/',
    hero: clip('fs-grade'),
    cells: [],
    wide: [],
    summary:
      'Grade a film frame and hear it. The shot is read left to right in four bands, the colour of each becomes a chord and the brightest points become a melody, played as an ambient loop. Change the grade and the music changes with it, because the sound comes straight from the pixels.',
    facts: [
      ['Type', 'Personal project'],
      ['Role', 'Concept, design, development'],
      ['Stack', 'React 19, Tone.js, Canvas, Tailwind, Vite'],
    ],
    details: [
      'Four grade controls written as pixel maths, and the same code draws the picture and feeds the analysis, so what you see is what you hear',
      'The core is plain JavaScript that knows nothing about the interface; React only sits on top',
      'Marks on the frame come from the notes the engine actually played, at the height the pitch was read from',
      'Search a film and spin through its stills, or drop in your own frame',
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
      'Where every site I build starts, instead of a template. It collects what I love on other websites as working motion blocks, themes and grids, next to an inspiration library and research on what makes a site look made rather than generated. Nothing goes into a new site unchanged: each piece is reworked to fit it, and the best ones started in my own work.',
    facts: [
      ['Type', 'Personal library'],
      ['Contents', 'Blocks, themes, grids, inspiration, research'],
      ['Stack', 'React, TypeScript, GSAP, three.js, WebGL2, a Node CLI'],
    ],
    details: [
      'Blocks and themes are working versions of things I liked on other sites; a CLI copies them into a new site as source, to be reshaped there',
      'A manifesto from studying award-winning sites: one loud thing per screen, real material, screens composed rather than stacked, no AI defaults',
      'A Claude Code skill turns the library into concepts for a new site and checks each one against the manifesto',
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
  /** the case's short film, on its page and in the hover peek */
  visual?: 'theme' | 'flows' | 'sdk' | 'agent'
  sections: { title: string; items: string[] }[]
}

/** Selected work at Coinme, told without internal names, code or screens */
export const cases: Case[] = [
  {
    id: 'design-system',
    short: 'Design system',
    title: 'A design system partners rebrand by config',
    kind: 'Founded and led · 2025–2026',
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
    kind: 'Built flows, wired them into the orchestrator · 2025–2026',
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
          'Wrote the wallet from scratch, with balances across several blockchains, sending by QR code and a live price chart',
          'Also did the cash-buy screens, tax documents and the cash-location finder, and cleared the launch blockers for a major wallet partner',
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
          'Built the customer-onboarding SDK for JS and React Native. The React Native one went from first commit to production v1.0 in six days, packaging and CI included',
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
    title: 'How our frontend team works with coding agents',
    kind: 'Built and contributed · 2026',
    summary:
      'Over six months our frontend team moved most of its routine into Claude Code, built around one shared plugin and a context repo we call the spine. I was among the first to use agents every day, and the commands I started grew into that plugin.',
    visual: 'agent',
    sections: [
      {
        title: 'How it fits together',
        items: [
          'One shared plugin marketplace, enabled in 12 frontend repos: skills for tickets, shipping, reviews, scaffolding and releases, each handing its work to an agent with a pinned model',
          'The spine tells every session how the platform’s 27 repos fit together, from one hand-curated manifest and a map generated from git. It cut the context each session loads 6–16×',
          'Nothing merges or deploys on its own. Every path ends in a merge request a person reviews',
        ],
      },
      {
        title: 'My part',
        items: [
          'The team’s first Claude Code commands and agents, for review, tests, scaffolding and merge requests',
          'The Tolgee MCP integration and agent and the post-push hook, moved to least-privilege credentials when the whole org started using it',
          'The incremental CI reviewer, which finds its last reviewed commit from a marker in the merge request thread and reviews only what changed since',
          'Contributions to the shared plugin and the spine, plus a Figma-to-component prototype',
        ],
      },
    ],
  },
]

export const about = {
  lines: [
    'I’ve been building for the web for about five years, mostly React and React Native. Frontend is where I’m happiest, and the closer it gets to design, the better.',
    'I’ve been deep in Claude Code for a while. Most of my day runs through it, along with an ever-growing collection of agents and tools I’ve built along the way.',
    'On the side I build sites for creative people, where I spend way too long on how one thing moves. Every piece I like ends up in my own little library, so no site starts from zero.',
    'Away from the screen it’s music and movies, usually some old Criterion film I’ll try to get you to watch too.',
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
    dates: '2024–2026',
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
          'Owned identity verification (KYC), enhanced due diligence (AML) and cash-out at ATMs, each an explicit state machine that fails closed',
          'Main developer of the multi-chain wallet; large parts of the cash-buy journey that runs in Trust Wallet’s Cash Deposits',
          'Wired them into the orchestrator that mounts each partner’s mix of flows; cleared a major wallet partner’s launch blockers',
        ],
      },
      {
        title: 'Partner SDKs',
        case: 'sdks',
        items: [
          'Built most of the card-collection SDK for vanilla JS, React and React Native: card numbers and SSNs stay in vault-hosted fields, keeping partners out of PCI DSS scope',
          'Built the customer-onboarding SDK for JS and React Native, shipping the React Native one as v1.0 six days after starting it',
          'Ran end-to-end security testing on iOS and Android, corrected the partner security guidance, and wrote the SDK docs and agent skills',
        ],
      },
      {
        title: 'AI agent tooling',
        case: 'ai',
        items: [
          'Used Claude Code agents daily before most of the team did; my early commands became the base of the team’s shared plugin marketplace',
          'Built an MCP integration that syncs missing translation keys to Tolgee, plus a post-push hook that flags them',
          'Made the CI AI code reviewer incremental; contributed to a context layer that cut agents’ loaded context 6–16× across 27 repos',
        ],
      },
      {
        title: 'Tooling & delivery',
        items: [
          'A Node.js CLI that bumps every pinned flow package on matching release channels. The team switched to it for every update',
          'Brought API mocking (MSW) into Storybook and into the template every new flow starts from',
        ],
      },
    ],
  },
  {
    company: 'Endava',
    note: 'ex FIVE',
    links: [{ label: 'Endava', url: 'https://www.endava.com/' }],
    role: 'React / React Native Developer',
    dates: '2021–2026',
    context:
      'Agency work on React and React Native apps for clients in fintech, hospitality and entertainment, working straight with their designers and backend teams. From Oct 2024 seconded to Coinme.',
    groups: [
      {
        title: 'Practice',
        items: [
          'Set up architecture and coding standards for modular monorepos (Redux Toolkit, RTK Query, TanStack Query, Jotai)',
          'Lazy loading and code splitting to keep bundles small',
          'Built accessible interfaces to WCAG and kept unit-test coverage above 80%',
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
