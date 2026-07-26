import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { srConfig, email } from '@config';
import sr from '@utils/sr';
import { usePrefersReducedMotion } from '@hooks';
import { TextFlippingBoard } from '@components/ui/text-flipping-board';

// Newline separates board rows; the board centers/wraps each message. The
// board cycles through these once it scrolls into view.
const CONTACT_MESSAGES = [
  'If you’re reading this,\nthe deployment\nworked.',
  'Stack Overflow\nremembers\nwhat I forget.',
  'Every masterpiece\nstarts with\nconsole.log().',
  'Cache me\nif\nyou can.',
  'Coffee is technically\na\ndependency.',
  'Friends don’t let friends\nDELETE\nwithout WHERE.',
  'Everything is temporary\nexcept\ntechnical debt.',
  'You either ship,\nor live long enough\nto rewrite.',
  'Git blame\nis my\nautobiography.',
  'Microservices,\nmacro\nheadaches.',
  'I have commitment issues...\nunlike\nSQL.',
  'There are only two hard things:\ncache invalidation\nand naming things.',
  'Every merge conflict\nbuilds\ncharacter.',
  'May the source\nbe\nwith you.',
  'To production...\nand\nbeyond!',
  'The cloud\nis just\nsomeone else’s computer.',
  'Intelligence is expensive.\nGPUs\nprove it.',
  'NULL\nis\nnot nothing.',
  'Ctrl+Z\nshould exist\nin production.',
];
// Timing: the flaps flip fast (BOARD_DURATION → the board settles in <1s), then
// the settled line just sits for the rest of CYCLE_MS. So each line reads as
// "quick flip, then hold ~4s" rather than continuous flipping.
//   • flip speed  → BOARD_DURATION here (+ BASE_* / scramble count in the board)
//   • hold length → CYCLE_MS here
const CYCLE_MS = 5000; // total time per message (flip + hold)
const BOARD_DURATION = 0.9; // fast-but-legible flip settle

const StyledContactSection = styled.section`
  max-width: 600px;
  margin: 0 auto 100px;
  text-align: center;

  @media (max-width: 768px) {
    margin: 0 auto 50px;
  }

  .overline {
    display: block;
    margin-bottom: 20px;
    color: var(--green);
    font-family: var(--font-mono);
    font-size: var(--fz-md);
    font-weight: 400;

    &:before {
      bottom: 0;
      font-size: var(--fz-sm);
    }

    &:after {
      display: none;
    }
  }

  .board-wrap {
    display: flex;
    justify-content: center;
    /* Equal 50px gap to the paragraph below (matches the button's 50px). */
    margin: 10px 0 50px;

    /* Below 600px the flaps are unreadable — hide the board; the plain <h2>
       below shows instead. */
    @media (max-width: 600px) {
      display: none;
    }
  }

  /* "Get In Touch" heading: the accessible/SEO title. Visually hidden on
     desktop (the flap board shows instead), but a normal styled heading on
     mobile where the board is hidden. */
  .contact-heading {
    font-size: clamp(40px, 5vw, 60px);

    @media (min-width: 601px) {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
  }

  .email-link {
    ${({ theme }) => theme.mixins.bigButton};
    margin-top: 50px;
  }
`;

const Contact = () => {
  const revealContainer = useRef(null);
  const boardWrapRef = useRef(null);
  const startedRef = useRef(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  // Board starts blank; reduced motion shows the final message statically.
  const [boardText, setBoardText] = useState('');

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }
    sr.reveal(revealContainer.current, srConfig());
  }, []);

  // Reduced motion: show one message statically, no cycling.
  useEffect(() => {
    if (prefersReducedMotion) {
      setBoardText(CONTACT_MESSAGES[0]);
    }
  }, [prefersReducedMotion]);

  // Cycle through the messages once the board scrolls into view.
  useEffect(() => {
    if (prefersReducedMotion || !boardWrapRef.current) {
      return undefined;
    }
    let interval = null;
    const io = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !startedRef.current) {
            startedRef.current = true;
            let i = 0;
            setBoardText(CONTACT_MESSAGES[0]);
            interval = setInterval(() => {
              i = (i + 1) % CONTACT_MESSAGES.length;
              setBoardText(CONTACT_MESSAGES[i]);
            }, CYCLE_MS);
            io.disconnect();
          }
        });
      },
      { threshold: 0.3 },
    );
    io.observe(boardWrapRef.current);
    return () => {
      io.disconnect();
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [prefersReducedMotion]);

  return (
    <StyledContactSection id="contact" ref={revealContainer}>
      <h2 className="numbered-heading overline">What’s Next?</h2>

      <h2 className="contact-heading">Get In Touch</h2>

      <div className="board-wrap" ref={boardWrapRef} aria-hidden="true">
        <TextFlippingBoard
          text={boardText}
          duration={BOARD_DURATION}
          reducedMotion={prefersReducedMotion}
        />
      </div>

      <p>
        My inbox is always open. Whether you have a question or just want to say hi, I’ll try my
        best to get back to you!
      </p>

      <a className="email-link" href={`mailto:${email}`}>
        Say Hello
      </a>
    </StyledContactSection>
  );
};

export default Contact;
