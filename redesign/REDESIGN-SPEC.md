# REDESIGN-SPEC — dashinja.github.io modern app-hub

LLM-executable implementation plan. The program is **8 design variants, all dark or
"not bright"** (operator ruling 2026-10-27). Candidate A (Terminal Noir) is BUILT
(issue #20). Candidates B (Editorial Index) and C (Tonal Bento, as shipped
light-dominant) are **REJECTED**. Variants 2–8 implement the SAME information
architecture, the SAME file contract, and the SAME hard test rules from
`tests/static-site.test.ts`. Only the design system (tokens, components, motion)
differs.

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
  - (Consequence: no variant ships a theme toggle — the dark presentation is the
    default stylesheet, never behind a control.)
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
- Variants are proposals: branches/PRs/issues only, NEVER merge, never close
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
section.gallery > h2, div.gallery__grid > a.tile*11
section.about > p, ul.about__chips > li.chip
footer.site-footer > div.footer__socials, a.footer__resume, p.footer__copyright
```

---

## Part 2 — Function-by-function implementation (variants 2–8)

> **Candidate status (operator ruling, 2026-10-27 — dark-only program, 8 variants):**
>
> | Candidate | Verdict |
> |---|---|
> | A — Terminal Noir (dark) | **ACCEPTED & BUILT** (issue #20). Remains the reference for IA, file contract, and the a11y floor; not re-specified here. |
> | B — Editorial Index (light) | **REJECTED** — light theme; the program is dark-only. |
> | C — Tonal Bento (light-dominant, dark via media query) | **REJECTED** as shipped. Its tonal-bento idea survives reworked dark-only as **variant 7 (Dusk Bento)**. |
> | Variants 2–8 | **SPECIFIED BELOW** — all dark or "not bright". |
>
> Evidence and per-variant grounding: `~/code/homeApps/.atomic/redesign-evidence/dark-variant-brief.md`.

### 2.1 General execution protocol (every variant, every function)

1. Work on branch `design/variant-N` in worktree
   `~/code/dashinja-redesign-worktrees/variant-N` (node_modules symlinked, Part 3.1).
2. Implement one function at a time, in the order listed (F1 → F12), then assemble
   per F13.
3. Run `npm test` after EVERY function. If red, fix before proceeding.
4. Each function lists an **Acceptance check** — run it literally (command or
   inspection) and only proceed when it passes.
5. Standing scope rules from Part 0 apply throughout: never touch `grocery/`,
   `assets/documents/`, `src/`, `portfolio-next/`; never merge.

File layout (identical for every variant; `N` = variant number 2–8):

```
assets/css/main.css        tokens + reset + shared components (nav, footer, chips, tiles)
assets/css/home.css        index.html-specific layout (hero, featured, about strip)
assets/css/portfolio.css   portfolio.html-specific layout
assets/css/contact.css     contact.html-specific layout
assets/js/navbar-toggle.js rewritten first-party (see S-F9)
demo mock → NOT in the repo: ~/code/homeApps/.atomic/redesign-evidence/variant-{N}/demo.html
```

### 2.2 Hard rules inherited from the research (every variant)

1. Page background between `#0a0a0a` and `#151517` (each variant pins one in F1);
   text off-white (`#e8eaed`-ish), NEVER pure `#000`/`#fff`; muted text ≥ 4.5:1 on
   its surface.
2. Exactly ONE accent per variant, desaturated/brightened for dark (M3 ~40-tone
   rule); status colors get dark-tuned variants.
3. Border discipline (Geist): each border drawn once, no stacked alpha borders;
   hairlines over shadows; translucent shadows only.
4. Elevation = tonal steps (Radix steps 2/3, M3 surface-container), never opaque
   drop shadows.
5. NO `prefers-color-scheme` media query anywhere — every variant is dark-only by
   default, and no variant ships a theme toggle (test 3).

### 2.3 Shared functions (mechanics identical for all variants)

S-F2 (base/reset), S-F9 (navbar-toggle.js), the S-F10 breakpoint skeleton, the
S-F11 a11y floor, S-F12 (demo mock), and S-F13 (assembly order) are written out
ONCE here and are implemented on every variant branch at the same position in the
order. F1 and the visual treatments for F3–F8 are per-variant (2.4).

#### S-F2 — Base/reset

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

#### S-F3-markup — Nav markup (shared skeleton, per-variant skin in 2.4)

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
- `position: sticky; top: 0; z-index: 10;` on `header.site-nav`.
- The nav keeps `data-target="#siteHelpModal"`, `id="siteHelpModal"`,
  `How this site works`, and `data-theme-toggle` OUT (test 3).

*Acceptance check*: nav renders on all three pages; `grep -c
'rel="noopener noreferrer"' index.html` counts both social anchors; no
`data-toggle="collapse"` remains (`grep -r 'data-toggle' index.html` → empty);
`npm test` green.

