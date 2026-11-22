import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import type { PublicProfile } from '../lib/profile'
import './footer.css'

interface FooterProps {
  profile?: PublicProfile | null
  saveScrollPosition?: () => void
}

export const Footer: React.FC<FooterProps> = ({ profile, saveScrollPosition }) => {
  const footerRef = useRef<HTMLElement>(null)
  const wmRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<SVGCircleElement>(null)

  const [timeStr, setTimeStr] = useState<string>('')

  const fullName = profile?.full_name || "Richard D'souza"
  const professionalTitle = profile?.professional_title || 'Software Developer'
  const githubUrl = profile?.github_url || 'https://github.com/aestheticwolf'
  const linkedinUrl = profile?.linkedin_url || 'https://www.linkedin.com/'
  const emailUrl = 'mailto:rich.dsz1997@gmail.com'
  const wordmarkText = (profile?.full_name || "Richard D'souza").toUpperCase()

  // 1. Live Mumbai Time (Asia/Kolkata)
  useEffect(() => {
    document.documentElement.classList.add('sf-js')

    const fmt = new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Kolkata',
    })

    const tick = () => {
      setTimeStr(fmt.format(new Date()))
    }

    tick()
    const timer = window.setInterval(tick, 1000)

    return () => {
      window.clearInterval(timer)
    }
  }, [])

  // 2. Entrance Animation + Pause Aurora Off-Screen
  useEffect(() => {
    const footer = footerRef.current
    if (!footer) return

    if ('IntersectionObserver' in window) {
      const revealObs = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              footer.classList.add('sf-in')
              revealObs.disconnect()
            }
          })
        },
        { threshold: 0.15 }
      )
      revealObs.observe(footer)

      const screenObs = new IntersectionObserver((entries) => {
        const isOffscreen = !entries[0].isIntersecting
        footer.classList.toggle('sf-offscreen', isOffscreen)
      })
      screenObs.observe(footer)

      return () => {
        revealObs.disconnect()
        screenObs.disconnect()
      }
    } else {
      footer.classList.add('sf-in')
    }
  }, [])

  // 3. Spotlight Wordmark (Interactive Cursor & Auto-Sweep on Touch)
  useEffect(() => {
    const footer = footerRef.current
    const wm = wmRef.current
    if (!footer || !wm) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      wm.style.setProperty('--o', '0')
      return
    }

    let cx = 0
    let cy = 0
    let tx = 0
    let ty = 0
    let o = 0
    let to = 0
    let raf: number | null = null
    const t0 = performance.now()
    let lastPointerTime = 0

    // Cache dimensions to avoid layout thrashing in RAF loop
    let wmRect = wm.getBoundingClientRect()
    const updateWmRect = () => {
      if (wm) wmRect = wm.getBoundingClientRect()
    }
    window.addEventListener('resize', updateWmRect, { passive: true })

    function loop(now: number) {
      // If no pointer interaction for 1.8s, glide with ambient auto-sweep
      const isAutoSweeping = now - lastPointerTime > 1800
      if (isAutoSweeping && wmRect.width > 0) {
        const w = wmRect.width
        const h = wmRect.height
        const p = (Math.sin((now - t0) / 2200) + 1) / 2
        tx = p * w
        ty = h / 2
        to = 0.85
      }

      cx += (tx - cx) * 0.14
      cy += (ty - cy) * 0.14
      o += (to - o) * 0.1

      if (wm) {
        wm.style.setProperty('--mx', `${cx.toFixed(1)}px`)
        wm.style.setProperty('--my', `${cy.toFixed(1)}px`)
        wm.style.setProperty('--o', o.toFixed(3))
      }
      raf = requestAnimationFrame(loop)
    }

    function start() {
      if (!raf) {
        updateWmRect()
        raf = requestAnimationFrame(loop)
      }
    }

    function stop() {
      if (raf) {
        cancelAnimationFrame(raf)
        raf = null
      }
    }

    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        start()
      } else {
        stop()
      }
    })
    obs.observe(footer)

    const handlePointerMove = (clientX: number, clientY: number) => {
      lastPointerTime = performance.now()
      tx = clientX - wmRect.left
      ty = clientY - wmRect.top
      to = 1
    }

    const onMouseMove = (e: MouseEvent) => {
      handlePointerMove(e.clientX, e.clientY)
    }

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) {
        handlePointerMove(e.touches[0].clientX, e.touches[0].clientY)
      }
    }

    const onPointerLeave = () => {
      to = 0
    }

    footer.addEventListener('mousemove', onMouseMove, { passive: true })
    footer.addEventListener('touchmove', onTouchMove, { passive: true })
    footer.addEventListener('touchstart', onTouchMove, { passive: true })
    footer.addEventListener('mouseleave', onPointerLeave)

    return () => {
      obs.disconnect()
      stop()
      window.removeEventListener('resize', updateWmRect)
      footer.removeEventListener('mousemove', onMouseMove)
      footer.removeEventListener('touchmove', onTouchMove)
      footer.removeEventListener('touchstart', onTouchMove)
      footer.removeEventListener('mouseleave', onPointerLeave)
    }
  }, [])

  // 4. Glow-Border + Magnetic Pills
  useEffect(() => {
    const footer = footerRef.current
    if (!footer) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const MAGNET = 5
    const pills = footer.querySelectorAll<HTMLElement>('.sf-pill')

    const cleanups: (() => void)[] = []

    pills.forEach((pill) => {
      let r = pill.getBoundingClientRect()
      const refreshRect = () => {
        r = pill.getBoundingClientRect()
      }

      const updateCoords = (clientX: number, clientY: number) => {
        const x = clientX - r.left
        const y = clientY - r.top
        pill.style.setProperty('--x', `${x.toFixed(1)}px`)
        pill.style.setProperty('--y', `${y.toFixed(1)}px`)
        if (!reduce) {
          pill.style.setProperty('--tx', `${((x / r.width - 0.5) * 2 * MAGNET).toFixed(1)}px`)
          pill.style.setProperty('--ty', `${((y / r.height - 0.5) * 2 * MAGNET).toFixed(1)}px`)
        }
      }

      const onMouseMove = (e: MouseEvent) => {
        updateCoords(e.clientX, e.clientY)
      }

      const onTouchMove = (e: TouchEvent) => {
        if (e.touches[0]) {
          updateCoords(e.touches[0].clientX, e.touches[0].clientY)
        }
      }

      const onLeave = () => {
        pill.style.setProperty('--tx', '0px')
        pill.style.setProperty('--ty', '0px')
      }

      pill.addEventListener('mouseenter', refreshRect, { passive: true })
      pill.addEventListener('touchstart', refreshRect, { passive: true })
      pill.addEventListener('mousemove', onMouseMove, { passive: true })
      pill.addEventListener('touchmove', onTouchMove, { passive: true })
      pill.addEventListener('mouseleave', onLeave)
      pill.addEventListener('touchend', onLeave)

      cleanups.push(() => {
        pill.removeEventListener('mouseenter', refreshRect)
        pill.removeEventListener('touchstart', refreshRect)
        pill.removeEventListener('mousemove', onMouseMove)
        pill.removeEventListener('touchmove', onTouchMove)
        pill.removeEventListener('mouseleave', onLeave)
        pill.removeEventListener('touchend', onLeave)
      })
    })

    return () => {
      cleanups.forEach((c) => c())
    }
  }, [])

  // 5. Scroll-Progress "Back to Top"
  useEffect(() => {
    const ring = ringRef.current
    if (!ring) return
    const C = 100.53

    let ticking = false
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      const p = max > 0 ? Math.min(window.scrollY / max, 1) : 0
      ring.style.strokeDashoffset = (C * (1 - p)).toFixed(2)
      ticking = false
    }

    const onScroll = () => {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(update)
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', update, { passive: true })
    update()

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', update)
    }
  }, [])

  const handleBackToTop = () => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
  }

  return (
    <footer className="site-footer" id="site-footer" ref={footerRef}>
      {/* Living aurora + grain (decorative) */}
      <div className="sf-aurora" aria-hidden="true">
        <span className="sf-blob sf-b1" />
        <span className="sf-blob sf-b2" />
        <span className="sf-blob sf-b3" />
        <span className="sf-grain" />
      </div>

      <div className="sf-inner">
        <div className="sf-top">
          {/* Brand */}
          <div className="sf-brand sf-reveal" style={{ '--i': 0 } as React.CSSProperties}>
            <div className="sf-logo">RD</div>
            <div className="sf-brand-text">
              <h2 className="sf-name">
                {fullName} <span className="sf-dot" aria-hidden="true" />
              </h2>
              <p className="sf-role">
                <span className="sf-title">{professionalTitle}</span>
                <span className="sf-sep" aria-hidden="true" />
                <span className="sf-tagline">Crafting dependable digital products with clean architecture.</span>
              </p>
              <p className="sf-status">
                Mumbai &middot; <time id="sf-time">{timeStr || '--:--'}</time> IST &middot; Available for work
              </p>
            </div>
          </div>

          {/* Link pills */}
          <nav className="sf-links sf-reveal" style={{ '--i': 1 } as React.CSSProperties} aria-label="Social links">
            <a className="sf-pill" href={githubUrl} target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.69 1.25 3.35.96.1-.74.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.18 1.83 1.18 3.09 0 4.42-2.7 5.4-5.27 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
              </svg>
              <span className="sf-roll">
                <span>GitHub</span>
                <span aria-hidden="true">GitHub</span>
              </span>
            </a>

            <a className="sf-pill" href={linkedinUrl} target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45Z" />
              </svg>
              <span className="sf-roll">
                <span>LinkedIn</span>
                <span aria-hidden="true">LinkedIn</span>
              </span>
            </a>

            <a className="sf-pill" href={emailUrl}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 2 11 13" />
                <path d="M22 2 15 22l-4-9-9-4 20-7Z" />
              </svg>
              <span className="sf-roll">
                <span>Email</span>
                <span aria-hidden="true">Email</span>
              </span>
            </a>

            <Link to="/request-resume" onClick={saveScrollPosition} className="sf-pill sf-pill-primary">
              <span className="sf-roll">
                <span>Resume</span>
                <span aria-hidden="true">Resume</span>
              </span>
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M7 17 17 7" />
                <path d="M8 7h9v9" />
              </svg>
            </Link>
          </nav>
        </div>

        {/* Giant spotlight wordmark (decorative) */}
        <div className="sf-wordmark" id="sf-wordmark" ref={wmRef} aria-hidden="true">
          <span className="sf-wm sf-wm-base">{wordmarkText}</span>
          <span className="sf-wm sf-wm-lit">{wordmarkText}</span>
        </div>

        <div className="sf-bottom sf-reveal" style={{ '--i': 2 } as React.CSSProperties}>
          <p className="sf-copy">
            &copy; <span id="sf-year">{new Date().getFullYear()}</span> <strong>{fullName}</strong>. All rights reserved.
          </p>

          <button className="sf-top-btn" id="sf-top" type="button" onClick={handleBackToTop} aria-label="Back to top">
            <span>Back to top</span>
            <span className="sf-ring">
              <svg viewBox="0 0 36 36" width="24" height="24" aria-hidden="true">
                <circle className="sf-ring-bg" cx="18" cy="18" r="16" />
                <circle ref={ringRef} className="sf-ring-fg" id="sf-ring-fg" cx="18" cy="18" r="16" />
              </svg>
              <svg className="sf-arrow" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 19V5" />
                <path d="m5 12 7-7 7 7" />
              </svg>
            </span>
          </button>
        </div>
      </div>
    </footer>
  )
}

export default Footer
