import React, { useEffect, useRef, useState, useCallback } from 'react'
import { motion } from 'motion/react'
import * as THREE from 'three'
import gsap from 'gsap'
import { MapPin, Copy, Check, Sparkles, Terminal } from 'lucide-react'
import type { PublicProfile } from '../lib/profile'

export interface SpatialHeroConsoleProps {
  profile: PublicProfile | null
  getTechnologyIcon?: unknown
  technologyLucideIconMap?: Record<string, unknown>
  technologyBrandColorMap?: Record<string, string>
  prefersReducedMotion?: boolean
}

/* ─── Procedural Soft Radial Particle Texture ─── */
function createCircleTexture() {
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) return new THREE.Texture()

  const center = size / 2
  const gradient = ctx.createRadialGradient(center, center, 0, center, center, center)
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
  gradient.addColorStop(0.25, 'rgba(120, 210, 255, 0.85)')
  gradient.addColorStop(0.6, 'rgba(99, 102, 241, 0.4)')
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

/* ─── Interactive Three.js Neural Constellation Field ─── */
function initConstellationField(
  canvas: HTMLCanvasElement,
  prefersReducedMotion: boolean,
  mouseRef: React.MutableRefObject<{ x: number; y: number; active: boolean }>
) {
  const rect = canvas.getBoundingClientRect()
  const width = rect.width || canvas.clientWidth || 600
  const height = rect.height || canvas.clientHeight || 500

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(width, height, false)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 100)
  camera.position.z = 28

  const particleTexture = createCircleTexture()

  // Primary interactive particle swarm
  const particleCount = 70
  const positions = new Float32Array(particleCount * 3)
  const velocities = new Float32Array(particleCount * 3)
  const basePositions = new Float32Array(particleCount * 3)

  for (let i = 0; i < particleCount; i++) {
    const x = (Math.random() - 0.5) * 42
    const y = (Math.random() - 0.5) * 36
    const z = (Math.random() - 0.5) * 22

    positions[i * 3] = x
    positions[i * 3 + 1] = y
    positions[i * 3 + 2] = z

    basePositions[i * 3] = x
    basePositions[i * 3 + 1] = y
    basePositions[i * 3 + 2] = z

    velocities[i * 3] = (Math.random() - 0.5) * 0.016
    velocities[i * 3 + 1] = 0.008 + Math.random() * 0.018
    velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.012
  }

  const particleGeo = new THREE.BufferGeometry()
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))

  const particleMat = new THREE.PointsMaterial({
    size: 2.2,
    map: particleTexture,
    transparent: true,
    opacity: 0.65,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  })

  const pointsMesh = new THREE.Points(particleGeo, particleMat)
  scene.add(pointsMesh)

  // Secondary ethereal cyan glow dust
  const dustCount = 45
  const dustPositions = new Float32Array(dustCount * 3)
  for (let i = 0; i < dustCount; i++) {
    dustPositions[i * 3] = (Math.random() - 0.5) * 46
    dustPositions[i * 3 + 1] = (Math.random() - 0.5) * 40
    dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 16
  }
  const dustGeo = new THREE.BufferGeometry()
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3))
  const dustMat = new THREE.PointsMaterial({
    size: 3.5,
    map: particleTexture,
    transparent: true,
    opacity: 0.28,
    color: 0x00f0ff,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  const dustMesh = new THREE.Points(dustGeo, dustMat)
  scene.add(dustMesh)

  // Dynamic connecting filaments between nearby particles
  const maxLineConnections = 120
  const linePositions = new Float32Array(maxLineConnections * 6)
  const lineGeo = new THREE.BufferGeometry()
  lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3))

  const lineMat = new THREE.LineBasicMaterial({
    color: 0x6366f1,
    transparent: true,
    opacity: 0.2,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  const lineMesh = new THREE.LineSegments(lineGeo, lineMat)
  scene.add(lineMesh)

  let animationFrameId: number
  let clockTime = 0
  const targetCamPos = { x: 0, y: 0 }

  function animate() {
    animationFrameId = requestAnimationFrame(animate)
    clockTime += 0.005

    if (!prefersReducedMotion) {
      const pos = particleGeo.attributes.position.array as Float32Array
      let lineVertexIdx = 0

      // Particle physics & upward cosmic drift
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3

        pos[i3] += velocities[i3]
        pos[i3 + 1] += velocities[i3 + 1]
        pos[i3 + 2] += velocities[i3 + 2]

        // Wrap around bounds seamlessly
        if (pos[i3 + 1] > 20) {
          pos[i3 + 1] = -20
          pos[i3] = (Math.random() - 0.5) * 42
        }

        // Connect nearby nodes
        if (lineVertexIdx < maxLineConnections * 6) {
          for (let j = i + 1; j < Math.min(i + 8, particleCount); j++) {
            const j3 = j * 3
            const dx = pos[i3] - pos[j3]
            const dy = pos[i3 + 1] - pos[j3 + 1]
            const dz = pos[i3 + 2] - pos[j3 + 2]
            const distSq = dx * dx + dy * dy + dz * dz

            if (distSq < 32 && lineVertexIdx + 6 <= maxLineConnections * 6) {
              linePositions[lineVertexIdx++] = pos[i3]
              linePositions[lineVertexIdx++] = pos[i3 + 1]
              linePositions[lineVertexIdx++] = pos[i3 + 2]

              linePositions[lineVertexIdx++] = pos[j3]
              linePositions[lineVertexIdx++] = pos[j3 + 1]
              linePositions[lineVertexIdx++] = pos[j3 + 2]
            }
          }
        }
      }

      particleGeo.attributes.position.needsUpdate = true
      lineGeo.attributes.position.needsUpdate = true
      lineGeo.setDrawRange(0, lineVertexIdx / 3)

      // Smooth camera parallax following mouse
      if (mouseRef.current.active) {
        targetCamPos.x = mouseRef.current.x * 3.5
        targetCamPos.y = mouseRef.current.y * 3.5
      } else {
        targetCamPos.x = Math.sin(clockTime * 0.4) * 0.8
        targetCamPos.y = Math.cos(clockTime * 0.3) * 0.8
      }

      camera.position.x += (targetCamPos.x - camera.position.x) * 0.04
      camera.position.y += (targetCamPos.y - camera.position.y) * 0.04
      camera.lookAt(0, 0, 0)

      dustMesh.rotation.y = clockTime * 0.04
      dustMesh.rotation.z = Math.sin(clockTime * 0.2) * 0.05
    }

    renderer.render(scene, camera)
  }
  animate()

  function handleResize() {
    const parent = canvas.parentElement
    if (!parent) return
    const w = parent.clientWidth
    const h = parent.clientHeight
    if (w === 0 || h === 0) return

    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }

  window.addEventListener('resize', handleResize)

  return () => {
    cancelAnimationFrame(animationFrameId)
    window.removeEventListener('resize', handleResize)
    renderer.dispose()
    particleGeo.dispose()
    particleMat.dispose()
    dustGeo.dispose()
    dustMat.dispose()
    lineGeo.dispose()
    lineMat.dispose()
    particleTexture.dispose()
  }
}

