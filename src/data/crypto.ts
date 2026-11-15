// The crypto edition's words (`pnpm dev:crypto`, `pnpm build:crypto`): vite.config.ts points @/data/site here.
// The crypto story comes from the 2026 crypto portfolio (petrapresecki.pages.dev) and the crypto CV; side work,
// skills and about are the default site's, re-exported as they are.
import * as base from './site'
import type { Case, IntroPart, Project } from './site'

export * from './site'

export const person = {
  ...base.person,
  role: 'Onchain product engineer',
  focus: 'Wallets, on/off-ramps, KYC/AML, partner SDKs',
}

export const intro: IntroPart[] = [
  'Hi, I’m Petra, a product engineer from Zagreb shipping across web, mobile and onchain. ',
  'For the last two years I was a Web Engineer at ',
  { link: 'Coinme', url: 'https://coinme.com/' },
  ', now part of ',
  { link: 'Polygon', url: 'https://polygon.technology/' },
  ', building the crypto on/off-ramp that wallet and fintech apps embed: from KYC to the wallet to cashing out at an ATM.',
]

const solana: Project = {
  id: 'solana-checkout',
  title: 'Solana checkout',
  kind: 'USDC payment links · devnet',
  year: '2026',
  url: 'https://petrapresecki.github.io/solana-checkout/',
  hero: { src: '/work/solana-checkout.jpg', poster: '/work/solana-checkout.jpg', name: 'solana_checkout.jpg', still: true },
  cells: [],
  wide: [],
  summary:
    'I’d worked in payments for years and knew nothing about Solana, so I built a checkout to learn. You make a payment link, someone pays it in USDC, and the page follows the payment on the chain until it’s final. No backend.',
  facts: [
    ['Type', 'Side project'],
    ['Role', 'Concept, design, development'],
    ['Stack', '@solana/web3.js, wallet adapter, SPL Token, React'],
  ],
  details: [
    'There are no chargebacks, so a refund is just a new payment back',
    'There’s no webhook either. Each payment carries a random reference key, and the page looks for it on chain, a bit like a payment intent ID',
    'The transfer is built and signed in the payer’s own wallet, then followed until it’s finalized',
    'People send the wrong amount or pay after the link expires, so the page checks what actually arrived and says so',
  ],
}

// Side work for crypto people: the onchain project first, Frame Score left to the default site
export const projects: Project[] = [solana, ...base.projects.filter(p => p.id !== 'frame-score')]

export const edition: typeof base.edition = {
  cv: { pdf: '/crypto/Petra-Presecki-CV.pdf', pages: ['/crypto/cv/page-1.jpg', '/crypto/cv/page-2.jpg'] },
  workNote: 'Onchain, sites for creative people, and tools',
}

/** "Send: A QR scanner… . Address checks…" → one point per sentence */
const sentences = (s: string) => s.split(/(?<=\.)\s+(?=[A-Z“])/).map(x => x.replace(/\.$/, ''))
const built = (pairs: [string, string][], tricky: string) => [
  ...pairs.map(([title, text]) => ({ title, items: sentences(text) })),
  { title: 'The tricky part', items: sentences(tricky) },
]

