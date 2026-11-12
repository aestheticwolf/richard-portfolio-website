import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import gsap from 'gsap'
import * as THREE from 'three'

type PortfolioPreloaderProps = {
  onComplete?: () => void
}

/* ─── Lightweight Procedural Three.js Ambient Depth Field ─── */
function initPreloaderThree(canvas: HTMLCanvasElement): () => void {
  let disposed = false
  let animationFrameId: number

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: false,
    powerPreference: 'low-power',
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
  renderer.setSize(window.innerWidth, window.innerHeight)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.1, 100)
  camera.position.z = 24

  // Procedural soft radial particle texture (no network load)
  const texCanvas = document.createElement('canvas')
  texCanvas.width = 32
  texCanvas.height = 32
  const ctx = texCanvas.getContext('2d')
  if (ctx) {
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16)
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)')
    grad.addColorStop(0.25, 'rgba(196, 181, 253, 0.85)')
    grad.addColorStop(0.65, 'rgba(139, 92, 246, 0.25)')
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 32, 32)
  }
  const texture = new THREE.CanvasTexture(texCanvas)

  // Lightweight particle field (48 particles)
  const count = 48
  const positions = new Float32Array(count * 3)

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 36
    positions[i * 3 + 1] = (Math.random() - 0.5) * 24
    positions[i * 3 + 2] = (Math.random() - 0.5) * 16
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

  const material = new THREE.PointsMaterial({
    size: 0.85,
    map: texture,
    transparent: true,
    opacity: 0.65,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })

  const points = new THREE.Points(geometry, material)
  scene.add(points)

  // Resize handler
  const onResize = () => {
    if (disposed) return
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  }
  window.addEventListener('resize', onResize, { passive: true })

  // Subtle cursor parallax
  let mouseX = 0
  let mouseY = 0
  const onMouseMove = (e: MouseEvent) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2
  }
  window.addEventListener('mousemove', onMouseMove, { passive: true })

  let clock = 0
  const animate = () => {
    if (disposed) return
    animationFrameId = requestAnimationFrame(animate)

    // Pause rendering when tab is inactive to save GPU/CPU
    if (document.hidden) return

    clock += 0.012

    // Gentle orbital drift
    points.rotation.y = clock * 0.035
    points.rotation.x = Math.sin(clock * 0.018) * 0.025

    // Smooth camera perspective lerp
    camera.position.x += (mouseX * 0.65 - camera.position.x) * 0.03
    camera.position.y += (-mouseY * 0.65 - camera.position.y) * 0.03
    camera.lookAt(0, 0, 0)

    renderer.render(scene, camera)
  }
  animate()

  return () => {
    disposed = true
    cancelAnimationFrame(animationFrameId)
    window.removeEventListener('resize', onResize)
    window.removeEventListener('mousemove', onMouseMove)
    scene.remove(points)
    geometry.dispose()
    material.dispose()
    texture.dispose()
    renderer.dispose()
  }
}

