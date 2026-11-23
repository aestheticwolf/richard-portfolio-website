import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, ShieldCheck, AlertCircle, Loader2, Lock } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { Link, useNavigate } from 'react-router-dom'
import { redeemResumeAccess } from '../lib/resumeAccess'
import ThemeToggle from '../components/ThemeToggle'
import BackgroundAnimation from '../components/BackgroundAnimation'

const tokenPattern = /^[A-Za-z0-9_-]{43}$/

export default function ResumeAccess() {
  const navigate = useNavigate()
  const prefersReducedMotion = useReducedMotion() ?? false
  const started = useRef(false)

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('richard-portfolio-theme')
        if (saved === 'light' || saved === 'dark') return saved
      } catch {
        /* ignore */
      }
      if (document.documentElement.dataset.theme === 'light') return 'light'
    }
    return 'dark'
  })

  useEffect(() => {
    const updateTheme = () => {
      const current = document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'
      setTheme(current)
    }
    const obs = new MutationObserver(updateTheme)
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] })
    window.addEventListener('storage', updateTheme)
    return () => {
      obs.disconnect()
      window.removeEventListener('storage', updateTheme)
    }
  }, [])

  const isLight = theme === 'light'

  function handleBack() {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/')
    }
  }

  const [token] = useState(
    () => new URLSearchParams(window.location.search).get('token'),
  )

  const isValidToken = Boolean(token && tokenPattern.test(token))

  const [status, setStatus] = useState<'loading' | 'error'>(
    isValidToken ? 'loading' : 'error',
  )

  const [message, setMessage] = useState(
    isValidToken
      ? 'Preparing your secure resume download...'
      : 'This resume access link is invalid or unavailable.',
  )

  useEffect(() => {
    if (started.current) return
    started.current = true

    window.history.replaceState(null, '', window.location.pathname)

    if (!token || !isValidToken) return

    void redeemResumeAccess(token)
      .then((signedUrl) => {
        window.location.replace(signedUrl)
      })
      .catch((error: unknown) => {
        setStatus('error')
        setMessage(
          error instanceof Error
            ? error.message
            : 'Unable to access the resume. Please try again later.',
        )
      })
  }, [token, isValidToken])

  return (
    <main className="resume-request-page">
      <BackgroundAnimation />

      <div className="resume-ambient-glow-1" aria-hidden="true" />
      <div className="resume-ambient-glow-2" aria-hidden="true" />

      <div className="resume-top-nav">
        <button
          type="button"
          onClick={handleBack}
          className={`resume-back-btn group cursor-pointer ${isLight ? 'is-light' : ''}`}
        >
          <ArrowLeft size={16} className="transition-transform duration-200 group-hover:-translate-x-1" />
          <span>Back to portfolio</span>
        </button>
        <div className={`resume-top-actions ${isLight ? 'is-light' : ''}`}>
          <ThemeToggle />
        </div>
      </div>

      <motion.section
        className="resume-request-panel"
        initial={prefersReducedMotion ? false : { opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.38, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="resume-card-glow-bar" aria-hidden="true" />

        <div className="resume-card-content">
          <div className="resume-badge">
            <span className="resume-badge-dot" aria-hidden="true" />
            <ShieldCheck size={13} className="text-violet-400 shrink-0" />
            <span>Secure Access</span>
          </div>

          <h1 className={`resume-title ${isLight ? 'text-slate-900' : 'text-white'}`}>Resume Access</h1>

          {status === 'loading' ? (
            <div className="resume-loading-view">
              <div className="resume-loading-spinner-wrap">
                <div className="resume-loading-radar" aria-hidden="true" />
                <Loader2 size={36} className={`animate-spin relative z-10 ${isLight ? 'text-indigo-600' : 'text-violet-400'}`} />
              </div>
              <p className={`resume-loading-status ${isLight ? 'text-slate-900' : 'text-white'}`}>{message}</p>
              <p className={`resume-loading-sub ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Your download link is being authenticated with end-to-end security...
              </p>
            </div>
          ) : (
            <div className="resume-access-error-view">
              <div className="resume-error-icon-wrap">
                <AlertCircle size={36} className="text-rose-500" />
              </div>
              <h2 className={`resume-error-title ${isLight ? 'text-slate-900' : 'text-white'}`}>Access Unavailable</h2>
              <p className={`resume-error-desc ${isLight ? 'text-slate-600' : 'text-slate-300'}`} role="alert">
                {message}
              </p>
              <div className="resume-error-actions">
                <Link to="/request-resume" className="resume-primary-link group">
                  <Lock size={15} />
                  <span>Request New Link</span>
                </Link>
                <button
                  type="button"
                  onClick={handleBack}
                  className={`resume-secondary-btn group cursor-pointer ${isLight ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800' : ''}`}
                >
                  <span>Return to portfolio</span>
                  <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.section>
    </main>
  )
}
