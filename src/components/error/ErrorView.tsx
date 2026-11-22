import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import { ArrowLeft, Home, RefreshCw, AlertTriangle } from 'lucide-react'
import ThemeToggle from '../ThemeToggle'
import { MusicButton } from '../music'
import BackgroundAnimation from '../BackgroundAnimation'
import ErrorVisual from './ErrorVisual'
import { resolveErrorConfig } from '../../config/errorConfig'
import type { AppErrorCode, ErrorDetails } from '../../types/error'

export interface ErrorViewProps {
  code?: AppErrorCode
  configOverride?: Partial<ErrorDetails>
  onRetry?: () => void | Promise<void>
  customTitle?: string
  customDescription?: string
}

export default function ErrorView({
  code = 404,
  configOverride,
  onRetry,
  customTitle,
  customDescription,
}: ErrorViewProps) {
  const navigate = useNavigate()
  const prefersReducedMotion = useReducedMotion() ?? false

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'
    }
    return 'dark'
  })

  useEffect(() => {
    const updateTheme = () => {
      setTheme(document.documentElement.dataset.theme === 'light' ? 'light' : 'dark')
    }
    const obs = new MutationObserver(updateTheme)
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => obs.disconnect()
  }, [])

  const baseConfig = resolveErrorConfig(code)
  const config: ErrorDetails = {
    ...baseConfig,
    ...configOverride,
    title: customTitle || configOverride?.title || baseConfig.title,
    description: customDescription || configOverride?.description || baseConfig.description,
  }

  const [isRetrying, setIsRetrying] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(
    config.retryDelaySeconds ? config.retryDelaySeconds : null
  )

  // Countdown timer for rate limiting (429)
  useEffect(() => {
    if (countdown === null || countdown <= 0) return

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [countdown])

  const handleAction = async (actionType: string, customFn?: () => void | Promise<void>) => {
    if (actionType === 'home') {
      navigate('/')
      return
    }

    if (actionType === 'back') {
      if (window.history.length > 1) {
        navigate(-1)
      } else {
        navigate('/')
      }
      return
    }

    if (actionType === 'retry') {
      if (countdown && countdown > 0) return

      setIsRetrying(true)
      try {
        if (onRetry) {
          await onRetry()
        } else if (customFn) {
          await customFn()
        } else {
          window.location.reload()
        }
      } catch {
        // Fallback or let boundary handle
      } finally {
        setTimeout(() => setIsRetrying(false), 500)
      }
      return
    }

    if (customFn) {
      await customFn()
    }
  }

  const isLight = theme === 'light'

  return (
    <div
      className={`error-page-root relative min-h-screen w-full overflow-x-hidden flex flex-col justify-between transition-colors duration-200 selection:bg-violet-500/30 ${
        isLight ? 'bg-slate-50 text-slate-900 selection:text-slate-900' : 'bg-[#06070d] text-white selection:text-white'
      }`}
    >
      {/* Subtle Depth Background Layer */}
      <div className={`fixed inset-0 pointer-events-none z-0 ${isLight ? 'opacity-25' : 'opacity-40'}`}>
        <BackgroundAnimation />
      </div>

      {/* Atmospheric Vignette and Radial Glow */}
      <div
        className="error-page-vignette fixed inset-0 pointer-events-none z-1 transition-all duration-300"
        style={{
          background: isLight
            ? 'radial-gradient(ellipse 70% 60% at 50% 40%, rgba(99, 102, 241, 0.08) 0%, rgba(248, 250, 252, 0.88) 100%)'
            : 'radial-gradient(ellipse 70% 60% at 50% 40%, rgba(167, 139, 250, 0.08) 0%, rgba(6, 7, 13, 0.95) 100%)',
        }}
      />

      {/* Top Header: Brand Identity, Theme & Audio Controls */}
      <header
        className={`relative z-10 w-full px-6 py-6 sm:px-12 flex items-center justify-between border-b backdrop-blur-md transition-colors ${
          isLight ? 'border-slate-200/80 bg-white/70' : 'border-white/5 bg-transparent'
        }`}
      >
        <Link
          to="/"
          className="portfolio-brand-logo portfolio-nav-logo inline-flex items-center shrink-0 focus:outline-hidden"
          aria-label="Richard D'Souza Home"
        >
          <img
            src="/logo-dark.png"
            alt="Richard D'Souza"
            className="nav-logo-dark h-8 w-auto max-w-30 shrink-0 object-contain"
            width="128"
            height="32"
          />
          <img
            src="/logo-light.png"
            alt="Richard D'Souza"
            className="nav-logo-light h-8 w-auto max-w-30 shrink-0 object-contain"
            width="128"
            height="32"
          />
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <MusicButton />
        </div>
      </header>

      {/* Central Error Viewport */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12 sm:py-16 text-center max-w-2xl mx-auto">
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="w-full flex flex-col items-center"
        >
          {/* Spatial Vector Visual Graphic */}
          <div className="mb-6 sm:mb-8 flex items-center justify-center">
            <ErrorVisual type={config.visualType} accentColor={config.accentColor} />
          </div>

          {/* Status Code / Category Pill */}
          <div
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-medium tracking-widest uppercase mb-4 shadow-xs border transition-colors ${
              isLight
                ? 'bg-white/90 border-slate-200 text-slate-700 shadow-xs'
                : 'bg-white/5 border-white/10 text-zinc-300'
            }`}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                backgroundColor:
                  config.accentColor === 'rose'
                    ? '#fb7185'
                    : config.accentColor === 'cyan'
                    ? '#22d3ee'
                    : config.accentColor === 'amber'
                    ? '#fbbf24'
                    : config.accentColor === 'blue'
                    ? '#38bdf8'
                    : '#a78bfa',
                boxShadow: '0 0 8px currentColor',
              }}
            />
            <span>{config.statusCodeBadge}</span>
          </div>

          {/* Heading */}
          <h1
            className={`text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4 leading-tight font-serif transition-colors ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}
          >
            {config.title}
          </h1>

          {/* User-friendly Safe Description */}
          <p
            className={`text-sm sm:text-base md:text-lg max-w-lg mb-8 leading-relaxed font-normal transition-colors ${
              isLight ? 'text-slate-600' : 'text-zinc-400'
            }`}
          >
            {config.description}
          </p>

          {/* Rate-limit countdown notice if active */}
          {countdown !== null && countdown > 0 && (
            <div
              className={`mb-6 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono border ${
                isLight
                  ? 'bg-amber-50 border-amber-200 text-amber-800'
                  : 'bg-amber-500/10 border-amber-500/20 text-amber-300'
              }`}
            >
              <AlertTriangle size={14} />
              <span>Retry available in {countdown}s</span>
            </div>
          )}

          {/* Action Button Controls */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 w-full max-w-md">
            {/* Primary Action Button */}
            {config.primaryAction && (
              <button
                type="button"
                disabled={isRetrying || (countdown !== null && countdown > 0)}
                onClick={() => handleAction(config.primaryAction.action, config.primaryAction.onClick)}
                className={`error-action-primary flex-1 min-w-35 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                  config.primaryAction.action === 'retry' ? 'is-retry' : ''
                }`}
              >
                {config.primaryAction.action === 'retry' ? (
                  <RefreshCw size={16} className={isRetrying ? 'animate-spin' : ''} />
                ) : config.primaryAction.action === 'back' ? (
                  <ArrowLeft size={16} />
                ) : (
                  <Home size={16} />
                )}
                <span>{config.primaryAction.label}</span>
              </button>
            )}

            {/* Secondary Action Button */}
            {config.secondaryAction && (
              <button
                type="button"
                onClick={() => handleAction(config.secondaryAction!.action, config.secondaryAction!.onClick)}
                className="error-action-secondary flex-1 min-w-35 active:scale-95"
              >
                {config.secondaryAction.action === 'back' ? (
                  <ArrowLeft size={16} />
                ) : config.secondaryAction.action === 'home' ? (
                  <Home size={16} />
                ) : (
                  <RefreshCw size={16} />
                )}
                <span>{config.secondaryAction.label}</span>
              </button>
            )}
          </div>
        </motion.div>
      </main>

      {/* Subtle Terminal Telemetry Footer */}
      <footer
        className={`relative z-10 w-full px-6 py-6 sm:px-12 flex flex-col sm:flex-row items-center justify-between text-xs font-mono border-t gap-2 transition-colors ${
          isLight ? 'border-slate-200/80 text-slate-600' : 'border-white/5 text-zinc-400'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/90 animate-pulse" />
          <span>SYSTEM RUNTIME SECURE</span>
        </div>
        <div>
          <span>&copy; {new Date().getFullYear()} Richard D'souza · Portfolio</span>
        </div>
      </footer>
    </div>
  )
}
