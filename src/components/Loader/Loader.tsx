import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, useMotionValue, useMotionValueEvent, useTransform } from 'motion/react';
import type { MotionValue } from 'motion/react';
import { createLoaderScene } from './loaderScene';
import './loader.css';

type LoaderProps = {
  /** Name shown in the wordmark. Exact text: "Richard D'souza" */
  name?: string;
  /** Set to false while app data is loading. Loader holds at 90%. */
  ready?: boolean;
  /** Shortest time the loader stays up, in ms. */
  minMs?: number;
  /** Safety net: after this many ms the loader finishes even if `ready` never became true. */
  maxWaitMs?: number;
  /** Called after the loader has fully opened and unmounted. */
  onDone?: () => void;
};

type Phase = 'loading' | 'exit' | 'open' | 'done';

const STEPS: Array<[number, string]> = [
  [0, 'Initializing'],
  [25, 'Loading assets'],
  [55, 'Compiling interface'],
  [85, 'Polishing pixels'],
  [100, 'Ready'],
];

// Dark theme: White -> Lavender -> Purple (#a78bfa) -> Electric Cyan (#38bdf8)
const DARK_STOPS: Array<[number, [number, number, number]]> = [
  [0, [255, 255, 255]],
  [0.45, [233, 227, 255]],
  [0.75, [167, 139, 250]],
  [1, [56, 189, 248]],
];

// Light theme: Dark Slate (#0f172a) -> Deep Indigo (#3730a3) -> Electric Violet (#6366f1) -> Azure (#0284c7)
const LIGHT_STOPS: Array<[number, [number, number, number]]> = [
  [0, [15, 23, 42]],
  [0.45, [55, 48, 163]],
  [0.75, [99, 102, 241]],
  [1, [2, 132, 199]],
];

function grad(t: number, stops: Array<[number, [number, number, number]]>): string {
  for (let i = 1; i < stops.length; i++) {
    if (t <= stops[i][0]) {
      const [t0, a] = stops[i - 1];
      const [t1, b] = stops[i];
      const k = (t - t0) / (t1 - t0);
      return `rgb(${a.map((v, j) => Math.round(v + (b[j] - v) * k)).join(',')})`;
    }
  }
  const last = stops[stops.length - 1][1];
  return `rgb(${last.join(',')})`;
}

const EASE_SMOOTH: [number, number, number, number] = [0.16, 1, 0.3, 1];
const EASE_SPLIT: [number, number, number, number] = [0.76, 0, 0.24, 1];

function getIsLight(): boolean {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('richard-portfolio-theme');
      if (saved === 'light') return true;
      if (saved === 'dark') return false;
    } catch {
      // storage access guard
    }
    if (document.documentElement.dataset.theme === 'light') return true;
    if (document.documentElement.getAttribute('data-theme') === 'light') return true;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return true;
    }
  }
  return false;
}

// Letter reveal with hardware accelerated GPU compositing (no blur filter raster stalls)
function NameLayer({
  text,
  fill,
  clip,
  isLight,
}: {
  text: string;
  fill?: boolean;
  clip?: MotionValue<string>;
  isLight: boolean;
}) {
  const chars = useMemo(() => Array.from(text), [text]);
  const stops = isLight ? LIGHT_STOPS : DARK_STOPS;

  return (
    <motion.span
      className={`ld-layer ${fill ? 'ld-fill' : 'ld-outline'}`}
      style={fill ? { clipPath: clip } : undefined}
      aria-hidden="true"
    >
      {chars.map((c, i) => (
        <motion.span
          key={i}
          className="ch"
          style={fill ? { color: grad(i / Math.max(chars.length - 1, 1), stops) } : undefined}
          initial={{ opacity: 0, y: '45%' }}
          animate={{ opacity: 1, y: '0%' }}
          transition={{ duration: 0.72, ease: EASE_SMOOTH, delay: 0.18 + i * 0.04 }}
        >
          {c === ' ' ? '\u00a0' : c}
        </motion.span>
      ))}
    </motion.span>
  );
}

// Odometer rolling digit with fluid tween easing (avoids spring oscillation jitter)
function Digit({ d, max }: { d: number; max: number }) {
  const n = max + 1;
  return (
    <div className="ld-col">
      <motion.div
        className="ld-strip"
        initial={{ y: '0%' }}
        animate={{ y: `${-(d / n) * 100}%` }}
        transition={{ duration: 0.26, ease: EASE_SMOOTH }}
      >
        {Array.from({ length: n }, (_, i) => (
          <span key={i}>{i}</span>
        ))}
      </motion.div>
    </div>
  );
}

