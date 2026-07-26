import { css } from 'styled-components';

// Webfonts are now self-hosted via @fontsource and imported in gatsby-browser.js
// (Space Grotesk + JetBrains Mono). No manual @font-face declarations are needed
// here anymore; this export is kept so GlobalStyle's `${fonts}` interpolation and
// the @fonts asset pipeline stay intact. To add another self-hosted family, add
// the corresponding `@fontsource/*` import in gatsby-browser.js.
const Fonts = css``;

export default Fonts;
