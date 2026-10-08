# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # Start development server (hot reload)
npm run build      # Production build
npm run serve      # Preview production build locally
npm run clean      # Clear Gatsby cache and public directory
npm run format     # Format code with Prettier (JS, JSON, MD)
```

Use `npm` or `yarn` — Husky pre-commit hooks automatically run Prettier and ESLint on staged files.

## Architecture

**Gatsby static site** — personal portfolio for Sunny Bagal. Pages are statically generated at build time from React components and Markdown content.

### Data Flow

- **Content** lives in `content/` as Markdown with frontmatter (`jobs/`, `projects/`, `featured/`, `posts/`)
- **GraphQL** (Gatsby's data layer) queries Markdown via `gatsby-transformer-remark`
- **gatsby-node.js** dynamically creates blog post and tag pages from Markdown slugs/tags
- **gatsby-config.js** configures all plugins and site metadata
- **src/config.js** centralizes site-wide settings: social links, nav links, colors, email

### Styling System

All styling uses **styled-components** (no external CSS files):

- `src/styles/variables.js` — CSS custom properties (colors, font sizes, transitions, z-indices)
- `src/styles/theme.js` — breakpoints and media query mixins (mobile-first)
- `src/styles/mixins.js` — reusable styled-component mixins (`flexCenter`, button styles, etc.)
- `src/styles/GlobalStyle.js` — global CSS reset and base styles

Reference the existing variables and mixins rather than hardcoding values.

### Component Structure

- `src/components/layout.js` — root wrapper (head metadata, nav, loader, footer)
- `src/components/sections/` — page sections rendered in order: Hero → About → Jobs → Featured → Projects → Contact
- `src/components/index.js` — barrel export for all components
- `src/hooks/` — custom hooks: `useScrollDirection`, `usePrefersReducedMotion`, `useOnClickOutside`

Webpack aliases are configured in `gatsby-node.js`: use `@components`, `@styles`, `@hooks`, `@utils`, `@config`, `@fonts`, `@images` for imports.

### Animations & Accessibility

- **ScrollReveal** handles scroll-based entrance animations
- **usePrefersReducedMotion()** hook must be checked before running animations — always respect `prefers-reduced-motion`
- **React Transition Group** handles mount/unmount CSS transitions
- `src/styles/TransitionStyles.js` defines the named CSS transition classes

### Content Authoring

Add/edit content by creating Markdown files in the appropriate `content/` subdirectory. Each content type has its own frontmatter schema — reference existing files as templates.
