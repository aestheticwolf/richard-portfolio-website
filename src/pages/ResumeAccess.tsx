import { useEffect, useRef, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { Link } from 'react-router-dom'
import { redeemResumeAccess } from '../lib/resumeAccess'

const tokenPattern = /^[A-Za-z0-9_-]{43}$/

export default function ResumeAccess() {
  const prefersReducedMotion = useReducedMotion() ?? false
  const started = useRef(false)

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
      <motion.section
        className="resume-request-panel"
        initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: prefersReducedMotion ? 0 : 0.35,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <Link to="/" className="resume-request-back">
          <ArrowLeft size={16} /> Back to portfolio
        </Link>

        <div style={{ height: '1rem' }} />

        <p className="section-label">RESUME</p>
        <h1>Resume access</h1>
        <p role={status === 'error' ? 'alert' : 'status'}>
          {message}
        </p>

        {status === 'error' && (
          <Link to="/" className="resume-request-back">
            Return to portfolio
          </Link>
        )}
      </motion.section>
    </main>
  )
}