#### S-F9 — navbar-toggle.js behavior (rewrite, first-party)

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
dropdown panel under the sticky bar. Panel skin per variant: `--surface` (or the
variant's panel tone) with a 1px `--border`, bottom corners at the variant's tile
radius.

*Acceptance check*: at 390px width, clicking `.site-nav__toggle` opens the menu,
`aria-expanded` flips to `true`, Escape closes it, clicking a link closes it;
`npm test` green (exact script tag still present on all three pages).

#### S-F10 — Responsive breakpoint skeleton (all variants)

- `--mobile-max: 767px`, `--tablet-min: 768px`, `--desktop-min: 1024px`.
- Nav: hamburger below 768px, full row at ≥768px.
- Tile grids: 1 column below 768px, 2 columns 768–1023px, 3 columns ≥1024px;
  featured spans collapse to full width below 1024px.
- Hero: single column below 768px (portrait above title, max-width 240px).
- Type: fixed scale steps step down one size per breakpoint (no fluid `clamp()`
  scale anywhere — the C-style fluid type was rejected with C; variant 7 uses
  fixed steps too).
- Content max-width 1120–1200px centered (per variant), `padding-inline:
  var(--space-4)`.
- Per-variant deltas (e.g. variant 5's editorial rows): see 2.4.

*Acceptance check*: with browser at 1440×900 and 390×844, no horizontal scrollbar
(`document.documentElement.scrollWidth <= window.innerWidth` in console); layout
matches the variant description at both widths.

#### S-F11 — Reduced motion, focus-visible, contrast (accessibility floor)

In `assets/css/main.css` (all variants):

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
```

Every variant defines `--accent`, so the focus-ring token is uniform. Per-variant
contrast pairs (WCAG AA: ≥ 4.5:1 body text, ≥ 3:1 large text & UI borders) are
listed in each variant's F11 step in 2.4; values there are pre-checked — if an
executor adjusts any listed value it must re-verify with a contrast calculator.

*Acceptance check*: OS "reduce motion" toggled → no animations, all text readable;
`:focus-visible` ring visible when tabbing; `npm test` green.

#### S-F12 — Demo mock (per variant, NOT committed to the repo)

Path: `~/code/homeApps/.atomic/redesign-evidence/variant-{N}/demo.html`.
Requirements:
- Single self-contained file: inline `<style>`, inline `<script>`, NO external
  URLs of any kind (no fonts, no images — use CSS shapes/emoji/gradients).
- Reproduces the variant's index.html visually: nav (toggle works), hero, featured
  bento, gallery, about strip, footer.
- All anchors are `href="#"` with `event.preventDefault()` in the inline script.
- Hover/focus interactions and `prefers-reduced-motion` behavior work.

*Acceptance check*:
`grep -o 'http[^"'\'' )]*' demo.html | grep -v '^\s*$'` → empty (ignoring comment
lines); all `href="#"`; open in a browser: toggle, hover, focus, and reduced-motion
all behave; file ≥ 5 KB.

#### S-F13 — Page assembly order (final wiring, per variant)

1. Write `assets/css/main.css` (F1, S-F2, F3, F8, S-F9 CSS, S-F10, S-F11 shared parts).
2. Rewrite `index.html` on the Part 1.6 head skeleton: skip link → nav → `main#main`
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

### 2.4 The variants (2–8), function by function

Each variant below lists its 12 steps in execution order: token block → base/reset
→ nav → hero → featured → gallery → about → footer → navbar-toggle.js →
breakpoints → a11y floor → demo mock. Steps marked **(shared)** are implemented
exactly as written in 2.3 — they are restated as one line per variant so no
variant skips one. Each step carries its acceptance check; shared-step checks
are incorporated by reference.

---

#### Variant 2 — Midnight Signature (Vercel marketing + Geist)

Grounded in: Vercel-style marketing surfaces + the Geist 10-step scale.
Signature: gradient-glow hero, big display type, calm near-black canvas.

**F1 — Design tokens** (`assets/css/main.css`, `:root`):

```css
:root {
  --bg: #09090b; --surface: #101013; --surface-2: #16161a;
  --fg: #ededed; --muted: #a1a1aa;
  --border: #26262b; --border-strong: #3f3f46;
  --accent: #7c8cff; --accent-fg: #0a0a14;
  --glow-from: #3b82f6; --glow-to: #8b5cf6;   /* decorative gradient, never text */
  --font-sans: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Inter, sans-serif;
  --font-mono: ui-monospace, 'JetBrains Mono', 'SF Mono', Menlo, monospace;
  --text-13: 0.8125rem; --text-16: 1rem; --text-20: 1.25rem; --text-25: 1.5625rem;
  --text-31: 1.9375rem; --text-39: 2.4375rem; --text-56: 3.5rem;
  --space-1: 4px;  --space-2: 8px;  --space-3: 12px; --space-4: 16px;
  --space-6: 24px; --space-8: 32px; --space-12: 48px; --space-16: 64px; --space-24: 96px;
  --radius-tile: 10px; --radius-featured: 14px; --radius-chip: 999px;
  --duration: 150ms; --ease: ease-out;
}
```

Display sizes use `letter-spacing: -0.02em`; labels mono 11px uppercase 0.08em.
The glow pair is used ONLY in gradients (hero background, tile top-edge
highlights) — never as text color.

*Acceptance check*: `npm test` green; any page's canvas is `#09090b`;
`grep -c 'prefers-color-scheme' assets/css/main.css` → 0.

**F2 — Base/reset** **(shared, S-F2)** — no deltas. *Acceptance check*: as S-F2.

**F3 — Nav**: sticky; `background: color-mix(in srgb, var(--bg) 80%, transparent)`
+ `backdrop-filter: blur(8px)`; 1px `--border` bottom hairline (drawn once);
links sans 14px; active link `color: var(--accent)`.

*Acceptance check*: nav matches the treatment on all three pages; S-F3-markup
checks pass; `npm test` green.

**F4 — Hero**: centered; mono kicker label `FULL-STACK DEVELOPER`; title at
`--text-56`, tracking -0.02em; behind the title a radial glow on the hero section:
`background: radial-gradient(ellipse 60% 40% at 50% 0%,
color-mix(in srgb, var(--glow-from) 22%, transparent), transparent 70%)`
(decorative); tagline in `--muted`; CTAs: primary accent-filled (`--accent` bg /
`--accent-fg` text, radius 10px), secondary hairline ghost.

*Acceptance check*: hero contains name, one-liner (1.5 copy), portrait
(`assets/images/squaremeup.png`, `alt="Portrait of Byron Miller"`), and the two
CTAs; the glow renders behind the title only; `npm test` green.

**F5 — Featured bento**: 3 tiles spanning 2 columns each (`grid-column: span 2`),
`--surface` with 1px `--border`, radius `--radius-featured`; a 1px gradient
top-edge highlight per tile (`::before` with
`linear-gradient(90deg, var(--glow-from), var(--glow-to))`, opacity 0 → 0.6 on
hover); hover = border brightens to `--border-strong`, background lifts to
`--surface-2`, arrow nudges `translateX(4px)`. Grocery tile href EXACTLY `./grocery/`.

