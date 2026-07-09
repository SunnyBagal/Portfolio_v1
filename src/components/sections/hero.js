import React, { useState, useEffect, useRef } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import styled from 'styled-components';
import { navDelay, loaderDelay } from '@utils';
import { usePrefersReducedMotion } from '@hooks';
import { DotBackground } from '@components/ui/dot-background';

// ─── Sprite map ───────────────────────────────────────────────────────────────
// Classic oneko.gif sprite sheet (32×32 tiles, public domain)
const SPRITES = {
  idle:     [[-3, -3]],
  alert:    [[-7, -3]],
  tired:    [[-3, -2]],
  sleeping: [[-2,  0], [-2, -1]],
  N:  [[-1, -2], [-1, -3]],
  NE: [[ 0, -2], [ 0, -3]],
  E:  [[-3,  0], [-3, -1]],
  SE: [[-5, -1], [-5, -2]],
  S:  [[-6, -3], [-7, -2]],
  SW: [[-5, -3], [-6, -1]],
  W:  [[-4, -2], [-4, -3]],
  NW: [[-1,  0], [-1, -1]],
};

const SPRITE_URL  = 'https://raw.githubusercontent.com/adryd325/oneko.js/14bab15/oneko.gif';
const NEKO_SPEED  = 10;
const TICK_MS     = 100;
const NEAR_PX     = 48;
const IDLE_TICKS  = 10;
const TIRED_TICKS = 15;

// Direction from angle
const angleToDir = angle => {
  if (angle >  -22.5 && angle <=  22.5) return 'E';
  if (angle >   22.5 && angle <=  67.5) return 'SE';
  if (angle >   67.5 && angle <= 112.5) return 'S';
  if (angle >  112.5 && angle <= 157.5) return 'SW';
  if (angle >  -67.5 && angle <= -22.5) return 'NE';
  if (angle > -112.5 && angle <= -67.5) return 'N';
  if (angle > -157.5 && angle <=-112.5) return 'NW';
  return 'W';
};

// Pick random DOM elements to wander to in mode 3
const getWanderTargets = () => {
  const selectors = 'h1, h2, h3, p, a, button, li, [class*="icon"]';
  const all = [...document.querySelectorAll(selectors)].filter(el => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 &&
           r.top > 0 && r.bottom < window.innerHeight &&
           r.left > 0 && r.right < window.innerWidth;
  });
  return all;
};

const randTarget = () => {
  const targets = getWanderTargets();
  if (!targets.length) {
    // Fallback: random screen position
    return {
      x: 80 + Math.random() * (window.innerWidth  - 160),
      y: 80 + Math.random() * (window.innerHeight - 160),
    };
  }
  const el = targets[Math.floor(Math.random() * targets.length)];
  const r  = el.getBoundingClientRect();
  return {
    x: r.left + r.width  / 2,
    y: r.top  + r.height / 2,
  };
};

