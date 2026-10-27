# REDESIGN-SPEC — dashinja.github.io modern app-hub

LLM-executable implementation plan. Three candidate design systems (A Terminal Noir,
B Editorial Index, C Tonal Bento) implement the SAME information architecture, the
SAME file contract, and the SAME hard test rules from `tests/static-site.test.ts`.
Only the design system (tokens, components, motion) differs.

Executors: this document assumes a capable LLM working branch-by-branch in a
worktree, verifying with `npm test` after every function, and never merging.
Nothing in this plan authorizes a merge to `master`.

---

## Part 0 — Context

### 0.1 Repository layout (repo: `dashinja/dashinja.github.io`, remote `origin`)

```
/                        repo root = GitHub Pages site root (deploys from master /)
├── index.html           About/hub page (tested)
├── portfolio.html       Portfolio page (tested)
├── contact.html         Contact page (tested)
├── grocery/
│   └── index.html       Meta-refresh redirect → https://dashinja.github.io/bk_grocery/  (DO NOT TOUCH)
├── assets/
│   ├── css/             index.css, contact.css (Bootstrap-4-era overrides)
│   ├── js/navbar-toggle.js  first-party Bootstrap-collapse toggle script (tested tag)
│   ├── images/          portrait (squaremeup.png) + legacy card images
│   └── documents/       EXACTLY ONE file allowed:
│                         Byron_Miller_Resume_vc_techOnly_vari_ec_2024_03_18.docx  (DO NOT TOUCH)
├── src/app/page.tsx, src/app/portfolio/page.tsx    Next.js sources (tested for anchor rules; DO NOT TOUCH)
├── portfolio-next/      Next.js workspace incl. src/components/Navigation.tsx (tested; DO NOT TOUCH)
├── docs/                gitignored — NEVER put deliverables here
├── tests/static-site.test.ts   the hard contract (vitest)
├── package.json         scripts: test = `vitest run`
├── CNAME                dashinja.com
└── redesign/            tracked directory for this spec (REDESIGN-SPEC.md)
```

### 0.2 Pages deployment

- GitHub Pages serves the **root of `master`** at `https://dashinja.github.io/`.
- Deployed pages are plain static HTML at repo root: `/`, `/portfolio.html`, `/contact.html`.
- `/grocery/` is a redirect stub to `https://dashinja.github.io/bk_grocery/` — it must
  remain a stub, never a copied app bundle.
- There is no build step for the static pages: whatever HTML/CSS/JS is committed to
  `master` root IS the site. `next build` exists for the Next workspace but is not
  part of the static-page contract.

### 0.3 What exists today (Bootstrap 4 era)

All three pages share:
- `<link>` to `https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css`
  and `https://use.fontawesome.com/releases/v5.7.2/css/all.css` (CDN, SRI-hashed).
- Local `./assets/css/index.css` (and `contact.css` on contact.html) overriding it.
- A Bootstrap markup navbar: `.navbar.navbar-expand-lg.navbar-dark.bg-dark`, brand
  `<h1 class="display-3">Byron Miller</h1>`, a `.navbar-toggler` button with
  `data-toggle="collapse" data-target="#navbarNavAltMarkup"`, social icons as
  Font Awesome `<i class="fab fa-...">` stacks, and nav links: About Me, Portfolio,
  Auntie Kim Dates (external), AI Agent (on index only), Resume (docx download).
- Body classes like `bg-dark text-light`; a fixed-bottom `Copyright ©` footer.
- `index.html`: long first-person about prose + headshot `assets/images/squaremeup.png`.
- `portfolio.html`: three flex rows of image cards (200×200 images with overlay
  titles) linking to apps, including a dead Heroku apps (Friend Fest Finder,
  COL-lege, Dota2News, L.I.S.A.) and one external GIF image from
  `https://media0.giphy.com/media/dbyg4S91m5BkY/200.gif` with
  `referrerpolicy="no-referrer"`.
- `contact.html`: an un wired name/email/message form (no backend) — "Let's Connect".
- `assets/js/navbar-toggle.js` (15 lines): binds click on
  `[data-toggle="collapse"][data-target]`, flips `aria-expanded`, toggles `.show`.

### 0.4 The hard test contract (verbatim constraints from `tests/static-site.test.ts`)

Tested HTML files: `htmlFiles = ['index.html', 'portfolio.html', 'contact.html']`.
Tested source files = htmlFiles **plus** `src/app/page.tsx`,
`src/app/portfolio/page.tsx`, `portfolio-next/src/components/Navigation.tsx`
(those three are out of redesign scope — do not edit them; the anchor rule below
simply must not regress).

1. **Public destinations** (every htmlFile):
   - MUST contain: `https://dashinja.github.io/auntieKimDates/`
   - MUST NOT contain: `https://dashinja.github.io/grocery/`
   - MUST NOT contain the string: `BKocery`
2. **Grocery redirect stub** (`grocery/index.html`, untouched by redesign):
   - MUST contain: `http-equiv="refresh" content="0; url=https://dashinja.github.io/bk_grocery/"`
   - MUST contain: `rel="canonical" href="https://dashinja.github.io/bk_grocery/"`
   - MUST NOT contain: `/grocery/assets/`
