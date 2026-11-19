import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useReducedMotion } from 'motion/react'

interface CertificationsCanvas3DProps {
  className?: string
}

function createGlowDotTexture(): THREE.CanvasTexture {
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')

  if (!ctx) return new THREE.CanvasTexture(canvas)

  const center = size / 2
  const gradient = ctx.createRadialGradient(center, center, 0, center, center, center)
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
  gradient.addColorStop(0.2, 'rgba(182, 154, 255, 0.85)')
  gradient.addColorStop(0.5, 'rgba(139, 61, 255, 0.4)')
  gradient.addColorStop(0.8, 'rgba(56, 107, 255, 0.15)')
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

export const CertificationsCanvas3D: React.FC<CertificationsCanvas3DProps> = ({
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const prefersReducedMotion = useReducedMotion() ?? false

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    let isVisible = true
    let animationFrameId: number
    let clock = 0

    // Detect mobile viewport and coarse pointer (touch)
    const isMobile = window.innerWidth < 768
    const isTouch = window.matchMedia('(pointer: coarse)').matches

    // Measure dimensions safely without causing overflow
    const fallbackW = typeof window !== 'undefined' ? Math.min(window.innerWidth, 800) : 375
    const rect = container.getBoundingClientRect()
    const width = rect.width || container.clientWidth || fallbackW
    const height = rect.height || container.clientHeight || 500

    // Renderer
    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: !isMobile, // Disable antialiasing on mobile to save GPU fill-rate
        powerPreference: 'high-performance',
      })
    } catch (e) {
      console.warn('[CertificationsCanvas3D] WebGL not supported, falling back gracefully.', e)
      return
    }

    // Limit pixel ratio to 1.5 on mobile, 2 on desktop
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2))
    renderer.setSize(width, height, false)

    // Scene & Camera
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
    camera.position.z = 28

    const texture = createGlowDotTexture()

    // 1. Constellation Points (Optimized: 18 on mobile, 38 on desktop)
    const particleCount = isMobile ? 18 : 38
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    const velocities = new Float32Array(particleCount * 3)
    const basePositions = new Float32Array(particleCount * 3)

    // Color palette: #8B3DFF (electric violet), #386BFF (indigo blue), #B69AFF (lavender)
    const cViolet = new THREE.Color(0x8b3dff)
    const cIndigo = new THREE.Color(0x386bff)
    const cLavender = new THREE.Color(0xb69aff)

    const spreadX = isMobile ? 26 : 44
    const spreadY = isMobile ? 22 : 26

    for (let i = 0; i < particleCount; i++) {
      const x = (Math.random() - 0.5) * spreadX
      const y = (Math.random() - 0.5) * spreadY
      const z = (Math.random() - 0.5) * 12

      positions[i * 3] = x
      positions[i * 3 + 1] = y
      positions[i * 3 + 2] = z

      basePositions[i * 3] = x
      basePositions[i * 3 + 1] = y
      basePositions[i * 3 + 2] = z

      const speedFactor = isMobile ? 0.6 : 1.0
      velocities[i * 3] = (Math.random() - 0.5) * 0.004 * speedFactor
      velocities[i * 3 + 1] = (0.002 + Math.random() * 0.004) * speedFactor
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.003 * speedFactor

      // Assign subtle alternating palette
      const r = Math.random()
      const chosenColor = r < 0.45 ? cViolet : r < 0.8 ? cIndigo : cLavender
      colors[i * 3] = chosenColor.r
      colors[i * 3 + 1] = chosenColor.g
      colors[i * 3 + 2] = chosenColor.b
    }

    const particleGeo = new THREE.BufferGeometry()
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const particleMat = new THREE.PointsMaterial({
      size: isMobile ? 1.5 : 1.8,
      map: texture,
      vertexColors: true,
      transparent: true,
      opacity: isMobile ? 0.45 : 0.55,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    })

    const pointsMesh = new THREE.Points(particleGeo, particleMat)
    scene.add(pointsMesh)

    // 2. Connecting Filaments (Optimized: 10 on mobile, 24 on desktop)
    const maxConnections = isMobile ? 10 : 24
    const linePositions = new Float32Array(maxConnections * 2 * 3)
    const lineGeo = new THREE.BufferGeometry()
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3))

    const lineMat = new THREE.LineBasicMaterial({
      color: 0x8b3dff,
      transparent: true,
      opacity: isMobile ? 0.12 : 0.18,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })

    const lineSegments = new THREE.LineSegments(lineGeo, lineMat)
    scene.add(lineSegments)

    // Mouse parallax (only on desktop non-touch devices)
    let mouseX = 0
    let mouseY = 0
    let targetCamX = 0
    let targetCamY = 0

    const handleMouseMove = (e: MouseEvent) => {
      if (prefersReducedMotion || isMobile || isTouch) return
      const rectNow = container.getBoundingClientRect()
      const nx = (e.clientX - rectNow.left) / rectNow.width - 0.5
      const ny = (e.clientY - rectNow.top) / rectNow.height - 0.5
      mouseX = nx * 1.8
      mouseY = -ny * 1.4
    }

    if (!isTouch && !isMobile) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true })
    }

    // Visibility & Lifecycle Management
    let isRunning = false

    const startLoop = () => {
      if (!isRunning && isVisible && !document.hidden) {
        isRunning = true
        animationFrameId = requestAnimationFrame(animate)
      }
    }

    const stopLoop = () => {
      isRunning = false
      cancelAnimationFrame(animationFrameId)
    }

    // IntersectionObserver to pause rendering completely when off-screen
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting
          if (isVisible) {
            startLoop()
          } else {
            stopLoop()
          }
        })
      },
      { threshold: 0.05 },
    )
    observer.observe(container)

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopLoop()
      } else if (isVisible) {
        startLoop()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Animation Loop
    const animate = () => {
      if (!isVisible || document.hidden) {
        isRunning = false
        return
      }

      clock += isMobile ? 0.005 : 0.008

      // Camera parallax on desktop
      if (!prefersReducedMotion && !isMobile && !isTouch) {
        targetCamX += (mouseX - targetCamX) * 0.03
        targetCamY += (mouseY - targetCamY) * 0.03
        camera.position.x = targetCamX
        camera.position.y = targetCamY
        camera.lookAt(0, 0, 0)
      }

      // Float particles
      if (!prefersReducedMotion) {
        const posArr = particleGeo.attributes.position.array as Float32Array
        for (let i = 0; i < particleCount; i++) {
          const idx = i * 3
          posArr[idx + 1] += velocities[idx + 1]
          posArr[idx] += Math.sin(clock + i * 1.5) * (isMobile ? 0.002 : 0.004)

          // Wrap around boundary
          if (posArr[idx + 1] > 14) {
            posArr[idx + 1] = -14
            posArr[idx] = basePositions[idx]
          }
        }
        particleGeo.attributes.position.needsUpdate = true

        // Update filament lines
        let lineVertexIdx = 0
        const connectThreshold = isMobile ? 6.0 : 7.2
        for (let i = 0; i < particleCount && lineVertexIdx < maxConnections * 6; i++) {
          for (let j = i + 1; j < particleCount && lineVertexIdx < maxConnections * 6; j++) {
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
      animationFrameId = requestAnimationFrame(animate)
    }

    startLoop()

    // Resize handler
    const handleResize = () => {
      if (!container) return
      const fallbackW = typeof window !== 'undefined' ? Math.min(window.innerWidth, 800) : 375
      const newRect = container.getBoundingClientRect()
      const w = newRect.width || container.clientWidth || fallbackW
      const h = newRect.height || container.clientHeight || 500
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h, false)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      stopLoop()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (!isTouch && !isMobile) {
        window.removeEventListener('mousemove', handleMouseMove)
      }
      window.removeEventListener('resize', handleResize)
      observer.disconnect()

      particleGeo.dispose()
      particleMat.dispose()
      lineGeo.dispose()
      lineMat.dispose()
      texture.dispose()
      renderer.dispose()
    }
  }, [prefersReducedMotion])

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 pointer-events-none overflow-hidden max-w-full ${className}`}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  )
}

export default CertificationsCanvas3D
