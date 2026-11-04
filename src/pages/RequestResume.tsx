import { useState, type FormEvent } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  User,
  Mail,
  ShieldCheck,
  Sparkles,
  Lock,
  FileText,
} from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Link } from 'react-router-dom'
import { submitResumeRequest } from '../lib/resumeRequest'
import ThemeToggle from '../components/ThemeToggle'
import BackgroundAnimation from '../components/BackgroundAnimation'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function RequestResume() {
  const prefersReducedMotion = useReducedMotion() ?? false
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (status === 'submitting') return

    const trimmedName = name.trim()
    const trimmedEmail = email.trim()
    if (!trimmedName || !trimmedEmail) {
      setStatus('error')
      setMessage('Please enter both your name and email address.')
      return
    }
    if (!emailPattern.test(trimmedEmail)) {
      setStatus('error')
      setMessage('Please enter a valid email address.')
      return
    }

    setStatus('submitting')
    setMessage('')
    try {
      await submitResumeRequest({ name: trimmedName, email: trimmedEmail })
      setStatus('success')
      setMessage('Request submitted successfully.')
    } catch (error) {
      setStatus('error')
      setMessage(
        error instanceof Error
          ? error.message
          : 'Your request could not be submitted. Please try again.',
      )
    }
  }

  return (
    <main className="resume-request-page">
      <BackgroundAnimation />

      {/* Ambient background glows */}
      <div className="resume-ambient-glow-1" aria-hidden="true" />
      <div className="resume-ambient-glow-2" aria-hidden="true" />

      {/* Top Navigation */}
      <div className="resume-top-nav">
        <Link to="/" className="resume-back-btn group">
          <ArrowLeft size={16} className="transition-transform duration-200 group-hover:-translate-x-1" />
          <span>Back to portfolio</span>
        </Link>
        <div className="resume-top-actions">
          <ThemeToggle />
        </div>
      </div>

      {/* Main Glass Panel */}
      <motion.section
        className="resume-request-panel"
        initial={prefersReducedMotion ? false : { opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.38, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Luminous accent beam on top */}
        <div className="resume-card-glow-bar" aria-hidden="true" />

        <div className="resume-card-content">
          <div className="resume-badge">
            <span className="resume-badge-dot" aria-hidden="true" />
            <ShieldCheck size={13} className="text-violet-400 shrink-0" />
            <span>Secure Access</span>
          </div>

          <h1 className="resume-title">Request Resume</h1>
          <p className="resume-subtitle">
            Interested in reviewing my detailed software engineering experience, architecture work, and credentials? Submit your details to receive verified access.
          </p>

          <div className="resume-feature-chips" aria-label="Access features">
            <span className="resume-chip">
              <Sparkles size={12} className="text-violet-400" /> Instant verification
            </span>
            <span className="resume-chip">
              <Lock size={12} className="text-sky-400" /> Secure token
            </span>
            <span className="resume-chip">
              <FileText size={12} className="text-emerald-400" /> PDF document
            </span>
          </div>

          <AnimatePresence mode="wait">
            {status === 'success' ? (
              <motion.div
                key="success-view"
                className="resume-success-view"
                initial={prefersReducedMotion ? false : { opacity: 0, y: 10, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="resume-success-icon-wrap">
                  <div className="resume-success-pulse" aria-hidden="true" />
                  <CheckCircle2 size={36} className="text-emerald-400 relative z-10" />
                </div>
                <h2 className="resume-success-title">Request Submitted!</h2>
                <p className="resume-success-desc">
                  Thank you, <strong className="font-semibold text-white">{name}</strong>. A secure, time-limited access link has been dispatched to <strong className="font-semibold text-white">{email}</strong>.
                </p>
                <div className="resume-success-note">
                  <ShieldCheck size={16} className="text-violet-400 shrink-0" />
                  <span>Please check your inbox (and spam folder) for access instructions.</span>
                </div>
                <div className="resume-success-actions">
                  <button
                    type="button"
                    className="resume-secondary-btn"
                    onClick={() => {
                      setName('')
                      setEmail('')
                      setStatus('idle')
                      setMessage('')
                    }}
                  >
                    Send another request
                  </button>
                  <Link to="/" className="resume-primary-link group">
                    <span>Return to portfolio</span>
                    <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </motion.div>
            ) : (
              <motion.form
                key="form-view"
                onSubmit={(event) => void handleSubmit(event)}
                noValidate
                className="resume-form"
                initial={prefersReducedMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="resume-field">
                  <label htmlFor="resume-name" className="resume-label">
                    <span>Your name</span>
                    <span className="resume-label-req">*</span>
                  </label>
                  <div className="resume-input-wrap">
                    <User size={16} className="resume-input-icon" aria-hidden="true" />
                    <input
                      id="resume-name"
                      type="text"
                      name="name"
                      autoComplete="name"
                      placeholder="e.g. Richard D'Souza"
                      value={name}
                      onChange={(event) => {
                        setName(event.target.value)
                        if (status === 'error') setStatus('idle')
                      }}
                      className="resume-input"
                      required
                    />
                  </div>
                </div>

                <div className="resume-field">
                  <label htmlFor="resume-email" className="resume-label">
                    <span>Email address</span>
                    <span className="resume-label-req">*</span>
                  </label>
                  <div className="resume-input-wrap">
                    <Mail size={16} className="resume-input-icon" aria-hidden="true" />
                    <input
                      id="resume-email"
                      type="email"
                      name="email"
                      autoComplete="email"
                      placeholder="e.g. name@company.com"
                      value={email}
                      onChange={(event) => {
                        setEmail(event.target.value)
                        if (status === 'error') setStatus('idle')
                      }}
                      className="resume-input"
                      required
                    />
                  </div>
                </div>

                <motion.button
                  type="submit"
                  className="resume-submit-btn group"
                  disabled={status === 'submitting'}
                  whileHover={prefersReducedMotion || status === 'submitting' ? undefined : { scale: 1.012, y: -1 }}
                  whileTap={prefersReducedMotion || status === 'submitting' ? undefined : { scale: 0.988 }}
                >
                  <span className="resume-submit-content">
                    {status === 'submitting' ? (
                      <>
                        <Loader2 size={16} className="animate-spin shrink-0" />
                        <span>Submitting request...</span>
                      </>
                    ) : (
                      <>
                        <span>Request access</span>
                        <ArrowUpRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </>
                    )}
                  </span>
                </motion.button>

                <AnimatePresence>
                  {status === 'error' && message && (
                    <motion.div
                      className="resume-alert resume-alert-error"
                      role="alert"
                      initial={prefersReducedMotion ? false : { opacity: 0, y: -6, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: 'auto' }}
                      exit={{ opacity: 0, y: -6, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <AlertCircle size={16} className="shrink-0" />
                      <span>{message}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.section>
    </main>
  )
}