3. **No theme/help controls** (every htmlFile), MUST NOT contain:
   - `data-theme-toggle`
   - `data-target="#siteHelpModal"`
   - `id="siteHelpModal"`
   - `How this site works`
   - (Consequence: Candidate C ships light+dark via `prefers-color-scheme` only —
     never a toggle button.)
4. **New-tab opener/referrer protection** (every source file): every anchor whose
   markup includes `target="_blank"` MUST also include `rel="noopener noreferrer"`
   within the same tag.
5. **First-party JS only** (every htmlFile):
   - MUST contain the exact tag: `<script src="./assets/js/navbar-toggle.js"></script>`
   - MUST NOT match regex `/<script\s+src="https:\/\//`
   - MUST NOT contain the strings: `jquery`, `popper`, `bootstrap.min.js`
6. **Browser security metas** (every htmlFile):
   - MUST contain: `name="referrer" content="strict-origin-when-cross-origin"`
   - MUST contain: `http-equiv="Content-Security-Policy"`
   - CSP MUST contain: `object-src 'none'` and `base-uri 'self'`
7. **Resume documents** (`assets/documents/`, untouched): exactly
   `['assets/documents/Byron_Miller_Resume_vc_techOnly_vari_ec_2024_03_18.docx']`,
   no `/obsolete/` paths, no filenames containing `:`.
8. **External images in portfolio.html**: every `<img>` whose markup includes
   `src="https://..."` MUST include `referrerpolicy="no-referrer"`.

Additional standing rules (from app-catalog.md / issue-pr-plan.md, enforced by
process even where not testable):
- Never link `https://dashinja.github.io/grocery/` anywhere; use relative
  `./grocery/` or canonical `https://dashinja.github.io/bk_grocery/`.
- Do not modify `grocery/` or `assets/documents/`.
- `contact.html` is fully in scope for the redesign.
- Tetris is not deployed to Pages: optional non-linking "coming soon" tile only.
- Candidates are proposals: branches/PRs/issues only, NEVER merge, never close
  issues with `Closes`.

---

## Part 1 — Information architecture & content model

### 1.1 Pages

| Page | Role | Sections in order |
|------|------|-------------------|
| `index.html` | Hub | skip link → sticky nav → hero → "Featured" bento row (3 tiles) → full app gallery (11 tiles) → About strip → footer |
| `portfolio.html` | Portfolio | skip link → sticky nav → page heading → app gallery as primary content (richer cards: category grouping, status badges) → "about this site" note → footer |
| `contact.html` | Contact | skip link → sticky nav → compact contact card (email CTA, socials, resume) → footer |

Shared assets: one first-party stylesheet set under `assets/css/` and
`assets/js/navbar-toggle.js`. No CDN assets, no webfont downloads — system font
stacks only. No external `<script src>`.

### 1.2 App catalog (11 apps — every URL verified against master nav)

**Featured (3):**

| # | Name | Blurb | Category | URL |
|---|------|-------|----------|-----|
| 1 | Auntie Kim Dates | Community dating & social events brand | Flagship app | `https://dashinja.github.io/auntieKimDates/` |
| 2 | AI Agent | Agentic control deck (agenticMe) | AI | `https://agent.dashinja.com/` |
| 3 | Atelier Grocery | Grocery product sync & storefront theme | Web app | `./grocery/` (RELATIVE — never `https://dashinja.github.io/grocery/`) |

**Gallery (remaining 8):**

| # | Name | Category | URL |
|---|------|----------|-----|
| 4 | RecipeCiprocity | Recipe finder | `https://dashinja.github.io/recipeciprocity/` |
| 5 | Train Scheduler Deluxe | Scheduling tool | `https://dashinja.github.io/trainSchedulerDeluxe/` |
| 6 | Notes Node | Notes app | `https://dashinja.github.io/notes-node/` |
| 7 | Liri Bot | CLI assistant (Node) | `https://dashinja.github.io/liri/` |
| 8 | Las Horcas | Game | `https://dashinja.github.io/lashorcas/` |
| 9 | Bamazonathon | CLI storefront | `https://dashinja.github.io/bamazonathon/` |
| 10 | Giphy Fun | GIF search | `https://dashinja.github.io/giphy/` |
| 11 | Them Burgerz Tho | Ordering demo | `https://dashinja.github.io/themburgerztho/` |

Optional 12th tile: Tetris — **non-linking** "coming soon" tile (a `<div>`, not an
`<a>`; must not introduce any new URL).

### 1.3 Nav destinations (all three pages, same nav)

1. Brand → `./index.html`
2. About → `./index.html`
3. Portfolio → `./portfolio.html`
4. Contact → `./contact.html`
5. Resume (download) → `./assets/documents/Byron_Miller_Resume_vc_techOnly_vari_ec_2024_03_18.docx`
   with `download` attribute (same-origin, no `target="_blank"` needed)
