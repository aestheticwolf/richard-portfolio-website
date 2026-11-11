import React, { useEffect, useRef, useState, useCallback } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import * as THREE from 'three'
import { SiReact, SiTypescript, SiNodedotjs } from 'react-icons/si'
import { Code2, Sparkles } from 'lucide-react'
import type { PublicProfile } from '../lib/profile'

export interface SpatialHeroConsoleProps {
  profile?: PublicProfile | null
  getTechnologyIcon?: unknown
  technologyLucideIconMap?: Record<string, unknown>
  technologyBrandColorMap?: Record<string, string>
  prefersReducedMotion?: boolean
}

/* ─── Procedural Soft Radial Particle Texture for Three.js ─── */
function createParticleTexture(): THREE.Texture {
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) return new THREE.Texture()

  const center = size / 2
  const gradient = ctx.createRadialGradient(center, center, 0, center, center, center)
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.95)')
  gradient.addColorStop(0.25, 'rgba(120, 220, 255, 0.65)')
  gradient.addColorStop(0.6, 'rgba(139, 92, 246, 0.25)')
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

/* ─── Subtle Ethereal Constellation Field Behind Mascot ─── */
function initMascotConstellation(
  canvas: HTMLCanvasElement,
  prefersReducedMotion: boolean,
  mouseRef: React.MutableRefObject<{ x: number; y: number; active: boolean }>,
  isInViewRef: React.MutableRefObject<boolean>
) {
  const rect = canvas.getBoundingClientRect()
  const width = rect.width || canvas.clientWidth || 550
  const height = rect.height || canvas.clientHeight || 550

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(width, height, false)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 100)
  camera.position.z = 26

  const particleTexture = createParticleTexture()

  // Subtle restrained particle constellation (soft background backdrop)
  const particleCount = 40
  const positions = new Float32Array(particleCount * 3)
  const velocities = new Float32Array(particleCount * 3)
  const basePositions = new Float32Array(particleCount * 3)

  for (let i = 0; i < particleCount; i++) {
    const x = (Math.random() - 0.5) * 36
    const y = (Math.random() - 0.5) * 32
    const z = (Math.random() - 0.5) * 16

    positions[i * 3] = x
    positions[i * 3 + 1] = y
    positions[i * 3 + 2] = z

    basePositions[i * 3] = x
    basePositions[i * 3 + 1] = y
    basePositions[i * 3 + 2] = z

    velocities[i * 3] = (Math.random() - 0.5) * 0.006
    velocities[i * 3 + 1] = 0.004 + Math.random() * 0.008
    velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.005
  }

  const particleGeo = new THREE.BufferGeometry()
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))

  // Restrained opacity so the mascot remains the visual hero
  const particleMat = new THREE.PointsMaterial({
    size: 1.6,
    map: particleTexture,
    transparent: true,
    opacity: 0.35,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  })

  const pointsMesh = new THREE.Points(particleGeo, particleMat)
  scene.add(pointsMesh)

  // Subtle ambient cyan dust
  const dustCount = 24
  const dustPositions = new Float32Array(dustCount * 3)
  for (let i = 0; i < dustCount; i++) {
    dustPositions[i * 3] = (Math.random() - 0.5) * 38
    dustPositions[i * 3 + 1] = (Math.random() - 0.5) * 34
    dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 12
  }
  const dustGeo = new THREE.BufferGeometry()
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3))
  const dustMat = new THREE.PointsMaterial({
    size: 2.2,
    map: particleTexture,
    transparent: true,
    opacity: 0.16,
    color: 0x00f0ff,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  })
  const dustMesh = new THREE.Points(dustGeo, dustMat)
  scene.add(dustMesh)

  // Restrained connecting filaments
  const maxLineConnections = 16
  const linePositions = new Float32Array(maxLineConnections * 2 * 3)
  const lineGeo = new THREE.BufferGeometry()
  lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3))
  const lineMat = new THREE.LineBasicMaterial({
    color: 0x6366f1,
    transparent: true,
    opacity: 0.12,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  const lineSegments = new THREE.LineSegments(lineGeo, lineMat)
  scene.add(lineSegments)

  let animationFrameId: number
  let clock = 0
  let camTargetX = 0
  let camTargetY = 0

  const renderLoop = () => {
    // Pause rendering entirely when outside viewport or reduced motion
    if (!isInViewRef.current) {
      animationFrameId = requestAnimationFrame(renderLoop)
      return
    }

    clock += 0.01

    if (!prefersReducedMotion && mouseRef.current.active) {
      // Very restrained subtle camera shift
      camTargetX = mouseRef.current.x * 1.2
      camTargetY = mouseRef.current.y * 0.9
    } else {
      camTargetX += (0 - camTargetX) * 0.04
      camTargetY += (0 - camTargetY) * 0.04
    }

    camera.position.x += (camTargetX - camera.position.x) * 0.04
    camera.position.y += (camTargetY - camera.position.y) * 0.04
    camera.lookAt(0, 0, 0)

    if (!prefersReducedMotion) {
      dustMesh.rotation.y = clock * 0.015

      const posArr = particleGeo.attributes.position.array as Float32Array
      for (let i = 0; i < particleCount; i++) {
        const idx = i * 3
        posArr[idx + 1] += velocities[idx + 1]
        posArr[idx] += Math.sin(clock + i) * 0.004

        if (posArr[idx + 1] > 16) {
          posArr[idx + 1] = -16
          posArr[idx] = basePositions[idx]
        }
      }
      particleGeo.attributes.position.needsUpdate = true

      // Update filaments
      let lineVertexIdx = 0
      const connectThreshold = 6.8
      for (let i = 0; i < particleCount && lineVertexIdx < maxLineConnections * 6; i++) {
        for (let j = i + 1; j < particleCount && lineVertexIdx < maxLineConnections * 6; j++) {
          const dx = posArr[i * 3] - posArr[j * 3]
          const dy = posArr[i * 3 + 1] - posArr[j * 3 + 1]
          const dz = posArr[i * 3 + 2] - posArr[j * 3 + 2]
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)

          if (dist < connectThreshold) {
            linePositions[lineVertexIdx++] = posArr[i * 3]
            linePositions[lineVertexIdx++] = posArr[i * 3 + 1]
            linePositions[lineVertexIdx++] = posArr[i * 3 + 2]
            linePositions[lineVertexIdx++] = posArr[j * 3]
            linePositions[lineVertexIdx++] = posArr[j * 3 + 1]
            linePositions[lineVertexIdx++] = posArr[j * 3 + 2]
          }
        }
      }
      lineGeo.setDrawRange(0, lineVertexIdx / 3)
      lineGeo.attributes.position.needsUpdate = true
    }

    renderer.render(scene, camera)
    animationFrameId = requestAnimationFrame(renderLoop)
  }

  animationFrameId = requestAnimationFrame(renderLoop)

  const handleResize = () => {
    const newRect = canvas.getBoundingClientRect()
    const w = newRect.width || canvas.clientWidth || 550
    const h = newRect.height || canvas.clientHeight || 550
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setSize(w, h, false)
  }

  window.addEventListener('resize', handleResize)

  return () => {
    cancelAnimationFrame(animationFrameId)
    window.removeEventListener('resize', handleResize)
    particleGeo.dispose()
    particleMat.dispose()
    dustGeo.dispose()
    dustMat.dispose()
    lineGeo.dispose()
    lineMat.dispose()
    particleTexture.dispose()
    renderer.dispose()
  }
}

