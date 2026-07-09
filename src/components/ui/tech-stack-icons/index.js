import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import rough from 'roughjs';
import { TECH_ICONS } from '@config';
import { usePrefersReducedMotion } from '@hooks';
import TECH_ICON_DATA from './icon-data';

// ─── Rough.js tuning ──────────────────────────────────────────────────────────
// Nudge these to taste. Goal is CRISP + RECOGNIZABLE, not chaotic scribble:
// a single clean outline pass, no fill, gentle bow. `seed` is fixed so every
// build/render produces the identical stroke (deterministic + cache-friendly).
const ROUGH_OPTIONS = {
  roughness: 0.7,
  bowing: 0.6,
  strokeWidth: 1.5, // rendered at a constant 1.5 CSS px via non-scaling-stroke
  disableMultiStroke: true, // one clean pass, not a hairy double stroke
  stroke: 'currentColor', // tinted by the accent var on the layer (see below)
  fill: 'none', // outline only
  seed: 42,
};

// ─── Layer appearance ─────────────────────────────────────────────────────────
const ACCENT = 'var(--green)'; // monochrome accent tint for the whole layer
const LAYER_OPACITY = 0.11; // within the requested 0.08–0.14 band

// ─── Placement ────────────────────────────────────────────────────────────────
// Each icon hugs the OUTSIDE of the centered ~1000px content column, so it can
// never overlap the body text at any viewport width:
//   side  : which margin (left | right)
//   gap   : px out from the column edge (half-column = 500px) toward the screen
//   top   : vertical position in vh from the top of the page (hero starts at 0)
//   size  : rendered icon box in px
// Add/remove/re-order freely — this is just data. `slug` maps into icon-data.js.
// NOTE: 'express' is intentionally not placed here — its Simple Icons path uses
// compact arc-flag notation that Rough.js can't parse cleanly, so it would fall
// back to a crisp (non-sketch) logo. It stays in icon-data.js/logos for 'clean'
// mode; just add a line below if you want it in the layer anyway (it will render
// crisp via the automatic fallback rather than as a scribble).
const PLACEMENTS = [
  { slug: 'python', side: 'left', gap: 24, top: 16, size: 88 },
  { slug: 'react', side: 'right', gap: 20, top: 22, size: 92 },
  { slug: 'nextdotjs', side: 'right', gap: 180, top: 46, size: 54 },
  { slug: 'nodedotjs', side: 'left', gap: 150, top: 62, size: 64 },
  { slug: 'typescript', side: 'right', gap: 44, top: 78, size: 60 },
  { slug: 'redis', side: 'left', gap: 40, top: 112, size: 70 },
  { slug: 'javascript', side: 'right', gap: 28, top: 150, size: 72 },
  { slug: 'tailwindcss', side: 'left', gap: 70, top: 152, size: 76 },
];

const ICONS_BY_SLUG = TECH_ICON_DATA.reduce((acc, icon) => {
  acc[icon.slug] = icon;
  return acc;
}, {});

// ─── Rough markup cache ─────────────────────────────────────────────────────
// Roughen each icon's path(s) EXACTLY ONCE, keyed by slug, and stash the
// resulting <path> markup. Instances reuse the cached string; animation frames
// never re-roughen (that would jitter). Runs client-side only (needs the DOM).
const roughMarkupCache = new Map();

const getRoughMarkup = icon => {
  if (roughMarkupCache.has(icon.slug)) {
    return roughMarkupCache.get(icon.slug);
  }
  if (typeof document === 'undefined') {
    return ''; // SSR — don't cache; the client will build it on mount
  }
  let markup = null;
  try {
    const svgNode = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const rc = rough.svg(svgNode);
    icon.paths.forEach(d => svgNode.appendChild(rc.path(d, ROUGH_OPTIONS)));
    markup = svgNode.innerHTML || null;
  } catch (err) {
    // Some SVG paths (e.g. compact arc-flag notation) can't be roughened.
    // Never crash and never show a scribble — signal a clean fallback instead.
    if (typeof console !== 'undefined') {
      // eslint-disable-next-line no-console
      console.warn(
        `[tech-icons] "${icon.slug}" could not be sketched; using clean logo.`,
        err.message,
      );
    }
    markup = null;
  }
  roughMarkupCache.set(icon.slug, markup); // cache null too, so we don't retry
  return markup;
};