6. Socials: LinkedIn `https://www.linkedin.com/in/millerbyron/` and GitHub
   `https://github.com/dashinja/` — BOTH with `target="_blank"` AND
   `rel="noopener noreferrer"` (inline SVG icons, not Font Awesome)

Active page indicated by an `aria-current="page"` attribute on the nav link.

### 1.4 Footer content (all three pages)

- Social links (same URLs/rel rules as nav).
- Resume download link (same path).
- Copyright line with dynamic year: `Copyright © <span id="copyright-year">2026</span>`
  (navbar-toggle.js sets `textContent` to `new Date().getFullYear()`).
- No theme toggle, no help modal, no external scripts.

### 1.5 Content copy (fixed, all candidates)

- Hero name: `Byron Miller`
- One-liner: `Full-stack developer building practical web apps, CLI tools, and games.`
- Hero CTAs: `View portfolio` → `./portfolio.html`; `Get in touch` → `./contact.html`
- About strip (2–3 sentences): `Byron Miller is a full-stack developer (MERN, GraphQL,
  Prisma) with a theatrical lighting background — translating what a client wants
  into working software. The apps below run everywhere from recipe search to CLI
  storefronts.` Plus tech-stack chips: `MongoDB`, `Express`, `React`, `Node.js`,
  `GraphQL`, `Prisma`, `MySQL`, `Semantic HTML`, `CSS`, `Vanilla JS`.
- Portfolio "about this site" note: `This site is a dependency-free static hub
  served by GitHub Pages. No frameworks ship to the browser — just HTML, CSS, and
  a little JavaScript.`

### 1.6 Shared head contract (all three pages — every candidate)

Exact skeleton (titles may vary per page; everything else stays):

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="referrer" content="strict-origin-when-cross-origin" />
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; object-src 'none'; base-uri 'self'; form-action 'self'" />
    <link rel="stylesheet" href="./assets/css/main.css" />
    <title>…</title>
  </head>
  <body>
    …
    <script src="./assets/js/navbar-toggle.js"></script>
  </body>
</html>
```

Notes:
- The CDN `<link>` tags (Bootstrap, Font Awesome) are REMOVED; their CSP origins
  (stackpath.bootstrapcdn.com, use.fontawesome.com) are dropped from the CSP too.
- `portfolio.html` may keep `https://media0.giphy.com` in `img-src` ONLY if it keeps
  the Giphy GIF, and that `<img>` must keep `referrerpolicy="no-referrer"`.
  Simplest safe choice: use local images only.
- The `navbar-toggle.js` tag must remain EXACTLY
  `<script src="./assets/js/navbar-toggle.js"></script>` at the end of `<body>`.

### 1.7 Shared markup vocabulary (all candidates, BEM-style)

```
a.skip-link
header.site-nav > nav.site-nav__inner
  a.site-nav__brand
  button.site-nav__toggle[data-site-nav-toggle][aria-expanded][aria-controls="site-nav-menu"]
  div#site-nav-menu.site-nav__menu > a.site-nav__link[aria-current="page"]?
section.hero > h1.hero__title, p.hero__tagline, img.hero__portrait, div.hero__ctas
section.featured > h2, div.bento > a.tile.tile--featured*3
section.gallery > h2, div.gallery__grid > a.tile*11 (or ol.gallery__list on candidate B)
section.about > p, ul.about__chips > li.chip
footer.site-footer > div.footer__socials, a.footer__resume, p.footer__copyright
```

---

## Part 2 — Function-by-function implementation (per candidate)

General execution protocol for every function below:

1. Implement the function on the candidate branch in the candidate worktree.
2. Run `npm test` after EVERY function. If red, fix before proceeding.
3. Each function lists an **Acceptance check** — run it literally (command or
   inspection) and only proceed when it passes.

File layout (identical for every candidate):

```
assets/css/main.css        tokens + reset + shared components (nav, footer, chips, tiles)
assets/css/home.css        index.html-specific layout (hero, featured, about strip)
assets/css/portfolio.css   portfolio.html-specific layout
assets/css/contact.css     contact.html-specific layout
assets/js/navbar-toggle.js rewritten first-party (see F9)
demo mock → NOT in the repo: ~/code/homeApps/.atomic/redesign-evidence/candidate-{a|b|c}/demo.html
```

### F1 — Design tokens block (per candidate)

**A — Terminal Noir** (`assets/css/main.css`, `:root`):
```css
:root {
  --bg: #0a0a0a; --surface: #111111; --surface-2: #161616;
  --fg: #ededed; --muted: #a1a1a1;
  --border: #262626; --border-strong: #3f3f3f;
  --accent: #5ee6a8; --accent-fg: #05130d;
  --font-sans: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Inter, sans-serif;
  --font-mono: ui-monospace, 'JetBrains Mono', 'SF Mono', Menlo, monospace;
  --text-13: 0.8125rem; --text-16: 1rem; --text-20: 1.25rem; --text-25: 1.5625rem;
  --text-31: 1.9375rem; --text-39: 2.4375rem; --text-49: 3.0625rem;
  --space-1: 4px;  --space-2: 8px;  --space-3: 12px; --space-4: 16px;
  --space-6: 24px; --space-8: 32px; --space-12: 48px; --space-16: 64px; --space-24: 96px;
  --radius-tile: 8px; --radius-featured: 12px; --radius-chip: 999px;
  --duration: 150ms; --ease: ease-out;
}
```
Display sizes use `letter-spacing: -0.02em`; labels use `font-family: var(--font-mono);
text-transform: uppercase; font-size: 11px; letter-spacing: 0.08em;`.