*Acceptance check*: exactly 3 `.tile--featured` on index.html; the third has
`href="./grocery/"`; `grep -c 'https://dashinja.github.io/grocery/' index.html` → 0;
`npm test` green.

**F6 — App gallery**: same grid, 1×1 tiles with mono index numbers `04`–`11`
top-right; hover as featured minus the gradient edge. External app hrefs keep
`target="_blank" rel="noopener noreferrer"`.

*Acceptance check*: ≥ 11 linking tiles + optional non-link Tetris `<div>`; every
`target="_blank"` anchor carries `rel="noopener noreferrer"` (test 4); `npm test`
green.

**F7 — About strip**: strip on `--surface` with hairline top/bottom borders;
chips mono 11px uppercase, 1px `--border`, radius 999px.

*Acceptance check*: strip renders with ≥ 10 `.chip` items; `npm test` green.

**F8 — Footer**: `--bg` background, 1px `--border` top hairline; socials, resume
download, year span per 1.4.

*Acceptance check*: no `fixed-bottom` class remains on any page; footer social
anchors carry `rel="noopener noreferrer"`; `npm test` green.

**F9 — navbar-toggle.js** **(shared, S-F9)** — no deltas. *Acceptance check*: as S-F9.

**F10 — Breakpoints** **(shared, S-F10)** — no deltas. *Acceptance check*: as S-F10.

**F11 — A11y floor** **(shared, S-F11)**. Contrast pairs (pre-checked): `--fg` on
`--bg` ≈ 16.9:1; `--muted #a1a1aa` on `--bg` ≈ 7.4:1; `--accent #7c8cff` on
`--bg` ≈ 6.7:1; `--accent-fg` on `--accent` ≈ 9:1; glow colors never used as text.

*Acceptance check*: as S-F11.

**F12 — Demo mock** **(shared, S-F12)** →
`~/code/homeApps/.atomic/redesign-evidence/variant-2/demo.html`.
*Acceptance check*: as S-F12.

---

#### Variant 3 — Graphite Console (Polaris dark)

Grounded in: Shopify Polaris dark. Signature: dashboard density, status dots,
utilitarian rows, squarer corners.

**F1 — Design tokens**:

```css
:root {
  --bg: #141516; --surface: #1b1d1e; --surface-2: #212425;
  --fg: #e3e5e7; --muted: #9aa5ad;
  --border: #2e3335; --border-strong: #4a5257;
  --accent: #ffb35c; --accent-fg: #211302;
  --status-success: #45d07b; --status-warning: #ffb35c;
  --status-critical: #f36b5d; --status-neutral: #9aa5ad;
  --font-sans: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Inter, sans-serif;
  --font-mono: ui-monospace, 'JetBrains Mono', 'SF Mono', Menlo, monospace;
  --text-12: 0.75rem; --text-13: 0.8125rem; --text-16: 1rem; --text-20: 1.25rem;
  --text-25: 1.5625rem; --text-31: 1.9375rem;
  --space-1: 4px;  --space-2: 8px;  --space-3: 12px; --space-4: 16px;
  --space-6: 24px; --space-8: 32px; --space-12: 48px; --space-16: 64px; --space-24: 96px;
  --radius-tile: 6px; --radius-featured: 8px; --radius-chip: 4px;
  --duration: 120ms; --ease: ease-out;
}
```

*Acceptance check*: `npm test` green; canvas `#141516`; zero `prefers-color-scheme`.

**F2 — Base/reset** **(shared, S-F2)** — no deltas. *Acceptance check*: as S-F2.

**F3 — Nav**: dense 48px bar, `--surface` bg, 1px hairline bottom; brand plus a
status line (`.site-nav__status`): a `--status-success` dot AND the text label
`11 apps live` — never color alone; links sans 13px uppercase 0.04em.

*Acceptance check*: nav matches treatment on all three pages; the status label is
real text next to the dot; S-F3-markup checks pass; `npm test` green.

**F4 — Hero**: console header, not a marketing hero — single row: title at
`--text-31` left with the one-liner in `--muted` under it; availability line on
the right (`● Live 11 · ● Soon 1` using `--status-success` / `--status-neutral`,
each dot paired with a text label); portrait as a small bordered square (64px,
radius 6px) beside the title; CTAs compact (accent-filled + hairline ghost, 36px
height).

*Acceptance check*: hero has name, one-liner (1.5 copy), portrait, both CTAs, and
a status line where every dot has adjacent text; `npm test` green.

**F5 — Featured bento**: utilitarian 3-tile row, 1px `--border`, radius 8px; each
tile header row = mono index + category chip + status dot; blurb at `--text-13`;
hover = border brightens to `--border-strong` + background lifts to `--surface-2`.
Grocery tile href EXACTLY `./grocery/`.

*Acceptance check*: exactly 3 `.tile--featured`; third `href="./grocery/"`; zero
`https://dashinja.github.io/grocery/`; `npm test` green.

**F6 — App gallery**: dashboard-density rows — 1×1 tiles with category column and
a status dot + `Live` text per app; portfolio groups by status/category with mono
group headings. Tetris (if present) = non-link tile labeled `Coming soon` with a
`--status-neutral` dot + text.

*Acceptance check*: ≥ 11 linking tiles; every status dot paired with text; every
`target="_blank"` carries `rel="noopener noreferrer"`; `npm test` green.

**F7 — About strip**: dense strip on `--surface` with hairlines; chips 13px,
radius 4px, 1px `--border`.

*Acceptance check*: ≥ 10 `.chip` items; `npm test` green.

**F8 — Footer**: `--surface`, hairline top; year span per 1.4.

*Acceptance check*: no `fixed-bottom`; socials carry `rel="noopener noreferrer"`;
`npm test` green.

**F9 — navbar-toggle.js** **(shared, S-F9)**. *Acceptance check*: as S-F9.

**F10 — Breakpoints** **(shared, S-F10)** — no deltas. *Acceptance check*: as S-F10.

