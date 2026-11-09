import { Link, useParams, useNavigate } from 'react-router-dom'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, useReducedMotion } from 'motion/react'
import {
  ArrowLeft,
  ArrowUp,
  ArrowUpRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Code2,
  ExternalLink,
  PlayCircle,
  X,
  Maximize2,
  Sparkles,
  Layers,
  Send,
} from 'lucide-react'
import { FaGithub, FaLinkedinIn } from 'react-icons/fa'
import ThemeToggle from '../components/ThemeToggle'
import BackgroundAnimation from '../components/BackgroundAnimation'
import CosmicHorizonDivider from '../components/CosmicHorizonDivider'
import { smoothScrollToTop } from '../lib/smoothScroll'

import {
  getPublishedProjects,
  type PortfolioProject,
} from '../lib/projects'
import {
  getPublishedProfile,
  type PublicProfile,
} from '../lib/profile'

function getVideoEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url)
    const host = parsed.hostname.replace(/^www\./, '')

    if (host === 'youtu.be') {
      const id = parsed.pathname.slice(1)
      return id ? `https://www.youtube.com/embed/${id}` : null
    }

    if (
      host === 'youtube.com' ||
      host === 'm.youtube.com' ||
      host === 'youtube-nocookie.com'
    ) {
      if (parsed.pathname === '/watch') {
        const id = parsed.searchParams.get('v')
        return id ? `https://www.youtube.com/embed/${id}` : null
      }

      const match = parsed.pathname.match(/^\/(?:embed|shorts)\/([^/]+)/)
      return match ? `https://www.youtube.com/embed/${match[1]}` : null
    }

    if (host === 'vimeo.com') {
      const match = parsed.pathname.match(/^\/(\d+)/)
      return match ? `https://player.vimeo.com/video/${match[1]}` : null
    }

    return null
  } catch {
    return null
  }
}

const FOOTER_NAV = [
  { label: 'Home', href: '/#home' },
  { label: 'About', href: '/#about' },
  { label: 'Skills', href: '/#skills' },
  { label: 'Projects', href: '/#projects' },
  { label: 'Contact', href: '/#contact' },
]

