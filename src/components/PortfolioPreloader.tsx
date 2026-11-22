import { useEffect, useRef, useState } from 'react'

type PortfolioPreloaderProps = {
  onComplete?: () => void
}

// Dark stops: white → lavender → purple (#a78bfa) → blue (#38bdf8)
const DARK_STOPS: [number, [number, number, number]][] = [
  [0, [255, 255, 255]],
  [0.45, [233, 227, 255]],
  [0.75, [167, 139, 250]],
  [1, [56, 189, 248]],
]

// Light stops: dark slate (#0f172a) → deep indigo (#3730a3) → electric violet (#6366f1) → azure (#0284c7)
const LIGHT_STOPS: [number, [number, number, number]][] = [
  [0, [15, 23, 42]],
  [0.45, [55, 48, 163]],
  [0.75, [99, 102, 241]],
  [1, [2, 132, 199]],
]

function interpolateStops(t: number, stops: [number, [number, number, number]][]): string {
  for (let i = 1; i < stops.length; i++) {
    if (t <= stops[i][0]) {
      const a = stops[i - 1], b = stops[i]
      const k = (t - a[0]) / (b[0] - a[0])
      return `rgb(${Math.round(a[1][0] + (b[1][0] - a[1][0]) * k)},${Math.round(a[1][1] + (b[1][1] - a[1][1]) * k)},${Math.round(a[1][2] + (b[1][2] - a[1][2]) * k)})`
    }
  }
  const last = stops[stops.length - 1][1]
  return `rgb(${last[0]},${last[1]},${last[2]})`
}

const STEPS: [number, string][] = [
  [0, 'Initializing'],
  [25, 'Loading assets'],
  [55, 'Compiling interface'],
  [85, 'Polishing pixels'],
  [100, 'Ready'],
]

const NAME_LETTERS = Array.from("Richard D'souza").map((c, i, arr) => {
  const t = i / Math.max(arr.length - 1, 1)
  return {
    char: c === ' ' ? '\u00a0' : c,
    i,
    darkColor: interpolateStops(t, DARK_STOPS),
    lightColor: interpolateStops(t, LIGHT_STOPS),
  }
})

function getInitialTheme(): 'light' | 'dark' {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('richard-portfolio-theme')
      if (saved === 'light' || saved === 'dark') return saved
    } catch {
      /* ignore storage access errors in restricted contexts */
    }
    if (document.documentElement.dataset.theme === 'light') return 'light'
    if (document.documentElement.dataset.theme === 'dark') return 'dark'
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light'
    }
  }
  return 'dark'
}

