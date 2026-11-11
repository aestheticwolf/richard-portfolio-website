import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  alpha: number
  colorIndex: number
}

interface Pulse {
  fromX: number
  fromY: number
  toX: number
  toY: number
  progress: number
  speed: number
}

export default function BackgroundAnimation() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let animationFrameId: number
    let width = (document.documentElement.clientWidth || window.innerWidth)
    let height = (document.documentElement.clientHeight || window.innerHeight)
    canvas.width = width
    canvas.height = height

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Mouse coordinates (normalized to canvas space)
    const mouse = {
      x: -1000,
      y: -1000,
      targetX: -1000,
      targetY: -1000,
      active: false,
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX
      mouse.targetY = e.clientY
      mouse.active = true
    }

    const handleMouseLeave = () => {
      mouse.active = false
      mouse.targetX = -1000
      mouse.targetY = -1000
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    document.addEventListener('mouseleave', handleMouseLeave)

    // 3D Celestial Parallax Scroll tracking
    let lastScrollY = window.scrollY
    let targetScrollY = window.scrollY
    let scrollVelocity = 0

    const handleScroll = () => {
      targetScrollY = window.scrollY
    }
    window.addEventListener('scroll', handleScroll, { passive: true })

    // Handle high DPI and window resize
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = document.documentElement.clientWidth || window.innerWidth
      height = document.documentElement.clientHeight || window.innerHeight
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      canvas.style.width = '100%'
      canvas.style.height = '100%'
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.scale(dpr, dpr)
      initParticles()
    }

    // Determine theme colors dynamically
    let isLight = document.documentElement.dataset.theme === 'light'
    const observer = new MutationObserver(() => {
      isLight = document.documentElement.dataset.theme === 'light'
    })
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })

    // Particles setup
    let particles: Particle[] = []
    const pulses: Pulse[] = []

    const initParticles = () => {
      // Scale particle density with screen area (capped for optimal 60fps)
      const count = Math.min(55, Math.max(22, Math.floor((width * height) / 24000)))
      particles = []

      for (let i = 0; i < count; i++) {
        const speed = prefersReducedMotion ? 0 : 0.2 + Math.random() * 0.35
        const angle = Math.random() * Math.PI * 2
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: 1.2 + Math.random() * 1.6,
          alpha: 0.35 + Math.random() * 0.5,
          colorIndex: Math.random() > 0.45 ? 0 : 1,
        })
      }
    }

    resize()
    window.addEventListener('resize', resize, { passive: true })
    window.addEventListener('orientationchange', resize, { passive: true })

    const resizeObserver = new ResizeObserver(() => {
      resize()
    })
    resizeObserver.observe(document.documentElement)

    // Animation Loop
    let lastPulseSpawn = 0

    const render = (time: number) => {
      // Smooth cursor lerp
      if (mouse.active) {
        mouse.x += (mouse.targetX - mouse.x) * 0.08
        mouse.y += (mouse.targetY - mouse.y) * 0.08
      } else {
        mouse.x = -1000
        mouse.y = -1000
      }

      // Smooth scroll parallax decay
      if (!prefersReducedMotion) {
        const delta = targetScrollY - lastScrollY
        lastScrollY += delta * 0.1
        scrollVelocity = delta * 0.035
      }

      ctx.clearRect(0, 0, width, height)

      // Theme-specific color palettes
      // Dark Mode: Violet (#CBC5FF) & Ambient Blue (#4D7CFF)
      // Light Mode: Rich Violet (#5546AE) & Soft Slate Blue (#4B75D9)
      const colorViolet = isLight ? '85, 70, 174' : '203, 197, 255'
      const colorBlue = isLight ? '75, 117, 217' : '77, 124, 255'
      const pulseColor = isLight ? '85, 70, 174' : '255, 255, 255'

      // 1. Draw Mouse Spotlight Glow
      if (mouse.active && mouse.x > 0 && mouse.y > 0) {
        const spotRadius = isLight ? 280 : 360
        const spotAlpha = isLight ? 0.05 : 0.08
        const radial = ctx.createRadialGradient(
          mouse.x,
          mouse.y,
          0,
          mouse.x,
          mouse.y,
          spotRadius,
        )
        radial.addColorStop(0, `rgba(${colorViolet}, ${spotAlpha})`)
        radial.addColorStop(0.5, `rgba(${colorBlue}, ${spotAlpha * 0.4})`)
        radial.addColorStop(1, 'rgba(0, 0, 0, 0)')

        ctx.fillStyle = radial
        ctx.beginPath()
        ctx.arc(mouse.x, mouse.y, spotRadius, 0, Math.PI * 2)
        ctx.fill()
      }

      // Max proximity distances
      const maxDist = 115
      const mouseMaxDist = 145

      // 2. Update and draw connection lines between close particles
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i]

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j]
          const dx = p1.x - p2.x
          const dy = p1.y - p2.y
          const dist = Math.hypot(dx, dy)

          if (dist < maxDist) {
            const lineAlpha = (1 - dist / maxDist) * (isLight ? 0.16 : 0.22)
            ctx.strokeStyle = `rgba(${colorViolet}, ${lineAlpha})`
            ctx.lineWidth = 0.85
            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.stroke()

            // Randomly spawn traveling data beam pulse along connected edge
            if (!prefersReducedMotion && time - lastPulseSpawn > 1200 && Math.random() < 0.015) {
              pulses.push({
                fromX: p1.x,
                fromY: p1.y,
                toX: p2.x,
                toY: p2.y,
                progress: 0,
                speed: 0.018 + Math.random() * 0.015,
              })
              lastPulseSpawn = time
            }
          }
        }

        // Connection line to mouse cursor
        if (mouse.active) {
          const mdx = p1.x - mouse.x
          const mdy = p1.y - mouse.y
          const mdist = Math.hypot(mdx, mdy)

          if (mdist < mouseMaxDist) {
            const mAlpha = (1 - mdist / mouseMaxDist) * (isLight ? 0.35 : 0.45)
            ctx.strokeStyle = `rgba(${colorViolet}, ${mAlpha})`
            ctx.lineWidth = 1.1
            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(mouse.x, mouse.y)
            ctx.stroke()

            // Very subtle magnetic push/pull away from cursor
            if (!prefersReducedMotion && mdist > 30) {
              const force = (1 - mdist / mouseMaxDist) * 0.35
              p1.x += (mdx / mdist) * force
              p1.y += (mdy / mdist) * force
            }
          }
        }
      }

      // 3. Draw Traveling Data Beam Pulses
      for (let k = pulses.length - 1; k >= 0; k--) {
        const pulse = pulses[k]
        pulse.progress += pulse.speed

        if (pulse.progress >= 1) {
          pulses.splice(k, 1)
          continue
        }

        const currX = pulse.fromX + (pulse.toX - pulse.fromX) * pulse.progress
        const currY = pulse.fromY + (pulse.toY - pulse.fromY) * pulse.progress
        const pulseAlpha = Math.sin(pulse.progress * Math.PI) * (isLight ? 0.85 : 0.95)

        // Outer glow
        ctx.fillStyle = `rgba(${colorViolet}, ${pulseAlpha * 0.45})`
        ctx.beginPath()
        ctx.arc(currX, currY, 3.5, 0, Math.PI * 2)
        ctx.fill()

        // Bright inner core
        ctx.fillStyle = `rgba(${pulseColor}, ${pulseAlpha})`
        ctx.beginPath()
        ctx.arc(currX, currY, 1.8, 0, Math.PI * 2)
        ctx.fill()
      }

      // 4. Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        if (!prefersReducedMotion) {
          p.x += p.vx
          p.y += p.vy - scrollVelocity * (p.radius * 0.35)

          // Wrap edges smoothly
          if (p.x < -10) p.x = width + 10
          if (p.x > width + 10) p.x = -10
          if (p.y < -10) p.y = height + 10
          if (p.y > height + 10) p.y = -10
        }

        const pColor = p.colorIndex === 0 ? colorViolet : colorBlue
        const finalAlpha = p.alpha * (isLight ? 0.65 : 0.85)

        // Draw soft glow ring around particle
        ctx.fillStyle = `rgba(${pColor}, ${finalAlpha * 0.25})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius * 2.2, 0, Math.PI * 2)
        ctx.fill()

        // Draw particle center
        ctx.fillStyle = `rgba(${pColor}, ${finalAlpha})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fill()
      }

      animationFrameId = requestAnimationFrame(render)
    }

    animationFrameId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('orientationchange', resize)
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
      window.removeEventListener('scroll', handleScroll)
      resizeObserver.disconnect()
      observer.disconnect()
    }
  }, [])

  return (
    <div className="portfolio-motion-layer" aria-hidden="true">
      {/* Drifting ambient Aurora orbs for rich color depth */}
      <span className="portfolio-orb portfolio-orb-one" />
      <span className="portfolio-orb portfolio-orb-two" />
      <span className="portfolio-orb portfolio-orb-three" />

      {/* Cyber Grid Texture */}
      <span className="portfolio-grid-glow" />

      {/* Interactive High-Performance Canvas for Particle Network & Data Beams */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 z-0 h-full w-full"
      />
    </div>
  )
}