// ─── Single icon ──────────────────────────────────────────────────────────────
const TechIcon = ({ icon, style }) => {
  const ref = useRef(null);
  const [sketchFailed, setSketchFailed] = useState(false);

  useEffect(() => {
    if (style !== 'sketch' || !ref.current) {
      return;
    }
    const markup = getRoughMarkup(icon);
    if (markup) {
      ref.current.innerHTML = markup;
    } else if (typeof document !== 'undefined') {
      setSketchFailed(true); // rough couldn't parse it → fall back to clean logo
    }
  }, [icon, style]);

  // 'clean' (or a sketch that couldn't be roughened) → crisp stock logo,
  // filled with the accent (monochrome).
  if (style === 'clean' || sketchFailed) {
    return (
      <svg viewBox={icon.viewBox} aria-hidden="true" focusable="false">
        {icon.paths.map((d, i) => (
          <path key={i} d={d} fill="currentColor" />
        ))}
      </svg>
    );
  }

  // 'sketch' → Rough.js outline injected on mount (cached, generated once).
  return <svg ref={ref} viewBox={icon.viewBox} aria-hidden="true" focusable="false" />;
};

TechIcon.propTypes = {
  icon: PropTypes.shape({
    slug: PropTypes.string.isRequired,
    name: PropTypes.string,
    viewBox: PropTypes.string.isRequired,
    paths: PropTypes.arrayOf(PropTypes.string).isRequired,
  }).isRequired,
  style: PropTypes.oneOf(['sketch', 'clean']).isRequired,
};

// ─── Styled layer ─────────────────────────────────────────────────────────────
const StyledIconLayer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 200vh; /* covers hero + about band; icons never render past this */
  z-index: -1; /* behind all content */
  pointer-events: none;
  color: ${ACCENT};
  opacity: ${LAYER_OPACITY};
  overflow: hidden;
  will-change: transform;
  transition: transform 0.4s var(--easing);

  /* Side margins collapse below tablet — hide entirely so the layer can never
     sit under body text on small screens. No layout impact (position:absolute). */
  @media (max-width: 768px) {
    display: none;
  }

  .tech-icon {
    position: absolute;
    display: block;

    svg {
      width: 100%;
      height: 100%;
      overflow: visible;
    }

    /* Keep the hand-drawn stroke a crisp constant width at any icon size / DPR. */
    svg path {
      vector-effect: non-scaling-stroke;
    }
  }

  /* Slow vertical drift — transform + opacity only (no re-roughening, no spin). */
  @keyframes techIconDrift {
    0%,
    100% {
      transform: translate3d(0, 0, 0);
    }
    50% {
      transform: translate3d(0, -10px, 0);
    }
  }

  &[data-animate='true'] .tech-icon {
    animation: techIconDrift var(--drift-dur, 9s) var(--easing) infinite;
    animation-delay: var(--drift-delay, 0s);
  }
`;

// ─── Layer ────────────────────────────────────────────────────────────────────
const TechStackIcons = () => {
  const layerRef = useRef(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  // enabled: false → render nothing at all (no layout shift, clean site).
  const active = TECH_ICONS && TECH_ICONS.enabled;
  const style = TECH_ICONS && TECH_ICONS.style === 'clean' ? 'clean' : 'sketch';

  // Light mouse parallax on the whole layer — transform only. Frozen under
  // prefers-reduced-motion (static layer, no drift + no parallax).
  useEffect(() => {
    if (!active || prefersReducedMotion) {
      return undefined;
    }
    let frame = null;
    const onMove = e => {
      if (frame) {
        return;
      }
      frame = requestAnimationFrame(() => {
        frame = null;
        const x = (e.clientX / window.innerWidth - 0.5) * 14;
        const y = (e.clientY / window.innerHeight - 0.5) * 14;
        if (layerRef.current) {
          layerRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        }
      });
    };
    window.addEventListener('mousemove', onMove);
    return () => {
      window.removeEventListener('mousemove', onMove);
      if (frame) {
        cancelAnimationFrame(frame);
      }
    };
  }, [active, prefersReducedMotion]);

  if (!active) {
    return null;
  }

  return (
    <StyledIconLayer
      ref={layerRef}
      data-animate={(!prefersReducedMotion).toString()}
      aria-hidden="true">
      {PLACEMENTS.map((p, i) => {
        const icon = ICONS_BY_SLUG[p.slug];
        if (!icon) {
          return null;
        }
        // Anchor to the outside edge of the centered 1000px column.
        const edge = p.side === 'left' ? 'right' : 'left';
        return (
          <span
            key={`${p.slug}-${i}`}
            className="tech-icon"
            style={{
              top: `${p.top}vh`,
              [edge]: `calc(50% + 500px + ${p.gap}px)`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              // Stagger drift so icons don't pulse in unison.
              '--drift-dur': `${8 + (i % 4) * 1.5}s`,
              '--drift-delay': `${(i % 5) * 0.7}s`,
            }}>
            <TechIcon icon={icon} style={style} />
          </span>
        );
      })}
    </StyledIconLayer>
  );
};

export default TechStackIcons;
