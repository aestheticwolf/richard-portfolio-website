import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { createSectionScroll } from './sectionScroll';
import type { SectionScrollOptions } from './sectionScroll';
import './scroll.css';

/**
 * Mount ONCE, inside <BrowserRouter>, next to your routes. It renders nothing.
 * It re-initialises on every route change, so each page gets its own sections.
 */
export default function ScrollExperience({
  selector,
  endSelector,
  revealSelector,
  snap,
  reveal,
  rail,
  headerOffset,
}: SectionScrollOptions) {
  const { pathname } = useLocation();

  useEffect(() => {
    // Section snapping is exclusively for the single-page home layout (slide-by-slide).
    // Subpages (like /projects/:slug, /request-resume, /resume-access, /error) are standard scrollable documents.
    if (pathname !== '/') {
      document.documentElement.classList.remove('sc-on', 'sc-reveal');
      delete document.documentElement.dataset.scSnap;
      delete document.documentElement.dataset.scActive;
      delete document.documentElement.dataset.scIndex;
      delete document.documentElement.dataset.scY;
      return;
    }

    let destroy: (() => void) | undefined;
    // wait a moment so the new route's DOM exists
    const id = window.setTimeout(() => {
      destroy = createSectionScroll({ selector, endSelector, revealSelector, snap, reveal, rail, headerOffset });
    }, 150);
    return () => {
      window.clearTimeout(id);
      if (destroy) destroy();
    };
  }, [pathname, selector, endSelector, revealSelector, snap, reveal, rail, headerOffset]);

  return null;
}
