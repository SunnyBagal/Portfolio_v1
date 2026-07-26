import React, { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const COUNT_MS = 1200; // count 00 → 100
const HOLD_MS = 150; // pause on 100 before leaving
const SLIDE_MS = 700; // overlay slide-up duration

const StyledLoader = styled.div`
  position: fixed;
  inset: 0;
  z-index: 99;
  background-color: var(--bg-darkest);
  transform: translateY(0);

  &.leaving {
    transform: translateY(-100%);
    transition: transform ${SLIDE_MS}ms cubic-bezier(0.76, 0, 0.24, 1);
  }

  .loader-count {
    position: absolute;
    left: 8vw;
    bottom: 6vh;
    width: min(560px, 80vw);
  }

  .loader-line {
    height: 1px;
    width: 0;
    margin-bottom: 20px;
    background-color: var(--border);
  }

  .loader-num {
    font-family: var(--font-mono);
    font-weight: 500;
    font-size: clamp(64px, 12vw, 160px);
    line-height: 0.9;
    letter-spacing: -0.02em;
    color: var(--accent);
    font-variant-numeric: tabular-nums;
  }
`;

const easeOutCubic = t => 1 - Math.pow(1 - t, 3);

const Loader = ({ onReveal, onComplete }) => {
  const [count, setCount] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const lineRef = useRef(null);

  useEffect(() => {
    let raf = null;
    let holdTimer = null;
    let doneTimer = null;
    const start = performance.now();

    const tick = now => {
      const t = Math.min(1, (now - start) / COUNT_MS);
      const p = easeOutCubic(t); // slows as it nears 100
      setCount(Math.round(p * 100));
      if (lineRef.current) {
        lineRef.current.style.width = `${p * 100}%`;
      }
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        holdTimer = setTimeout(() => {
          setLeaving(true); // overlay slides up …
          onReveal(); // … and the hero mounts + starts revealing underneath now
          doneTimer = setTimeout(onComplete, SLIDE_MS);
        }, HOLD_MS);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      if (holdTimer) clearTimeout(holdTimer);
      if (doneTimer) clearTimeout(doneTimer);
    };
  }, []);

  return (
    <StyledLoader className={`loader${leaving ? ' leaving' : ''}`} aria-hidden="true">
      <Helmet bodyAttributes={{ class: 'hidden' }} />
      <div className="loader-count">
        <div ref={lineRef} className="loader-line" />
        <div className="loader-num">{String(count).padStart(2, '0')}</div>
      </div>
    </StyledLoader>
  );
};

Loader.propTypes = {
  onReveal: PropTypes.func.isRequired,
  onComplete: PropTypes.func.isRequired,
};

export default Loader;
