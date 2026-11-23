
import { supabase } from './supabase'

export type HeroConsoleStackGroup = {
  title: string
  color: 'cyan' | 'emerald' | 'violet' | 'amber'
  technologies: string[]
}

export type HeroConsoleConfig = {
  developer: {
    learning: boolean
    available: boolean
  }
  stack: {
    groups: HeroConsoleStackGroup[]
  }
  terminal: {
    prompt_user: string
    command: string
    role: string
    education: string
    location: string
    focus: string
    availability: string
  }
  footer: {
    status_text: string
    subline: string
    branch: string
  }
}

export const DEFAULT_HERO_CONSOLE: HeroConsoleConfig = {
  developer: {
    learning: true,
    available: true,
  },
  stack: {
    groups: [
      {
        title: 'Frontend & UI',
        color: 'cyan',
        technologies: ['React', 'TypeScript', 'Tailwind CSS', 'JavaScript'],
      },
      {
        title: 'Backend & Data',
        color: 'emerald',
        technologies: ['Node.js', 'Express', 'PostgreSQL', 'MongoDB', 'Supabase'],
      },
      {
        title: 'DevOps & Cloud',
        color: 'violet',
        technologies: ['Docker', 'Git', 'AI APIs'],
      },
    ],
  },
  terminal: {
    prompt_user: 'richard@macbook',
    command: 'richard --status',
    role: '',
    education: 'MSc in Information Technology',
    location: '',
    focus: 'Full-Stack Web, Cloud & AI Systems',
    availability: 'Open to Roles & Projects',
  },
  footer: {
    status_text: 'Always building',
    subline: 'Learning. Creating. Improving.',
    branch: 'git:(main)',
  },
}

const HERO_CONSOLE_MARKER_REGEX = /<!--HERO_CONSOLE:([\s\S]*?)-->/

export function extractHeroConsoleFromText(text?: string | null): HeroConsoleConfig | null {
  if (!text) return null
  const match = text.match(HERO_CONSOLE_MARKER_REGEX)
  if (!match) return null
  try {
    const parsed = JSON.parse(match[1])
    return {
      developer: { ...DEFAULT_HERO_CONSOLE.developer, ...parsed.developer },
      stack: {
        groups: Array.isArray(parsed.stack?.groups) && parsed.stack.groups.length > 0
          ? parsed.stack.groups
          : DEFAULT_HERO_CONSOLE.stack.groups,
      },
      terminal: { ...DEFAULT_HERO_CONSOLE.terminal, ...parsed.terminal },
      footer: { ...DEFAULT_HERO_CONSOLE.footer, ...parsed.footer },
    }
  } catch {
    return null
  }
}

export function stripHeroConsoleFromText(text?: string | null): string {
  if (!text) return ''
  return text.replace(HERO_CONSOLE_MARKER_REGEX, '').trim()
}

export type AboutSubcard = {
  title: string
  description: string
  icon: string
  icon_color?: string
}

export type AboutTag = {
  label: string
  icon: string
  color?: string
}

export type AboutProjectChip = {
  name: string
  sub: string
  link: string
}

export type EducationItem = {
  id: string
  levelTag: string
  degree: string
  institution: string
  location: string
  period: string
  score: string
  theme: 'violet' | 'cyan' | 'emerald' | 'amber' | 'indigo' | string
  accentColor: string
  icon: string
  highlights: string[]
}

export type AboutDataConfig = {
  heading: string
  heading_accent: string
  subtitle: string
  overview_prefix: string
  foundations_badge: string
  foundations_icon: string
  foundations_text: string
  mindset_cards: AboutSubcard[]
  mindset_tags: AboutTag[]
  vision_card: AboutSubcard
  vision_projects_label: string
  vision_projects: AboutProjectChip[]
  education_period_badge: string
  education_items: EducationItem[]
}

