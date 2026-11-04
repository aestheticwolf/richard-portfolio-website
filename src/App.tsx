
import { useEffect, useState, type FormEvent } from 'react'
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring } from 'motion/react'
import {
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  ExternalLink,
  Mail,
  Menu,
  X,
  Code2,
  Cloud,
  KeyRound,
  MapPin,
  PlayCircle,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  Terminal,
  ChevronDown,
  Check,
  Copy,
  Send,
  FileCode,
  Layers,
  Compass,
} from 'lucide-react'
import { FaGithub, FaLinkedinIn, FaAws } from 'react-icons/fa'
import type { IconType } from 'react-icons'
import {
  SiCplusplus,
  SiSharp,
  SiCss,
  SiDocker,
  SiExpress,
  SiFirebase,
  SiGit,
  SiGithub,
  SiGo,
  SiHtml5,
  SiOpenjdk,
  SiJavascript,
  SiMongodb,
  SiNodedotjs,
  SiPostgresql,
  SiPython,
  SiReact,
  SiRust,
  SiSupabase,
  SiTailwindcss,
  SiTypescript,
  SiVercel,
  SiNextdotjs,
  SiVuedotjs,
  SiSass,
  SiRedux,
  SiVite,
  SiBootstrap,
  SiNestjs,
  SiDjango,
  SiFastapi,
  SiSpringboot,
  SiDotnet,
  SiGraphql,
  SiMysql,
  SiRedis,
} from 'react-icons/si'
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import ProjectDetails from './pages/ProjectDetails'
import ThemeToggle from './components/ThemeToggle'
import BackgroundAnimation from './components/BackgroundAnimation'
import {
  getPublishedProjects,
  type PortfolioProject,
} from './lib/projects'
import {
  getPublishedProfile,
  type PublicProfile,
} from './lib/profile'
import RequestResume from './pages/RequestResume'
import ResumeAccess from './pages/ResumeAccess'

const navigation = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Skills', href: '#skills' },
  { label: 'Projects', href: '#projects' },
  { label: 'Contact', href: '#contact' },
]

const skills = [
  {
    name: 'Frontend Development',
    icon: Code2,
    technologies: [
      { name: 'React', icon: SiReact, tone: 'react' },
      { name: 'TypeScript', icon: SiTypescript, tone: 'typescript' },
      { name: 'HTML', icon: SiHtml5, tone: 'html' },
      { name: 'CSS', icon: SiCss, tone: 'css' },
    ],
  },
  {
    name: 'Backend Development',
    icon: Code2,
    technologies: [
      { name: 'Node.js', icon: SiNodedotjs, tone: 'node' },
      { name: 'Express', icon: SiExpress, tone: 'express' },
      { name: 'REST APIs', icon: Code2, tone: 'api' },
    ],
  },
  {
    name: 'Cloud & Deployment',
    icon: Cloud,
    technologies: [
      { name: 'Firebase', icon: SiFirebase, tone: 'firebase' },
      { name: 'Supabase', icon: SiSupabase, tone: 'supabase' },
      { name: 'Vercel', icon: SiVercel, tone: 'vercel' },
    ],
  },
  {
    name: 'Security Fundamentals',
    icon: ShieldCheck,
    technologies: [
      { name: 'Authentication', icon: KeyRound, tone: 'security' },
      { name: 'Authorization', icon: ShieldCheck, tone: 'security' },
      { name: 'Firewalls', icon: ShieldCheck, tone: 'security' },
    ],
  },
]

const technologyIconMap: Record<string, IconType> = {
  React: SiReact,
  TypeScript: SiTypescript,
  JavaScript: SiJavascript,
  'Next.js': SiNextdotjs,
  'Tailwind CSS': SiTailwindcss,
  'Vue.js': SiVuedotjs,
  HTML: SiHtml5,
  CSS: SiCss,
  Sass: SiSass,
  Redux: SiRedux,
  Vite: SiVite,
  Bootstrap: SiBootstrap,
  'Node.js': SiNodedotjs,
  Express: SiExpress,
  NestJS: SiNestjs,
  Python: SiPython,
  Django: SiDjango,
  FastAPI: SiFastapi,
  Java: SiOpenjdk,
  'Spring Boot': SiSpringboot,
  'C++': SiCplusplus,
  'C#': SiSharp,
  '.NET': SiDotnet,
  Go: SiGo,
  Rust: SiRust,
  GraphQL: SiGraphql,
  PostgreSQL: SiPostgresql,
  MongoDB: SiMongodb,
  MySQL: SiMysql,
  Redis: SiRedis,
  Supabase: SiSupabase,
  Firebase: SiFirebase,
  Docker: SiDocker,
  AWS: FaAws,
  Vercel: SiVercel,
  Git: SiGit,
  GitHub: SiGithub,
}

const normalizeTechnologyName = (name: string) =>
  name.toLowerCase().replace(/[\s._-]/g, '')

const technologyIconAliases: Record<string, string> = {
  reactjs: 'react',
  reactnative: 'react',
  ts: 'typescript',
  js: 'javascript',
  nextjs: 'nextjs',
  next: 'nextjs',
  tailwind: 'tailwindcss',
  tailwindcss: 'tailwindcss',
  vue: 'vuejs',
  vuejs: 'vuejs',
  html5: 'html',
  css3: 'css',
  node: 'nodejs',
  nodejs: 'nodejs',
  expressjs: 'express',
  py: 'python',
  golang: 'go',
  cpp: 'c++',
  csharp: 'c#',
  dotnet: '.net',
  postgres: 'postgresql',
  mongo: 'mongodb',
}

const technologyIconsByNormalizedName = Object.fromEntries(
  Object.entries(technologyIconMap).map(([name, Icon]) => [normalizeTechnologyName(name), Icon]),
)

function getTechnologyIcon(name: string): IconType | undefined {
  const normalizedName = normalizeTechnologyName(name)
  const canonicalName = technologyIconAliases[normalizedName] ?? normalizedName
  return technologyIconsByNormalizedName[canonicalName]
}

const technologyLucideIconMap: Record<string, typeof Code2> = {
  Authentication: KeyRound,
  Authorization: ShieldCheck,
  Firewalls: ShieldCheck,
  'REST APIs': Code2,
}

const technologyToneMap: Record<string, string> = {
  React: 'react',
  TypeScript: 'typescript',
  JavaScript: 'javascript',
  'Next.js': 'nextjs',
  'Tailwind CSS': 'tailwind',
  'Vue.js': 'vue',
  HTML: 'html',
  CSS: 'css',
  Sass: 'sass',
  Redux: 'redux',
  Vite: 'vite',
  Bootstrap: 'bootstrap',
  'Node.js': 'node',
  Express: 'express',
  NestJS: 'nestjs',
  Python: 'python',
  Django: 'django',
  FastAPI: 'fastapi',
  Java: 'java',
  'Spring Boot': 'springboot',
  'C++': 'cpp',
  'C#': 'csharp',
  '.NET': 'dotnet',
  Go: 'go',
  Rust: 'rust',
  GraphQL: 'graphql',
  'REST APIs': 'api',
  PostgreSQL: 'postgresql',
  MongoDB: 'mongodb',
  MySQL: 'mysql',
  Redis: 'redis',
  Firebase: 'firebase',
  Supabase: 'supabase',
  Docker: 'docker',
  AWS: 'aws',
  Vercel: 'vercel',
  Git: 'git',
  GitHub: 'github',
  Authentication: 'security',
  Authorization: 'security',
  Firewalls: 'security',
}




const reveal = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.985,
    filter: 'blur(5px)',
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.72,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.14,
    },
  },
};

const reducedReveal = {
  hidden: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' },
  visible: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', transition: { duration: 0 } },
}

const reducedStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0 } },
}

