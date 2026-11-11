import PortfolioPreloader from './components/PortfolioPreloader'

import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring } from 'motion/react'
import {
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  ExternalLink,
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
  ChevronLeft,
  ChevronRight,
  Send,
  Layers,
  Compass,
  BookOpen,
  Clock,
  Cpu,
  Smartphone,
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
import CosmicHorizonDivider from './components/CosmicHorizonDivider'
import SpatialHeroConsole from './components/SpatialHeroConsole'
import CinematicSection from './components/CinematicSection'
import { smoothScrollToTop } from './lib/smoothScroll'
import {
  getPublishedProjects,
  type PortfolioProject,
} from './lib/projects'
import {
  getPublishedProfile,
  type PublicProfile,
} from './lib/profile'
import {
  validateContactSubmission,
  recordContactSubmission,
} from './lib/contactSecurity'
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
    categoryTag: 'UI / UX & Web',
    description: 'Modern reactive interfaces, responsive web apps, and clean component systems.',
    icon: Code2,
    accent: 'cyan',
    technologies: [
      { name: 'React', icon: SiReact, tone: 'react' },
      { name: 'TypeScript', icon: SiTypescript, tone: 'typescript' },
      { name: 'HTML', icon: SiHtml5, tone: 'html' },
      { name: 'CSS', icon: SiCss, tone: 'css' },
    ],
  },
  {
    name: 'Backend Development',
    categoryTag: 'Server & APIs',
    description: 'Server-side runtimes, asynchronous endpoints, and robust database querying.',
    icon: Terminal,
    accent: 'emerald',
    technologies: [
      { name: 'Node.js', icon: SiNodedotjs, tone: 'node' },
      { name: 'Express', icon: SiExpress, tone: 'express' },
      { name: 'REST APIs', icon: Code2, tone: 'api' },
    ],
  },
  {
    name: 'Cloud & Deployment',
    categoryTag: 'DevOps & BaaS',
    description: 'Serverless architecture, relational & NoSQL databases, and automated edge deploys.',
    icon: Cloud,
    accent: 'violet',
    technologies: [
      { name: 'Firebase', icon: SiFirebase, tone: 'firebase' },
      { name: 'Supabase', icon: SiSupabase, tone: 'supabase' },
      { name: 'Vercel', icon: SiVercel, tone: 'vercel' },
    ],
  },
  {
    name: 'Security Fundamentals',
    categoryTag: 'App Protection',
    description: 'Role-based access control, secure session auth, and network defense policies.',
    icon: ShieldCheck,
    accent: 'rose',
    technologies: [
      { name: 'Authentication', icon: KeyRound, tone: 'auth' },
      { name: 'Authorization', icon: ShieldCheck, tone: 'authz' },
      { name: 'Firewalls', icon: ShieldCheck, tone: 'firewall' },
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
  Authentication: 'auth',
  Authorization: 'authz',
  Firewalls: 'firewall',
}

const technologyBrandColorMap: Record<string, string> = {
  React: '#61dafb',
  TypeScript: '#3178c6',
  JavaScript: '#f7df1e',
  'Next.js': '#ffffff',
  'Tailwind CSS': '#38bdf8',
  'Vue.js': '#42b883',
  HTML: '#e34f26',
  CSS: '#1572b6',
  Sass: '#cc6699',
  Redux: '#764abc',
  Vite: '#646cff',
  Bootstrap: '#7952b3',
  'Node.js': '#5fa04e',
  Express: '#d1d5db',
  NestJS: '#ea2845',
  Python: '#3776ab',
  Django: '#2ba977',
  FastAPI: '#009688',
  Java: '#ea2d2e',
  'Spring Boot': '#6db33f',
  'C++': '#00599c',
  'C#': '#239120',
  '.NET': '#512bd4',
  Go: '#00add8',
  Rust: '#dea584',
  GraphQL: '#e10098',
  'REST APIs': '#aaa1f2',
  PostgreSQL: '#4169e1',
  MongoDB: '#47a248',
  MySQL: '#4479a1',
  Redis: '#dc382d',
  Supabase: '#3ecf8e',
  Firebase: '#ffca28',
  Docker: '#2496ed',
  AWS: '#ff9900',
  Vercel: '#ffffff',
  Git: '#f05032',
  GitHub: '#e2e8f0',
  'AI APIs': '#c084fc',
}

const getInterestMeta = (interest: string) => {
  const lower = interest.toLowerCase()
  if (lower.includes('full stack') || lower.includes('frontend') || lower.includes('web')) {
    return {
      icon: Code2,
      color: 'text-cyan-400',
      badgeClass: 'about-tag-cyan',
    }
  }
  if (lower.includes('cloud') || lower.includes('backend') || lower.includes('api') || lower.includes('server')) {
    return {
      icon: Cloud,
      color: 'text-emerald-400',
      badgeClass: 'about-tag-emerald',
    }
  }
  if (lower.includes('ai') || lower.includes('intelligence') || lower.includes('machine') || lower.includes('deep')) {
    return {
      icon: Sparkles,
      color: 'text-amber-400',
      badgeClass: 'about-tag-amber',
    }
  }
  if (lower.includes('system') || lower.includes('architecture') || lower.includes('design') || lower.includes('scalable')) {
    return {
      icon: Layers,
      color: 'text-violet-400',
      badgeClass: 'about-tag-violet',
    }
  }
  if (lower.includes('mobile') || lower.includes('app') || lower.includes('native') || lower.includes('ios') || lower.includes('android')) {
    return {
      icon: Smartphone,
      color: 'text-rose-400',
      badgeClass: 'about-tag-rose',
    }
  }
  return {
    icon: Sparkles,
    color: 'text-indigo-400',
    badgeClass: 'about-tag-default',
  }
}

const educationJourney = [
  {
    id: 'msc-it',
    levelTag: 'Postgraduate',
    degree: 'M.Sc. in Information Technology',
    institution: 'Parvatibai Chowgule College of Arts and Science (Autonomous)',
    location: 'Goa, India',
    period: 'June 2024 – June 2026',
    score: 'CGPA: 7.70 / 10',
    theme: 'violet',
    accentColor: '#a78bfa',
    icon: GraduationCap,
    highlights: ['Cloud Systems', 'Full-Stack Architecture', 'Machine Learning', 'Autonomous Tech'],
  },
  {
    id: 'bca',
    levelTag: 'Undergraduate',
    degree: 'Bachelor of Computer Applications (B.C.A)',
    institution: 'Fr. Agnel College of Arts and Commerce',
    location: 'Goa, India',
    period: 'June 2018 – August 2021',
    score: 'Graduated',
    theme: 'cyan',
    accentColor: '#22d3ee',
    icon: BookOpen,
    highlights: ['Software Engineering', 'Data Structures', 'Database Systems', 'Web Tech'],
  },
  {
    id: 'hssc',
    levelTag: 'Higher Secondary',
    degree: 'H.S.S.C – Vocational Stream (Computer Technology)',
    institution: 'Fr. Agnel Higher Secondary School',
    location: 'Goa, India',
    period: 'June 2016 – March 2018',
    score: 'Completed (10+2)',
    theme: 'emerald',
    accentColor: '#34d399',
    icon: Cpu,
    highlights: ['Computer Technology', 'Programming Foundations', 'Hardware & Electronics'],
  },
]




// Bidirectional Crossfade Heading Reveal (Reversible down & up)
const spatialHeadingReveal = {
  hidden: {
    opacity: 0,
    y: 0,
    scale: 0.985,
    filter: 'blur(4px)',
    transition: {
      duration: 0.35,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
}

// Bidirectional Crossfade Bento Card Reveal (Reversible down & up)
const spatialCardReveal = {
  hidden: {
    opacity: 0,
    y: 0,
    scale: 0.985,
    filter: 'blur(4px)',
    transition: {
      duration: 0.35,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.65,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
}

const spatialStagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.14,
      delayChildren: 0.08,
    },
  },
}

const reducedSpatialHeading = {
  hidden: { opacity: 0, y: 0 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
}

const reducedSpatialCard = {
  hidden: { opacity: 0, y: 0 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
}

const reducedSpatialStagger = {
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
  const [isLaunching, setIsLaunching] = useState(false)

  useEffect(() => {
    const checkVisibility = () => {
      const scrollY = window.scrollY
      const innerHeight = window.innerHeight
      const scrollHeight = document.documentElement.scrollHeight
      const footerEl = document.querySelector('.portfolio-footer')
      const footerRect = footerEl ? footerEl.getBoundingClientRect() : null
      
      // Hide if approaching bottom or when footer enters the viewport
      const isNearFooter = innerHeight + scrollY >= scrollHeight - 460
      const isFooterInView = footerRect ? footerRect.top < innerHeight + 60 : isNearFooter

      setShowBackToTop(scrollY > 680 && !isNearFooter && !isFooterInView)
    }

    window.addEventListener('scroll', checkVisibility, { passive: true })
    window.addEventListener('resize', checkVisibility, { passive: true })
    checkVisibility()

    return () => {
      window.removeEventListener('scroll', checkVisibility)
      window.removeEventListener('resize', checkVisibility)
    }
  }, [])

  return (
    <AnimatePresence>
      {showBackToTop && (
        <motion.button
          type="button"
          className={`back-to-top-button group ${isLaunching ? 'is-launching' : ''}`}
          aria-label="Back to top"
          title="Back to top"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 16, scale: 0.88 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={prefersReducedMotion ? undefined : { opacity: 0, y: 12, scale: 0.88 }}
          whileHover={prefersReducedMotion ? undefined : { y: -4, scale: 1.08 }}
          whileTap={prefersReducedMotion ? undefined : { scale: 0.94 }}
          transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          onClick={() => {
            setIsLaunching(true)
            smoothScrollToTop(() => {
              setIsLaunching(false)
            })
          }}
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
  const location = useLocation()
  const prefersReducedMotion = useReducedMotion() ?? false
  const sectionHeadingReveal = prefersReducedMotion ? reducedSpatialHeading : spatialHeadingReveal
  const sectionCardReveal = prefersReducedMotion ? reducedSpatialCard : spatialCardReveal
  const sectionStagger = prefersReducedMotion ? reducedSpatialStagger : spatialStagger
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  const [projects, setProjects] = useState<PortfolioProject[]>([])
  const [projectsLoading, setProjectsLoading] = useState(true)
  const [projectsError, setProjectsError] = useState('')
  const [activeProjectIndex, setActiveProjectIndex] = useState(0)
  const [brokenProjectImages, setBrokenProjectImages] = useState<string[]>([])
  const [profile, setProfile] = useState<PublicProfile | null>(null)
  const [profileError, setProfileError] = useState('')
  const [aboutActiveTab, setAboutActiveTab] = useState<'overview' | 'mindset' | 'vision'>('overview')
  const [aboutJourneyView, setAboutJourneyView] = useState<'engineer' | 'education'>('engineer')
  const [contactStatus, setContactStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [selectedSkillCategory, setSelectedSkillCategory] = useState<string>('all')
  const [hoveredTool, setHoveredTool] = useState<string | null>(null)

  const [contactStatusMessage, setContactStatusMessage] = useState('')
  const contactStatusTimerRef = useRef<number | null>(null)
  const contactFormMountTimeRef = useRef<number>(Date.now())
  const contactFormInteractTimeRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (contactStatusTimerRef.current) {
        window.clearTimeout(contactStatusTimerRef.current)
      }
    }
  }, [])

  const saveScrollPosition = () => {
    sessionStorage.setItem('portfolio_restore_pending', 'true')
    sessionStorage.setItem('portfolio_home_scroll', window.scrollY.toString())
  }

  // Continuously record home scroll position (throttled) and set flag on unmount
  useEffect(() => {
    let scrollTimeout = 0
    const handleScroll = () => {
      if (scrollTimeout) return
      scrollTimeout = window.setTimeout(() => {
        scrollTimeout = 0
        sessionStorage.setItem('portfolio_home_scroll', window.scrollY.toString())
      }, 150)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      if (scrollTimeout) window.clearTimeout(scrollTimeout)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // Exact-spot scroll restoration engine
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }

    // Detect if this page load is a browser refresh / reload
    const isReload = (() => {
      try {
        const navEntries = performance.getEntriesByType('navigation')
        if (navEntries.length > 0) {
          return (navEntries[0] as PerformanceNavigationTiming).type === 'reload'
        }
        return (performance as any)?.navigation?.type === 1
      } catch {
        return false
      }
    })()

    // On browser refresh: Always reset to top start page (hero) and strip any stale anchor hash
    if (isReload) {
      sessionStorage.removeItem('portfolio_restore_pending')
      sessionStorage.setItem('portfolio_home_scroll', '0')
      if (window.location.hash) {
        window.history.replaceState(null, '', window.location.pathname)
      }
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
      window.dispatchEvent(new Event('scroll'))
      return
    }

    // Explicit scroll reset (e.g. user clicked RD logo in header)
    if (location.state && typeof location.state === 'object' && 'resetScroll' in location.state) {
      sessionStorage.removeItem('portfolio_restore_pending')
      sessionStorage.setItem('portfolio_home_scroll', '0')
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
      window.dispatchEvent(new Event('scroll'))
      return
    }

    // Explicit in-page hash navigation (e.g. user clicked #projects in nav or 'All projects')
    if (location.hash) {
      sessionStorage.removeItem('portfolio_restore_pending')
      const targetId = location.hash.replace('#', '')
      let attempts = 0
      const scrollToHash = () => {
        const el = document.getElementById(targetId)
        if (el) {
          el.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' })
          window.dispatchEvent(new Event('scroll'))
        } else if (attempts < 20) {
          attempts++
          window.setTimeout(scrollToHash, 40)
        }
      }
      const timer = window.setTimeout(scrollToHash, 40)
      return () => window.clearTimeout(timer)
    }

    const isRestorePending = sessionStorage.getItem('portfolio_restore_pending') === 'true'

    if (isRestorePending) {
      // Don't restore until projects and layout have finished loading
      if (projectsLoading) return

      sessionStorage.removeItem('portfolio_restore_pending')
      const saved = sessionStorage.getItem('portfolio_home_scroll')
      const targetY = saved ? parseInt(saved, 10) : 0

      if (targetY > 0) {
        let frameCount = 0
        const performRestore = () => {
          window.scrollTo({ top: targetY, left: 0, behavior: 'instant' })
          window.dispatchEvent(new Event('scroll'))
          frameCount++
          if (frameCount < 3) {
            requestAnimationFrame(performRestore)
          }
        }
        requestAnimationFrame(performRestore)
        return
      }
    }
  }, [projectsLoading, location.hash, location.state, prefersReducedMotion])

  const setTimedContactStatus = (status: 'sent' | 'error', message: string, durationMs = 5500) => {
    setContactStatus(status)
    setContactStatusMessage(message)
    if (contactStatusTimerRef.current) {
      window.clearTimeout(contactStatusTimerRef.current)
    }
    contactStatusTimerRef.current = window.setTimeout(() => {
      setContactStatus('idle')
      setContactStatusMessage('')
    }, durationMs)
  }
  const heroName = profile?.full_name || "Richard D'Souza"
  const heroSlides = useMemo(() => {
    const rawSlides = [
      {
        kicker: "HELLO, I'M",
        text: heroName,
        accentWord: "D'souza",
        accentClass: 'hero-title-accent-sheen',
      },
      {
        kicker: 'CURRENT ROLE',
        text: profile?.professional_title || 'Software Developer',
        accentWord: 'Developer',
        accentClass: 'hero-title-accent-cyan',
      },
      {
        kicker: 'FOCUSING ON',
        text: 'Full-Stack & Cloud',
        accentWord: 'Cloud',
        accentClass: 'hero-title-accent-emerald',
      },
    ]

    return rawSlides.map((slide) => {
      const accentIdx = slide.text.toLowerCase().indexOf(slide.accentWord.toLowerCase())
      const tokens: { char: string; isAccent: boolean }[] = []

      for (let i = 0; i < slide.text.length; i++) {
        const char = slide.text[i]
        // Combine apostrophe with following letter (e.g. 's in D'souza) so they never line-break separately
        if (char === "'" && i + 1 < slide.text.length && /[a-zA-Z]/.test(slide.text[i + 1])) {
          const combined = char + slide.text[i + 1]
          const isAccent = accentIdx !== -1 && i >= accentIdx
          tokens.push({ char: combined, isAccent })
          i++
          continue
        }
        const isAccent = accentIdx !== -1 && i >= accentIdx
        tokens.push({ char, isAccent })
      }

      return {
        ...slide,
        tokens,
        fullText: slide.text,
      }
    })
  }, [heroName, profile?.professional_title])

  const [heroSlideIndex, setHeroSlideIndex] = useState(0)
  const [heroSlideExiting, setHeroSlideExiting] = useState(false)

  useEffect(() => {
    if (prefersReducedMotion) return

    const currentSlide = heroSlides[heroSlideIndex]
    const tokenCount = currentSlide?.tokens.length || 15
    const typeInDuration = tokenCount * 52 + 480
    const readPause = 3400
    const slideDuration = typeInDuration + readPause
    const exitDuration = tokenCount * 16 + 260

    const exitTimer = window.setTimeout(() => {
      setHeroSlideExiting(true)
    }, slideDuration)

    const switchTimer = window.setTimeout(() => {
      setHeroSlideIndex((prev) => (prev + 1) % heroSlides.length)
      setHeroSlideExiting(false)
    }, slideDuration + exitDuration)

    return () => {
      window.clearTimeout(exitTimer)
      window.clearTimeout(switchTimer)
    }
  }, [heroSlideIndex, prefersReducedMotion, heroSlides])

  const handlePrevProject = () => {
    if (projects.length <= 1) return
    setActiveProjectIndex((prev) => (prev - 1 + projects.length) % projects.length)
  }

  const handleNextProject = () => {
    if (projects.length <= 1) return
    setActiveProjectIndex((prev) => (prev + 1) % projects.length)
  }

  useEffect(() => {
    if (projects.length <= 1) return
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase()
      if (tag === 'input' || tag === 'textarea') return

      if (e.key === 'ArrowLeft') {
        setActiveProjectIndex((prev) => (prev - 1 + projects.length) % projects.length)
      } else if (e.key === 'ArrowRight') {
        setActiveProjectIndex((prev) => (prev + 1) % projects.length)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [projects.length])

  useEffect(() => {
    if (projects.length > 0 && activeProjectIndex >= projects.length) {
      setActiveProjectIndex(0)
    }
  }, [projects.length, activeProjectIndex])

  const handleContactSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (contactStatus === 'sending') return

    const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY
    const form = event.currentTarget
    const formData = new FormData(form)

    const name = String(formData.get('name') || '').trim()
    const email = String(formData.get('email') || '').trim()
    const message = String(formData.get('message') || '').trim()
    const botcheck = formData.get('botcheck')

    // Determine form fill duration to protect against instantaneous bot scrapers
    const fillDurationMs = contactFormInteractTimeRef.current
      ? Date.now() - contactFormInteractTimeRef.current
      : Date.now() - contactFormMountTimeRef.current

    // Security & rate-limiting verification
    const securityCheck = validateContactSubmission({
      name,
      email,
      message,
      botcheck: Boolean(botcheck),
      fillDurationMs,
    })

    if (!securityCheck.allowed) {
      setTimedContactStatus(
        'error',
        securityCheck.message || 'Submission error. Please check your inputs.',
        6000,
      )
      return
    }

    if (!accessKey) {
      // Fallback: If Web3Forms key is not yet configured, launch user's email client directly so the message is never lost
      const subject = encodeURIComponent(`Portfolio message from ${name || 'Website Visitor'}`)
      const body = encodeURIComponent(`From: ${name || 'Anonymous'}\nEmail: ${email || 'Not provided'}\n\nMessage:\n${message}`)
      window.location.href = `mailto:rich.dsz1997@gmail.com?subject=${subject}&body=${body}`
      recordContactSubmission(email, message)
      setTimedContactStatus('sent', 'Opening your email client to send your message directly…', 6000)
      return
    }

    formData.set('access_key', accessKey)
    formData.set('subject', `Portfolio message from ${name || 'a visitor'}`)
    formData.set('from_name', "Richard D'Souza Portfolio")
    formData.set('replyto', email)
    if (contactStatusTimerRef.current) {
      window.clearTimeout(contactStatusTimerRef.current)
    }
    setContactStatus('sending')
    setContactStatusMessage('Sending your message…')

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' },
      })
      const result: { success?: boolean; message?: string } = await response.json()

      if (!response.ok || !result.success) throw new Error(result.message || 'Submission failed')

      recordContactSubmission(email, message)
      form.reset()
      contactFormInteractTimeRef.current = null
      contactFormMountTimeRef.current = Date.now()
      setTimedContactStatus('sent', 'Thank you for reaching out. Your message has been received, and I will get back to you shortly.', 5500)
    } catch {
      setTimedContactStatus('error', 'Your message could not be sent right now. Please try again or email me directly at rich.dsz1997@gmail.com.', 6000)
    }
  }
  const displayedSkills = profile?.skills?.length
    ? profile.skills
        .filter((skill) => skill && typeof skill.name === 'string')
        .map((skill, index) => {
          const fallback =
            skills.find(
              (item) => item.name.toLowerCase() === skill.name.toLowerCase(),
            ) || skills[index % skills.length]
          return {
            name: skill.name,
            categoryTag: fallback?.categoryTag || 'Core Stack',
            description:
              fallback?.description ||
              'Key engineering tools and frameworks for building modern production apps.',
            icon: /cloud|deploy/i.test(skill.name)
              ? Cloud
              : /security/i.test(skill.name)
                ? ShieldCheck
                : /backend|server|api/i.test(skill.name)
                  ? Terminal
                  : Code2,
            accent: /cloud|deploy/i.test(skill.name)
              ? 'violet'
              : /security/i.test(skill.name)
                ? 'rose'
                : /backend/i.test(skill.name)
                  ? 'emerald'
                  : 'cyan',
            technologies: (Array.isArray(skill.technologies) ? skill.technologies : [])
              .filter((technology): technology is string => typeof technology === 'string' && technology.trim().length > 0)
              .map((name) => ({
                name,
                icon: getTechnologyIcon(name) ?? technologyLucideIconMap[name] ?? Code2,
                tone: technologyToneMap[name] ?? 'default',
              })),
          }
        })
    : skills

  const totalSkillTools = displayedSkills.reduce(
    (acc, s) => acc + (s.technologies?.length || 0),
    0
  )

  const allFlatTechnologies = useMemo(() => {
    const list: Array<{
      name: string
      category: string
      categoryTag: string
      accent: string
      icon: any
      tone: string
      brandColor: string
      description?: string
    }> = []

    displayedSkills.forEach((cat) => {
      cat.technologies.forEach((tech) => {
        if (!list.some((item) => item.name.toLowerCase() === tech.name.toLowerCase())) {
          list.push({
            name: tech.name,
            category: cat.name,
            categoryTag: cat.categoryTag || cat.name,
            accent: cat.accent || 'cyan',
            icon: tech.icon,
            tone: tech.tone,
            brandColor: technologyBrandColorMap[tech.name] || '#00d8ff',
            description: cat.description,
          })
        }
      })
    })
    return list
  }, [displayedSkills])

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

    let lastSectionId = ''
    const updateActiveSection = () => {
      const navbarHeight =
        document.querySelector<HTMLElement>('.portfolio-nav')
          ?.getBoundingClientRect().height ?? 76
      const readingLine = navbarHeight + 24
      const currentSection =
        sections.find(
          (section) => section.getBoundingClientRect().bottom > readingLine,
        ) ?? sections.at(-1)

      if (currentSection && currentSection.id !== lastSectionId) {
        lastSectionId = currentSection.id
        setActiveSection(currentSection.id)
      }
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
    <div className="min-h-screen overflow-x-clip bg-[#08090d] text-white">
      <BackgroundAnimation />
      {/* Ambient Peripheral Flank Nebulae (Fills wide desktop side voids with subtle soft lavender & cosmic indigo glow on zoom-out / wide screens) */}
      <div className="fixed inset-y-0 left-0 w-[38vw] max-w-212.5 pointer-events-none z-0 overflow-hidden hidden lg:block" aria-hidden="true">
        <div className="absolute top-[12%] -left-32 w-136 h-192 rounded-full bg-linear-to-r from-indigo-600/14 via-purple-600/8 to-transparent blur-[130px]" />
        <div className="absolute top-[48%] -left-28 w-120 h-160 rounded-full bg-linear-to-r from-[#cbc5ff]/10 via-violet-500/6 to-transparent blur-[120px]" />
        <div className="absolute top-[80%] -left-32 w-lg h-176 rounded-full bg-linear-to-r from-blue-600/10 via-indigo-600/6 to-transparent blur-[130px]" />
      </div>
      <div className="fixed inset-y-0 right-0 w-[38vw] max-w-212.5 pointer-events-none z-0 overflow-hidden hidden lg:block" aria-hidden="true">
        <div className="absolute top-[18%] -right-32 w-136 h-192 rounded-full bg-linear-to-l from-[#cbc5ff]/12 via-purple-500/8 to-transparent blur-[130px]" />
        <div className="absolute top-[55%] -right-28 w-120 h-160 rounded-full bg-linear-to-l from-cyan-500/10 via-indigo-600/6 to-transparent blur-[120px]" />
        <div className="absolute top-[82%] -right-32 w-lg h-176 rounded-full bg-linear-to-l from-violet-600/10 via-purple-600/6 to-transparent blur-[130px]" />
      </div>
      
      
      <header className="portfolio-nav fixed inset-x-0 top-0 z-50 border-b border-white/7 bg-[#08090d]/85 backdrop-blur-xl">
        <nav className="portfolio-container flex h-19 items-center justify-between">
          <a
            href="#home"
            onClick={() => {
              sessionStorage.removeItem('portfolio_restore_pending')
              sessionStorage.setItem('portfolio_home_scroll', '0')
            }}
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

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <ThemeToggle />
            <a
              href="#contact"
              className="portfolio-nav-cta hidden sm:inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-white/15 px-3.5 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold transition hover:border-violet-400 hover:bg-violet-400/10 shrink-0"
            >
              <span>Let's connect</span>
              <ArrowUpRight size={15} />
            </a>
            <button
              type="button"
              aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(!menuOpen)}
              className="portfolio-nav-toggle rounded-lg border border-white/10 p-2 text-zinc-300 hover:text-white md:hidden inline-flex items-center justify-center shrink-0"
            >
              {menuOpen ? <X size={19} /> : <Menu size={19} />}
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
        <CinematicSection
          id="home"
          type="hero"
          className="hero-section relative flex scroll-mt-20 items-center"
        >
          <div className="portfolio-container relative grid w-full items-center gap-10 pb-10 pt-20 sm:pt-24 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
            <motion.div
              className="hero-copy"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.72, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="hero-morph-wrapper">
                <p
                  key={`kicker-${heroSlideIndex}`}
                  className={`hero-kicker ${heroSlideExiting ? 'hero-morph-kicker-exit' : 'hero-morph-kicker-enter'}`}
                >
                  {heroSlides[heroSlideIndex].kicker}
                </p>

                <h1
                  className="hero-title"
                  aria-label={`${heroSlides[heroSlideIndex].kicker} ${heroSlides[heroSlideIndex].fullText}`}
                >
                  <span
                    key={`title-typing-${heroSlideIndex}`}
                    className="hero-title-typing"
                    aria-hidden="true"
                  >
                    {heroSlides[heroSlideIndex].tokens.map((token, index, arr) => (
                      <span
                        key={`char-${heroSlideIndex}-${index}`}
                        className={`hero-title-letter ${token.isAccent ? `hero-title-accent ${heroSlides[heroSlideIndex].accentClass}` : ''} ${heroSlideExiting ? 'hero-title-letter-exiting' : ''}`}
                        style={{
                          animationDelay: heroSlideExiting
                            ? `${(arr.length - 1 - index) * 16}ms`
                            : `${index * 52}ms`,
                        }}
                      >
                        {token.char === ' ' ? '\u00a0' : token.char}
                      </span>
                    ))}
                  </span>
                </h1>
              </div>

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

                <span className="hero-location">
                  <span className="hero-location-dot" aria-hidden="true" />
                  <span>Based in {profile?.location || 'India'}</span>
                </span>
              </div>
            </motion.div>

            <motion.div
              className="hero-visual"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.82, delay: prefersReducedMotion ? 0 : 0.16, ease: [0.22, 1, 0.36, 1] }}
            >
              <SpatialHeroConsole
                profile={profile}
                prefersReducedMotion={prefersReducedMotion}
              />
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
        </CinematicSection>

        <CosmicHorizonDivider theme="about" />

        <CinematicSection
          id="about"
          type="section"
          className="about-section scroll-mt-24 py-20 sm:py-28"
        >
          <div className="portfolio-container">
            <motion.div
              className="section-heading about-heading"
              variants={sectionHeadingReveal}
              initial={prefersReducedMotion ? false : "hidden"}
              whileInView="visible"
              viewport={{ once: false, amount: 0.15 }}
            >
              <p className="section-label">01 / ABOUT</p>
              <h2>
                Thoughtful software,{' '}
                <span className="about-headline-accent">built with purpose.</span>
              </h2>
              <p className="section-summary">
                I value practical solutions, clear experiences, and the steady craft behind reliable digital products.
              </p>
            </motion.div>

            {/* Unified Journey Master Switcher (visible on desktop and mobile) */}
            <div className="about-journey-switcher" role="tablist" aria-label="Journey view selection">
              <button
                type="button"
                role="tab"
                id="tab-engineer-journey"
                aria-selected={aboutJourneyView === 'engineer'}
                aria-controls="panel-engineer-journey"
                onClick={() => setAboutJourneyView('engineer')}
                className={`about-journey-switcher-btn relative ${aboutJourneyView === 'engineer' ? 'is-active' : ''}`}
              >
                {aboutJourneyView === 'engineer' && (
                  <motion.span
                    layoutId="aboutJourneyMasterGlider"
                    className="about-journey-switcher-glider"
                    transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  />
                )}
                <Terminal size={14} className="relative z-1 shrink-0 text-violet-400" />
                <span className="relative z-1 font-semibold">Engineer Journey</span>
                <span className="about-journey-switcher-count relative z-1">3</span>
              </button>

              <button
                type="button"
                role="tab"
                id="tab-education-journey"
                aria-selected={aboutJourneyView === 'education'}
                aria-controls="panel-education-journey"
                onClick={() => setAboutJourneyView('education')}
                className={`about-journey-switcher-btn relative ${aboutJourneyView === 'education' ? 'is-active' : ''}`}
              >
                {aboutJourneyView === 'education' && (
                  <motion.span
                    layoutId="aboutJourneyMasterGlider"
                    className="about-journey-switcher-glider"
                    transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  />
                )}
                <GraduationCap size={14} className="relative z-1 shrink-0 text-cyan-400" />
                <span className="relative z-1 font-semibold">Education Journey</span>
                <span className="about-journey-switcher-count relative z-1">3</span>
              </button>
            </div>

            <motion.div
              className="about-layout"
              variants={sectionCardReveal}
              initial={prefersReducedMotion ? false : "hidden"}
              whileInView="visible"
              viewport={{ once: false, amount: 0.08 }}
            >
      {profileError && (
        <p role="alert" className="text-sm text-red-400">
          {profileError}
        </p>
      )}

      <AnimatePresence mode="wait">
        {aboutJourneyView === 'engineer' ? (
          profile ? (
            <motion.div
              key="engineer-journey"
              id="panel-engineer-journey"
              role="tabpanel"
              aria-labelledby="tab-engineer-journey"
              className="about-story"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, y: -14 }}
              transition={{ duration: 0.28, ease: [0.25, 1, 0.5, 1] }}
            >
          {/* Card Top Header */}
          <div className="about-story-header">
            <div className="about-story-badge">
              <div className="about-terminal-dots" aria-hidden="true">
                <span className="about-dot dot-red" />
                <span className="about-dot dot-yellow" />
                <span className="about-dot dot-green" />
              </div>
              <Terminal size={14} className="text-violet-400" />
              <span>Engineer Journey</span>
            </div>
          </div>

          {/* Interactive Multi-Deck Navigation Tabs */}
          <div className="about-deck-tabs" role="tablist" aria-label="Engineer Journey Deck Tabs">
            <button
              type="button"
              role="tab"
              aria-selected={aboutActiveTab === 'overview'}
              onClick={() => setAboutActiveTab('overview')}
              className={`about-deck-tab-btn relative ${aboutActiveTab === 'overview' ? 'is-active' : ''}`}
            >
              {aboutActiveTab === 'overview' && (
                <motion.span
                  layoutId="aboutDeckGlider"
                  className="about-deck-active-indicator"
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                />
              )}
              <Sparkles size={13} className="shrink-0 relative z-1" />
              <span className="relative z-1">Overview</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={aboutActiveTab === 'mindset'}
              onClick={() => setAboutActiveTab('mindset')}
              className={`about-deck-tab-btn relative ${aboutActiveTab === 'mindset' ? 'is-active' : ''}`}
            >
              {aboutActiveTab === 'mindset' && (
                <motion.span
                  layoutId="aboutDeckGlider"
                  className="about-deck-active-indicator"
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                />
              )}
              <Code2 size={13} className="shrink-0 relative z-1" />
              <span className="relative z-1">Mindset &amp; Craft</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={aboutActiveTab === 'vision'}
              onClick={() => setAboutActiveTab('vision')}
              className={`about-deck-tab-btn relative ${aboutActiveTab === 'vision' ? 'is-active' : ''}`}
            >
              {aboutActiveTab === 'vision' && (
                <motion.span
                  layoutId="aboutDeckGlider"
                  className="about-deck-active-indicator"
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                />
              )}
              <Compass size={13} className="shrink-0 relative z-1" />
              <span className="relative z-1">Vision &amp; Projects</span>
            </button>
          </div>

          {/* Interactive Tab Body */}
          <div className="about-deck-viewport">
            <AnimatePresence mode="wait">
              {aboutActiveTab === 'overview' && (
                <motion.div
                  key="tab-overview"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
                  className="about-deck-pane"
                >
                  {profile.short_intro && (
                    <div className="about-lead-box">
                      <span className="about-code-prefix">
                        // software engineering &amp; digital craft
                      </span>
                      <p className="about-lead-text">{profile.short_intro}</p>
                    </div>
                  )}

                  <div className="about-story-highlights">
                    {profile.interests && profile.interests.length > 0 ? (
                      profile.interests.slice(0, 3).map((interest) => {
                        const meta = getInterestMeta(interest)
                        const IconComponent = meta.icon
                        return (
                          <div key={interest} className={`about-highlight-pill ${meta.badgeClass}`}>
                            <IconComponent size={14} className={`shrink-0 ${meta.color}`} />
                            <span>{interest}</span>
                          </div>
                        )
                      })
                    ) : (
                      <>
                        <div className="about-highlight-pill about-tag-violet">
                          <GraduationCap size={15} className="text-violet-400 shrink-0" />
                          <span>MSc in IT</span>
                        </div>
                        <div className="about-highlight-pill about-tag-cyan">
                          <Code2 size={15} className="text-cyan-400 shrink-0" />
                          <span>Full-Stack &amp; Cloud</span>
                        </div>
                        <div className="about-highlight-pill about-tag-amber">
                          <Sparkles size={15} className="text-amber-400 shrink-0" />
                          <span>AI Integration</span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="about-deck-subcard about-deck-foundations">
                    <div className="about-deck-subcard-head">
                      <GraduationCap size={15} className="text-violet-400 shrink-0" />
                      <span className="about-deck-subcard-title">Academic &amp; Technical Foundations</span>
                    </div>
                    <p className="about-deck-subcard-text">
                      Software Developer completing an M.Sc in Information Technology from Parvatibai Chowgule College of Arts and Science. Focused on building reliable web &amp; mobile applications, exploring modern cloud architectures, and finding practical solutions to real-world problems.
                    </p>
                  </div>
                </motion.div>
              )}

              {aboutActiveTab === 'mindset' && (
                <motion.div
                  key="tab-mindset"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
                  className="about-deck-pane"
                >
                  <div className="about-deck-subcard">
                    <div className="about-deck-subcard-head">
                      <Sparkles size={15} className="text-amber-400 shrink-0" />
                      <span className="about-deck-subcard-title">Continuous Growth &amp; Curiosity</span>
                    </div>
                    <p className="about-deck-subcard-text">
                      I&apos;m constantly looking to learn, embrace challenging engineering problems, and improve my technical craft across frontend and backend systems. Every project is an opportunity to master new paradigms and build with higher precision.
                    </p>
                  </div>

                  <div className="about-deck-subcard">
                    <div className="about-deck-subcard-head">
                      <Code2 size={15} className="text-cyan-400 shrink-0" />
                      <span className="about-deck-subcard-title">Engineering Philosophy</span>
                    </div>
                    <p className="about-deck-subcard-text">
                      I believe the best software balances elegant architecture with clear, intuitive user experience. Clean, maintainable code is not just an aesthetic choice—it is the bedrock of dependable digital products.
                    </p>
                  </div>

                  <div className="about-deck-tags-row">
                    <span className="about-deck-tag"><ShieldCheck size={12} className="text-emerald-400" /> Clean Architecture</span>
                    <span className="about-deck-tag"><Layers size={12} className="text-cyan-400" /> End-to-End Ownership</span>
                    <span className="about-deck-tag"><Terminal size={12} className="text-violet-400" /> Practical Solutions</span>
                  </div>
                </motion.div>
              )}

              {aboutActiveTab === 'vision' && (
                <motion.div
                  key="tab-vision"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
                  className="about-deck-pane"
                >
                  <div className="about-deck-subcard">
                    <div className="about-deck-subcard-head">
                      <Compass size={15} className="text-violet-400 shrink-0" />
                      <span className="about-deck-subcard-title">Focus &amp; Future Vision</span>
                    </div>
                    <p className="about-deck-subcard-text">
                      Dedicated to building software that solves practical operational problems. Enthusiastic about system design, application security, cloud technologies, and the purposeful integration of artificial intelligence in everyday products.
                    </p>
                  </div>

                  <div className="about-deck-projects-box">
                    <span className="about-deck-projects-label">Featured Projects in Focus:</span>
                    <div className="about-deck-project-chips">
                      <a href="#projects" className="about-project-chip">
                        <span className="about-project-chip-name">SkillPath</span>
                        <span className="about-project-chip-sub">Learning Companion</span>
                      </a>
                      <a href="#projects" className="about-project-chip">
                        <span className="about-project-chip-name">Sentinel Grid</span>
                        <span className="about-project-chip-sub">Security Management</span>
                      </a>
                      <a href="#projects" className="about-project-chip">
                        <span className="about-project-chip-name">AI CRM Platform</span>
                        <span className="about-project-chip-sub">Intelligent Workflows</span>
                      </a>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Action Row */}
          <div className="about-actions-row">
            <div className="about-tab-indicator-hint font-mono text-xs text-zinc-400">
              <span className="text-violet-400/80 mr-1.5">●</span>
              <span>MODE: {aboutActiveTab === 'overview' ? '01 / OVERVIEW' : aboutActiveTab === 'mindset' ? '02 / MINDSET' : '03 / VISION'}</span>
            </div>

            <Link to="/request-resume" onClick={saveScrollPosition} className="about-cta-resume">
              <span>Request Resume</span>
              <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          </div>

          {/* Quick-Jump to Education Journey */}
          <div className="about-journey-toggle-footer">
            <button
              type="button"
              onClick={() => {
                setAboutJourneyView('education')
                const el = document.getElementById('about')
                if (el) {
                  const yOffset = -70
                  const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset
                  window.scrollTo({ top: y, behavior: 'smooth' })
                }
              }}
              className="about-journey-toggle-btn"
            >
              <GraduationCap size={15} className="text-cyan-400 shrink-0" />
              <span>Explore Education Journey</span>
              <ChevronRight size={15} className="opacity-70 shrink-0" />
            </button>
          </div>
        </motion.div>
      ) : !profileError ? (
        <p className="text-lg leading-8 text-zinc-500">
          Profile information will be available soon.
        </p>
      ) : null
    ) : (
        /* Unified Education Journey Stream */
        <motion.aside
          key="education-journey"
          id="panel-education-journey"
          role="tabpanel"
          aria-labelledby="tab-education-journey"
          className="about-facts"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={prefersReducedMotion ? undefined : { opacity: 0, y: -14 }}
          transition={{ duration: 0.28, ease: [0.25, 1, 0.5, 1] }}
          aria-label="Education journey and qualifications"
        >
          <div className="about-edu-stream-card group">
            {/* Top Border Beam Shine */}
            <div className="about-card-top-shine" aria-hidden="true" />
            <div className="about-edu-ambient-aura" aria-hidden="true" />

            {/* Education Header */}
            <div className="about-story-header">
              <div className="about-story-badge">
                <div className="about-terminal-dots" aria-hidden="true">
                  <span className="about-dot dot-red" />
                  <span className="about-dot dot-yellow" />
                  <span className="about-dot dot-green" />
                </div>
                <GraduationCap size={14} className="text-cyan-400" />
                <span>Education Journey</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="about-card-pill-badge edu-badge">
                  <span className="about-badge-dot edu-dot" />
                  Academic Progression
                </span>
                <span className="about-card-status-indicator font-mono">
                  <Clock size={11} className="inline mr-1 text-violet-400" />
                  2016 – 2026
                </span>
              </div>
            </div>

            {/* Integrated Timeline Stream */}
            <div className="about-edu-stream-timeline">
              {/* Embedded Gradient Rail Line */}
              <div className="about-edu-stream-rail" aria-hidden="true">
                <div className="about-edu-stream-rail-beam" />
              </div>

              <div className="about-edu-stream-list">
                {educationJourney.map((item, idx) => {
                  const IconComp = item.icon
                  const isLatest = idx === 0
                  return (
                    <motion.div
                      key={item.id}
                      className={`about-edu-stream-item about-edu-theme-${item.theme} ${isLatest ? 'is-active' : ''}`}
                      initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.32, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
                    >
                      {/* Integrated Timeline Node */}
                      <div className="about-edu-stream-node" aria-hidden="true">
                        {isLatest && <span className="about-edu-stream-ping" />}
                        <span className="about-edu-stream-dot" />
                      </div>

                      {/* Milestone Content */}
                      <div className="about-edu-stream-body">
                        {/* Level Tag & Period / Score Row */}
                        <div className="about-edu-stream-row">
                          <div className="about-edu-stream-level">
                            <span className="about-edu-stream-level-tag">{item.levelTag}</span>
                            {isLatest && (
                              <span className="about-edu-stream-status-pill">
                                <span className="about-edu-stream-pulse-dot" />
                                Active
                              </span>
                            )}
                          </div>

                          <div className="about-edu-stream-meta-right">
                            {item.score && (
                              <span className="about-edu-stream-score-badge">
                                {item.score}
                              </span>
                            )}
                            <span className="about-edu-stream-period">
                              <Clock size={11} className="inline mr-1 opacity-70" />
                              {item.period}
                            </span>
                          </div>
                        </div>

                        {/* Degree Title & Institution */}
                        <div className="about-edu-stream-degree-row">
                          <div className="about-edu-stream-icon-wrap" aria-hidden="true">
                            <IconComp size={16} />
                          </div>
                          <div className="about-edu-stream-title-box">
                            <h4 className="about-edu-stream-degree">{item.degree}</h4>
                            <p className="about-edu-stream-inst">
                              <span>{item.institution}</span>
                              <span className="about-edu-stream-sep" aria-hidden="true">•</span>
                              <span className="about-edu-stream-loc">
                                <MapPin size={11} className="inline mr-0.5 opacity-60" aria-hidden="true" />
                                {item.location}
                              </span>
                            </p>
                          </div>
                        </div>

                        {/* Coursework Tags */}
                        {item.highlights && item.highlights.length > 0 && (
                          <div className="about-edu-stream-tags">
                            {item.highlights.map((tag) => (
                              <span key={tag} className="about-edu-stream-tag">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>

            {/* Quick-Jump to Engineer Journey */}
            <div className="about-journey-toggle-footer">
              <button
                type="button"
                onClick={() => {
                  setAboutJourneyView('engineer')
                  const el = document.getElementById('about')
                  if (el) {
                    const yOffset = -70
                    const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset
                    window.scrollTo({ top: y, behavior: 'smooth' })
                  }
                }}
                className="about-journey-toggle-btn"
              >
                <Terminal size={15} className="text-violet-400 shrink-0" />
                <span>Explore Engineer Journey</span>
                <ChevronRight size={15} className="opacity-70 shrink-0" />
              </button>
            </div>
          </div>
        </motion.aside>
      )}
      </AnimatePresence>
    </motion.div>
  </div>
        </CinematicSection>

        <CosmicHorizonDivider theme="skills" />

        <CinematicSection
          id="skills"
          type="section"
          className="skills-section scroll-mt-24 py-20 sm:py-24"
        >
  <div className="portfolio-container">
    <motion.div
      className="section-heading skills-heading"
      variants={sectionHeadingReveal}
      initial={prefersReducedMotion ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: false, amount: 0.15 }}
    >
      <p className="section-label">02 / SKILLS</p>
      <h2>
        Building with a modern,{' '}
        <span className="skills-headline-accent">connected stack</span>
      </h2>
      <p className="section-summary">
        A unified ecosystem of frontend architectures, backend systems, and cloud infrastructure engineered for scale and speed.
      </p>
    </motion.div>

    {/* Interactive Category Filter Bar */}
    <div className="skills-filter-wrap" role="tablist" aria-label="Skills Category Filter">
      <button
        type="button"
        role="tab"
        aria-selected={selectedSkillCategory === 'all'}
        onClick={() => setSelectedSkillCategory('all')}
        className={`skills-filter-btn relative ${selectedSkillCategory === 'all' ? 'is-active' : ''}`}
      >
        {selectedSkillCategory === 'all' && (
          <motion.span
            layoutId="skillsCategoryGlider"
            className="skills-filter-active-indicator"
            transition={{ type: 'spring', stiffness: 450, damping: 32 }}
          />
        )}
        <Sparkles size={12} className="shrink-0 relative z-1" />
        <span className="relative z-1">All Stack ({totalSkillTools})</span>
      </button>
      {displayedSkills.map((skill) => {
        const isSelected = selectedSkillCategory === skill.name
        return (
          <button
            key={skill.name}
            type="button"
            role="tab"
            aria-selected={isSelected}
            onClick={() => setSelectedSkillCategory(isSelected ? 'all' : skill.name)}
            className={`skills-filter-btn relative ${isSelected ? 'is-active' : ''}`}
          >
            {isSelected && (
              <motion.span
                layoutId="skillsCategoryGlider"
                className="skills-filter-active-indicator"
                transition={{ type: 'spring', stiffness: 450, damping: 32 }}
              />
            )}
            <span className="relative z-1">{skill.categoryTag || skill.name}</span>
          </button>
        )
      })}
    </div>

    {/* Clean Scannable Technology Pills Stage */}
    <motion.div
      className="tech-pills-stage"
      variants={sectionCardReveal}
      initial={prefersReducedMotion ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: true, amount: 0.18 }}
    >
      {/* Ambient Radial Lights */}
      <div className="tech-pills-radial-glow" aria-hidden="true" />
      <div className="tech-pills-grid-pattern" aria-hidden="true" />

      {/* Technology Pills Grid */}
      <div className="tech-pills-wrap">
        {allFlatTechnologies.map((tech) => {
          const ToolIcon = tech.icon
          const isSelected = selectedSkillCategory === 'all' || selectedSkillCategory === tech.category
          const isHovered = hoveredTool === tech.name
          const activeColor = tech.brandColor || '#00d8ff'

          return (
            <motion.button
              key={tech.name}
              type="button"
              className={`tech-pill-btn ${isSelected ? 'is-selected' : 'is-dimmed'} ${isHovered ? 'is-hovered' : ''}`}
              style={{
                '--pill-color': activeColor,
                '--pill-glow': `${activeColor}40`,
              } as React.CSSProperties}
              whileHover={prefersReducedMotion ? undefined : { y: -3, scale: 1.04 }}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 450, damping: 25 }}
              onMouseEnter={() => setHoveredTool(tech.name)}
              onMouseLeave={() => setHoveredTool(null)}
              onClick={() => setSelectedSkillCategory(selectedSkillCategory === tech.category ? 'all' : tech.category)}
              aria-label={`${tech.name} - ${tech.categoryTag}`}
            >
              <span className="tech-pill-icon-box" style={{ color: activeColor }}>
                <ToolIcon size={16} aria-hidden="true" />
              </span>
              <span className="tech-pill-name">{tech.name}</span>
            </motion.button>
          )
        })}
      </div>

      {/* Bottom Telemetry Footer Strip */}
      <div className="tech-pills-footer">
        {hoveredTool ? (
          <div className="tech-footer-active">
            <span className="tech-footer-dot" />
            <span className="font-mono text-zinc-400 text-xs uppercase tracking-wider">ACTIVE TOOL:</span>
            <span className="text-white font-semibold text-xs">{hoveredTool}</span>
            <span className="text-zinc-600">•</span>
            <span className="text-cyan-400 text-xs">
              {allFlatTechnologies.find((t) => t.name === hoveredTool)?.categoryTag}
            </span>
            <span className="text-zinc-600 hidden sm:inline">•</span>
            <span className="text-zinc-400 text-xs hidden sm:inline">
              {allFlatTechnologies.find((t) => t.name === hoveredTool)?.description}
            </span>
          </div>
        ) : selectedSkillCategory !== 'all' ? (
          <div className="tech-footer-active">
            <span className="tech-footer-dot" />
            <span className="font-mono text-zinc-400 text-xs uppercase tracking-wider">FILTER:</span>
            <span className="text-white font-semibold text-xs">{selectedSkillCategory}</span>
            <span className="text-zinc-600">•</span>
            <span className="text-cyan-400 text-xs">
              {allFlatTechnologies.filter((t) => t.category === selectedSkillCategory).length} tools
            </span>
            <span className="text-zinc-600 hidden sm:inline">•</span>
            <span className="text-zinc-400 text-xs hidden sm:inline">
              {displayedSkills.find((s) => s.name === selectedSkillCategory)?.description}
            </span>
          </div>
        ) : (
          <div className="tech-footer-idle">
            <span className="text-cyan-400 text-xs">✦</span>
            <span className="text-zinc-400 text-xs">
              Production Engineering Stack ({allFlatTechnologies.length} core technologies) • Click any category or hover to inspect
            </span>
          </div>
        )}
      </div>
    </motion.div>
  </div>
        </CinematicSection>

        <CosmicHorizonDivider theme="projects" />

        <CinematicSection
          id="projects"
          type="section"
          className="projects-section scroll-mt-24 py-20 sm:py-24"
        >
          <div className="portfolio-container">
            <motion.div
              className="projects-heading-row"
              variants={sectionHeadingReveal}
              initial={prefersReducedMotion ? false : "hidden"}
              whileInView="visible"
              viewport={{ once: false, amount: 0.15 }}
            >
              <div className="section-heading">
                <p className="section-label">03 / SELECTED WORK</p>
                <h2>
                  Selected projects,{' '}
                  <span className="projects-headline-accent">thoughtfully built.</span>
                </h2>
                <p className="section-summary">
                  A selection of software projects spanning product experiences, practical systems, and emerging technology.
                </p>
              </div>
              <span className="projects-count">
                {projectsLoading ? 'Loading projects...' : `${projects.length} projects`}
              </span>
            </motion.div>

            {!projectsLoading && !projectsError && projects.length > 0 && (
              <motion.div
                className="projects-carousel-wrapper"
                variants={sectionCardReveal}
                initial={prefersReducedMotion ? false : "hidden"}
                whileInView="visible"
                viewport={{ once: true, amount: 0.12 }}
              >
                {/* Floating Left Navigation Arrow */}
                {projects.length > 1 && (
                  <button
                    type="button"
                    onClick={handlePrevProject}
                    className="projects-stage-arrow projects-stage-prev"
                    aria-label="Previous project slide"
                  >
                    <ChevronLeft size={22} />
                  </button>
                )}

                {/* 3D Stage with Touch / Drag Gestures */}
                <motion.div
                  className="projects-carousel-stage"
                  drag={projects.length > 1 ? 'x' : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.16}
                  onDragEnd={(_e, info) => {
                    if (info.offset.x < -45 || info.velocity.x < -250) {
                      handleNextProject()
                    } else if (info.offset.x > 45 || info.velocity.x > 250) {
                      handlePrevProject()
                    }
                  }}
                >
                  {projects.map((project, index) => {
                    const count = projects.length
                    let offset = index - activeProjectIndex
                    if (count > 2) {
                      if (offset > count / 2) offset -= count
                      if (offset < -count / 2) offset += count
                    }
                    const isActive = offset === 0
                    const isVisible = Math.abs(offset) <= 1 || count <= 2

                    // Horizontal-first then Move-Up levitation animation
                    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640
                    const cardStepX = isMobile ? 285 : 260

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
                          y: isMobile ? -10 : -20, // Clean, steady elevation
                          scale: 1, // Steady scale - zero zoom glitch
                          rotateY: 0,
                          opacity: 1,
                          zIndex: 20,
                        }
                      : offset === -1
                      ? {
                          x: -cardStepX,
                          y: 8,
                          scale: isMobile ? 0.88 : 0.94,
                          rotateY: isMobile ? 8 : 5,
                          opacity: isMobile ? 0.2 : 0.55,
                          zIndex: 10,
                        }
                      : offset === 1
                      ? {
                          x: cardStepX,
                          y: 8,
                          scale: isMobile ? 0.88 : 0.94,
                          rotateY: isMobile ? -8 : -5,
                          opacity: isMobile ? 0.2 : 0.55,
                          zIndex: 10,
                        }
                      : {
                          x: offset < 0 ? -cardStepX * 1.6 : cardStepX * 1.6,
                          y: 12,
                          scale: 0.8,
                          rotateY: offset < 0 ? 10 : -10,
                          opacity: 0,
                          zIndex: 1,
                        }

                    // Spotify-grade fluid easing curve - pure single-stage momentum
                    const transitionProps = prefersReducedMotion
                      ? { duration: 0.25 }
                      : {
                          duration: 0.46,
                          ease: [0.25, 1, 0.5, 1] as const,
                        }

                    if (!isVisible && Math.abs(offset) > 2) return null

                    return (
                      <motion.div
                        key={project.id}
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
                            setActiveProjectIndex(index)
                          }
                        }}
                      >
                        {isActive && <div className="projects-carousel-ambient-glow" aria-hidden="true" />}
                        <article className="project-poster-card">
                          {/* Dedicated Top Visual Preview Window (50% height) */}
                          <div className="project-poster-media-window">
                            {project.imageUrl && !brokenProjectImages.includes(project.imageUrl) ? (
                              <img
                                src={project.imageUrl}
                                alt={`${project.name} project preview`}
                                className="project-poster-image"
                                loading="lazy"
                                onError={() => markProjectImageAsBroken(project.imageUrl)}
                              />
                            ) : (
                              <div className={`project-poster-fallback bg-linear-to-br ${project.color}`}>
                                <Code2 size={32} aria-hidden="true" />
                                <span>{project.name}</span>
                              </div>
                            )}

                            {/* Floating Header Badges */}
                            <div className="project-poster-header">
                              <span className="project-poster-number">{project.number}</span>
                              {project.category && (
                                <span className="project-poster-category">{project.category}</span>
                              )}
                            </div>

                            <div className="project-poster-bottom-gradient" />
                          </div>

                          {/* Bottom Editorial Glass Body (50% height) */}
                          <div className="project-poster-body">
                            <div className="project-poster-title-row">
                              <h3 className="project-poster-title">{project.name}</h3>
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
                                {project.summary && (
                                  <p className="project-poster-desc">{project.summary}</p>
                                )}

                                {project.stack && project.stack.length > 0 && (
                                  <div className="project-poster-tags" aria-label={`${project.name} tech stack`}>
                                    {project.stack.slice(0, 3).map((technology) => (
                                      <span key={technology} className="project-poster-tag">
                                        {technology}
                                      </span>
                                    ))}
                                  </div>
                                )}

                                {/* Action row: Details + circular icons */}
                                <div className="project-poster-actions">
                                  <Link
                                    to={`/projects/${project.slug}`}
                                    onClick={saveScrollPosition}
                                    className="project-poster-details-btn"
                                    title="View Details"
                                  >
                                    <span>View details</span>
                                    <ArrowUpRight size={13} />
                                  </Link>

                                  <div className="project-poster-icon-group">
                                    {project.liveUrl && (
                                      <a
                                        href={project.liveUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="project-circle-btn"
                                        aria-label={`Open ${project.name} live application`}
                                        title="Live Application"
                                      >
                                        <ExternalLink size={13} />
                                      </a>
                                    )}

                                    {project.github && (
                                      <a
                                        href={project.github}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="project-circle-btn"
                                        aria-label={`Open ${project.name} repository`}
                                        title="Source Code"
                                      >
                                        <FaGithub size={13} />
                                      </a>
                                    )}

                                    {project.demoVideo && (
                                      <Link
                                        to={`/projects/${project.slug}#demo`}
                                        onClick={saveScrollPosition}
                                        className="project-circle-btn"
                                        aria-label={`Watch ${project.name} demo`}
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
                                {project.category || 'FEATURED WORK'}
                              </p>
                            )}
                          </div>
                        </article>
                      </motion.div>
                    )
                  })}
                </motion.div>

                {/* Floating Right Navigation Arrow */}
                {projects.length > 1 && (
                  <button
                    type="button"
                    onClick={handleNextProject}
                    className="projects-stage-arrow projects-stage-next"
                    aria-label="Next project slide"
                  >
                    <ChevronRight size={22} />
                  </button>
                )}

                {/* Bottom Interactive Controls & Dots */}
                {projects.length > 1 && (
                  <div className="projects-carousel-controls">
                    <button
                      type="button"
                      onClick={handlePrevProject}
                      className="projects-control-arrow-btn"
                      aria-label="Previous project"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    <div className="projects-carousel-dots" role="tablist" aria-label="Project slide navigation">
                      {projects.map((p, idx) => (
                        <button
                          key={p.id}
                          type="button"
                          role="tab"
                          aria-selected={idx === activeProjectIndex}
                          aria-label={`Jump to project ${idx + 1}: ${p.name}`}
                          onClick={() => setActiveProjectIndex(idx)}
                          className={`projects-carousel-dot ${idx === activeProjectIndex ? 'is-active' : ''}`}
                        />
                      ))}
                    </div>

                    <span className="projects-carousel-counter">
                      {String(activeProjectIndex + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}
                    </span>

                    <button
                      type="button"
                      onClick={handleNextProject}
                      className="projects-control-arrow-btn"
                      aria-label="Next project"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </motion.div>
            )}

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
        </CinematicSection>

        <CosmicHorizonDivider theme="contact" />

        <CinematicSection
          id="contact"
          type="section"
          className="contact-section scroll-mt-24 py-20 sm:py-28"
        >
          <div className="portfolio-container">
            <motion.div
              className="contact-split-grid"
              variants={sectionStagger}
              initial={false}
              whileInView="visible"
              viewport={{ once: false, amount: 0.1 }}
            >
              {/* Left Column: Heading & Description */}
              <motion.div className="contact-editorial-col" variants={sectionHeadingReveal}>
                <p className="section-label">04 / CONTACT</p>
                <h2 className="contact-editorial-title">
                  Let&apos;s build something{' '}
                  <span className="contact-headline-accent">with intention.</span>
                </h2>
                <p className="contact-editorial-desc">
                  I&apos;m open to meaningful conversations with recruiters, engineering teams, and collaborators who value thoughtful software.
                </p>
              </motion.div>

              {/* Right Column: Send a Message Form Card Only */}
              <motion.div className="contact-form-col" variants={sectionCardReveal}>
                <div className="contact-form-card">
                  <div className="contact-form-header">
                    <div className="contact-badge">
                      <Send size={14} className="text-violet-400" />
                      <span>Send a Message</span>
                    </div>
                  </div>

                  <form
                    className="contact-form"
                    onSubmit={handleContactSubmit}
                    onFocus={() => {
                      if (!contactFormInteractTimeRef.current) {
                        contactFormInteractTimeRef.current = Date.now()
                      }
                    }}
                  >
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
                          rows={4}
                          placeholder="Share details about your project, engineering requirements, or opportunity..."
                          maxLength={5000}
                          required
                        />
                      </label>
                    </div>

                    <input className="contact-honeypot" name="botcheck" type="checkbox" tabIndex={-1} aria-hidden="true" />

                    <div className="contact-form-footer">
                      <motion.button
                        className="contact-submit-btn"
                        type="submit"
                        disabled={contactStatus === 'sending'}
                        whileHover={prefersReducedMotion ? undefined : { scale: 1.02, y: -2 }}
                        whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
                        transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                      >
                        <Send size={15} className={contactStatus === 'sending' ? 'animate-pulse' : ''} />
                        <span>{contactStatus === 'sending' ? 'Sending Message…' : 'Send Message'}</span>
                        <ArrowUpRight size={14} />
                      </motion.button>

                      <div className="contact-direct-link">
                        <span>Or email directly:</span>
                        <a href="mailto:rich.dsz1997@gmail.com">rich.dsz1997@gmail.com</a>
                      </div>
                    </div>

                    <AnimatePresence>
                      {contactStatusMessage && (
                        <motion.p
                          key="contact-status-msg"
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.3 }}
                          className={`contact-form-status ${contactStatus === 'error' ? 'is-error' : 'is-success'}`}
                          role={contactStatus === 'error' ? 'alert' : 'status'}
                          aria-live="polite"
                        >
                          {contactStatusMessage}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </CinematicSection>
      </main>

      <CinematicSection type="footer" className="portfolio-footer">
        <div className="portfolio-container footer-body-wrapper">
          {/* Main Tier: Brand & Role on Left, Refined Link Pills on Right */}
          <div className="footer-main-row">
            {/* Brand & Identity */}
            <div className="footer-brand-block">
              <a href="#home" className="footer-brand-title group">
                <span className="footer-brand-monogram">RD</span>
                <span className="footer-brand-name">{profile?.full_name || "Richard D'Souza"}</span>
                <span className="footer-brand-dot" aria-hidden="true" />
              </a>

              <p className="footer-brand-tagline">
                <span className="footer-tagline-role">{profile?.professional_title || 'Software Developer'}</span>
                <span className="footer-tagline-bullet" aria-hidden="true">•</span>
                Crafting dependable digital products with clean architecture.
              </p>
            </div>

            {/* Direct Connect & Action Links */}
            <div className="footer-links-group" aria-label="Social and professional links">
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
                title="Send direct email"
                aria-label="Send direct email"
              >
                <Send size={13} aria-hidden="true" />
                <span>Email</span>
              </a>

              <Link to="/request-resume" onClick={saveScrollPosition} className="footer-resume-pill group" title="Request Resume">
                <span>Resume</span>
                <ArrowUpRight size={13} className="footer-resume-icon" aria-hidden="true" />
              </Link>
            </div>
          </div>

          {/* Clean Bottom Colophon */}
          <div className="footer-bottom-divider" aria-hidden="true" />
          <div className="footer-bottom-content">
            <p className="footer-copyright">
              © {new Date().getFullYear()}{' '}
              <span className="footer-copyright-name">{profile?.full_name || "Richard D'Souza"}</span>. All rights reserved.
            </p>

            <a
              href="#home"
              className="footer-back-to-top group"
              onClick={(e) => {
                e.preventDefault()
                const target = e.currentTarget
                target.classList.add('is-launching')
                smoothScrollToTop(() => {
                  target.classList.remove('is-launching')
                })
              }}
            >
              <span>Back to top</span>
              <ArrowUp size={13} className="footer-back-icon" aria-hidden="true" />
            </a>
          </div>
        </div>
      </CinematicSection>
    </div>
  )
}

function AnimatedRoutes() {
  const location = useLocation()

  useEffect(() => {
    // When navigating to subpages (like /projects/:slug or /request-resume), always start at top
    if (location.pathname !== '/') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    }
  }, [location.pathname])

  return (
    <>
      <ScrollProgress />
      <GlobalBackToTop />
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
    </>
  )
}

export default function App() {
  const [preloaderActive, setPreloaderActive] = useState(true)

  return (
    <>
      <AnimatePresence mode="wait">
        {preloaderActive && (
          <PortfolioPreloader onComplete={() => setPreloaderActive(false)} />
        )}
      </AnimatePresence>
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </>
  )
}