/** The Coinme onchain work, told as on petrapresecki.pages.dev's [ONCHAIN] pages. Facts from the Coinme work log, Oct 2026 */
export const cases: Case[] = [
  {
    id: 'wallet',
    short: 'Multi-chain wallet',
    own: 'Started it · top committer',
    title: 'A multi-chain wallet inside a partner’s app',
    kind: 'Started it, top committer · May – Sep 2026',
    problem:
      'Coinme was a one-off purchase. Partners wanted somewhere their customers keep crypto: hold it, send it and watch it across several chains.',
    result: 'Send by QR with addresses checked per chain, balances per chain, and a price chart that doesn’t turn stablecoin noise into a sawtooth.',
    summary:
      'The wallet is where Coinme stops being a one-off purchase and becomes somewhere customers keep their crypto: hold it, send it and watch it across several chains, inside a partner’s app.',
    stats: [
      ['#1', 'committer on the flow'],
      ['+2,954', 'lines in the dashboard rebuild'],
      ['30', 'tickets delivered'],
    ],
    sections: built(
      [
        ['Send', 'A QR scanner that reads BIP21 payment links and handles a denied or revoked camera inline. Address checks that know which chain an asset lives on (USDC is checked as an Ethereum address). A memo and destination-tag field that only accepts what that asset’s format allows.'],
        ['Dashboard', 'Tabs for My wallet with per-chain balances, Explore and Recent activity. Each wallet’s history has its own state, so opening one never overwrites the shared activity feed.'],
        ['Price history', 'A chart drawn separately for web and native, with scrubbing and animated range changes. Each range is cached for two minutes and failed loads retry at 5, 10 and 20 seconds. The axis is scaled so a stablecoin’s tiny moves don’t look like a sawtooth.'],
        ['Find cash', 'A map of stores and ATMs that opens as a drawer over the dashboard, so the dashboard keeps its place. It only offers the cash networks the partner has switched on.'],
      ],
      'Regional rules. Some cash networks aren’t allowed in some states, so they stay visible but lead to a notice instead of a transaction. Reusing the wallet’s existing logic here would have quietly let restricted networks through, so I wrote down why it couldn’t be reused.',
    ),
  },
  {
    id: 'kyc',
    short: 'KYC & AML',
    own: 'Owned the failure paths · built EDD',
    title: 'KYC and AML flows that fail closed',
    kind: 'Owned the failure paths, built due diligence from scratch · Oct 2025 – Mar 2026',
    problem:
      'Nobody can buy crypto before Coinme knows who they are, and higher-risk customers need extra checks after that. The happy path takes a minute.',
    result: 'Every way identity checks can go wrong, and a due-diligence questionnaire end to end, as state machines where unclear means no.',
    summary:
      'Nobody can buy crypto before Coinme knows who they are, and some customers need extra checks after that. The happy path takes a minute. The work is in everything that can go wrong.',
    visual: 'flows',
    stats: [
      ['75%', 'of the due-diligence flow is my code'],
      ['+2,483', 'lines in the KYC failure paths'],
      ['11', 'error codes documented'],
    ],
    sections: built(
      [
        ['Identity checks (KYC)', 'Every route for an SSN retry, a phone number that doesn’t match, “no match” and a hard decline, as one state machine with attempt limits set in remote config. The phone code screen and its error messages, with links to support.'],
        ['For every partner', 'The partner’s ID goes through every identity call and the secure SSN collection, which compliance reporting needs once many partners share one platform. Customers stuck in verification get a limited settings screen with only safe actions.'],
        ['Due diligence (EDD)', 'Anti-money-laundering rules mean higher-risk customers answer a questionnaire before they can transact again. I built it end to end: questions from the backend, follow-ups that appear by answer, retry counts and a hard stop at the limit.'],
        ['Gating', 'In the container app, routing that sends a flagged customer into the questionnaire before any transaction screen can open.'],
      ],
      'Failing closed. When the backend’s answer is unclear, the customer goes nowhere near a transaction. I also found a race where the first API call could go out before remote config had loaded its limits, and fixed it.',
    ),
  },
  {
    id: 'cash-out',
    short: 'ATM cash-out',
    own: 'Majority author',
    title: 'Selling crypto for cash at an ATM',
    kind: 'Majority author · Mar – Apr 2026',
    problem:
      'The off-ramp: a customer sells crypto in their app and gets a code that pays out cash at a partner ATM. Quotes expire, rules differ by state, and money is moving.',
    result: 'Live quotes that never go blank, status over server-sent events, settlement across chains, and 22 backend errors each mapped to the right screen.',
    summary:
      'The off-ramp: a customer sells crypto in their app and gets a code that pays out cash at a partner ATM. It touches finding an ATM, getting a price, confirming, following the sale live and picking up the money.',
    stats: [
      ['57%', 'of the flow is my code'],
      ['22', 'error codes mapped to screens'],
      ['3', 'other flows extended'],
    ],
    sections: built(
      [
        ['Quote', 'A price that refreshes on its own and keeps showing the last good one if a refresh fails, so the screen never goes blank mid-decision.'],
        ['Confirm and follow', 'A one-time code with a configurable length, then pending and confirmed screens driven by server-sent events, and pickup instructions for the ATM.'],
        ['Many chains', 'Moved the flow to the new transaction API with the partner’s own transaction and session IDs, and made settlement work across chains, with prices and history per chain.'],
        ['Across flows', 'Brought cash-out into three other flows (amounts capped at the lowest limit that applies, ATM cards in the location finder, new statuses in history) and built the location → quote → code journey in the container app, set entirely by partner config.'],
      ],
      'Twenty-two ways to say no. Quote expired, a jurisdiction where selling isn’t allowed, a fraud decline, a limit reached, a code that timed out. I mapped every backend error to the screen the customer should see.',
    ),
  },
  {
    id: 'sdks',
    short: 'Partner SDKs',
    own: 'Card SDK · RN onboarding to v1.0',
    title: 'Partner SDKs that keep card and SSN data out of partner code',
    kind: 'Card SDK, and the React Native onboarding SDK to v1.0 · Jun – Oct 2026',
    problem:
      'Partners building their own screens still collect card numbers and SSNs, and handling that data themselves means heavy PCI DSS audits.',
    result: 'Raw numbers never reach partner code, and the React Native onboarding SDK went from first commit to v1.0 in six days.',
    summary:
      'Some partners want their own screens instead of Coinme’s. They still have to collect card numbers and SSNs, and the safest way is for that data never to touch their code at all.',
    visual: 'sdk',
    stats: [
      ['6 days', 'first commit to v1.0'],
      ['~185', 'tests I wrote'],
      ['28', 'shared exports, web and native'],
    ],
    sections: built(
      [
        ['Card fields', 'Card fields hosted by a tokenization vault (VGS), so numbers go straight to the vault and partners stay out of PCI scope. A provider and hook API, and a registry that keeps the submit button off until every field is valid.'],
        ['Onboarding in six days', 'Took the React Native onboarding SDK from its first real commit to a production v1.0 in six days: packaging, CI and releases, typed errors, and example apps that swap sandbox credentials for a short-lived token so no secret ships in the app.'],
        ['One API, any framework', 'The web and React Native SDKs share the same public API. A React-free core lets Vue, Angular, Svelte or plain JavaScript apps use it too.'],
        ['Security testing', 'Tested on iOS and Android, in Expo and bare apps. I found the React Native SSN field held the number as plain text inside the app until it was tokenized, and corrected the security guidance partners read.'],
      ],
      'Building before the backend existed. For phone verification I defined a typed interface first, so three of us could build the core, the hook and the screens at the same time.',
    ),
  },
]