// ─── Neko hook ────────────────────────────────────────────────────────────────
// mode 0 = follow  |  mode 1 = flee  |  mode 2 = wander
function useNeko(active, mode) {
  const elRef       = useRef(null);
  const stateRef    = useRef(null);
  const tickRef     = useRef(null);
  const wanderRef   = useRef(null); // wander sit timer

  // Helper: init/reset state
  const initState = () => ({
    x:          window.innerWidth  / 2,
    y:          window.innerHeight / 2,
    mouseX:     window.innerWidth  / 2,
    mouseY:     window.innerHeight / 2,
    frame:      0,
    tickCount:  0,
    phase:      'idle',
    wanderTarget: randTarget(),
    sitting:    false,
  });

  // Helper: set sprite
  const setSprite = (name, frame) => {
    const el = elRef.current;
    if (!el) return;
    const frames = SPRITES[name] || SPRITES.idle;
    const [col, row] = frames[frame % frames.length];
    el.style.backgroundPosition = `${col * 32}px ${row * 32}px`;
  };

  // Helper: move cat element
  const moveTo = (x, y) => {
    const el = elRef.current;
    if (!el) return;
    el.style.left = `${x}px`;
    el.style.top  = `${y}px`;
  };

  useEffect(() => {
    if (!active) {
      clearInterval(tickRef.current);
      clearTimeout(wanderRef.current);
      elRef.current?.remove();
      elRef.current  = null;
      stateRef.current = null;
      return;
    }

    // ── Create the cat div ────────────────────────────────────────────────
    const el = document.createElement('div');
    Object.assign(el.style, {
      position:         'fixed',
      width:            '32px',
      height:           '32px',
      backgroundImage:  `url('${SPRITE_URL}')`,
      backgroundRepeat: 'no-repeat',
      imageRendering:   'pixelated',
      zIndex:           '9999',
      pointerEvents:    'auto',
      cursor:           'pointer',
      left:             `${window.innerWidth / 2}px`,
      top:              `${window.innerHeight / 2}px`,
      transform:        'translate(-50%, -50%)',
    });
    document.body.appendChild(el);
    elRef.current    = el;
    stateRef.current = initState();

    // ── Mouse tracking ────────────────────────────────────────────────────
    const onMouseMove = e => {
      stateRef.current.mouseX = e.clientX;
      stateRef.current.mouseY = e.clientY;
    };
    window.addEventListener('mousemove', onMouseMove);

    // ── Tick ──────────────────────────────────────────────────────────────
    const tick = () => {
      const s = stateRef.current;
      if (!s) return;
      s.frame++;
      s.tickCount++;

      const currentMode = modeRef.current;

      // ── MODE 0: follow ──────────────────────────────────────────────────
      if (currentMode === 0) {
        const dx   = s.mouseX - s.x;
        const dy   = s.mouseY - s.y;
        const dist = Math.hypot(dx, dy);

        if (dist < NEAR_PX) {
          if (s.phase === 'running') { s.phase = 'idle'; s.tickCount = 0; }
          if (s.phase === 'idle') {
            s.tickCount > IDLE_TICKS
              ? (s.phase = 'tired', s.tickCount = 0)
              : setSprite('idle', 0);
          } else if (s.phase === 'tired') {
            setSprite('tired', 0);
            if (s.tickCount > TIRED_TICKS) { s.phase = 'sleeping'; s.tickCount = 0; }
          } else if (s.phase === 'sleeping') {
            setSprite('sleeping', s.frame);
          } else if (s.phase === 'alert') {
            setSprite('alert', 0);
            if (s.tickCount > 3) { s.phase = 'idle'; s.tickCount = 0; }
          }
        } else {
          if (s.phase === 'sleeping' || s.phase === 'tired') {
            s.phase = 'alert'; s.tickCount = 0; setSprite('alert', 0); return;
          }
          s.phase = 'running';
          const step = Math.min(NEKO_SPEED, dist);
          s.x = Math.max(16, Math.min(window.innerWidth  - 16, s.x + (dx / dist) * step));
          s.y = Math.max(16, Math.min(window.innerHeight - 16, s.y + (dy / dist) * step));
          moveTo(s.x, s.y);
          setSprite(angleToDir(Math.atan2(dy, dx) * (180 / Math.PI)), s.frame);
        }
      }

      // ── MODE 1: flee ────────────────────────────────────────────────────
      else if (currentMode === 1) {
        const dx   = s.x - s.mouseX;   // reversed: away from cursor
        const dy   = s.y - s.mouseY;
        const dist = Math.hypot(dx, dy);

        if (dist > 220) {
          // Far enough — idle/nervous
          setSprite('idle', s.frame);
        } else {
          const step = NEKO_SPEED * 1.4; // flee a bit faster
          let nx = s.x + (dx / (dist || 1)) * step;
          let ny = s.y + (dy / (dist || 1)) * step;
          // Bounce off edges
          if (nx < 24)                       { nx = 24;                        }
          if (nx > window.innerWidth  - 24)  { nx = window.innerWidth  - 24;   }
          if (ny < 24)                       { ny = 24;                        }
          if (ny > window.innerHeight - 24)  { ny = window.innerHeight - 24;   }
          s.x = nx; s.y = ny;
          moveTo(s.x, s.y);
          // Face away from mouse
          const fleeAngle = Math.atan2(dy, dx) * (180 / Math.PI);
          setSprite(angleToDir(fleeAngle), s.frame);
        }
      }

      // ── MODE 2: wander ──────────────────────────────────────────────────
      else if (currentMode === 2) {
        if (s.sitting) return; // waiting on a target — skip movement

        const tx   = s.wanderTarget.x;
        const ty   = s.wanderTarget.y;
        const dx   = tx - s.x;
        const dy   = ty - s.y;
        const dist = Math.hypot(dx, dy);

        if (dist < NEAR_PX) {
          // Arrived — sit for 2-3 seconds then pick next target
          s.sitting = true;
          s.phase   = 'sleeping';
          setSprite('sleeping', 0);
          const sitMs = 2000 + Math.random() * 1000;
          wanderRef.current = setTimeout(() => {
            if (!stateRef.current) return;
            stateRef.current.sitting      = false;
            stateRef.current.wanderTarget = randTarget();
            stateRef.current.phase        = 'running';
          }, sitMs);
        } else {
          s.phase = 'running';
          const step = Math.min(NEKO_SPEED, dist);
          s.x = Math.max(16, Math.min(window.innerWidth  - 16, s.x + (dx / dist) * step));
          s.y = Math.max(16, Math.min(window.innerHeight - 16, s.y + (dy / dist) * step));
          moveTo(s.x, s.y);
          setSprite(angleToDir(Math.atan2(dy, dx) * (180 / Math.PI)), s.frame);
        }
      }
    };

    tickRef.current = setInterval(tick, TICK_MS);

    return () => {
      clearInterval(tickRef.current);
      clearTimeout(wanderRef.current);
      window.removeEventListener('mousemove', onMouseMove);
      elRef.current?.remove();
      elRef.current    = null;
      stateRef.current = null;
    };
  }, [active]); // only re-run when active changes

  // ── Mode changes don't recreate the cat — we use a ref so the tick closure
  //    always reads the latest value without triggering a new effect.
  const modeRef = useRef(mode);
  useEffect(() => {
    modeRef.current = mode;
    // When switching to wander mode, reset sitting + pick new target immediately
    if (mode === 2 && stateRef.current) {
      clearTimeout(wanderRef.current);
      stateRef.current.sitting      = false;
      stateRef.current.wanderTarget = randTarget();
    }
    // When switching back to follow/flee, wake the cat up
    if ((mode === 0 || mode === 1) && stateRef.current) {
      clearTimeout(wanderRef.current);
      stateRef.current.sitting   = false;
      stateRef.current.phase     = 'idle';
      stateRef.current.tickCount = 0;
    }
  }, [mode]);

  // Expose ref so Hero can attach click handler to the cat element
  return elRef;
}

