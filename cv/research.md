# What a good developer CV does

Notes from a research round in October 2026, for `cv/cv.html` and every tailored copy of it. Sources are listed at the bottom. Most CV advice online comes from résumé-tool vendors, so the numbers below are treated as rough signals, not facts. Where the sources disagree, the note says so.

## How a CV gets read now

A CV is read three times, by three different readers, usually in this order.

1. **A parser.** The applicant tracking system (Greenhouse, Lever, Workday, BambooHR, Ashby…) turns the PDF into plain text and files it into fields: name, contact, titles, employers, dates, skills, education. If a field lands in the wrong place, everything after it is judged on broken data. Columns, tables, text boxes, icons and headers or footers are the usual reasons it goes wrong. A scanned PDF has no text at all.
2. **A ranking model.** More and more systems put an LLM on top of the parser. It compares the CV with the job description by meaning rather than by exact keyword, scores it on a few weighted criteria (relevant experience, depth in the required skills, seniority fit) and ranks you against the other applicants, often with a written reason. You're competing for a top slice of the pool, not passing a fixed bar. Knockout questions (work authorisation, location, minimum years) can remove you before any of this.
3. **A person, for about 5 to 15 seconds at first.** Recruiters and hiring managers skim the top third: name, current title, recognisable employers, years of experience and the first two or three bullets of the latest role. If that works, they read the rest.

Two findings worth knowing about the ranking models:

- **They're sensitive to presentation.** In a 2026 study, models that picked stronger candidates well still flipped about 30–40% of their pairwise decisions when the same qualifications were reworded or restructured. Clear, conventional structure is part of the content, not decoration.
- **They infer skills from context.** "Built the gesture-driven price chart with Reanimated" counts as Reanimated experience even if the skills list misses it. Concrete bullets do more than keyword lists.

## What the parser needs

- **One column for the body.** A name-left, contact-right header is fine; side-by-side columns of experience and skills are not.
- **Standard section names:** Profile or Summary, Experience, Skills, Education, Languages, Projects. Creative headings get misfiled.
- **Real text, standard fonts, no images of text.** No skill bars, ratings, icons or logos.
- **Contact details in the body, not in a header or footer.** Write the URLs out (`petra-presecki.pages.dev`, `github.com/petrapresecki`). A word with a hidden link ("Portfolio") turns into just the word when the PDF becomes text.
- **One date format everywhere.** "Oct 2024 – Oct 2026" or "2024 – present"; month and year for jobs.
- **Job title, company, dates on predictable lines** for every role.
- **Check it the way a parser does:** extract the PDF's text (pypdf, pdfminer or `pdftotext`) and read it top to bottom. Every number and acronym should come out whole and in order. The October 2026 CV passes in pypdf and pdfminer. Apple's PDFKit splits a few words ("M P", "A ML"), and pypdf spaces out the "č" in Presečki, but both happen with the old font too, so they're extractor quirks.

## What the ranking model and the person look for

- **Outcomes, not duties.** Action, scope, result: "Took the React Native onboarding SDK from first commit to production v1.0 in six days" beats "Responsible for the onboarding SDK". A bullet like "worked with the designers on how the system looks" is a duty; say what changed because of it.
- **Numbers you can defend in an interview.** Scale (137 releases, 27 repos, 270 merged MRs, team of 7–10), speed (six days), reach (adopted across the frontend org), effect (context cut 6–16×). Never invent a number to fill a gap.
- **The posting's words for things you've really done.** If the posting says "design tokens", "Core Web Vitals", "App Router", "Figma", "WCAG 2.2" or "Motion" and you have that experience, use the same term. Copying the posting's sentences, keyword stuffing and hidden text are all penalised; some tools now reject a CV with hidden instructions outright. Hidden text shows up in about 1% of CVs, and recruiters treat it as grounds for rejection.
- **Your strongest material first.** The newest role's first bullets carry the most weight. Reorder bullets per application rather than rewriting the whole CV.
- **Clear credits.** Especially for studios: say exactly which part was yours ("concept, design and development", "built the flows, a colleague did the backend").
- **Links to things that are live.** Studios and small product teams look at the work before the CV. Every creative or product role in the current search asks for live sites or code.

## What reads as AI-written (and gets marked down)

Hiring managers in 2026 surveys name unnatural phrasing (about half), repetitive or generic language and buzzword-heavy writing as the giveaways. Words like "spearheaded", "leveraged", "orchestrated", "honed" and "streamlined" have become common in generated CVs, and so have em dashes. Nobody has shown that a single word gets a CV rejected, but together they make it read like everyone else's. What works instead:

- Plain verbs (built, wrote, owned, founded, moved, cut) and bullets of different shapes and lengths.
- One honest line about a gap rather than padding it.
- Real things over adjectives: no "passionate", "detail-oriented", "proven track record" or "team player".
- Read it out loud; rewrite anything you wouldn't say.