export const ask = 'Building a wallet, a ramp, or anything where real money moves through a frontend? Say hi.'

const [coinme, endava] = base.experience

/** Coinme told for crypto teams, after the crypto CV */
export const experience: typeof base.experience = [
  {
    ...coinme,
    context:
      'Coinme-as-a-Service: a licensed crypto on/off-ramp that fintech and wallet apps embed in their iOS, Android and web apps. Live in Trust Wallet’s Cash Deposits. Acquired by Polygon; joined through Endava, hired directly by Polygon in Feb 2026. Team of 7–10; about 270 merged MRs.',
    groups: [
      {
        title: 'Wallet & on/off-ramp flows',
        case: 'wallet',
        items: [
          'Code I wrote runs at every step of a partner’s customer journey, from sign-up and KYC to cash buy, wallet, ATM cash-out and tax forms',
          'Main developer of the custodial multi-chain wallet: QR scan-to-send with BIP21 parsing, chain-aware address validation (USDC checked as an Ethereum address), memo and destination-tag input, per-chain balances. Rebuilt the address validator for 100+ chains as a typed package',
          'Built the price-history chart for web and native (SVG, Reanimated, Gesture Handler): scrubbing, animated range changes, and axis scaling so stablecoin noise doesn’t read as a sawtooth',
        ],
      },
      {
        title: 'KYC & AML compliance',
        case: 'kyc',
        items: [
          'Owned identity verification (KYC) and AML enhanced due diligence, each a state machine that fails closed',
          'Built 4 of the orchestrator’s 18 flow integrations, including the routing that stops flagged users before any transaction',
          'Made the cash-network picker follow regional rules: payment rails restricted in a jurisdiction stay visible but lead to a notice instead of a transaction. Cleared a major wallet partner’s launch blockers',
        ],
      },
      {
        title: 'ATM cash-out',
        case: 'cash-out',
        items: [
          'Wrote most of the crypto-to-cash ATM flow: live quotes that keep the last good price when a refresh fails, OTP confirmation and transaction status over server-sent events',
          'Multi-chain settlement on the v2 transaction API, with the partner’s own transaction and session IDs',
        ],
      },
      {
        title: 'Partner SDKs',
        case: 'sdks',
        items: [
          'Built most of the card-collection SDK for JS, React and React Native, keeping partners out of PCI DSS scope, and ran its security testing on iOS and Android',
          'Took the React Native customer-onboarding SDK (SSN collected through a tokenizing vault field) from first commit to production v1.0 in six days, splitting the work so three engineers built it in parallel',
        ],
      },
      {
        title: 'Design system & AI tooling',
        items: [
          'Founded and led the cross-platform design system for two years: one React Native codebase behind every screen on iOS, Android and web, across 137 releases. Its theming model became the white-label contract',
          'My Claude Code commands became the base of the team’s plugin marketplace, now in 12 repos. Co-built a context layer for coding agents across 27 repos that cuts what each session loads 6–16×',
        ],
      },
    ],
  },
  endava,
]