**F11 — A11y floor** **(shared, S-F11)**. Pairs (pre-checked): `--fg` on `--bg`
≈ 13.5:1; `--muted #9aa5ad` on `--bg` ≈ 6:1; `--accent #ffb35c` on `--bg` ≈ 9.5:1;
`--accent-fg` on `--accent` ≈ 10:1; status colors on `--surface` ≥ 3:1 (UI use)
with text labels always present.

*Acceptance check*: as S-F11.

**F12 — Demo mock** **(shared, S-F12)** →
`~/code/homeApps/.atomic/redesign-evidence/variant-3/demo.html`.

---

#### Variant 4 — Deep Ocean (Radix slateDark + cyan)

Grounded in: the Radix dark scale (read from radix-ui/colors `dark.ts`) with a
cyan accent. Signature: calm blue-tinted ramp, soft tonal depth.

**F1 — Design tokens**:

```css
:root {
  --bg: #111113;              /* slateDark page step */
  --surface: #1b1c1f;         /* ~slateDark3 */
  --surface-2: #232428;       /* ~slateDark4 */
  --fg: #eceef0;              /* slateDark12 */
  --muted: #9ba1a6;           /* slateDark11 */
  --border: #2b2c31;          /* ~slateDark6 — one hairline draw */
  --border-strong: #45484f;   /* ~slateDark8 */
  --accent: #67e8f9; --accent-fg: #062a30;
  --accent-soft: #16333a;
  --font-sans: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Inter, sans-serif;
  --font-mono: ui-monospace, 'JetBrains Mono', 'SF Mono', Menlo, monospace;
  --text-13: 0.8125rem; --text-16: 1rem; --text-20: 1.25rem; --text-25: 1.5625rem;
  --text-31: 1.9375rem; --text-39: 2.4375rem; --text-49: 3.0625rem;
  --space-1: 4px;  --space-2: 8px;  --space-3: 12px; --space-4: 16px;
  --space-6: 24px; --space-8: 32px; --space-12: 48px; --space-16: 64px; --space-24: 96px;
  --radius-tile: 10px; --radius-featured: 14px; --radius-chip: 999px;
  --duration: 180ms; --ease: ease-out;
}
```

*Acceptance check*: `npm test` green; canvas `#111113`; zero `prefers-color-scheme`.

**F2 — Base/reset** **(shared, S-F2)** — no deltas. *Acceptance check*: as S-F2.

**F3 — Nav**: sticky; `background: color-mix(in srgb, var(--bg) 85%, transparent)`
+ `backdrop-filter: blur(8px)`; hairline bottom; links sans 14px; active link
`--accent` cyan.

*Acceptance check*: nav matches treatment on all three pages; S-F3-markup checks
pass; `npm test` green.

**F4 — Hero**: left-aligned, softer than A: title at `--text-39`; tagline in
`--muted`; portrait in a rounded square (1px `--border`, radius 14px) with a 1px
`--accent-soft` inner ring; CTAs accent-filled + ghost.

*Acceptance check*: hero has name, one-liner, portrait, two CTAs; `npm test` green.

**F5 — Featured bento**: featured tiles on `--surface`, hairline, radius 14;
hover lifts to `--surface-2` + border brightens to `--border-strong`; category
chips `--accent-soft` bg / `--accent` text. Grocery href EXACTLY `./grocery/`.

*Acceptance check*: exactly 3 `.tile--featured`; third `href="./grocery/"`; zero
`https://dashinja.github.io/grocery/`; `npm test` green.

**F6 — App gallery**: 1×1 tiles with quiet sans index numerals `04`–`11` (not
mono — calmer than A); external hrefs annotated. Tetris optional non-link tile.

*Acceptance check*: ≥ 11 linking tiles; `target="_blank"` anchors all carry
`rel="noopener noreferrer"`; `npm test` green.

**F7 — About strip**: strip on `--surface` with hairlines; chips
`--accent-soft`/`--accent` pills.

*Acceptance check*: ≥ 10 `.chip` items; `npm test` green.

**F8 — Footer**: `--bg` + hairline top.

*Acceptance check*: no `fixed-bottom`; socials carry `rel="noopener noreferrer"`;
`npm test` green.

**F9 — navbar-toggle.js** **(shared, S-F9)**. *Acceptance check*: as S-F9.

**F10 — Breakpoints** **(shared, S-F10)** — no deltas. *Acceptance check*: as S-F10.

**F11 — A11y floor** **(shared, S-F11)**. Pairs (pre-checked): `--fg` on `--bg`
≈ 16:1; `--muted #9ba1a6` on `--bg` ≈ 6.9:1; `--accent #67e8f9` on `--bg` ≈ 10.5:1;
`--accent-fg` on `--accent` ≈ 11:1; `--accent` text on `--accent-soft` ≥ 4.5:1.

*Acceptance check*: as S-F11.

**F12 — Demo mock** **(shared, S-F12)** →
`~/code/homeApps/.atomic/redesign-evidence/variant-4/demo.html`.

---

#### Variant 5 — Midnight Editorial (Swiss + serif on ink)

Grounded in: the rejected B's editorial structure re-grounded on dark ink.
Signature: serif display, big numerals, hairline rules, warm-gold accent.

**F1 — Design tokens**:

```css
:root {
  --bg: #0d0d10; --surface: #151519; --surface-2: #1b1b20;
  --fg: #e8e8ea; --muted: #9a9aa0;
  --border: #26262c; --border-strong: #3d3d45;
  --accent: #d4b483; --accent-fg: #1d1409;
  --font-display: 'Iowan Old Style', Georgia, 'Times New Roman', serif;
  --font-sans: ui-sans-serif, system-ui, 'Helvetica Neue', Arial, sans-serif;
  --text-14: 0.875rem; --text-16: 1rem; --text-19: 1.1875rem; --text-24: 1.5rem;
  --text-34: 2.125rem; --text-48: 3rem; --text-68: 4.25rem;
  --space-1: 8px; --space-2: 16px; --space-3: 24px; --space-4: 32px;
  --space-6: 48px; --space-8: 64px; --space-12: 96px; --space-16: 128px;
  --maxw-text: 68ch; --maxw-site: 1200px;
  --radius-tile: 2px; --radius-chip: 999px;
  --duration: 200ms; --ease: ease;
}
```

