import React, { useEffect, useRef, useState, useCallback } from 'react'
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'motion/react'
import * as THREE from 'three'
import { X } from 'lucide-react'
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

  // Ambient cyan dust
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
    if (!isInViewRef.current) {
      animationFrameId = requestAnimationFrame(renderLoop)
      return
    }

    clock += 0.01

    if (!prefersReducedMotion && mouseRef.current.active) {
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

/* ─── 4-Point Golden Star Sparkle SVG Matching Artwork ─── */
function StarSparkle({ className = '', size = 16 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z" />
    </svg>
  )
}

/* ─── Neon Holographic Mini-Laptop SVG Matching Artwork ─── */
function NeonHoloLaptop() {
  return (
    <svg
      width="44"
      height="38"
      viewBox="0 0 44 38"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="drop-shadow-[0_0_12px_rgba(168,85,247,0.7)]"
      aria-hidden="true"
    >
      {/* Laptop Screen (tilted perspective) */}
      <path
        d="M8 6C8 4.89543 8.89543 4 10 4H34C35.1046 4 36 4.89543 36 6V23H8V6Z"
        fill="#120d2c"
        fillOpacity="0.88"
        stroke="#c084fc"
        strokeWidth="1.6"
      />
      {/* Inner Screen Glow */}
      <rect x="10.5" y="6.5" width="23" height="14" rx="1.5" fill="#1e103f" fillOpacity="0.9" />
      {/* Code </> Symbol on Screen */}
      <path
        d="M17 11L14 13.5L17 16"
        stroke="#38bdf8"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M27 11L30 13.5L27 16"
        stroke="#38bdf8"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M23 10L21 17"
        stroke="#c084fc"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Laptop Base (Perspective Keyboard deck) */}
      <path
        d="M4 25C4 23.8954 4.89543 23 6 23H38C39.1046 23 40 23.8954 40 25L42 30C42.4 31 41.6 32 40.5 32H3.5C2.4 32 1.6 31 2 30L4 25Z"
        fill="#1a113a"
        stroke="#a855f7"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      {/* Trackpad */}
      <rect x="18" y="27" width="8" height="3" rx="0.75" fill="#a855f7" fillOpacity="0.5" />
    </svg>
  )
}

