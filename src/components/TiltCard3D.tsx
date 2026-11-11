import React, { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'motion/react'

export interface TiltCard3DProps {
  children: React.ReactNode
  className?: string
  /** Maximum rotation angle in degrees (default: 6) */
  maxTilt?: number
  /** Whether to show a dynamic specular glass glint (default: true) */
  showGlint?: boolean
  onClick?: () => void
}

export const TiltCard3D: React.FC<TiltCard3DProps> = ({
  children,
  className = '',
  maxTilt = 6,
  showGlint = true,
  onClick,
}) => {
  const prefersReducedMotion = useReducedMotion() ?? false
  const cardRef = useRef<HTMLDivElement | null>(null)

  // Raw mouse coordinates relative to card center (-0.5 to 0.5)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Spring physics for natural damping and zero wobble
  const springConfig = { stiffness: 180, damping: 22, mass: 0.8 }
  const mouseXSpring = useSpring(mouseX, springConfig)
  const mouseYSpring = useSpring(mouseY, springConfig)

  // 3D Perspective Rotation
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [`${maxTilt}deg`, `-${maxTilt}deg`])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [`-${maxTilt}deg`, `${maxTilt}deg`])

  // Specular light position
  const glintX = useTransform(mouseXSpring, [-0.5, 0.5], ['0%', '100%'])
  const glintY = useTransform(mouseYSpring, [-0.5, 0.5], ['0%', '100%'])
  const glintOpacity = useTransform(
    mouseXSpring,
    [-0.5, 0, 0.5],
    [0.6, 0.25, 0.6]
  )

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) return
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    mouseX.set(x)
    mouseY.set(y)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
  }

  if (prefersReducedMotion) {
    return (
      <div className={`tilt-3d-wrapper ${className}`} onClick={onClick}>
        {children}
      </div>
    )
  }

  return (
    <motion.div
      ref={cardRef}
      className={`tilt-3d-wrapper ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        transformStyle: 'preserve-3d',
        perspective: 1200,
        rotateX,
        rotateY,
      }}
    >
      {children}

      {/* Dynamic Specular Glass Glint that follows cursor */}
      {showGlint && (
        <motion.div
          className="tilt-3d-glint"
          aria-hidden="true"
          style={{
            opacity: glintOpacity,
            background: useTransform(
              [glintX, glintY],
              ([x, y]) =>
                `radial-gradient(circle 380px at ${x} ${y}, rgba(255, 255, 255, 0.12), transparent 70%)`
            ),
          }}
        />
      )}
    </motion.div>
  )
}

export default TiltCard3D
