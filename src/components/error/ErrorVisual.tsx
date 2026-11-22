import { useState, useEffect } from 'react'
import { useReducedMotion } from 'motion/react'
import type { ErrorVisualType } from '../../types/error'

interface ErrorVisualProps {
  type: ErrorVisualType
  accentColor?: 'violet' | 'blue' | 'rose' | 'amber' | 'cyan'
}

const ACCENT_COLORS = {
  violet: {
    primary: '#a78bfa',
    secondary: '#818cf8',
    glow: 'rgba(167, 139, 250, 0.35)',
    bg: 'rgba(167, 139, 250, 0.08)',
    border: 'rgba(167, 139, 250, 0.25)',
  },
  blue: {
    primary: '#38bdf8',
    secondary: '#60a5fa',
    glow: 'rgba(56, 189, 248, 0.35)',
    bg: 'rgba(56, 189, 248, 0.08)',
    border: 'rgba(56, 189, 248, 0.25)',
  },
  cyan: {
    primary: '#22d3ee',
    secondary: '#38bdf8',
    glow: 'rgba(34, 211, 238, 0.35)',
    bg: 'rgba(34, 211, 238, 0.08)',
    border: 'rgba(34, 211, 238, 0.25)',
  },
  rose: {
    primary: '#fb7185',
    secondary: '#f43f5e',
    glow: 'rgba(251, 113, 133, 0.35)',
    bg: 'rgba(251, 113, 133, 0.08)',
    border: 'rgba(251, 113, 133, 0.25)',
  },
  amber: {
    primary: '#fbbf24',
    secondary: '#f59e0b',
    glow: 'rgba(251, 191, 36, 0.35)',
    bg: 'rgba(251, 191, 36, 0.08)',
    border: 'rgba(251, 191, 36, 0.25)',
  },
}

const ACCENT_COLORS_LIGHT = {
  violet: {
    primary: '#6d28d9',
    secondary: '#4f46e5',
    glow: 'rgba(109, 40, 217, 0.16)',
    bg: 'rgba(109, 40, 217, 0.08)',
    border: 'rgba(109, 40, 217, 0.28)',
  },
  blue: {
    primary: '#0284c7',
    secondary: '#2563eb',
    glow: 'rgba(2, 132, 199, 0.16)',
    bg: 'rgba(2, 132, 199, 0.08)',
    border: 'rgba(2, 132, 199, 0.28)',
  },
  cyan: {
    primary: '#0891b2',
    secondary: '#0284c7',
    glow: 'rgba(8, 145, 178, 0.16)',
    bg: 'rgba(8, 145, 178, 0.08)',
    border: 'rgba(8, 145, 178, 0.28)',
  },
  rose: {
    primary: '#e11d48',
    secondary: '#be123c',
    glow: 'rgba(225, 29, 72, 0.16)',
    bg: 'rgba(225, 29, 72, 0.08)',
    border: 'rgba(225, 29, 72, 0.28)',
  },
  amber: {
    primary: '#d97706',
    secondary: '#b45309',
    glow: 'rgba(217, 119, 6, 0.16)',
    bg: 'rgba(217, 119, 6, 0.08)',
    border: 'rgba(217, 119, 6, 0.28)',
  },
}