**B — Editorial Index**:
```css
:root {
  --bg: #faf9f6; --surface: #ffffff; --fg: #141414; --muted: #6f6b64;
  --border: #e6e2da; --accent: #2c5cd6; --accent-soft: #e8edfb; --highlight: #f5efe4;
  --font-display: 'Iowan Old Style', Georgia, 'Times New Roman', serif;
  --font-sans: ui-sans-serif, system-ui, 'Helvetica Neue', Arial, sans-serif;
  --text-14: 0.875rem; --text-16: 1rem; --text-19: 1.1875rem; --text-24: 1.5rem;
  --text-34: 2.125rem; --text-48: 3rem; --text-68: 4.25rem;
  --space-1: 8px; --space-2: 16px; --space-3: 24px; --space-4: 32px;
  --space-6: 48px; --space-8: 64px; --space-12: 96px; --space-16: 128px;
  --maxw-text: 72ch; --maxw-site: 1200px;
  --radius-tile: 4px; --radius-chip: 999px;
  --duration: 200ms; --ease: ease;
}
```

**C — Tonal Bento** (M3 roles; light is default, dark in `@media (prefers-color-scheme: dark)`):
```css
:root {
  --surface: #fbfbfd; --surface-container: #f1f2f6;
  --on-surface: #1b1d22; --on-surface-variant: #4b4e57;
  --outline: #c4c7cf; --primary: #3b5bdb; --on-primary: #ffffff;
  --primary-container: #e3e9fc;
  --cat-apps: #2c5cd6; --cat-games: #b3261e; --cat-ai: #6b21c8;
  --cat-cli: #0f6b63; --cat-tools: #8a5a00;
  --radius-tile: 16px; --radius-featured: 24px; --radius-chip: 999px;
  --duration: 200ms;
}
@media (prefers-color-scheme: dark) {
  :root {
    --surface: #131417; --surface-container: #1d1f24;
    --on-surface: #e4e6eb; --on-surface-variant: #a2a6b0;
    --outline: #3f424a; --primary: #9db1ff; --on-primary: #10204a;
    --primary-container: #2a3a66;
    --cat-apps: #9db1ff; --cat-games: #ffb4ab; --cat-ai: #d3b8ff;
    --cat-cli: #6cd9cc; --cat-tools: #ffd54f;
  }
}
```
Type roles via `clamp()`: `--type-display: clamp(2.25rem, 5vw, 3.5625rem)` (57),
`--type-headline: clamp(1.5rem, 3vw, 1.75rem)` (28), `--type-title-lg: 1.375rem` (22),
`--type-body: 1rem` (16), `--type-label: 0.875rem` (14, weight 500). Elevation is
tonal (`--surface-container`), no shadows.

*Acceptance check (all)*: `npm test` green; opening any page shows the correct
canvas color; `grep -c 'prefers-color-scheme' assets/css/main.css` → ≥1 only for C,
and for C **zero** occurrences of `data-theme-toggle` anywhere
(`grep -r 'data-theme-toggle' index.html portfolio.html contact.html` → no matches).

### F2 — Base/reset

In `assets/css/main.css`: modern reset (`box-sizing: border-box` on `*`,
`margin: 0` on body/h/p/ul, `img { max-width: 100%; display: block }`), then:
- `body { background: var(--bg); color: var(--fg); font-family: var(--font-sans);
  line-height: 1.5; -webkit-font-smoothing: antialiased; }`
- `.skip-link` pattern: absolutely positioned off-screen, becomes visible at top on
  `:focus` (`position: fixed; top: var(--space-2); left: var(--space-2);
  transform: translateY(-200%);` … `:focus { transform: none; }`), as the FIRST
  element in `<body>`: `<a class="skip-link" href="#main">Skip to main content</a>`,
  with `<main id="main">` wrapping page content.
- Semantic landmarks: `header.site-nav` (with inner `<nav>`), `main#main`, `footer.site-footer`.

*Acceptance check*: keyboard Tab on any page reaches the skip link first and it is
visibly rendered when focused; `npm test` green.

### F3 — Nav component

Markup (same for all candidates, from 1.3/1.7):

