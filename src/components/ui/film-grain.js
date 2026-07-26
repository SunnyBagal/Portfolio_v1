import styled from 'styled-components';

// Static film-grain overlay. Fixed, non-interactive, sits above the page
// background but below content (content wrapper is raised to z-index 2). The
// noise is an inline SVG feTurbulence data-URI — no network request, no
// animation. Subtle by design: opacity 0.035, blended with `overlay`.
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

const FilmGrain = styled.div.attrs({ 'aria-hidden': 'true' })`
  position: fixed;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  opacity: 0.035;
  mix-blend-mode: overlay;
  background-image: ${GRAIN};
  background-repeat: repeat;
`;

export default FilmGrain;