// ─── Styled components ────────────────────────────────────────────────────────
const StyledHeroSection = styled.section`
  ${({ theme }) => theme.mixins.flexCenter};
  flex-direction: column;
  align-items: flex-start;
  min-height: 100vh;
  height: 100vh;
  padding: 0;

  @media (max-height: 700px) and (min-width: 700px), (max-width: 360px) {
    height: auto;
    padding-top: var(--nav-height);
  }

  h1 {
    margin: 0 0 30px 4px;
    color: var(--green);
    font-family: var(--font-mono);
    font-size: clamp(var(--fz-sm), 5vw, var(--fz-md));
    font-weight: 400;

    @media (max-width: 480px) {
      margin: 0 0 20px 2px;
    }
  }

  h3 {
    margin-top: 5px;
    color: var(--slate);
    line-height: 0.9;
  }

  p {
    margin: 20px 0 0;
    max-width: 540px;
  }

  .email-link {
    ${({ theme }) => theme.mixins.bigButton};
    margin-top: 50px;
  }
`;

const StyledHiButton = styled.button`
  ${({ theme }) => theme.mixins.bigButton};
  margin-top: 50px;
  cursor: pointer;
  background: transparent;
  font-family: var(--font-mono);
  transition: all 0.2s ease;

  &.flee    { border-color: var(--orange, #e06c75); color: var(--orange, #e06c75); }
  &.wander  { border-color: var(--yellow, #e5c07b); color: var(--yellow, #e5c07b); }
  &.active  { border-color: var(--green);            color: var(--green);            background-color: rgba(100,255,218,0.06); }
`;

