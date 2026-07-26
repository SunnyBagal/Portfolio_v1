import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';

// Thin scroll-progress bar pinned to the left edge (the social-rail column),
// filling top-to-bottom in the accent as the page scrolls. Also drives the
// "// section" underline draw by toggling `.in-view` on each numbered heading
// when it scrolls into view (the width/scaleX animation itself lives in
// GlobalStyle, guarded by prefers-reduced-motion).
const StyledProgress = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 2px;
  height: 100vh;
  z-index: 9;
  pointer-events: none;
  transform-origin: top center;
  transform: scaleY(0);
  background: var(--accent);
  opacity: 0.4;
`;

const ScrollFx = () => {
  const barRef = useRef(null);

  // Scroll-progress fill (user-driven, not an autonomous animation).
  useEffect(() => {
    let raf = null;
    const update = () => {
      raf = null;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      if (barRef.current) {
        barRef.current.style.transform = `scaleY(${p})`;
      }
    };
    const onScroll = () => {
      if (!raf) {
        raf = requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) {
        cancelAnimationFrame(raf);
      }
    };
  }, []);

  // Heading underline draw — observe headings (they mount after the loader, so
  // watch the DOM for late additions too).
  useEffect(() => {
    const io = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 },
    );

    const attach = () => {
      document.querySelectorAll('.numbered-heading:not([data-line-observed])').forEach(el => {
        el.setAttribute('data-line-observed', 'true');
        io.observe(el);
      });
    };

    attach();
    const mo = new MutationObserver(attach);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  return <StyledProgress ref={barRef} aria-hidden="true" />;
};

export default ScrollFx;