```html
<header class="site-nav">
  <nav class="site-nav__inner" aria-label="Primary">
    <a class="site-nav__brand" href="./index.html">Byron Miller</a>
    <button class="site-nav__toggle" type="button" data-site-nav-toggle
      aria-expanded="false" aria-controls="site-nav-menu" aria-label="Toggle navigation">
      <span class="site-nav__toggle-bar" aria-hidden="true"></span>
    </button>
    <div class="site-nav__menu" id="site-nav-menu">
      <a class="site-nav__link" href="./index.html">About</a>
      <a class="site-nav__link" href="./portfolio.html">Portfolio</a>
      <a class="site-nav__link" href="./contact.html">Contact</a>
      <a class="site-nav__link" href="https://dashinja.github.io/auntieKimDates/">Auntie Kim Dates</a>
      <a class="site-nav__link" href="./assets/documents/Byron_Miller_Resume_vc_techOnly_vari_ec_2024_03_18.docx" download>Resume</a>
      <a class="site-nav__link site-nav__link--icon" href="https://www.linkedin.com/in/millerbyron/" target="_blank" rel="noopener noreferrer">…inline SVG…</a>
      <a class="site-nav__link site-nav__link--icon" href="https://github.com/dashinja/" target="_blank" rel="noopener noreferrer">…inline SVG…</a>
    </div>
  </nav>
</header>
```

- The current page's link gets `aria-current="page"` (hardcode per page).
- `position: sticky; top: 0; z-index: 10;` with per-candidate treatment:
  - **A**: hairline bottom border (`border-bottom: 1px solid var(--border)`),
    `background: color-mix(in srgb, var(--bg) 85%, transparent)` + `backdrop-filter: blur(8px)`,
    links in 11px mono uppercase.
  - **B**: no border until scrolled (optional); plain `var(--bg)` background; links in
    sans 14px with generous spacing; active link underlined.
  - **C**: `background: var(--surface)`; active link gets a **pill** state
    (`background: var(--primary-container); border-radius: var(--radius-chip);
    padding: var(--space-1) var(--space-2); color: var(--on-surface)`).
- Every candidate keeps `data-target="#siteHelpModal"`, `id="siteHelpModal"`,
  `How this site works`, and `data-theme-toggle` OUT (test 3).

*Acceptance check*: nav renders on all three pages; `npm test` green; `grep -c
'rel="noopener noreferrer"' index.html` counts both social anchors; no
`data-toggle="collapse"` remains (`grep -r 'data-toggle' index.html` → empty).

### F4 — Hero (index.html)

- **A**: left-aligned; `h1.hero__title` at `--text-49`, tracking -0.02em; tagline in
  `--muted`; optional portrait at right as a bordered square (1px `--border`,
  radius 8px); CTAs: primary = accent-filled button (`--accent` bg, `--accent-fg`
  text, radius 8px), secondary = hairline ghost button; mono kicker label above
  title (`FULL-STACK DEVELOPER`).
- **B**: two-column (portrait left ~360px, headline right); headline serif
  `--text-68` with an italic serif deck line under it; CTAs are underlined text
  links with arrows, accent color.
- **C**: hero as a large `--radius-featured` surface-container card; title at
  `--type-display`; portrait rounded; CTAs filled (`--primary`/`--on-primary`) +
  tonal (`--primary-container`/`--on-surface`).

*Acceptance check*: hero contains name, one-liner (1.5 copy), portrait
(`assets/images/squaremeup.png`, meaningful `alt="Portrait of Byron Miller"`), and
the two CTAs; `npm test` green.

### F5 — Featured bento row (index.html)

`div.bento` — CSS grid, 3 columns desktop; each featured app from 1.2 is an
`<a class="tile tile--featured">` spanning **2 columns** (grid-template-areas or
`grid-column: span 2`; on C the middle tile is 2×2). Tile content: name
(`.tile__name`), category chip (`.tile__chip`), blurb (`.tile__blurb`), arrow
affordance (`.tile__arrow` — an inline SVG `→`).
- **A**: tiles are `--surface` with 1px `--border`, radius `--radius-featured`;
  mono index numbers `01` `02` `03` top-right (`.tile__index`); hover = border
  brightens to `--border-strong` + arrow nudges `translateX(4px)` + background
  lifts to `--surface-2`.
- **B**: featured 3 get a warm band: `background: var(--highlight)` with a serif
  pull-quote intro line above the row; rows are otherwise hairline-ruled.
- **C**: featured tiles 2×2 spans with `--primary-container` tint per category
  color; color-coded dot (`.tile__dot`) + chip on every tile.
- Grocery tile href is EXACTLY `./grocery/`.

*Acceptance check*: exactly 3 `.tile--featured` on index.html; the third has
`href="./grocery/"`; `grep -c 'https://dashinja.github.io/grocery/' index.html` → 0;
`npm test` green.

### F6 — App gallery (index.html + portfolio.html)

11 linking tiles (3 featured + 8 gallery) + optional non-linking Tetris tile.
Every tile: name, category, one-liner (index) or status badge (portfolio), arrow.
- **A**: same bento grid, 1×1 tiles with mono index numbers `04`–`11` top-right.
- **B**: an **editorial index list** — `ol.gallery__list` of rows
  (`li.gallery__row`): big light serif numeral, name (serif `--text-24`), category
  in muted small caps, one-liner, arrow that fades in on hover; hairline
  `border-top: 1px solid var(--border)` between rows; hover = row background tint
  + 1px title underline draw (`background-image` linear-gradient width 0→100%).
  Portfolio page groups rows by category with serif category headings + status
  badges (chip: `Live` for all 11, `Coming soon` for Tetris as a non-link row).
