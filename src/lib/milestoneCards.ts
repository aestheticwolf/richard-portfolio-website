/**
 * Milestone Cards Parser & Serializer
 * Supports structured milestone cards with custom titles and colors,
 * while maintaining backward compatibility with legacy plain-text paragraphs.
 */

export type MilestoneColor = 'emerald' | 'cyan' | 'violet' | 'amber' | 'rose' | 'blue'

export type MilestoneIconType = 'code' | 'education' | 'layers' | 'sparkles' | 'terminal' | 'shield'

export interface MilestoneCard {
  id: string
  title: string
  color: MilestoneColor
  icon: MilestoneIconType
  content: string
}

export const MILESTONE_COLORS: { id: MilestoneColor; label: string; textClass: string; hex: string }[] = [
  { id: 'emerald', label: 'Emerald', textClass: 'text-emerald-400', hex: '#34d399' },
  { id: 'cyan', label: 'Cyan', textClass: 'text-cyan-400', hex: '#22d3ee' },
  { id: 'violet', label: 'Violet', textClass: 'text-violet-400', hex: '#a78bfa' },
  { id: 'amber', label: 'Amber', textClass: 'text-amber-400', hex: '#fbbf24' },
  { id: 'rose', label: 'Rose', textClass: 'text-rose-400', hex: '#fb7185' },
  { id: 'blue', label: 'Blue', textClass: 'text-blue-400', hex: '#60a5fa' },
]

export const MILESTONE_ICONS: { id: MilestoneIconType; label: string }[] = [
  { id: 'code', label: 'Code & Dev' },
  { id: 'education', label: 'Education' },
  { id: 'layers', label: 'Architecture & Craft' },
  { id: 'sparkles', label: 'Mindset & Vision' },
  { id: 'terminal', label: 'Milestone' },
  { id: 'shield', label: 'Security' },
]

export const DEFAULT_MILESTONES: MilestoneCard[] = [
  {
    id: 'milestone-1',
    title: 'Education & Foundations',
    color: 'violet',
    icon: 'education',
    content: "I'm a Software Developer with an MSc in Information Technology from Parvatibai Chowgule College of Arts and Science, Goa. I enjoy building applications, exploring new technologies, and finding practical solutions to real world problems.",
  },
  {
    id: 'milestone-2',
    title: 'Core Engineering & Systems',
    color: 'cyan',
    icon: 'layers',
    content: "My experience covers frontend, backend, and mobile application development. I've worked on projects involving user interfaces, REST APIs, database management, authentication, and application integrations.",
  },
  {
    id: 'milestone-3',
    title: 'Hands-on Projects & Stack',
    color: 'emerald',
    icon: 'code',
    content: "Through my professional experience and personal projects, I've worked with technologies including React, TypeScript, Node.js, Express.js, MongoDB, Firebase, and Supabase. I enjoy understanding how different parts of an application work together, from the user interface to the underlying systems.",
  },
  {
    id: 'milestone-4',
    title: 'Continuous Growth & Mindset',
    color: 'amber',
    icon: 'sparkles',
    content: "I'm always looking to learn, take on new challenges, and become a better developer by building useful software and improving my technical skills.",
  },
]

export function normalizeColor(val?: string): MilestoneColor {
  const lower = (val || '').trim().toLowerCase()
  if (lower === 'emerald' || lower === 'green') return 'emerald'
  if (lower === 'cyan' || lower === 'teal') return 'cyan'
  if (lower === 'violet' || lower === 'purple' || lower === 'lavender') return 'violet'
  if (lower === 'amber' || lower === 'yellow' || lower === 'gold' || lower === 'orange') return 'amber'
  if (lower === 'rose' || lower === 'red' || lower === 'pink') return 'rose'
  if (lower === 'blue' || lower === 'indigo' || lower === 'sky') return 'blue'
  return 'emerald'
}

export function normalizeIcon(
  val?: string,
  title?: string,
  content?: string,
): MilestoneIconType {
  const direct = (val || '').trim().toLowerCase()
  if (direct === 'code' || direct === 'dev' || direct === 'software') return 'code'
  if (direct === 'education' || direct === 'degree' || direct === 'school') return 'education'
  if (direct === 'layers' || direct === 'stack' || direct === 'craft') return 'layers'
  if (direct === 'sparkles' || direct === 'mindset' || direct === 'vision') return 'sparkles'
  if (direct === 'terminal' || direct === 'milestone') return 'terminal'
  if (direct === 'shield' || direct === 'security') return 'shield'

  const combined = `${title || ''} ${content || ''}`.toLowerCase()
  if (/msc|b\.?sc|btech|mtech|college|university|degree|parvatibai|chowgule|education/i.test(combined)) {
    return 'education'
  }
  if (/frontend|backend|mobile|interfaces|apis|database|system design|systems/i.test(combined)) {
    return 'layers'
  }
  if (/react|typescript|node|express|mongodb|firebase|supabase|project|code/i.test(combined)) {
    return 'code'
  }
  if (/learn|challenges|growth|improving|goals|mindset|philosophy|aspirations/i.test(combined)) {
    return 'sparkles'
  }
  if (/security|firewall|auth|privacy/i.test(combined)) {
    return 'shield'
  }
  return 'terminal'
}

