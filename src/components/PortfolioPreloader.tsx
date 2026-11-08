import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'

type PortfolioPreloaderProps = {
  onComplete?: () => void
}

export default function PortfolioPreloader({ onComplete }: PortfolioPreloaderProps) {
  const prefersReducedMotion = useReducedMotion() ?? false
  const [progress, setProgress] = useState(0)
  const [isFinishing, setIsFinishing] = useState(false)

  useEffect(() => {
    if (prefersReducedMotion) {
      const quickTimer = setTimeout(() => {
        setIsFinishing(true)
        setTimeout(() => onComplete?.(), 200)
      }, 350)
      return () => clearTimeout(quickTimer)
    }

    const duration = 1300 // Snappy, elegant 1.3s duration
    const intervalTime = 18
    const step = 100 / (duration / intervalTime)

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + step + (Math.random() * 1.5 - 0.2)
        if (next >= 100) {
          clearInterval(timer)
          setIsFinishing(true)
          setTimeout(() => {
            onComplete?.()
          }, 400)
          return 100
        }
        return next
      })
    }, intervalTime)

    return () => clearInterval(timer)
  }, [onComplete, prefersReducedMotion])

  const roundedProgress = Math.min(100, Math.floor(progress))
  const formattedProgress = roundedProgress < 10 ? `0${roundedProgress}` : `${roundedProgress}`

  return (
    <motion.div
      className="minimal-preloader-overlay"
      initial={{ opacity: 1 }}
      animate={{ opacity: isFinishing ? 0 : 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45, ease: [0.76, 0, 0.24, 1] }}
      role="status"
      aria-label="Loading portfolio"
    >
      {/* Aperture Exit Shutters */}
      <motion.div
        className="preloader-shutter preloader-shutter-top"
        animate={{ y: isFinishing ? '-100%' : '0%' }}
        transition={{ duration: 0.45, ease: [0.76, 0, 0.24, 1] }}
      />
      <motion.div
        className="preloader-shutter preloader-shutter-bottom"
        animate={{ y: isFinishing ? '100%' : '0%' }}
        transition={{ duration: 0.45, ease: [0.76, 0, 0.24, 1] }}
      />

      {/* Ambient soft glow */}
      <div className="minimal-preloader-ambient" aria-hidden="true" />

      {/* Central Minimal Stage */}
      <motion.div
        className="minimal-preloader-stage"
        animate={{
          scale: isFinishing ? 0.95 : 1,
          opacity: isFinishing ? 0 : 1,
          y: isFinishing ? -14 : 0,
        }}
        transition={{ duration: 0.35, ease: [0.76, 0, 0.24, 1] }}
      >
        {/* Monogram Badge */}
        <div className="minimal-preloader-brand">
          <span className="minimal-preloader-bracket text-zinc-500 font-mono">{'{'}</span>
          <span className="minimal-preloader-logo font-bold">RD</span>
          <span className="minimal-preloader-bracket text-zinc-500 font-mono">{'}'}</span>
        </div>

        {/* Large Clean Kinetic Numerical Counter */}
        <div className="minimal-preloader-counter" aria-hidden="true">
          <span className="minimal-counter-number">{formattedProgress}</span>
          <span className="minimal-counter-pct">%</span>
        </div>

        {/* Hairline Laser Progress Line */}
        <div className="minimal-preloader-track-wrap">
          <div className="minimal-preloader-track">
            <div
              className="minimal-preloader-fill"
              style={{ width: `${roundedProgress}%` }}
            >
              <span className="minimal-preloader-bead" />
            </div>
          </div>
        </div>

        {/* Subtle Status Telemetry */}
        <div className="minimal-preloader-status">
          <span className={`minimal-status-dot ${roundedProgress === 100 ? 'is-ready' : ''}`} />
          <span className="minimal-status-text">
            {roundedProgress === 100 ? 'SYSTEM READY' : 'INITIALIZING'}
          </span>
        </div>
      </motion.div>
    </motion.div>
  )
}