- **C**: true bento with varied spans (featured 2×2, categories 1×1 / 2×1), each
  tile `--surface-container` with category color dot + chip; portfolio groups
  tiles under category headings with status badges.
- All external app hrefs keep `target="_blank" rel="noopener noreferrer"`.

*Acceptance check*: `grep -c 'class="tile' index.html` (or `.gallery__row` for B)
≥ 11 linking tiles + optional 1 non-link; every `target="_blank"` anchor on the
page carries `rel="noopener noreferrer"` (test 4); Tetris tile (if present) is a
`<div>`/`<li>` without `href`; `npm test` green.

### F7 — About strip (index.html)

`section.about`: the 2–3 sentence copy from 1.5 + `ul.about__chips` with the 10
tech chips (`.chip`).
- **A**: strip on `--surface` with hairline top/bottom borders; chips mono 11px
  uppercase with 1px `--border`, radius 999.
- **B**: strip on `var(--bg)` with hairline rules; chips as accent-soft pills
  (`--accent-soft` bg, `--accent` text).
- **C**: strip as a `--surface-container` rounded (16px) band; chips
  `--primary-container`/`--on-surface`.

*Acceptance check*: strip renders with ≥10 `.chip` items; `npm test` green.

### F8 — Footer

`footer.site-footer` (in normal flow — NOT fixed-bottom): socials, resume
download, copyright. Per-candidate background: A = `--surface` + hairline top
border; B = `--bg` + hairline rule; C = `--surface-container`. Include the year
span from 1.4.

*Acceptance check*: no `fixed-bottom` class remains on any page; footer social
anchors carry `rel="noopener noreferrer"`; `npm test` green.

### F9 — navbar-toggle.js behavior (rewrite, first-party)

Replace `assets/js/navbar-toggle.js` entirely (keep the filename):

```js
(function () {
  'use strict';
  var toggle = document.querySelector('[data-site-nav-toggle]');
  var menu = document.getElementById('site-nav-menu');
  if (!toggle || !menu) return;

  function setOpen(open) {
    toggle.setAttribute('aria-expanded', String(open));
    menu.classList.toggle('site-nav__menu--open', open);
  }
  toggle.addEventListener('click', function () {
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });
  menu.addEventListener('click', function (event) {
    if (event.target instanceof Element && event.target.closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setOpen(false);
      toggle.focus();
    }
  });
  var year = document.getElementById('copyright-year');
  if (year) year.textContent = String(new Date().getFullYear());
}());
```

CSS pairs with it: `.site-nav__menu` is a horizontal row ≥768px; below 768px it is
hidden (`display: none`) until `.site-nav__menu--open` shows it as a vertical
dropdown panel under the sticky bar (A: `--surface` + hairline border; B:
`--surface` card; C: `--surface-container` panel, radius 16 at bottom corners).

*Acceptance check*: at 390px width, clicking `.site-nav__toggle` opens the menu,
`aria-expanded` flips to `true`, Escape closes it, clicking a link closes it;
`npm test` green (exact script tag still present on all three pages).

### F10 — Responsive breakpoints

All candidates, in each stylesheet:
- `--mobile-max: 767px`, `--tablet-min: 768px`, `--desktop-min: 1024px`.
- Nav: hamburger below 768px, full row at ≥768px.
- Bento (A/C): 1 column below 768px, 2 columns 768–1023px, 3 columns ≥1024px;
  featured spans collapse to full width below 1024px. B: rows stack vertically
  below 768px (numeral shrinks, arrow hidden), two-line rows at ≥768px.
- Hero: A single column below 768px (portrait above title, max-width 240px);
  B two-column below 768px collapses to portrait-on-top; C hero card stays
  full-width with content stacking below 768px.
- Type: A/B fixed scale steps step down one size per breakpoint; C scales via
  `clamp()` automatically (verify no overflow at 320px).
- Site max-width: B `--maxw-site: 1200px` centered; A content max-width 1120px;
  C content max-width 1200px, `padding-inline: var(--space-4)`.

*Acceptance check*: with browser at 1440×900 and 390×844, no horizontal
scrollbar (`document.documentElement.scrollWidth <= window.innerWidth` in
console); layout matches the candidate description at both widths.

### F11 — Reduced motion, focus-visible, contrast (accessibility floor)

In `assets/css/main.css` (all candidates):

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
:focus-visible { outline: 2px solid var(--accent, var(--primary)); outline-offset: 2px; }
```
(B uses `var(--accent)`; C uses `--primary` at 12% ring convention: 2px solid
`--primary`, offset 2px.)

Contrast requirements (WCAG AA, verify each pair ≥ 4.5:1 body text / 3:1 large
text & UI borders):
- A: `--fg` on `--bg` (≈17:1), `--muted #a1a1a1` on `--bg` (≈7.6:1), `--accent-fg`
  on `--accent` (≈10:1), `--border` used for decoration only (non-text).
