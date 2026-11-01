
import { Link, useParams } from 'react-router-dom'
import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
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
} from 'lucide-react'

import { FaGithub } from 'react-icons/fa'
import ThemeToggle from '../components/ThemeToggle'

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

  const [project, setProject] = useState<PortfolioProject | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null)
  const [brokenImages, setBrokenImages] = useState<string[]>([])
  const lightboxRef = useRef<HTMLDivElement>(null)
  const closeLightboxButtonRef = useRef<HTMLButtonElement>(null)
  const previouslyFocusedElement = useRef<HTMLElement | null>(null)

  const galleryImages = project?.galleryImages.slice(0, 6) ?? []
  const isLightboxOpen = activeImageIndex !== null

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
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black"
          >
            <ArrowLeft size={16} /> Back to projects
          </Link>
        </div>
      </main>
    )
  }

  return (
    <div className="min-h-screen overflow-hidden bg-[#08090d] text-white">
      <header className="portfolio-nav border-b border-white/8">
        <nav className="mx-auto flex h-19 max-w-7xl items-center justify-between px-6 lg:px-10">
          <Link to="/" className="portfolio-nav-logo text-lg font-bold tracking-tight">
            RD<span className="text-violet-400">.</span>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              to="/#projects"
              className="portfolio-nav-link inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
            >
              <ArrowLeft size={16} /> All projects
            </Link>
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-12 sm:py-20 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-sm uppercase tracking-[0.25em] text-violet-300">
            Project {project.number} / {project.category}
          </p>

          <h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-tight sm:text-6xl">
            {project.name}
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-400">
            {project.description}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
  {project.github && (
    <a
      href={project.github}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-violet-200"
    >
      <FaGithub size={17} /> Source code <ArrowUpRight size={15} />
    </a>
  )}

            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm transition hover:border-violet-400/50"
              >
                <ExternalLink size={16} /> Live application
              </a>
            )}
          </div>
        </motion.div>


        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className={`mt-14 overflow-hidden rounded-3xl border border-white/10 bg-linear-to-br ${project.color} p-5 sm:p-10`}
        >
          {project.imageUrl && !brokenImages.includes(project.imageUrl) ? (
  <img
    src={project.imageUrl}
    alt={`${project.name} project preview`}
    className="max-h-150 min-h-52 w-full rounded-2xl border border-white/10 bg-[#08090d]/65 object-contain sm:min-h-72"
    loading="lazy"
    onError={() => markImageAsBroken(project.imageUrl)}
  />
) : (
  <div className="flex min-h-52 flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-[#08090d]/65 p-6 text-center sm:min-h-72">
    <Code2 size={42} className="text-violet-300" />
    <h2 className="mt-5 text-2xl font-semibold">
      {project.name}
    </h2>
    <p className="mt-3 text-sm text-zinc-400">
      Project preview unavailable
    </p>
  </div>
)}
        </motion.section>


        {project.galleryImages.length > 0 && (
          <section className="mt-16">
            <p className="text-sm uppercase tracking-[0.25em] text-violet-300">
              PROJECT GALLERY
            </p>

            <h2 className="mt-4 text-3xl font-semibold">
              Screenshots &amp; previews
            </h2>

            <p className="mt-3 text-sm text-zinc-400">
              Explore different screens and views of this project.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {project.galleryImages.slice(0, 6).map((image, index) => (
               <button
  key={`${image}-${index}`}
  type="button"
  onClick={() => setActiveImageIndex(index)}
  aria-label={`Open screenshot ${index + 1} in full screen`}
  className="group block w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 text-left"
>
                 {brokenImages.includes(image) ? (
  <div className="flex h-72 w-full flex-col items-center justify-center bg-white/5 px-4 text-center">
    <Code2 size={30} className="text-violet-300" />
    <p className="mt-3 text-sm text-zinc-300">
      Image unavailable
    </p>
    <p className="mt-1 text-xs text-zinc-500">
      Check the image URL in your admin dashboard.
    </p>
  </div>
) : (
  <img
    src={image}
    alt={`${project.name} screenshot ${index + 1}`}
    loading="lazy"
    onError={() => markImageAsBroken(image)}
    className="h-72 w-full bg-[#08090d] object-contain transition duration-300 group-hover:scale-[1.02]"
  />
)}
                  <figcaption className="px-4 py-3 text-sm text-zinc-400">
                    Screenshot {index + 1}
                  </figcaption>
</button>
              ))}

              {isLightboxOpen && galleryImages.length > 0 && (
  <div
    ref={lightboxRef}
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 sm:p-8"
    role="dialog"
    aria-modal="true"
    aria-label="Project image gallery"
    tabIndex={-1}
    onClick={closeLightbox}
  >
    <button
      ref={closeLightboxButtonRef}
      type="button"
      onClick={closeLightbox}
      aria-label="Close full-screen gallery"
      className="absolute right-5 top-5 z-10 rounded-full border border-white/20 bg-white/10 p-3 text-white hover:bg-white/20"
    >
      <X size={24} />
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
    className="flex h-64 w-full max-w-xl flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-6 text-center"
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
    className="max-h-[85vh] max-w-[85vw] object-contain"
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
          </section>
        )}


        <div className="mt-16 grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
          <section>
            <p className="text-sm uppercase tracking-[0.25em] text-violet-300">
              Overview
            </p>
            <h2 className="mt-4 text-3xl font-semibold">
              About this project
            </h2>
            <p className="mt-5 leading-8 text-zinc-400">
              {project.description}
            </p>

            <h2 className="mt-10 text-2xl font-semibold">
              Key features
            </h2>
            <ul className="mt-5 space-y-4">
              {project.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-3 text-zinc-300"
                >
                  <CheckCircle2
                    size={19}
                    className="mt-1 shrink-0 text-violet-300"
                  />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </section>

          <aside className="h-fit rounded-2xl border border-white/10 bg-white/2.5 p-6 sm:p-8">
            <p className="text-sm uppercase tracking-[0.25em] text-violet-300">
              Project information
            </p>

            <h2 className="mt-5 text-xl font-semibold">
              Technologies used
            </h2>

            <div className="mt-4 flex flex-wrap gap-2">
              {project.stack.map((technology) => (
                <span
                  key={technology}
                  className="rounded-lg border border-white/10 bg-white/4 px-3 py-2 text-sm text-zinc-300"
                >
                  {technology}
                </span>
              ))}
            </div>

            <div className="mt-8 border-t border-white/10 pt-6">
              <h3 className="font-medium">Demo video</h3>


{project.demoVideo ? (
  <div className="mt-4">
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
        className="inline-flex items-center gap-2 text-sm text-violet-300 hover:text-white"
      >
        <PlayCircle size={18} />
        Open demo video
        <ArrowUpRight size={15} />
      </a>
    )}
  </div>
) : (
  <div className="mt-4 rounded-xl border border-dashed border-white/15 p-5">
    <PlayCircle size={25} className="text-violet-300" />
    <p className="mt-3 text-sm text-zinc-300">Demo coming soon</p>
    <p className="mt-2 text-xs leading-5 text-zinc-500">
      Your project walkthrough will appear here when a video is added.
    </p>
  </div>
)}

            </div>

            <div className="mt-8 border-t border-white/10 pt-6">
              <h3 className="font-medium">Explore more</h3>
              <Link
                to="/#projects"
                className="mt-4 inline-flex items-center gap-2 text-sm text-violet-300 transition hover:text-white"
              >
                Browse all projects <ArrowUpRight size={15} />
              </Link>
            </div>
          </aside>
        </div>
      </main>

      <footer className="border-t border-white/8 px-6 py-8 text-center text-sm text-zinc-500">
        Richard D&apos;Souza · Software Developer
      </footer>
    </div>
  )
}