*Acceptance check*: `npm test` green; canvas `#0d0d10`; zero `prefers-color-scheme`.

**F2 — Base/reset** **(shared, S-F2)** — no deltas. *Acceptance check*: as S-F2.

**F3 — Nav**: plain `var(--bg)` bar, hairline bottom; brand in `--font-display`;
links sans 14px with generous spacing; active link underlined in `--accent`.

*Acceptance check*: nav matches treatment on all three pages; S-F3-markup checks
pass; `npm test` green.

**F4 — Hero**: two-column (portrait left ~360px, headline right); headline serif
at `--text-68` in `--fg`; an italic serif deck line under it in `--muted`; CTAs
are underlined text links with arrows in `--accent`.

*Acceptance check*: hero has name, one-liner, portrait, two CTAs; `npm test` green.

**F5 — Featured bento**: serif pull-quote intro line above the row; 3 tiles on
`--surface`, radius 2px, serif gold numerals `01`–`03`; hairline rules between
rows; hover = title underline draw (linear-gradient background-size 0 → 100%) +
background lifts to `--surface-2`. Grocery href EXACTLY `./grocery/`.

*Acceptance check*: exactly 3 `.tile--featured`; third `href="./grocery/"`; zero
`https://dashinja.github.io/grocery/`; `npm test` green.

**F6 — App gallery**: editorial index list — `ol.gallery__list` of
`li.gallery__row`: big light serif numeral, name (serif `--text-24`), category in
muted small caps, one-liner, arrow that fades in on hover; hairline
`border-top: 1px solid var(--border)` between rows; hover = row background tint +
underline draw. Portfolio groups rows by category with serif category headings +
status badges (`Live` for all 11; Tetris as a non-link row `Coming soon`).

*Acceptance check*: ≥ 11 linking rows; every `target="_blank"` carries
`rel="noopener noreferrer"`; Tetris row (if present) has no `href`; `npm test`
green.

**F7 — About strip**: strip on `--bg` with hairline rules; chips as outlined
pills (1px `--border`, `--fg` text; hover border `--accent`).

*Acceptance check*: ≥ 10 `.chip` items; `npm test` green.

**F8 — Footer**: `--bg` + hairline rule; year span per 1.4.

*Acceptance check*: no `fixed-bottom`; socials carry `rel="noopener noreferrer"`;
`npm test` green.

**F9 — navbar-toggle.js** **(shared, S-F9)**. *Acceptance check*: as S-F9.

**F10 — Breakpoints** **(shared, S-F10)** with deltas: gallery rows stack
vertically below 768px (numeral shrinks, arrow hidden), two-line rows at ≥768px;
the two-column hero collapses to portrait-on-top below 768px; site max-width
`--maxw-site: 1200px` centered. *Acceptance check*: as S-F10 plus both deltas
verified at 1440×900 and 390×844.

**F11 — A11y floor** **(shared, S-F11)**. Pairs (pre-checked): `--fg` on `--bg`
≈ 15.5:1; `--muted #9a9aa0` on `--bg` ≈ 6.8:1; `--accent #d4b483` on `--bg`
≈ 9.4:1; `--accent-fg` on `--accent` ≈ 8.5:1.

*Acceptance check*: as S-F11.

**F12 — Demo mock** **(shared, S-F12)** →
`~/code/homeApps/.atomic/redesign-evidence/variant-5/demo.html`.

---

#### Variant 6 — Phosphor (retro CRT terminal)

Grounded in: retro CRT terminal aesthetics. Signature: mono-first typography,
faint static scanline texture (reduced-motion safe — no flicker ever).

**F1 — Design tokens**:

```css
:root {
  --bg: #101410; --surface: #161c16; --surface-2: #1c241c;
  --fg: #d9e8d9; --muted: #8fa08f;
  --border: #243024; --border-strong: #3a4a3a;
  --accent: #4ade80; --accent-fg: #04170a;
  --scanline: rgba(0, 0, 0, 0.14);
  --font-mono: ui-monospace, 'JetBrains Mono', 'SF Mono', Menlo, monospace;
  --font-sans: var(--font-mono);
  --text-13: 0.8125rem; --text-16: 1rem; --text-20: 1.25rem; --text-25: 1.5625rem;
  --text-31: 1.9375rem;
  --space-1: 4px;  --space-2: 8px;  --space-3: 12px; --space-4: 16px;
  --space-6: 24px; --space-8: 32px; --space-12: 48px; --space-16: 64px; --space-24: 96px;
  --radius-tile: 4px; --radius-featured: 6px; --radius-chip: 999px;
  --duration: 120ms; --ease: linear;
}
```

*Acceptance check*: `npm test` green; canvas `#101410`; zero `prefers-color-scheme`.

**F2 — Base/reset** **(shared, S-F2)** with one delta — the STATIC scanline
texture, appended after the reset:

```css
body::before {
  content: "";
  position: fixed;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background: repeating-linear-gradient(0deg, transparent 0 2px, var(--scanline) 2px 4px);
}
```

STATIC — no flicker, no animation, ever; it must never animate even with
reduced-motion off. *Acceptance check*: as S-F2 plus: texture is visible, static,
and ignores pointer events.

**F3 — Nav**: sticky bar, `background: color-mix(in srgb, var(--bg) 90%,
transparent)` + `backdrop-filter: blur(8px)`, hairline bottom; brand prefixed
`$ ` in `--accent`; links mono 12px uppercase.

*Acceptance check*: nav matches treatment on all three pages; S-F3-markup checks
pass; `npm test` green.

**F4 — Hero**: terminal prompt: kicker line `~/byron-miller $ whoami` in
`--muted` mono; title at `--text-31` mono uppercase; tagline in `--muted`; CTAs
accent-filled + ghost; portrait bordered square (radius 4px, 1px `--border`,
`--accent` border on hover).

