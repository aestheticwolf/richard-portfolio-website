/**
 * Smooth custom-eased scroll to top with an ascending visual transition beam.
 */

let isScrolling = false

export function smoothScrollToTop(callback?: () => void) {
  if (typeof window === 'undefined') return

  const startY = window.scrollY || document.documentElement.scrollTop
  if (startY <= 10) {
    if (callback) callback()
    return
  }

  // Check prefers-reduced-motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    if (callback) callback()
    return
  }

  // Trigger ascending transit effect
  triggerAscentEffect()

  // Calculate dynamic duration based on scroll distance (650ms to 950ms)
  const duration = Math.min(950, Math.max(650, Math.floor(Math.sqrt(startY) * 16)))
  const startTime = performance.now()
  isScrolling = true

  // Allow user to cancel if they manually scroll / touch
  const abort = () => {
    isScrolling = false
    cleanup()
  }

  const cleanup = () => {
    window.removeEventListener('wheel', abort)
    window.removeEventListener('touchstart', abort)
  }

  window.addEventListener('wheel', abort, { passive: true, once: true })
  window.addEventListener('touchstart', abort, { passive: true, once: true })

  // Easing: Quintic / Quartic ease-in-out curve for buttery momentum
  const easeInOutQuart = (t: number) => {
    return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2
  }

  const step = (currentTime: number) => {
    if (!isScrolling) return

    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    const eased = easeInOutQuart(progress)

    const nextY = Math.round(startY * (1 - eased))
    window.scrollTo(0, nextY)

    if (progress < 1) {
      requestAnimationFrame(step)
    } else {
      isScrolling = false
      window.scrollTo(0, 0)
      cleanup()
      if (document.documentElement.scrollLeft !== 0) {
        document.documentElement.scrollLeft = 0
      }
      if (document.body.scrollLeft !== 0) {
        document.body.scrollLeft = 0
      }
      if (callback) callback()
    }
  }

  requestAnimationFrame(step)
}

function triggerAscentEffect() {
  if (typeof document === 'undefined') return

  // Remove existing transit beam if any
  const existing = document.getElementById('portfolio-ascent-beam')
  if (existing) existing.remove()

  const beam = document.createElement('div')
  beam.id = 'portfolio-ascent-beam'
  beam.className = 'portfolio-ascent-beam'
  beam.setAttribute('aria-hidden', 'true')
  document.body.appendChild(beam)

  setTimeout(() => {
    if (beam.parentNode) {
      beam.parentNode.removeChild(beam)
    }
  }, 1000)
}
