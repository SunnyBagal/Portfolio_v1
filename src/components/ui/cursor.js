import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { usePrefersReducedMotion } from '@hooks';

// Selectors that make the ring grow + fill on hover.
const INTERACTIVE = 'a, button, [role="button"], .project-image, input, textarea';

const StyledCursor = styled.div`
  .cursor-dot,
  .cursor-ring-pos {
    position: fixed;
    top: 0;
    left: 0;
    pointer-events: none;
    z-index: 10000;
    will-change: transform;
  }

  .cursor-dot {
    width: 6px;
    height: 6px;
    margin: -3px 0 0 -3px; /* center on the point */
    border-radius: 50%;
    background: var(--accent);
  }

  .cursor-ring {
    width: 28px;
    height: 28px;
    border: 1px solid color-mix(in srgb, var(--accent) 40%, transparent);
    border-radius: 50%;
    background: transparent;
    transform: translate(-50%, -50%) scale(1);
    transition: transform 0.2s ease, background-color 0.2s ease, border-color 0.2s ease;
  }

  &[data-hover='true'] .cursor-ring {
    transform: translate(-50%, -50%) scale(1.8);
    background: var(--accent-tint);
    border-color: var(--accent);
  }
`;

const Cursor = () => {
  const rootRef = useRef(null);
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const [enabled, setEnabled] = useState(false);

  // Only enable on devices with a fine pointer, and never under reduced motion.
  useEffect(() => {
    if (prefersReducedMotion) {
      return undefined;
    }
    const fine = window.matchMedia('(pointer: fine)');
    if (!fine.matches) {
      return undefined;
    }
    setEnabled(true);
    document.body.classList.add('custom-cursor-active');
    return () => document.body.classList.remove('custom-cursor-active');
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }
    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const ring = { x: mouse.x, y: mouse.y };
    let raf = null;

    const onMove = e => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouse.x}px, ${mouse.y}px, 0)`;
      }
    };

    const loop = () => {
      ring.x += (mouse.x - ring.x) * 0.15; // lerp
      ring.y += (mouse.y - ring.y) * 0.15;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0)`;
      }
      raf = requestAnimationFrame(loop);
    };

    const onOver = e => {
      if (e.target.closest && e.target.closest(INTERACTIVE) && rootRef.current) {
        rootRef.current.dataset.hover = 'true';
      }
    };
    const onOut = e => {
      if (e.target.closest && e.target.closest(INTERACTIVE) && rootRef.current) {
        rootRef.current.dataset.hover = 'false';
      }
    };

    window.addEventListener('mousemove', onMove);
    document.addEventListener('mouseover', onOver);
    document.addEventListener('mouseout', onOut);
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseout', onOut);
      if (raf) {
        cancelAnimationFrame(raf);
      }
    };
  }, [enabled]);

  if (!enabled) {
    return null;
  }

  return (
    <StyledCursor ref={rootRef} data-hover="false" aria-hidden="true">
      <div ref={dotRef} className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring-pos">
        <div className="cursor-ring" />
      </div>
    </StyledCursor>
  );
};

export default Cursor;
