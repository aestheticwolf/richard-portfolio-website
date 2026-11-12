import React from 'react'
import { motion, useReducedMotion } from 'motion/react'

interface MusicEqualizerProps {
  isPlaying: boolean
  variant?: 'nav' | 'player'
  className?: string
  accentColor?: string
}

export const MusicEqualizer: React.FC<MusicEqualizerProps> = ({
  isPlaying,
  variant = 'nav',
  className = '',
  accentColor,
}) => {
  const prefersReducedMotion = useReducedMotion()

  if (variant === 'nav') {
    // Compact 3-bar equalizer for navbar
    return (
      <span
        className={`inline-flex items-end gap-[2px] h-3.5 w-3.5 justify-center overflow-hidden shrink-0 ${className}`}
        aria-hidden="true"
      >
        {[0, 1, 2].map((i) => {
          const delays = [0, 0.22, 0.12]
          const heights = [
            [25, 90, 45, 100, 30],
            [60, 30, 100, 40, 75],
            [35, 80, 20, 95, 40],
          ]

          return (
            <motion.span
              key={i}
              className="w-[2px] rounded-full"
              style={{
                backgroundColor: accentColor || '#a78bfa',
                boxShadow: isPlaying ? '0 0 6px rgba(167, 139, 250, 0.6)' : 'none',
              }}
              animate={
                isPlaying && !prefersReducedMotion
                  ? {
                      height: heights[i].map((h) => `${h}%`),
                    }
                  : { height: isPlaying ? '60%' : '20%' }
              }
              transition={
                isPlaying && !prefersReducedMotion
                  ? {
                      repeat: Infinity,
                      repeatType: 'reverse',
                      duration: 0.95 + i * 0.15,
                      ease: 'easeInOut',
                      delay: delays[i],
                    }
                  : { duration: 0.3 }
              }
            />
          )
        })}
      </span>
    )
  }

  // 5-bar rich equalizer for the music player card
  const bars = [
    { base: '25%', seq: ['25%', '85%', '40%', '100%', '35%'], dur: 1.1, delay: 0 },
    { base: '45%', seq: ['45%', '100%', '30%', '80%', '45%'], dur: 0.95, delay: 0.18 },
    { base: '30%', seq: ['30%', '70%', '100%', '50%', '30%'], dur: 1.25, delay: 0.08 },
    { base: '60%', seq: ['60%', '35%', '90%', '25%', '70%'], dur: 1.05, delay: 0.26 },
    { base: '20%', seq: ['20%', '95%', '45%', '100%', '25%'], dur: 1.15, delay: 0.14 },
  ]

  return (
    <div
      className={`inline-flex items-end gap-[3px] h-5 justify-center px-1 overflow-hidden shrink-0 ${className}`}
      aria-label={isPlaying ? 'Audio playing' : 'Audio paused'}
    >
      {bars.map((bar, i) => (
        <motion.span
          key={i}
          className="w-[3px] rounded-full"
          style={{
            background:
              accentColor ||
              'linear-gradient(180deg, #38bdf8 0%, #a78bfa 50%, #34d399 100%)',
            boxShadow: isPlaying ? '0 0 8px rgba(167, 139, 250, 0.45)' : 'none',
          }}
          animate={
            isPlaying && !prefersReducedMotion
              ? { height: bar.seq }
              : { height: isPlaying ? bar.base : '15%' }
          }
          transition={
            isPlaying && !prefersReducedMotion
              ? {
                  repeat: Infinity,
                  repeatType: 'reverse',
                  duration: bar.dur,
                  ease: 'easeInOut',
                  delay: bar.delay,
                }
              : { duration: 0.25 }
          }
        />
      ))}
    </div>
  )
}