export const DEFAULT_ABOUT_DATA: AboutDataConfig = {
  heading: 'Thoughtful software,',
  heading_accent: 'built with purpose.',
  subtitle: 'I value practical solutions, clear experiences, and the steady craft behind reliable digital products.',
  overview_prefix: '// software engineering & digital craft',
  foundations_badge: 'Academic & Technical Foundations',
  foundations_icon: 'GraduationCap',
  foundations_text: 'Software Developer with an M.Sc in Information Technology from Parvatibai Chowgule College of Arts and Science. Focused on building reliable web & mobile applications, exploring modern cloud architectures, and finding practical solutions to real-world problems.',
  mindset_cards: [
    {
      title: 'Continuous Growth & Curiosity',
      description: "I'm constantly looking to learn, embrace challenging engineering problems, and improve my technical craft across frontend and backend systems. Every project is an opportunity to master new paradigms and build with higher precision.",
      icon: 'Sparkles',
      icon_color: 'amber',
    },
    {
      title: 'Engineering Philosophy',
      description: 'I believe the best software balances elegant architecture with clear, intuitive user experience. Clean, maintainable code is not just an aesthetic choice—it is the bedrock of dependable digital products.',
      icon: 'Code2',
      icon_color: 'cyan',
    },
  ],
  mindset_tags: [
    { label: 'Clean Architecture', icon: 'ShieldCheck', color: 'emerald' },
    { label: 'End-to-End Ownership', icon: 'Layers', color: 'cyan' },
    { label: 'Practical Solutions', icon: 'Terminal', color: 'violet' },
  ],
  vision_card: {
    title: 'Focus & Future Vision',
    description: 'Dedicated to building software that solves practical operational problems. Enthusiastic about system design, application security, cloud technologies, and the purposeful integration of artificial intelligence in everyday products.',
    icon: 'Compass',
    icon_color: 'violet',
  },
  vision_projects_label: 'Featured Projects in Focus:',
  vision_projects: [
    { name: 'SkillPath', sub: 'Learning Companion', link: '#projects' },
    { name: 'Sentinel Grid', sub: 'Security Management', link: '#projects' },
    { name: 'AI CRM Platform', sub: 'Intelligent Workflows', link: '#projects' },
  ],
  education_period_badge: '2016 – 2026',
  education_items: [
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
      icon: 'GraduationCap',
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
      icon: 'BookOpen',
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
      icon: 'Cpu',
      highlights: ['Computer Technology', 'Programming Foundations', 'Hardware & Electronics'],
    },
  ],
}

const ABOUT_DATA_MARKER_REGEX = /<!--ABOUT_DATA:([\s\S]*?)-->/

export function extractAboutDataFromText(text?: string | null): AboutDataConfig | null {
  if (!text) return null
  const match = text.match(ABOUT_DATA_MARKER_REGEX)
  if (!match) return null
  try {
    const parsed = JSON.parse(match[1])
    return {
      heading: typeof parsed.heading === 'string' ? parsed.heading : DEFAULT_ABOUT_DATA.heading,
      heading_accent: typeof parsed.heading_accent === 'string' ? parsed.heading_accent : DEFAULT_ABOUT_DATA.heading_accent,
      subtitle: typeof parsed.subtitle === 'string' ? parsed.subtitle : DEFAULT_ABOUT_DATA.subtitle,
      overview_prefix: typeof parsed.overview_prefix === 'string' ? parsed.overview_prefix : DEFAULT_ABOUT_DATA.overview_prefix,
      foundations_badge: typeof parsed.foundations_badge === 'string' ? parsed.foundations_badge : DEFAULT_ABOUT_DATA.foundations_badge,
      foundations_icon: typeof parsed.foundations_icon === 'string' ? parsed.foundations_icon : DEFAULT_ABOUT_DATA.foundations_icon,
      foundations_text: typeof parsed.foundations_text === 'string' ? parsed.foundations_text : DEFAULT_ABOUT_DATA.foundations_text,
      mindset_cards: Array.isArray(parsed.mindset_cards) && parsed.mindset_cards.length > 0
        ? parsed.mindset_cards
        : DEFAULT_ABOUT_DATA.mindset_cards,
      mindset_tags: Array.isArray(parsed.mindset_tags) && parsed.mindset_tags.length > 0
        ? parsed.mindset_tags
        : DEFAULT_ABOUT_DATA.mindset_tags,
      vision_card: parsed.vision_card && typeof parsed.vision_card.title === 'string'
        ? parsed.vision_card
        : DEFAULT_ABOUT_DATA.vision_card,
      vision_projects_label: typeof parsed.vision_projects_label === 'string' ? parsed.vision_projects_label : DEFAULT_ABOUT_DATA.vision_projects_label,
      vision_projects: Array.isArray(parsed.vision_projects) && parsed.vision_projects.length > 0
        ? parsed.vision_projects
        : DEFAULT_ABOUT_DATA.vision_projects,
      education_period_badge: typeof parsed.education_period_badge === 'string' ? parsed.education_period_badge : DEFAULT_ABOUT_DATA.education_period_badge,
      education_items: Array.isArray(parsed.education_items) && parsed.education_items.length > 0
        ? parsed.education_items
        : DEFAULT_ABOUT_DATA.education_items,
    }
  } catch {
    return null
  }
}

export function stripAboutDataFromText(text?: string | null): string {
  if (!text) return ''
  return text.replace(ABOUT_DATA_MARKER_REGEX, '').trim()
}

