import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'

type PortfolioPreloaderProps = {
  onComplete?: () => void
}

const statusMessages = [
  { threshold: 0, text: 'CALIBRATING INTERFACE...' },
  { threshold: 24, text: 'LOADING COMPONENT MATRIX...' },
  { threshold: 52, text: 'INITIALIZING ARCHITECTURE & PROJECTS...' },
  { threshold: 78, text: 'ESTABLISHING SECURE CLOUD GATEWAY...' },
  { threshold: 96, text: 'WELCOME · SYSTEM READY' },
]

export default function PortfolioPreloader({ onComplete }: PortfolioPreloaderProps) {
  const prefersReducedMotion = useReducedMotion() ?? false
  const [progress, setProgress] = useState(0)
  const [isFinishing, setIsFinishing] = useState(false)

  useEffect(() => {
    // If reduced motion is requested, finish quickly
    if (prefersReducedMotion) {
      const quickTimer = setTimeout(() => {
        setIsFinishing(true)
        setTimeout(() => onComplete?.(), 300)
      }, 500)
      return () => clearTimeout(quickTimer)
    }

    const duration = 1400 // Snappy 1.4s overall duration
    const intervalTime = 25
    const step = 100 / (duration / intervalTime)

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + step + (Math.random() * 2 - 0.5)
        if (next >= 100) {
          clearInterval(timer)
          setIsFinishing(true)
          setTimeout(() => {
            onComplete?.()
          }, 450)
          return 100
        }
        return next
      })
    }, intervalTime)

    return () => clearInterval(timer)
  }, [onComplete, prefersReducedMotion])

  const currentStatus =
    [...statusMessages].reverse().find((m) => progress >= m.threshold)?.text ||
    'INITIALIZING...'

  const roundedProgress = Math.min(100, Math.floor(progress))

  return (
    <motion.div
      className="portfolio-preloader-overlay"
      initial={{ opacity: 1 }}
      animate={{ opacity: isFinishing ? 0 : 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45, ease: [0.76, 0, 0.24, 1] }}
      role="status"
      aria-label="Loading portfolio"
    >
      {/* Top and Bottom Shutter Curtains for mechanical aperture exit */}
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

      {/* Ambient background particle glows */}
      <div className="preloader-ambient-glow" aria-hidden="true" />

      {/* Main Center Stage */}
      <motion.div
        className="preloader-content"
        animate={{
          scale: isFinishing ? 1.08 : 1,
          opacity: isFinishing ? 0 : 1,
        }}
        transition={{ duration: 0.35, ease: 'easeInOut' }}
      >
        {/* Cyber Iris Shutter Mechanism */}
        <div className="cyber-iris-container">
          {/* Outer SVG Gear and Running RGB Circular Track */}
          <svg
            className="cyber-iris-svg"
            viewBox="0 0 160 160"
            fill="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient
                id="cyber-iris-chroma"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#ff4b72" />
                <stop offset="18%" stopColor="#a855f7" />
                <stop offset="36%" stopColor="#6366f1" />
                <stop offset="54%" stopColor="#06b6d4" />
                <stop offset="72%" stopColor="#10b981" />
                <stop offset="88%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#ff4b72" />
              </linearGradient>
            </defs>

            {/* Static outer calibration track */}
            <circle
              cx="80"
              cy="80"
              r="76"
              stroke="rgba(203, 197, 255, 0.12)"
              strokeWidth="1.5"
              strokeDasharray="4 6"
            />

            {/* Rotating Gear Teeth Ring */}
            <g className="cyber-iris-gear">
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="url(#cyber-iris-chroma)"
                strokeWidth="2"
                strokeDasharray="18 10"
              />
            </g>

            {/* Counter-rotating Inner Precision Track */}
            <g className="cyber-iris-counter-ring">
              <circle
                cx="80"
                cy="80"
                r="60"
                stroke="rgba(203, 197, 255, 0.35)"
                strokeWidth="1.5"
                strokeDasharray="8 6"
              />
            </g>

            {/* Core Circular Border */}
            <circle
              cx="80"
              cy="80"
              r="48"
              fill="#08090d"
              stroke="rgba(203, 197, 255, 0.45)"
              strokeWidth="1"
            />
          </svg>

          {/* Central Monogram and Waveform Core */}
          <div className="cyber-iris-core">
            <span className="cyber-iris-monogram">
              RD<span className="text-[#cbc5ff]">.</span>
            </span>

            {/* 7-Bar Neural Frequency Waveform */}
            <div className="neural-waveform" aria-hidden="true">
              <span className="wave-bar wave-bar-1" />
              <span className="wave-bar wave-bar-2" />
              <span className="wave-bar wave-bar-3" />
              <span className="wave-bar wave-bar-4" />
              <span className="wave-bar wave-bar-5" />
              <span className="wave-bar wave-bar-6" />
              <span className="wave-bar wave-bar-7" />
            </div>
          </div>
        </div>

        {/* Personalized Branding Information */}
        <div className="preloader-identity">
          <div className="preloader-name-row">
            <span className="preloader-author-name">RICHARD D&apos;SOUZA</span>
            <span className="preloader-live-badge">
              <span className="preloader-beacon" />
              {roundedProgress === 100 ? 'ONLINE' : 'BOOTING'}
            </span>
          </div>
          <span className="preloader-role-title">PORTFOLIO · SOFTWARE DEVELOPER</span>
        </div>

        {/* Running RGB Progress Bar and Telemetry */}
        <div className="preloader-telemetry">
          <div className="preloader-status-row">
            <span className="preloader-status-text">{currentStatus}</span>
            <span className="preloader-percentage">{roundedProgress}%</span>
          </div>

          <div className="preloader-progress-track">
            <div
              className="preloader-progress-fill"
              style={{ width: `${roundedProgress}%` }}
            >
              <span className="preloader-progress-bead" />
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

