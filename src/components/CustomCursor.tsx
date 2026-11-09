import { useEffect, useRef, useState } from 'react'

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  
  const [isVisible, setIsVisible] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [isClicking, setIsClicking] = useState(false)
  const [isTextHover, setIsTextHover] = useState(false)

  useEffect(() => {
    // Only enable on devices that have a fine pointer (mouse / trackpad)
    if (typeof window === 'undefined') return
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches
    if (isTouchDevice) return

    let mouseX = -100
    let mouseY = -100
    let ringX = -100
    let ringY = -100
    let rafId: number

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY

      if (!isVisible) setIsVisible(true)

      // Move center precision dot immediately (0ms latency)
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`
      }

      // Check if hovering over interactive element
      const target = e.target as HTMLElement | null
      if (target) {
        const interactive = target.closest(
          'a, button, input, textarea, select, [role="button"], [role="tab"], .project-poster-card, .project-gallery-card, .tech-pill-btn, .about-deck-tab-btn, .about-highlight-pill, .footer-social-pill, .footer-nav-pill, .project-circle-btn, .projects-control-arrow-btn, .projects-stage-arrow'
        )
        const textTarget = target.closest('h1, h2, h3, p, span, blockquote') && !interactive
        setIsHovering(!!interactive)
        setIsTextHover(!!textTarget && !interactive)
      }
    }

    const onMouseDown = () => setIsClicking(true)
    const onMouseUp = () => setIsClicking(false)
    const onMouseLeave = () => setIsVisible(false)
    const onMouseEnter = () => setIsVisible(true)

    // Smooth physics loop for the trailing ring
    const render = () => {
      // Lerp ring towards mouse position (0.18 factor = buttery responsiveness)
      ringX += (mouseX - ringX) * 0.18
      ringY += (mouseY - ringY) * 0.18

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`
      }

      rafId = requestAnimationFrame(render)
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true })
    window.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mouseup', onMouseUp)
    document.addEventListener('mouseleave', onMouseLeave)
    document.addEventListener('mouseenter', onMouseEnter)
    rafId = requestAnimationFrame(render)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mouseup', onMouseUp)
      document.removeEventListener('mouseleave', onMouseLeave)
      document.removeEventListener('mouseenter', onMouseEnter)
      cancelAnimationFrame(rafId)
    }
  }, [isVisible])

  // Don't render on SSR
  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
    return null
  }

  return (
    <div
      className={`custom-cursor-root pointer-events-none fixed inset-0 z-[9999] overflow-hidden ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      aria-hidden="true"
    >
      {/* Precision Core Dot (Zero Latency) */}
      <div
        ref={dotRef}
        className={`custom-cursor-dot fixed top-0 left-0 -ml-1 -mt-1 h-2 w-2 rounded-full transition-transform duration-75 ease-out ${
          isHovering ? 'scale-0' : isTextHover ? 'scale-75 opacity-70' : 'scale-100'
        }`}
      />

      {/* Fluid Trailing Magnetic Ring (Lerp Physics) */}
      <div
        ref={ringRef}
        className={`custom-cursor-ring fixed top-0 left-0 rounded-full transition-[width,height,margin,border-color,background-color,box-shadow,opacity] duration-200 ease-out ${
          isClicking
            ? '-ml-4 -mt-4 h-8 w-8 scale-90 border-[2px] is-clicking'
            : isHovering
            ? '-ml-7 -mt-7 h-14 w-14 border-[1.5px] is-hovering shadow-lg'
            : isTextHover
            ? '-ml-4 -mt-4 h-8 w-8 border-[1px] opacity-40'
            : '-ml-4 -mt-4 h-8 w-8 border-[1.5px] opacity-80'
        }`}
      />
    </div>
  )
}