*Acceptance check*: hero has name, one-liner, portrait, two CTAs; `npm test` green.

**F5 — Featured bento**: tiles like A but squarer (radius 4/6px); mono index
`01`–`03`; hover = border brightens to `--border-strong` + background lifts to
`--surface-2` + arrow nudges. Grocery href EXACTLY `./grocery/`.

*Acceptance check*: exactly 3 `.tile--featured`; third `href="./grocery/"`; zero
`https://dashinja.github.io/grocery/`; `npm test` green.

**F6 — App gallery**: 1×1 mono tiles `04`–`11`; hover shows a `→` prefix on the
tile name instead of a nudging arrow (terminal affordance).

*Acceptance check*: ≥ 11 linking tiles; `target="_blank"` anchors all carry
`rel="noopener noreferrer"`; `npm test` green.

**F7 — About strip**: chips as `[MONGODB]`-style bracketed mono labels, 1px
`--border`, radius 999px.

*Acceptance check*: ≥ 10 `.chip` items; `npm test` green.

**F8 — Footer**: `--surface`, hairline top; copyright line in mono.

*Acceptance check*: no `fixed-bottom`; socials carry `rel="noopener noreferrer"`;
`npm test` green.

**F9 — navbar-toggle.js** **(shared, S-F9)**. *Acceptance check*: as S-F9.

**F10 — Breakpoints** **(shared, S-F10)** — no deltas (mono type is wide; verify
the title fits at 320px). *Acceptance check*: as S-F10.

**F11 — A11y floor** **(shared, S-F11)**. Pairs (pre-checked, measured WITH the
scanline overlay on): `--fg` on `--bg` ≈ 14:1; `--muted #8fa08f` on `--bg`
≈ 5.6:1; `--accent #4ade80` on `--bg` ≈ 10:1; `--accent-fg` on `--accent` ≈ 12:1;
the overlay must not push any pair below 4.5:1.

*Acceptance check*: as S-F11.

**F12 — Demo mock** **(shared, S-F12)** →
`~/code/homeApps/.atomic/redesign-evidence/variant-6/demo.html` (scanlines are a
CSS gradient — no external image).

---

#### Variant 7 — Dusk Bento (M3 dark; rework of rejected C, dark-only)

Grounded in: Material 3 dark scheme — the dark half of the rejected C, promoted
to the ONLY theme, with a violet primary and desaturated category colors.

**F1 — Design tokens**:

```css
:root {
  --bg: #131417;
  --surface: #1a1c21;
  --surface-container: #22242b;
  --surface-container-high: #2b2e36;
  --on-surface: #e4e6eb; --on-surface-variant: #a2a6b0;
  --outline: #3f424a; --outline-strong: #5b5f6a;
  --primary: #b6a6ff; --on-primary: #241653; --primary-container: #3a2e6e;
  --cat-apps: #a5b4ff; --cat-games: #ffb3ab; --cat-ai: #d8baff;
  --cat-cli: #7cd6cb; --cat-tools: #ffd166;
  --font-sans: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Inter, sans-serif;
  --type-display: 3.5625rem; --type-headline: 1.75rem; --type-title-lg: 1.375rem;
  --type-body: 1rem; --type-label: 0.875rem;
  --radius-tile: 16px; --radius-featured: 24px; --radius-chip: 999px;
  --duration: 200ms; --ease: ease-out;
}
```

Differences from rejected C: NO `@media (prefers-color-scheme: dark)` block (dark
is the only theme), fixed type steps instead of `clamp()`, primary re-tuned to
violet for the dusk mood, category colors desaturated and dark-tuned (hard rule
2), elevation strictly tonal via the `--surface-container` steps.

*Acceptance check*: `npm test` green; canvas `#131417`; zero `prefers-color-scheme`.

**F2 — Base/reset** **(shared, S-F2)** — no deltas. *Acceptance check*: as S-F2.

**F3 — Nav**: `background: var(--surface)`; active link gets a **pill** state
(`background: var(--primary-container); border-radius: var(--radius-chip);
padding: var(--space-1) var(--space-2); color: var(--on-surface)`).

*Acceptance check*: nav matches treatment on all three pages; S-F3-markup checks
pass; `npm test` green.

**F4 — Hero**: hero as a large `--radius-featured` `--surface-container` card;
title at `--type-display`; portrait rounded; CTAs filled (`--primary` bg /
`--on-primary` text) + tonal (`--primary-container` bg / `--on-surface` text).

*Acceptance check*: hero has name, one-liner, portrait, two CTAs; `npm test` green.

**F5 — Featured bento**: featured tiles span 2×2, `--surface-container` bg,
radius 24; category color dot (`.tile__dot`) + chip on every tile. Grocery href
EXACTLY `./grocery/`.

*Acceptance check*: exactly 3 `.tile--featured`; third `href="./grocery/"`; zero
`https://dashinja.github.io/grocery/`; `npm test` green.

**F6 — App gallery**: true bento with varied spans (featured 2×2; others 1×1 or
2×1); each tile `--surface-container` with category dot + chip; portfolio groups
tiles under category headings with status badges. Tetris optional non-link tile.

*Acceptance check*: ≥ 11 linking tiles; `target="_blank"` anchors all carry
`rel="noopener noreferrer"`; `npm test` green.

**F7 — About strip**: strip as a `--surface-container` rounded (16px) band;
chips `--primary-container` bg / `--on-surface` text.

*Acceptance check*: ≥ 10 `.chip` items; `npm test` green.

**F8 — Footer**: `--surface-container` background; year span per 1.4.

*Acceptance check*: no `fixed-bottom`; socials carry `rel="noopener noreferrer"`;
`npm test` green.

**F9 — navbar-toggle.js** **(shared, S-F9)**. *Acceptance check*: as S-F9.

**F10 — Breakpoints** **(shared, S-F10)** with deltas: bento spans collapse per
the shared skeleton (featured full-width below 1024px); content max-width 1200px.
*Acceptance check*: as S-F10.

