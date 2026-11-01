
import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import {
  ArrowDown,
  ArrowUpRight,
  Mail,
  Menu,
  X,
  Code2,
  Cloud,
  ShieldCheck,
} from 'lucide-react'
import { FaGithub, FaLinkedinIn } from 'react-icons/fa'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import ProjectDetails from './pages/ProjectDetails'
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
    y: 28,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
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
  const [menuOpen, setMenuOpen] = useState(false)
  const [projects, setProjects] = useState<PortfolioProject[]>([])
  const [projectsLoading, setProjectsLoading] = useState(true)
  const [projectsError, setProjectsError] = useState('')
  const [profile, setProfile] = useState<PublicProfile | null>(null)
const [profileError, setProfileError] = useState('')

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
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/7 bg-[#08090d]/85 backdrop-blur-xl">
        <nav className="mx-auto flex h-19 max-w-7xl items-center justify-between px-6 lg:px-10">
          <a
            href="#home"
            className="text-lg font-bold tracking-tight"
          >
            RD<span className="text-violet-400">.</span>
          </a>

          <div className="hidden items-center gap-8 md:flex">
            {navigation.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm text-zinc-400 transition hover:text-white"
              >
                {item.label}
              </a>
            ))}
          </div>

          <a
            href="#contact"
            className="hidden items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm transition hover:border-violet-400 hover:bg-violet-400/10 sm:flex"
          >
            Let's connect <ArrowUpRight size={16} />
          </a>

          <button
            type="button"
            aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-lg border border-white/10 p-2 md:hidden"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </nav>

        {menuOpen && (
          <div className="border-t border-white/10 bg-[#08090d] px-6 py-4 md:hidden">
            {navigation.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="block py-3 text-zinc-300 transition hover:text-white"
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
          className="relative flex min-h-screen scroll-mt-20 items-center"
        >
          <div className="pointer-events-none absolute -top-40 right-[-10%] h-130 w-130 rounded-full bg-violet-600/13 blur-[130px]" />

          <div className="pointer-events-none absolute bottom-0 left-[-10%] h-87.5 w-87.5 rounded-full bg-blue-600/10 blur-[120px]" />

          <div className="relative mx-auto grid w-full max-w-7xl items-center gap-14 px-6 pb-20 pt-36 lg:grid-cols-[1.25fr_0.75fr] lg:px-10">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/6 px-4 py-2 text-sm text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                {profile?.professional_title || 'Software Developer'} Portfolio
              </div>

              <p className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-violet-300">
                Hello, I'm
              </p>

              <h1 className="max-w-3xl text-5xl font-semibold leading-[1.08] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
  {(profile?.full_name || "Richard D'Souza").split(' ')[0]}
  <br />
  <span className="neon-text">
    {(profile?.full_name || "Richard D'Souza")
      .split(' ')
      .slice(1)
      .join(' ')}
    .
  </span>
</h1>

              <p className="mt-7 max-w-xl text-lg leading-8 text-zinc-400">
  {profile?.short_intro ||
    'I build modern digital experiences, practical software applications, and explore AI-powered solutions.'}
</p>

              <div className="mt-9 flex flex-wrap gap-4">
                <a
                  href="#projects"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-black transition hover:bg-violet-200"
                >
                  Explore my work <ArrowUpRight size={17} />
                </a>

                <a
                  href="#contact"
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3.5 text-sm font-medium transition hover:border-violet-400/60 hover:bg-white/4"
                >
                  Get in touch
                </a>
              </div>

              <div className="mt-10 flex items-center gap-5">
                <a
                 href={profile?.github_url || 'https://github.com/aestheticwolf'}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="GitHub"
                  className="text-zinc-400 transition hover:text-white"
                >
                  <FaGithub size={21} />
                </a>

<a
  href={profile?.linkedin_url || 'https://www.linkedin.com/'}
  target="_blank"
  rel="noreferrer"
  aria-label="LinkedIn"
  className="text-zinc-400 transition hover:text-white"
>
  <FaLinkedinIn size={21} />
</a>

                <span className="h-5 w-px bg-white/15" />

               <span className="text-sm text-zinc-500">
  Based in {profile?.location || 'India'}
</span>
              </div>
              </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative mx-auto w-full max-w-md"
            >
              <div className="absolute -inset-4 rounded-4xl bg-linear-to-br from-violet-500/20 via-transparent to-blue-500/20 blur-2xl" />

              {profile?.profile_image_url && (
  <div className="relative mx-auto mb-10 flex w-full justify-center">
    {/* Soft ambient glow */}
    <div className="absolute h-64 w-64 rounded-full bg-violet-500/20 blur-3xl sm:h-72 sm:w-72" />

    {/* Gradient circular border */}
    <div className="relative h-52 w-52 rounded-full bg-linear-to-br from-violet-400 via-blue-500 to-violet-600 p-0.75 shadow-[0_0_45px_rgba(139,92,246,0.2)] sm:h-72 sm:w-72">
      <img
        src={profile.profile_image_url}
        alt={profile.full_name}
       className="h-full w-full rounded-full border-4 border-[#08090d] object-cover object-[center_30%]"
      />
    </div>
  </div>
)}

              <div className="relative rounded-4xl border border-white/10 bg-[#101117]/90 p-7 shadow-2xl sm:p-9">
                <div className="mb-8 flex items-center justify-between">
                  <span className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                    Developer profile
                  </span>

                  <span className="flex gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-red-400/80" />
                    <span className="h-2 w-2 rounded-full bg-yellow-400/80" />
                    <span className="h-2 w-2 rounded-full bg-emerald-400/80" />
                  </span>
                </div>

                <div className="rounded-2xl border border-white/7 bg-black/30 p-5 font-mono text-sm leading-8">
                  <p className="text-zinc-500">
                    // A little about me
                  </p>

                  <p>
                    <span className="text-violet-300">const</span>{' '}
                    developer = {'{'}
                  </p>

                  <p className="pl-4">
  name:{' '}
  <span className="text-emerald-300">
    '{profile?.full_name || "Richard D'Souza"}'
  </span>
  ,
</p>
                  <p className="pl-4">
  focus:{' '}
  <span className="text-emerald-300">
    '{profile?.professional_title || 'Software'}'
  </span>
  ,
</p>

                 <p className="pl-4">interests: [</p>

{(profile?.interests ?? []).map((interest, index) => (
  <p
    className="pl-8 text-blue-300"
    key={`${interest}-${index}`}
  >
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

                <div className="mt-6 flex items-center justify-between rounded-xl border border-white/7 bg-white/2.5 p-4">
                  <div>
                    <p className="text-sm font-medium">
                      Always building
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      Learning. Creating. Improving.
                    </p>
                  </div>

                  <Code2 className="text-violet-300" size={25} />
                </div>
              </div>
            </motion.div>
          </div>

          <a
            href="#about"
            aria-label="Scroll to About"
            className="absolute bottom-7 left-1/2 -translate-x-1/2 text-zinc-500 transition hover:text-white"
          >
            <ArrowDown className="animate-bounce" size={20} />
          </a>
        </section>


<section
  id="about"
  className="scroll-mt-24 border-t border-white/6 py-24 sm:py-32"
>
  <motion.div
    className="mx-auto grid max-w-7xl gap-10 px-6 md:grid-cols-[0.7fr_1.3fr] lg:px-10"
    variants={reveal}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.2 }}
  >
    <div>
      <p className="text-sm uppercase tracking-[0.25em] text-violet-300">
        01 / About
      </p>

      <h2 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
        A little about me.
      </h2>

      {profile?.professional_title && (
        <p className="mt-4 text-sm font-medium text-violet-300">
          {profile.professional_title}
        </p>
      )}


    </div>

    <div>
      {profileError && (
        <p role="alert" className="text-sm text-red-400">
          {profileError}
        </p>
      )}

      {profile ? (
        <>
          {profile.short_intro && (
            <p className="mb-6 text-lg font-medium leading-8 text-violet-100">
              {profile.short_intro}
            </p>
          )}

          {profile.biography && (
            <p className="text-lg leading-8 text-zinc-400 whitespace-pre-line">
              {profile.biography}
            </p>
          )}

          {profile.secondary_biography && (
            <p className="mt-5 leading-8 text-zinc-500 whitespace-pre-line">
              {profile.secondary_biography}
            </p>
          )}

          {profile.location && (
            <p className="mt-7 text-sm text-zinc-500">
              <span className="text-violet-300">Location:</span>{' '}
              {profile.location}
            </p>
          )}
        </>
      ) : (
        !profileError && (
          <p className="text-lg leading-8 text-zinc-500">
            Profile information will be available soon.
          </p>
        )
      )}
    </div>
  </motion.div>
</section>



<section
  id="skills"
  className="scroll-mt-24 border-t border-white/6 py-24 sm:py-32"
>
  <div className="mx-auto max-w-7xl px-6 lg:px-10">
    <p className="text-sm uppercase tracking-[0.25em] text-violet-300">
      02 / Skills
    </p>

    <div className="mt-5">
      <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
        What I work with.
      </h2>
      <p className="mt-4 max-w-2xl leading-7 text-zinc-400">
        Technologies and tools I use to build applications, solve problems,
        and continuously improve as a developer.
      </p>
    </div>

    <motion.div
      className="mt-12 grid gap-5 sm:grid-cols-2"
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
            className="rounded-2xl border border-white/8 bg-[#0d0e14] p-7 transition duration-300 hover:border-violet-400/40"
          >
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-400/10">
              <Icon size={22} className="text-violet-300" />
            </div>

            <h3 className="text-lg font-semibold">{skill.name}</h3>

            <p className="mt-3 text-sm leading-7 text-zinc-400">
              {skill.detail}
            </p>
          </motion.div>
        )
      })}
    </motion.div>
  </div>
</section>


        <section
          id="projects"
          className="scroll-mt-24 border-t border-white/6 py-24 sm:py-32"
        >
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <p className="text-sm uppercase tracking-[0.25em] text-violet-300">
              03 / Selected work
            </p>

            <div className="mt-5 flex flex-wrap items-end justify-between gap-5">
              <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                Things I&apos;ve built.
              </h2>
<span className="text-sm text-zinc-500">
  {projectsLoading
    ? 'Loading projects...'
    : `${projects.length} projects to explore`}
</span>
            </div>


              <motion.div
          className="mt-12 grid gap-5 md:grid-cols-2"
          variants={stagger}
           initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
            >
           {!projectsLoading && !projectsError && projects.map((project) => (


<motion.article
  key={project.name}
  variants={reveal}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, amount: 0.1 }}
  whileHover={{
    y: -7,
    scale: 1.01,
    transition: { duration: 0.25 },
  }}
  className="glass-panel group overflow-hidden rounded-2xl border border-white/8 bg-[#0d0e14] transition duration-300 hover:border-violet-400/50"
>

                  <div
                    className={`relative flex aspect-16/8 items-center justify-center overflow-hidden bg-linear-to-br ${project.color}`}
                  >
                    <span className="absolute left-6 top-5 font-mono text-sm text-white/50">
                      {project.number}
                    </span>

                    <div className="rounded-2xl border border-white/15 bg-black/30 px-8 py-6 text-center backdrop-blur-sm transition duration-500 group-hover:scale-105">
                      <Code2
                        size={32}
                        className="mx-auto text-violet-200"
                      />

                      <p className="mt-3 text-sm font-medium tracking-wide">
                        {project.name}
                      </p>
                    </div>

                    <span className="absolute bottom-5 right-5 text-xs tracking-widest text-white/50">
                      {project.category}
                    </span>
                  </div>

                  <div className="p-6 sm:p-7">
                    <h3 className="text-xl font-semibold">
                      {project.name}
                    </h3>

                    <p className="mt-3 min-h-16 text-sm leading-7 text-zinc-400">
                      {project.description}
                    </p>

                   <p className="mt-4 text-xs leading-6 text-violet-200/80">
  {project.stack.join(' · ')}
</p>

                    <div className="mt-6 flex flex-wrap gap-3 border-t border-white/7 pt-5">
                      <a
                        href={project.github}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2.5 text-sm transition hover:border-white/30 hover:bg-white/4"
                      >
                        <FaGithub size={16} />
                        Repository
                        <ArrowUpRight size={14} />
                      </a>


<Link
  to={`/projects/${project.slug}`}
  className="inline-flex items-center gap-2 px-3 py-2.5 text-sm text-zinc-400 transition hover:text-white"
>
  View project details
  <ArrowUpRight size={14} />
</Link>

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
          className="scroll-mt-24 border-t border-white/6 py-24 sm:py-32"
        >
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#101117] p-8 sm:p-12 lg:p-16">
              <div className="pointer-events-none absolute -right-20 -top-32 h-80 w-80 rounded-full bg-violet-500/15 blur-[100px]" />

              <div className="relative max-w-2xl">
                <p className="text-sm uppercase tracking-[0.25em] text-violet-300">
                  04 / Contact
                </p>

                <h2 className="mt-5 text-4xl font-semibold tracking-tight sm:text-6xl">
                  Have an idea?
                  <br />
                  Let&apos;s talk.
                </h2>

                <p className="mt-5 max-w-lg leading-7 text-zinc-400">
                  Interested in my work or have an opportunity to discuss?
                  I&apos;d love to hear from you.
                </p>

                <a
                  href="mailto:YOUR_EMAIL@example.com"
                  className="mt-8 inline-flex items-center gap-3 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-black transition hover:bg-violet-200"
                >
                  <Mail size={17} />
                  Get in touch
                  <ArrowUpRight size={17} />
                </a>

                <p className="mt-3 text-xs text-zinc-500">
                  Replace the placeholder email before publishing.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/6 px-6 py-8 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-sm text-zinc-500 sm:flex-row">
          <a href="#home" className="font-semibold text-white">
  {profile?.full_name || "Richard D'Souza"}
  <span className="text-violet-400">.</span>
</a>

          <p>Designed &amp; built with React.</p>

          <a
            href="#home"
            className="transition hover:text-white"
          >
            Back to top ↑
          </a>
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
