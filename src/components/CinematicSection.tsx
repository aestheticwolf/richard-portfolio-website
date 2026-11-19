import React, { useRef } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'

export interface CinematicSectionProps {
  id?: string
  className?: string
  children: React.ReactNode
  type?: 'hero' | 'section' | 'footer'
  style?: React.CSSProperties
}

export const CinematicSection: React.FC<CinematicSectionProps> = ({
  id,
  className = '',
  children,
  type = 'section',
  style = {},
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = useReducedMotion() ?? false

  // --------------------------------------------------------------------------
  // 1. HERO ARCHETYPE: Fully visible at top (0), smooth direct GPU glide on exit
  // --------------------------------------------------------------------------
  const { scrollYProgress: heroScroll } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })

  // Outgoing hero: stays 100% visible and sharp until ~40% scroll, then glides gently
  const heroOpacity = useTransform(heroScroll, [0, 0.4, 0.95, 1], [1, 1, 0.15, 0])
  const heroScale = useTransform(heroScroll, [0, 0.4, 1], [1, 1, 0.985])
  const heroY = useTransform(heroScroll, [0, 0.4, 1], [0, 0, -28])
  const heroPointerEvents = useTransform(heroOpacity, (o) => (o <= 0.05 ? 'none' : 'auto'))

  // --------------------------------------------------------------------------
  // 2. FOOTER ARCHETYPE: Enters at the bottom of the page
  // --------------------------------------------------------------------------
  const { scrollYProgress: footerScroll } = useScroll({
    target: containerRef,
    offset: ['start end', 'end end'],
  })

  // Incoming footer: smooth entry
  const footerOpacity = useTransform(footerScroll, [0, 0.4], [0.35, 1])
  const footerScale = useTransform(footerScroll, [0, 0.5], [0.99, 1])
  const footerY = useTransform(footerScroll, [0, 0.5], [20, 0])
  const footerPointerEvents = useTransform(footerOpacity, (o) => (o <= 0.05 ? 'none' : 'auto'))

  // --------------------------------------------------------------------------
  // 3. CONTENT SECTIONS: Direct GPU-accelerated Perspective Transitions
  // --------------------------------------------------------------------------
  const { scrollYProgress: enterScroll } = useScroll({
    target: containerRef,
    offset: ['start end', 'start 70%'] as const,
  })

  const { scrollYProgress: exitScroll } = useScroll({
    target: containerRef,
    offset: ['end 40%', 'end start'] as const,
  })

  // Quick crisp opacity ramp on entry: reaches 1.0 by 30% of entry window
  const enterOpacity = useTransform(enterScroll, [0, 0.3, 1], [0.3, 1, 1])
  const exitOpacity = useTransform(exitScroll, [0, 0.95, 1], [1, 0.15, 0])

  const sectionOpacity = useTransform([enterOpacity, exitOpacity], ([en, ex]) => {
    return Math.min(Number(en), Number(ex))
  })

  // Subtle vertical translation: 16px -> 0px on entry, 0px -> -16px on exit
  const enterY = useTransform(enterScroll, [0, 1], [16, 0])
  const exitY = useTransform(exitScroll, [0, 1], [0, -16])
  const sectionY = useTransform([enterY, exitY], ([en, ex]) => {
    return Number(en) + Number(ex)
  })

  // Subtle focal scale: 0.99 -> 1.0 on entry, 1.0 -> 0.99 on exit
  const enterScale = useTransform(enterScroll, [0, 1], [0.99, 1])
  const exitScale = useTransform(exitScroll, [0, 1], [1, 0.99])
  const sectionScale = useTransform([enterScale, exitScale], ([en, ex]) => {
    return Math.min(Number(en), Number(ex))
  })

  const sectionPointerEvents = useTransform(sectionOpacity, (o) => (o <= 0.05 ? 'none' : 'auto'))

  // Select active values based on archetype
  const isHero = type === 'hero'
  const isFooter = type === 'footer'
  const activeOpacity = isHero ? heroOpacity : isFooter ? footerOpacity : sectionOpacity
  const activeScale = isHero ? heroScale : isFooter ? footerScale : sectionScale
  const activeY = isHero ? heroY : isFooter ? footerY : sectionY
  const activePointerEvents =
    isHero ? heroPointerEvents : isFooter ? footerPointerEvents : sectionPointerEvents

  if (prefersReducedMotion) {
    const Tag = type === 'footer' ? 'footer' : 'section'
    return (
      <Tag id={id} className={`cinematic-crossfade-section ${className}`} style={style}>
        {children}
      </Tag>
    )
  }

  const Tag = type === 'footer' ? motion.footer : motion.section

  return (
    <Tag
      ref={containerRef}
      id={id}
      className={`cinematic-crossfade-section ${className}`}
      style={{
        ...style,
        opacity: activeOpacity,
        scale: activeScale,
        y: activeY,
        pointerEvents: activePointerEvents as unknown as React.CSSProperties['pointerEvents'],
        willChange: 'transform, opacity',
        transformOrigin: '50% 50%',
      }}
    >
      {children}
    </Tag>
  )
}

export default CinematicSection