**F11 — A11y floor** **(shared, S-F11)**. Pairs (pre-checked): `--on-surface-variant`
on `--surface` ≈ 6:1; `--primary #b6a6ff` on `--surface` ≈ 8:1; `--on-primary` on
`--primary` ≥ 4.5:1; each `--cat-*` color on `--surface-container` ≥ 4.5:1
(re-verify with a contrast calculator if any value is adjusted).

*Acceptance check*: as S-F11.

**F12 — Demo mock** **(shared, S-F12)** →
`~/code/homeApps/.atomic/redesign-evidence/variant-7/demo.html`.

---

#### Variant 8 — Ember (warm-dark / low-blue)

Grounded in: warm-dark / low-blue night themes. Signature: warm charcoal, cozy
night reading; no cool-blue grays anywhere.

**F1 — Design tokens**:

```css
:root {
  --bg: #16130f; --surface: #1e1a15; --surface-2: #262019;
  --fg: #ece7de; --muted: #a89f92;
  --border: #2e2a23; --border-strong: #4a4438;
  --accent: #f59e0b; --accent-fg: #1d1201;
  --accent-soft: #2b2013;
  --font-sans: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Inter, sans-serif;
  --font-mono: ui-monospace, 'JetBrains Mono', 'SF Mono', Menlo, monospace;
  --text-13: 0.8125rem; --text-16: 1rem; --text-20: 1.25rem; --text-25: 1.5625rem;
  --text-31: 1.9375rem; --text-39: 2.4375rem; --text-49: 3.0625rem;
  --space-1: 4px;  --space-2: 8px;  --space-3: 12px; --space-4: 16px;
  --space-6: 24px; --space-8: 32px; --space-12: 48px; --space-16: 64px; --space-24: 96px;
  --radius-tile: 10px; --radius-featured: 14px; --radius-chip: 999px;
  --duration: 180ms; --ease: ease-out;
}
```

*Acceptance check*: `npm test` green; canvas `#16130f`; zero `prefers-color-scheme`.

**F2 — Base/reset** **(shared, S-F2)** — no deltas. *Acceptance check*: as S-F2.

**F3 — Nav**: sticky; `background: color-mix(in srgb, var(--bg) 85%, transparent)`
+ `backdrop-filter: blur(8px)`; hairline bottom; links sans 14px in warm tones;
active link `--accent` ember.

*Acceptance check*: nav matches treatment on all three pages; S-F3-markup checks
pass; `npm test` green.

**F4 — Hero**: left-aligned, cozy: title at `--text-39`; tagline in `--muted`;
portrait in a warm frame (1px `--border`, radius 14px, 1px `--accent-soft` inner
ring); CTAs ember-filled (`--accent`/`--accent-fg`) + ghost; hover tints use
warm `--accent-soft` — never cool blue.

*Acceptance check*: hero has name, one-liner, portrait, two CTAs; `npm test` green.

**F5 — Featured bento**: tiles on `--surface`, radius 14; mono index `01`–`03`;
hover = border brightens to `--border-strong` + lift to `--surface-2` + arrow
nudges. Grocery href EXACTLY `./grocery/`.

*Acceptance check*: exactly 3 `.tile--featured`; third `href="./grocery/"`; zero
`https://dashinja.github.io/grocery/`; `npm test` green.

**F6 — App gallery**: 1×1 tiles `04`–`11`, same hover; chips `--accent-soft` bg /
`--accent` text.

*Acceptance check*: ≥ 11 linking tiles; `target="_blank"` anchors all carry
`rel="noopener noreferrer"`; `npm test` green.

**F7 — About strip**: strip on `--surface` with hairlines; chips
`--accent-soft`/`--accent` pills.

*Acceptance check*: ≥ 10 `.chip` items; `npm test` green.

**F8 — Footer**: `--surface` + hairline top.

*Acceptance check*: no `fixed-bottom`; socials carry `rel="noopener noreferrer"`;
`npm test` green.

**F9 — navbar-toggle.js** **(shared, S-F9)**. *Acceptance check*: as S-F9.

**F10 — Breakpoints** **(shared, S-F10)** — no deltas. *Acceptance check*: as S-F10.

**F11 — A11y floor** **(shared, S-F11)**. Pairs (pre-checked): `--fg` on `--bg`
≈ 14.5:1; `--muted #a89f92` on `--bg` ≈ 6.5:1; `--accent #f59e0b` on `--bg`
≈ 9.7:1; `--accent-fg` on `--accent` ≈ 10.5:1; `--accent` text on `--accent-soft`
≥ 4.5:1.

*Acceptance check*: as S-F11.

**F12 — Demo mock** **(shared, S-F12)** →
`~/code/homeApps/.atomic/redesign-evidence/variant-8/demo.html`.

---

### 2.5 Variant 1 (Terminal Noir) — already built