export const SpatialHeroConsole: React.FC<SpatialHeroConsoleProps> = ({
  prefersReducedMotion = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseState = useRef({ x: 0, y: 0, active: false })
  const isInViewRef = useRef(true)

  const [isHovered, setIsHovered] = useState(false)
  const [isInView, setIsInView] = useState(true)
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  const [systemReducedMotion, setSystemReducedMotion] = useState(false)

  // Detect touch device & system reduced motion preferences
  useEffect(() => {
    if (typeof window === 'undefined') return

    const checkTouch = () => {
      const hasTouch =
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.matchMedia('(pointer: coarse)').matches
      setIsTouchDevice(hasTouch)
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setSystemReducedMotion(mediaQuery.matches)

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setSystemReducedMotion(e.matches)
    }

    checkTouch()
    mediaQuery.addEventListener('change', handleMotionChange)
    return () => mediaQuery.removeEventListener('change', handleMotionChange)
  }, [])

  // Viewport intersection observer: pause animations when scrolled out of view
  useEffect(() => {
    const el = containerRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      ([entry]) => {
        const inView = entry.isIntersecting
        setIsInView(inView)
        isInViewRef.current = inView
      },
      { threshold: 0.05 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const motionDisabled = prefersReducedMotion || systemReducedMotion

  // Physics-based spring config: High damping + velvet softness (no sudden snaps or cartoonish bounce)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const springConfig = { damping: 36, stiffness: 95, mass: 0.8 }
  const smoothMouseX = useSpring(mouseX, springConfig)
  const smoothMouseY = useSpring(mouseY, springConfig)

  // Cursor rotation strictly limited to ~2 to 2.8 degrees max as requested
  const mascotRotateX = useTransform(smoothMouseY, [-0.5, 0.5], [2.2, -2.2])
  const mascotRotateY = useTransform(smoothMouseX, [-0.5, 0.5], [-2.8, 2.8])
  const mascotX = useTransform(smoothMouseX, [-0.5, 0.5], [-5, 5])
  const mascotY = useTransform(smoothMouseY, [-0.5, 0.5], [-4, 4])

  // Very subtle parallax for floating badges
  const chipParallaxX1 = useTransform(smoothMouseX, [-0.5, 0.5], [6, -6])
  const chipParallaxY1 = useTransform(smoothMouseY, [-0.5, 0.5], [5, -5])
  const chipParallaxX2 = useTransform(smoothMouseX, [-0.5, 0.5], [-8, 8])
  const chipParallaxY2 = useTransform(smoothMouseY, [-0.5, 0.5], [-6, 6])

  // Three.js background constellation
  useEffect(() => {
    if (!canvasRef.current) return
    const cleanup = initMascotConstellation(
      canvasRef.current,
      Boolean(motionDisabled),
      mouseState,
      isInViewRef
    )
    return cleanup
  }, [motionDisabled])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      // Disable cursor tracking completely on touch devices, reduced motion, or when not in view
      if (motionDisabled || isTouchDevice || !isInView || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const nx = (e.clientX - rect.left) / rect.width - 0.5
      const ny = (e.clientY - rect.top) / rect.height - 0.5

      mouseX.set(nx)
      mouseY.set(ny)
      mouseState.current = { x: nx * 1.5, y: -ny * 1.5, active: true }
    },
    [motionDisabled, isTouchDevice, isInView, mouseX, mouseY]
  )

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0)
    mouseY.set(0)
    mouseState.current.active = false
    setIsHovered(false)
  }, [mouseX, mouseY])

  const handleMouseEnter = useCallback(() => {
    if (!isTouchDevice) {
      setIsHovered(true)
    }
  }, [isTouchDevice])

  // Active animation state: pauses whenever outside viewport or when motion is reduced
  const isAnimating = isInView && !motionDisabled

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="hero-mascot-wrapper w-full flex flex-col items-center justify-center relative select-none py-2"
      style={{ perspective: '1200px' }}
    >
      {/* 1. Subtle Three.js Ambient Constellation & Neural Canvas (Behind mascot) */}
      <canvas
        ref={canvasRef}
        className="absolute -inset-10 sm:-inset-16 w-[calc(100%+5rem)] sm:w-[calc(100%+8rem)] h-[calc(100%+5rem)] sm:h-[calc(100%+8rem)] pointer-events-none z-0 opacity-55"
        aria-hidden="true"
      />

      {/* 2. Soft Ambient Halo & Subtle Orbital Accent */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-1">
        {/* Restrained radial aura: soft framing that doesn't distract */}
        <div
          className={`absolute w-72 h-72 sm:w-96 sm:h-96 md:w-116 md:h-116 rounded-full blur-3xl transition-opacity duration-1000 ${
            isHovered ? 'opacity-55 scale-102' : 'opacity-40'
          }`}
          style={{
            background:
              'radial-gradient(circle, rgba(139, 92, 246, 0.24) 0%, rgba(6, 182, 212, 0.18) 42%, rgba(99, 102, 241, 0.08) 65%, transparent 80%)',
          }}
        />

        {/* Delicate Celestial Orbital Ring matching reference artwork */}
        <div
          className="hero-mascot-orbital-ring absolute w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-full border border-cyan-400/20 pointer-events-none transition-transform duration-1000"
          style={{
            boxShadow: '0 0 28px rgba(6, 182, 212, 0.14), inset 0 0 20px rgba(139, 92, 246, 0.10)',
            transform: 'rotate(-10deg)',
          }}
        />

        {/* Secondary subtle violet ring */}
        <div
          className="absolute w-56 h-56 sm:w-72 sm:h-72 md:w-88 md:h-88 rounded-full border border-violet-400/15 pointer-events-none"
          style={{
            boxShadow: '0 0 20px rgba(139, 92, 246, 0.12)',
            transform: 'rotate(16deg)',
          }}
        />
      </div>

      {/* 3. Mascot Composition Container with Framer Motion 3D Tilt */}
      <motion.div
        initial={motionDisabled ? false : { opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.85, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        style={{
          transformStyle: 'preserve-3d',
          rotateX: motionDisabled || isTouchDevice ? 0 : mascotRotateX,
          rotateY: motionDisabled || isTouchDevice ? 0 : mascotRotateY,
          x: motionDisabled || isTouchDevice ? 0 : mascotX,
          y: motionDisabled || isTouchDevice ? 0 : mascotY,
        }}
        className="relative z-10 flex flex-col items-center justify-center cursor-default"
      >
        {/* Floating Developer Satellite Badges - Restrained & Small */}

        {/* Top-Left: Code Bracket Chip */}
        <motion.div
          animate={
            isAnimating
              ? {
                  y: [-3, 3, -3],
                }
              : { y: 0 }
          }
          transition={{
            repeat: Infinity,
            duration: 5.0,
            ease: 'easeInOut',
          }}
          style={{
            transform: 'translateZ(36px)',
            x: motionDisabled || isTouchDevice ? 0 : chipParallaxX1,
            y: motionDisabled || isTouchDevice ? 0 : chipParallaxY1,
          }}
          className="hero-tech-badge absolute top-8 sm:top-10 -left-3 sm:-left-10 z-20 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/80 border border-violet-400/30 backdrop-blur-md shadow-[0_8px_20px_rgba(0,0,0,0.45),0_0_15px_rgba(139,92,246,0.18)] text-violet-300 font-mono text-xs tracking-wider transition-all duration-300"
        >
          <Code2 size={14} className="text-violet-400 drop-shadow-[0_0_6px_rgba(168,85,247,0.7)]" />
          <span className="font-semibold text-[11px] text-white/90">code</span>
        </motion.div>

        {/* Top-Right: React Chip */}
        <motion.div
          animate={
            isAnimating
              ? {
                  y: [3.5, -3.5, 3.5],
                }
              : { y: 0 }
          }
          transition={{
            repeat: Infinity,
            duration: 5.4,
            ease: 'easeInOut',
            delay: 0.3,
          }}
          style={{
            transform: 'translateZ(42px)',
            x: motionDisabled || isTouchDevice ? 0 : chipParallaxX2,
            y: motionDisabled || isTouchDevice ? 0 : chipParallaxY2,
          }}
          className="hero-tech-badge absolute top-10 sm:top-12 -right-3 sm:-right-10 z-20 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/80 border border-cyan-400/30 backdrop-blur-md shadow-[0_8px_20px_rgba(0,0,0,0.45),0_0_15px_rgba(6,182,212,0.18)] text-cyan-300 font-mono text-xs transition-all duration-300"
        >
          <SiReact
            size={13}
            className={`text-[#61dafb] drop-shadow-[0_0_6px_rgba(97,218,251,0.7)] ${
              isAnimating ? 'animate-[spin_16s_linear_infinite]' : ''
            }`}
          />
          <span className="font-semibold text-[11px] text-white/90">React</span>
        </motion.div>

        {/* Bottom-Left: Node.js Chip */}
        <motion.div
          animate={
            isAnimating
              ? {
                  y: [3, -3, 3],
                }
              : { y: 0 }
          }
          transition={{
            repeat: Infinity,
            duration: 5.2,
            ease: 'easeInOut',
            delay: 0.6,
          }}
          style={{
            transform: 'translateZ(34px)',
            x: motionDisabled || isTouchDevice ? 0 : chipParallaxX1,
            y: motionDisabled || isTouchDevice ? 0 : chipParallaxY1,
          }}
          className="hero-tech-badge absolute bottom-4 sm:bottom-6 -left-3 sm:-left-9 z-20 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/80 border border-emerald-400/30 backdrop-blur-md shadow-[0_8px_20px_rgba(0,0,0,0.45),0_0_15px_rgba(16,185,129,0.18)] text-emerald-300 font-mono text-xs transition-all duration-300"
        >
          <SiNodedotjs size={13} className="text-[#5fa04e] drop-shadow-[0_0_6px_rgba(95,160,78,0.7)]" />
          <span className="font-semibold text-[11px] text-white/90">Node.js</span>
        </motion.div>

        {/* Bottom-Right: TypeScript Chip */}
        <motion.div
          animate={
            isAnimating
              ? {
                  y: [-3, 3, -3],
                }
              : { y: 0 }
          }
          transition={{
            repeat: Infinity,
            duration: 5.6,
            ease: 'easeInOut',
            delay: 0.9,
          }}
          style={{
            transform: 'translateZ(38px)',
            x: motionDisabled || isTouchDevice ? 0 : chipParallaxX2,
            y: motionDisabled || isTouchDevice ? 0 : chipParallaxY2,
          }}
          className="hero-tech-badge absolute bottom-4 sm:bottom-6 -right-3 sm:-right-8 z-20 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/80 border border-blue-400/30 backdrop-blur-md shadow-[0_8px_20px_rgba(0,0,0,0.45),0_0_15px_rgba(59,130,246,0.18)] text-blue-300 font-mono text-xs transition-all duration-300"
        >
          <SiTypescript size={12} className="text-[#3178c6] rounded-xs drop-shadow-[0_0_6px_rgba(49,120,198,0.7)]" />
          <span className="font-semibold text-[11px] text-white/90">TypeScript</span>
        </motion.div>

        {/* Decorative Golden Sparkle Accent */}
        <motion.div
          animate={
            isAnimating
              ? {
                  scale: [0.92, 1.08, 0.92],
                  opacity: [0.65, 0.95, 0.65],
                }
              : { scale: 1, opacity: 0.8 }
          }
          transition={{
            repeat: Infinity,
            duration: 3.5,
            ease: 'easeInOut',
          }}
          className="absolute -top-2 right-10 sm:right-14 z-20 pointer-events-none text-amber-300 drop-shadow-[0_0_8px_rgba(252,211,77,0.7)]"
        >
          <Sparkles size={15} />
        </motion.div>

        {/* 4. Mascot Image: Calm 5.2s Floating Cycle, Subtle 10px Vertical Travel, Rigid Undistorted Face */}
        <motion.div
          animate={
            isAnimating
              ? {
                  // Exactly 10px total vertical travel [-5px to +5px], gentle 5.2s sine cycle
                  y: [-5, 5, -5],
                  // Micro breathing pulse (strictly uniform scaling, perfectly preserving facial proportions)
                  scale: [1, 1.008, 1],
                }
              : { y: 0, scale: 1 }
          }
          transition={{
            repeat: Infinity,
            duration: 5.2,
            ease: 'easeInOut',
          }}
          className="relative z-10 flex flex-col items-center justify-center"
          style={{ transform: 'translateZ(18px)' }}
        >
          <picture className="block">
            <source srcSet="/images/chibi-richard-waving.webp" type="image/webp" />
            <img
              src="/images/chibi-richard-waving.png"
              alt="Richard - 3D Chibi Developer Mascot"
              className="hero-mascot-img w-70 sm:w-85 md:w-95 lg:w-102.5 h-auto object-contain select-none pointer-events-none transition-transform duration-300"
              loading="eager"
              decoding="async"
              width={721}
              height={1018}
            />
          </picture>
        </motion.div>

        {/* 5. Ambient Floor Shadow & Pedestal Glow */}
        <div
          className="hero-mascot-pedestal w-56 sm:w-72 md:w-80 h-10 -mt-6 rounded-full blur-lg pointer-events-none relative z-5 transition-opacity duration-700"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(6, 182, 212, 0.38) 0%, rgba(139, 92, 246, 0.22) 45%, transparent 75%)',
            boxShadow: '0 0 25px rgba(6, 182, 212, 0.22)',
          }}
        />
      </motion.div>
    </div>
  )
}

export default SpatialHeroConsole