- B: `--fg` on `--bg` (≈16:1), `--muted #6f6b64` on `--bg` (≈4.6:1), `--accent
  #2c5cd6` on `--bg` (≈5.5:1).
- C: BOTH schemes — light `--on-surface-variant` on `--surface` (≈7:1), light
  `--primary` on `--surface` (≈5.9:1); dark `--on-surface-variant` on `--surface`
  (≈6:1), dark `--primary` on `--surface` (≈8:1); each `--cat-*` color on
  `--surface` in its scheme ≥ 4.5:1 (the values above are pre-checked; if an
  executor adjusts a `--cat-*` value it must re-verify with a contrast calculator).

*Acceptance check*: OS dark mode + "reduce motion" toggled → no animations, C
renders dark, all text readable; `:focus-visible` ring visible when tabbing;
`npm test` green.

### F12 — Demo mock (per candidate, NOT committed to the repo)

Path: `~/code/homeApps/.atomic/redesign-evidence/candidate-{a|b|c}/demo.html`.
Requirements:
- Single self-contained file: inline `<style>`, inline `<script>`, NO external
  URLs of any kind (no fonts, no images — use CSS shapes/emoji/gradients).
- Reproduces the candidate's index.html visually: nav (toggle works), hero,
  featured bento, gallery, about strip, footer.
- All anchors are `href="#"` with `event.preventDefault()` in the inline script.
- Hover/focus interactions and `prefers-reduced-motion` behavior work.

*Acceptance check*:
`grep -o 'http[^"'\'' )]*' demo.html | grep -v '^\s*$'` → empty (ignoring comment
lines); all `href="#"`; open in a browser: toggle, hover, focus, and reduced-motion
all behave; file ≥ 5 KB.

### F13 — Page assembly order (final wiring, per candidate)

1. Write `assets/css/main.css` (F1, F2, F3, F8, F9-css, F10, F11 shared parts).
2. Rewrite `index.html` on the F1.6 head skeleton: skip link → nav → `main#main`
   (hero → featured → gallery → about) → footer → script tag.
3. Rewrite `portfolio.html`: nav → heading → category-grouped richer gallery →
   about-this-site note → footer. Keep zero or fully-annotated external images
   (test 8). Keep `rel="noopener noreferrer"` on every new-tab app link.
4. Rewrite `contact.html`: nav → compact contact card (headline `Let's Connect`,
   an email CTA `mailto:`, socials, resume link) → footer. The dead form fields
   are dropped OR kept as a non-submitting form — either is fine; no backend.
5. Write `assets/css/home.css`, `portfolio.css`, `contact.css` for page layout.
6. Full gate: `npm test`; then `npx vitest run` once more from a clean shell.

*Acceptance check*: `npm test` green with all 8 test blocks passing; all three
pages visually complete at both viewports; no console errors in the browser.

---

## Part 3 — Rollout mechanics

### 3.1 Worktrees and branches

```bash
cd ~/code/homeApps/dashinja.github.io
git branch design/candidate-a master   # repeat for candidate-b, candidate-c
git worktree add ~/code/dashinja-redesign-worktrees/candidate-a design/candidate-a
# (spec branch/worktree already exists: design/redesign-spec at ~/code/dashinja-redesign-worktrees/spec)
ln -s ~/code/homeApps/dashinja.github.io/node_modules \
      ~/code/dashinja-redesign-worktrees/candidate-a/node_modules
```

The spec itself lives at `redesign/REDESIGN-SPEC.md` on branch
`design/redesign-spec` in `~/code/dashinja-redesign-worktrees/spec`
(`docs/` is gitignored — only `redesign/` is tracked for docs).

### 3.2 Commit and push steps (per candidate)

1. Work ONLY inside the candidate worktree; `git status` must show no stray edits
   outside `index.html`, `portfolio.html`, `contact.html`, `assets/css/**`,
   `assets/js/navbar-toggle.js`.
2. Commit with message `Redesign candidate X — <name> (proposal, do not merge)` plus
   trailers:
   - `Assistant-workflow: <workflow name> (run <runId>)` or `Assistant-workflow: inline`
   - `Assistant-duration: <elapsed> <converged|blocked|abandoned>, estimated <estimate>`
   - `Assistant-verification: vitest static-site passed: npm test` (plus one line per
     screenshot/demo check actually run)
   - `Co-authored-by: Byron Miller <email from git config user.email>`
3. `git push -u origin design/candidate-X`

### 3.3 npm test gate

Run in the worktree (node_modules symlinked): `npm test` → `vitest run`. ALL 8 test
blocks must pass. The gate runs (a) after every Part-2 function, (b) before
screenshots, (c) before issue/PR creation. A red gate blocks everything downstream.

### 3.4 Screenshot capture procedure

Tool: agent-browser against a local server.

