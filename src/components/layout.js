import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styled, { ThemeProvider } from 'styled-components';
import { Head, Loader, Nav, Social, Email, Footer } from '@components';
import { GlobalStyle, theme } from '@styles';
import FilmGrain from '@components/ui/film-grain';
import Cursor from '@components/ui/cursor';
import ScrollFx from '@components/ui/scroll-fx';

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  position: relative;
  z-index: 2; /* keep content above the fixed film-grain overlay (z-index 1) */
`;

const Layout = ({ children, location }) => {
  const isHome = location.pathname === '/';
  // isLoading gates the page content; showLoader keeps the overlay mounted
  // through its slide-out (which begins once the content is already revealed).
  const [isLoading, setIsLoading] = useState(isHome);
  const [showLoader, setShowLoader] = useState(isHome);

  // Run the loader on every home-page load, but never under reduced motion or
  // on internal (non-home) routes — those show the page immediately.
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!isHome || reduced) {
      setIsLoading(false);
      setShowLoader(false);
    }
  }, [isHome]);

  // Sets target="_blank" rel="noopener noreferrer" on external links
  const handleExternalLinks = () => {
    const allLinks = Array.from(document.querySelectorAll('a'));
    if (allLinks.length > 0) {
      allLinks.forEach(link => {
        if (link.host !== window.location.host) {
          link.setAttribute('rel', 'noopener noreferrer');
          link.setAttribute('target', '_blank');
        }
      });
    }
  };

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (location.hash) {
      const id = location.hash.substring(1); // location.hash without the '#'
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView();
          el.focus();
        }
      }, 0);
    }

    handleExternalLinks();
  }, [isLoading]);

  return (
    <>
      <Head />

      <div id="root">
        <ThemeProvider theme={theme}>
          <GlobalStyle />

          <FilmGrain />
          <Cursor />
          <ScrollFx />

          <a className="skip-to-content" href="#content">
            Skip to Content
          </a>

          {showLoader && (
            <Loader onReveal={() => setIsLoading(false)} onComplete={() => setShowLoader(false)} />
          )}

          {!isLoading && (
            <StyledContent>
              <Nav isHome={isHome} />
              <Social isHome={isHome} />
              <Email isHome={isHome} />

              <div id="content">
                {children}
                <Footer />
              </div>
            </StyledContent>
          )}
        </ThemeProvider>
      </div>
    </>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
  location: PropTypes.object.isRequired,
};

export default Layout;
