import React, { useEffect, useRef, useState, useCallback } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import {
  House,
  UserRound,
  Code2,
  Award,
  Layers3,
  Mail,
  type LucideIcon,
} from 'lucide-react'

type NavItem = {
  id: string
  label: string
  href: string
  icon: LucideIcon
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', href: '#home', icon: House },
  { id: 'about', label: 'About', href: '#about', icon: UserRound },
  { id: 'skills', label: 'Skills', href: '#skills', icon: Code2 },
  { id: 'certifications', label: 'Certifications', href: '#certifications', icon: Award },
  { id: 'projects', label: 'Projects', href: '#projects', icon: Layers3 },
  { id: 'contact', label: 'Contact', href: '#contact', icon: Mail },
]

const IDLE_TIMEOUT_MS = 5000

interface FloatingNavProps {
  activeSection: string
  onSectionSelect?: (id: string) => void
}

export const FloatingNav: React.FC<FloatingNavProps> = ({
  activeSection,
  onSectionSelect,
}) => {
  const prefersReducedMotion = useReducedMotion() ?? false
  const [isIdle, setIsIdle] = useState(false)

  const isIdleRef = useRef(false)
  const isHoveredRef = useRef(false)
  const isFocusedRef = useRef(false)
  const timerRef = useRef<number | null>(null)
  const lastActivityRef = useRef<number>(0)

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const startIdleTimer = useCallback(() => {
    clearTimer()
    if (isHoveredRef.current || isFocusedRef.current) {
      return
    }
    timerRef.current = window.setTimeout(() => {
      if (!isHoveredRef.current && !isFocusedRef.current) {
        isIdleRef.current = true
        setIsIdle(true)
      }
    }, IDLE_TIMEOUT_MS)
  }, [clearTimer])

  const wakeUpAndResetTimer = useCallback(() => {
    if (isIdleRef.current) {
      isIdleRef.current = false
      setIsIdle(false)
    }
    startIdleTimer()
  }, [startIdleTimer])

  // Global activity listener across all screen sizes (desktop, laptop, tablet, mobile)
  useEffect(() => {
    startIdleTimer()

    const handleUserActivity = () => {
      const now = Date.now()
      // If idle, restore normal visibility immediately; if active, throttle timer resets
      if (isIdleRef.current || now - lastActivityRef.current > 250) {
        lastActivityRef.current = now
        wakeUpAndResetTimer()
      }
    }

    const events: (keyof WindowEventMap)[] = [
      'mousemove',
      'mousedown',
      'keydown',
      'touchstart',
      'touchmove',
      'touchend',
      'scroll',
    ]

    const options: AddEventListenerOptions = { passive: true }

    events.forEach((eventType) => {
      window.addEventListener(eventType, handleUserActivity, options)
    })

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        handleUserActivity()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearTimer()
      events.forEach((eventType) => {
        window.removeEventListener(eventType, handleUserActivity)
      })
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [clearTimer, startIdleTimer, wakeUpAndResetTimer])

  // Desktop/laptop mouse hover handlers for nav container
  const handleNavMouseEnter = () => {
    isHoveredRef.current = true
    if (isIdleRef.current) {
      isIdleRef.current = false
      setIsIdle(false)
    }
    clearTimer()
  }

  const handleNavMouseLeave = () => {
    isHoveredRef.current = false
    startIdleTimer()
  }

  // Keyboard accessibility focus handlers
  const handleNavFocus = () => {
    isFocusedRef.current = true
    if (isIdleRef.current) {
      isIdleRef.current = false
      setIsIdle(false)
    }
    clearTimer()
  }

  const handleNavBlur = (e: React.FocusEvent<HTMLElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
      isFocusedRef.current = false
      startIdleTimer()
    }
  }

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()

    wakeUpAndResetTimer()

    if (onSectionSelect) {
      onSectionSelect(id)
    }

    if (id === 'home') {
      sessionStorage.removeItem('portfolio_restore_pending')
      sessionStorage.setItem('portfolio_home_scroll', '0')
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
      })
      if (window.location.hash) {
        history.replaceState(null, '', window.location.pathname)
      }
      return
    }

    const targetEl = document.getElementById(id)
    if (targetEl) {
      targetEl.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'start',
      })
      history.replaceState(null, '', `#${id}`)
    }
  }

  return (
    <>
      {/* ─────────────────────────────────────────────────────────────
          1. DESKTOP FLOATING SIDE NAVIGATION (Right Side of Viewport)
          ───────────────────────────────────────────────────────────── */}
      <nav
        aria-label="Side section navigation"
        onMouseEnter={handleNavMouseEnter}
        onMouseLeave={handleNavMouseLeave}
        onFocus={handleNavFocus}
        onBlur={handleNavBlur}
        className={`floating-side-nav fixed right-4 lg:right-6 top-1/2 -translate-y-1/2 z-50 hidden md:flex flex-col items-center gap-2 p-2 rounded-full select-none ${
          isIdle ? 'is-idle' : ''
        }`}
      >
        {/* Subtle Ambient Radial Backlight Glow */}
        <div
          aria-hidden="true"
          className="floating-nav-ambient-glow absolute -inset-1 rounded-full bg-linear-to-b from-violet-600/20 via-purple-600/10 to-indigo-600/20 blur-md pointer-events-none -z-10 opacity-70"
        />

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = activeSection === item.id

          return (
            <a
              key={item.id}
              href={item.href}
              onClick={(e) => handleNavClick(e, item.id)}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              className={`floating-nav-item group relative flex items-center justify-center w-11 h-11 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#08090d] ${
                isActive
                  ? 'is-active text-violet-300'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {/* Active Background Pill with Spring Animation */}
              {isActive && (
                <motion.span
                  layoutId="floating-side-nav-active-pill"
                  className="floating-nav-active-bg absolute inset-0 rounded-full"
                  transition={
                    prefersReducedMotion
                      ? { duration: 0 }
                      : { type: 'spring', stiffness: 420, damping: 32 }
                  }
                  aria-hidden="true"
                />
              )}

              {/* Active Ambient Glow Halo */}
              {isActive && (
                <span
                  aria-hidden="true"
                  className="absolute inset-0 rounded-full bg-violet-500/20 blur-sm pointer-events-none"
                />
              )}

              {/* Navigation Icon */}
              <Icon
                size={19}
                className={`floating-nav-icon relative z-10 transition-transform duration-300 ${
                  isActive
                    ? 'scale-110 drop-shadow-[0_0_8px_rgba(167,139,250,0.7)]'
                    : 'group-hover:scale-110 group-hover:text-zinc-200'
                }`}
                strokeWidth={isActive ? 2.25 : 1.85}
              />

              {/* Micro Active Dot Indicator */}
              {isActive && (
                <span
                  aria-hidden="true"
                  className="floating-nav-micro-dot absolute right-1.5 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-violet-400 shadow-[0_0_6px_#a78bfa]"
                />
              )}

              {/* Desktop Tooltip (Points to the left of the side dock toward content) */}
              <div
                role="tooltip"
                className="floating-nav-tooltip absolute right-full mr-3.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-0 translate-x-2 scale-95 group-hover:opacity-100 group-hover:translate-x-0 group-hover:scale-100 group-focus-visible:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:scale-100 transition-all duration-200 ease-out z-20 flex items-center"
              >
                <div className="floating-nav-tooltip-inner relative px-3 py-1.5 rounded-lg text-xs font-medium tracking-wide whitespace-nowrap shadow-xl">
                  {item.label}
                  {/* Tooltip Caret Pointer */}
                  <span
                    aria-hidden="true"
                    className="floating-nav-tooltip-arrow absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 rotate-45"
                  />
                </div>
              </div>
            </a>
          )
        })}
      </nav>

      {/* ─────────────────────────────────────────────────────────────
          2. MOBILE FLOATING BOTTOM NAVIGATION (Bottom Center of Viewport)
          ───────────────────────────────────────────────────────────── */}
      <nav
        aria-label="Mobile section navigation"
        onMouseEnter={handleNavMouseEnter}
        onMouseLeave={handleNavMouseLeave}
        onFocus={handleNavFocus}
        onBlur={handleNavBlur}
        className={`floating-bottom-nav fixed bottom-4 inset-x-0 mx-auto w-fit z-50 md:hidden flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 rounded-full select-none ${
          isIdle ? 'is-idle' : ''
        }`}
        style={{
          bottom: 'max(1rem, env(safe-area-inset-bottom, 1rem))',
        }}
      >
        {/* Subtle Ambient Radial Backlight Glow */}
        <div
          aria-hidden="true"
          className="floating-nav-ambient-glow absolute -inset-1 rounded-full bg-linear-to-r from-violet-600/20 via-purple-600/15 to-indigo-600/20 blur-md pointer-events-none -z-10 opacity-70"
        />

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = activeSection === item.id

          return (
            <a
              key={item.id}
              href={item.href}
              onClick={(e) => handleNavClick(e, item.id)}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              className={`floating-bottom-nav-item group relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full transition-all duration-300 touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 ${
                isActive
                  ? 'is-active text-violet-300'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {/* Active Background Pill with Spring Animation */}
              {isActive && (
                <motion.span
                  layoutId="floating-bottom-nav-active-pill"
                  className="floating-nav-active-bg absolute inset-0 rounded-full"
                  transition={
                    prefersReducedMotion
                      ? { duration: 0 }
                      : { type: 'spring', stiffness: 420, damping: 32 }
                  }
                  aria-hidden="true"
                />
              )}

              {/* Active Ambient Glow */}
              {isActive && (
                <span
                  aria-hidden="true"
                  className="absolute inset-0 rounded-full bg-violet-500/20 blur-sm pointer-events-none"
                />
              )}

              {/* Navigation Icon */}
              <Icon
                size={18}
                className={`floating-nav-icon relative z-10 transition-transform duration-300 ${
                  isActive
                    ? 'scale-110 drop-shadow-[0_0_8px_rgba(167,139,250,0.7)]'
                    : 'group-active:scale-95'
                }`}
                strokeWidth={isActive ? 2.25 : 1.85}
              />
            </a>
          )
        })}
      </nav>
    </>
  )
}

export default FloatingNav
