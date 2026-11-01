
import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import {
  ArrowDown,
  ArrowUpRight,
  ExternalLink,
  Mail,
  Menu,
  X,
  Code2,
  Cloud,
  Compass,
  MapPin,
  ShieldCheck,
} from 'lucide-react'
import { FaGithub, FaLinkedinIn } from 'react-icons/fa'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import ProjectDetails from './pages/ProjectDetails'
import ThemeToggle from './components/ThemeToggle'
import {
  getPublishedProjects,
  type PortfolioProject,
} from './lib/projects'
import {
  getPublishedProfile,
  type PublicProfile,
} from './lib/profile'

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
    detail: 'React · TypeScript · HTML · CSS',
    icon: Code2,
  },
  {
    name: 'Backend Development',
    detail: 'Node.js · Express · REST APIs',
    icon: Code2,
  },
  {
    name: 'Cloud & Deployment',
    detail: 'Firebase · Supabase · Vercel',
    icon: Cloud,
  },
  {
    name: 'Security Fundamentals',
    detail: 'Authentication · Authorization · Firewalls',
    icon: ShieldCheck,
  },
]




const reveal = {
  hidden: {
    opacity: 0,
    y: 18,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: "easeOut" as const,
    },
  },
};

const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};





function Home() {
  const prefersReducedMotion = useReducedMotion() ?? false
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  const [projects, setProjects] = useState<PortfolioProject[]>([])
  const [projectsLoading, setProjectsLoading] = useState(true)
  const [projectsError, setProjectsError] = useState('')
  const [brokenProjectImages, setBrokenProjectImages] = useState<string[]>([])
  const [profile, setProfile] = useState<PublicProfile | null>(null)
  const [profileError, setProfileError] = useState('')
  const [aboutExpanded, setAboutExpanded] = useState(false)

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
      <div className="portfolio-motion-layer" aria-hidden="true">
        <span className="portfolio-orb portfolio-orb-one" />
        <span className="portfolio-orb portfolio-orb-two" />
        <span className="portfolio-grid-glow" />
      </div>
      <header className="portfolio-nav fixed inset-x-0 top-0 z-50 border-b border-white/7 bg-[#08090d]/85 backdrop-blur-xl">
        <nav className="mx-auto flex h-19 max-w-7xl items-center justify-between px-6 lg:px-10">
          <a
            href="#home"
            className="portfolio-nav-logo text-lg font-bold tracking-tight"
          >
            RD<span className="text-violet-400">.</span>
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
          className="hero-section relative flex min-h-screen scroll-mt-20 items-center"
        >
          <div className="relative mx-auto grid w-full max-w-7xl items-center gap-14 px-6 pb-20 pt-32 sm:pt-36 lg:grid-cols-[1.08fr_0.92fr] lg:gap-20 lg:px-10">
            <motion.div
              className="hero-copy"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <div className="hero-status">
                <span className="hero-status-dot" />
                {profile?.professional_title || 'Software Developer'} Portfolio
              </div>

              <p className="hero-kicker">
                Hello, I'm
              </p>

              <h1 className="hero-title">
                {(profile?.full_name || "Richard D'Souza").split(' ')[0]}
                <span>
                  {(profile?.full_name || "Richard D'Souza")
                    .split(' ')
                    .slice(1)
                    .join(' ')}
                  .
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
              transition={{ duration: 0.5, delay: prefersReducedMotion ? 0 : 0.08, ease: 'easeOut' }}
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
                <div className="hero-profile-heading">
                  <span className="hero-profile-label">
                    Developer profile
                  </span>
                  <span className="hero-profile-markers" aria-hidden="true">
                    <i /> <i /> <i />
                  </span>
                </div>

                <div className="hero-code-panel">
                  <p className="text-zinc-500">
                    // A little about me
                  </p>

                  <p>
                    <span className="text-violet-300">const</span>{' '}
                    developer = {'{'}
                  </p>

                  <p className="pl-4">name: <span className="text-emerald-300">'{profile?.full_name || "Richard D'Souza"}'</span>,</p>
                  <p className="pl-4">
                    focus: <span className="text-emerald-300">'{profile?.professional_title || 'Software'}'</span>,
                  </p>

                  <p className="pl-4">interests: [</p>
                  {(profile?.interests ?? []).map((interest, index) => (
                    <p className="pl-8 text-blue-300" key={`${interest}-${index}`}>
                      '{interest}'{index < (profile?.interests.length ?? 0) - 1 ? ',' : ''}
                    </p>
                  ))}
                  <p className="pl-4">],</p>

                  <p className="pl-4">
                    learning:{' '}
                    <span className="text-emerald-300">true</span>
                  </p>

                  <p>{'}'}</p>
                </div>

                <div className="hero-profile-footer">
                  <div>
                    <p className="text-sm font-medium">
                      Always building
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      Learning. Creating. Improving.
                    </p>
                  </div>

                  <Code2 className="text-violet-300" size={22} />
                </div>
              </motion.div>
            </motion.div>
          </div>

          <a
            href="#about"
            aria-label="Scroll to About"
            className="hero-scroll-cue"
          >
            <ArrowDown size={18} />
          </a>
        </section>


<section
  id="about"
  className="about-section scroll-mt-24 border-t border-white/6 py-24 sm:py-32"
>
  <motion.div
    className="mx-auto max-w-7xl px-6 lg:px-10"
    variants={reveal}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.2 }}
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
      variants={stagger}
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
        <motion.div className="about-story" variants={reveal}>
          {profile.short_intro && <p className="about-intro">{profile.short_intro}</p>}
          {profile.biography && <p className={`about-biography ${aboutExpanded ? 'is-expanded' : ''}`}>{profile.biography}</p>}
          {profile.secondary_biography && aboutExpanded && <p className="about-secondary">{profile.secondary_biography}</p>}
          {(profile.biography || profile.secondary_biography) && (
            <button
              type="button"
              className="about-expand-button"
              onClick={() => setAboutExpanded((expanded) => !expanded)}
              aria-expanded={aboutExpanded}
            >
              {aboutExpanded ? 'Show less' : 'Read full profile'}
              <ArrowUpRight size={16} aria-hidden="true" />
            </button>
          )}
        </motion.div>
      ) : (
        !profileError && (
          <p className="text-lg leading-8 text-zinc-500">
            Profile information will be available soon.
          </p>
        )
      )}

      <motion.aside className="about-facts" variants={stagger} aria-label="Professional profile details">
        {profile?.professional_title && (
          <motion.div className="about-fact-card" variants={reveal}>
            <Code2 size={20} aria-hidden="true" />
            <div><span>Professional focus</span><strong>{profile.professional_title}</strong></div>
          </motion.div>
        )}
        {profile?.location && (
          <motion.div className="about-fact-card" variants={reveal}>
            <MapPin size={20} aria-hidden="true" />
            <div><span>Based in</span><strong>{profile.location}</strong></div>
          </motion.div>
        )}
        {profile?.interests && profile.interests.length > 0 && (
          <motion.div className="about-interests-card" variants={reveal}>
            <Compass size={20} aria-hidden="true" />
            <div>
              <span>Areas of interest</span>
              <div className="about-interest-tags">
                {profile.interests.map((interest) => <em key={interest}>{interest}</em>)}
              </div>
            </div>
          </motion.div>
        )}
      </motion.aside>
    </motion.div>
  </motion.div>
