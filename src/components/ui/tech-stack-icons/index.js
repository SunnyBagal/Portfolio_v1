import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import rough from 'roughjs';
import { TECH_ICONS } from '@config';
import { usePrefersReducedMotion } from '@hooks';
import TECH_ICON_DATA from './icon-data';

// ─── Rough.js tuning ──────────────────────────────────────────────────────────
// Nudge these to taste. Goal is CRISP + RECOGNIZABLE, not chaotic scribble:
// low wobble, single clean pass, outline only. `fill` is deliberately OMITTED —
// any fill value (even 'none') asks Rough for fill geometry; omitting the key is
// how you get pure stroke output. `seed` is fixed so every render produces the
// identical stroke (deterministic + cache-friendly).
const ROUGH_OPTIONS = {
  roughness: 0.6,
  bowing: 0.5,
  strokeWidth: 1.4, // constant 1.4 CSS px at any size via non-scaling-stroke
  disableMultiStroke: true, // one clean pass, not a hairy double stroke
  stroke: 'currentColor', // tinted by the accent var on the layer (see below)
  seed: 42,
};

// ─── Layer appearance ─────────────────────────────────────────────────────────
const ACCENT = 'var(--green)'; // monochrome accent tint for the whole layer
const LAYER_OPACITY = 0.11; // within the requested 0.08–0.14 band

// ─── Placement ────────────────────────────────────────────────────────────────
// The layer mounts INSIDE the About section (position: relative), so icons are
// anchored to the OUTSIDE of the section's own box: `calc(100% + gap)` puts them
// in the empty desktop gutters flanking the 900px content column. Overlap with
// the About text/photo is geometrically impossible — they live inside that box.
//   side : which gutter (left | right)
//   gap  : px between the section edge and the icon's near edge
//   top  : vertical position, % of section height
//   size : rendered icon box in px
// Keep gap + size ≲ 150 so nothing clips at 1200px viewports.
// Add/remove/re-order freely — this is just data. `slug` maps into icon-data.js.
// Icons flagged `forceClean` in icon-data.js (redis, express) render as crisp
// clean logos even in sketch mode — a curated mix beats a uniform scribble.
// 'express' is unplaced by default; add a line below to include it (it will
// render clean, never a scribble).
const PLACEMENTS = [
  { slug: 'python', side: 'left', gap: 28, top: 4, size: 64 },
  { slug: 'javascript', side: 'right', gap: 34, top: 6, size: 56 },
  { slug: 'redis', side: 'left', gap: 76, top: 30, size: 56 },
  { slug: 'react', side: 'right', gap: 78, top: 32, size: 72 },
  { slug: 'tailwindcss', side: 'left', gap: 26, top: 56, size: 68 },
  { slug: 'typescript', side: 'right', gap: 24, top: 60, size: 54 },
  { slug: 'nodedotjs', side: 'left', gap: 64, top: 82, size: 60 },
  { slug: 'nextdotjs', side: 'right', gap: 66, top: 84, size: 52 },
];

const ICONS_BY_SLUG = TECH_ICON_DATA.reduce((acc, icon) => {
  acc[icon.slug] = icon;
  return acc;
}, {});

// ─── Rough markup cache ─────────────────────────────────────────────────────
// Roughen each icon's path(s) EXACTLY ONCE, keyed by slug, and stash the
// resulting <path> markup. Instances reuse the cached string; animation frames
// never re-roughen (that would jitter). Runs client-side only (needs the DOM).
// Rough only ever sees LINE-ART sources: `sketchPaths` (outline/monoline/letter
// glyphs) when the original logo is a filled badge or silhouette — tracing
// those is what produced the ghost-box/scribble bug.
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
    const source = icon.sketchPaths || icon.paths;
    source.forEach(d => svgNode.appendChild(rc.path(d, ROUGH_OPTIONS)));
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

  const wantsSketch = style === 'sketch' && !icon.forceClean;

  useEffect(() => {
    if (!wantsSketch || !ref.current) {
      return;
    }
    const markup = getRoughMarkup(icon);
    if (markup) {
      ref.current.innerHTML = markup;
    } else if (typeof document !== 'undefined') {
      setSketchFailed(true); // rough couldn't parse it → fall back to clean logo
    }
  }, [icon, wantsSketch]);

  // 'clean', a forceClean icon (failed the glance test), or a sketch that
  // couldn't be roughened → crisp stock logo, filled with the accent.
  if (!wantsSketch || sketchFailed) {
    return (
      <svg viewBox={icon.viewBox} aria-hidden="true" focusable="false">
        {icon.paths.map((d, i) => (
          <path key={i} d={d} fill="currentColor" />
        ))}
      </svg>
    );
  }

  // 'sketch' → Rough.js outline injected on mount (cached, generated once).
  // Sketch sources may use their own viewBox (devicon node line art is 128×128).
  return (
    <svg
      ref={ref}
      viewBox={icon.sketchViewBox || icon.viewBox}
      aria-hidden="true"
      focusable="false"
    />
  );
};

TechIcon.propTypes = {
  icon: PropTypes.shape({
    slug: PropTypes.string.isRequired,
    name: PropTypes.string,
    viewBox: PropTypes.string.isRequired,
    paths: PropTypes.arrayOf(PropTypes.string).isRequired,
    sketchPaths: PropTypes.arrayOf(PropTypes.string),
    sketchViewBox: PropTypes.string,
    forceClean: PropTypes.bool,
  }).isRequired,
  style: PropTypes.oneOf(['sketch', 'clean']).isRequired,
};

// ─── Styled layer ─────────────────────────────────────────────────────────────
// Fills the About section's box (the section is position: relative); icons hang
// OUTSIDE it in the gutters, so no overflow clipping here.
const StyledIconLayer = styled.div`
  position: absolute;
  inset: 0;
  z-index: -1; /* behind the section's content */
  pointer-events: none;
  color: ${ACCENT};
  opacity: ${LAYER_OPACITY};
  will-change: transform;
  transition: transform 0.4s var(--easing);

  /* The About gutters shrink to zero once the viewport nears the section's
     900px + main padding (~1100px) — below that, icons would clip half
     off-screen, and under 768px they'd sit behind body text. Hide entirely;
     no layout impact (position: absolute). */
  @media (max-width: 1080px) {
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

    /* Constant hand-drawn stroke width at any icon size / DPR, soft joins. */
    svg path {
      vector-effect: non-scaling-stroke;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
  }

  /* Slow vertical drift — transform + opacity only (no re-roughening, no spin). */
  @keyframes techIconDrift {
    0%,
    100% {
      transform: translate3d(0, 0, 0);
    }
    50% {
      transform: translate3d(0, -8px, 0);
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
        const x = (e.clientX / window.innerWidth - 0.5) * 12;
        const y = (e.clientY / window.innerHeight - 0.5) * 12;
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
        // Anchor to the OUTSIDE edge of the section box (the empty gutter).
        const edge = p.side === 'left' ? 'right' : 'left';
        return (
          <span
            key={`${p.slug}-${i}`}
            className="tech-icon"
            style={{
              top: `${p.top}%`,
              [edge]: `calc(100% + ${p.gap}px)`,
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
