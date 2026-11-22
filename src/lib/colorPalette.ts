export type PaletteColor =
  | 'emerald'
  | 'cyan'
  | 'violet'
  | 'amber'
  | 'blue'
  | 'rose'
  | 'pink'
  | 'indigo'
  | 'orange'
  | 'lime'
  | 'teal'
  | 'sky'
  | 'red'
  | 'white'
  | 'gold'

export type ColorDefinition = {
  key: PaletteColor
  label: string
  hex: string
  rgb: string
  textClass: string
  borderRgba: string
  bgRgba: string
  glowRgba: string
}

export const COLOR_PALETTE: Record<PaletteColor, ColorDefinition> = {
  emerald: {
    key: 'emerald',
    label: 'Emerald',
    hex: '#34d399',
    rgb: '52, 211, 153',
    textClass: 'text-emerald-400',
    borderRgba: 'rgba(52, 211, 153, 0.35)',
    bgRgba: 'rgba(52, 211, 153, 0.1)',
    glowRgba: 'rgba(52, 211, 153, 0.22)',
  },
  cyan: {
    key: 'cyan',
    label: 'Cyan',
    hex: '#22d3ee',
    rgb: '34, 211, 238',
    textClass: 'text-cyan-400',
    borderRgba: 'rgba(34, 211, 238, 0.35)',
    bgRgba: 'rgba(34, 211, 238, 0.1)',
    glowRgba: 'rgba(34, 211, 238, 0.22)',
  },
  violet: {
    key: 'violet',
    label: 'Violet',
    hex: '#a78bfa',
    rgb: '167, 139, 250',
    textClass: 'text-violet-400',
    borderRgba: 'rgba(167, 139, 250, 0.35)',
    bgRgba: 'rgba(167, 139, 250, 0.1)',
    glowRgba: 'rgba(167, 139, 250, 0.22)',
  },
  amber: {
    key: 'amber',
    label: 'Amber',
    hex: '#fbbf24',
    rgb: '251, 191, 36',
    textClass: 'text-amber-400',
    borderRgba: 'rgba(251, 191, 36, 0.35)',
    bgRgba: 'rgba(251, 191, 36, 0.1)',
    glowRgba: 'rgba(251, 191, 36, 0.22)',
  },
  blue: {
    key: 'blue',
    label: 'Blue',
    hex: '#60a5fa',
    rgb: '96, 165, 250',
    textClass: 'text-blue-400',
    borderRgba: 'rgba(96, 165, 250, 0.35)',
    bgRgba: 'rgba(96, 165, 250, 0.1)',
    glowRgba: 'rgba(96, 165, 250, 0.22)',
  },
  rose: {
    key: 'rose',
    label: 'Rose',
    hex: '#fb7185',
    rgb: '251, 113, 133',
    textClass: 'text-rose-400',
    borderRgba: 'rgba(251, 113, 133, 0.35)',
    bgRgba: 'rgba(251, 113, 133, 0.1)',
    glowRgba: 'rgba(251, 113, 133, 0.22)',
  },
  pink: {
    key: 'pink',
    label: 'Pink',
    hex: '#f472b6',
    rgb: '244, 114, 182',
    textClass: 'text-pink-400',
    borderRgba: 'rgba(244, 114, 182, 0.35)',
    bgRgba: 'rgba(244, 114, 182, 0.1)',
    glowRgba: 'rgba(244, 114, 182, 0.22)',
  },
  indigo: {
    key: 'indigo',
    label: 'Indigo',
    hex: '#818cf8',
    rgb: '129, 140, 248',
    textClass: 'text-indigo-400',
    borderRgba: 'rgba(129, 140, 248, 0.35)',
    bgRgba: 'rgba(129, 140, 248, 0.1)',
    glowRgba: 'rgba(129, 140, 248, 0.22)',
  },
  orange: {
    key: 'orange',
    label: 'Orange',
    hex: '#fb923c',
    rgb: '251, 146, 60',
    textClass: 'text-orange-400',
    borderRgba: 'rgba(251, 146, 60, 0.35)',
    bgRgba: 'rgba(251, 146, 60, 0.1)',
    glowRgba: 'rgba(251, 146, 60, 0.22)',
  },
  lime: {
    key: 'lime',
    label: 'Lime',
    hex: '#a3e635',
    rgb: '163, 230, 53',
    textClass: 'text-lime-400',
    borderRgba: 'rgba(163, 230, 53, 0.35)',
    bgRgba: 'rgba(163, 230, 53, 0.1)',
    glowRgba: 'rgba(163, 230, 53, 0.22)',
  },
  teal: {
    key: 'teal',
    label: 'Teal',
    hex: '#2dd4bf',
    rgb: '45, 212, 191',
    textClass: 'text-teal-400',
    borderRgba: 'rgba(45, 212, 191, 0.35)',
    bgRgba: 'rgba(45, 212, 191, 0.1)',
    glowRgba: 'rgba(45, 212, 191, 0.22)',
  },
  sky: {
    key: 'sky',
    label: 'Sky',
    hex: '#38bdf8',
    rgb: '56, 189, 248',
    textClass: 'text-sky-400',
    borderRgba: 'rgba(56, 189, 248, 0.35)',
    bgRgba: 'rgba(56, 189, 248, 0.1)',
    glowRgba: 'rgba(56, 189, 248, 0.22)',
  },
  red: {
    key: 'red',
    label: 'Red',
    hex: '#f87171',
    rgb: '248, 113, 113',
    textClass: 'text-red-400',
    borderRgba: 'rgba(248, 113, 113, 0.35)',
    bgRgba: 'rgba(248, 113, 113, 0.1)',
    glowRgba: 'rgba(248, 113, 113, 0.22)',
  },
  white: {
    key: 'white',
    label: 'White',
    hex: '#f8fafc',
    rgb: '248, 250, 252',
    textClass: 'text-slate-100',
    borderRgba: 'rgba(248, 250, 252, 0.35)',
    bgRgba: 'rgba(248, 250, 252, 0.08)',
    glowRgba: 'rgba(248, 250, 252, 0.2)',
  },
  gold: {
    key: 'gold',
    label: 'Gold',
    hex: '#f59e0b',
    rgb: '245, 158, 11',
    textClass: 'text-amber-500',
    borderRgba: 'rgba(245, 158, 11, 0.35)',
    bgRgba: 'rgba(245, 158, 11, 0.1)',
    glowRgba: 'rgba(245, 158, 11, 0.25)',
  },
}

export const PALETTE_COLORS: ColorDefinition[] = Object.values(COLOR_PALETTE)

export function getColorDefinition(name?: string | null): ColorDefinition {
  if (!name) return COLOR_PALETTE.violet
  const key = name.toLowerCase().trim() as PaletteColor
  return COLOR_PALETTE[key] || COLOR_PALETTE.violet
}