/* ─── Main Component ─── */
export const SpatialHeroConsole: React.FC<SpatialHeroConsoleProps> = ({
  profile,
  prefersReducedMotion = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sheenRef = useRef<HTMLDivElement>(null)
  const mouseState = useRef({ x: 0, y: 0, active: false })
  const [copiedEmail, setCopiedEmail] = useState(false)

  // Initialize Three.js interactive constellation background
  useEffect(() => {
    if (!canvasRef.current) return
    return initConstellationField(canvasRef.current, prefersReducedMotion, mouseState)
  }, [prefersReducedMotion])

  // GSAP subtle floating levitation animation
  useEffect(() => {
    if (prefersReducedMotion || !cardRef.current) return

    const levitation = gsap.to(cardRef.current, {
      y: -7,
      duration: 3.2,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    })

    return () => {
      levitation.kill()
    }
  }, [prefersReducedMotion])

  // GSAP 3D perspective tilt on mouse interaction
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (prefersReducedMotion || !cardRef.current) return
      const rect = cardRef.current.getBoundingClientRect()
      const nx = (e.clientX - rect.left) / rect.width - 0.5
      const ny = (e.clientY - rect.top) / rect.height - 0.5

      // Tilt angles
      const rotateX = ny * -9
      const rotateY = nx * 9

      gsap.to(cardRef.current, {
        rotateX,
        rotateY,
        duration: 0.45,
        ease: 'power2.out',
        overwrite: 'auto',
      })

      // Update 3D camera parallax coordinates
      mouseState.current = { x: nx, y: -ny, active: true }

      // Dynamic specular highlight sheen
      if (sheenRef.current) {
        sheenRef.current.style.setProperty('--sheen-x', `${e.clientX - rect.left}px`)
        sheenRef.current.style.setProperty('--sheen-y', `${e.clientY - rect.top}px`)
      }
    },
    [prefersReducedMotion]
  )

  const handleMouseLeave = useCallback(() => {
    if (!cardRef.current) return
    gsap.to(cardRef.current, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.7,
      ease: 'power3.out',
    })
    mouseState.current.active = false
  }, [])

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('rich.dsz1997@gmail.com')
    setCopiedEmail(true)

    // GSAP micro-feedback bounce on card
    if (cardRef.current && !prefersReducedMotion) {
      gsap.fromTo(
        cardRef.current,
        { scale: 0.99 },
        { scale: 1, duration: 0.35, ease: 'back.out(2)' }
      )
    }

    setTimeout(() => setCopiedEmail(false), 2200)
  }

  const displayName = profile?.full_name || "Richard D'souza"
  const displayRole = profile?.professional_title || 'Software Developer'
  const displayLocation = profile?.location || 'Goa, India'

  const codeSnippet = [
    { indent: 0, tokens: [{ text: '// Engineer & Systems Architect', cls: 'text-white/35 italic' }] },
    {
      indent: 0,
      tokens: [
        { text: 'const ', cls: 'text-violet-400 font-semibold' },
        { text: 'richard', cls: 'text-cyan-300' },
        { text: ': ', cls: 'text-slate-400' },
        { text: 'DeveloperProfile', cls: 'text-amber-300' },
        { text: ' = {', cls: 'text-slate-400' },
      ],
    },
    {
      indent: 1,
      tokens: [
        { text: 'role', cls: 'text-cyan-300' },
        { text: ': ', cls: 'text-slate-400' },
        { text: `"${displayRole}"`, cls: 'text-emerald-300' },
        { text: ',', cls: 'text-slate-400' },
      ],
    },
    {
      indent: 1,
      tokens: [
        { text: 'location', cls: 'text-cyan-300' },
        { text: ': ', cls: 'text-slate-400' },
        { text: `"${displayLocation}"`, cls: 'text-emerald-300' },
        { text: ',', cls: 'text-slate-400' },
      ],
    },
    {
      indent: 1,
      tokens: [
        { text: 'focus', cls: 'text-cyan-300' },
        { text: ': [', cls: 'text-slate-400' },
        { text: '"Modern Web"', cls: 'text-amber-300' },
        { text: ', ', cls: 'text-slate-400' },
        { text: '"AI Systems"', cls: 'text-amber-300' },
        { text: '],', cls: 'text-slate-400' },
      ],
    },
    {
      indent: 1,
      tokens: [
        { text: 'available', cls: 'text-cyan-300' },
        { text: ': ', cls: 'text-slate-400' },
        { text: 'true', cls: 'text-emerald-400 font-semibold' },
      ],
    },
    { indent: 0, tokens: [{ text: '};', cls: 'text-slate-400' }] },
  ]

  return (
    <div
      ref={containerRef}
      className="hero-floating-card-wrapper w-full flex flex-col items-center justify-center relative select-none py-4"
    >
      {/* 1. Three.js Ambient Constellation & Neural Canvas (Behind and surrounding card) */}
      <canvas
        ref={canvasRef}
        className="absolute -inset-10 sm:-inset-16 w-[calc(100%+5rem)] sm:w-[calc(100%+8rem)] h-[calc(100%+5rem)] sm:h-[calc(100%+8rem)] pointer-events-none z-0 opacity-80"
        aria-hidden="true"
      />

      {/* 2. Main High-End Floating Profile Card with 3D Depth */}
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.75, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-116 sm:max-w-124"
        style={{ perspective: '1200px' }}
      >
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="hero-premium-card relative rounded-2xl border border-white/10 p-5 sm:p-6 overflow-hidden backdrop-blur-2xl transition-all duration-300 hover:border-cyan-500/30 group"
          style={{
            transformStyle: 'preserve-3d',
            willChange: 'transform',
            background: 'linear-gradient(165deg, rgba(14, 19, 36, 0.92) 0%, rgba(7, 10, 20, 0.98) 100%)',
            boxShadow:
              '0 25px 60px -12px rgba(0, 0, 0, 0.75), 0 0 35px -8px rgba(99, 102, 241, 0.16), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)',
          }}
        >
          {/* Cursor-following Specular Sheen */}
          <div
            ref={sheenRef}
            className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 z-10 transition-opacity duration-300"
            style={{
              background:
                'radial-gradient(450px circle at var(--sheen-x, 150px) var(--sheen-y, 100px), rgba(0, 240, 255, 0.09), transparent 60%)',
            }}
          />

          {/* Holographic Top Horizon Edge Line */}
          <div
            className="absolute top-0 left-0 right-0 h-0.5 z-20 pointer-events-none"
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, rgba(99, 102, 241, 0.7) 25%, rgba(0, 240, 255, 0.8) 50%, rgba(16, 185, 129, 0.6) 75%, transparent 100%)',
            }}
          />

          {/* Profile Identity Header (Layer 1 - Z: 26px) */}
          <div
            className="flex items-center justify-between gap-3 mb-5 relative z-20"
            style={{ transform: 'translateZ(26px)' }}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              {/* Circular Portrait with Emerald Beacon */}
              <div className="relative w-13 h-13 sm:w-14 sm:h-14 rounded-full shrink-0 p-0.5">
                <div className="absolute inset-0 rounded-full bg-linear-to-tr from-cyan-500/40 via-violet-500/40 to-emerald-500/40 animate-pulse" />
                <div className="relative w-full h-full rounded-full overflow-hidden border border-white/20 bg-slate-900">
                  {profile?.profile_image_url ? (
                    <img
                      src={profile.profile_image_url}
                      alt={displayName}
                      className="w-full h-full object-cover"
                      loading="eager"
                    />
                  ) : (
                    <div className="w-full h-full bg-linear-to-tr from-cyan-600 to-violet-600 flex items-center justify-center font-bold text-white text-base">
                      RD
                    </div>
                  )}
                </div>
                {/* Active Status Beacon */}
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#070a14] z-10">
                  <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
                </span>
              </div>

              {/* Title & Metadata */}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm sm:text-base font-semibold text-white tracking-tight truncate">
                    {displayName}
                  </h2>
                </div>
                <p className="text-xs text-white/55 font-medium truncate mt-0.5">
                  {displayRole}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-white/40 font-mono">
                  <MapPin size={10} className="text-cyan-400 shrink-0" />
                  <span>{displayLocation}</span>
                </div>
              </div>
            </div>

            {/* Status Pill */}
            <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono tracking-wider shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>ACTIVE</span>
            </div>
          </div>

          {/* Minimalist Code Block (Layer 2 - Z: 18px) */}
          <div
            className="relative rounded-xl p-3.5 sm:p-4 font-mono text-[11.5px] sm:text-[12.5px] leading-relaxed z-20 overflow-hidden"
            style={{
              background: 'rgba(3, 6, 14, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              transform: 'translateZ(18px)',
              boxShadow: 'inset 0 2px 10px rgba(0, 0, 0, 0.4)',
            }}
          >
            {/* macOS Window Controls */}
            <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-white/5">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
                <span className="ml-2 text-[10.5px] text-white/40 flex items-center gap-1">
                  <Terminal size={11} className="text-cyan-400" />
                  <span>developer.ts</span>
                </span>
              </div>
              <span className="text-[10px] text-emerald-400/80 font-mono">Compiled</span>
            </div>

            {/* Code Lines */}
            <div className="space-y-0.5">
              {codeSnippet.map((line, i) => (
                <div key={i} style={{ paddingLeft: `${line.indent * 1.15}rem` }}>
                  {line.tokens.map((token, j) => (
                    <span key={j} className={token.cls}>
                      {token.text}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Footer (Layer 3 - Z: 24px) */}
          <div
            className="mt-4 pt-3.5 border-t border-white/10 flex items-center justify-between text-xs relative z-20"
            style={{ transform: 'translateZ(24px)' }}
          >
            {/* Copy Email Button */}
            <button
              type="button"
              onClick={handleCopyEmail}
              className="hero-action-copy-btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-mono transition-all duration-200 active:scale-95 shadow-sm"
              title="Copy Richard's email address"
            >
              {copiedEmail ? (
                <>
                  <Check size={12} className="text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">Email Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={12} className="text-cyan-400" />
                  <span>rich.dsz1997@gmail.com</span>
                </>
              )}
            </button>

            {/* Modern Edition Badge */}
            <div className="flex items-center gap-1 text-[11px] font-mono text-white/40">
              <Sparkles size={11} className="text-amber-400" />
              <span>Available 2026</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default SpatialHeroConsole
