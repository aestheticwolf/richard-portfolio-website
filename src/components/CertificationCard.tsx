import React, { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import {
  Calendar,
  Eye,
  ArrowUpRight,
  Trophy,
  Rocket,
  ShieldCheck,
  Award,
} from 'lucide-react'
import {
  type PublicCertification,
  getCertificateThumbnailUrl,
} from '../lib/certifications'

interface CertificationCardProps {
  cert: PublicCertification
  index: number
  isForeground: boolean
  totalCount: number
  variant?: 'hackerrank' | 'nvidia' | 'generic'
  onSelect: () => void
  onViewDoc: (cert: PublicCertification) => void
  prefersReducedMotion: boolean
  className?: string
  style?: React.CSSProperties
}

// Brand SVG for HackerRank (Green square with crisp geometric H)
function HackerRankLogo() {
  return (
    <div className="w-7 h-7 rounded-lg bg-[#00EA64]/20 border border-[#00EA64]/40 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(0,234,100,0.25)]">
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M6 5v14h3v-5.5h6V19h3V5h-3v5.5H9V5H6z" fill="#00EA64" />
      </svg>
    </div>
  )
}

// Brand SVG for NVIDIA (Green square with iconic swirl)
function NvidiaLogo() {
  return (
    <div className="w-7 h-7 rounded-lg bg-[#76B900]/20 border border-[#76B900]/40 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(118,185,0,0.25)]">
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 5.5c-3.6 0-6.5 2.9-6.5 6.5s2.9 6.5 6.5 6.5c2.3 0 4.3-1.2 5.5-3l-1.8-1c-.8 1.2-2.1 2-3.7 2-2.5 0-4.5-2-4.5-4.5s2-4.5 4.5-4.5c1.7 0 3.2.9 4 2.4l1.8-1C16.4 6.8 14.3 5.5 12 5.5z"
          fill="#76B900"
        />
        <circle cx="12" cy="12" r="2" fill="#76B900" />
      </svg>
    </div>
  )
}

function detectVariant(issuer: string, explicitVariant?: string): 'hackerrank' | 'nvidia' | 'generic' {
  if (explicitVariant && explicitVariant !== 'generic') return explicitVariant as 'hackerrank' | 'nvidia'
  const norm = issuer.toLowerCase()
  if (norm.includes('hackerrank')) return 'hackerrank'
  if (norm.includes('nvidia')) return 'nvidia'
  return 'generic'
}

function getCardSummary(cert: PublicCertification, isHackerRank: boolean, isNvidia: boolean): string {
  if (isHackerRank) {
    return 'Built and deployed an AI agent for the challenge "Ghost Data Still Exists." Achieved a final rank of #2721 among 4,094 participants.'
  }
  if (isNvidia) {
    return "Completed NVIDIA's course on AI, Generative AI, and their real-world applications."
  }
  return cert.description || ''
}

function formatSkillTag(skill: string): string {
  const s = skill.trim()
  if (/agent/i.test(s)) return 'AI Agents'
  if (/resolution|evidence|validation|deletion/i.test(s)) return 'Data Analysis'
  if (/fundamentals/i.test(s)) return 'AI Fundamentals'
  if (/applications/i.test(s)) return 'GenAI'
  if (/artificial intelligence/i.test(s)) return 'AI Fundamentals'
  return s
}

export const CertificationCard: React.FC<CertificationCardProps> = ({
  cert,
  index,
  isForeground,
  totalCount,
  variant: explicitVariant,
  onSelect,
  onViewDoc,
  prefersReducedMotion,
  className = '',
  style = {},
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null)
  const thumbUrl = getCertificateThumbnailUrl(cert.certificateUrl, cert.fileType)
  const variant = detectVariant(cert.issuer, explicitVariant)

  // Spring physics for subtle 3D tilt (active on desktop)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springConfig = { stiffness: 220, damping: 25, mass: 0.6 }
  const mouseXSpring = useSpring(mouseX, springConfig)
  const mouseYSpring = useSpring(mouseY, springConfig)

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['3deg', '-3deg'])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-3deg', '3deg'])

  // Specular light sheen
  const glintX = useTransform(mouseXSpring, [-0.5, 0.5], ['0%', '100%'])
  const glintY = useTransform(mouseYSpring, [-0.5, 0.5], ['0%', '100%'])
  const glintBg = useTransform(
    [glintX, glintY],
    ([x, y]) =>
      `radial-gradient(circle 320px at ${x} ${y}, rgba(255, 255, 255, 0.12), transparent 70%)`,
  )

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || !cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    mouseX.set(x)
    mouseY.set(y)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
  }

  // Variant design tokens
  const isHackerRank = variant === 'hackerrank'
  const isNvidia = variant === 'nvidia'

  // Card surfaces & borders
  let cardBg =
    'linear-gradient(135deg, rgba(45, 12, 85, 0.94) 0%, rgba(68, 18, 120, 0.86) 45%, rgba(100, 20, 95, 0.9) 100%)'
  let borderColor = 'border-[#E85DCE]/45'
  let glowShadow =
    'shadow-[0_0_35px_rgba(232,93,206,0.3),0_25px_60px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.15)]'
  let dateColor = 'text-[#FF77D9]'
  let btnGradient =
    'bg-linear-to-r from-[#8B3DFF] to-[#a855f7] hover:from-[#9d57ff] hover:to-[#b86bfc] shadow-[0_0_20px_rgba(139,61,255,0.45)]'
  let previewBg = 'bg-black/75 border-white/15'

  if (isNvidia) {
    cardBg =
      'linear-gradient(135deg, rgba(12, 26, 64, 0.95) 0%, rgba(18, 40, 94, 0.88) 50%, rgba(14, 28, 69, 0.94) 100%)'
    borderColor = 'border-[#386BFF]/45'
    glowShadow =
      'shadow-[0_0_35px_rgba(56,107,255,0.32),0_25px_60px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.15)]'
    dateColor = 'text-[#82A8FF]'
    btnGradient =
      'bg-linear-to-r from-[#386BFF] to-[#2563eb] hover:from-[#5783ff] hover:to-[#3b82f6] shadow-[0_0_20px_rgba(56,107,255,0.45)]'
    previewBg = 'bg-white/95 border-white/20'
  } else if (!isHackerRank) {
    cardBg =
      'linear-gradient(135deg, rgba(21, 17, 38, 0.95) 0%, rgba(31, 20, 56, 0.88) 50%, rgba(14, 14, 28, 0.94) 100%)'
    borderColor = 'border-[#8B3DFF]/40'
    glowShadow =
      'shadow-[0_0_30px_rgba(139,61,255,0.25),0_25px_60px_rgba(0,0,0,0.7)]'
    dateColor = 'text-[#C4B5FD]'
    btnGradient =
      'bg-linear-to-r from-[#8B3DFF] to-[#6366f1] hover:from-[#9d57ff] hover:to-[#7377ff] shadow-[0_0_20px_rgba(139,61,255,0.4)]'
    previewBg = 'bg-black/60 border-white/15'
  }

  // Format short skill tags
  const rawSkills = isHackerRank
    ? ['Python', 'AI Agents', 'Data Analysis']
    : isNvidia
      ? ['AI Fundamentals', 'GenAI', 'AI']
      : cert.skills.slice(0, 3).map(formatSkillTag)

  const remainingSkillsCount = isHackerRank ? 3 : 0
  const summaryText = getCardSummary(cert, isHackerRank, isNvidia)

  return (
    <motion.div
      ref={cardRef}
      style={{
        background: cardBg,
        transformStyle: 'preserve-3d',
        ...(isForeground && !prefersReducedMotion ? { rotateX, rotateY } : {}),
        ...style,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onSelect}
      data-no-reveal=""
      className={`cert-glass-card group relative rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-6 lg:p-6 xl:p-7 backdrop-blur-2xl transition-all duration-300 border-[1.5px] ${borderColor} ${glowShadow} w-full max-w-full min-w-0 box-border ${className} ${
        !isForeground ? 'cursor-pointer hover:border-white/40' : ''
      }`}
    >
      {/* Specular Glint */}
      {isForeground && !prefersReducedMotion && (
        <motion.div
          className="pointer-events-none absolute inset-0 z-30 rounded-2xl sm:rounded-3xl"
          style={{ background: glintBg }}
          aria-hidden="true"
        />
      )}

      {/* Top Right Floating Badge (Desktop) */}
      <div className="cert-badge-icon hidden lg:block absolute top-5 right-5 sm:top-6 sm:right-6 z-20">
        {isHackerRank ? (
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-linear-to-br from-[#FF4E98] to-[#8B3DFF] shadow-[0_0_20px_rgba(232,93,206,0.65)] border border-white/25 flex items-center justify-center text-white shrink-0">
            <Trophy size={16} />
          </div>
        ) : isNvidia ? (
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-linear-to-br from-[#386BFF] to-[#60a5fa] shadow-[0_0_20px_rgba(56,107,255,0.65)] border border-white/25 flex items-center justify-center text-white shrink-0">
            <Rocket size={16} />
          </div>
        ) : (
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-linear-to-br from-[#8B3DFF] to-[#B69AFF] shadow-[0_0_20px_rgba(139,61,255,0.5)] border border-white/25 flex items-center justify-center text-white shrink-0">
            <Award size={16} />
          </div>
        )}
      </div>

      {/* ─── 1. DESKTOP INTERNAL LAYOUT (lg:grid lg:grid-cols-12 - Preserved 100%) ─── */}
      <div className="hidden lg:grid grid-cols-12 gap-4 xl:gap-6 items-center relative z-10">
        {/* Left Side: Issuer, Date, Title, Description, Skills, Button (7 cols) */}
        <div
          className={`col-span-7 flex flex-col justify-between space-y-2.5 xl:space-y-3 pr-0 sm:pr-2 ${
            isNvidia ? 'pl-8 xl:pl-10' : ''
          }`}
        >
          {/* Issuer Brand Row */}
          <div className="flex items-center gap-2.5">
            {isHackerRank ? (
              <HackerRankLogo />
            ) : isNvidia ? (
              <NvidiaLogo />
            ) : (
              <div className="w-7 h-7 rounded-lg bg-[#8B3DFF]/20 border border-[#8B3DFF]/40 flex items-center justify-center text-[#B69AFF] shrink-0">
                <ShieldCheck size={14} />
              </div>
            )}
            <span
              className="cert-card-issuer font-sans font-bold text-white text-base sm:text-lg tracking-tight"
              style={{ color: '#ffffff' }}
            >
              {cert.issuer}
            </span>
          </div>

          {/* Issue Date */}
          <div className="flex items-center gap-1.5">
            <Calendar size={11} className={`cert-date-icon ${dateColor}`} />
            <span
              className={`cert-date-text text-[10px] sm:text-xs font-mono font-semibold tracking-wider uppercase ${dateColor}`}
            >
              {cert.issueDate}
            </span>
          </div>

          {/* Certification Title */}
          <h3
            className="cert-card-title font-sans font-bold text-white text-base xl:text-lg 2xl:text-xl leading-snug tracking-tight line-clamp-2"
            style={{ color: '#ffffff' }}
          >
            {cert.title}
          </h3>

          {/* Short Description */}
          {summaryText && (
            <p
              className="cert-card-desc font-sans text-xs sm:text-[13px] text-[#E2E8F0] leading-relaxed line-clamp-3"
              style={{ color: '#f1f5f9' }}
            >
              {summaryText}
            </p>
          )}

          {/* Skills Pills */}
          {rawSkills.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              {rawSkills.map((skill, sIdx) => (
                <span
                  key={sIdx}
                  className="cert-skill-pill inline-flex items-center text-[10px] sm:text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-white/12 border border-white/20 text-[#F1F5F9]"
                >
                  {skill}
                </span>
              ))}
              {remainingSkillsCount > 0 && (
                <span className="cert-skill-pill-more inline-flex items-center text-[10px] sm:text-[11px] font-mono px-2 py-0.5 rounded-full bg-white/16 border border-white/25 text-white">
                  +{remainingSkillsCount}
                </span>
              )}
            </div>
          )}

          {/* View Certificate Action Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onViewDoc(cert)
              }}
              className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 sm:px-4.5 sm:py-2.5 rounded-xl text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer active:scale-95 ${btnGradient}`}
            >
              <Eye size={14} />
              <span>View Certificate</span>
              <ArrowUpRight size={13} className="opacity-80" />
            </button>
          </div>
        </div>

        {/* Right Side: Certificate Image Preview in Framed Window (5 cols) */}
        <div className="col-span-5 w-full">
          <div
            onClick={(e) => {
              e.stopPropagation()
              onViewDoc(cert)
            }}
            className={`group/preview relative rounded-2xl border p-2 shadow-2xl overflow-hidden aspect-16/11 flex items-center justify-center cursor-pointer transition-transform duration-300 hover:scale-[1.02] ${previewBg}`}
          >
            {thumbUrl ? (
              <img
                src={thumbUrl}
                alt={cert.title}
                loading="lazy"
                className="w-full h-full object-contain rounded-xl transition-transform duration-500 group-hover/preview:scale-[1.04]"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-4 text-[#E2E8F0]">
                <Award size={28} className={dateColor} />
                <span className="text-xs font-mono mt-1 text-[#E2E8F0]">Official Credential</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── 2. MOBILE & TABLET INTERNAL LAYOUT (Clean Vertical Flow) ─── */}
      <div className="flex lg:hidden flex-col space-y-3 relative z-10 w-full max-w-full min-w-0">
        {/* Row 1: Issuer Brand + Top-Right Floating Badge */}
        <div className="flex items-center justify-between gap-2 w-full min-w-0">
          <div className="flex items-center gap-2.5 min-w-0">
            {isHackerRank ? (
              <HackerRankLogo />
            ) : isNvidia ? (
              <NvidiaLogo />
            ) : (
              <div className="w-7 h-7 rounded-lg bg-[#8B3DFF]/20 border border-[#8B3DFF]/40 flex items-center justify-center text-[#B69AFF] shrink-0">
                <ShieldCheck size={14} />
              </div>
            )}
            <span
              className="cert-card-issuer font-sans font-bold text-white text-base tracking-tight truncate"
              style={{ color: '#ffffff' }}
            >
              {cert.issuer}
            </span>
          </div>

          {/* Floating Badge (Mobile Compact Size) */}
          <div className="cert-badge-icon shrink-0">
            {isHackerRank ? (
              <div className="w-8 h-8 rounded-full bg-linear-to-br from-[#FF4E98] to-[#8B3DFF] shadow-[0_0_14px_rgba(232,93,206,0.6)] border border-white/20 flex items-center justify-center text-white shrink-0">
                <Trophy size={14} />
              </div>
            ) : isNvidia ? (
              <div className="w-8 h-8 rounded-full bg-linear-to-br from-[#386BFF] to-[#60a5fa] shadow-[0_0_14px_rgba(56,107,255,0.6)] border border-white/20 flex items-center justify-center text-white shrink-0">
                <Rocket size={14} />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-linear-to-br from-[#8B3DFF] to-[#B69AFF] shadow-[0_0_14px_rgba(139,61,255,0.5)] border border-white/20 flex items-center justify-center text-white shrink-0">
                <Award size={14} />
              </div>
            )}
          </div>
        </div>

        {/* Row 2: Issue Date & Credential Number */}
        <div className="flex items-center gap-2 flex-wrap w-full min-w-0">
          <span className={`cert-date-text inline-flex items-center gap-1.5 text-[11px] font-mono font-semibold tracking-wider uppercase ${dateColor}`}>
            <Calendar size={11} className={`cert-date-icon ${dateColor}`} />
            <span>{cert.issueDate}</span>
          </span>
          <span className="text-white/40 text-xs">•</span>
          <span className="cert-credential-pill text-[10px] font-mono text-[#E2E8F0] bg-white/10 px-2 py-0.5 rounded-md border border-white/18 shrink-0">
            Credential {String(index + 1).padStart(2, '0')}/{String(totalCount).padStart(2, '0')}
          </span>
        </div>

        {/* Row 3: Certification Title */}
        <h3
          className="cert-card-title font-sans font-bold text-white text-base sm:text-lg leading-snug tracking-tight break-words w-full min-w-0"
          style={{ color: '#ffffff' }}
        >
          {cert.title}
        </h3>

        {/* Row 4: Short Description */}
        {summaryText && (
          <p
            className="cert-card-desc font-sans text-xs sm:text-[13px] text-[#E2E8F0] leading-relaxed break-words w-full min-w-0"
            style={{ color: '#f1f5f9' }}
          >
            {summaryText}
          </p>
        )}

        {/* Row 5: Compact Skill Tags */}
        {rawSkills.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5 w-full min-w-0">
            {rawSkills.map((skill, sIdx) => (
              <span
                key={sIdx}
                className="cert-skill-pill inline-flex items-center text-[10.5px] font-mono px-2.5 py-0.5 rounded-full bg-white/12 border border-white/20 text-[#F1F5F9] break-words"
              >
                {skill}
              </span>
            ))}
            {remainingSkillsCount > 0 && (
              <span className="cert-skill-pill-more inline-flex items-center text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/16 border border-white/25 text-white shrink-0">
                +{remainingSkillsCount}
              </span>
            )}
          </div>
        )}

        {/* Row 6: Certificate Preview Image (Framed, compact max-h, object-contain, original aspect ratio) */}
        <div
          onClick={(e) => {
            e.stopPropagation()
            onViewDoc(cert)
          }}
          className={`group/preview relative rounded-2xl border p-2 shadow-xl overflow-hidden flex items-center justify-center cursor-pointer transition-transform duration-300 active:scale-[0.99] max-h-[160px] sm:max-h-[185px] w-full max-w-full ${previewBg}`}
        >
          {thumbUrl ? (
            <img
              src={thumbUrl}
              alt={cert.title}
              loading="lazy"
              className="max-h-[145px] sm:max-h-[170px] w-full h-auto object-contain rounded-xl"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-4 text-[#E2E8F0]">
              <Award size={28} className={dateColor} />
              <span className="text-xs font-mono mt-1 text-[#E2E8F0]">Official Credential</span>
            </div>
          )}
        </div>

        {/* Row 7: Full-Width View Certificate Button (Touch friendly >= 44px) */}
        <div className="pt-1 w-full min-w-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onViewDoc(cert)
            }}
            className={`w-full py-3 px-4 rounded-xl text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2 min-h-11 ${btnGradient} box-border`}
          >
            <Eye size={15} />
            <span>View Certificate</span>
            <ArrowUpRight size={14} className="opacity-80" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default CertificationCard