export default function PortfolioPreloader({ onComplete }: PortfolioPreloaderProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme)
  const [isExit, setIsExit] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isGone, setIsGone] = useState(false)

  const loaderRef = useRef<HTMLDivElement>(null)
  const wordRef = useRef<HTMLSpanElement>(null)
  const hColRef = useRef<HTMLDivElement>(null)
  const hStripRef = useRef<HTMLDivElement>(null)
  const tStripRef = useRef<HTMLDivElement>(null)
  const oStripRef = useRef<HTMLDivElement>(null)

  const rafRef = useRef<number>(0)
  const doneRef = useRef(false)
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    const updateTheme = () => {
      setTheme(getInitialTheme())
    }
    const observer = new MutationObserver(updateTheme)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] })
    window.addEventListener('storage', updateTheme)

    const L = loaderRef.current
    if (!L) {
      return () => {
        observer.disconnect()
        window.removeEventListener('storage', updateTheme)
      }
    }

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const MIN_MS = reduce ? 350 : 2400

    document.body.classList.add('is-loading')

    // Cursor / touch follower glow
    const setGlow = (x: number, y: number) => {
      L.style.setProperty('--mx', x + 'px')
      L.style.setProperty('--my', y + 'px')
    }
    const onMouseMove = (e: MouseEvent) => setGlow(e.clientX, e.clientY)
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches && e.touches[0]) {
        setGlow(e.touches[0].clientX, e.touches[0].clientY)
      }
    }
    window.addEventListener('mousemove', onMouseMove, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })

    // Page loading status
    let loaded = document.readyState === 'complete'
    const onLoad = () => { loaded = true }
    window.addEventListener('load', onLoad)

    // Failsafe: mark loaded after 4s so mobile or slow network never gets stuck at 90%
    const loadFailsafe = setTimeout(() => { loaded = true }, 4000)
    timersRef.current.push(loadFailsafe)

    let shown = 0
    let currentWord = ''
    const t0 = performance.now()

    function render(v: number) {
      const n = Math.min(100, Math.floor(v + 0.0001))
      L?.style.setProperty('--p', v.toFixed(2) + '%')

      const d = [n >= 100 ? 1 : 0, Math.floor(n / 10) % 10, n % 10]
      if (hStripRef.current) hStripRef.current.style.transform = `translateY(${-d[0]}em)`
      if (tStripRef.current) tStripRef.current.style.transform = `translateY(${-d[1]}em)`
      if (oStripRef.current) oStripRef.current.style.transform = `translateY(${-d[2]}em)`
      if (hColRef.current) hColRef.current.classList.toggle('on', n >= 100)

      let w = STEPS[0][1]
      for (const [thr, lbl] of STEPS) {
        if (n >= thr) w = lbl
      }
      if (w !== currentWord && wordRef.current) {
        currentWord = w
        wordRef.current.textContent = w
        wordRef.current.classList.remove('swap')
        void wordRef.current.offsetWidth
        wordRef.current.classList.add('swap')
      }
    }

    function finish() {
      if (doneRef.current) return
      doneRef.current = true

      // Step 1: brief pause at 100% (Ready), then blur content & flash light seam
      const t1 = setTimeout(() => {
        setIsExit(true)

        // Step 2: 600ms later, split open the panels to reveal the page
        const t2 = setTimeout(() => {
          setIsOpen(true)
          document.body.classList.remove('is-loading')
          document.body.classList.add('is-ready')
          window.dispatchEvent(new Event('loader:done'))

          // Step 3: after panels have slid out of view (1100ms), cleanly unmount
          const t3 = setTimeout(() => {
            setIsGone(true)
            onComplete?.()
          }, 1100)
          timersRef.current.push(t3)
        }, 600)
        timersRef.current.push(t2)
      }, 350)
      timersRef.current.push(t1)
    }

    function frame(now: number) {
      const k = Math.min((now - t0) / MIN_MS, 1)
      const target = Math.min((1 - Math.pow(1 - k, 3)) * 100, loaded ? 100 : 90)
      shown += (target - shown) * 0.08
      if (target >= 100 && 100 - shown < 0.4) shown = 100
      render(shown)
      if (shown >= 100) return finish()
      rafRef.current = requestAnimationFrame(frame)
    }

    // Safety timeout: never hang more than 7.5 seconds under any circumstance
    const safetyTimer = setTimeout(() => {
      if (!doneRef.current) finish()
    }, 7500)
    timersRef.current.push(safetyTimer)

    if (reduce) {
      render(100)
      finish()
    } else {
      render(0)
      rafRef.current = requestAnimationFrame(frame)
    }

    const activeTimers = timersRef.current

    return () => {
      cancelAnimationFrame(rafRef.current)
      activeTimers.forEach((t) => clearTimeout(t))
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('load', onLoad)
      window.removeEventListener('storage', updateTheme)
      observer.disconnect()
      document.body.classList.remove('is-loading')
    }
  }, [onComplete])

  if (isGone) return null

  const isLight = theme === 'light'

  return (
    <div
      id="ld-root"
      ref={loaderRef}
      data-theme={theme}
      className={`${isExit ? 'is-exit' : ''} ${isOpen ? 'is-open' : ''} ${isLight ? 'ld-light' : 'ld-dark'}`}
      role="status"
      aria-live="polite"
      aria-label="Loading portfolio"
    >
      {/* Upper split panel */}
      <div
        className="ld-panel ld-top"
        style={{ background: isLight ? '#f8fafc' : '#06070d' }}
      />
      {/* Lower split panel */}
      <div
        className="ld-panel ld-bot"
        style={{ background: isLight ? '#f8fafc' : '#06070d' }}
      />

      {/* Center content (blurs out on is-exit) */}
      <div className="ld-content">
        <div
          className="ld-glow"
          style={{
            background: isLight
              ? 'radial-gradient(520px circle at var(--mx) var(--my), rgba(99, 102, 241, 0.12), transparent 62%)'
              : 'radial-gradient(520px circle at var(--mx) var(--my), rgba(124, 92, 255, 0.22), transparent 62%)',
          }}
          aria-hidden="true"
        />
        <span
          className="ld-blob ld-b1"
          style={{
            background: isLight ? '#a5b4fc' : '#5b21b6',
            opacity: isLight ? 0.14 : 0.26,
          }}
          aria-hidden="true"
        />
        <span
          className="ld-blob ld-b2"
          style={{
            background: isLight ? '#93c5fd' : '#0284c7',
            opacity: isLight ? 0.14 : 0.26,
          }}
          aria-hidden="true"
        />
        <span
          className="ld-grain"
          style={{
            opacity: isLight ? 0.025 : 0.07,
            mixBlendMode: isLight ? 'multiply' : 'overlay',
          }}
          aria-hidden="true"
        />

        {/* Name typography — pre-rendered in JSX for instant display */}
        <h1 className="ld-name" aria-label="Richard D'souza">
          <span
            className="ld-layer ld-outline"
            style={{
              WebkitTextStroke: isLight
                ? '1.5px rgba(15, 23, 42, 0.22)'
                : '1px rgba(255, 255, 255, 0.32)',
            }}
            aria-hidden="true"
          >
            {NAME_LETTERS.map((item, idx) => (
              <span
                key={idx}
                className="ld-ch"
                style={{
                  ['--i' as string]: item.i,
                }}
              >
                {item.char}
              </span>
            ))}
          </span>
          <span className="ld-layer ld-fill" aria-hidden="true">
            {NAME_LETTERS.map((item, idx) => (
              <span
                key={idx}
                className="ld-ch"
                style={{
                  ['--i' as string]: item.i,
                  color: isLight ? item.lightColor : item.darkColor,
                }}
              >
                {item.char}
              </span>
            ))}
          </span>
        </h1>

        {/* Bottom bar: status telemetry left, rolling odometer right */}
        <div className="ld-bar">
          <div
            className="ld-status"
            style={{ color: isLight ? '#64748b' : '#8b90a7' }}
          >
            <span
              className="ld-dot"
              style={{ background: isLight ? '#4f46e5' : '#38bdf8' }}
            />
            <span ref={wordRef} className="ld-word swap">Initializing</span>
          </div>

          <div className="ld-count" aria-hidden="true">
            <div ref={hColRef} className="ld-col h">
              <div ref={hStripRef} className="ld-strip">
                <span style={isLight ? { background: 'linear-gradient(180deg, #0f172a 12%, #4338ca 52%, #0284c7 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' } : undefined}>0</span>
                <span style={isLight ? { background: 'linear-gradient(180deg, #0f172a 12%, #4338ca 52%, #0284c7 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' } : undefined}>1</span>
              </div>
            </div>
            <div className="ld-col">
              <div ref={tStripRef} className="ld-strip">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                  <span
                    key={n}
                    style={isLight ? { background: 'linear-gradient(180deg, #0f172a 12%, #4338ca 52%, #0284c7 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', filter: 'drop-shadow(0 2px 10px rgba(79, 70, 229, 0.2))' } : undefined}
                  >
                    {n}
                  </span>
                ))}
              </div>
            </div>
            <div className="ld-col">
              <div ref={oStripRef} className="ld-strip">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                  <span
                    key={n}
                    style={isLight ? { background: 'linear-gradient(180deg, #0f172a 12%, #4338ca 52%, #0284c7 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', filter: 'drop-shadow(0 2px 10px rgba(79, 70, 229, 0.2))' } : undefined}
                  >
                    {n}
                  </span>
                ))}
              </div>
            </div>
            <span
              className="ld-pct"
              style={{
                color: isLight ? '#4f46e5' : '#38bdf8',
                textShadow: isLight ? '0 0 10px rgba(79, 70, 229, 0.3)' : '0 0 12px rgba(56, 189, 248, 0.65)',
              }}
            >
              %
            </span>
          </div>
        </div>

        {/* Hairline glowing progress line along bottom edge */}
        <div
          className="ld-line"
          style={{ background: isLight ? 'rgba(15, 23, 42, 0.08)' : 'rgba(255, 255, 255, 0.08)' }}
        />
      </div>

      {/* Light seam where split panels part */}
      <div
        className="ld-seam"
        style={{
          background: isLight
            ? 'linear-gradient(90deg, transparent, #4f46e5, transparent)'
            : 'linear-gradient(90deg, transparent, #38bdf8, transparent)',
        }}
        aria-hidden="true"
      />
    </div>
  )
}