export default function ProjectDetails() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const prefersReducedMotion = useReducedMotion() ?? false

  function handleBackToProjects(e?: React.MouseEvent) {
    if (e) e.preventDefault()
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/#projects')
    }
  }

  const [project, setProject] = useState<PortfolioProject | null>(null)
  const [publishedProjects, setPublishedProjects] = useState<PortfolioProject[]>([])
  const [profile, setProfile] = useState<PublicProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null)
  const [brokenImages, setBrokenImages] = useState<string[]>([])
  const lightboxRef = useRef<HTMLDivElement>(null)
  const closeLightboxButtonRef = useRef<HTMLButtonElement>(null)
  const previouslyFocusedElement = useRef<HTMLElement | null>(null)

  // Carousel state for "More selected work"
  const [activeCarouselIndex, setActiveCarouselIndex] = useState(0)

  // Inspection images: main image + gallery images
  const inspectionImages = useMemo(() => {
    const list: string[] = []
    if (project?.imageUrl && project.imageUrl.trim().length > 0) {
      list.push(project.imageUrl)
    }
    if (project?.galleryImages) {
      for (const img of project.galleryImages) {
        if (img && typeof img === 'string' && img.trim().length > 0 && !list.includes(img)) {
          list.push(img)
        }
      }
    }
    return list
  }, [project?.imageUrl, project?.galleryImages])

  const galleryImages = (project?.galleryImages ?? [])
    .filter((img): img is string => typeof img === 'string' && img.trim().length > 0)
    .slice(0, 6)
  const isLightboxOpen = activeImageIndex !== null

  // All other projects excluding the current one
  const otherProjects = project
    ? publishedProjects.filter((item) => item.id !== project.id)
    : []

  const handlePrevCarouselProject = () => {
    if (otherProjects.length <= 1) return
    setActiveCarouselIndex((prev) => (prev - 1 + otherProjects.length) % otherProjects.length)
  }

  const handleNextCarouselProject = () => {
    if (otherProjects.length <= 1) return
    setActiveCarouselIndex((prev) => (prev + 1) % otherProjects.length)
  }

  const markImageAsBroken = (imageUrl: string) => {
    setBrokenImages((current) =>
      current.includes(imageUrl) ? current : [...current, imageUrl],
    )
  }

  const closeLightbox = useCallback(() => setActiveImageIndex(null), [])

  const showPreviousImage = useCallback(() => {
    if (inspectionImages.length === 0) return
    setActiveImageIndex((current) =>
      current === null
        ? null
        : (current - 1 + inspectionImages.length) % inspectionImages.length,
    )
  }, [inspectionImages.length])

  const showNextImage = useCallback(() => {
    if (inspectionImages.length === 0) return
    setActiveImageIndex((current) =>
      current === null
        ? null
        : (current + 1) % inspectionImages.length,
    )
  }, [inspectionImages.length])

  // Lock body scroll while lightbox is open
  useEffect(() => {
    if (!isLightboxOpen) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [isLightboxOpen])

  useEffect(() => {
    if (!isLightboxOpen) return

    previouslyFocusedElement.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null

    const focusFrame = window.requestAnimationFrame(() => {
      closeLightboxButtonRef.current?.focus()
    })

    return () => {
      window.cancelAnimationFrame(focusFrame)
      if (previouslyFocusedElement.current?.isConnected) {
        previouslyFocusedElement.current.focus()
      }
    }
  }, [isLightboxOpen])

  useEffect(() => {
    if (!isLightboxOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeLightbox()
        return
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        showPreviousImage()
        return
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault()
        showNextImage()
        return
      }

      if (event.key !== 'Tab') return

      const lightbox = lightboxRef.current
      if (!lightbox) return

      const focusableElements = Array.from(
        lightbox.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => !element.hasAttribute('hidden'))

      const firstElement = focusableElements[0]
      const lastElement = focusableElements.at(-1)

      if (!firstElement || !lastElement) {
        event.preventDefault()
        lightbox.focus()
        return
      }

      if (!lightbox.contains(document.activeElement)) {
        event.preventDefault()
        ;(event.shiftKey ? lastElement : firstElement).focus()
        return
      }

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [closeLightbox, isLightboxOpen, showNextImage, showPreviousImage])

  useEffect(() => {
    let active = true

    async function loadData() {
      try {
        setLoading(true)
        setError('')

        const [published, prof] = await Promise.all([
          getPublishedProjects(),
          getPublishedProfile().catch(() => null),
        ])

        const foundProject = published.find((item) => item.slug === slug) ?? null

        if (active) {
          setProject(foundProject)
          setPublishedProjects(published)
          setProfile(prof)
          setActiveCarouselIndex(0)
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error ? err.message : 'Could not load this project.',
          )
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadData()

    return () => {
      active = false
    }
  }, [slug])

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#08090d] px-6 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-400 border-t-transparent" />
          <p className="text-sm font-medium text-zinc-400">Loading project details...</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#08090d] px-6 text-white">
        <div className="text-center">
          <p role="alert" className="text-sm text-red-400 font-medium">
            {error}
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <ThemeToggle />
            <Link
              to="/#projects"
              onClick={handleBackToProjects}
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200"
            >
              <ArrowLeft size={16} /> Back to projects
            </Link>
          </div>
        </div>
      </main>
    )
  }

  if (!project) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#08090d] px-6 text-white">
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.25em] text-violet-400 font-semibold">
            Project not found
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">
            Nothing here yet.
          </h1>
          <p className="mt-4 text-zinc-400">
            This project may have been moved or does not exist.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <ThemeToggle />
            <Link
              to="/#projects"
              onClick={handleBackToProjects}
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200"
            >
              <ArrowLeft size={16} /> Back to projects
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <div className="project-detail-page min-h-screen overflow-x-clip">
      <BackgroundAnimation />

      {/* Floating Top Header Navigation */}
      <header className="portfolio-nav">
        <nav className="portfolio-container flex h-16 items-center justify-between">
          <Link
            to="/"
            onClick={() => {
              sessionStorage.removeItem('portfolio_restore_pending')
              sessionStorage.setItem('portfolio_home_scroll', '0')
            }}
            state={{ resetScroll: true }}
            className="portfolio-nav-logo inline-flex items-center"
            aria-label="Richard D'Souza Home"
          >
            <img src="/logo-dark.png" alt="Richard D'Souza" className="nav-logo-dark h-8 w-auto object-contain" />
            <img src="/logo-light.png" alt="Richard D'Souza" className="nav-logo-light h-8 w-auto object-contain" />
          </Link>
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <ThemeToggle />
            <Link
              to="/#projects"
              onClick={handleBackToProjects}
              className="project-nav-back-btn inline-flex items-center gap-2 text-sm font-semibold shrink-0"
              title="Return to projects section"
            >
              <ArrowLeft size={15} />
              <span>All projects</span>
            </Link>
          </div>
        </nav>
      </header>

      <main className="project-detail-content portfolio-container py-6 sm:py-10">
        {/* Project Header Block */}
        <motion.div
          className="project-detail-header"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <span className="project-detail-badge">
              Project {project.number}
            </span>
            {project.category && (
              <span className="project-detail-category-badge">
                {project.category}
              </span>
            )}
          </div>

          <h1 className="project-detail-title">
            <span className="project-detail-title-accent">{project.name}</span>
          </h1>

          {project.summary && (
            <p className="project-detail-summary">
              {project.summary}
            </p>
          )}

          <div className="project-detail-actions mt-4 sm:mt-5 flex flex-wrap gap-2.5 sm:gap-3">
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noreferrer"
                className="project-detail-action project-detail-action-primary"
              >
                <FaGithub size={16} /> <span>Source code</span> <ArrowUpRight size={14} />
              </a>
            )}

            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="project-detail-action"
              >
                <ExternalLink size={15} /> <span>Live application</span> <ArrowUpRight size={14} />
              </a>
            )}
            {project.demoVideo && (
              <a
                href="#demo"
                className="project-detail-action"
              >
                <PlayCircle size={15} /> <span>Watch demo</span>
              </a>
            )}
          </div>
        </motion.div>

        {/* Featured Project Browser Window Frame */}
        <motion.section
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.6, delay: prefersReducedMotion ? 0 : 0.1 }}
          className="project-detail-hero-frame mt-6 sm:mt-8 overflow-hidden"
        >
          <div className="project-media-bar">
            <div className="project-media-dots" aria-hidden="true">
              <span className="dot-red" />
              <span className="dot-yellow" />
              <span className="dot-green" />
            </div>
            <span className="project-media-bar-title font-mono">{project.name.toLowerCase()} — preview</span>
            <div className="w-12" aria-hidden="true" />
          </div>

          <div
            className="project-media-viewport group cursor-pointer relative"
            onClick={() => {
              if (inspectionImages.length > 0) {
                setActiveImageIndex(0)
              }
            }}
            title="Click to view full screen preview"
          >
            {project.imageUrl && !brokenImages.includes(project.imageUrl) ? (
              <>
                <img
                  src={project.imageUrl}
                  alt={`${project.name} project preview`}
                  className="project-detail-main-img transition-transform duration-300 group-hover:scale-[1.01]"
                  loading="lazy"
                  onError={() => markImageAsBroken(project.imageUrl)}
                />
                <div className="project-gallery-overlay">
                  <span className="project-gallery-zoom-pill">
                    <Maximize2 size={13} /> Full View
                  </span>
                </div>
              </>
            ) : (
              <div className="project-detail-media-empty">
                <Code2 size={42} className="text-violet-400" />
                <h2 className="mt-4 text-xl font-semibold">
                  {project.name}
                </h2>
                <p className="mt-2 text-sm text-zinc-400">
                  Project preview unavailable
                </p>
              </div>
            )}
          </div>
        </motion.section>

        {/* Screenshots & Previews Gallery */}
        {galleryImages.length > 0 && (
          <>
            <CosmicHorizonDivider theme="skills" className="my-8 sm:my-14" />
            <section className="project-gallery mt-6 sm:mt-10">
              <div className="section-heading">
                <p className="section-label">PROJECT GALLERY</p>
                <h2 className="project-gallery-title font-semibold mt-1">
                  Screenshots &amp; <span className="project-gallery-title-accent">previews.</span>
                </h2>
                <p className="project-gallery-summary mt-1">
                  Click any screenshot to inspect in full-screen interactive preview.
                </p>
              </div>

              <div className="project-gallery-grid mt-4 sm:mt-6">
                {galleryImages.map((image, index) => {
                  const targetIdx = inspectionImages.indexOf(image)
                  const openIdx = targetIdx >= 0 ? targetIdx : index
                  return (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      onClick={() => setActiveImageIndex(openIdx)}
                      aria-label={`Open screenshot ${index + 1} in full screen`}
                      className="project-gallery-card group"
                    >
                    <div className="project-gallery-img-wrap">
                      {brokenImages.includes(image) ? (
                        <div className="project-gallery-fallback">
                          <Code2 size={24} className="text-violet-400" />
                          <p className="mt-1.5 text-xs text-zinc-400">
                            Image unavailable
                          </p>
                        </div>
                      ) : (
                        <>
                          <img
                            src={image}
                            alt={`${project.name} screenshot ${index + 1}`}
                            loading="lazy"
                            onError={() => markImageAsBroken(image)}
                            className="project-gallery-img"
                          />
                          <div className="project-gallery-overlay">
                            <span className="project-gallery-zoom-pill">
                              <Maximize2 size={12} /> Full View
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="project-gallery-caption">
                      <span className="project-gallery-caption-name font-semibold">Screenshot {index + 1}</span>
                      <span className="project-gallery-caption-action">Expand ↗</span>
                    </div>
                  </button>
                )
              })}
              </div>
            </section>
          </>
        )}

        <CosmicHorizonDivider theme="projects" className="my-8 sm:my-14" />

        {/* Overview & Sidebar Bento Grid */}
        <div className="project-detail-layout mt-8 sm:mt-12">
          <div className="project-detail-main-column">
            {/* Overview Card */}
            <div className="project-bento-card project-overview-card group">
              <div className="project-bento-card-header">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="project-card-dot bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.8)]" />
                    <span className="section-label">02 / OVERVIEW</span>
                  </div>
                  <span className="project-meta-pill">Executive Summary</span>
                </div>
                <h2 className="project-card-headline mt-2 text-xl sm:text-2xl font-bold tracking-tight">
                  About <span className="project-heading-accent">this project</span>
                </h2>
              </div>

              <div className="project-overview-body mt-4 sm:mt-5">
                <p className="project-detail-description">
                  {project.description}
                </p>

                {/* Architecture & Engineering Highlights Bar */}
                <div className="project-overview-specs mt-5 pt-4 border-t border-border-subtle grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
                  <div className="project-spec-item">
                    <span className="project-spec-label font-mono">DOMAIN</span>
                    <span className="project-spec-val font-semibold">{project.category || 'Software Application'}</span>
                  </div>
                  <div className="project-spec-item">
                    <span className="project-spec-label font-mono">DEPLOYMENT</span>
                    <span className="project-spec-val font-semibold">{project.liveUrl ? 'Live Production' : 'Staging / Open Source'}</span>
                  </div>
                  <div className="project-spec-item col-span-2 sm:col-span-1">
                    <span className="project-spec-label font-mono">ENGINEERING</span>
                    <span className="project-spec-val font-semibold">Clean Architecture</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Features Card */}
            {project.features.length > 0 && (
              <div className="project-bento-card project-highlights-card mt-5 sm:mt-6 group">
                <div className="project-bento-card-header">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles size={14} className="text-amber-400 shrink-0" />
                      <span className="section-label">03 / HIGHLIGHTS</span>
                    </div>
                    <span className="project-meta-pill font-mono">{project.features.length} Core Features</span>
                  </div>
                  <h2 className="project-card-headline mt-2 text-xl sm:text-2xl font-bold tracking-tight">
                    Key <span className="project-heading-accent-amber">capabilities &amp; features</span>
                  </h2>
                </div>

                <div className="project-features-grid mt-4 sm:mt-5">
                  {project.features.map((feature, idx) => (
                    <div key={`${feature}-${idx}`} className="project-feature-item group/item">
                      <div className="project-feature-icon-wrapper">
                        <span className="project-feature-badge-num font-mono">{String(idx + 1).padStart(2, '0')}</span>
                        <CheckCircle2 size={15} className="project-feature-check-icon text-emerald-400 shrink-0" />
                      </div>
                      <span className="project-feature-text">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Sidebar */}
          <aside className="project-detail-sidebar">
            <div className="project-sidebar-card project-tech-card group">
              <div className="project-bento-card-header">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers size={14} className="text-cyan-400 shrink-0" />
                    <span className="section-label">04 / TECH STACK</span>
                  </div>
                  <span className="project-meta-pill font-mono">{project.stack.length} Technologies</span>
                </div>
                <h3 className="project-card-headline mt-2 text-lg sm:text-xl font-bold tracking-tight">
                  Technologies <span className="project-heading-accent-cyan">&amp; tooling</span>
                </h3>
              </div>

              <div className="project-tech-chips mt-4 sm:mt-5">
                {project.stack.map((technology) => (
                  <span
                    key={technology}
                    className="project-tech-chip"
                  >
                    <span className="project-tech-dot" aria-hidden="true" />
                    <span>{technology}</span>
                  </span>
                ))}
              </div>

              {/* Technical Specifications Summary Bento Row */}
              <div className="project-tech-specs mt-5 pt-4 border-t border-border-subtle flex flex-col gap-2.5">
                <div className="project-tech-spec-row">
                  <span className="project-tech-spec-key">Architecture</span>
                  <span className="project-tech-spec-value">Modular Component-Driven</span>
                </div>
                <div className="project-tech-spec-row">
                  <span className="project-tech-spec-key">Interface</span>
                  <span className="project-tech-spec-value">Responsive &amp; Accessible</span>
                </div>
                <div className="project-tech-spec-row">
                  <span className="project-tech-spec-key">Performance</span>
                  <span className="project-tech-spec-value">Optimized Production Build</span>
                </div>
              </div>

              {project.demoVideo && (
                <div id="demo" className="project-demo-box mt-6 pt-5 border-t border-border-subtle">
                  <div className="flex items-center gap-2 mb-2.5 sm:mb-3">
                    <PlayCircle size={16} className="text-violet-400 shrink-0" />
                    <span className="section-label">DEMO WALKTHROUGH</span>
                  </div>
                  <div className="project-video-wrapper mt-3">
                    {getVideoEmbedUrl(project.demoVideo) ? (
                      <iframe
                        src={getVideoEmbedUrl(project.demoVideo)!}
                        title={`${project.name} demo video`}
                        className="aspect-video w-full rounded-xl bg-black"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        loading="lazy"
                      />
                    ) : /\.(mp4|webm|ogg)(?:$|[?#])/i.test(project.demoVideo) ? (
                      <video
                        controls
                        preload="metadata"
                        className="aspect-video w-full rounded-xl bg-black"
                        src={project.demoVideo}
                      >
                        Your browser does not support video playback.
                      </video>
                    ) : (
                      <a
                        href={project.demoVideo}
                        target="_blank"
                        rel="noreferrer"
                        className="project-video-fallback"
                      >
                        <PlayCircle size={18} />
                        <span>Open demo video</span>
                        <ArrowUpRight size={15} />
                      </a>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-6 pt-5 border-t border-border-subtle">
                <Link
                  to="/#projects"
                  onClick={handleBackToProjects}
                  className="project-browse-link"
                >
                  <ArrowLeft size={15} />
                  <span>Browse all projects</span>
                </Link>
              </div>
            </div>
          </aside>
        </div>

        {/* More Selected Work (Interactive 3D Carousel matching SELECTED WORK) */}
        {otherProjects.length > 0 && (
          <>
            <CosmicHorizonDivider theme="about" className="my-10 sm:my-16" />
            <section className="project-related mt-8 sm:mt-12">
              <div className="project-related-header-wrap">
                <div className="section-heading">
                  <p className="section-label">EXPLORE MORE</p>
                  <h2 className="project-related-main-title mt-1 font-semibold">
                    More selected work,{' '}
                    <span className="projects-headline-accent">thoughtfully built.</span>
                  </h2>
                  <p className="section-summary mt-2">
                    Explore other applications, practical software tools, and digital platforms.
                  </p>
                </div>

              <Link
                to="/#projects"
                onClick={handleBackToProjects}
                className="project-details-link shrink-0 mt-3 sm:mt-0"
              >
                <span>All projects</span>
                <ArrowUpRight size={14} />
              </Link>
            </div>

            {/* 3D Carousel Stage */}
            <div className="projects-carousel-wrapper mt-6 sm:mt-8">
              {/* Floating Left Navigation Arrow */}
              {otherProjects.length > 1 && (
                <button
                  type="button"
                  onClick={handlePrevCarouselProject}
                  className="projects-stage-arrow projects-stage-prev"
                  aria-label="Previous project slide"
                >
                  <ChevronLeft size={22} />
                </button>
              )}

              {/* 3D Stage with Touch / Drag Gestures */}
              <motion.div
                className="projects-carousel-stage"
                drag={otherProjects.length > 1 ? 'x' : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.16}
                onDragEnd={(_e, info) => {
                  if (info.offset.x < -45 || info.velocity.x < -250) {
                    handleNextCarouselProject()
                  } else if (info.offset.x > 45 || info.velocity.x > 250) {
                    handlePrevCarouselProject()
                  }
                }}
              >
                {otherProjects.map((p, index) => {
                  const count = otherProjects.length
                  let offset = index - activeCarouselIndex
                  if (count > 2) {
                    if (offset > count / 2) offset -= count
                    if (offset < -count / 2) offset += count
                  }
                  const isActive = offset === 0
                  const isVisible = Math.abs(offset) <= 1 || count <= 2

                  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640
                  const cardStepX = isMobile ? 190 : 250

                  const animationProps = prefersReducedMotion
                    ? {
                        x: offset === 0 ? 0 : offset > 0 ? 250 : -250,
                        y: 0,
                        scale: 1,
                        opacity: offset === 0 ? 1 : 0,
                        rotateY: 0,
                        zIndex: offset === 0 ? 20 : 1,
                      }
                    : offset === 0
                    ? {
                        x: 0,
                        y: -20,
                        scale: 1,
                        rotateY: 0,
                        opacity: 1,
                        zIndex: 20,
                      }
                    : offset === -1
                    ? {
                        x: -cardStepX,
                        y: 8,
                        scale: 0.94,
                        rotateY: 5,
                        opacity: isMobile ? 0.3 : 0.55,
                        zIndex: 10,
                      }
                    : offset === 1
                    ? {
                        x: cardStepX,
                        y: 8,
                        scale: 0.94,
                        rotateY: -5,
                        opacity: isMobile ? 0.3 : 0.55,
                        zIndex: 10,
                      }
                    : {
                        x: offset < 0 ? -cardStepX * 1.8 : cardStepX * 1.8,
                        y: 12,
                        scale: 0.9,
                        rotateY: offset < 0 ? 10 : -10,
                        opacity: 0,
                        zIndex: 1,
                      }

                  const transitionProps = prefersReducedMotion
                    ? { duration: 0.25 }
                    : {
                        duration: 0.46,
                        ease: [0.25, 1, 0.5, 1] as const,
                      }

                  if (!isVisible && Math.abs(offset) > 2) return null

                  return (
                    <motion.div
                      key={p.id}
                      className={`projects-carousel-card-wrapper ${isActive ? 'is-active' : ''}`}
                      animate={animationProps}
                      transition={transitionProps}
                      whileHover={
                        isActive && !prefersReducedMotion
                          ? { y: -24, transition: { duration: 0.2, ease: 'easeOut' } }
                          : undefined
                      }
                      onClick={() => {
                        if (!isActive) {
                          setActiveCarouselIndex(index)
                        }
                      }}
                    >
                      {isActive && <div className="projects-carousel-ambient-glow" aria-hidden="true" />}
                      <article className="project-poster-card">
                        <div className="project-poster-media-window">
                          {p.imageUrl && !brokenImages.includes(p.imageUrl) ? (
                            <img
                              src={p.imageUrl}
                              alt={`${p.name} preview`}
                              className="project-poster-image"
                              loading="lazy"
                              onError={() => markImageAsBroken(p.imageUrl)}
                            />
                          ) : (
                            <div className={`project-poster-fallback bg-linear-to-br ${p.color}`}>
                              <Code2 size={32} aria-hidden="true" />
                              <span>{p.name}</span>
                            </div>
                          )}

                          <div className="project-poster-header">
                            <span className="project-poster-number">{p.number}</span>
                            {p.category && (
                              <span className="project-poster-category">{p.category}</span>
                            )}
                          </div>
                          <div className="project-poster-bottom-gradient" />
                        </div>

                        <div className="project-poster-body">
                          <div className="project-poster-title-row">
                            <h3 className="project-poster-title">{p.name}</h3>
                            {!isActive && (
                              <span className="project-poster-side-hint">View</span>
                            )}
                          </div>

                          {isActive ? (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.22 }}
                              className="project-poster-active-content"
                            >
                              {p.summary && (
                                <p className="project-poster-desc">{p.summary}</p>
                              )}

                              {p.stack && p.stack.length > 0 && (
                                <div className="project-poster-tags" aria-label={`${p.name} tech stack`}>
                                  {p.stack.slice(0, 3).map((technology) => (
                                    <span key={technology} className="project-poster-tag">
                                      {technology}
                                    </span>
                                  ))}
                                </div>
                              )}

                              <div className="project-poster-actions">
                                <Link
                                  to={`/projects/${p.slug}`}
                                  className="project-poster-details-btn"
                                  title="View Details"
                                >
                                  <span>View details</span>
                                  <ArrowUpRight size={13} />
                                </Link>

                                <div className="project-poster-icon-group">
                                  {p.liveUrl && (
                                    <a
                                      href={p.liveUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="project-circle-btn"
                                      aria-label={`Open ${p.name} live application`}
                                      title="Live Application"
                                    >
                                      <ExternalLink size={13} />
                                    </a>
                                  )}

                                  {p.github && (
                                    <a
                                      href={p.github}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="project-circle-btn"
                                      aria-label={`Open ${p.name} repository`}
                                      title="Source Code"
                                    >
                                      <FaGithub size={13} />
                                    </a>
                                  )}

                                  {p.demoVideo && (
                                    <Link
                                      to={`/projects/${p.slug}#demo`}
                                      className="project-circle-btn"
                                      aria-label={`Watch ${p.name} demo`}
                                      title="Watch Demo"
                                    >
                                      <PlayCircle size={13} />
                                    </Link>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          ) : (
                            <p className="project-poster-side-role">
                              {p.category || 'FEATURED WORK'}
                            </p>
                          )}
                        </div>
                      </article>
                    </motion.div>
                  )
                })}
              </motion.div>

              {/* Floating Right Navigation Arrow */}
              {otherProjects.length > 1 && (
                <button
                  type="button"
                  onClick={handleNextCarouselProject}
                  className="projects-stage-arrow projects-stage-next"
                  aria-label="Next project slide"
                >
                  <ChevronRight size={22} />
                </button>
              )}

              {/* Bottom Interactive Controls & Dots */}
              {otherProjects.length > 1 && (
                <div className="projects-carousel-controls">
                  <button
                    type="button"
                    onClick={handlePrevCarouselProject}
                    className="projects-control-arrow-btn"
                    aria-label="Previous project"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  <div className="projects-carousel-dots" role="tablist" aria-label="Project slide navigation">
                    {otherProjects.map((p, idx) => (
                      <button
                        key={p.id}
                        type="button"
                        role="tab"
                        aria-selected={idx === activeCarouselIndex}
                        aria-label={`Jump to project ${idx + 1}: ${p.name}`}
                        onClick={() => setActiveCarouselIndex(idx)}
                        className={`projects-carousel-dot ${idx === activeCarouselIndex ? 'is-active' : ''}`}
                      />
                    ))}
                  </div>

                  <span className="projects-carousel-counter">
                    {String(activeCarouselIndex + 1).padStart(2, '0')} / {String(otherProjects.length).padStart(2, '0')}
                  </span>

                  <button
                    type="button"
                    onClick={handleNextCarouselProject}
                    className="projects-control-arrow-btn"
                    aria-label="Next project"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>
          </section>
        </>
      )}
      </main>

      {/* Signature Full-Tier Portfolio Footer */}
      <CosmicHorizonDivider theme="footer" />
      <footer className="portfolio-footer">
        <div className="footer-glow-bar" aria-hidden="true" />

        <div className="portfolio-container footer-body-wrapper">
          {/* Top Row: Brand on Left, Connect on Right */}
          <div className="footer-top-row">
            {/* Brand Block */}
            <div className="footer-brand-block">
              <div className="footer-brand-header">
                <Link to="/" className="footer-brand-title group">
                  <span className="footer-brand-monogram">RD</span>
                  <span className="footer-brand-name">{profile?.full_name || "Richard D'Souza"}</span>
                  <span className="footer-brand-dot" aria-hidden="true" />
                </Link>
              </div>

              <p className="footer-brand-tagline">
                <span className="footer-tagline-role">{profile?.professional_title || 'Software Developer'}</span>
                <span className="footer-tagline-bullet" aria-hidden="true">•</span>
                Focused on building reliable web applications with{' '}
                <span className="footer-tagline-accent">clean code and modern architecture.</span>
              </p>
            </div>

            {/* Connect Block */}
            <div className="footer-connect-block">
              <p className="footer-section-heading">Connect &amp; Opportunities</p>

              <div className="footer-action-stack">
                <Link to="/request-resume" className="footer-resume-btn group">
                  <span>Request Resume</span>
                  <ArrowUpRight size={14} className="footer-resume-icon" aria-hidden="true" />
                </Link>

                <div className="footer-social-row">
                  <a
                    href={profile?.github_url || 'https://github.com/aestheticwolf'}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="GitHub Profile"
                    className="footer-social-pill"
                    title="GitHub"
                  >
                    <FaGithub size={15} aria-hidden="true" />
                    <span>GitHub</span>
                  </a>

                  <a
                    href={profile?.linkedin_url || 'https://www.linkedin.com/'}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="LinkedIn Profile"
                    className="footer-social-pill"
                    title="LinkedIn"
                  >
                    <FaLinkedinIn size={14} aria-hidden="true" />
                    <span>LinkedIn</span>
                  </a>

                  <a
                    href="mailto:rich.dsz1997@gmail.com"
                    className="footer-social-pill"
                    title="Send Email"
                    aria-label="Send direct email"
                  >
                    <Send size={13} aria-hidden="true" />
                    <span>Email</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Rail: Horizontal Glass Pills */}
          <div className="footer-nav-rail">
            <div className="footer-nav-label-group">
              <span className="footer-nav-label">Navigation</span>
            </div>
            <nav className="footer-nav-links-row" aria-label="Footer navigation">
              {FOOTER_NAV.map((item) => (
                <a key={item.label} href={item.href} className="footer-nav-pill">
                  <span>{item.label}</span>
                </a>
              ))}
            </nav>
          </div>

          {/* Footer Bottom Colophon */}
          <div className="footer-bottom-divider" aria-hidden="true" />
          <div className="footer-bottom-content">
            <p className="footer-copyright">
              © {new Date().getFullYear()}{' '}
              <span className="footer-copyright-name">{profile?.full_name || "Richard D'Souza"}</span>. All rights reserved.
            </p>

            <button
              type="button"
              className="footer-back-to-top group"
              onClick={(e) => {
                const target = e.currentTarget
                target.classList.add('is-launching')
                smoothScrollToTop(() => {
                  target.classList.remove('is-launching')
                })
              }}
            >
              <span>Back to top</span>
              <ArrowUp size={13} className="footer-back-icon" aria-hidden="true" />
            </button>
          </div>
        </div>
      </footer>

      {/* Lightbox inspection dialog mounted directly to body to avoid container transforms */}
      {isLightboxOpen && activeImageIndex !== null && inspectionImages.length > 0 && typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={lightboxRef}
            className="fixed inset-0 z-999999 flex flex-col items-center justify-center bg-black/92 p-4 sm:p-8 backdrop-blur-md select-none"
            role="dialog"
            aria-modal="true"
            aria-label="Screenshot lightbox"
            onClick={closeLightbox}
          >
            {/* Top-right close button */}
            <button
              ref={closeLightboxButtonRef}
              type="button"
              onClick={closeLightbox}
              aria-label="Close full view"
              className="fixed right-4 top-4 z-1000000 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white backdrop-blur-md transition hover:bg-white/20 hover:scale-105 active:scale-95 sm:right-6 sm:top-6 cursor-pointer shadow-lg"
            >
              <X size={20} />
            </button>

            {/* Left navigation arrow */}
            {inspectionImages.length > 1 && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  showPreviousImage()
                }}
                aria-label="Previous image"
                className="fixed left-3 sm:left-6 top-1/2 -translate-y-1/2 z-1000000 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white backdrop-blur-md transition hover:bg-white/20 hover:scale-105 active:scale-95 cursor-pointer shadow-lg"
              >
                <ChevronLeft size={28} />
              </button>
            )}

            {/* Central preview viewport */}
            <div
              className="relative flex max-h-[82vh] max-w-[90vw] items-center justify-center"
              onClick={(event) => event.stopPropagation()}
            >
              {brokenImages.includes(inspectionImages[activeImageIndex]) ? (
                <div className="flex h-64 w-80 flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 bg-white/5 p-8 text-center text-white">
                  <Code2 size={36} className="text-violet-300" />
                  <p className="mt-4 font-medium">Image unavailable</p>
                  <p className="mt-1 text-xs text-zinc-400">This image could not be loaded.</p>
                </div>
              ) : (
                <img
                  src={inspectionImages[activeImageIndex]}
                  alt={`${project.name} inspection screenshot ${activeImageIndex + 1}`}
                  className="max-h-[82vh] max-w-[90vw] rounded-xl object-contain shadow-2xl ring-1 ring-white/10"
                  onError={() =>
                    markImageAsBroken(inspectionImages[activeImageIndex])
                  }
                />
              )}
            </div>

            {/* Right navigation arrow */}
            {inspectionImages.length > 1 && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  showNextImage()
                }}
                aria-label="Next image"
                className="fixed right-3 sm:right-6 top-1/2 -translate-y-1/2 z-1000000 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white backdrop-blur-md transition hover:bg-white/20 hover:scale-105 active:scale-95 cursor-pointer shadow-lg"
              >
                <ChevronRight size={28} />
              </button>
            )}

            {/* Bottom active counter */}
            {inspectionImages.length > 1 && (
              <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-1000000 rounded-full border border-white/15 bg-black/70 px-4 py-1.5 text-xs font-mono font-medium text-zinc-300 backdrop-blur-md shadow-lg">
                {activeImageIndex + 1} / {inspectionImages.length}
              </div>
            )}
          </div>,
          document.body
        )
      }
    </div>
  )
}