export function inferColorFromTitle(title: string, fallback: MilestoneColor): MilestoneColor {
  const lower = title.toLowerCase()
  if (/education|degree|foundation|academic|college/i.test(lower)) return 'violet'
  if (/experience|systems|domain|craft|architecture|engineering/i.test(lower)) return 'cyan'
  if (/project|code|stack|tech|build|development/i.test(lower)) return 'emerald'
  if (/mindset|growth|vision|philosophy|approach|learn/i.test(lower)) return 'amber'
  if (/security|defense/i.test(lower)) return 'blue'
  return fallback
}

/**
 * Parses raw biography text into structured MilestoneCard objects.
 * Handles JSON structures, markdown annotations, and legacy multi-paragraph text.
 * Falls back to DEFAULT_MILESTONES if empty.
 */
export function parseMilestoneCards(rawBiography?: string | null): MilestoneCard[] {
  if (!rawBiography || typeof rawBiography !== 'string') return DEFAULT_MILESTONES
  const trimmed = rawBiography.trim()
  if (!trimmed) return DEFAULT_MILESTONES

  // Case 1: Structured JSON Array
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      const parsed = JSON.parse(trimmed)
      if (Array.isArray(parsed) && parsed.length > 0) {
        const valid = parsed
          .filter((item) => item && (typeof item.content === 'string' || typeof item.title === 'string'))
          .map((item, index) => {
            const title = typeof item.title === 'string' && item.title.trim()
              ? item.title.trim()
              : `Milestone 0${index + 1}`
            const content = typeof item.content === 'string' ? item.content.trim() : ''
            const color = normalizeColor(item.color)
            const icon = normalizeIcon(item.icon, title, content)
            return {
              id: item.id || `milestone-${index}-${Date.now()}`,
              title,
              color,
              icon,
              content,
            }
          })
        if (valid.length > 0) return valid
      }
    } catch {
      // Fall through to text parsing
    }
  }

  // Case 2: Legacy paragraph text (split by double newlines or single newlines)
  const rawParagraphs = trimmed
    .split(/\r?\n\r?\n|\r?\n/)
    .map((p) => p.trim())
    .filter(Boolean)

  if (rawParagraphs.length === 0) return DEFAULT_MILESTONES

  return rawParagraphs.map((paragraph, index) => {
    let title = ''
    let color: MilestoneColor = 'emerald'
    let content = paragraph

    // Syntax: "[Title | color]: content" or "[Title]: content"
    const bracketMatch = paragraph.match(/^\[(.*?)(?:\|\s*([a-zA-Z]+))?\]\s*:?\s*(.*)$/s)
    // Syntax: "Title: content"
    const colonMatch = !bracketMatch && paragraph.match(/^([A-Z][A-Za-z0-9\s&/-]{2,35}):\s+(.+)$/s)
    // Syntax: "### Title\ncontent"
    const hashMatch = !bracketMatch && !colonMatch && paragraph.match(/^#{1,3}\s+(.*?)\n+(.*)$/s)

    if (bracketMatch) {
      title = bracketMatch[1].trim()
      if (bracketMatch[2]) {
        color = normalizeColor(bracketMatch[2])
      }
      content = bracketMatch[3].trim()
    } else if (colonMatch) {
      title = colonMatch[1].trim()
      content = colonMatch[2].trim()
    } else if (hashMatch) {
      title = hashMatch[1].trim()
      content = hashMatch[2].trim()
    }

    if (!title) {
      const lower = content.toLowerCase()
      // Smart contextual classification so no two consecutive cards share the same title
      if (/msc|b\.?sc|btech|mtech|college|university|degree|parvatibai|chowgule|education/i.test(lower)) {
        title = 'Education & Foundations'
        color = 'violet'
      } else if (/frontend|backend|mobile|interfaces|apis|database management|authentication|full-stack/i.test(lower)) {
        title = 'Core Engineering & Systems'
        color = 'cyan'
      } else if (/technologies|react|typescript|node|express|mongodb|firebase|supabase|stack|projects/i.test(lower)) {
        title = 'Hands-on Projects & Stack'
        color = 'emerald'
      } else if (/learn|challenges|growth|improving|goals|mindset|better developer/i.test(lower)) {
        title = 'Continuous Growth & Mindset'
        color = 'amber'
      } else {
        title = `Milestone 0${index + 1}`
        color = 'violet'
      }
    } else {
      color = inferColorFromTitle(title, color)
    }

    return {
      id: `milestone-${index}`,
      title,
      color,
      icon: normalizeIcon(undefined, title, content),
      content,
    }
  })
}

/**
 * Serializes MilestoneCard array into a formatted JSON string for storage in Supabase.
 */
export function serializeMilestoneCards(cards: MilestoneCard[]): string {
  return JSON.stringify(cards, null, 2)
}
