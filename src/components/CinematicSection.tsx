import React, { useRef } from 'react'
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from 'framer-motion'

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

  // Fast, responsive spring physics ensures fluid 60-120fps motion without any scroll-lag
  const springConfig = { stiffness: 260, damping: 32, mass: 0.15 }

  // --------------------------------------------------------------------------
  // 1. HERO ARCHETYPE: Fully visible at top (0), crossfades out into About
  // --------------------------------------------------------------------------
  const { scrollYProgress: heroExitScroll } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'] as any,
  })
  const heroExitSmooth = useSpring(heroExitScroll, springConfig)

  // Outgoing: Opacity 1 -> 0, Blur 0px -> 6px, Scale 1 -> 0.985, subtle linger Y 0 -> +40px
  const heroOpacity = useTransform(heroExitSmooth, [0, 0.35, 0.95, 1], [1, 1, 0, 0])
  const heroBlurVal = useTransform(heroExitSmooth, [0, 0.35, 0.95, 1], [0, 0, 6, 6])
  const heroScale = useTransform(heroExitSmooth, [0, 0.35, 0.95, 1], [1, 1, 0.985, 0.985])
  const heroY = useTransform(heroExitSmooth, [0, 0.35, 0.95, 1], [0, 0, 40, 40])
  const heroFilter = useTransform(heroBlurVal, (b) => (b <= 0.1 ? 'none' : `blur(${b.toFixed(1)}px)`))
  const heroPointerEvents = useTransform(heroOpacity, (o) => (o <= 0.05 ? 'none' : 'auto'))

  // --------------------------------------------------------------------------
  // 2. FOOTER ARCHETYPE: Crossfades in at bottom of page
  // --------------------------------------------------------------------------
  const { scrollYProgress: footerEnterScroll } = useScroll({
    target: containerRef,
    offset: ['start end', 'end end'] as any,
  })
  const footerEnterSmooth = useSpring(footerEnterScroll, springConfig)

  // Incoming: Opacity 0 -> 1, Blur 6px -> 0px, Scale 0.985 -> 1, subtle overlap Y -30px -> 0px
  const footerOpacity = useTransform(footerEnterSmooth, [0, 0.85], [0, 1])
  const footerBlurVal = useTransform(footerEnterSmooth, [0, 0.85], [6, 0])
  const footerScale = useTransform(footerEnterSmooth, [0, 0.85], [0.985, 1])
  const footerY = useTransform(footerEnterSmooth, [0, 0.85], [-30, 0])
  const footerFilter = useTransform(footerBlurVal, (b) => (b <= 0.1 ? 'none' : `blur(${b.toFixed(1)}px)`))
  const footerPointerEvents = useTransform(footerOpacity, (o) => (o <= 0.05 ? 'none' : 'auto'))

  // --------------------------------------------------------------------------
  // 3. STANDARD CONTENT SECTIONS: Bidirectional Crossfade with Overlap
  // --------------------------------------------------------------------------
  // Entry tracking: triggers as top of section enters viewport until well into reading area
  const { scrollYProgress: sectionEnterScroll } = useScroll({
    target: containerRef,
    offset: ['start end', 'start 20%'] as any,
  })
  const sectionEnterSmooth = useSpring(sectionEnterScroll, springConfig)

  // Exit tracking: triggers as bottom of section leaves viewport
  const { scrollYProgress: sectionExitScroll } = useScroll({
    target: containerRef,
    offset: ['end 70%', 'end start'] as any,
  })
  const sectionExitSmooth = useSpring(sectionExitScroll, springConfig)

  // Entry transforms (Incoming): Opacity 0 -> 1
  const enterOpacity = useTransform(sectionEnterSmooth, [0, 0.95], [0, 1])
  // Exit transforms (Outgoing): Opacity 1 -> 0
  const exitOpacity = useTransform(sectionExitSmooth, [0, 0.95], [1, 0])

  // Combined Opacity: Visual overlap during handoff
  const sectionOpacity = useTransform([enterOpacity, exitOpacity], ([en, ex]) => {
    return Math.min(Number(en), Number(ex))
  })

  // Combined Blur: 6px on entry, 0px in active reading zone, 6px on exit
  const sectionBlurVal = useTransform([sectionEnterSmooth, sectionExitSmooth], ([en, ex]) => {
    const enterBlur = (1 - Math.min(1, Math.max(0, Number(en)))) * 6
    const exitBlur = Math.min(1, Math.max(0, Number(ex))) * 6
    return Math.max(enterBlur, exitBlur)
  })
  // Performance optimization: when blur is near zero, set filter to 'none' to free GPU cycles
  const sectionFilter = useTransform(sectionBlurVal, (b) => (b <= 0.1 ? 'none' : `blur(${b.toFixed(1)}px)`))

  // Combined Scale: 0.985 on entry, 1.0 in reading zone, 0.985 on exit
  const sectionScale = useTransform([sectionEnterSmooth, sectionExitSmooth], ([en, ex]) => {
    const enClamped = Math.min(1, Math.max(0, Number(en)))
    const exClamped = Math.min(1, Math.max(0, Number(ex)))
    const enterScale = 0.985 + enClamped * (1 - 0.985)
    const exitScale = 1 - exClamped * (1 - 0.985)
    return Math.min(enterScale, exitScale)
  })

  // Subtle Overlap TranslateY: -40px on entry (emerging into outgoing space), +40px on exit (lingering in viewport)
  // Ensures adjacent sections visually overlap during the dissolve without breaking document flow
  const sectionY = useTransform([sectionEnterSmooth, sectionExitSmooth], ([en, ex]) => {
    const enClamped = Math.min(1, Math.max(0, Number(en)))
    const exClamped = Math.min(1, Math.max(0, Number(ex)))
    const enterY = (1 - enClamped) * -40
    const exitY = exClamped * 40
    return enterY + exitY
  })

  const sectionPointerEvents = useTransform(sectionOpacity, (o) => (o <= 0.05 ? 'none' : 'auto'))

  // Select active values based on archetype
  const activeOpacity = type === 'hero' ? heroOpacity : type === 'footer' ? footerOpacity : sectionOpacity
  const activeFilter = type === 'hero' ? heroFilter : type === 'footer' ? footerFilter : sectionFilter
  const activeScale = type === 'hero' ? heroScale : type === 'footer' ? footerScale : sectionScale
  const activeY = type === 'hero' ? heroY : type === 'footer' ? footerY : sectionY
  const activePointerEvents =
    type === 'hero' ? heroPointerEvents : type === 'footer' ? footerPointerEvents : sectionPointerEvents

  if (prefersReducedMotion) {
    const Tag = type === 'footer' ? 'footer' : 'section'
    return (
      <Tag id={id} className={className} style={style}>
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
        filter: activeFilter,
        scale: activeScale,
        y: activeY,
        pointerEvents: activePointerEvents as any,
        willChange: 'transform, opacity, filter',
        transformOrigin: '50% 50%',
      }}
    >
      {children}
    </Tag>
  )
}

export default CinematicSection