## Length, photo and personal details (Europe)

- **Length:** US advice says one page until about eight years of experience. In most of Europe two pages are normal once you're past five years, as long as page two has real content. A one-page version is still worth keeping for studios that skim.
- **Photo and date of birth:** optional or unwelcome almost everywhere except Germany and parts of central Europe. No employer rejects a CV for leaving them out.
- **Location and right to work:** city, country, time zone, and "EU citizen, no sponsorship needed" when that's true. Several EU-remote postings filter on it.

## Tailoring without rewriting

Keep one strong default CV built on two or three themes. For each application, spend about 20 minutes:

1. Change the title line to the posting's role name, if it honestly fits.
2. Move the two bullets closest to the posting's main need to the top of the latest role.
3. Reorder the skills so the posting's stack comes first; add what you have but left out.
4. Print it with `pnpm cv applications/<company>/cv.html` and run the text-extraction check.

## What the current postings ask for (October 2026)

| Studio | Must have | Also mentioned |
|---|---|---|
| basement.studio | React, Next.js (App Router, RSC, SSR/ISR/SSG), TypeScript, Tailwind, GSAP or Motion, a headless CMS (Sanity, Payload) | three.js/WebGL, Figma, Rive; high agency, attention to detail |
| Demandflow | HTML, CSS, TS, React, Astro and Next.js in production, Figma, GSAP/Motion, accessibility (focus, reduced motion), loading and layout stability, technical SEO/AEO, tests | Webflow, WebGL/three.js; asks how you use AI and how you verify AI-written code |
| PixelA | 3+ years React and TypeScript, an eye for spacing and type, animation libraries, responsible AI use | Tailwind; turning design tokens into a code library |
| Odduel | CSS without a framework, TS, React, browser loading and rendering, keyboard and screen-reader testing, WCAG 2.2, Git, component docs | WordPress, Next.js; live projects that work on ordinary phones |
| VIBOA | 4+ years React, Next.js, TS; small APIs and queries; keyboard, focus, skeletons; motion | Postgres, Vercel, GSAP/WebGL; a side project people used; clear credits |
| Eli5 | HTML, CSS, JS, a frontend framework, Git, multidisciplinary product teams | TypeScript, CI/CD, backend frameworks; CV required, letter and portfolio recommended |
| Afternow | React, Next.js, Figma handoff (from the tracker; the page needs JavaScript) | Storefronts and supplier hubs |

The words that come up again and again: **Next.js, TypeScript, React, Figma, GSAP/Motion, accessibility (WCAG), performance on real devices, design tokens and component libraries, live work, and how you use AI.**

## Sources

- [Jobscan: How AI resume screening works in 2026](https://www.jobscan.co/blog/blog-ai-resume-screening/)
- [techinterview.org: Software engineer resume guide 2026](https://www.techinterview.org/post/3233474602/software-engineer-resume-guide/)
- [Competence-preserving resume perturbations expose presentation sensitivity in LLM screening (arXiv, 2026)](https://arxiv.org/abs/2609.16517)
- [Measuring validity in LLM-based resume screening (arXiv, 2026)](https://arxiv.org/pdf/2602.18550)
- [ATS-friendly resume format: columns, tables and parsing](https://www.pitchnhire.com/answers/ats-friendly-resume-format)
- [Simplify: Can recruiters tell if AI wrote your resume?](https://simplify.jobs/blog/can-recruiters-tell-if-ai-wrote-your-resume)
- [Enhancv: signs of an AI-generated resume](https://enhancv.com/blog/signs-of-ai-generated-resume/)
- [Built In: hidden AI prompts in resumes](https://builtin.com/articles/hidden-ai-prompts-in-resume)
- [Study measures hidden prompt injections in AI resume screening](https://letsdatascience.com/news/applicants-hide-prompts-in-resumes-becd8ae8)
- [European CV format guide](https://iwantanewcv.lovable.app/guides/european-cv-format)
- [Creative Boom: what creative recruiters look for in 2026](https://www.creativeboom.com/tips/in-2026-heres-what-creative-recruiters-are-looking-for-in-juniors/)
- [What studios look for in junior designers (The Brand Identity)](https://the-brandidentity.com/insight/what-do-studios-look-for-in-junior-designers-we-asked-justified-studio-only-and-the-district)
- Job postings: [basement.studio](https://basement.studio/careers/frontend-developer), [Demandflow](https://www.demandflow.co/careers/design-engineer), [PixelA](https://pixela.agency/careers/frontend-developer), [Odduel](https://odduel.com/careers/front-end-developer/), [VIBOA](https://viboa.co/careers/product-engineer), [Eli5](https://www.thebuilderstudios.com/job-openings/frontend-engineer), [Afternow](https://afternow.bamboohr.com/careers/64)