function ScrollProgress() {
  const prefersReducedMotion = useReducedMotion() ?? false
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 30,
    restDelta: 0.001,
  })
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 30,
    restDelta: 0.001,
  })

  return (
    <>
      <motion.div
        className="scroll-progress"
        style={{ scaleX: prefersReducedMotion ? scrollYProgress : scaleX }}
        aria-hidden="true"
      />
      <motion.div
        className="side-scroll-progress"
        style={{ scaleY: prefersReducedMotion ? scrollYProgress : scaleY }}
        aria-hidden="true"
      />
    </>
  )
}

function GlobalBackToTop() {
  const prefersReducedMotion = useReducedMotion() ?? false
  const [showBackToTop, setShowBackToTop] = useState(false)

  useEffect(() => {
    const updateBackToTop = () => {
      setShowBackToTop(window.scrollY > 420)
    }

    window.addEventListener('scroll', updateBackToTop, { passive: true })
    updateBackToTop()
    return () => window.removeEventListener('scroll', updateBackToTop)
  }, [])

  return (
    <AnimatePresence>
      {showBackToTop && (
        <motion.button
          type="button"
          className="back-to-top-button group"
          aria-label="Back to top"
          title="Back to top"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 16, scale: 0.88 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={prefersReducedMotion ? undefined : { opacity: 0, y: 12, scale: 0.88 }}
          whileHover={prefersReducedMotion ? undefined : { y: -4, scale: 1.08 }}
          whileTap={prefersReducedMotion ? undefined : { scale: 0.94 }}
          transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          onClick={() => window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' })}
        >
          <span className="back-to-top-halo" aria-hidden="true" />
          <span className="back-to-top-body">
            <ArrowUp size={18} className="back-to-top-icon" aria-hidden="true" />
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  )
}





function Home() {
  const prefersReducedMotion = useReducedMotion() ?? false
  const sectionReveal = prefersReducedMotion ? reducedReveal : reveal
  const sectionStagger = prefersReducedMotion ? reducedStagger : stagger
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  const [projects, setProjects] = useState<PortfolioProject[]>([])
  const [projectsLoading, setProjectsLoading] = useState(true)
  const [projectsError, setProjectsError] = useState('')
  const [brokenProjectImages, setBrokenProjectImages] = useState<string[]>([])
  const [profile, setProfile] = useState<PublicProfile | null>(null)
  const [profileError, setProfileError] = useState('')
  const [aboutExpanded, setAboutExpanded] = useState(true)
  const [contactStatus, setContactStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [emailCopied, setEmailCopied] = useState(false)
  const [heroConsoleTab, setHeroConsoleTab] = useState<'developer' | 'stack' | 'terminal'>('developer')
  const [codeCopied, setCodeCopied] = useState(false)
  const handleCopyCode = () => {
    let copyText = ''
    if (heroConsoleTab === 'developer') {
      copyText = `// A little about me\nconst developer = {\n  name: "${profile?.full_name || "Richard D'Souza"}",\n  focus: "${profile?.professional_title || 'Software Developer'}",\n  interests: [\n    ${(profile?.interests?.length ? profile.interests : ['Web Development', 'Cloud & Security', 'AI Applications', 'System Design']).map(i => `'${i}'`).join(',\n    ')}\n  ],\n  learning: true,\n  available: true\n}`
    } else if (heroConsoleTab === 'stack') {
      copyText = JSON.stringify({
        frontend: ['React', 'TypeScript', 'Tailwind CSS', 'HTML5 & CSS3'],
        backend: ['Node.js', 'Express', 'PostgreSQL', 'MongoDB', 'Supabase'],
        devops_ai: ['Docker', 'Git', 'REST APIs', 'AI API Integration']
      }, null, 2)
    } else {
      copyText = `$ richard --status\n✔ Role        : ${profile?.professional_title || 'Software Developer'}\n✔ Education   : MSc in Information Technology\n✔ Location    : ${profile?.location || 'Goa, India'} (UTC +5:30)\n✔ Focus       : Full-Stack Web, Cloud & AI Systems\n✔ Availability: Open to Full-Time & Contract Roles`
    }
    navigator.clipboard.writeText(copyText)
    setCodeCopied(true)
    window.setTimeout(() => setCodeCopied(false), 2000)
  }
  const handleCopyEmail = () => {
    navigator.clipboard.writeText('rich.dsz1997@gmail.com')
    setEmailCopied(true)
    window.setTimeout(() => setEmailCopied(false), 2200)
  }
  const [contactStatusMessage, setContactStatusMessage] = useState('')
  const [heroTypingCycle, setHeroTypingCycle] = useState(0)
  const [heroTypingIsExiting, setHeroTypingIsExiting] = useState(false)
  const heroName = profile?.full_name || "Richard D'Souza"
  const heroNameCharacters = [...heroName]
  const surnameSIndex = heroName.toLowerCase().indexOf('s', heroName.indexOf(' ') + 1)
  const heroTypingCycleDuration = 10_000
  const heroLetterAnimationDuration = 2_600
  const heroLetterStagger = 55
  const heroTypingExitDelay = Math.max(
    0,
    heroTypingCycleDuration -
      heroLetterAnimationDuration -
      (heroNameCharacters.length - 1) * heroLetterStagger,
  )

  useEffect(() => {
    if (prefersReducedMotion) return

    const exitTimer = window.setTimeout(() => {
      setHeroTypingIsExiting(true)
    }, heroTypingExitDelay)
    const typingCycleTimer = window.setTimeout(() => {
      setHeroTypingIsExiting(false)
      setHeroTypingCycle((currentCycle) => currentCycle + 1)
    }, heroTypingCycleDuration)

    return () => {
      window.clearTimeout(exitTimer)
      window.clearTimeout(typingCycleTimer)
    }
  }, [heroTypingCycle, heroTypingCycleDuration, heroTypingExitDelay, prefersReducedMotion])

  const handleContactSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (contactStatus === 'sending') return

    const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY
    if (!accessKey) {
      setContactStatus('error')
      setContactStatusMessage('The message form is not configured yet. Please email me directly using the link below.')
      return
    }

    const form = event.currentTarget
    const formData = new FormData(form)
    formData.set('access_key', accessKey)
    formData.set('subject', `Portfolio message from ${String(formData.get('name') || 'a visitor')}`)
    formData.set('from_name', "Richard D'Souza Portfolio")
    setContactStatus('sending')
    setContactStatusMessage('Sending your message…')

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' },
      })
      const result: { success?: boolean } = await response.json()

      if (!response.ok || !result.success) throw new Error('Submission failed')

      form.reset()
      setContactStatus('sent')
      setContactStatusMessage('Thanks for reaching out. Your message has been sent.')
    } catch {
      setContactStatus('error')
      setContactStatusMessage('Your message could not be sent right now. Please try again or email me directly below.')
    }
  }
  const displayedSkills = profile?.skills?.length
    ? profile.skills
        .filter((skill) => skill && typeof skill.name === 'string')
        .map((skill) => ({
          name: skill.name,
          icon: /cloud|deploy/i.test(skill.name)
            ? Cloud
            : /security/i.test(skill.name)
              ? ShieldCheck
              : Code2,
          technologies: (Array.isArray(skill.technologies) ? skill.technologies : [])
            .filter((technology): technology is string => typeof technology === 'string' && technology.trim().length > 0)
            .map((name) => ({
              name,
              icon: getTechnologyIcon(name) ?? technologyLucideIconMap[name] ?? Code2,
              tone: technologyToneMap[name] ?? 'default',
            })),
        }))
    : skills

  const markProjectImageAsBroken = (imageUrl: string) => {
    setBrokenProjectImages((current) =>
      current.includes(imageUrl) ? current : [...current, imageUrl],
    )
  }

  useEffect(() => {
    let active = true

    async function loadProjects() {
      try {
        const publishedProjects = await getPublishedProjects()

        if (active) {
          setProjects(publishedProjects)
        }
      } catch (error) {
        if (active) {
          setProjectsError(
            error instanceof Error
              ? error.message
              : 'Could not load projects.',
          )
        }
      } finally {
        if (active) {
          setProjectsLoading(false)
        }
      }
    }

    void loadProjects()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    const sections = navigation
      .map(({ href }) => document.querySelector(href))
      .filter((section): section is HTMLElement => section instanceof HTMLElement)

    const updateActiveSection = () => {
      const navbarHeight =
        document.querySelector<HTMLElement>('.portfolio-nav')
          ?.getBoundingClientRect().height ?? 76
      const readingLine = navbarHeight + 24
      const currentSection =
        sections.find(
          (section) => section.getBoundingClientRect().bottom > readingLine,
        ) ?? sections.at(-1)

      if (currentSection) setActiveSection(currentSection.id)
    }

    let animationFrame = 0
    const scheduleUpdate = () => {
      if (animationFrame) return
      animationFrame = window.requestAnimationFrame(() => {
        animationFrame = 0
        updateActiveSection()
      })
    }

    scheduleUpdate()
    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate)
    window.addEventListener('hashchange', scheduleUpdate)
    window.addEventListener('pageshow', scheduleUpdate)

    return () => {
      window.cancelAnimationFrame(animationFrame)
      window.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)
      window.removeEventListener('hashchange', scheduleUpdate)
      window.removeEventListener('pageshow', scheduleUpdate)
    }
  }, [])




    useEffect(() => {
    let active = true

    async function loadProfile() {
      try {
        const publishedProfile = await getPublishedProfile()

        if (active) {
          setProfile(publishedProfile)
        }
      } catch (error) {
        if (active) {
          setProfileError(
            error instanceof Error
              ? error.message
              : 'Could not load profile.',
          )
        }
      }
    }

    void loadProfile()

    return () => {
      active = false
    }
  }, [])


  return (
    <div className="min-h-screen overflow-hidden bg-[#08090d] text-white">
      <BackgroundAnimation />
      <header className="portfolio-nav fixed inset-x-0 top-0 z-50 border-b border-white/7 bg-[#08090d]/85 backdrop-blur-xl">
        <nav className="mx-auto flex h-19 max-w-7xl items-center justify-between px-6 lg:px-10">
          <a
            href="#home"
            className="portfolio-nav-logo inline-flex items-center"
            aria-label="Richard D'Souza Home"
          >
            <img src="/logo-dark.png" alt="Richard D'Souza" className="nav-logo-dark h-8 w-auto object-contain" />
            <img src="/logo-light.png" alt="Richard D'Souza" className="nav-logo-light h-8 w-auto object-contain" />
          </a>

          <div className="hidden items-center gap-8 md:flex">
            {navigation.map((item) => (
              <a
                key={item.label}
                href={item.href}
                aria-current={activeSection === item.href.slice(1) ? 'page' : undefined}
                className={`portfolio-nav-link text-sm text-zinc-400 transition hover:text-white ${activeSection === item.href.slice(1) ? 'is-active' : ''}`}
              >
                {item.label}
                {activeSection === item.href.slice(1) && (
                  <motion.span
                    className="portfolio-nav-active-indicator"
                    layoutId="portfolio-nav-active-indicator"
                    transition={prefersReducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 34 }}
                  />
                )}
              </a>
            ))}
          </div>

          <div className="hidden items-center gap-3 sm:flex">
          <ThemeToggle />
          <a
            href="#contact"
            className="portfolio-nav-cta inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm transition hover:border-violet-400 hover:bg-violet-400/10"
          >
            Let's connect <ArrowUpRight size={16} />
          </a>
          </div>

          <div className="flex items-center gap-2 sm:hidden">
          <ThemeToggle />
          <button
            type="button"
            aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-lg border border-white/10 p-2 md:hidden"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          </div>
        </nav>

        {menuOpen && (
          <div className="portfolio-nav-menu border-t border-white/10 bg-[#08090d] px-6 py-4 md:hidden">
            {navigation.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                aria-current={activeSection === item.href.slice(1) ? 'page' : undefined}
                className={`portfolio-nav-link block py-3 text-zinc-300 transition hover:text-white ${activeSection === item.href.slice(1) ? 'is-active' : ''}`}
              >
                {item.label}
              </a>
            ))}
          </div>
        )}
      </header>

      <main>
        <section
          id="home"
          className="hero-section relative flex scroll-mt-20 items-center"
        >
          <div className="relative mx-auto grid w-full max-w-7xl items-center gap-10 px-6 pb-12 pt-24 sm:pt-28 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16 lg:px-10">
            <motion.div
              className="hero-copy"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.72, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="hero-status">
                <span className="hero-status-beacon" aria-hidden="true">
                  <span className="hero-status-ping" />
                  <span className="hero-status-dot" />
                </span>
                <span>Building thoughtful digital experiences</span>
              </div>

              <p className="hero-kicker">
                Hello, I'm
              </p>

              <h1 className="hero-title" aria-label={heroName}>
                <span className="hero-title-typing" aria-hidden="true">
                  {heroNameCharacters.map((character, index, characters) => {
                    const combinesSurnameS =
                      surnameSIndex > 0 && index === surnameSIndex - 1 && character === "'"
                    const isCombinedSurnameS =
                      surnameSIndex > 0 && index === surnameSIndex && characters[index - 1] === "'"
                    if (isCombinedSurnameS) return null

                    const letter = combinesSurnameS
                      ? `${character}${characters[index + 1] ?? ''}`
                      : character

                    return (
                      <span
                        key={`${heroTypingCycle}-${character}-${index}`}
                        className={`hero-title-letter ${index > heroName.indexOf(' ') ? 'hero-title-accent' : ''} ${heroTypingIsExiting ? 'hero-title-letter-exiting' : ''}`}
                        style={{ animationDelay: `${index * heroLetterStagger}ms` }}
                      >
                        {letter === ' ' ? '\u00a0' : letter}
                      </span>
                    )
                  })}
                </span>
              </h1>

              <p className="hero-intro">
                {profile?.short_intro ||
                  'I build modern digital experiences, practical software applications, and explore AI-powered solutions.'}
              </p>

              <div className="hero-actions">
                <a
                  href="#projects"
                  className="hero-primary-action"
                >
                  Explore my work <ArrowUpRight size={17} />
                </a>

                <a
                  href="#contact"
                  className="hero-secondary-action"
                >
                  Get in touch
                </a>
              </div>

              <div className="hero-meta">
                <a
                  href={profile?.github_url || 'https://github.com/aestheticwolf'}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="GitHub"
                  className="hero-social-link"
                >
                  <FaGithub size={19} />
                </a>

                <a
                  href={profile?.linkedin_url || 'https://www.linkedin.com/'}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="LinkedIn"
                  className="hero-social-link"
                >
                  <FaLinkedinIn size={18} />
                </a>

                <span className="hero-location">Based in {profile?.location || 'India'}</span>
              </div>
            </motion.div>

            <motion.div
              className="hero-visual"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.82, delay: prefersReducedMotion ? 0 : 0.16, ease: [0.22, 1, 0.36, 1] }}
            >
              {profile?.profile_image_url && (
                <figure className="hero-portrait">
                  <img
                    src={profile.profile_image_url}
                    alt={profile.full_name}
                    className="hero-portrait-image"
                  />
                </figure>
              )}

              <motion.div
                className="hero-profile-card"
                whileHover={prefersReducedMotion ? undefined : { y: -3 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                {/* Window Titlebar */}
                <div className="hero-profile-heading">
                  <div className="hero-profile-markers" aria-hidden="true">
                    <span className="marker-dot marker-red" />
                    <span className="marker-dot marker-yellow" />
                    <span className="marker-dot marker-green" />
                  </div>

                  {/* Sleek Segmented Console Tabs with Centered Alignment */}
                  <div className="hero-console-tabs-wrap">
                    <div className="hero-console-tabs" role="tablist" aria-label="Console tabs">
                      <button
                        type="button"
                        role="tab"
                        aria-selected={heroConsoleTab === 'developer'}
                        className={`hero-console-tab ${heroConsoleTab === 'developer' ? 'is-active' : ''}`}
                        onClick={() => setHeroConsoleTab('developer')}
                      >
                        <FileCode size={12} className="hero-tab-icon text-violet-400 shrink-0" />
                        <span className="hero-tab-label">
                          <span className="hero-tab-name">developer</span>
                          <span className="hero-tab-ext">.ts</span>
                        </span>
                      </button>
                      <button
                        type="button"
                        role="tab"
                        aria-selected={heroConsoleTab === 'stack'}
                        className={`hero-console-tab ${heroConsoleTab === 'stack' ? 'is-active' : ''}`}
                        onClick={() => setHeroConsoleTab('stack')}
                      >
                        <Layers size={12} className="hero-tab-icon text-cyan-400 shrink-0" />
                        <span className="hero-tab-label">
                          <span className="hero-tab-name">stack</span>
                          <span className="hero-tab-ext">.json</span>
                        </span>
                      </button>
                      <button
                        type="button"
                        role="tab"
                        aria-selected={heroConsoleTab === 'terminal'}
                        className={`hero-console-tab ${heroConsoleTab === 'terminal' ? 'is-active' : ''}`}
                        onClick={() => setHeroConsoleTab('terminal')}
                      >
                        <Terminal size={12} className="hero-tab-icon text-emerald-400 shrink-0" />
                        <span className="hero-tab-label">
                          <span className="hero-tab-name">terminal</span>
                          <span className="hero-tab-ext">.sh</span>
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* 1-Click Copy Code Button */}
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="hero-code-copy-btn"
                    title="Copy code to clipboard"
                    aria-label="Copy code to clipboard"
                  >
                    {codeCopied ? (
                      <>
                        <Check size={11} className="text-emerald-400 shrink-0" />
                        <span className="hero-copy-btn-label">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={11} className="shrink-0" />
                        <span className="hero-copy-btn-label">Copy</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Sub-Header Breadcrumb */}
                <div className="hero-editor-breadcrumb" aria-hidden="true">
                  <div className="flex items-center gap-1.5">
                    <span className="text-zinc-500 font-mono text-[10px]">src</span>
                    <span className="text-zinc-600 text-[10px]">/</span>
                    <span className="text-zinc-500 font-mono text-[10px]">config</span>
                    <span className="text-zinc-600 text-[10px]">/</span>
                    <span className="text-violet-300 font-mono text-[10px] font-semibold">
                      {heroConsoleTab === 'developer' ? 'developer.ts' : heroConsoleTab === 'stack' ? 'stack.json' : 'terminal.sh'}
                    </span>
                  </div>
                  </div>

                {/* Tab 1: developer.ts Code View */}
                {heroConsoleTab === 'developer' && (
                  <div className="hero-code-panel" key="developer">
                    <div className="hero-code-body">
                      {/* Gutter with line numbers */}
                      <div className="hero-code-lines" aria-hidden="true">
                        <span>1</span>
                        <span>2</span>
                        <span className="is-active-line">3</span>
                        <span>4</span>
                        <span>5</span>
                        <span>6</span>
                        <span>7</span>
                        <span>8</span>
                        <span>9</span>
                        <span>10</span>
                        <span>11</span>
                        <span>12</span>
                      </div>

                      {/* Code Content */}
                      <div className="hero-code-content">
                        <p className="hero-code-comment">// A little about me</p>
                        <p className="hero-code-line">
                          <span className="hero-code-keyword">const</span>{' '}
                          <span className="hero-code-ident">developer</span>{' '}
                          <span className="text-zinc-400">=</span>{' '}
                          <span className="hero-code-bracket-gold">{'{'}</span>
                        </p>
                        <div className="hero-code-block-inner">
                          <p className="hero-code-line hero-active-line-bg">
                            <span className="hero-code-key">name</span>
                            <span className="hero-code-colon">:</span>{' '}
                            <span className="hero-code-string">'{profile?.full_name || "Richard D'Souza"}'</span>
                            <span className="text-zinc-500">,</span>
                          </p>
                          <p className="hero-code-line">
                            <span className="hero-code-key">focus</span>
                            <span className="hero-code-colon">:</span>{' '}
                            <span className="hero-code-string">'{profile?.professional_title || 'Software Developer'}'</span>
                            <span className="text-zinc-500">,</span>
                          </p>
                          <p className="hero-code-line">
                            <span className="hero-code-key">interests</span>
                            <span className="hero-code-colon">:</span>{' '}
                            <span className="hero-code-bracket-cyan">[</span>
                          </p>
                          <div className="hero-code-nested-inner">
                            {(profile?.interests?.length ? profile.interests : ['Web Development', 'Cloud & Security', 'AI Applications', 'System Design']).map((interest, index, arr) => (
                              <p className="hero-code-line hero-code-interest" key={`${interest}-${index}`}>
                                '{interest}'{index < arr.length - 1 ? <span className="text-zinc-500">,</span> : ''}
                              </p>
                            ))}
                          </div>
                          <p className="hero-code-line">
                            <span className="hero-code-bracket-cyan">]</span>
                            <span className="text-zinc-500">,</span>
                          </p>
                          <p className="hero-code-line">
                            <span className="hero-code-key">learning</span>
                            <span className="hero-code-colon">:</span>{' '}
                            <span className="hero-code-value">true</span>
                            <span className="text-zinc-500">,</span>
                          </p>
                          <p className="hero-code-line">
                            <span className="hero-code-key">available</span>
                            <span className="hero-code-colon">:</span>{' '}
                            <span className="hero-code-value">true</span>
                          </p>
                        </div>
                        <p className="hero-code-line">
                          <span className="hero-code-bracket-gold">{'}'}</span>
                        </p>
                      </div>
                    </div>

                    {/* Mini IDE Status Bar */}
                    <div className="hero-editor-statusbar" aria-hidden="true">
                      <div className="flex items-center gap-2">
                        <span className="hero-status-pill">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>TS</span>
                        </span>
                        <span className="text-zinc-400 hero-status-utf8">UTF-8</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <span className="text-zinc-400">Ln 3, Col 9</span>
                        <span className="text-zinc-600">•</span>
                        <span className="text-emerald-400 font-medium">0 errors</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 2: stack.json Tech Overview */}
                {heroConsoleTab === 'stack' && (
                  <div className="hero-stack-panel" key="stack">
                    <div className="hero-stack-matrix">
                      <div className="hero-stack-group">
                        <div className="hero-stack-group-title">
                          <span className="hero-stack-dot bg-cyan-400" />
                          <span>Frontend &amp; UI</span>
                        </div>
                        <div className="hero-stack-chips">
                          <span className="hero-stack-chip"><SiReact className="text-[#61dafb]" /> React</span>
                          <span className="hero-stack-chip"><SiTypescript className="text-[#3178c6]" /> TypeScript</span>
                          <span className="hero-stack-chip"><SiTailwindcss className="text-[#38bdf8]" /> Tailwind CSS</span>
                          <span className="hero-stack-chip"><SiJavascript className="text-[#f7df1e]" /> JavaScript</span>
                        </div>
                      </div>

                      <div className="hero-stack-group">
                        <div className="hero-stack-group-title">
                          <span className="hero-stack-dot bg-emerald-400" />
                          <span>Backend &amp; Data</span>
                        </div>
                        <div className="hero-stack-chips">
                          <span className="hero-stack-chip"><SiNodedotjs className="text-[#5fa04e]" /> Node.js</span>
                          <span className="hero-stack-chip"><SiExpress className="text-zinc-300" /> Express</span>
                          <span className="hero-stack-chip"><SiPostgresql className="text-[#4169e1]" /> PostgreSQL</span>
                          <span className="hero-stack-chip"><SiMongodb className="text-[#47a248]" /> MongoDB</span>
                          <span className="hero-stack-chip"><SiSupabase className="text-[#3ecf8e]" /> Supabase</span>
                        </div>
                      </div>

                      <div className="hero-stack-group">
                        <div className="hero-stack-group-title">
                          <span className="hero-stack-dot bg-violet-400" />
                          <span>DevOps &amp; Cloud</span>
                        </div>
                        <div className="hero-stack-chips">
                          <span className="hero-stack-chip"><SiDocker className="text-[#2496ed]" /> Docker</span>
                          <span className="hero-stack-chip"><SiGit className="text-[#f05032]" /> Git</span>
                          <span className="hero-stack-chip"><Sparkles className="text-violet-400" /> AI APIs</span>
                        </div>
                      </div>
                    </div>

                    <div className="hero-editor-statusbar" aria-hidden="true">
                      <div className="flex items-center gap-2">
                        <span className="hero-status-pill text-cyan-400">JSON</span>
                        <span className="text-zinc-400 hero-status-utf8">UTF-8</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-cyan-400 font-medium">12 Technologies</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 3: terminal.sh Live Output */}
                {heroConsoleTab === 'terminal' && (
                  <div className="hero-terminal-panel" key="terminal">
                    <div className="hero-terminal-console">
                      <div className="hero-terminal-prompt">
                        <span className="hero-terminal-user">richard@macbook</span>
                        <span className="hero-terminal-sep">:</span>
                        <span className="hero-terminal-path">~</span>
                        <span className="hero-terminal-dollar">$</span>
                        <span className="hero-terminal-cmd">richard --status</span>
                      </div>

                      <div className="hero-terminal-output">
                        <p><span className="text-emerald-400 font-bold">✔</span> <span className="text-zinc-400">role</span>: <span className="text-violet-300 font-medium">{profile?.professional_title || 'Software Developer'}</span></p>
                        <p><span className="text-emerald-400 font-bold">✔</span> <span className="text-zinc-400">education</span>: <span className="text-zinc-200">MSc in Information Technology</span></p>
                        <p><span className="text-emerald-400 font-bold">✔</span> <span className="text-zinc-400">location</span>: <span className="text-zinc-200">{profile?.location || 'Goa, India'} (UTC +5:30)</span></p>
                        <p><span className="text-emerald-400 font-bold">✔</span> <span className="text-zinc-400">focus</span>: <span className="text-cyan-300">Full-Stack Web, Cloud &amp; AI Systems</span></p>
                        <p><span className="text-emerald-400 font-bold">✔</span> <span className="text-zinc-400">availability</span>: <span className="text-emerald-300 font-semibold">Open to Roles &amp; Projects</span></p>
                      </div>

                      <div className="hero-terminal-prompt hero-terminal-active-line">
                        <span className="hero-terminal-user">richard@macbook</span>
                        <span className="hero-terminal-sep">:</span>
                        <span className="hero-terminal-path">~</span>
                        <span className="hero-terminal-dollar">$</span>
                        <span className="hero-terminal-cursor">█</span>
                      </div>
                    </div>

                    <div className="hero-editor-statusbar" aria-hidden="true">
                      <div className="flex items-center gap-2">
                        <span className="hero-status-pill text-emerald-400">ZSH</span>
                        <span className="text-zinc-400">tty1</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400 font-medium">Exit code: 0</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Card Footer */}
                <div className="hero-profile-footer">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="hero-live-beacon" aria-hidden="true">
                        <span className="hero-live-ping" />
                        <span className="hero-live-dot" />
                      </span>
                      <p className="text-sm font-semibold tracking-wide">
                        Always building
                      </p>
                    </div>
                    <p className="mt-0.5 text-xs text-zinc-400 flex items-center gap-2 hero-profile-footer-sub">
                      <span>Learning. Creating. Improving.</span>
                      <span className="inline-block w-1 h-1 rounded-full bg-zinc-500 hero-profile-footer-dot" />
                      <span className="inline-flex items-center gap-1 font-mono text-[11px] text-violet-400">
                        git:(main)
                      </span>
                    </p>
                  </div>

                  {heroConsoleTab === 'developer' && <Code2 className="text-violet-400 transition-colors" size={20} />}
                  {heroConsoleTab === 'stack' && <Layers className="text-cyan-400 transition-colors" size={20} />}
                  {heroConsoleTab === 'terminal' && <Terminal className="text-emerald-400 transition-colors" size={20} />}
                </div>
              </motion.div>
            </motion.div>

            <a
              href="#about"
              aria-label="Scroll down to About section"
              className="hero-scroll-cue"
            >
              <span className="hero-scroll-arrows" aria-hidden="true">
                <ArrowDown size={15} />
              </span>
            </a>
          </div>
        </section>


<section
  id="about"
  className="about-section scroll-mt-24 border-t border-white/6 py-20 sm:py-28"
>
  <motion.div
    className="mx-auto max-w-7xl px-6 lg:px-10"
    variants={sectionReveal}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.15 }}
  >
    <div className="section-heading about-heading">
      <p className="section-label">01 / ABOUT</p>
      <h2>Thoughtful software, built with purpose.</h2>
      <p className="section-summary">
        I value practical solutions, clear experiences, and the steady craft behind reliable digital products.
      </p>
    </div>

    <motion.div
      className="about-layout"
      variants={sectionStagger}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
    >
      {profileError && (
        <p role="alert" className="text-sm text-red-400">
          {profileError}
        </p>
      )}

      {profile ? (
        <motion.div className="about-story" variants={sectionReveal}>
          {/* Card Top Header & Status */}
          <div className="about-story-header">
            <div className="about-story-badge">
              <Terminal size={14} className="text-violet-400" />
              <span>Engineer Journey</span>
            </div>
            <div className="about-live-status">
              <span className="about-status-pulse" />
              <span>Available for opportunities</span>
            </div>
          </div>

          {/* Lead Quote */}
          {profile.short_intro && (
            <div className="about-lead-box">
              <p className="about-lead-text">{profile.short_intro}</p>
            </div>
          )}

          {/* Quick Highlight Pills from Profile & Interests */}
          <div className="about-story-highlights">
            <div className="about-highlight-pill">
              <GraduationCap size={15} className="text-violet-400 shrink-0" />
              <span>{profile.interests?.[0] || 'MSc in IT'}</span>
            </div>
            <div className="about-highlight-pill">
              <Code2 size={15} className="text-cyan-400 shrink-0" />
              <span>{profile.interests?.[1] || 'Full-Stack & Cloud'}</span>
            </div>
            {profile.interests?.[2] ? (
              <div className="about-highlight-pill">
                <Sparkles size={15} className="text-amber-400 shrink-0" />
                <span>{profile.interests[2]}</span>
              </div>
            ) : (
              <div className="about-highlight-pill">
                <Sparkles size={15} className="text-amber-400 shrink-0" />
                <span>AI Integration</span>
              </div>
            )}
          </div>

          {/* Expandable Detailed Narrative */}
          <AnimatePresence initial={false}>
            {aboutExpanded && (
              <motion.div
                key="about-expanded-narrative"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                className="about-expanded-body overflow-hidden"
              >
                <div className="about-timeline">
                  {profile.biography && (
                    <div className="about-timeline-stream">
                      {(() => {
                        const paragraphs = profile.biography
                          .split(/\r?\n/)
                          .map((p) => p.trim())
                          .filter((p) => p.length > 0)

                        const usedTags = new Set<string>()

                        return paragraphs.map((rawParagraph, index) => {
                          let title = ''
                          let content = rawParagraph

                          // Support custom titles from admin: "[Title]: Content" or "Title: Content" or "### Title"
                          const bracketMatch = rawParagraph.match(/^\[(.*?)\]\s*:?\s*(.*)$/s)
                          const colonMatch = !bracketMatch && rawParagraph.match(/^([A-Z][A-Za-z0-9\s&/-]{2,30}):\s+(.+)$/s)
                          const hashMatch = !bracketMatch && !colonMatch && rawParagraph.match(/^#{1,3}\s+(.*?)\n+(.*)$/s)

                          if (bracketMatch) {
                            title = bracketMatch[1].trim()
                            content = bracketMatch[2].trim()
                          } else if (colonMatch) {
                            title = colonMatch[1].trim()
                            content = colonMatch[2].trim()
                          } else if (hashMatch) {
                            title = hashMatch[1].trim()
                            content = hashMatch[2].trim()
                          }

                          const lower = content.toLowerCase()
                          let tag = title
                          let StepIcon = Terminal
                          let colorClass = 'text-violet-400'

                          if (!tag) {
                            // Priority 1: Hands-on Projects & Engineering (checked BEFORE education so "academic projects" is properly recognized as Projects!)
                            if (/projects|react|typescript|node|full-stack|mongodb|postgresql|crm|skillpath|sentinel|built|building applications/i.test(lower)) {
                              tag = 'Hands-on Projects & Stack'
                              StepIcon = Code2
                              colorClass = 'text-emerald-400'
                            }
                            // Priority 2: Philosophy, Mindset & Continuous Improvement
                            else if (/learning by building|solving problems|continuously improving|philosophy|mindset|curiosity|approach/i.test(lower)) {
                              tag = 'Philosophy & Approach'
                              StepIcon = Sparkles
                              colorClass = 'text-amber-400'
                            }
                            // Priority 3: Education & Academic Foundations (requires genuine institution/degree keywords)
                            else if (/msc|b\.?sc|btech|mtech|college|university|degree|parvatibai|chowgule|graduat/i.test(lower)) {
                              tag = 'Education & Foundations'
                              StepIcon = GraduationCap
                              colorClass = 'text-violet-400'
                            }
                            // Priority 4: Technical Domains & Craft
                            else if (/interests|frontend|backend|database|cloud|ai\b|intelligence|interface|system design|security/i.test(lower)) {
                              tag = 'Technical Domain & Craft'
                              StepIcon = Layers
                              colorClass = 'text-cyan-400'
                            }
                            // Fallback
                            else {
                              tag = `Milestone 0${index + 1}`
                              StepIcon = Terminal
                              colorClass = 'text-violet-400'
                            }

                            // Prevent duplicate consecutive tags across cards
                            if (usedTags.has(tag)) {
                              tag = `${tag} (${index + 1})`
                            }
                          } else {
                            if (/edu|degree|college|school/i.test(tag)) {
                              StepIcon = GraduationCap
                              colorClass = 'text-violet-400'
                            } else if (/project|code|stack|build|dev/i.test(tag)) {
                              StepIcon = Code2
                              colorClass = 'text-emerald-400'
                            } else if (/domain|tech|skill|cloud/i.test(tag)) {
                              StepIcon = Layers
                              colorClass = 'text-cyan-400'
                            } else if (/phil|goal|grow|vision|mind/i.test(tag)) {
                              StepIcon = Sparkles
                              colorClass = 'text-amber-400'
                            }
                          }

                          usedTags.add(tag)

                          return (
                            <div key={index} className="about-timeline-item">
                              <span className="about-timeline-dot" aria-hidden="true" />
                              <div className="about-timeline-card">
                                <div className="about-timeline-card-header">
                                  <span className={`about-timeline-tag ${colorClass}`}>
                                    <StepIcon size={13} className="shrink-0" />
                                    <span>{tag}</span>
                                  </span>
                                </div>
                                <p className="about-timeline-text">{content}</p>
                              </div>
                            </div>
                          )
                        })
                      })()}
                    </div>
                  )}

                  {profile.secondary_biography && (
                    <div className="about-focus-card">
                      <div className="about-focus-header">
                        <div className="flex items-center gap-2">
                          <Compass size={16} className="text-violet-400 shrink-0" />
                          <span className="about-focus-title">Focus & Future Vision</span>
                        </div>
                        <span className="about-focus-badge">Aspirations</span>
                      </div>
                      <div className="about-focus-body">
                        {profile.secondary_biography
                          .split(/\r?\n/)
                          .map((p) => p.trim())
                          .filter((p) => p.length > 0)
                          .map((para, pIdx) => (
                            <p key={pIdx} className="about-focus-text">
                              {para}
                            </p>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Row */}
          <div className="about-actions-row">
            {(profile.biography || profile.secondary_biography) && (
              <button
                type="button"
                className="about-toggle-button"
                onClick={() => setAboutExpanded((expanded) => !expanded)}
                aria-expanded={aboutExpanded}
              >
                <span>{aboutExpanded ? 'Show less' : 'Read full journey'}</span>
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-300 ${aboutExpanded ? 'rotate-180' : ''}`}
                  aria-hidden="true"
                />
              </button>
            )}

            <Link to="/request-resume" className="about-cta-resume">
              <span>Request Resume</span>
              <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </motion.div>
      ) : (
        !profileError && (
          <p className="text-lg leading-8 text-zinc-500">
            Profile information will be available soon.
          </p>
        )
      )}

      {/* Right Column Bento Cards */}
      <motion.aside className="about-facts" variants={sectionStagger} aria-label="Professional profile details">
        {/* Role & Expertise */}
        <motion.div className="about-fact-card group" variants={sectionReveal}>
          <div className="about-card-icon-wrap">
            <Code2 size={22} aria-hidden="true" />
          </div>
          <div className="about-card-content">
            <span className="about-card-badge">Current Role</span>
            <strong>{profile?.professional_title || 'Software Developer'}</strong>
            <p className="about-card-sub">Modern Web, Cloud & Scalable Systems</p>
          </div>
        </motion.div>

        {/* Academic Background */}
        <motion.div className="about-fact-card group" variants={sectionReveal}>
          <div className="about-card-icon-wrap">
            <GraduationCap size={22} aria-hidden="true" />
          </div>
          <div className="about-card-content">
            <span className="about-card-badge">Education & Foundations</span>
            <strong>MSc in Information Technology</strong>
            <p className="about-card-sub">Parvatibai Chowgule College, Goa</p>
          </div>
        </motion.div>

        {/* Location & Timezone */}
        {profile?.location && (
          <motion.div className="about-fact-card group" variants={sectionReveal}>
            <div className="about-card-icon-wrap">
              <MapPin size={22} aria-hidden="true" />
            </div>
            <div className="about-card-content">
              <span className="about-card-badge">Location</span>
              <strong>{profile.location}</strong>
              <p className="about-card-sub">IST (UTC +5:30) • Open to Remote & Hybrid</p>
            </div>
          </motion.div>
        )}

        {/* Areas of Interest with Interactive Chips */}
        {profile?.interests && profile.interests.length > 0 && (
          <motion.div className="about-interests-card group" variants={sectionReveal}>
            <div className="about-interests-header">
              <div className="about-card-icon-wrap">
                <Sparkles size={22} aria-hidden="true" />
              </div>
              <div className="about-card-content">
                <span className="about-card-badge">Domains & Passion</span>
                <strong>Areas of Interest</strong>
              </div>
            </div>
            <div className="about-interest-tags">
              {profile.interests.map((interest) => (
                <span key={interest} className="about-interest-chip">
                  {interest}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Quick Connect Callout */}
        <motion.div className="about-quick-cta" variants={sectionReveal}>
          <div className="about-quick-cta-glow" />
          <div>
            <p className="about-quick-cta-title">Interested in collaborating?</p>
            <p className="about-quick-cta-desc">Let's discuss projects, opportunities, or engineering ideas.</p>
          </div>
          <a href="#contact" className="about-quick-cta-btn">
            Get in touch <ArrowUpRight size={15} />
          </a>
        </motion.div>
      </motion.aside>
    </motion.div>
  </motion.div>
</section>



<section
  id="skills"
  className="skills-section scroll-mt-24 border-t border-white/6 py-20 sm:py-24"
>
  <div className="mx-auto max-w-7xl px-6 lg:px-10">
    <motion.div
      className="section-heading skills-heading"
      variants={sectionReveal}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
    >
      <p className="section-label">02 / SKILLS</p>
      <h2>A practical, growing technical toolkit.</h2>
      <p className="section-summary">
        Technologies and tools I use to build applications, solve problems,
        and continuously improve as a developer.
      </p>
    </motion.div>

    <motion.div
      className="skills-grid"
      variants={sectionStagger}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      {displayedSkills.map((skill, skillIndex) => {
        const Icon = skill.icon

        return (
          <motion.div
            key={skill.name}
            variants={sectionReveal}
            className="skill-card group"
            whileHover={prefersReducedMotion ? undefined : { y: -4 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <div className="skill-card-glow" />
            <div className="skill-card-header">
              <div className="skill-icon">
                <Icon size={20} aria-hidden="true" />
              </div>
              <div className="flex items-center gap-2">
                <span className="skill-card-count">{skill.technologies.length} tools</span>
                <span className="skill-card-index">{String(skillIndex + 1).padStart(2, '0')}</span>
              </div>
            </div>

            <h3>{skill.name}</h3>

            <div className="skill-tags">
              {skill.technologies.map((technology) => {
                const TechnologyIcon = technology.icon
                const tone = technologyToneMap[technology.name] ?? normalizeTechnologyName(technology.name)

                return (
                  <span className={`technology-tag technology-${tone}`} key={technology.name}>
                    <TechnologyIcon size={14} aria-hidden="true" />
                    <span>{technology.name}</span>
                  </span>
                )
              })}
            </div>
          </motion.div>
        )
      })}
    </motion.div>
  </div>
</section>


        <section
          id="projects"
          className="projects-section scroll-mt-24 border-t border-white/6 py-20 sm:py-24"
        >
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <motion.div
              className="projects-heading-row"
              variants={sectionReveal}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              <div className="section-heading">
                <p className="section-label">03 / SELECTED WORK</p>
                <h2>Selected projects, thoughtfully built.</h2>
                <p className="section-summary">
                  A selection of software projects spanning product experiences, practical systems, and emerging technology.
                </p>
              </div>
              <span className="projects-count">
                {projectsLoading ? 'Loading projects...' : `${projects.length} projects`}
              </span>
            </motion.div>

            <motion.div
          className={`projects-grid ${projects.length === 1 ? 'projects-grid-single' : ''}`}
          variants={sectionStagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
            >
              {!projectsLoading && !projectsError && projects.map((project) => (
                <motion.article
                  key={project.id}
                  variants={sectionReveal}
                  className="project-card"
                  whileHover={prefersReducedMotion ? undefined : { y: -6 }}
                  transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="project-card-media">
                    {project.imageUrl && !brokenProjectImages.includes(project.imageUrl) ? (
                      <img
                        src={project.imageUrl}
                        alt={`${project.name} project preview`}
                        className="project-card-image"
                        loading="lazy"
                        onError={() => markProjectImageAsBroken(project.imageUrl)}
                      />
                    ) : (
                      <div className={`project-card-fallback bg-linear-to-br ${project.color}`}>
                        <Code2 size={30} aria-hidden="true" />
                        <span>Project preview</span>
                      </div>
                    )}
                    <span className="project-card-number">{project.number}</span>
                    {project.category && <span className="project-card-category">{project.category}</span>}
                  </div>

                  <div className="project-card-body">
                    <h3>{project.name}</h3>
                    {project.summary && <p>{project.summary}</p>}
                    <div className="project-stack" aria-label={`${project.name} technology stack`}>
                      {project.stack.map((technology) => <span key={technology}>{technology}</span>)}
                    </div>
                    <div className="project-card-actions">
                      <Link to={`/projects/${project.slug}`} className="project-details-link">
                        View details <ArrowUpRight size={15} />
                      </Link>
                      <div className="project-card-quick-actions">
                        {project.demoVideo && (
                          <Link to={`/projects/${project.slug}#demo`} className="project-quick-action">
                            <PlayCircle size={15} /> Watch demo
                          </Link>
                        )}
                        {project.github && (
                          <a href={project.github} target="_blank" rel="noreferrer" className="project-quick-action" aria-label={`Open ${project.name} repository`}>
                            <FaGithub size={15} /> Source
                          </a>
                        )}
                        {project.liveUrl && (
                          <a href={project.liveUrl} target="_blank" rel="noreferrer" className="project-quick-action" aria-label={`Open ${project.name} live application`}>
                            <ExternalLink size={15} /> Live
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}

            </motion.div>

            {projectsLoading && (
              <p className="mt-8 text-sm text-zinc-400">
                Loading published projects...
              </p>
            )}

            {projectsError && (
              <p role="alert" className="mt-8 text-sm text-red-400">
                {projectsError}
              </p>
            )}

            {!projectsLoading &&
              !projectsError &&
              projects.length === 0 && (
                <p className="mt-8 text-sm text-zinc-400">
                  No published projects yet. Check back soon.
                </p>
              )}

          </div>
        </section>

        <section
          id="contact"
          className="contact-section scroll-mt-24 border-t border-white/6 py-20 sm:py-28"
        >
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <motion.div
              className="section-heading contact-heading"
              variants={sectionReveal}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
            >
              <p className="section-label">04 / CONTACT</p>
              <h2>Let&apos;s build something with intention.</h2>
              <p className="section-summary">
                I&apos;m open to meaningful conversations with recruiters, engineering teams, and collaborators who value thoughtful software.
              </p>
            </motion.div>

            <motion.div
              className="contact-grid"
              variants={sectionStagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
            >
              {/* Left Column: Interactive Contact Form Card */}
              <motion.div className="contact-form-card" variants={sectionReveal}>
                <div className="contact-form-header">
                  <div className="contact-badge">
                    <Send size={14} className="text-violet-400" />
                    <span>Send a Message</span>
                  </div>
                  <span className="contact-response-badge">Direct to Inbox</span>
                </div>

                <form className="contact-form" onSubmit={handleContactSubmit}>
                  <div className="contact-form-fields">
                    <div className="contact-field-group">
                      <label className="contact-field">
                        <span>Your Name</span>
                        <input
                          name="name"
                          type="text"
                          autoComplete="name"
                          placeholder="e.g. Alex Morgan"
                          maxLength={120}
                          required
                        />
                      </label>

                      <label className="contact-field">
                        <span>Email Address</span>
                        <input
                          name="email"
                          type="email"
                          autoComplete="email"
                          placeholder="alex@company.com"
                          maxLength={254}
                          required
                        />
                      </label>
                    </div>

                    <label className="contact-field">
                      <span>Message</span>
                      <textarea
                        name="message"
                        rows={5}
                        placeholder="Tell me about your project, team, or opportunity..."
                        maxLength={5000}
                        required
                      />
                    </label>
                  </div>

                  <input className="contact-honeypot" name="botcheck" type="checkbox" tabIndex={-1} aria-hidden="true" />

                  <div className="contact-form-footer">
                    <button
                      className="contact-submit-btn"
                      type="submit"
                      disabled={contactStatus === 'sending'}
                    >
                      <Send size={16} className={contactStatus === 'sending' ? 'animate-pulse' : ''} />
                      <span>{contactStatus === 'sending' ? 'Sending Message…' : 'Send Message'}</span>
                      <ArrowUpRight size={15} />
                    </button>

                    <div className="contact-direct-link">
                      <span>Or email:</span>
                      <a href="mailto:rich.dsz1997@gmail.com">rich.dsz1997@gmail.com</a>
                    </div>
                  </div>

                  {contactStatusMessage && (
                    <motion.p
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`contact-form-status ${contactStatus === 'error' ? 'is-error' : 'is-success'}`}
                      role={contactStatus === 'error' ? 'alert' : 'status'}
                      aria-live="polite"
                    >
                      {contactStatusMessage}
                    </motion.p>
                  )}
                </form>
              </motion.div>

              {/* Right Column: Bento Contact & Info Cards */}
              <motion.aside className="contact-aside" variants={sectionStagger} aria-label="Other ways to connect">
                {/* Direct Email Card with 1-Click Copy */}
                <motion.div className="contact-info-card group" variants={sectionReveal}>
                  <div className="contact-card-icon-wrap">
                    <Mail size={22} aria-hidden="true" />
                  </div>
                  <div className="contact-card-content">
                    <span className="contact-card-badge">Direct Contact</span>
                    <div className="contact-email-row">
                      <strong className="truncate">rich.dsz1997@gmail.com</strong>
                      <button
                        type="button"
                        onClick={handleCopyEmail}
                        className="contact-copy-btn"
                        title="Copy email address"
                        aria-label="Copy email address"
                      >
                        {emailCopied ? (
                          <>
                            <Check size={13} className="text-emerald-400" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy size={13} />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                    <p className="contact-card-sub">⚡ Fast Response • Typically within 24 hours</p>
                  </div>
                </motion.div>

                {/* Location & Timezone Card */}
                <motion.div className="contact-info-card group" variants={sectionReveal}>
                  <div className="contact-card-icon-wrap">
                    <MapPin size={22} aria-hidden="true" />
                  </div>
                  <div className="contact-card-content">
                    <span className="contact-card-badge">Location & Timezone</span>
                    <strong>{profile?.location || 'Goa, India'}</strong>
                    <p className="contact-card-sub">IST (UTC +5:30) • Open to Global Remote & Hybrid</p>
                  </div>
                </motion.div>

                {/* Social Profiles Bento Grid */}
                <div className="contact-social-grid">
                  <motion.a
                    href={profile?.github_url || 'https://github.com/aestheticwolf'}
                    target="_blank"
                    rel="noreferrer"
                    className="contact-social-card group"
                    variants={sectionReveal}
                  >
                    <div className="contact-social-icon">
                      <FaGithub size={20} />
                    </div>
                    <div className="contact-social-text">
                      <strong>GitHub</strong>
                      <span>Code & Projects</span>
                    </div>
                    <ArrowUpRight size={16} className="contact-social-arrow" />
                  </motion.a>

                  <motion.a
                    href={profile?.linkedin_url || 'https://www.linkedin.com/'}
                    target="_blank"
                    rel="noreferrer"
                    className="contact-social-card group"
                    variants={sectionReveal}
                  >
                    <div className="contact-social-icon">
                      <FaLinkedinIn size={19} />
                    </div>
                    <div className="contact-social-text">
                      <strong>LinkedIn</strong>
                      <span>Professional Network</span>
                    </div>
                    <ArrowUpRight size={16} className="contact-social-arrow" />
                  </motion.a>
                </div>

                {/* Collaboration Note */}
                <motion.div className="contact-collab-card" variants={sectionReveal}>
                  <div className="contact-collab-glow" />
                  <div className="contact-collab-content">
                    <div className="flex items-center gap-2">
                      <Sparkles size={16} className="text-violet-400" />
                      <span className="contact-collab-label">Ready to collaborate?</span>
                    </div>
                    <p className="contact-collab-desc">
                      Available for full-time software engineering roles, high-impact contract projects, and architecture discussions.
                    </p>
                  </div>
                </motion.div>
              </motion.aside>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="portfolio-footer">
        <div className="footer-glow-bar" aria-hidden="true" />
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1.2fr_1fr_auto] md:items-start">
          <div className="footer-brand">
            <a href="#home" className="footer-brand-title">
              <span>{profile?.full_name || "Richard D'Souza"}</span>
              <span className="footer-brand-dot" aria-hidden="true" />
            </a>
            <p className="footer-brand-tagline">
              {profile?.professional_title || 'Software Developer'} • Building thoughtful digital experiences with clean code & modern architecture.
            </p>
            <div className="footer-status-badge">
              <span className="footer-status-dot" aria-hidden="true" />
              <span>Available for engineering opportunities</span>
            </div>
          </div>
          <nav className="footer-nav" aria-label="Footer navigation">
            {navigation.map((item) => (
              <a key={item.label} href={item.href} className="footer-nav-link">
                {item.label}
              </a>
            ))}
            <Link to="/request-resume" className="footer-nav-link footer-nav-resume">
              <span>Request Resume</span>
              <ArrowUpRight size={13} aria-hidden="true" />
            </Link>
          </nav>
          <div className="footer-socials">
            <a
              href={profile?.github_url || 'https://github.com/aestheticwolf'}
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub Profile"
              className="footer-social-btn"
              title="GitHub"
            >
              <FaGithub size={17} aria-hidden="true" />
              <span className="footer-social-label">GitHub</span>
            </a>
            <a
              href={profile?.linkedin_url || 'https://www.linkedin.com/'}
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn Profile"
              className="footer-social-btn"
              title="LinkedIn"
            >
              <FaLinkedinIn size={16} aria-hidden="true" />
              <span className="footer-social-label">LinkedIn</span>
            </a>
          </div>
        </div>
        <div className="footer-bottom mx-auto mt-10 max-w-7xl">
          <p className="footer-copyright">
            © {new Date().getFullYear()} {profile?.full_name || "Richard D'Souza"}. Handcrafted with modern web tech.
          </p>
          <a
            href="#home"
            className="footer-back-to-top"
            onClick={(e) => {
              e.preventDefault()
              window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' })
            }}
          >
            <span>Back to top</span>
            <ArrowUp size={13} className="footer-back-icon" aria-hidden="true" />
          </a>
        </div>
      </footer>
    </div>
  )
}

function AnimatedRoutes() {
  const location = useLocation()
  const prefersReducedMotion = useReducedMotion() ?? false

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [location.pathname])

  return (
    <>
      <ScrollProgress />
      <GlobalBackToTop />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={location.pathname}
          initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={prefersReducedMotion ? undefined : { opacity: 0, y: -6 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/request-resume" element={<RequestResume />} />
            <Route path="/resume-access" element={<ResumeAccess />} />
            <Route path="/projects/:slug" element={<ProjectDetails />} />
            <Route
              path="*"
              element={
                <main className="flex min-h-screen items-center justify-center bg-[#08090d] px-6 text-white">
                  <div className="text-center">
                    <h1 className="text-4xl font-semibold">Page not found</h1>
                    <Link
                      to="/"
                      className="mt-6 inline-flex rounded-full bg-white px-5 py-3 text-sm font-semibold text-black"
                    >
                      Return home
                    </Link>
                  </div>
                </main>
              }
            />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  )
}