```bash
cd ~/code/dashinja-redesign-worktrees/candidate-X
python3 -m http.server 8080 &
# agent-browser: navigate to http://localhost:8080/index.html and /portfolio.html
# viewports: desktop 1440×900, mobile 390×844; capture FULL PAGE
```

Outputs to `~/code/homeApps/.atomic/redesign-evidence/candidate-X/`:
- `after-home-desktop.png`, `after-home-mobile.png`,
  `after-portfolio-desktop.png`, `after-portfolio-mobile.png`
- Each must be > 20 KB. (Before-shots `before/before-{home,portfolio}-{desktop,mobile}.png`
  already exist in the same evidence root, captured on master.)
- Stop the http.server afterwards. Never screenshot or link `https://dashinja.github.io/grocery/`.

### 3.5 demo.html check (before issues)

`demo.html` exists at the evidence path; zero `http` URLs outside comments; all
anchors `href="#"`; interactions work per F12.

### 3.6 Issue authoring (gh ≥ 2.102.0, repeatable `--attach`)

Repo: `dashinja/dashinja.github.io`. Four issues, all as PROPOSALS:
1. **Master tracking issue** — "Redesign dashinja.github.io: modern app-hub — 3
   candidates + spec (no merges)". Body: goal, before montage (`--attach
   before-home-desktop.png --attach before-portfolio-desktop.png`), links to the 3
   candidate issues + spec PR + 3 candidate PRs, explicit "all proposals, nothing
   merged, awaiting review".
2–4. **Candidate A/B/C issues** — concept summary, token table, 4 before + 4 after
   screenshots attached, demo.html attached, comparison table row, link to its PR.
Body trailers: `Assistant-workflow:`, `Assistant-duration:`,
`Assistant-verification:` lines. NEVER use `Closes` in any body.

### 3.7 PR authoring

- One PR per candidate branch → `master`, title
  `Redesign candidate X — <name> (proposal, do not merge)`.
- Body: linked issue reference (no `Closes` — "decision pending"), evidence summary
  with screenshots named next to the scenario they prove, verification lines
  (vitest, screenshots, demo check), `Assistant-workflow:` / `Assistant-duration:` /
  `Assistant-verification:` trailers, and `User-preference: user wants candidates
  reviewed before any merge`.
- Spec PR from `design/redesign-spec` → `master` (docs only).
- **NEVER-MERGE RULE: no PR is merged. No issue is closed via `Closes`. All four
  PRs stay open as proposals awaiting human review.**

---

## Part 4 — Verification checklist (test contract → reviewer location)

| # | Test contract item (tests/static-site.test.ts) | Where the reviewer looks |
|---|------------------------------------------------|--------------------------|
| 1 | `index.html`/`portfolio.html`/`contact.html` each contain `https://dashinja.github.io/auntieKimDates/` | Featured tile #1 href + nav "Auntie Kim Dates" link on all three pages |
| 2 | No `https://dashinja.github.io/grocery/` in any of the three pages | Grocery tile/row uses `./grocery/` (index featured, portfolio gallery) |
| 3 | No `BKocery` string anywhere in the three pages | grep all three pages; also check alt text and comments |
| 4 | `grocery/index.html` keeps refresh+canonical to `bk_grocery`, no `/grocery/assets/` | File untouched — `git diff master -- grocery/` must be EMPTY |
| 5 | No `data-theme-toggle`, `data-target="#siteHelpModal"`, `id="siteHelpModal"`, `How this site works` | Nav and footer markup on all three pages; especially Candidate C's theme story (media query only) |
| 6 | Every `target="_blank"` anchor has `rel="noopener noreferrer"` in ALL sourceFiles (3 html + 3 untouched Next files) | Social links (nav+footer) and app tiles on all pages; `git diff master -- src/ portfolio-next/` EMPTY |
| 7 | Exact tag `<script src="./assets/js/navbar-toggle.js"></script>` present | Last line inside `<body>` of each of the three pages |
| 8 | No `<script src="https://...">`, `jquery`, `popper`, `bootstrap.min.js` | Head of each page: no CDN script tags; grep each forbidden string |
| 9 | `name="referrer" content="strict-origin-when-cross-origin"` present | Head meta #3 of each page (Part 1.6 skeleton) |
| 10 | CSP meta with `object-src 'none'` and `base-uri 'self'` | Head meta #4 of each page (Part 1.6 skeleton) |
| 11 | `assets/documents/` contains exactly the one resume docx, no `/obsolete/`, no `:` filenames | `git diff master -- assets/documents/` EMPTY; `ls assets/documents` → 1 file |
| 12 | Every external `<img src="https://...">` in portfolio.html has `referrerpolicy="no-referrer"` | Portfolio gallery: preferred outcome is zero external images; if the Giphy GIF is kept, the attribute is on the `<img>` tag and `https://media0.giphy.com` is in the CSP `img-src` |

Final reviewer pass per candidate: `npm test` green in the worktree, 4 after-
screenshots > 20 KB present, demo.html passes F12 checks, commit present on the
pushed branch, PR open and UNMERGED.