</section>



<section
  id="skills"
  className="skills-section scroll-mt-24 border-t border-white/6 py-24 sm:py-32"
>
  <div className="mx-auto max-w-7xl px-6 lg:px-10">
    <motion.div
      className="section-heading skills-heading"
      variants={reveal}
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
      variants={stagger}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      {skills.map((skill) => {
        const Icon = skill.icon

        return (
          <motion.div
            key={skill.name}
            variants={reveal}
            className="skill-card"
          >
            <div className="skill-card-header">
              <div className="skill-icon"><Icon size={21} aria-hidden="true" /></div>
              <span className="skill-card-index">0{skills.indexOf(skill) + 1}</span>
            </div>

            <h3>{skill.name}</h3>

            <div className="skill-tags">
              {skill.detail.split(' · ').map((technology) => <span key={technology}>{technology}</span>)}
            </div>
          </motion.div>
        )
      })}
    </motion.div>
  </div>
</section>


        <section
          id="projects"
          className="projects-section scroll-mt-24 border-t border-white/6 py-24 sm:py-32"
        >
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <motion.div
              className="projects-heading-row"
              variants={reveal}
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
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
            >
              {!projectsLoading && !projectsError && projects.map((project) => (
                <motion.article
                  key={project.id}
                  variants={reveal}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.1 }}
                  className="project-card"
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
                    <p>{project.description}</p>
                    <div className="project-stack" aria-label={`${project.name} technology stack`}>
                      {project.stack.map((technology) => <span key={technology}>{technology}</span>)}
                    </div>
                    <div className="project-card-actions">
                      <Link to={`/projects/${project.slug}`} className="project-details-link">
                        View details <ArrowUpRight size={15} />
                      </Link>
                      <div className="project-external-links">
                        {project.github && (
                          <a href={project.github} target="_blank" rel="noreferrer" aria-label={`Open ${project.name} repository`}>
                            <FaGithub size={17} />
                          </a>
                        )}
                        {project.liveUrl && (
                          <a href={project.liveUrl} target="_blank" rel="noreferrer" aria-label={`Open ${project.name} live application`}>
                            <ExternalLink size={17} />
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
          className="contact-section scroll-mt-24 border-t border-white/6 py-24 sm:py-32"
        >
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <motion.div
              className="contact-panel"
              variants={reveal}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              <div className="contact-copy">
                <p className="section-label">04 / CONTACT</p>
                <h2>Let&apos;s build something with intention.</h2>
                <p>
                  I&apos;m open to meaningful conversations with recruiters, teams, and collaborators who value thoughtful software.
                </p>
                <a href="mailto:YOUR_EMAIL@example.com" className="contact-primary-action">
                  <Mail size={17} />
                  Get in touch
                  <ArrowUpRight size={17} />
                </a>
                <p className="contact-placeholder-note">Replace the placeholder email before publishing.</p>
              </div>

              <aside className="contact-aside" aria-label="Other ways to connect">
                <p>Elsewhere</p>
                <a href={profile?.github_url || 'https://github.com/aestheticwolf'} target="_blank" rel="noreferrer">
                  <FaGithub size={19} /> GitHub <ArrowUpRight size={15} />
                </a>
                <a href={profile?.linkedin_url || 'https://www.linkedin.com/'} target="_blank" rel="noreferrer">
                  <FaLinkedinIn size={18} /> LinkedIn <ArrowUpRight size={15} />
                </a>
                {profile?.location && <span>Based in {profile.location}</span>}
              </aside>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="portfolio-footer border-t border-white/6 px-6 py-10 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1.2fr_1fr_auto] md:items-start">
          <div className="footer-brand">
            <a href="#home">{profile?.full_name || "Richard D'Souza"}<span>.</span></a>
            <p>Software Developer</p>
          </div>
          <nav className="footer-nav" aria-label="Footer navigation">
            {navigation.map((item) => <a key={item.label} href={item.href}>{item.label}</a>)}
          </nav>
          <div className="footer-socials">
            <a href={profile?.github_url || 'https://github.com/aestheticwolf'} target="_blank" rel="noreferrer" aria-label="GitHub"><FaGithub size={18} /></a>
            <a href={profile?.linkedin_url || 'https://www.linkedin.com/'} target="_blank" rel="noreferrer" aria-label="LinkedIn"><FaLinkedinIn size={17} /></a>
          </div>
        </div>
        <div className="footer-bottom mx-auto mt-8 max-w-7xl">
          <p>© {new Date().getFullYear()} Richard D&apos;Souza. All rights reserved.</p>
          <a href="#home">Back to top <ArrowUpRight size={14} /></a>
        </div>
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
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
    </BrowserRouter>
  )
}