// Mode labels shown on the button
const MODE_LABELS = ['hi 🐱', 'flee 🙀', 'explore 😺'];
const MODE_CLASSES = ['active', 'flee active', 'wander active'];

// ─── Hero ─────────────────────────────────────────────────────────────────────
const Hero = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [catActive, setCatActive] = useState(false);
  const [mode, setMode]           = useState(0); // 0=follow 1=flee 2=wander
  const prefersReducedMotion      = usePrefersReducedMotion();

  const nekoElRef = useNeko(catActive, mode);

  // Attach click handler to the cat element for mode cycling
  useEffect(() => {
    const el = nekoElRef.current;
    if (!el) return;
    const onClick = e => {
      e.stopPropagation();
      setMode(m => (m + 1) % 3);
    };
    el.addEventListener('click', onClick);
    return () => el.removeEventListener('click', onClick);
  }, [catActive]); // re-attach when cat is (re)created

  useEffect(() => {
    if (prefersReducedMotion) return;
    const timeout = setTimeout(() => setIsMounted(true), navDelay);
    return () => clearTimeout(timeout);
  }, []);

  const handleHiClick = () => {
    if (catActive) {
      setCatActive(false);
      setMode(0); // reset mode for next summon
    } else {
      setCatActive(true);
    }
  };

  const one   = <h1>Hello, my name is</h1>;
  const two   = <h2 className="big-heading">Sunny Bagal.</h2>;
  const three = <h3 className="big-heading">I engineer dynamic web applications.</h3>;
  const four  = (
    <p>
      I'm a software developer specializing in full-stack architecture. Whether building
      real-time applications, managing complex databases, or writing efficient developer
      tools, I focus on shipping clean, functional code.
    </p>
  );
  const five  = (
    <StyledHiButton
      className={catActive ? MODE_CLASSES[mode] : ''}
      onClick={handleHiClick}
      title={
        !catActive
          ? 'Summon a cat!'
          : mode === 0 ? 'Click cat to make it flee'
          : mode === 1 ? 'Click cat to make it explore'
          : 'Click cat to reset'
      }
      aria-label={catActive ? 'Dismiss cat' : 'Summon cat'}>
      {catActive ? MODE_LABELS[mode] : 'hi 🐱'}
    </StyledHiButton>
  );

  const items = [one, two, three, four, five];

  return (
    <DotBackground>
      <StyledHeroSection>
        {prefersReducedMotion ? (
          <>
            {items.map((item, i) => (
              <div key={i}>{item}</div>
            ))}
          </>
        ) : (
          <TransitionGroup component={null}>
            {isMounted &&
              items.map((item, i) => (
                <CSSTransition key={i} classNames="fadeup" timeout={loaderDelay}>
                  <div style={{ transitionDelay: `${i + 1}00ms` }}>{item}</div>
                </CSSTransition>
              ))}
          </TransitionGroup>
        )}
      </StyledHeroSection>
    </DotBackground>
  );
};

export default Hero;