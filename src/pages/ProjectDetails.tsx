
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import {
  ArrowLeft,
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
} from 'lucide-react'

import { FaGithub } from 'react-icons/fa'
import ThemeToggle from '../components/ThemeToggle'
import BackgroundAnimation from '../components/BackgroundAnimation'

import {
  getPublishedProjects,
  type PortfolioProject,
} from '../lib/projects'



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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null)
  const [brokenImages, setBrokenImages] = useState<string[]>([])
  const lightboxRef = useRef<HTMLDivElement>(null)
  const closeLightboxButtonRef = useRef<HTMLButtonElement>(null)
  const previouslyFocusedElement = useRef<HTMLElement | null>(null)

  const galleryImages = (project?.galleryImages ?? [])
    .filter((img): img is string => typeof img === 'string' && img.trim().length > 0)
    .slice(0, 6)
  const isLightboxOpen = activeImageIndex !== null
  const relatedProjects = project
    ? publishedProjects.filter((item) => item.id !== project.id).slice(0, 3)
    : []

  const markImageAsBroken = (imageUrl: string) => {
    setBrokenImages((current) =>
      current.includes(imageUrl)
        ? current
        : [...current, imageUrl],
    )
  }

  const closeLightbox = useCallback(() => setActiveImageIndex(null), [])

  const showPreviousImage = useCallback(() => {
    setActiveImageIndex((current) =>
      current === null
        ? null
        : (current - 1 + galleryImages.length) % galleryImages.length,
    )
  }, [galleryImages.length])

  const showNextImage = useCallback(() => {
    setActiveImageIndex((current) =>
      current === null
        ? null
        : (current + 1) % galleryImages.length,
    )
  }, [galleryImages.length])

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

    async function loadProject() {
      try {
        setLoading(true)
        setError('')

        const publishedProjects = await getPublishedProjects()
        const foundProject =
          publishedProjects.find((item) => item.slug === slug) ?? null

        if (active) {
          setProject(foundProject)
          setPublishedProjects(publishedProjects)
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'Could not load this project.',
          )
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadProject()

    return () => {
      active = false
    }
  }, [slug])

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#08090d] px-6 text-white">
        <p className="text-sm text-zinc-400">Loading project...</p>
      </main>
    )
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#08090d] px-6 text-white">
        <div className="text-center">
          <p role="alert" className="text-sm text-red-400">
            {error}
          </p>
          <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            to="/#projects"
            onClick={handleBackToProjects}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black"
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
          <p className="text-sm uppercase tracking-[0.25em] text-violet-300">
            Project not found
          </p>
          <h1 className="mt-4 text-4xl font-semibold">
            Nothing here yet.
          </h1>
          <p className="mt-4 text-zinc-400">
            This project may have been moved or does not exist.
          </p>
          <Link
            to="/#projects"
            onClick={handleBackToProjects}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black"
          >
            <ArrowLeft size={16} /> Back to projects
          </Link>
        </div>
      </main>
    )
  }

  return (
    <div className="project-detail-page min-h-screen overflow-x-clip bg-[#08090d] text-white">
      <BackgroundAnimation />
      <header className="portfolio-nav border-b border-white/8">
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
              className="portfolio-nav-link inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white shrink-0"
            >
              <ArrowLeft size={16} /> All projects
            </Link>
          </div>
        </nav>
      </header>

      <main className="project-detail-content portfolio-container py-4 sm:py-7">
        {/* Project Header */}
        <motion.div
          className="project-detail-header"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex flex-wrap items-center gap-2.5">
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
            {project.name}
          </h1>

          {project.summary && (
            <p className="project-detail-summary">
              {project.summary}
            </p>
          )}

          <div className="project-detail-actions mt-3.5 sm:mt-4 flex flex-wrap gap-2 sm:gap-2.5">
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noreferrer"
                className="project-detail-action project-detail-action-primary"
              >
                <FaGithub size={17} /> Source code <ArrowUpRight size={15} />
              </a>
            )}

            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="project-detail-action"
              >
                <ExternalLink size={16} /> Live application <ArrowUpRight size={15} />
              </a>
            )}
            {project.demoVideo && (
              <a
                href="#demo"
                className="project-detail-action"
              >
                <PlayCircle size={16} /> Watch demo
              </a>
            )}
          </div>
        </motion.div>

        {/* Featured Project Media Container */}
        <motion.section
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.6, delay: prefersReducedMotion ? 0 : 0.12 }}
          className="project-detail-hero-frame mt-4 sm:mt-6 overflow-hidden"
        >
          <div className="project-media-bar">
            <div className="project-media-dots" aria-hidden="true">
              <span /> <span /> <span />
            </div>
            <span className="project-media-bar-title">{project.name} preview</span>
            <div className="w-12" />
          </div>

          <div className="project-media-viewport">
            {project.imageUrl && !brokenImages.includes(project.imageUrl) ? (
              <img
                src={project.imageUrl}
                alt={`${project.name} project preview`}
                className="project-detail-main-img"
                loading="lazy"
                onError={() => markImageAsBroken(project.imageUrl)}
              />
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
          <section className="project-gallery mt-5 sm:mt-7">
            <div className="section-heading">
              <p className="section-label">PROJECT GALLERY</p>
              <h2 className="project-gallery-title font-semibold mt-1">Screenshots &amp; previews</h2>
              <p className="project-gallery-summary mt-1 text-zinc-400">
                Click any screenshot to inspect in full-screen interactive preview.
              </p>
            </div>

            <div className="project-gallery-grid mt-3.5 sm:mt-4">
              {galleryImages.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setActiveImageIndex(index)}
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
                    <span className="project-gallery-caption-name font-semibold text-zinc-300">Screenshot {index + 1}</span>
                    <span className="project-gallery-caption-action text-zinc-400 group-hover:text-violet-300 transition-colors">Expand ↗</span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Overview & Sidebar Bento Grid */}
        <div className="project-detail-layout mt-5 sm:mt-7">
          <div className="project-detail-main-column">
            {/* Overview Card */}
            <div className="project-bento-card">
              <div className="project-bento-card-header">
                <span className="section-label">OVERVIEW</span>
                <h2 className="text-base sm:text-xl font-semibold mt-0.5">About this project</h2>
              </div>
              <p className="project-detail-description mt-2.5 sm:mt-3.5">
                {project.description}
              </p>
            </div>

            {/* Key Features Card */}
            {project.features.length > 0 && (
              <div className="project-bento-card mt-3.5 sm:mt-5">
                <div className="project-bento-card-header">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-violet-400" />
                    <span className="section-label">HIGHLIGHTS</span>
                  </div>
                  <h2 className="text-base sm:text-xl font-semibold mt-1">Key features</h2>
                </div>

                <div className="project-features-grid mt-3.5 sm:mt-5">
                  {project.features.map((feature, idx) => (
                    <div key={`${feature}-${idx}`} className="project-feature-item">
                      <div className="project-feature-icon">
                        <CheckCircle2 size={15} className="text-violet-400 shrink-0" />
                      </div>
                      <span className="project-feature-text">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <aside className="project-detail-sidebar">
            <div className="project-sidebar-card">
              <div className="flex items-center gap-2 mb-2.5 sm:mb-3">
                <Layers size={16} className="text-violet-400" />
                <span className="section-label">TECH STACK</span>
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Technologies used</h3>
              <div className="project-tech-chips">
                {project.stack.map((technology) => (
                  <span
                    key={technology}
                    className="project-tech-chip"
                  >
                    {technology}
                  </span>
                ))}
              </div>

              {project.demoVideo && (
                <div id="demo" className="project-demo-box mt-5 sm:mt-7 pt-4 sm:pt-6 border-t border-white/10">
                  <div className="flex items-center gap-2 mb-2.5 sm:mb-3">
                    <PlayCircle size={16} className="text-violet-400" />
                    <span className="section-label">DEMO WALKTHROUGH</span>
                  </div>
                  <div className="project-video-wrapper mt-2.5 sm:mt-3">
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

              <div className="mt-5 sm:mt-7 pt-4 sm:pt-6 border-t border-white/10">
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

        {relatedProjects.length > 0 && (
          <section className="project-related mt-8 border-t border-white/10 pt-6 sm:mt-12 sm:pt-8">
            <div className="project-related-heading">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-violet-300">Explore more</p>
                <h2 className="mt-2 text-2xl sm:text-3xl font-semibold">More selected work</h2>
              </div>
              <Link to="/#projects" onClick={handleBackToProjects} className="project-details-link">All projects <ArrowUpRight size={15} /></Link>
            </div>
            <div className="project-related-grid mt-7">
              {relatedProjects.map((relatedProject) => (
                <Link key={relatedProject.id} to={`/projects/${relatedProject.slug}`} className="project-related-card">
                  <div className="project-related-media">
                    {relatedProject.imageUrl ? (
                      <img src={relatedProject.imageUrl} alt="" loading="lazy" />
                    ) : (
                      <Code2 size={25} aria-hidden="true" />
                    )}
                  </div>
                  <div>
                    {relatedProject.category && <p>{relatedProject.category}</p>}
                    <h3>{relatedProject.name}</h3>
                    {relatedProject.summary && <span>{relatedProject.summary}</span>}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="border-t border-white/8 px-6 py-8 text-center text-sm text-zinc-500">
        Richard D&apos;Souza · Software Developer
      </footer>

      {isLightboxOpen && activeImageIndex !== null && galleryImages.length > 0 && (
        <div
          ref={lightboxRef}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label="Screenshot lightbox"
          onClick={closeLightbox}
        >
          <button
            ref={closeLightboxButtonRef}
            type="button"
            onClick={closeLightbox}
            aria-label="Close full view"
            className="absolute right-4 top-4 z-10 rounded-full border border-white/20 bg-white/10 p-3 text-white hover:bg-white/20 sm:right-6 sm:top-6"
          >
            <X size={20} />
          </button>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              showPreviousImage()
            }}
            aria-label="Previous image"
            className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/20 bg-white/10 p-3 text-white hover:bg-white/20 sm:left-6"
          >
            <ChevronLeft size={28} />
          </button>

          {brokenImages.includes(galleryImages[activeImageIndex]) ? (
            <div
              className="flex max-h-[85vh] max-w-[85vw] flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 bg-white/5 p-10 text-center"
              onClick={(event) => event.stopPropagation()}
            >
              <Code2 size={36} className="text-violet-300" />
              <p className="mt-4 text-white">Image unavailable</p>
              <p className="mt-2 text-sm text-zinc-400">
                This image could not be loaded.
              </p>
            </div>
          ) : (
            <img
              src={galleryImages[activeImageIndex]}
              alt={`${project.name} screenshot ${activeImageIndex + 1}`}
              className="max-h-[85vh] max-w-[85vw] object-contain rounded-lg"
              onError={() =>
                markImageAsBroken(galleryImages[activeImageIndex])
              }
              onClick={(event) => event.stopPropagation()}
            />
          )}

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              showNextImage()
            }}
            aria-label="Next image"
            className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/20 bg-white/10 p-3 text-white hover:bg-white/20 sm:right-6"
          >
            <ChevronRight size={28} />
          </button>

          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-zinc-300">
            {activeImageIndex + 1} / {galleryImages.length}
          </p>
        </div>
      )}
    </div>
  )
}
