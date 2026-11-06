import PortfolioPreloader from './components/PortfolioPreloader'

import { useEffect, useRef, useState, type FormEvent } from 'react'
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
  ChevronDown,
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
  DEFAULT_HERO_CONSOLE,
} from './lib/profile'
import {
  parseMilestoneCards,
} from './lib/milestoneCards'
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
  const location = useLocation()
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
  const [heroConsoleTab, setHeroConsoleTab] = useState<'developer' | 'stack' | 'terminal'>('developer')

  const heroConsole = profile?.hero_console || DEFAULT_HERO_CONSOLE
  const isLearning = heroConsole.developer?.learning ?? true
  const isAvailable = heroConsole.developer?.available ?? true
  const stackGroups = heroConsole.stack?.groups?.length
    ? heroConsole.stack.groups
    : DEFAULT_HERO_CONSOLE.stack.groups
  const totalTechnologiesCount = stackGroups.reduce(
    (acc, g) => acc + (g.technologies?.length || 0),
    0
  )
  const termPromptUser = heroConsole.terminal?.prompt_user || 'richard@macbook'
  const termCommand = heroConsole.terminal?.command || 'richard --status'
  const termRole = heroConsole.terminal?.role || profile?.professional_title || 'Software Developer'
  const termEducation = heroConsole.terminal?.education || 'MSc in Information Technology'
  const termLocation = heroConsole.terminal?.location || (profile?.location ? `${profile.location} (UTC +5:30)` : 'Goa, India (UTC +5:30)')
  const termFocus = heroConsole.terminal?.focus || 'Full-Stack Web, Cloud & AI Systems'
  const termAvailability = heroConsole.terminal?.availability || 'Open to Roles & Projects'
  const footerStatusText = heroConsole.footer?.status_text || 'Always building'
  const footerSubline = heroConsole.footer?.subline || 'Learning. Creating. Improving.'
  const footerBranch = heroConsole.footer?.branch || 'git:(main)'

  type TerminalHistoryItem = {
    id: string
    command: string
    output: React.ReactNode
  }

  const [terminalHistory, setTerminalHistory] = useState<TerminalHistoryItem[]>([])
  const [terminalInput, setTerminalInput] = useState('')
  const terminalInputRef = useRef<HTMLInputElement>(null)
  const terminalConsoleRef = useRef<HTMLDivElement>(null)

  const executeTerminalCommand = (rawCommand: string) => {
    const trimmed = rawCommand.trim()
    if (!trimmed) return

    const lower = trimmed.toLowerCase()

    if (lower === 'clear') {
      setTerminalHistory([])
      setTerminalInput('')
      return
    }

    let outputNode: React.ReactNode = null

    if (lower === 'help') {
      outputNode = (
        <div className="hero-term-help-output space-y-1 text-zinc-300">
          <p className="text-zinc-400 font-semibold mb-1">Available commands:</p>
          <div className="grid grid-cols-[85px_1fr] gap-x-2 gap-y-1 font-mono text-[11px]">
            <span className="text-cyan-400 font-semibold">skills</span>
            <span className="text-zinc-300">View core technical stack</span>
            <span className="text-cyan-400 font-semibold">projects</span>
            <span className="text-zinc-300">Jump to featured projects &amp; code</span>
            <span className="text-cyan-400 font-semibold">contact</span>
            <span className="text-zinc-300">Smoothly scroll to contact &amp; hire</span>
            <span className="text-cyan-400 font-semibold">coffee</span>
            <span className="text-zinc-300">Brew fresh developer energy</span>
            <span className="text-cyan-400 font-semibold">sudo</span>
            <span className="text-zinc-300">Attempt superuser privileges</span>
            <span className="text-cyan-400 font-semibold">clear</span>
            <span className="text-zinc-300">Clear custom terminal output</span>
          </div>
        </div>
      )
    } else if (lower === 'coffee') {
      outputNode = (
        <p className="text-amber-300 font-medium font-mono text-[11.5px]">
          ☕ Brewing dark roast... 100% [Done]. Enjoy!
        </p>
      )
    } else if (lower === 'sudo' || lower.startsWith('sudo ')) {
      outputNode = (
        <p className="text-rose-400 font-medium font-mono text-[11.5px]">
          🛡️ Nice try! Permission denied: Richard is root here 😉
        </p>
      )
    } else if (lower === 'contact') {
      outputNode = (
        <p className="text-emerald-400 font-medium font-mono text-[11.5px]">
          🚀 Scrolling to contact section...
        </p>
      )
      setTimeout(() => {
        document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
      }, 250)
    } else if (lower === 'projects') {
      outputNode = (
        <p className="text-cyan-400 font-medium font-mono text-[11.5px]">
          🚀 Scrolling to projects section...
        </p>
      )
      setTimeout(() => {
        document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })
      }, 250)
    } else if (lower === 'skills') {
      outputNode = (
        <div className="space-y-1 text-zinc-300 font-mono text-[11px]">
          <p className="text-zinc-400 font-semibold">⚡ Technical Skills Stack:</p>
          <p><span className="text-violet-400 font-semibold">Frontend:</span> React, TypeScript, Next.js, Tailwind CSS</p>
          <p><span className="text-cyan-400 font-semibold">Backend:</span> Node.js, Express, PostgreSQL, MongoDB, Supabase</p>
          <p><span className="text-emerald-400 font-semibold">Cloud &amp; DevOps:</span> Docker, Git, CI/CD, REST &amp; AI APIs</p>
        </div>
      )
    } else {
      outputNode = (
        <p className="text-red-400 font-mono text-[11px]">
          zsh: command not found: <span className="text-white font-semibold">{trimmed}</span>. Type <span className="text-cyan-300 font-semibold">'help'</span> for available commands.
        </p>
      )
    }

    setTerminalHistory((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random()}`,
        command: trimmed,
        output: outputNode,
      },
    ])
    setTerminalInput('')

    setTimeout(() => {
      if (terminalConsoleRef.current) {
        terminalConsoleRef.current.scrollTop = terminalConsoleRef.current.scrollHeight
      }
    }, 60)
  }

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

  // Continuously record home scroll position and set flag on unmount
  useEffect(() => {
    const handleScroll = () => {
      sessionStorage.setItem('portfolio_home_scroll', window.scrollY.toString())
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      sessionStorage.setItem('portfolio_restore_pending', 'true')
      sessionStorage.setItem('portfolio_home_scroll', window.scrollY.toString())
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // Exact-spot scroll restoration engine
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
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

    // Explicit scroll reset (e.g. user clicked RD logo in header)
    if (location.state && typeof location.state === 'object' && 'resetScroll' in location.state) {
      sessionStorage.removeItem('portfolio_restore_pending')
      sessionStorage.setItem('portfolio_home_scroll', '0')
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
      window.dispatchEvent(new Event('scroll'))
      return
    }

    // Explicit in-page hash navigation (e.g. user clicked #projects or #contact in nav)
    if (location.hash) {
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
              className="rounded-lg border border-white/10 p-2 text-zinc-300 hover:text-white md:hidden inline-flex items-center justify-center shrink-0"
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
        <section
          id="home"
          className="hero-section relative flex scroll-mt-20 items-center"
        >
          <div className="portfolio-container relative grid w-full items-center gap-10 pb-12 pt-24 sm:pt-28 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16">
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
                <span>Engineering scalable web applications & modern software</span>
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
                            <span className="hero-code-value">{isLearning ? 'true' : 'false'}</span>
                            <span className="text-zinc-500">,</span>
                          </p>
                          <p className="hero-code-line">
                            <span className="hero-code-key">available</span>
                            <span className="hero-code-colon">:</span>{' '}
                            <span className="hero-code-value">{isAvailable ? 'true' : 'false'}</span>
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
                      {stackGroups.map((group, groupIdx) => {
                        const dotClass =
                          group.color === 'emerald'
                            ? 'bg-emerald-400'
                            : group.color === 'violet'
                            ? 'bg-violet-400'
                            : group.color === 'amber'
                            ? 'bg-amber-400'
                            : 'bg-cyan-400'

                        return (
                          <div className="hero-stack-group" key={`${group.title}-${groupIdx}`}>
                            <div className="hero-stack-group-title">
                              <span className={`hero-stack-dot ${dotClass}`} />
                              <span>{group.title}</span>
                            </div>
                            <div className="hero-stack-chips">
                              {group.technologies.map((tech) => {
                                const BrandIcon = getTechnologyIcon(tech)
                                const FallbackIcon = technologyLucideIconMap[tech] || Code2
                                const brandColor = technologyBrandColorMap[tech] || (group.color === 'emerald' ? '#4ade80' : group.color === 'violet' ? '#a78bfa' : '#38bdf8')
                                return (
                                  <span className="hero-stack-chip" key={tech}>
                                    {BrandIcon ? (
                                      <BrandIcon style={{ color: brandColor }} />
                                    ) : (
                                      <FallbackIcon style={{ color: brandColor }} />
                                    )}
                                    <span>{tech}</span>
                                  </span>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    <div className="hero-editor-statusbar" aria-hidden="true">
                      <div className="flex items-center gap-2">
                        <span className="hero-status-pill text-cyan-400">JSON</span>
                        <span className="text-zinc-400 hero-status-utf8">UTF-8</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-cyan-400 font-medium">{totalTechnologiesCount} Technologies</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 3: terminal.sh Live Output */}
                {heroConsoleTab === 'terminal' && (
                  <div
                    className="hero-terminal-panel"
                    key="terminal"
                    onClick={() => terminalInputRef.current?.focus()}
                  >
                    <div className="hero-terminal-console" ref={terminalConsoleRef}>
                      <div className="hero-terminal-prompt">
                        <span className="hero-terminal-user">{termPromptUser}</span>
                        <span className="hero-terminal-sep">:</span>
                        <span className="hero-terminal-path">~</span>
                        <span className="hero-terminal-dollar">$</span>
                        <span className="hero-terminal-cmd">{termCommand}</span>
                      </div>

                      <div className="hero-terminal-output">
                        <p><span className="text-emerald-400 font-bold">✔</span> <span className="text-zinc-400">role</span>: <span className="text-violet-300 font-medium">{termRole}</span></p>
                        <p><span className="text-emerald-400 font-bold">✔</span> <span className="text-zinc-400">education</span>: <span className="text-zinc-200">{termEducation}</span></p>
                        <p><span className="text-emerald-400 font-bold">✔</span> <span className="text-zinc-400">location</span>: <span className="text-zinc-200">{termLocation}</span></p>
                        <p><span className="text-emerald-400 font-bold">✔</span> <span className="text-zinc-400">focus</span>: <span className="text-cyan-300">{termFocus}</span></p>
                        <p><span className="text-emerald-400 font-bold">✔</span> <span className="text-zinc-400">availability</span>: <span className="text-emerald-300 font-semibold">{termAvailability}</span></p>
                      </div>

                      {/* Custom User Commands History */}
                      {terminalHistory.map((item) => (
                        <div key={item.id} className="hero-terminal-history-entry">
                          <div className="hero-terminal-prompt">
                            <span className="hero-terminal-user">{termPromptUser}</span>
                            <span className="hero-terminal-sep">:</span>
                            <span className="hero-terminal-path">~</span>
                            <span className="hero-terminal-dollar">$</span>
                            <span className="hero-terminal-cmd">{item.command}</span>
                          </div>
                          <div className="hero-terminal-cmd-output">
                            {item.output}
                          </div>
                        </div>
                      ))}

                      {/* Interactive Active Prompt Form */}
                      <form
                        onSubmit={(e) => {
                          e.preventDefault()
                          executeTerminalCommand(terminalInput)
                        }}
                        className="hero-terminal-prompt hero-terminal-active-line"
                      >
                        <span className="hero-terminal-user">{termPromptUser}</span>
                        <span className="hero-terminal-sep">:</span>
                        <span className="hero-terminal-path">~</span>
                        <span className="hero-terminal-dollar">$</span>
                        <div className="hero-terminal-input-container">
                          <input
                            ref={terminalInputRef}
                            type="text"
                            value={terminalInput}
                            onChange={(e) => setTerminalInput(e.target.value)}
                            placeholder="type 'help' or click to run commands..."
                            className="hero-terminal-input"
                            autoComplete="off"
                            autoCapitalize="off"
                            spellCheck="false"
                            aria-label="Terminal command prompt"
                          />
                          <span className="hero-terminal-cursor" aria-hidden="true">█</span>
                        </div>
                      </form>

                      {/* Clickable Quick Command Chips */}
                      <div className="hero-terminal-chips-bar" aria-label="Quick commands">
                        <span className="hero-terminal-chips-label">Try:</span>
                        {(['help', 'coffee', 'projects', 'contact', 'clear'] as const).map((cmd) => (
                          <button
                            key={cmd}
                            type="button"
                            className="hero-terminal-action-chip"
                            onClick={(e) => {
                              e.stopPropagation()
                              executeTerminalCommand(cmd)
                            }}
                          >
                            {cmd}
                          </button>
                        ))}
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
                        {footerStatusText}
                      </p>
                    </div>
                    <p className="mt-0.5 text-xs text-zinc-400 flex items-center gap-2 hero-profile-footer-sub">
                      <span>{footerSubline}</span>
                      <span className="inline-block w-1 h-1 rounded-full bg-zinc-500 hero-profile-footer-dot" />
                      <span className="inline-flex items-center gap-1 font-mono text-[11px] text-violet-400">
                        {footerBranch}
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
    className="portfolio-container"
    variants={sectionReveal}
    initial={false}
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
      initial={false}
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
                        const milestoneCards = parseMilestoneCards(profile.biography)

                        const iconMap = {
                          code: Code2,
                          education: GraduationCap,
                          layers: Layers,
                          sparkles: Sparkles,
                          terminal: Terminal,
                          shield: ShieldCheck,
                        }

                        const colorMap: Record<string, string> = {
                          emerald: 'text-emerald-400',
                          cyan: 'text-cyan-400',
                          violet: 'text-violet-400',
                          amber: 'text-amber-400',
                          rose: 'text-rose-400',
                          blue: 'text-blue-400',
                        }

                        const dotColorMap: Record<string, string> = {
                          emerald: '#34d399',
                          cyan: '#22d3ee',
                          violet: '#a78bfa',
                          amber: '#fbbf24',
                          rose: '#fb7185',
                          blue: '#60a5fa',
                        }

                        return milestoneCards.map((card, index) => {
                          const StepIcon = iconMap[card.icon] || Code2
                          const colorClass = colorMap[card.color] || 'text-emerald-400'
                          const dotColor = dotColorMap[card.color] || '#a78bfa'

                          return (
                            <div key={card.id || index} className="about-timeline-item">
                              <span
                                className="about-timeline-dot"
                                style={{ background: dotColor, boxShadow: `0 0 8px ${dotColor}` }}
                                aria-hidden="true"
                              />
                              <div className="about-timeline-card">
                                <div className="about-timeline-card-header">
                                  <span className={`about-timeline-tag ${colorClass}`}>
                                    <StepIcon size={13} className="shrink-0" />
                                    <span>{card.title}</span>
                                  </span>
                                </div>
                                <p className="about-timeline-text">{card.content}</p>
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

            <Link to="/request-resume" onClick={saveScrollPosition} className="about-cta-resume">
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
  <div className="portfolio-container">
    <motion.div
      className="section-heading skills-heading"
      variants={sectionReveal}
      initial={false}
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
      initial={false}
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
            whileHover={prefersReducedMotion ? undefined : { y: -6, scale: 1.01 }}
            whileTap={prefersReducedMotion ? undefined : { scale: 0.99 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <div className="skill-card-glow" />
            <div className="skill-card-aura" />
            <div className="skill-card-header">
              <div className="skill-icon">
                <Icon size={20} aria-hidden="true" />
              </div>
              <div className="flex items-center gap-2">
                <span className="skill-card-count">{skill.technologies.length} tools</span>
                <span className="skill-card-index">{String(skillIndex + 1).padStart(2, '0')}</span>
              </div>
            </div>

            <h3 className="skill-card-title">{skill.name}</h3>

            <div className="skill-tags">
              {skill.technologies.map((technology) => {
                const TechnologyIcon = technology.icon
                const tone = technologyToneMap[technology.name] ?? normalizeTechnologyName(technology.name)

                return (
                  <motion.span
                    className={`technology-tag technology-${tone}`}
                    key={technology.name}
                    whileHover={prefersReducedMotion ? undefined : { y: -2, scale: 1.04 }}
                    transition={{ duration: 0.15 }}
                  >
                    <TechnologyIcon size={14} className="shrink-0" aria-hidden="true" />
                    <span>{technology.name}</span>
                  </motion.span>
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
          <div className="portfolio-container">
            <motion.div
              className="projects-heading-row"
              variants={sectionReveal}
              initial={false}
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
              className="projects-grid"
              variants={sectionStagger}
              initial={false}
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
                      <Link to={`/projects/${project.slug}`} onClick={saveScrollPosition} className="project-details-link">
                        View details <ArrowUpRight size={15} />
                      </Link>
                      <div className="project-card-quick-actions">
                        {project.demoVideo && (
                          <Link to={`/projects/${project.slug}#demo`} onClick={saveScrollPosition} className="project-quick-action">
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
          <div className="portfolio-container">
            <motion.div
              className="section-heading contact-heading"
              variants={sectionReveal}
              initial={false}
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
              initial={false}
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
            >
              {/* Interactive Contact Form Card */}
              <motion.div className="contact-form-card" variants={sectionReveal}>
                <div className="contact-form-header">
                  <div className="contact-badge">
                    <Send size={14} className="text-violet-400" />
                    <span>Send a Message</span>
                  </div>
                  <span className="contact-response-badge">Direct to Inbox</span>
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
                        rows={5}
                        placeholder="Share details about your project, engineering requirements, or opportunity..."
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
              </motion.div>

              {/* Social Profiles Bento Grid */}
              <motion.div className="contact-social-grid mt-6" variants={sectionReveal}>
                <a
                  href={profile?.github_url || 'https://github.com/aestheticwolf'}
                  target="_blank"
                  rel="noreferrer"
                  className="contact-social-card group"
                >
                  <div className="contact-social-icon">
                    <FaGithub size={20} />
                  </div>
                  <div className="contact-social-text">
                    <strong>GitHub</strong>
                    <span>Code & Projects</span>
                  </div>
                  <ArrowUpRight size={16} className="contact-social-arrow" />
                </a>

                <a
                  href={profile?.linkedin_url || 'https://www.linkedin.com/'}
                  target="_blank"
                  rel="noreferrer"
                  className="contact-social-card group"
                >
                  <div className="contact-social-icon">
                    <FaLinkedinIn size={19} />
                  </div>
                  <div className="contact-social-text">
                    <strong>LinkedIn</strong>
                    <span>Professional Network</span>
                  </div>
                  <ArrowUpRight size={16} className="contact-social-arrow" />
                </a>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="portfolio-footer">
        <div className="footer-glow-bar" aria-hidden="true" />
        <div className="portfolio-container flex flex-col lg:flex-row lg:items-start lg:justify-between gap-10">
          <div className="footer-brand max-w-md">
            <a href="#home" className="footer-brand-title">
              <span>{profile?.full_name || "Richard D'Souza"}</span>
              <span className="footer-brand-dot" aria-hidden="true" />
            </a>
            <p className="footer-brand-tagline">
              {profile?.professional_title || 'Software Developer'} • Engineering scalable web applications with clean code & modern architecture.
            </p>
            <div className="footer-status-badge">
              <span className="footer-status-dot" aria-hidden="true" />
              <span>Available for engineering opportunities</span>
            </div>
          </div>

          <div className="footer-right-cluster">
            <nav className="footer-nav" aria-label="Footer navigation">
              {navigation.map((item) => (
                <a key={item.label} href={item.href} className="footer-nav-link">
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="footer-actions">
              <Link to="/request-resume" onClick={saveScrollPosition} className="footer-resume-btn">
                <span>Request Resume</span>
                <ArrowUpRight size={13} aria-hidden="true" />
              </Link>
              <a
                href={profile?.github_url || 'https://github.com/aestheticwolf'}
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub Profile"
                className="footer-social-btn"
                title="GitHub"
              >
                <FaGithub size={16} aria-hidden="true" />
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
                <FaLinkedinIn size={15} aria-hidden="true" />
                <span className="footer-social-label">LinkedIn</span>
              </a>
            </div>
          </div>
        </div>
        <div className="footer-bottom portfolio-container mt-10">
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