Candidate A is BUILT on its branch (issue #20) and implements Parts 0, 1, and the
shared functions above with its own tokens. It is NOT re-specified here; treat it
as the structural reference when a variant's step above says "like A".

---

## Part 3 — Rollout mechanics

### 3.1 Worktrees and branches

```bash
cd ~/code/homeApps/dashinja.github.io
git branch design/variant-2 master   # repeat for variant-3 … variant-8
git worktree add ~/code/dashinja-redesign-worktrees/variant-2 design/variant-2
# (spec branch/worktree already exists: design/redesign-spec at ~/code/dashinja-redesign-worktrees/spec)
ln -s ~/code/homeApps/dashinja.github.io/node_modules \
      ~/code/dashinja-redesign-worktrees/variant-2/node_modules
```

The spec itself lives at `redesign/REDESIGN-SPEC.md` on branch
`design/redesign-spec` in `~/code/dashinja-redesign-worktrees/spec`
(`docs/` is gitignored — only `redesign/` is tracked for docs).

### 3.2 Commit and push steps (per variant)
1. Work ONLY inside the variant worktree; `git status` must show no stray edits
   outside `index.html`, `portfolio.html`, `contact.html`, `assets/css/**`,
   `assets/js/navbar-toggle.js`.
2. Commit with message `Redesign variant N — <name> (proposal, do not merge)` plus
   trailers:
   - `Assistant-workflow: <workflow name> (run <runId>)` or `Assistant-workflow: inline`
   - `Assistant-duration: <elapsed> <converged|blocked|abandoned>, estimated <estimate>`
   - `Assistant-verification: vitest static-site passed: npm test` (plus one line per
     screenshot/demo check actually run)
   - `Co-authored-by: Byron Miller <email from git config user.email>`
3. `git push -u origin design/variant-N`

### 3.3 npm test gate

Run in the worktree (node_modules symlinked): `npm test` → `vitest run`. ALL 8 test
blocks must pass. The gate runs (a) after every Part-2 function, (b) before
screenshots, (c) before issue/PR creation. A red gate blocks everything downstream.

### 3.4 Screenshot capture procedure

Tool: agent-browser against a local server.

```bash
cd ~/code/dashinja-redesign-worktrees/variant-N
python3 -m http.server 8080 &
# agent-browser: navigate to http://localhost:8080/index.html and /portfolio.html
# viewports: desktop 1440×900, mobile 390×844; capture FULL PAGE
```

Outputs to `~/code/homeApps/.atomic/redesign-evidence/variant-N/`:
- `after-home-desktop.png`, `after-home-mobile.png`,
  `after-portfolio-desktop.png`, `after-portfolio-mobile.png`
- Each must be > 20 KB. (Before-shots `before/before-{home,portfolio}-{desktop,mobile}.png`
  already exist in the same evidence root, captured on master.)
- Stop the http.server afterwards. Never screenshot or link `https://dashinja.github.io/grocery/`.

### 3.5 demo.html check (before issues)

`demo.html` exists at the evidence path; zero `http` URLs outside comments; all
anchors `href="#"`; interactions work per F12.

### 3.6 Issue authoring (gh ≥ 2.102.0, repeatable `--attach`)

Repo: `dashinja/dashinja.github.io`. One issue per variant, all as PROPOSALS:
1. **Master tracking issue** — "Redesign dashinja.github.io: modern app-hub —
   dark-only program, 8 variants (no merges)". Body: goal, the 2026-10-27 ruling
   (B and C rejected), before montage (`--attach before-home-desktop.png --attach
   before-portfolio-desktop.png`), links to the variant issues + spec PR + variant
   PRs, explicit "all proposals, nothing merged, awaiting review".
2–8. **Variant issues (one per variant 2–8)** — concept summary, token table,
   4 before + 4 after screenshots attached, demo.html attached, comparison table
   row, link to its PR. (Candidate A / variant 1 already filed: issue #20.)
Body trailers: `Assistant-workflow:`, `Assistant-duration:`,
`Assistant-verification:` lines. NEVER use `Closes` in any body.

### 3.7 PR authoring

- One PR per variant branch → `master`, title
  `Redesign variant N — <name> (proposal, do not merge)`.
- Body: linked issue reference (no `Closes` — "decision pending"), evidence summary
  with screenshots named next to the scenario they prove, verification lines
  (vitest, screenshots, demo check), `Assistant-workflow:` / `Assistant-duration:` /
  `Assistant-verification:` trailers, and `User-preference: user wants candidates
  reviewed before any merge`.
- Spec PR from `design/redesign-spec` → `master` (docs only).
- **NEVER-MERGE RULE: no PR is merged. No issue is closed via `Closes`. Every
  variant PR and the spec PR stay open as proposals awaiting human review.**

---

## Part 4 — Verification checklist (test contract → reviewer location)

| # | Test contract item (tests/static-site.test.ts) | Where the reviewer looks |
|---|------------------------------------------------|--------------------------|
| 1 | `index.html`/`portfolio.html`/`contact.html` each contain `https://dashinja.github.io/auntieKimDates/` | Featured tile #1 href + nav "Auntie Kim Dates" link on all three pages |
| 2 | No `https://dashinja.github.io/grocery/` in any of the three pages | Grocery tile/row uses `./grocery/` (index featured, portfolio gallery) |
| 3 | No `BKocery` string anywhere in the three pages | grep all three pages; also check alt text and comments |
| 4 | `grocery/index.html` keeps refresh+canonical to `bk_grocery`, no `/grocery/assets/` | File untouched — `git diff master -- grocery/` must be EMPTY |
| 5 | No `data-theme-toggle`, `data-target="#siteHelpModal"`, `id="siteHelpModal"`, `How this site works` | Nav and footer markup on all three pages; no variant ships a theme toggle — dark-only stylesheets |
| 6 | Every `target="_blank"` anchor has `rel="noopener noreferrer"` in ALL sourceFiles (3 html + 3 untouched Next files) | Social links (nav+footer) and app tiles on all pages; `git diff master -- src/ portfolio-next/` EMPTY |
| 7 | Exact tag `<script src="./assets/js/navbar-toggle.js"></script>` present | Last line inside `<body>` of each of the three pages |
| 8 | No `<script src="https://...">`, `jquery`, `popper`, `bootstrap.min.js` | Head of each page: no CDN script tags; grep each forbidden string |
| 9 | `name="referrer" content="strict-origin-when-cross-origin"` present | Head meta #3 of each page (Part 1.6 skeleton) |
| 10 | CSP meta with `object-src 'none'` and `base-uri 'self'` | Head meta #4 of each page (Part 1.6 skeleton) |
| 11 | `assets/documents/` contains exactly the one resume docx, no `/obsolete/`, no `:` filenames | `git diff master -- assets/documents/` EMPTY; `ls assets/documents` → 1 file |
| 12 | Every external `<img src="https://...">` in portfolio.html has `referrerpolicy="no-referrer"` | Portfolio gallery: preferred outcome is zero external images; if the Giphy GIF is kept, the attribute is on the `<img>` tag and `https://media0.giphy.com` is in the CSP `img-src` |

Final reviewer pass per variant: `npm test` green in the worktree, 4 after-
screenshots > 20 KB present, demo.html passes F12 checks, commit present on the
pushed branch, PR open and UNMERGED.
