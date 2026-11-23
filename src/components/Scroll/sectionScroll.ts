/**
 * Section-by-section scrolling, added ON TOP of the existing layout.
 *
 * It never changes the size, padding or markup of a section. It only:
 *   1. snaps the page to each section start (CSS scroll-snap, one section per flick)
 *   2. reveals headings and text as a section comes into view (plays once)
 *   3. shows a side progress rail (bottom pill on phones)
 *   4. exposes <html data-sc-active / data-sc-index / data-sc-y> for nav styling
 *
 * Framework independent. Returns a destroy function that undoes everything.
 */
export type SectionScrollOptions = {
  /** Which elements count as sections. Outer-most matches only. */
  selector?: string;
  /** Short element after the last section (footer). It snaps to its bottom edge. */
  endSelector?: string;
  /** Elements inside a section that animate in. */
  revealSelector?: string;
  /** 'auto' = mandatory, but proximity if any section is very tall. */
  snap?: 'auto' | 'mandatory' | 'proximity' | 'off';
  reveal?: boolean;
  rail?: boolean;
  /** Height in px of a fixed header, so snapped sections are not hidden under it. */
  headerOffset?: number;
};

export function createSectionScroll(opts: SectionScrollOptions = {}): () => void {
  const selector = opts.selector ?? 'main > section, section[id]';
  const endSelector = opts.endSelector ?? 'footer';
  const revealSelector = opts.revealSelector ?? 'h1, h2, h3, p, [data-reveal]';
  const snapOpt = opts.snap ?? 'auto';
  const wantReveal = opts.reveal ?? true;
  const wantRail = opts.rail ?? true;
  const headerOffset = opts.headerOffset ?? 0;

  const root = document.documentElement;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let sections: HTMLElement[] = [];
  let dots: HTMLButtonElement[] = [];
  let rail: HTMLElement | null = null;
  let revealIO: IntersectionObserver | null = null;
  let activeIO: IntersectionObserver | null = null;
  let raf = 0;
  let timers: number[] = [];

  const scan = () => {
    const all = Array.from(document.querySelectorAll(selector)) as HTMLElement[];
    return all.filter(
      (el) =>
        el.offsetHeight > 0 &&
        !all.some((other) => other !== el && other.contains(el)) &&
        !el.closest('[data-no-snap], header, nav') &&
        !el.closest(endSelector),
    );
  };

  const clear = () => {
    if (revealIO) revealIO.disconnect();
    if (activeIO) activeIO.disconnect();
    revealIO = null;
    activeIO = null;
    if (rail) rail.remove();
    rail = null;
    dots = [];
    document.querySelectorAll('[data-sc], [data-sc-end], [data-sc-r]').forEach((el) => {
      el.removeAttribute('data-sc');
      el.removeAttribute('data-sc-end');
      el.removeAttribute('data-sc-r');
      el.classList.remove('is-in');
    });
    root.classList.remove('sc-on', 'sc-reveal');
    delete root.dataset.scSnap;
    delete root.dataset.scActive;
    delete root.dataset.scIndex;
  };

  const applyMode = () => {
    let mode = snapOpt;
    if (mode === 'auto') {
      mode = reduced ? 'off' : 'mandatory';
    }
    root.dataset.scSnap = mode;
  };

  const titleOf = (s: HTMLElement, i: number) => {
    const h = s.querySelector('h1, h2, h3');
    const t = s.getAttribute('data-title') || s.getAttribute('aria-label') || (h ? h.textContent || '' : '') || s.id || 'Section ' + (i + 1);
    return t.trim().slice(0, 28);
  };

  const setActive = (i: number) => {
    dots.forEach((d, j) => {
      d.classList.toggle('is-active', j === i);
      if (j === i) d.setAttribute('aria-current', 'true');
      else d.removeAttribute('aria-current');
    });
    const iStr = String(i);
    if (root.dataset.scIndex !== iStr) root.dataset.scIndex = iStr;
    const activeId = sections[i]?.id || iStr;
    if (root.dataset.scActive !== activeId) root.dataset.scActive = activeId;
  };

  const setupReveal = () => {
    root.classList.add('sc-reveal');
    sections.forEach((sec) => {
      const found = Array.from(sec.querySelectorAll(revealSelector)) as HTMLElement[];
      const items = found.filter(
        (el) =>
          !el.closest(
            '[data-no-reveal], nav, header, footer, button, a, .cert-glass-card, .project-poster-card, .hero-portrait-wrapper',
          ) &&
          !found.some((other) => other !== el && other.contains(el)),
      );
      items.forEach((el, i) => {
        el.setAttribute('data-sc-r', '');
        el.style.setProperty('--sc-i', String(Math.min(i, 8)));
      });
    });
    revealIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const sec = e.target as HTMLElement;
          sec.classList.add('is-in');
          if (revealIO) revealIO.unobserve(sec);
          // after the animation, hand the elements back to their normal styles
          timers.push(
            window.setTimeout(() => {
              sec.querySelectorAll('[data-sc-r]').forEach((el) => el.removeAttribute('data-sc-r'));
            }, 1000),
          );
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -5% 0px' },
    );
    sections.forEach((s) => {
      if (revealIO) revealIO.observe(s);
    });
  };

  const buildRail = () => {
    rail = document.createElement('nav');
    rail.className = 'sc-rail';
    rail.setAttribute('aria-label', 'Page sections');
    const track = document.createElement('span');
    track.className = 'sc-track';
    rail.appendChild(track);
    dots = sections.map((s, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'sc-dot';
      const label = titleOf(s, i);
      b.setAttribute('aria-label', label);
      const tip = document.createElement('span');
      tip.className = 'sc-tip';
      tip.textContent = label;
      b.appendChild(tip);
      b.addEventListener('click', () => s.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' }));
      if (rail) rail.appendChild(b);
      return b;
    });
    document.body.appendChild(rail);
  };

  const setupActive = () => {
    activeIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(Number(e.target.getAttribute('data-sc')));
        });
      },
      { rootMargin: '-45% 0px -45% 0px' },
    );
    sections.forEach((s) => {
      if (activeIO) activeIO.observe(s);
    });
  };

  const build = () => {
    const next = scan();
    const same = next.length === sections.length && next.every((s, i) => s === sections[i]);
    if (same && sections.length) {
      applyMode();
      return;
    }
    clear();
    sections = next;
    if (!sections.length) return;
    root.classList.add('sc-on');
    root.style.setProperty('--sc-header', headerOffset + 'px');
    sections.forEach((s, i) => s.setAttribute('data-sc', String(i)));
    document.querySelectorAll(endSelector).forEach((el) => el.setAttribute('data-sc-end', ''));
    applyMode();
    if (wantReveal && !reduced) setupReveal();
    if (wantRail) buildRail();
    setupActive();
    update();
  };

  // scroll-linked values: rail fill, header flag, optional [data-sc-depth] effect
  const update = () => {
    raf = 0;
    const nextY = window.scrollY > 40 ? '1' : '0';
    if (root.dataset.scY !== nextY) {
      root.dataset.scY = nextY;
    }
    if (wantRail && rail) {
      const max = root.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0;
      rail.style.setProperty('--sc-fill', p.toFixed(4));
    }
    const vh = window.innerHeight;
    sections.forEach((s) => {
      if (!s.hasAttribute('data-sc-depth')) return;
      const r = s.getBoundingClientRect();
      if (r.bottom < -vh || r.top > 2 * vh) return;
      s.style.setProperty('--sc-leave', Math.min(Math.max(-r.top / vh, 0), 1).toFixed(3));
    });
  };
  const onScroll = () => {
    if (!raf) raf = requestAnimationFrame(update);
  };
  const onResize = () => {
    applyMode();
    onScroll();
  };
  const rescan = () => {
    timers.push(window.setTimeout(build, 250));
  };

  build();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize);
  window.addEventListener('load', rescan);
  timers.push(window.setTimeout(build, 900)); // catch lazy-loaded sections

  return () => {
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onResize);
    window.removeEventListener('load', rescan);
    if (raf) cancelAnimationFrame(raf);
    timers.forEach((t) => window.clearTimeout(t));
    timers = [];
    clear();
    sections = [];
    delete root.dataset.scY;
    root.style.removeProperty('--sc-header');
  };
}
