import React, { useEffect, useRef, useState, useCallback } from 'react'
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'motion/react'
import * as THREE from 'three'
import { X, ChevronRight } from 'lucide-react'
import type { PublicProfile } from '../lib/profile'

export interface SpatialHeroConsoleProps {
  profile?: PublicProfile | null
  getTechnologyIcon?: unknown
  technologyLucideIconMap?: Record<string, unknown>
  technologyBrandColorMap?: Record<string, string>
  prefersReducedMotion?: boolean
  heroReady?: boolean
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
  texture.flipY = false
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
  const fallbackW = typeof window !== 'undefined' ? Math.min(window.innerWidth, 550) : 375
  const rect = canvas.getBoundingClientRect()
  const width = rect.width || canvas.clientWidth || fallbackW
  const height = rect.height || canvas.clientHeight || fallbackW

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
  let isRunning = false

  const startLoop = () => {
    if (!isRunning && isInViewRef.current && !document.hidden) {
      isRunning = true
      animationFrameId = requestAnimationFrame(renderLoop)
    }
  }

  const stopLoop = () => {
    isRunning = false
    cancelAnimationFrame(animationFrameId)
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        isInViewRef.current = entry.isIntersecting
        if (entry.isIntersecting) {
          startLoop()
        } else {
          stopLoop()
        }
      })
    },
    { threshold: 0.05 }
  )
  observer.observe(canvas)

  const handleVisibilityChange = () => {
    if (document.hidden) {
      stopLoop()
    } else if (isInViewRef.current) {
      startLoop()
    }
  }
  document.addEventListener('visibilitychange', handleVisibilityChange)

  const renderLoop = () => {
    if (!isInViewRef.current || document.hidden) {
      isRunning = false
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

  startLoop()

  const handleResize = () => {
    const fallbackW = typeof window !== 'undefined' ? Math.min(window.innerWidth, 550) : 375
    const newRect = canvas.getBoundingClientRect()
    const w = newRect.width || canvas.clientWidth || fallbackW
    const h = newRect.height || canvas.clientHeight || fallbackW
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setSize(w, h, false)
  }

  window.addEventListener('resize', handleResize)

  return () => {
    stopLoop()
    observer.disconnect()
    document.removeEventListener('visibilitychange', handleVisibilityChange)
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

/* ─── Interactive Dialogue Takes (Authentic, Buzzword-Free Descriptions) ─── */
interface DialogueTake {
  id: number
  badge: string
  emoji: string
  headline: string
  subtext: string
  accentColor: string
}

const DIALOGUE_TAKES: DialogueTake[] = [
  {
    id: 1,
    badge: 'About Me',
    emoji: '👋',
    headline: "Hey, I'm Richard D'souza",
    subtext: 'Software Engineer based in Goa, building web and mobile applications.',
    accentColor: '#a78bfa',
  },
  {
    id: 2,
    badge: 'What I Do',
    emoji: '💻',
    headline: 'Frontend & Backend',
    subtext: 'Building apps with React, TypeScript, Tailwind, Node.js & Supabase.',
    accentColor: '#38bdf8',
  },
  {
    id: 3,
    badge: 'Featured Work',
    emoji: '🚀',
    headline: 'Featured Projects',
    subtext: 'Working demos, full source code and practical architectures below.',
    accentColor: '#34d399',
  },
  {
    id: 4,
    badge: 'Education',
    emoji: '🎓',
    headline: 'M.Sc. in Information Technology',
    subtext: 'Completed at Parvatibai Chowgule College, focused on practical software.',
    accentColor: '#fbbf24',
  },
  {
    id: 5,
    badge: 'Get in Touch',
    emoji: '📬',
    headline: 'Open to Roles & Projects',
    subtext: 'Feel free to explore my work or send me a message directly below.',
    accentColor: '#f472b6',
  },
]

interface SparkleParticle {
  id: number
  x: number
  y: number
  color: string
  size: number
}

export const SpatialHeroConsole: React.FC<SpatialHeroConsoleProps> = ({
  prefersReducedMotion = false,
  heroReady,
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
  const [takeIndex, setTakeIndex] = useState(0)
  const [sparkleBursts, setSparkleBursts] = useState<SparkleParticle[]>([])
  const speechTimerRef = useRef<number | null>(null)
  const sparkleTimerRef = useRef<number | null>(null)
  const waveTimerRef = useRef<number | null>(null)

  // Track readiness: wait for page loader to reveal hero before starting animations
  const [internalReady, setInternalReady] = useState(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.dataset.loader === 'done' || !document.querySelector('.ld-root')
    }
    return true
  })

  useEffect(() => {
    if (internalReady) return
    const handleDone = () => setInternalReady(true)
    window.addEventListener('loader:done', handleDone, { once: true })
    return () => window.removeEventListener('loader:done', handleDone)
  }, [internalReady])

  const isReady = heroReady !== undefined ? heroReady : internalReady

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
  const isAnimating = isInView && !motionDisabled && isReady

  // 1. Natural Synchronized Blinking Loop (every 3.2s to 6.0s, lasts 150ms)
  useEffect(() => {
    if (!isAnimating) return

    let blinkTimer: number | null = null
    let reopenTimer: number | null = null
    let isMounted = true

    const scheduleNextBlink = () => {
      const interval = 3200 + Math.random() * 2800
      blinkTimer = window.setTimeout(() => {
        if (!isMounted) return
        setIsBlinking(true)
        reopenTimer = window.setTimeout(() => {
          if (!isMounted) return
          setIsBlinking(false)
          scheduleNextBlink()
        }, 150)
      }, interval)
    }

    scheduleNextBlink()

    return () => {
      isMounted = false
      if (blinkTimer) clearTimeout(blinkTimer)
      if (reopenTimer) clearTimeout(reopenTimer)
      setIsBlinking(false)
    }
  }, [isAnimating])

  // Dedicated Safety Watchdog: Guarantee eyelids never stay closed longer than 180ms
  useEffect(() => {
    if (!isBlinking) return
    const timer = window.setTimeout(() => {
      setIsBlinking(false)
    }, 180)
    return () => clearTimeout(timer)
  }, [isBlinking])

  // Window visibility listener: re-open eyes immediately if tab changes
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        setIsBlinking(false)
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  // 2. Waving Trigger & Control
  const triggerWave = useCallback(() => {
    if (motionDisabled) return
    setIsWaving(true)
    if (waveTimerRef.current) clearTimeout(waveTimerRef.current)
    waveTimerRef.current = window.setTimeout(() => {
      setIsWaving(false)
    }, 1450)
  }, [motionDisabled])

  // Initial greeting wave shortly after loader finishes & hero is revealed
  useEffect(() => {
    if (motionDisabled || !isReady) return
    const timer = window.setTimeout(() => {
      triggerWave()
    }, 550)
    return () => clearTimeout(timer)
  }, [motionDisabled, isReady, triggerWave])

  // Periodic gentle wave while idle (every 9 to 13.5 seconds) - pauses while reading dialogue card
  useEffect(() => {
    if (!isAnimating || showSpeechBubble) return

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
  }, [isAnimating, showSpeechBubble, triggerWave])

  // Dynamic particle sparkle burst
  const triggerSparkles = useCallback((accentColor = '#a78bfa') => {
    const count = 8
    const palette = ['#a78bfa', '#38bdf8', '#fbbf24', '#34d399', '#f472b6']
    const newParticles: SparkleParticle[] = Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.4
      const dist = 26 + Math.random() * 32
      return {
        id: Date.now() + i,
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist - 8,
        color: palette[i % palette.length] || accentColor,
        size: 4 + Math.random() * 4,
      }
    })
    setSparkleBursts(newParticles)
    if (sparkleTimerRef.current) clearTimeout(sparkleTimerRef.current)
    sparkleTimerRef.current = window.setTimeout(() => setSparkleBursts([]), 650)
  }, [])

  // Advance dialogue takes WITHOUT triggering the wave animation (calm reading experience)
  const handleAdvanceTake = useCallback((targetIndex?: number) => {
    const nextIdx =
      typeof targetIndex === 'number'
        ? targetIndex
        : (takeIndex + 1) % DIALOGUE_TAKES.length
    setTakeIndex(nextIdx)
    setShowSpeechBubble(true)
    triggerSparkles(DIALOGUE_TAKES[nextIdx].accentColor)

    if (speechTimerRef.current) clearTimeout(speechTimerRef.current)
    speechTimerRef.current = window.setTimeout(() => {
      setShowSpeechBubble(false)
    }, 6500)
  }, [takeIndex, triggerSparkles])

  // Click interaction: Mascot waves and opens dialogue card, or advances take if already open
  const handleMascotClick = useCallback(() => {
    if (!showSpeechBubble) {
      triggerWave()
      setShowSpeechBubble(true)
      triggerSparkles(DIALOGUE_TAKES[takeIndex].accentColor)
      if (speechTimerRef.current) clearTimeout(speechTimerRef.current)
      speechTimerRef.current = window.setTimeout(() => {
        setShowSpeechBubble(false)
      }, 6500)
    } else {
      handleAdvanceTake()
    }
  }, [showSpeechBubble, takeIndex, triggerWave, triggerSparkles, handleAdvanceTake])

  useEffect(() => {
    return () => {
      if (speechTimerRef.current) clearTimeout(speechTimerRef.current)
      if (sparkleTimerRef.current) clearTimeout(sparkleTimerRef.current)
      if (waveTimerRef.current) clearTimeout(waveTimerRef.current)
    }
  }, [])

  const activeTake = DIALOGUE_TAKES[takeIndex] || DIALOGUE_TAKES[0]

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
        className="absolute inset-0 sm:-inset-16 w-full sm:w-[calc(100%+8rem)] h-full sm:h-[calc(100%+8rem)] pointer-events-none z-0 opacity-55"
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
        {/* Sparkle burst feedback particles */}
        <AnimatePresence>
          {sparkleBursts.map((p) => (
            <motion.span
              key={p.id}
              initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
              animate={{ opacity: 0, scale: 1.4, x: p.x, y: p.y }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.55, ease: 'easeOut' }}
              className="absolute z-50 pointer-events-none rounded-full"
              style={{
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
                boxShadow: `0 0 10px ${p.color}`,
                top: '20%',
                left: '50%',
              }}
            />
          ))}
        </AnimatePresence>

        {/* Unified Interactive Mascot Bubble: Positioned ABOVE Mascot Hair (Never on Face) */}
        <AnimatePresence mode="wait">
          {!greetingDismissed && (
            <motion.div
              key={showSpeechBubble ? `take-${activeTake.id}` : 'greeting'}
              initial={{ opacity: 0, scale: 0.92, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 4 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              style={{
                transform: 'translateZ(44px)',
                x: motionDisabled || isTouchDevice ? 0 : chipParallaxX1,
              }}
              className={`hero-mascot-bubble absolute select-none cursor-pointer ${
                showSpeechBubble
                  ? 'z-40 top-full mt-2 left-1/2 -translate-x-1/2 sm:z-30 sm:mt-0 sm:-top-7 md:-top-8'
                  : 'z-30 bottom-full mb-1.5 left-1/2 -translate-x-1/2 sm:bottom-auto sm:-top-5 md:-top-6'
              }`}
              onClick={handleMascotClick}
              role="button"
              tabIndex={0}
              aria-label={showSpeechBubble ? activeTake.headline : 'Hey, Welcome! Interactive mascot message'}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleMascotClick()
                }
              }}
            >
              {!showSpeechBubble ? (
                /* Initial Greeting State: "Hey, Welcome! 👋" (Exact position above mascot hair) */
                <div className="hero-greeting-bubble relative flex items-center gap-1.5 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full backdrop-blur-xl shadow-lg transition-transform hover:scale-105 active:scale-95 whitespace-nowrap">
                  {/* Shimmer effect strictly clipped inside pill container */}
                  <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none" aria-hidden="true">
                    <div className="hero-greeting-shimmer" />
                  </div>
                  <span className="font-semibold tracking-tight flex items-center gap-1 text-[10.5px] sm:text-xs relative z-1">
                    <span>Hey, Welcome!</span>
                    <motion.span
                      className="inline-block origin-[75%_75%] select-none"
                      animate={
                        !motionDisabled
                          ? { rotate: [0, 18, -10, 18, -6, 12, 0] }
                          : { rotate: 0 }
                      }
                      transition={{
                        repeat: Infinity,
                        repeatDelay: 2.8,
                        duration: 1.15,
                        ease: 'easeInOut',
                      }}
                    >
                      👋
                    </motion.span>
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setGreetingDismissed(true)
                    }}
                    aria-label="Dismiss greeting"
                    className="ml-0.5 -mr-1 min-w-6 min-h-6 inline-flex items-center justify-center rounded-full transition-colors text-slate-400 hover:text-white hover:bg-white/10 relative z-1 before:content-[''] before:absolute before:-inset-2"
                  >
                    <X size={11} />
                  </button>
                  {/* Pointer triangle pointing down directly to hair */}
                  <div className="bubble-pointer absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 border-b border-r rotate-45" />
                </div>
              ) : (
                /* Interactive Takes State: Rich Dialogue Card with Full Authentic Description & Zero Buzzwords */
                <div
                  className="hero-speech-bubble relative flex flex-col gap-1 p-2.5 sm:p-3.5 rounded-2xl sm:rounded-3xl backdrop-blur-2xl shadow-2xl w-[min(290px,calc(100vw-2rem))] sm:w-77.5 md:w-82.5 max-w-[calc(100vw-2rem)] border transition-all duration-300 text-left"
                  style={{
                    borderColor: `${activeTake.accentColor}40`,
                    boxShadow: `0 16px 36px -4px rgba(0,0,0,0.72), 0 0 24px ${activeTake.accentColor}20`,
                  }}
                >
                  {/* Header: Tag + Progress Dots + Next Hint + Close */}
                  <div className="flex items-center justify-between gap-1.5 sm:gap-2 w-full">
                    <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
                      <span
                        className="text-[7.5px] xs:text-[8px] sm:text-[10px] font-semibold tracking-normal sm:tracking-wider uppercase px-1.5 py-0.5 sm:px-2 rounded-full border transition-colors duration-300 shrink-0 whitespace-nowrap"
                        style={{
                          color: activeTake.accentColor,
                          borderColor: `${activeTake.accentColor}44`,
                          backgroundColor: `${activeTake.accentColor}18`,
                        }}
                      >
                        {activeTake.badge}
                      </span>
                      {/* Dots */}
                      <div className="flex items-center gap-0.75 sm:gap-1 shrink-0">
                        {DIALOGUE_TAKES.map((t, i) => (
                          <span
                            key={t.id}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleAdvanceTake(i)
                            }}
                            className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full transition-all duration-300 cursor-pointer"
                            style={{
                              backgroundColor: i === takeIndex ? activeTake.accentColor : 'rgba(150, 150, 170, 0.3)',
                              transform: i === takeIndex ? 'scale(1.25)' : 'scale(1)',
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <span
                        onClick={(e) => {
                          e.stopPropagation()
                          handleAdvanceTake()
                        }}
                        className="hero-take-next text-[9.5px] sm:text-[10px] font-semibold flex items-center gap-0.5 transition-colors cursor-pointer text-slate-300 hover:text-white"
                      >
                        Next <ChevronRight size={11} className="inline sm:w-3 sm:h-3" />
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowSpeechBubble(false)
                        }}
                        className="p-0.5 sm:p-1 rounded-md transition-colors text-slate-400 hover:text-white hover:bg-white/10"
                        aria-label="Close speech bubble"
                      >
                        <X size={11} className="sm:w-3 sm:h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Animated Content: Full Details Without Truncation */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTake.id}
                      initial={{ opacity: 0, x: 4 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -4 }}
                      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                      className="flex items-start gap-2 sm:gap-2.5 mt-0.5"
                    >
                      <span className="text-base sm:text-xl shrink-0 select-none mt-0.5">{activeTake.emoji}</span>
                      <div className="flex flex-col min-w-0">
                        <h4 className="text-[11px] sm:text-sm font-semibold tracking-tight text-white leading-tight">
                          {activeTake.headline}
                        </h4>
                        <p className="text-[9.5px] sm:text-xs text-slate-300 font-normal leading-snug mt-0.5">
                          {activeTake.subtext}
                        </p>
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  {/* Pointer triangle pointing to mascot (up on mobile below-mascot, down on desktop above-mascot) */}
                  <div className="bubble-pointer absolute -top-1.5 left-1/2 -translate-x-1/2 border-t border-l sm:top-auto sm:-bottom-1.5 sm:border-t-0 sm:border-l-0 sm:border-b sm:border-r w-2.5 h-2.5 sm:w-3 sm:h-3 rotate-45" />
                </div>
              )}
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
          whileHover={{ scale: 1.18, rotate: -6 }}
          whileTap={{ scale: 0.94 }}
          onClick={(e) => {
            e.stopPropagation()
            handleAdvanceTake(1) // Jump to Take 02: Full-Stack Tech Stack
          }}
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
          className="absolute top-1 sm:top-12 md:top-14 -left-9 xs:-left-10 sm:-left-3 md:-left-6 lg:-left-8 z-20 select-none transition-transform duration-300 scale-50 xs:scale-55 sm:scale-80 md:scale-90 lg:scale-100 origin-bottom-right cursor-pointer"
          role="button"
          tabIndex={0}
          aria-label="View Full-Stack developer take"
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
          whileHover={{ scale: 1.18, rotate: 6 }}
          whileTap={{ scale: 0.94 }}
          onClick={(e) => {
            e.stopPropagation()
            handleAdvanceTake(2) // Jump to Take 03: 60 FPS Micro-Interactions & Code
          }}
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
          className="absolute top-2.5 sm:top-14 md:top-16 -right-7 xs:-right-8 sm:right-0 md:right-1 lg:-right-3 z-20 select-none transition-transform duration-300 scale-50 xs:scale-55 sm:scale-80 md:scale-90 lg:scale-100 origin-bottom-left cursor-pointer"
          role="button"
          tabIndex={0}
          aria-label="View Micro-Interactions developer take"
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
          className="absolute -top-1 sm:-top-2 right-1 sm:right-6 md:right-10 z-20 pointer-events-none text-amber-300 drop-shadow-[0_0_8px_rgba(252,211,77,0.85)] scale-75 sm:scale-90 md:scale-100"
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
                opacity: isAnimating && isBlinking ? 1 : 0,
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