export default function PortfolioPreloader({ onComplete }: PortfolioPreloaderProps) {
  const prefersReducedMotion = useReducedMotion() ?? false

  const overlayRef = useRef<HTMLDivElement | null>(null)
  const shutterTopRef = useRef<HTMLDivElement | null>(null)
  const shutterBottomRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const ambientRef = useRef<HTMLDivElement | null>(null)
  const stageRef = useRef<HTMLDivElement | null>(null)
  const brandRef = useRef<HTMLDivElement | null>(null)
  const shimmerRef = useRef<HTMLDivElement | null>(null)
  const counterRef = useRef<HTMLSpanElement | null>(null)
  const fillRef = useRef<HTMLDivElement | null>(null)
  const beadRef = useRef<HTMLSpanElement | null>(null)
  const statusDotRef = useRef<HTMLSpanElement | null>(null)
  const statusTextRef = useRef<HTMLSpanElement | null>(null)

  const [isReady, setIsReady] = useState(prefersReducedMotion)

  useEffect(() => {
    // Failsafe timer: ensure loader NEVER gets stuck if an asset or initialization hangs
    const safetyTimer = window.setTimeout(() => {
      onComplete?.()
    }, 4500)

    // Reduced motion fallback: quick, minimal fade
    if (prefersReducedMotion) {
      if (counterRef.current) counterRef.current.textContent = '100'
      if (fillRef.current) fillRef.current.style.width = '100%'
      const quickTimer = window.setTimeout(() => {
        window.clearTimeout(safetyTimer)
        onComplete?.()
      }, 350)
      return () => {
        window.clearTimeout(safetyTimer)
        window.clearTimeout(quickTimer)
      }
    }

    // 1. Initialize Three.js depth field
    let cleanupThree: (() => void) | undefined
    if (canvasRef.current) {
      try {
        cleanupThree = initPreloaderThree(canvasRef.current)
      } catch (err) {
        console.warn('Three.js preloader depth skipped:', err)
      }
    }

    // 2. Coordinated GSAP Timeline
    const tl = gsap.timeline({
      defaults: { ease: 'power2.out' },
    })

    // Ambient illumination & branding entrance
    if (ambientRef.current) {
      tl.fromTo(
        ambientRef.current,
        { opacity: 0, scale: 0.75 },
        { opacity: 1, scale: 1, duration: 1.1, ease: 'power2.out' },
        0
      )
    }

    if (brandRef.current) {
      tl.fromTo(
        brandRef.current,
        { opacity: 0, y: 14, scale: 0.94 },
        { opacity: 1, y: 0, scale: 1, duration: 0.75, ease: 'power3.out' },
        0.1
      )
    }

    // Subtle light sweep across full name
    if (shimmerRef.current) {
      tl.fromTo(
        shimmerRef.current,
        { xPercent: -120 },
        { xPercent: 150, duration: 1.15, ease: 'power1.inOut' },
        0.3
      )
    }

    if (counterRef.current) {
      tl.fromTo(
        counterRef.current,
        { opacity: 0, scale: 0.93 },
        { opacity: 1, scale: 1, duration: 0.6, ease: 'power2.out' },
        0.2
      )
    }

    // Gentle bead pulse
    if (beadRef.current) {
      gsap.to(beadRef.current, {
        scale: 1.25,
        repeat: -1,
        yoyo: true,
        duration: 0.55,
        ease: 'sine.inOut',
      })
    }

    // Progress counter & line fill (0 to 100)
    const progressObj = { value: 0 }
    tl.to(
      progressObj,
      {
        value: 100,
        duration: 1.25,
        ease: 'power2.inOut',
        onUpdate: () => {
          const val = Math.min(100, Math.floor(progressObj.value))
          const formatted = val < 10 ? `0${val}` : `${val}`
          if (counterRef.current) counterRef.current.textContent = formatted
          if (fillRef.current) fillRef.current.style.width = `${progressObj.value}%`
        },
        onComplete: () => {
          setIsReady(true)
          if (statusDotRef.current) statusDotRef.current.classList.add('is-ready')
          if (statusTextRef.current) {
            statusTextRef.current.textContent = 'SYSTEM READY'
            statusTextRef.current.classList.add('is-ready')
          }
        },
      },
      0.15
    )

    // Savor the 100% / SYSTEM READY completion state
    tl.to({}, { duration: 0.28 })

    // 3. Cinematic Exit Transition: dissolve central stage, glide aperture shutters
    if (stageRef.current) {
      tl.to(stageRef.current, {
        opacity: 0,
        scale: 0.96,
        y: -14,
        duration: 0.38,
        ease: 'power2.inOut',
      })
    }

    const fadeTargets: (HTMLDivElement | HTMLCanvasElement)[] = []
    if (ambientRef.current) fadeTargets.push(ambientRef.current)
    if (canvasRef.current) fadeTargets.push(canvasRef.current)

    if (fadeTargets.length > 0) {
      tl.to(
        fadeTargets,
        {
          opacity: 0,
          duration: 0.3,
          ease: 'power2.inOut',
        },
        '-=0.28'
      )
    }

    if (shutterTopRef.current) {
      tl.to(
        shutterTopRef.current,
        {
          yPercent: -100,
          duration: 0.48,
          ease: 'power3.inOut',
        },
        '-=0.18'
      )
    }

    if (shutterBottomRef.current) {
      tl.to(
        shutterBottomRef.current,
        {
          yPercent: 100,
          duration: 0.48,
          ease: 'power3.inOut',
        },
        '<'
      )
    }

    if (overlayRef.current) {
      tl.to(
        overlayRef.current,
        {
          opacity: 0,
          duration: 0.45,
          ease: 'power2.inOut',
          onComplete: () => {
            window.clearTimeout(safetyTimer)
            onComplete?.()
          },
        },
        '<'
      )
    }

    return () => {
      window.clearTimeout(safetyTimer)
      tl.kill()
      cleanupThree?.()
    }
  }, [onComplete, prefersReducedMotion])

  return (
    <div
      ref={overlayRef}
      className="minimal-preloader-overlay fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-[#07080c] overflow-hidden select-none pointer-events-auto"
      role="status"
      aria-label="Loading portfolio"
    >
      {/* Three.js Subtle Ambient Depth Canvas */}
      <canvas
        ref={canvasRef}
        className="minimal-preloader-canvas absolute inset-0 w-full h-full pointer-events-none z-[2]"
        aria-hidden="true"
      />

      {/* Cinematic Edge Vignette */}
      <div className="minimal-preloader-vignette absolute inset-0 pointer-events-none z-[3]" aria-hidden="true" />

      {/* Ambient Radial Lighting */}
      <div ref={ambientRef} className="minimal-preloader-ambient absolute pointer-events-none z-[4]" aria-hidden="true" />

      {/* Aperture Exit Shutters */}
      <div
        ref={shutterTopRef}
        className="preloader-shutter preloader-shutter-top absolute left-0 right-0 top-0 h-[50.5%] bg-[#07080c] pointer-events-none z-[10]"
        aria-hidden="true"
      />
      <div
        ref={shutterBottomRef}
        className="preloader-shutter preloader-shutter-bottom absolute left-0 right-0 bottom-0 h-[50.5%] bg-[#07080c] pointer-events-none z-[10]"
        aria-hidden="true"
      />

      {/* Central Minimal Stage */}
      <div ref={stageRef} className="minimal-preloader-stage relative z-[20] flex flex-col items-center justify-center text-center">
        {/* Full Name Branding */}
        <div ref={brandRef} className="minimal-preloader-brand">
          <span className="preloader-brand-first">Richard</span>
          <span className="preloader-brand-space">&nbsp;</span>
          <span className="preloader-brand-last">D'souza</span>
          <div ref={shimmerRef} className="preloader-brand-shimmer" aria-hidden="true" />
        </div>

        {/* Large Clean Kinetic Numerical Counter */}
        <div className="minimal-preloader-counter" aria-hidden="true">
          <span ref={counterRef} className="minimal-counter-number">
            00
          </span>
          <span className="minimal-counter-pct">%</span>
        </div>

        {/* Hairline Laser Progress Line */}
        <div className="minimal-preloader-track-wrap">
          <div className="minimal-preloader-track">
            <div ref={fillRef} className="minimal-preloader-fill" style={{ width: '0%' }}>
              <span ref={beadRef} className="minimal-preloader-bead" />
            </div>
          </div>
        </div>

        {/* Subtle Status Telemetry */}
        <div className="minimal-preloader-status">
          <span
            ref={statusDotRef}
            className={`minimal-status-dot ${isReady ? 'is-ready' : ''}`}
            aria-hidden="true"
          />
          <span
            ref={statusTextRef}
            className={`minimal-status-text ${isReady ? 'is-ready' : ''}`}
          >
            {isReady ? 'SYSTEM READY' : 'INITIALIZING'}
          </span>
        </div>
      </div>
    </div>
  )
}