/* ─── Neon Code Badge Matching Artwork ─── */
function NeonCodeBadge() {
  return (
    <div className="flex items-center justify-center w-10 h-8 sm:w-11 sm:h-9 rounded-xl bg-purple-950/75 border border-violet-400/40 backdrop-blur-md shadow-[0_4px_16px_rgba(0,0,0,0.5),0_0_12px_rgba(168,85,247,0.4)] text-violet-300">
      <span className="font-mono text-xs sm:text-sm font-bold tracking-tight text-violet-200 drop-shadow-[0_0_6px_rgba(192,132,252,0.9)]">
        &lt;/&gt;
      </span>
    </div>
  )
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
  const [isTouchDevice] = useState(() =>
    typeof window !== 'undefined'
      ? 'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.matchMedia('(pointer: coarse)').matches
      : false
  )
  const [systemReducedMotion, setSystemReducedMotion] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  )

  // Character interactive animation states
  const [isBlinking, setIsBlinking] = useState(false)
  const [isWaving, setIsWaving] = useState(false)
  const [showSpeechBubble, setShowSpeechBubble] = useState(false)
  const [greetingDismissed, setGreetingDismissed] = useState(false)
  const speechTimerRef = useRef<number | null>(null)

  // Listen for system reduced motion and touch changes
  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setSystemReducedMotion(e.matches)
    }

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
  const isAnimating = isInView && !motionDisabled

  // 1. Natural Synchronized Blinking Loop (every 3.2s to 6.0s, lasts 150ms)
  useEffect(() => {
    if (!isAnimating) return

    let timeoutId: number
    let isMounted = true

    const scheduleNextBlink = () => {
      const interval = 3200 + Math.random() * 2800
      timeoutId = window.setTimeout(() => {
        if (!isMounted) return
        setIsBlinking(true)
        timeoutId = window.setTimeout(() => {
          if (!isMounted) return
          setIsBlinking(false)
          scheduleNextBlink()
        }, 150)
      }, interval)
    }

    scheduleNextBlink()

    return () => {
      isMounted = false
      clearTimeout(timeoutId)
    }
  }, [isAnimating])

  // 2. Waving Trigger & Control
  const triggerWave = useCallback(() => {
    if (motionDisabled) return
    setIsWaving(true)
    window.setTimeout(() => {
      setIsWaving(false)
    }, 1450)
  }, [motionDisabled])

  // Initial greeting wave shortly after page load
  useEffect(() => {
    if (motionDisabled) return
    const timer = window.setTimeout(() => {
      triggerWave()
    }, 650)
    return () => clearTimeout(timer)
  }, [motionDisabled, triggerWave])

  // Periodic gentle wave while idle (every 9 to 13.5 seconds)
  useEffect(() => {
    if (!isAnimating) return

    let timer: number
    let isMounted = true

    const scheduleNextWave = () => {
      const delay = 9000 + Math.random() * 4500
      timer = window.setTimeout(() => {
        if (!isMounted) return
        triggerWave()
        scheduleNextWave()
      }, delay)
    }

    scheduleNextWave()

    return () => {
      isMounted = false
      clearTimeout(timer)
    }
  }, [isAnimating, triggerWave])

  // Click interaction: Mascot waves and displays temporary speech bubble
  const handleMascotClick = useCallback(() => {
    triggerWave()
    setShowSpeechBubble(true)
    if (speechTimerRef.current) {
      clearTimeout(speechTimerRef.current)
    }
    speechTimerRef.current = window.setTimeout(() => {
      setShowSpeechBubble(false)
    }, 4200)
  }, [triggerWave])

  // Physics-based spring config: High damping + velvet softness
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

  // Subtle parallax for floating satellite accents
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
        className="absolute -inset-4 sm:-inset-16 w-[calc(100%+2rem)] sm:w-[calc(100%+8rem)] h-[calc(100%+2rem)] sm:h-[calc(100%+8rem)] pointer-events-none z-0 opacity-55"
        aria-hidden="true"
      />

      {/* 2. Soft Ambient Halo & Subtle Orbital Accent */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-1">
        <div
          className={`absolute w-36 h-36 xs:w-44 xs:h-44 sm:w-80 sm:h-80 md:w-116 md:h-116 rounded-full blur-2xl sm:blur-3xl transition-opacity duration-1000 ${
            isHovered ? 'opacity-55 scale-102' : 'opacity-40'
          }`}
          style={{
            background:
              'radial-gradient(circle, rgba(139, 92, 246, 0.24) 0%, rgba(6, 182, 212, 0.18) 42%, rgba(99, 102, 241, 0.08) 65%, transparent 80%)',
          }}
        />

        <div
          className="hero-mascot-orbital-ring absolute w-32 h-32 xs:w-40 xs:h-40 sm:w-72 sm:h-72 md:w-96 md:h-96 rounded-full border border-cyan-400/20 pointer-events-none transition-transform duration-1000"
          style={{
            boxShadow: '0 0 28px rgba(6, 182, 212, 0.14), inset 0 0 20px rgba(139, 92, 246, 0.10)',
            transform: 'rotate(-10deg)',
          }}
        />

        <div
          className="absolute w-28 h-28 xs:w-36 xs:h-36 sm:w-60 sm:h-60 md:w-88 md:h-88 rounded-full border border-violet-400/15 pointer-events-none"
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
        {/* Interactive Speech Bubble on Click */}
        <AnimatePresence>
          {showSpeechBubble && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 8 }}
              transition={{ type: 'spring', damping: 22, stiffness: 280 }}
              className="hero-speech-bubble absolute -top-6 sm:top-2 md:top-3 right-0 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 z-40 flex items-center gap-1.5 px-2.5 py-1 sm:px-4 sm:py-2 rounded-2xl backdrop-blur-xl select-none cursor-pointer transition-colors duration-200 text-[11px] sm:text-sm whitespace-nowrap shadow-lg"
              onClick={() => setShowSpeechBubble(false)}
            >
              <span className="text-xs sm:text-base shrink-0">👋</span>
              <span className="text-[10.5px] sm:text-sm font-medium tracking-wide whitespace-nowrap">Hey! Welcome to my portfolio.</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowSpeechBubble(false)
                }}
                className="ml-0.5 sm:ml-1 p-0.5 rounded-md transition-colors shrink-0"
                aria-label="Close speech bubble"
              >
                <X size={11} className="sm:w-3 sm:h-3" />
              </button>
              {/* Pointer triangle */}
              <div className="bubble-pointer absolute -bottom-1.5 right-8 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 w-2.5 h-2.5 sm:w-3 sm:h-3 border-b border-r rotate-45" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dismissible / Interactive Greeting Bubble: "Hey, welcome! 👋" */}
        <AnimatePresence>
          {!greetingDismissed && !showSpeechBubble && (
            <motion.div
              initial={motionDisabled ? false : { opacity: 0, scale: 0.85, y: -6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: -6 }}
              transition={{ duration: 0.45, delay: 0.2 }}
              style={{
                transform: 'translateZ(44px)',
                x: motionDisabled || isTouchDevice ? 0 : chipParallaxX1,
                y: motionDisabled || isTouchDevice ? 0 : chipParallaxY1,
              }}
              className="hero-greeting-bubble absolute -top-4 sm:top-2 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:-left-4 md:-left-5 z-30 flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full backdrop-blur-md cursor-pointer transition-transform hover:scale-104 active:scale-96 text-[10px] sm:text-xs whitespace-nowrap shadow-md"
              onClick={handleMascotClick}
              role="button"
              tabIndex={0}
              aria-label="Click to interact with mascot"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleMascotClick()
                }
              }}
            >
              <span className="text-[10px] sm:text-xs font-medium">Hey, welcome! 👋</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setGreetingDismissed(true)
                }}
                aria-label="Dismiss greeting"
                className="ml-0.5 p-0.5 rounded-md transition-colors"
              >
                <X size={11} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Neon Holographic Mini-Laptop Illustration (Matching Reference Art) */}
        <motion.div
          animate={
            isAnimating
              ? {
                  y: [-4, 4, -4],
                  rotate: [-3, 2, -3],
                }
              : { y: 0, rotate: 0 }
          }
          transition={{
            repeat: Infinity,
            duration: 5.2,
            ease: 'easeInOut',
          }}
          style={{
            transform: 'translateZ(38px)',
            x: motionDisabled || isTouchDevice ? 0 : chipParallaxX1,
            y: motionDisabled || isTouchDevice ? 0 : chipParallaxY1,
          }}
          className="absolute top-5 sm:top-12 md:top-14 -left-2 sm:-left-3 md:-left-6 lg:-left-8 z-20 pointer-events-none select-none transition-transform duration-300 scale-65 sm:scale-80 md:scale-90 lg:scale-100 origin-bottom-right"
        >
          <NeonHoloLaptop />
        </motion.div>

        {/* Floating Neon Code Badge (Matching Reference Art) */}
        <motion.div
          animate={
            isAnimating
              ? {
                  y: [3.5, -3.5, 3.5],
                  rotate: [2, -2, 2],
                }
              : { y: 0, rotate: 0 }
          }
          transition={{
            repeat: Infinity,
            duration: 5.6,
            ease: 'easeInOut',
            delay: 0.4,
          }}
          style={{
            transform: 'translateZ(40px)',
            x: motionDisabled || isTouchDevice ? 0 : chipParallaxX2,
            y: motionDisabled || isTouchDevice ? 0 : chipParallaxY2,
          }}
          className="absolute top-7 sm:top-14 md:top-16 -right-1 sm:right-0 md:right-1 lg:-right-3 z-20 pointer-events-none select-none transition-transform duration-300 scale-65 sm:scale-80 md:scale-90 lg:scale-100 origin-bottom-left"
        >
          <NeonCodeBadge />
        </motion.div>

        {/* Golden Sparkle 1: Top Right */}
        <motion.div
          animate={
            isAnimating
              ? {
                  scale: [0.85, 1.25, 0.85],
                  opacity: [0.65, 1, 0.65],
                }
              : { scale: 1, opacity: 0.8 }
          }
          transition={{
            repeat: Infinity,
            duration: 3.2,
            ease: 'easeInOut',
          }}
          className="absolute -top-1 sm:-top-2 right-3 sm:right-6 md:right-10 z-20 pointer-events-none text-amber-300 drop-shadow-[0_0_8px_rgba(252,211,77,0.85)] scale-75 sm:scale-90 md:scale-100"
        >
          <StarSparkle size={18} />
        </motion.div>

        {/* Golden Sparkle 2: Top Left */}
        <motion.div
          animate={
            isAnimating
              ? {
                  scale: [1.15, 0.8, 1.15],
                  opacity: [0.9, 0.5, 0.9],
                }
              : { scale: 1, opacity: 0.7 }
          }
          transition={{
            repeat: Infinity,
            duration: 3.8,
            ease: 'easeInOut',
            delay: 0.7,
          }}
          className="absolute top-4 sm:top-8 left-1 sm:left-4 md:left-6 z-20 pointer-events-none text-amber-300 drop-shadow-[0_0_6px_rgba(252,211,77,0.7)] scale-75 sm:scale-90 md:scale-100"
        >
          <StarSparkle size={12} />
        </motion.div>

        {/* Cyan Sparkle 3: Bottom Right */}
        <motion.div
          animate={
            isAnimating
              ? {
                  scale: [0.9, 1.2, 0.9],
                  opacity: [0.6, 0.95, 0.6],
                }
              : { scale: 1, opacity: 0.7 }
          }
          transition={{
            repeat: Infinity,
            duration: 4.2,
            ease: 'easeInOut',
            delay: 1.2,
          }}
          className="absolute bottom-8 sm:bottom-16 right-0 sm:right-1 md:right-2 lg:-right-2 z-20 pointer-events-none text-cyan-300 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)] scale-75 sm:scale-90 md:scale-100"
        >
          <StarSparkle size={14} />
        </motion.div>

        {/* 4. Mascot Composition: Calm Floating Cycle, Rigid Undistorted Face, Natural Waving Hand & Blinking Eyes */}
        <motion.div
          animate={
            isAnimating
              ? {
                  y: [-5, 5, -5],
                  scale: [1, 1.008, 1],
                }
              : { y: 0, scale: 1 }
          }
          transition={{
            repeat: Infinity,
            duration: 5.2,
            ease: 'easeInOut',
          }}
          className="relative z-10 flex flex-col items-center justify-center cursor-pointer group"
          style={{ transform: 'translateZ(18px)' }}
          onClick={handleMascotClick}
          role="button"
          tabIndex={0}
          aria-label="Say hello to Richard's chibi mascot"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              handleMascotClick()
            }
          }}
        >
          {/* Mascot Frame: Unified drop-shadow across body, waving hand, and sleeve cuff */}
          <div className="hero-mascot-frame relative w-34.5 xs:w-39.5 sm:w-62.5 md:w-77.5 lg:w-97.5 xl:w-102.5 h-auto transition-transform duration-300 group-hover:scale-101">
            {/* Base Body - Open Eyes */}
            <picture className="block w-full h-auto">
              <source srcSet="/images/chibi-body.webp" type="image/webp" />
              <img
                src="/images/chibi-body.png"
                alt="Richard - 3D Chibi Developer Mascot"
                className="w-full h-auto object-contain select-none pointer-events-none"
                loading="eager"
                decoding="async"
                width={721}
                height={1018}
              />
            </picture>

            {/* Closed Eyelids Overlay (Blink): Isolated 236x81px patch over eyes (7KB) - zero full-body reload, zero character flash */}
            <div
              style={{
                position: 'absolute',
                left: '29.820%',
                top: '31.631%',
                width: '32.732%',
                height: '7.957%',
                zIndex: 22,
                pointerEvents: 'none',
                opacity: isBlinking ? 1 : 0,
                transition: 'opacity 40ms ease-out',
              }}
              aria-hidden="true"
              className="select-none"
            >
              <picture className="w-full h-full block">
                <source srcSet="/images/chibi-eyes-blink.webp" type="image/webp" />
                <img
                  src="/images/chibi-eyes-blink.png"
                  alt=""
                  className="w-full h-full object-contain pointer-events-none select-none"
                  draggable={false}
                  loading="eager"
                  decoding="async"
                  width={236}
                  height={81}
                />
              </picture>
            </div>

            {/* Hand Layer: Natural Hand Wave from the Wrist */}
            <motion.div
              style={{
                position: 'absolute',
                left: '1.664%',
                top: '48.919%',
                width: '26.491%',
                height: '18.369%',
                transformOrigin: '50.3% 99.5%',
                zIndex: 20,
              }}
              animate={
                isWaving && !motionDisabled
                  ? {
                      rotate: [0, -7, 6, -6, 5, -3, 0],
                    }
                  : {
                      rotate: isHovered && !motionDisabled ? -3 : 0,
                    }
              }
              transition={
                isWaving && !motionDisabled
                  ? {
                      duration: 1.35,
                      ease: 'easeInOut',
                    }
                  : {
                      duration: 0.35,
                      ease: 'easeOut',
                    }
              }
              className="pointer-events-none select-none"
            >
              <picture className="w-full h-full block">
                <source srcSet="/images/chibi-hand.webp" type="image/webp" />
                <img
                  src="/images/chibi-hand.png"
                  alt=""
                  className="w-full h-full object-contain pointer-events-none select-none"
                  draggable={false}
                  width={191}
                  height={187}
                />
              </picture>
            </motion.div>

            {/* Sleeve Collar Overlay: Covers wrist pivot so rotation looks 100% inside sleeve */}
            <div
              style={{
                position: 'absolute',
                left: '6.241%',
                top: '66.012%',
                width: '20.804%',
                height: '5.697%',
                zIndex: 25,
                pointerEvents: 'none',
              }}
              className="select-none"
            >
              <picture className="w-full h-full block">
                <source srcSet="/images/chibi-cuff.webp" type="image/webp" />
                <img
                  src="/images/chibi-cuff.png"
                  alt=""
                  className="w-full h-full object-contain pointer-events-none select-none"
                  draggable={false}
                  width={150}
                  height={58}
                />
              </picture>
            </div>
          </div>
        </motion.div>

        {/* 5. Ambient Floor Shadow & Pedestal Glow */}
        <div
          className="hero-mascot-pedestal w-28 xs:w-34 sm:w-60 md:w-80 h-5 sm:h-10 -mt-2.5 sm:-mt-6 rounded-full blur-md sm:blur-lg pointer-events-none relative z-5 transition-opacity duration-700"
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
