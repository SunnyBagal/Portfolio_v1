/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/components/sections/hero.js', './src/components/ui/**/*.{js,jsx}'],
  // Prefix all Tailwind classes to avoid collisions with existing styled-components
  // e.g. use "tw-flex" instead of "flex"
  prefix: 'tw-',
  corePlugins: {
    // CRITICAL: disable preflight so Tailwind's CSS reset doesn't
    // override the existing GlobalStyle.js base styles
    preflight: false,
  },
  theme: {
    extend: {},
  },
  plugins: [],
};