const defaultSkills = [
  { name: 'Frontend Development', technologies: ['React', 'TypeScript', 'HTML', 'CSS'] },
  { name: 'Backend Development', technologies: ['Node.js', 'Express', 'REST APIs'] },
  { name: 'Cloud & Deployment', technologies: ['Firebase', 'Supabase', 'Vercel'] },
  { name: 'Security Fundamentals', technologies: ['Authentication', 'Authorization', 'Firewalls'] },
]

export type PublicProfile = {
  id: string
  full_name: string
  professional_title: string
  short_intro: string
  biography: string
  secondary_biography: string
  location: string
  profile_image_url: string | null
  github_url: string | null
  linkedin_url: string | null
  interests: string[]
  skills: { name: string; technologies: string[] }[]
  hero_console?: HeroConsoleConfig | null
  about_data?: AboutDataConfig | null
  updated_at: string
}

let cachedProfile: PublicProfile | null = null
let inFlightProfilePromise: Promise<PublicProfile | null> | null = null

export async function getPublishedProfile(forceRefresh = false): Promise<PublicProfile | null> {
  if (cachedProfile && !forceRefresh) {
    return cachedProfile
  }
  if (inFlightProfilePromise && !forceRefresh) {
    return inFlightProfilePromise
  }

  inFlightProfilePromise = fetchPublishedProfileFromSupabase()
  try {
    cachedProfile = await inFlightProfilePromise
    return cachedProfile
  } finally {
    inFlightProfilePromise = null
  }
}

async function fetchPublishedProfileFromSupabase(): Promise<PublicProfile | null> {
  // Query exclusively existing columns in production database to prevent PostgREST 400 Bad Request
  const validProfileQuery = `
    id,
    full_name,
    professional_title,
    short_intro,
    biography,
    secondary_biography,
    location,
    profile_image_url,
    github_url,
    linkedin_url,
    interests,
    skills,
    updated_at
  `

  type RawRecord = {
    id: string
    full_name: string
    professional_title: string
    short_intro: string
    biography: string
    secondary_biography: string
    location: string
    profile_image_url: string | null
    github_url: string | null
    linkedin_url: string | null
    interests: string[]
    skills?: { name: string; technologies: string[] }[]
    hero_console?: HeroConsoleConfig | null
    updated_at: string
  }

  let record: RawRecord | null

  const { data, error } = await supabase
    .from('portfolio_profile')
    .select(validProfileQuery)
    .eq('status', 'published')
    .maybeSingle()

  if (error) {
    const missingSkillsColumn =
      error.code === '42703' ||
      error.message.toLowerCase().includes('portfolio_profile.skills')

    if (missingSkillsColumn) {
      const fallbackQuery = `
        id,
        full_name,
        professional_title,
        short_intro,
        biography,
        secondary_biography,
        location,
        profile_image_url,
        github_url,
        linkedin_url,
        interests,
        updated_at
      `

      const retryResult = await supabase
        .from('portfolio_profile')
        .select(fallbackQuery)
        .eq('status', 'published')
        .maybeSingle()

      if (retryResult.error) {
        throw new Error(`Unable to load portfolio profile: ${retryResult.error.message}`)
      }

      record = (retryResult.data as unknown) as RawRecord | null
      if (record) {
        record.skills = defaultSkills
      }
    } else {
      throw new Error(`Unable to load portfolio profile: ${error.message}`)
    }
  } else {
    record = (data as unknown) as RawRecord | null
  }

  if (!record) return null

  const resolvedHeroConsole: HeroConsoleConfig =
    record.hero_console ||
    extractHeroConsoleFromText(record.secondary_biography) ||
    DEFAULT_HERO_CONSOLE

  const resolvedAboutData: AboutDataConfig =
    extractAboutDataFromText(record.secondary_biography) ||
    DEFAULT_ABOUT_DATA

  const cleanSecondaryBio = stripAboutDataFromText(stripHeroConsoleFromText(record.secondary_biography))

  function sanitizeWebUrl(url: string | null): string | null {
    if (!url) return null
    const trimmed = url.trim()
    try {
      const parsed = new URL(trimmed)
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        return trimmed
      }
      return null
    } catch {
      return null
    }
  }

  return {
    ...record,
    github_url: sanitizeWebUrl(record.github_url),
    linkedin_url: sanitizeWebUrl(record.linkedin_url),
    profile_image_url: sanitizeWebUrl(record.profile_image_url),
    skills: record.skills ?? defaultSkills,
    secondary_biography: cleanSecondaryBio,
    hero_console: resolvedHeroConsole,
    about_data: resolvedAboutData,
  } as PublicProfile
}
