import React, { useEffect, useRef } from 'react';
import { StaticImage } from 'gatsby-plugin-image';
import styled from 'styled-components';
import { srConfig } from '@config';
import sr from '@utils/sr';
import { usePrefersReducedMotion } from '@hooks';
import TechStackIcons from '@components/ui/tech-stack-icons';

const StyledAboutSection = styled.section`
  position: relative; /* anchors the decorative tech-icon gutter layer */
  isolation: isolate; /* keeps that z-index: -1 layer above the page, so its logos can be hovered */
  max-width: 900px;

  .inner {
    display: grid;
    grid-template-columns: 3fr 2fr;
    grid-gap: 50px;

    @media (max-width: 768px) {
      display: block;
    }
  }
`;
const StyledText = styled.div`
  p {
    color: var(--light-slate);
  }

  ul.skills-list {
    display: grid;
    grid-template-columns: repeat(2, minmax(140px, 200px));
    grid-template-rows: repeat(4, auto);
    grid-auto-flow: column;
    grid-gap: 0 10px;
    padding: 0;
    margin: 20px 0 0 0;
    overflow: hidden;
    list-style: none;

    li {
      position: relative;
      margin-bottom: 10px;
      padding-left: 20px;
      font-family: var(--font-mono);
      font-size: var(--fz-xs);

      &:before {
        content: '▹';
        position: absolute;
        left: 0;
        color: var(--green);
        font-size: var(--fz-sm);
        line-height: 12px;
      }
    }
  }
`;
const StyledPic = styled.div`
  position: relative;
  max-width: 300px;

  @media (max-width: 768px) {
    margin: 50px auto 0;
    width: 70%;
  }

  .wrapper {
    ${({ theme }) => theme.mixins.boxShadow};
    display: block;
    position: relative;
    width: 100%;
    border-radius: var(--border-radius);

    &:hover,
    &:focus {
      outline: 0;
      transform: translate(-4px, -4px);

      &:after {
        transform: translate(8px, 8px);
      }

      .img {
        filter: none;
      }
    }

    .img {
      position: relative;
      border-radius: var(--border-radius);
      filter: grayscale(100%) contrast(1.05);
      transition: filter 0.3s var(--easing);
    }

    &:after {
      content: '';
      display: block;
      position: absolute;
      top: 14px;
      left: 14px;
      width: 100%;
      height: 100%;
      border: 1px solid var(--green);
      border-radius: var(--border-radius);
      transition: var(--transition);
      z-index: -1;
    }
  }
`;

const About = () => {
  const revealContainer = useRef(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    sr.reveal(revealContainer.current, srConfig());
  }, []);

  // Column-first order (grid flows top-to-bottom, then to the next column):
  // Column 1 → TypeScript, Node.js, PostgreSQL, Redis
  // Column 2 → Next.js, Prisma / Drizzle, WebSockets, BullMQ
  const skills = [
    'TypeScript',
    'Node.js',
    'PostgreSQL',
    'Redis',
    'Next.js',
    'Prisma / Drizzle',
    'WebSockets',
    'BullMQ',
  ];

  return (
    <StyledAboutSection id="about" ref={revealContainer}>
      <TechStackIcons />
      <h2 className="numbered-heading">About Me</h2>

      <div className="inner">
        <StyledText>
          <div>
            <p>
              I’m a backend developer from Navi Mumbai. Most of my work lives behind the UI: APIs,
              queues, WebSocket servers, and the database schemas underneath them. I like problems
              with sharp edges: race conditions, sync conflicts, and the bugs that only appear when
              two users act at the same time.
            </p>

            <p>
              That’s what Linea and Recall are about: an append-only op-log behind a multiplayer
              whiteboard, and hybrid vector + keyword search in Postgres.
            </p>

            <p>
              Earlier this year I interned at InteleCorp as Technical Head, leading a four-person
              team that built GeoGrid, a geospatial lead-generation platform. I graduated in
              Computer Engineering from NMIMS in 2026 and I’m looking for a backend SDE-1 role, open
              to relocating.
            </p>

            <p>Technologies I work with daily:</p>
          </div>

          <ul className="skills-list">
            {skills && skills.map((skill, i) => <li key={i}>{skill}</li>)}
          </ul>
        </StyledText>

        <StyledPic>
          <div className="wrapper">
            <StaticImage
              className="img"
              src="../../images/me.jpg"
              width={500}
              quality={95}
              formats={['AUTO', 'WEBP', 'AVIF']}
              alt="Headshot"
            />
          </div>
        </StyledPic>
      </div>
    </StyledAboutSection>
  );
};

export default About;
