
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
  updated_at: string
}

export async function getPublishedProfile(): Promise<PublicProfile | null> {
  const queryWithHeroConsole = `
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
    hero_console,
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
    .select(queryWithHeroConsole)
    .eq('status', 'published')
    .maybeSingle()

  if (error) {
    const missingHeroConsole =
      error.code === '42703' ||
      error.message.toLowerCase().includes('hero_console')
    const missingSkillsColumn =
      error.code === '42703' ||
      error.message.toLowerCase().includes('portfolio_profile.skills')

    if (missingHeroConsole || missingSkillsColumn) {
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
        ${missingSkillsColumn ? '' : 'skills,'}
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
      if (record && missingSkillsColumn) {
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

  const cleanSecondaryBio = stripHeroConsoleFromText(record.secondary_biography)

  return {
    ...record,
    skills: record.skills ?? defaultSkills,
    secondary_biography: cleanSecondaryBio,
    hero_console: resolvedHeroConsole,
  } as PublicProfile
}
