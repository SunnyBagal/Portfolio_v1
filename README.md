<div align="center">
  <img alt="SB" src="src/images/logo.png" width="88" />
</div>

<h1 align="center">Sunny Bagal — Personal Portfolio</h1>

<p align="center">
  A dark, gold-accented portfolio for a backend developer — built with Gatsby,
  styled-components, and a handful of hand-built interactions.
</p>

---

## About

This is my personal site. I'm a backend developer from Navi Mumbai who likes the
hard parts under the surface — concurrency, sync engines, queues, and data models
that stay correct when many things happen at once. The site is a static Gatsby
build: content lives in Markdown, everything renders at build time, and the whole
thing is a single warm-charcoal + gold theme driven entirely by CSS custom
properties.

It started life as an open-source Gatsby portfolio scaffold and has since been
rewritten top to bottom — theme, type, copy, structure, and every interaction
below.

## Highlights

A few things I built into it rather than pulling off a shelf:

- **Single-token gold theme** — every colour flows from CSS custom properties in
  `src/styles/variables.js`, so the palette is one place to change.
- **Terminal wordmark logo** — collapses to `SB_` and expands to `Sunny Bagal_`
  on hover, with a blinking caret.
- **Counter loader** — a `00 → 100` count-up that slides away to reveal the hero.
- **Split-flap contact board** — a Vestaboard-style flip board (ported to
  `framer-motion`) that cycles through messages when the section scrolls in.
- **Ambient detail** — a static film-grain overlay, a custom dot-and-ring cursor,
  a scroll-progress bar, section-underline draw-ins, and a hand-drawn (Rough.js)
  tech-stack backdrop behind the About section.
- **Motion that behaves** — everything above respects `prefers-reduced-motion`
  and renders in its final state when motion is reduced.

## Tech

- **Framework:** [Gatsby](https://www.gatsbyjs.com/) (React 17, static generation)
- **Styling:** [styled-components](https://styled-components.com/) (primary),
  [Tailwind CSS](https://tailwindcss.com/) for a few utilities (prefixed, no preflight)
- **Motion:** [framer-motion](https://www.framer.com/motion/), plus [Rough.js](https://roughjs.com/)
- **Content:** Markdown + GraphQL via `gatsby-transformer-remark`
- **Type:** Space Grotesk + JetBrains Mono, self-hosted via `@fontsource`

## Getting started

Requires **Node 18** (there's an `.nvmrc`).

```sh
nvm use          # or: nvm install
npm install
npm start        # dev server with hot reload → http://localhost:8000
```

### Other commands

```sh
npm run build    # production build
npm run serve    # preview the production build locally
npm run clean    # clear Gatsby's cache and public/ dir
npm run format   # Prettier over JS/JSON/MD
```

## Project layout

```
content/                  Markdown content (featured/, projects/, jobs/, posts/)
src/
  components/
    sections/             Hero, About, Jobs, Featured, Projects, Contact
    ui/                   cursor, film-grain, scroll-fx, dot-background,
                          tech-stack-icons, text-flipping-board
    icons/                svg icon set + the terminal wordmark logo
  styles/                 variables (theme tokens), mixins, GlobalStyle, fonts
  config.js               social links, nav, and the TECH_ICONS backdrop toggle
gatsby-config.js          plugins + site metadata
gatsby-node.js            builds blog/tag pages, webpack aliases
```

## Editing content

Projects, jobs, and posts are Markdown files under `content/` with frontmatter —
add or edit a file in the right subfolder and it shows up on the next build.
The curated "other things I've built" cards live directly in
`src/components/sections/projects.js`.

## Credits

The initial Gatsby scaffold was adapted from an open-source portfolio starter
([source](https://github.com/bchiang7/v4)); it's since diverged significantly.
Design lineage is credited in the site footer.