export default function Loader({
  name = "Richard D'souza",
  ready = true,
  minMs = 2400,
  maxWaitMs = 10000,
  onDone,
}: LoaderProps) {
  const progress = useMotionValue(0);
  const [pct, setPct] = useState(0);
  const [phase, setPhase] = useState<Phase>('loading');
  const [isLight, setIsLight] = useState<boolean>(getIsLight);

  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phaseRef = useRef<Phase>('loading');
  const readyRef = useRef(ready);
  const onDoneRef = useRef(onDone);
  const doneRef = useRef(false);
  const prevOverflow = useRef<[string, string] | null>(null);
  const pageLoaded = useRef(typeof document !== 'undefined' && document.readyState === 'complete');
  const pointerRaf = useRef(0);
  const reduced = useMemo(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches, []);
  const duration = reduced ? 600 : minMs;

  useEffect(() => { readyRef.current = ready; }, [ready]);
  useEffect(() => { onDoneRef.current = onDone; }, [onDone]);
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  // Synchronize theme changes dynamically
  useEffect(() => {
    const checkTheme = () => setIsLight(getIsLight());
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'class'],
    });
    window.addEventListener('storage', checkTheme);
    return () => {
      observer.disconnect();
      window.removeEventListener('storage', checkTheme);
    };
  }, []);

  // Expose loader state: <html data-loader="loading|done">
  useEffect(() => {
    document.documentElement.dataset.loader = 'loading';
  }, []);

  // Real page load detection
  useEffect(() => {
    const onLoad = () => { pageLoaded.current = true; };
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, []);

  // Lock scroll while loader is visible, then restore previous inline styles
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    if (phase === 'loading' || phase === 'exit') {
      if (!prevOverflow.current) prevOverflow.current = [html.style.overflow, body.style.overflow];
      html.style.overflow = 'hidden';
      body.style.overflow = 'hidden';
    } else if (prevOverflow.current) {
      html.style.overflow = prevOverflow.current[0];
      body.style.overflow = prevOverflow.current[1];
      prevOverflow.current = null;
    }
  }, [phase]);

  useEffect(() => {
    return () => {
      if (prevOverflow.current) {
        document.documentElement.style.overflow = prevOverflow.current[0];
        document.body.style.overflow = prevOverflow.current[1];
        prevOverflow.current = null;
      }
      if (pointerRaf.current) {
        cancelAnimationFrame(pointerRaf.current);
      }
    };
  }, []);

  // Anti-lag progress animation loop: buttery smooth easing
  useEffect(() => {
    let raf = 0;
    let timer = 0;
    let shown = 0;
    let finished = false;
    const t0 = performance.now();

    const frame = (now: number) => {
      const k = Math.min((now - t0) / duration, 1);
      const forced = now - t0 > maxWaitMs;
      const cap = forced || (pageLoaded.current && readyRef.current) ? 100 : 90;
      const target = Math.min((1 - Math.pow(1 - k, 3)) * 100, cap);
      shown += (target - shown) * 0.16;
      if (target >= 100 && 100 - shown < 0.3) shown = 100;
      progress.set(shown);

      if (shown >= 100 && !finished) {
        finished = true;
        timer = window.setTimeout(() => setPhase('exit'), 300);
        return;
      }
      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
    };
  }, [duration, maxWaitMs, progress]);

  // Anti-lag: Only trigger React state change when the integer percent value changes
  useMotionValueEvent(progress, 'change', (v) => {
    const nextPct = Math.min(100, Math.floor(v + 0.0001));
    setPct((prev) => (prev === nextPct ? prev : nextPct));
  });

  // Exit transition
  useEffect(() => {
    if (phase !== 'exit') return;
    const id = window.setTimeout(() => setPhase('open'), 500);
    return () => window.clearTimeout(id);
  }, [phase]);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    document.documentElement.dataset.loader = 'done';
    window.dispatchEvent(new Event('loader:done'));
    setPhase('done');
    if (onDoneRef.current) onDoneRef.current();
  }, []);

  // Safety net if exit animation callback doesn't fire
  useEffect(() => {
    if (phase !== 'open') return;
    const id = window.setTimeout(finish, 1600);
    return () => window.clearTimeout(id);
  }, [phase, finish]);

  // 3D Constellation Sphere (with theme awareness)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      return createLoaderScene(canvas, {
        getProgress: () => progress.get() / 100,
        getExit: () => phaseRef.current !== 'loading',
        reduced,
        isLight,
      });
    } catch {
      return;
    }
  }, [progress, reduced, isLight]);

  // Transform scaleX for GPU compositor acceleration (zero layout reflows)
  const clip = useTransform(progress, (v) => `inset(-25% ${100 - v}% -25% 0)`);
  const scaleX = useTransform(progress, (v) => v / 100);
  const word = useMemo(() => STEPS.reduce((acc, [t, w]) => (pct >= t ? w : acc), STEPS[0][1]), [pct]);

  // Throttled mouse move for zero-lag ambient light tracking
  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (pointerRaf.current) return;
    const clientX = e.clientX;
    const clientY = e.clientY;
    pointerRaf.current = requestAnimationFrame(() => {
      pointerRaf.current = 0;
      const el = rootRef.current;
      if (!el) return;
      el.style.setProperty('--mx', `${clientX}px`);
      el.style.setProperty('--my', `${clientY}px`);
    });
  }, []);

  if (phase === 'done') return null;

  return (
    <div
      ref={rootRef}
      className={`ld-root ${isLight ? 'ld-light' : 'ld-dark'}`}
      data-theme={isLight ? 'light' : 'dark'}
      role="status"
      aria-live="polite"
      aria-label="Loading portfolio"
      onPointerMove={handlePointerMove}
    >
      <motion.div
        className="ld-panel ld-top"
        initial={false}
        animate={{ y: phase === 'open' ? '-101%' : '0%' }}
        transition={{ duration: 0.92, ease: EASE_SPLIT }}
      />
      <motion.div
        className="ld-panel ld-bot"
        initial={false}
        animate={{ y: phase === 'open' ? '101%' : '0%' }}
        transition={{ duration: 0.92, ease: EASE_SPLIT }}
        onAnimationComplete={() => {
          if (phaseRef.current === 'open') finish();
        }}
      />

      <motion.div
        className="ld-content"
        initial={false}
        animate={
          phase === 'loading'
            ? { opacity: 1, scale: 1 }
            : { opacity: 0, scale: 0.98 }
        }
        transition={{ duration: 0.45, ease: EASE_SMOOTH }}
      >
        <div className="ld-glow" aria-hidden="true" />
        <span className="ld-blob ld-b1" aria-hidden="true" />
        <span className="ld-blob ld-b2" aria-hidden="true" />
        <canvas ref={canvasRef} className="ld-canvas" aria-hidden="true" />
        <span className="ld-grain" aria-hidden="true" />

        {/* Top bar with exact RD Brand Logo (matching header) */}
        <div className="ld-topbar" aria-hidden="true">
          <div className="ld-brand-logo inline-flex items-center shrink-0">
            <img
              src="/logo-dark.png"
              alt="Richard D'souza"
              className="nav-logo-dark ld-logo-img shrink-0 object-contain"
              width="128"
              height="32"
            />
            <img
              src="/logo-light.png"
              alt="Richard D'souza"
              className="nav-logo-light ld-logo-img shrink-0 object-contain"
              width="128"
              height="32"
            />
          </div>
        </div>

        {/* Wordmark heading: Professional, refined sizing */}
        <div className="ld-name" role="img" aria-label={name}>
          <NameLayer text={name} isLight={isLight} />
          <NameLayer text={name} fill clip={clip} isLight={isLight} />
        </div>

        {/* Bottom bar: telemetry left, radiant rolling counter right */}
        <div className="ld-bar">
          <div className="ld-status">
            <span className="ld-dot" />
            <motion.span
              key={word}
              className="ld-word"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: EASE_SMOOTH }}
            >
              {word}
            </motion.span>
          </div>

          <div className="ld-count" aria-hidden="true">
            <motion.div
              className="ld-col"
              initial={{ width: '0em' }}
              animate={{ width: pct >= 100 ? '0.62em' : '0em' }}
              transition={{ duration: 0.28, ease: EASE_SMOOTH }}
            >
              <motion.div
                className="ld-strip"
                initial={{ y: '0%' }}
                animate={{ y: pct >= 100 ? '-50%' : '0%' }}
                transition={{ duration: 0.28, ease: EASE_SMOOTH }}
              >
                <span>0</span>
                <span>1</span>
              </motion.div>
            </motion.div>
            <Digit d={Math.floor(pct / 10) % 10} max={9} />
            <Digit d={pct % 10} max={9} />
            <span className="ld-pct">%</span>
          </div>
        </div>

        {/* Bottom hairline progress line (hardware accelerated scaleX) */}
        <div className="ld-line">
          <motion.div
            className="ld-line-fill"
            style={{ scaleX, transformOrigin: '0% 50%' }}
          />
        </div>
      </motion.div>

      {/* Light seam where panels split */}
      <motion.div
        className="ld-seam"
        aria-hidden="true"
        initial={{ opacity: 0, scaleX: 0.1 }}
        animate={
          phase === 'exit'
            ? { opacity: 1, scaleX: 1 }
            : phase === 'open'
              ? { opacity: 0, scaleX: 1 }
              : { opacity: 0, scaleX: 0.1 }
        }
        transition={{ duration: 0.45, ease: EASE_SPLIT }}
      />
    </div>
  );
}