export default function ErrorVisual({ type, accentColor = 'violet' }: ErrorVisualProps) {
  const prefersReducedMotion = useReducedMotion() ?? false

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'
    }
    return 'dark'
  })

  useEffect(() => {
    const updateTheme = () => {
      setTheme(document.documentElement.dataset.theme === 'light' ? 'light' : 'dark')
    }
    const obs = new MutationObserver(updateTheme)
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => obs.disconnect()
  }, [])

  const isLight = theme === 'light'
  const palette = isLight ? ACCENT_COLORS_LIGHT : ACCENT_COLORS
  const colors = palette[accentColor] || palette.violet
  const ringColor = isLight ? 'rgba(15, 23, 42, 0.12)' : 'rgba(255, 255, 255, 0.08)'
  const glyphColor = isLight ? '#0f172a' : '#ffffff'

  return (
    <div
      className="relative flex items-center justify-center select-none"
      style={{ width: 'min(240px, 60vw)', height: 'min(240px, 60vw)' }}
      aria-hidden="true"
    >
      {/* Ambient background illumination */}
      <div
        className="absolute inset-0 rounded-full blur-3xl pointer-events-none transition-all duration-300"
        style={{
          background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`,
          opacity: prefersReducedMotion ? 0.35 : isLight ? 0.45 : 0.6,
        }}
      />

      {/* SVG Canvas for precise astronomical/architectural node visuals */}
      <svg
        viewBox="0 0 240 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 w-full h-full"
      >
        <defs>
          <radialGradient id="errorCoreGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={isLight ? '#0f172a' : '#ffffff'} stopOpacity="0.9" />
            <stop offset="60%" stopColor={colors.primary} stopOpacity="0.8" />
            <stop offset="100%" stopColor={colors.secondary} stopOpacity="0" />
          </radialGradient>
          <filter id="errorGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* ── Visual Type: Lost Path (404 & Missing Content) ── */}
        {(type === 'lost-path' || type === 'data-corrupt') && (
          <g className={prefersReducedMotion ? '' : 'transition-transform duration-700'}>
            {/* Outer dotted orbital ring */}
            <circle
              cx="120"
              cy="120"
              r="92"
              stroke={ringColor}
              strokeWidth="1.5"
              strokeDasharray="4 8"
            />
            {/* Middle constellation path */}
            <circle
              cx="120"
              cy="120"
              r="64"
              stroke={colors.border}
              strokeWidth="1"
              strokeDasharray="2 6"
            />

            {/* Connection segments */}
            <line x1="70" y1="120" x2="120" y2="70" stroke={colors.primary} strokeWidth="1.5" strokeOpacity="0.4" />
            <line x1="120" y1="70" x2="170" y2="120" stroke={colors.primary} strokeWidth="1.5" strokeOpacity="0.4" />
            <line x1="70" y1="120" x2="120" y2="170" stroke={colors.primary} strokeWidth="1.5" strokeOpacity="0.4" />
            {/* Severed missing path to lost node */}
            <line
              x1="120"
              y1="170"
              x2="170"
              y2="120"
              stroke={isLight ? 'rgba(15, 23, 42, 0.22)' : 'rgba(255, 255, 255, 0.2)'}
              strokeWidth="1.5"
              strokeDasharray="3 4"
            />

            {/* Active Nodes */}
            <circle cx="70" cy="120" r="4" fill={colors.primary} filter="url(#errorGlowFilter)" />
            <circle cx="120" cy="70" r="4" fill={colors.primary} filter="url(#errorGlowFilter)" />
            <circle cx="120" cy="170" r="4" fill={colors.primary} filter="url(#errorGlowFilter)" />

            {/* Disconnected / Missing Node at (170, 120) */}
            <circle
              cx="170"
              cy="120"
              r="8"
              stroke={colors.primary}
              strokeWidth="1.5"
              strokeDasharray="2 3"
              fill="none"
              className={prefersReducedMotion ? '' : 'animate-pulse'}
            />
            <line x1="165" y1="115" x2="175" y2="125" stroke={colors.primary} strokeWidth="1.5" strokeOpacity="0.8" />
            <line x1="175" y1="115" x2="165" y2="125" stroke={colors.primary} strokeWidth="1.5" strokeOpacity="0.8" />

            {/* Center Spatial Compass Indicator */}
            <circle cx="120" cy="120" r="16" fill={colors.bg} stroke={colors.border} strokeWidth="1" />
            <circle cx="120" cy="120" r="3" fill={glyphColor} />
            {/* Crosshairs */}
            <line x1="120" y1="108" x2="120" y2="114" stroke={isLight ? 'rgba(15, 23, 42, 0.45)' : 'rgba(255,255,255,0.4)'} strokeWidth="1" />
            <line x1="120" y1="126" x2="120" y2="132" stroke={isLight ? 'rgba(15, 23, 42, 0.45)' : 'rgba(255,255,255,0.4)'} strokeWidth="1" />
            <line x1="108" y1="120" x2="114" y2="120" stroke={isLight ? 'rgba(15, 23, 42, 0.45)' : 'rgba(255,255,255,0.4)'} strokeWidth="1" />
            <line x1="126" y1="120" x2="132" y2="120" stroke={isLight ? 'rgba(15, 23, 42, 0.45)' : 'rgba(255,255,255,0.4)'} strokeWidth="1" />
          </g>
        )}

        {/* ── Visual Type: Restricted Node (401 & 403) ── */}
        {type === 'restricted-node' && (
          <g>
            {/* Concentric Security Boundaries */}
            <circle cx="120" cy="120" r="88" stroke={ringColor} strokeWidth="1" />
            <circle
              cx="120"
              cy="120"
              r="72"
              stroke={colors.border}
              strokeWidth="1.5"
              strokeDasharray="6 4"
            />
            <circle
              cx="120"
              cy="120"
              r="52"
              stroke={colors.primary}
              strokeWidth="1"
              strokeOpacity="0.3"
            />

            {/* Perimeter Sensors */}
            <circle cx="120" cy="32" r="3" fill={colors.primary} />
            <circle cx="120" cy="208" r="3" fill={colors.primary} />
            <circle cx="32" cy="120" r="3" fill={colors.primary} />
            <circle cx="208" cy="120" r="3" fill={colors.primary} />

            {/* Central Secured Core Badge */}
            <rect
              x="96"
              y="102"
              width="48"
              height="38"
              rx="8"
              fill={colors.bg}
              stroke={colors.primary}
              strokeWidth="1.5"
              filter="url(#errorGlowFilter)"
            />
            {/* Shackle */}
            <path
              d="M106 102V92C106 84.268 112.268 78 120 78C127.732 78 134 84.268 134 92V102"
              stroke={colors.primary}
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
            {/* Keyhole */}
            <circle cx="120" cy="117" r="3.5" fill={glyphColor} />
            <path d="M118.5 120.5L118 129H122L121.5 120.5" fill={glyphColor} />
          </g>
        )}

        {/* ── Visual Type: Rate Limit (429) ── */}
        {type === 'rate-limit' && (
          <g>
            {/* Frequency Pulse Waves */}
            <circle cx="120" cy="120" r="92" stroke={ringColor} strokeWidth="1" />
            <circle
              cx="120"
              cy="120"
              r="76"
              stroke={colors.border}
              strokeWidth="1.5"
              strokeDasharray="4 6"
            />
            <circle
              cx="120"
              cy="120"
              r="56"
              stroke={colors.primary}
              strokeWidth="1.5"
              strokeOpacity="0.5"
            />

            {/* Radial Throttling Gauge Marks */}
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg, i) => (
              <line
                key={i}
                x1="120"
                y1="34"
                x2="120"
                y2="42"
                stroke={deg < 240 ? colors.primary : isLight ? 'rgba(15, 23, 42, 0.2)' : 'rgba(255,255,255,0.2)'}
                strokeWidth="2"
                transform={`rotate(${deg} 120 120)`}
              />
            ))}

            {/* Central Pulse Meter Node */}
            <circle cx="120" cy="120" r="28" fill={colors.bg} stroke={colors.primary} strokeWidth="1.5" />
            {/* Waveform graphic inside center */}
            <path
              d="M102 120H108L112 110L116 130L120 114L124 126L128 118L132 120H138"
              stroke={glyphColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#errorGlowFilter)"
            />
          </g>
        )}

        {/* ── Visual Type: System Disruption (500 & Render Exception) ── */}
        {type === 'system-disruption' && (
          <g>
            {/* Disrupted Hex Core */}
            <polygon
              points="120,32 196,76 196,164 120,208 44,164 44,76"
              stroke={ringColor}
              strokeWidth="1.5"
              fill="none"
            />
            <polygon
              points="120,54 177,87 177,153 120,186 63,153 63,87"
              stroke={colors.border}
              strokeWidth="1"
              fill="none"
              strokeDasharray="4 4"
            />

            {/* Fracture / Anomaly Vectors across core */}
            <path
              d="M80 85L115 115L108 135L145 165"
              stroke={colors.primary}
              strokeWidth="2"
              strokeLinecap="round"
              filter="url(#errorGlowFilter)"
            />
            <line x1="115" y1="115" x2="160" y2="105" stroke={colors.secondary} strokeWidth="1.5" strokeDasharray="3 3" />
            <line x1="108" y1="135" x2="85" y2="155" stroke={colors.secondary} strokeWidth="1.5" strokeDasharray="3 3" />

            {/* Central Core Fracture Fragment */}
            <circle cx="120" cy="120" r="22" fill={colors.bg} stroke={colors.primary} strokeWidth="1.5" />
            {/* Warning Core Glyph */}
            <path d="M120 110V124" stroke={glyphColor} strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="120" cy="130" r="1.5" fill={glyphColor} />
          </g>
        )}

        {/* ── Visual Type: Disconnected Signal (502 & Network) ── */}
        {type === 'disconnected-signal' && (
          <g>
            {/* Transmission Rings Left */}
            <circle cx="70" cy="120" r="48" stroke={ringColor} strokeWidth="1" />
            <circle cx="70" cy="120" r="32" stroke={colors.border} strokeWidth="1" strokeDasharray="3 3" />
            <circle cx="70" cy="120" r="14" fill={colors.bg} stroke={colors.primary} strokeWidth="1.5" />
            <circle cx="70" cy="120" r="4" fill={glyphColor} />

            {/* Transmission Rings Right */}
            <circle cx="170" cy="120" r="48" stroke={ringColor} strokeWidth="1" />
            <circle cx="170" cy="120" r="32" stroke={colors.border} strokeWidth="1" strokeDasharray="3 3" />
            <circle cx="170" cy="120" r="14" fill={colors.bg} stroke={colors.primary} strokeWidth="1.5" />
            <circle cx="170" cy="120" r="4" fill={glyphColor} />

            {/* Broken Severed Bridge in Center */}
            <line x1="84" y1="120" x2="105" y2="120" stroke={colors.primary} strokeWidth="2" strokeDasharray="2 3" />
            <line x1="135" y1="120" x2="156" y2="120" stroke={colors.primary} strokeWidth="2" strokeDasharray="2 3" />

            {/* Severed Gap Lightning / Disconnect Symbol */}
            <path
              d="M124 108L114 122H126L116 132"
              stroke={colors.primary}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#errorGlowFilter)"
            />
          </g>
        )}

        {/* ── Visual Type: Inactive Service (503) ── */}
        {type === 'inactive-service' && (
          <g>
            {/* Sleeping Orbital Ring */}
            <circle cx="120" cy="120" r="88" stroke={ringColor} strokeWidth="1" />
            <circle
              cx="120"
              cy="120"
              r="68"
              stroke={colors.border}
              strokeWidth="1.5"
              strokeDasharray="8 6"
              strokeOpacity="0.4"
            />
            <circle
              cx="120"
              cy="120"
              r="48"
              stroke={colors.primary}
              strokeWidth="1"
              strokeDasharray="2 8"
            />

            {/* Station Solar Panels */}
            <rect x="52" y="115" width="28" height="10" rx="2" fill={colors.bg} stroke={colors.border} strokeWidth="1" />
            <rect x="160" y="115" width="28" height="10" rx="2" fill={colors.bg} stroke={colors.border} strokeWidth="1" />
            <line x1="80" y1="120" x2="98" y2="120" stroke={colors.border} strokeWidth="1.5" />
            <line x1="142" y1="120" x2="160" y2="120" stroke={colors.border} strokeWidth="1.5" />

            {/* Inactive Core Station in Standby */}
            <circle cx="120" cy="120" r="22" fill={colors.bg} stroke={colors.primary} strokeWidth="1.5" />
            {/* Standby / Pause Bars */}
            <rect x="113" y="112" width="4" height="16" rx="2" fill={glyphColor} />
            <rect x="123" y="112" width="4" height="16" rx="2" fill={glyphColor} />
          </g>
        )}

        {/* ── Visual Type: Gateway Timeout (504) ── */}
        {type === 'gateway-timeout' && (
          <g>
            {/* Clock / Hourglass Radial Dial */}
            <circle cx="120" cy="120" r="88" stroke={ringColor} strokeWidth="1" />
            <circle
              cx="120"
              cy="120"
              r="70"
              stroke={colors.border}
              strokeWidth="1.5"
              strokeDasharray="3 6"
            />

            {/* Sweeping Arc (taking too long) */}
            <path
              d="M120 50 A 70 70 0 1 1 54 140"
              stroke={colors.primary}
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              filter="url(#errorGlowFilter)"
            />

            {/* Central Clock / Timer Node */}
            <circle cx="120" cy="120" r="26" fill={colors.bg} stroke={colors.primary} strokeWidth="1.5" />
            {/* Clock Hands stopped */}
            <line x1="120" y1="120" x2="120" y2="105" stroke={glyphColor} strokeWidth="2.5" strokeLinecap="round" />
            <line x1="120" y1="120" x2="135" y2="120" stroke={colors.secondary} strokeWidth="2" strokeLinecap="round" />
            <circle cx="120" cy="120" r="2" fill={glyphColor} />
          </g>
        )}
      </svg>
    </div>
  )
}
