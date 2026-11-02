import { useState, type FormEvent } from 'react'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { Link } from 'react-router-dom'
import { submitResumeRequest } from '../lib/resumeRequest'

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
      setMessage('Please complete both fields.')
      return
    }
    if (!emailPattern.test(trimmedEmail)) {
      setStatus('error')
      setMessage('Enter a valid email address.')
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
      setMessage(error instanceof Error ? error.message : 'Your request could not be submitted. Please try again.')
    }
  }

  return (
    <main className="resume-request-page">
      <motion.section
        className="resume-request-panel"
        initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <Link to="/" className="resume-request-back"><ArrowLeft size={16} /> Back to portfolio</Link>
        <p className="section-label">RESUME</p>
        <h1>Resume access</h1>
        <p>Interested in my resume? Send a quick request.</p>

        <form onSubmit={(event) => void handleSubmit(event)} noValidate>
          <label>
            Your name
            <input
              type="text"
              name="name"
              autoComplete="name"
              placeholder="Enter your name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </label>
          <label>
            Email address
            <input
              type="email"
              name="email"
              autoComplete="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <button type="submit" disabled={status === 'submitting'}>
            {status === 'submitting' ? 'Submitting…' : <>Request access <ArrowUpRight size={16} /></>}
          </button>
          {message && <p className={`resume-request-message is-${status}`} role={status === 'error' ? 'alert' : 'status'}>{message}</p>}
        </form>
      </motion.section>
    </main>
  )
}
