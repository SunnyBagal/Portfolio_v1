import { css } from 'styled-components';

const variables = css`
  :root {
    /* ── Non-color design tokens (theme-independent) ── */
    --font-sans: 'Space Grotesk', -apple-system, system-ui, sans-serif;
    --font-mono: 'JetBrains Mono', 'Fira Code', 'Fira Mono', 'Roboto Mono', monospace;

    --fz-xxs: 12px;
    --fz-xs: 13px;
    --fz-sm: 14px;
    --fz-md: 16px;
    --fz-lg: 18px;
    --fz-xl: 20px;
    --fz-xxl: 22px;
    --fz-heading: 32px;

    --border-radius: 4px;
    --nav-height: 100px;
    --nav-scroll-height: 70px;

    --tab-height: 42px;
    --tab-width: 120px;

    --easing: cubic-bezier(0.645, 0.045, 0.355, 1);
    --transition: all 0.25s cubic-bezier(0.645, 0.045, 0.355, 1);

    --hamburger-width: 30px;

    --ham-before: top 0.1s ease-in 0.25s, opacity 0.1s ease-in;
    --ham-before-active: top 0.1s ease-out, opacity 0.1s ease-out 0.12s;
    --ham-after: bottom 0.1s ease-in 0.25s, transform 0.22s cubic-bezier(0.55, 0.055, 0.675, 0.19);
    --ham-after-active: bottom 0.1s ease-out,
      transform 0.22s cubic-bezier(0.215, 0.61, 0.355, 1) 0.12s;

    --navy-shadow: rgba(10, 8, 5, 0.7);
    --pink: #f57dff;
    --blue: #57cbff;

    /* ── Palette (gold) ── */
    --bg-darkest: #0a0906;
    --bg: #100e0a;
    --surface: #1b1710;
    --border: #2e2719;
    --accent: #ffc44d;
    --accent-tint: rgba(255, 196, 77, 0.1);
    --heading: #f8f4e9;
    --text-strong: #d6cdb8;
    --text: #a69d88;
    --muted: #736b5b;
    --white: #fffdf6;
    --dot: #4a4230;

    /* ── Legacy variable names → semantic tokens ──
       The whole app reads these older names; aliasing them keeps every
       component wired to the palette above. */
    --dark-navy: var(--bg-darkest);
    --navy: var(--bg);
    --light-navy: var(--surface);
    --lightest-navy: var(--border);
    --green: var(--accent);
    --green-tint: var(--accent-tint);
    --lightest-slate: var(--heading);
    --light-slate: var(--text-strong);
    --slate: var(--text);
    --dark-slate: var(--muted);
  }
`;

export default variables;
