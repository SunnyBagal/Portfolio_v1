import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { srConfig } from '@config';
import sr from '@utils/sr';
import { Icon } from '@components/icons';
import { usePrefersReducedMotion } from '@hooks';

// Exactly five curated cards, in order. Todo + FluxChat descriptions/tech are
// intentional placeholders — fill them in below.
const PROJECTS = [
  {
    title: 'NeuralCompress',
    description:
      'Dual-mode image compression. I designed the near-lossless pipeline using a Q-shift DTCWT with a reversible CNN, reaching 100+ dB PSNR, and benchmarked a lossy mode against JPEG and WebP at matched bitrates.',
    tech: ['Python', 'PyTorch', 'CompressAI', 'NumPy'],
    github: 'https://github.com/SunnyBagal/Neural-Compress',
    external: 'https://huggingface.co/spaces/Sunny1110/image-compression',
  },
  {
    title: 'Todo',
    description:
      'A full-stack task app I built to learn the difference between client state and server state properly. Zustand holds browser state like filters and auth, TanStack Query owns everything from the server with cache invalidation, and the analytics dashboard buckets completions by the user’s local timezone instead of UTC so late-night tasks land on the right day.',
    tech: ['React', 'Zustand', 'TanStack Query', 'Express', 'MongoDB', 'Zod'],
    github: 'https://github.com/SunnyBagal/Todo_Application',
    external: 'https://todo-application-blgn.vercel.app',
  },
  {
    title: 'FluxChat',
    description:
      'A minimal real-time chat where you create a room, share a 6-character code, and talk with up to ten people without signing up. Rooms live entirely in server memory, and the WebSocket server routes every frame by message type to handle joins, broadcasts, capacity limits, and clean disconnects. This was the project that got me comfortable with WebSockets before I built Linea.',
    tech: ['TypeScript', 'React', 'Bun', 'ws', 'Tailwind'],
    github: 'https://github.com/SunnyBagal/FluxChat',
    external: 'https://chat-application-two-flax.vercel.app',
  },
  {
    title: 'Payments Wallet',
    description:
      'A wallet and transfer service built to understand transaction isolation properly. Handles concurrent transfers with Serializable isolation and row-level locking so balances never drift under contention.',
    tech: ['TypeScript', 'Node.js', 'PostgreSQL', 'Prisma'],
    github: 'https://github.com/SunnyBagal/Paytm-',
  },
];

const StyledProjectsSection = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;

  h2 {
    font-size: clamp(24px, 5vw, var(--fz-heading));

    .prefix {
      margin-right: 8px;
      color: var(--green);
      font-family: var(--font-mono);
      font-weight: 500;
    }
  }

  .projects-grid {
    ${({ theme }) => theme.mixins.resetList};
    display: grid;
    /* auto-fill keeps empty tracks, so a final row of 2 stays left-aligned
       (in the first two columns) rather than stretching to fill the row. */
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    grid-gap: 15px;
    position: relative;
    margin-top: 50px;
    width: 100%;

    @media (max-width: 1080px) {
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    }
  }
`;

const StyledProject = styled.li`
  position: relative;
  cursor: default;
  transition: var(--transition);

  @media (prefers-reduced-motion: no-preference) {
    &:hover,
    &:focus-within {
      .project-inner {
        transform: translateY(-7px);
      }
    }
  }

  a {
    position: relative;
    z-index: 1;
  }

  .project-inner {
    ${({ theme }) => theme.mixins.boxShadow};
    ${({ theme }) => theme.mixins.flexBetween};
    flex-direction: column;
    align-items: flex-start;
    position: relative;
    height: 100%;
    padding: 2rem 1.75rem;
    border-radius: var(--border-radius);
    background-color: var(--light-navy);
    transition: var(--transition);
    overflow: auto;
  }

  .project-top {
    ${({ theme }) => theme.mixins.flexBetween};
    margin-bottom: 35px;

    .folder {
      color: var(--green);
      svg {
        width: 40px;
        height: 40px;
      }
    }

    .project-links {
      display: flex;
      align-items: center;
      margin-right: -10px;
      color: var(--light-slate);

      a {
        ${({ theme }) => theme.mixins.flexCenter};
        padding: 5px 7px;

        &.external {
          svg {
            width: 22px;
            height: 22px;
            margin-top: -4px;
          }
        }

        svg {
          width: 20px;
          height: 20px;
        }
      }
    }
  }

  .project-title {
    margin: 0 0 10px;
    color: var(--lightest-slate);
    font-size: var(--fz-xxl);

    a {
      position: static;

      &:before {
        content: '';
        display: block;
        position: absolute;
        z-index: 0;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
      }
    }
  }

  .project-description {
    color: var(--light-slate);
    font-size: 17px;

    a {
      ${({ theme }) => theme.mixins.inlineLink};
    }
  }

  .project-tech-list {
    display: flex;
    align-items: flex-end;
    flex-grow: 1;
    flex-wrap: wrap;
    padding: 0;
    margin: 20px 0 0 0;
    list-style: none;

    li {
      font-family: var(--font-mono);
      font-size: var(--fz-xxs);
      line-height: 1.75;

      &:not(:last-of-type) {
        margin-right: 15px;
      }
    }
  }
`;

const Projects = () => {
  const revealTitle = useRef(null);
  const revealProjects = useRef([]);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }
    sr.reveal(revealTitle.current, srConfig());
    revealProjects.current.forEach((ref, i) => sr.reveal(ref, srConfig(i * 100)));
  }, []);

  const projectInner = project => {
    const { github, external, title, description, tech } = project;
    return (
      <div className="project-inner">
        <header>
          <div className="project-top">
            <div className="folder">
              <Icon name="Folder" />
            </div>
            <div className="project-links">
              {github && (
                <a href={github} aria-label="GitHub Link" target="_blank" rel="noreferrer">
                  <Icon name="GitHub" />
                </a>
              )}
              {external && (
                <a
                  href={external}
                  aria-label="External Link"
                  className="external"
                  target="_blank"
                  rel="noreferrer">
                  <Icon name="External" />
                </a>
              )}
            </div>
          </div>

          <h3 className="project-title">
            {external ? (
              <a href={external} target="_blank" rel="noreferrer">
                {title}
              </a>
            ) : (
              title
            )}
          </h3>

          <div className="project-description">{description}</div>
        </header>

        <footer>
          {tech && (
            <ul className="project-tech-list">
              {tech.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          )}
        </footer>
      </div>
    );
  };

  return (
    <StyledProjectsSection>
      <h2 ref={revealTitle}>
        <span className="prefix">{'//'}</span>other things I&apos;ve built
      </h2>

      <ul className="projects-grid">
        {PROJECTS.map((project, i) => (
          <StyledProject key={i} ref={el => (revealProjects.current[i] = el)}>
            {projectInner(project)}
          </StyledProject>
        ))}
      </ul>
    </StyledProjectsSection>
  );
};

export default Projects;
