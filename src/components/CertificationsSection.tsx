import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import {
  Award,
  Layers,
  X,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import CinematicSection from './CinematicSection'
import CertificationsCanvas3D from './CertificationsCanvas3D'
import CertificationCard from './CertificationCard'
import {
  getPublishedCertifications,
  type PublicCertification,
} from '../lib/certifications'
import { supabase } from '../lib/supabase'

interface CertificationsSectionProps {
  prefersReducedMotion?: boolean
}

export const CertificationsSection: React.FC<CertificationsSectionProps> = ({
  prefersReducedMotion: propPrefersReducedMotion,
}) => {
  const systemPrefersReducedMotion = useReducedMotion() ?? false
  const prefersReducedMotion = propPrefersReducedMotion ?? systemPrefersReducedMotion

  const [certifications, setCertifications] = useState<PublicCertification[]>([])
  const [loading, setLoading] = useState(true)
  const [activeIndex, setActiveIndex] = useState(0)
  const [activeModalCert, setActiveModalCert] = useState<PublicCertification | null>(null)

  const loadData = useCallback(async () => {
    try {
      const data = await getPublishedCertifications()
      setCertifications(data)
    } catch (err) {
      console.error('[Certifications] Load error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true

    async function loadInitial() {
      try {
        const data = await getPublishedCertifications()
        if (!active) return
        setCertifications(data)
      } catch (err) {
        if (!active) return
        console.error('[Certifications] Load error:', err)
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadInitial()

    // Realtime Supabase Subscription
    const channel = supabase
      .channel('public:certifications_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'certifications' },
        () => {
          void loadData()
        },
      )
      .subscribe()

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        void loadData()
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      active = false
      void supabase.removeChannel(channel)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [loadData])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeModalCert) {
        if (e.key === 'Escape') {
          setActiveModalCert(null)
        }
        return
      }

      if (certifications.length <= 1) return

      if (e.key === 'ArrowLeft') {
        setActiveIndex((prev) => (prev - 1 + certifications.length) % certifications.length)
      } else if (e.key === 'ArrowRight') {
        setActiveIndex((prev) => (prev + 1) % certifications.length)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [certifications.length, activeModalCert])

  // Separate HackerRank (index 0) and NVIDIA (index 1) or fallbacks
  const hackerRankCert =
    certifications.find((c) => c.issuer.toLowerCase().includes('hackerrank')) ||
    certifications[0]
  const nvidiaCert =
    certifications.find((c) => c.issuer.toLowerCase().includes('nvidia')) ||
    certifications[1] ||
    certifications[0]

  const isHackerRankActive = activeIndex === 0
  const carouselCards = [hackerRankCert, nvidiaCert].filter(Boolean) as PublicCertification[]

  // Mobile & Tablet Carousel
  const carouselContainerRef = useRef<HTMLDivElement | null>(null)

  // Touch Swipe Handlers for Mobile Carousel
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const touchDeltaX = useRef(0)

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    touchDeltaX.current = 0
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current
  }

  const handleTouchEnd = () => {
    const deltaX = touchDeltaX.current
    const threshold = 35
    if (deltaX < -threshold) {
      // Swiped left -> next
      setActiveIndex((prev) => Math.min(prev + 1, carouselCards.length - 1))
    } else if (deltaX > threshold) {
      // Swiped right -> prev
      setActiveIndex((prev) => Math.max(prev - 1, 0))
    }
  }

  return (
    <CinematicSection
      id="certifications"
      type="section"
      className="certifications-section relative py-14 sm:py-20 lg:py-24 overflow-hidden isolate"
    >
      {/* 1. Three.js Background Constellation Field */}
      <CertificationsCanvas3D className="z-0" />

      {/* Atmospheric Ambient Violet & Blue Glows matching reference */}
      <div
        className="pointer-events-none absolute -top-24 left-1/4 w-70 h-70 sm:w-125 sm:h-125 max-w-[80vw] max-h-[80vw] rounded-full bg-[#8B3DFF]/15 blur-[90px] sm:blur-[140px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-24 right-1/4 w-70 h-70 sm:w-125 sm:h-125 max-w-[80vw] max-h-[80vw] rounded-full bg-[#386BFF]/15 blur-[90px] sm:blur-[140px]"
        aria-hidden="true"
      />

      <div className="portfolio-container relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ─── Top Section Header (Identical to Approved Visual Reference) ─── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between items-start gap-3.5 sm:gap-4 mb-8 sm:mb-12">
          {/* Left: Purple Medal Icon Box + Headings */}
          <div className="flex items-start sm:items-center gap-3.5 sm:gap-4">
            {/* Signature Rounded Purple Icon Box */}
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-linear-to-br from-[#8B3DFF]/35 to-[#151126]/85 border border-[#8B3DFF]/40 shadow-[0_0_25px_rgba(139,61,255,0.4)] flex items-center justify-center text-[#B69AFF] shrink-0">
              <Award size={22} className="text-[#B69AFF]" />
            </div>

            <div>
              {/* Eyebrow with horizontal glowing line */}
              <div className="flex items-center gap-2.5 mb-1">
                <span className="text-[10px] sm:text-xs font-mono font-bold tracking-[0.22em] text-[#B69AFF] uppercase">
                  CREDENTIALS & RECOGNITION
                </span>
                <span className="h-[1.5px] w-8 sm:w-12 bg-linear-to-r from-[#B69AFF]/70 to-transparent rounded-full" />
              </div>

              {/* Main Heading */}
              <h2 className="font-sans text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-[#F5F3FF]">
                Certifications<span className="text-[#8B3DFF]">.</span>
              </h2>

              {/* Subtitle */}
              <p className="text-xs sm:text-sm text-[#AAA5BD] mt-0.5 leading-relaxed">
                Professional learning, verified skills and industry-recognized achievements.
              </p>
            </div>
          </div>

          {/* Right: 2 Credentials Pill */}
          {!loading && certifications.length > 0 && (
            <div className="inline-flex self-start sm:self-auto items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-[#151126]/70 backdrop-blur-md text-xs font-mono text-[#F5F3FF] shrink-0 shadow-lg">
              <Layers size={13} className="text-[#8B3DFF]" />
              <span>{certifications.length} Credentials</span>
            </div>
          )}
        </div>

        {/* ─── Main Section Content ─── */}
        {loading ? (
          /* Loading Skeleton */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-pulse">
            <div className="h-72 rounded-3xl bg-[#151126]/60 border border-white/10" />
            <div className="h-72 rounded-3xl bg-[#0f172a]/60 border border-white/10" />
          </div>
        ) : certifications.length === 0 ? (
          /* Empty State */
          <div className="rounded-3xl border border-white/10 bg-[#151126]/60 backdrop-blur-2xl p-10 text-center max-w-lg mx-auto shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-[#8B3DFF]/15 border border-[#8B3DFF]/30 text-[#B69AFF] mx-auto flex items-center justify-center mb-4">
              <Award size={28} />
            </div>
            <h3 className="text-xl font-normal text-[#F5F3FF] mb-2">Credentials in Verification</h3>
            <p className="text-sm text-[#AAA5BD]">Verified certifications will appear here once published.</p>
          </div>
        ) : (
          <div className="relative">
            {/* ─── 1. DESKTOP OVERLAPPING 2-CARD SHOWCASE (>= 1024px, Matches Reference Image) ─── */}
            <div className="hidden lg:block relative min-h-95 xl:min-h-100 w-full max-w-6xl mx-auto py-2">
              {/* Card 1: HackerRank Foreground Left Card */}
              {hackerRankCert && (
                <motion.div
                  layout
                  onClick={() => setActiveIndex(0)}
                  animate={{
                    scale: isHackerRankActive ? 1 : 0.97,
                    zIndex: isHackerRankActive ? 25 : 15,
                    opacity: isHackerRankActive ? 1 : 0.9,
                    y: isHackerRankActive ? 0 : 8,
                    rotate: isHackerRankActive ? -0.8 : -2,
                  }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute left-0 top-0 w-[54%] max-w-132.5 xl:max-w-153.75 cursor-pointer"
                >
                  <CertificationCard
                    cert={hackerRankCert}
                    index={0}
                    isForeground={isHackerRankActive}
                    totalCount={certifications.length}
                    onSelect={() => setActiveIndex(0)}
                    onViewDoc={(c) => setActiveModalCert(c)}
                    prefersReducedMotion={prefersReducedMotion}
                  />
                </motion.div>
              )}

              {/* Card 2: NVIDIA Background Right Card (with Layered Glass Panels) */}
              {nvidiaCert && (
                <div className="absolute right-0 top-3 w-[54%] max-w-132.5 xl:max-w-153.75">
                  {/* Subtle layered translucent glass plates behind NVIDIA card for authentic deck depth */}
                  <div
                    className="pointer-events-none absolute inset-0 rounded-3xl border border-[#386BFF]/25 bg-[#12285e]/30 backdrop-blur-md transform translate-x-3.5 -translate-y-2.5 z-0"
                    aria-hidden="true"
                  />
                  <div
                    className="pointer-events-none absolute inset-0 rounded-3xl border border-[#386BFF]/15 bg-[#0c1a40]/20 transform translate-x-7 -translate-y-5 z-[-1]"
                    aria-hidden="true"
                  />

                  <motion.div
                    layout
                    onClick={() => setActiveIndex(1)}
                    animate={{
                      scale: !isHackerRankActive ? 1 : 0.97,
                      zIndex: !isHackerRankActive ? 25 : 10,
                      opacity: !isHackerRankActive ? 1 : 0.92,
                      y: !isHackerRankActive ? 0 : 8,
                      rotate: !isHackerRankActive ? 0 : 1.5,
                    }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="relative z-10 cursor-pointer"
                  >
                    <CertificationCard
                      cert={nvidiaCert}
                      index={1}
                      isForeground={!isHackerRankActive}
                      totalCount={certifications.length}
                      onSelect={() => setActiveIndex(1)}
                      onViewDoc={(c) => setActiveModalCert(c)}
                      prefersReducedMotion={prefersReducedMotion}
                    />
                  </motion.div>
                </div>
              )}

              {/* Spacer div to give the container physical height for absolute children */}
              <div className="invisible pointer-events-none pb-95 xl:pb-100" aria-hidden="true" />
            </div>

            {/* ─── 2. TABLET & MOBILE VIEW: COMPACT SWIPEABLE CAROUSEL (< 1024px) ─── */}
            <div className="block lg:hidden w-full max-w-full min-w-0">
              <div
                ref={carouselContainerRef}
                className="relative w-full max-w-xl mx-auto overflow-hidden py-2 sm:py-3 touch-pan-y isolate"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <motion.div
                  animate={{ x: `-${activeIndex * 100}%` }}
                  transition={
                    prefersReducedMotion
                      ? { duration: 0.1 }
                      : { type: 'spring', stiffness: 280, damping: 30 }
                  }
                  className="flex w-full will-change-transform"
                >
                  {carouselCards.map((certItem, idx) => {
                    const isActive = activeIndex === idx
                    return (
                      <div
                        key={certItem.id || idx}
                        className="w-full max-w-full shrink-0 min-w-0 px-0.5 box-border"
                      >
                        <CertificationCard
                          cert={certItem}
                          index={idx}
                          isForeground={isActive}
                          totalCount={carouselCards.length}
                          onSelect={() => setActiveIndex(idx)}
                          onViewDoc={(c) => setActiveModalCert(c)}
                          prefersReducedMotion={prefersReducedMotion}
                          className="w-full max-w-full"
                        />
                      </div>
                    )
                  })}
                </motion.div>
              </div>

              {/* ─── Mobile Carousel Controls: Arrows + Interactive Pagination Pills ─── */}
              <div className="flex items-center justify-center gap-4 pt-3 sm:pt-5 w-full">
                {/* Prev Button */}
                <button
                  type="button"
                  onClick={() => setActiveIndex((prev) => Math.max(prev - 1, 0))}
                  disabled={activeIndex === 0}
                  aria-label="Previous certification"
                  className={`p-2 rounded-full border border-white/10 bg-[#151126]/80 text-white transition-all cursor-pointer ${
                    activeIndex === 0
                      ? 'opacity-25 cursor-not-allowed'
                      : 'hover:bg-white/10 hover:border-white/20 active:scale-95 text-[#B69AFF]'
                  }`}
                >
                  <ChevronLeft size={16} />
                </button>

                {/* Pagination Indicators */}
                <div className="flex items-center gap-2 px-1">
                  {carouselCards.map((c, idx) => {
                    const isActive = activeIndex === idx
                    const isHackerRank = c.issuer.toLowerCase().includes('hackerrank')
                    const activeColor = isHackerRank
                      ? 'w-7 h-1.5 rounded-full bg-[#8B3DFF] shadow-[0_0_10px_#8B3DFF]'
                      : 'w-7 h-1.5 rounded-full bg-[#386BFF] shadow-[0_0_10px_#386BFF]'
                    return (
                      <button
                        key={c.id || idx}
                        type="button"
                        onClick={() => setActiveIndex(idx)}
                        aria-label={`View ${c.issuer} credential`}
                        className={`transition-all duration-300 cursor-pointer ${
                          isActive
                            ? activeColor
                            : 'w-1.5 h-1.5 rounded-full bg-white/25 hover:bg-white/50'
                        }`}
                      />
                    )
                  })}
                </div>

                {/* Next Button */}
                <button
                  type="button"
                  onClick={() =>
                    setActiveIndex((prev) => Math.min(prev + 1, carouselCards.length - 1))
                  }
                  disabled={activeIndex === carouselCards.length - 1}
                  aria-label="Next certification"
                  className={`p-2 rounded-full border border-white/10 bg-[#151126]/80 text-white transition-all cursor-pointer ${
                    activeIndex === carouselCards.length - 1
                      ? 'opacity-25 cursor-not-allowed'
                      : 'hover:bg-white/10 hover:border-white/20 active:scale-95 text-[#B69AFF]'
                  }`}
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* Swipe Helper Text */}
              <div className="text-center mt-2">
                <span className="text-[11px] font-mono text-[#AAA5BD]/60 tracking-wider">
                  Swipe or tap to switch ({activeIndex + 1}/{carouselCards.length})
                </span>
              </div>
            </div>

            {/* ─── Bottom Pagination Indicators (Desktop Overlap Controller) ─── */}
            <div className="hidden lg:flex items-center justify-center gap-2 pt-6 sm:pt-8">
              <button
                type="button"
                onClick={() => setActiveIndex(0)}
                aria-label="View HackerRank credential"
                className={`transition-all duration-300 cursor-pointer ${
                  isHackerRankActive
                    ? 'w-7 h-1.5 rounded-full bg-[#8B3DFF] shadow-[0_0_10px_#8B3DFF]'
                    : 'w-1.5 h-1.5 rounded-full bg-white/25 hover:bg-white/50'
                }`}
              />
              <button
                type="button"
                onClick={() => setActiveIndex(1)}
                aria-label="View NVIDIA credential"
                className={`transition-all duration-300 cursor-pointer ${
                  !isHackerRankActive
                    ? 'w-7 h-1.5 rounded-full bg-[#386BFF] shadow-[0_0_10px_#386BFF]'
                    : 'w-1.5 h-1.5 rounded-full bg-white/25 hover:bg-white/50'
                }`}
              />
            </div>
          </div>
        )}

        {/* ─── Bottom Ambient Wavy Mesh Horizon Line ─── */}
        <div className="relative mt-8 sm:mt-12 w-full flex items-center justify-center pointer-events-none" aria-hidden="true">
          <div className="w-full h-px bg-linear-to-r from-transparent via-[#8B3DFF]/40 to-transparent" />
          <div className="absolute w-1/3 h-1 bg-linear-to-r from-[#8B3DFF]/60 via-[#E85DCE]/60 to-[#386BFF]/60 blur-[3px]" />
        </div>

        {/* ─── Modal / Lightbox for Fullscreen Certificate Inspection (High Z-Index, Mobile Optimized) ─── */}
        <AnimatePresence>
          {activeModalCert && (
            <div className="fixed inset-0 z-100 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setActiveModalCert(null)}
                className="fixed inset-0 bg-[#090914]/90 backdrop-blur-2xl"
              />

              {/* Modal Box */}
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-labelledby="cert-modal-title"
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="cert-modal relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl border border-[#8B3DFF]/35 bg-[#0e0e1a] p-4 sm:p-6 shadow-[0_25px_70px_rgba(0,0,0,0.85),0_0_35px_rgba(139,61,255,0.2)] overflow-hidden z-10"
              >
                {/* Header */}
                <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-white/10 shrink-0">
                  <div className="min-w-0 pr-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-[#B69AFF]">
                        {activeModalCert.issuer}
                      </span>
                      <span className="text-zinc-600">•</span>
                      <span className="text-xs font-mono text-[#AAA5BD]">
                        {activeModalCert.issueDate}
                      </span>
                    </div>
                    <h4
                      id="cert-modal-title"
                      className="text-base sm:text-lg font-serif font-normal text-[#F5F3FF] truncate"
                    >
                      {activeModalCert.title}
                    </h4>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {activeModalCert.certificateUrl && (
                      <a
                        href={activeModalCert.certificateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-mono text-[#AAA5BD] hover:text-[#F5F3FF] transition-colors"
                      >
                        <ExternalLink size={13} />
                        <span className="hidden sm:inline">Open Original</span>
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => setActiveModalCert(null)}
                      className="p-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-[#AAA5BD] hover:text-[#F5F3FF] transition-colors cursor-pointer"
                      aria-label="Close modal"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>

                {/* Display Window */}
                <div className="relative flex-1 min-h-55 sm:min-h-90 md:min-h-115 max-h-[62vh] sm:max-h-[72vh] w-full rounded-2xl bg-black/75 border border-white/10 flex items-center justify-center overflow-auto p-2">
                  {activeModalCert.fileType === 'pdf' ? (
                    <iframe
                      src={activeModalCert.certificateUrl}
                      title={activeModalCert.title}
                      className="w-full h-full min-h-75 rounded-xl border-0"
                    />
                  ) : (
                    <img
                      src={activeModalCert.certificateUrl}
                      alt={activeModalCert.title}
                      className="max-h-[58vh] sm:max-h-[68vh] max-w-full object-contain rounded-xl"
                    />
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </CinematicSection>
  )
}

export default CertificationsSection
