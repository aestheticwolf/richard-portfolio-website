/**
 * Contact Form Security & Client-Side Rate Limiter
 * 
 * Provides defense-in-depth for Richard's portfolio contact form:
 * 1. Honeypot verification against automated spambots.
 * 2. Time-to-submit verification (blocks sub-second automated scripts).
 * 3. 60-second cooldown between consecutive submissions.
 * 4. Session rate limit (maximum 3 messages per rolling hour).
 * 5. Duplicate content detection (blocks repeated spamming of identical messages).
 * 6. Format and length validation for Name, Email, and Message.
 */

const STORAGE_KEY = 'rd_portfolio_contact_rate_limit'
const COOLDOWN_SECONDS = 60
const MAX_HOURLY_SUBMISSIONS = 3
const ONE_HOUR_MS = 60 * 60 * 1000
const MIN_FILL_TIME_MS = 2000 // Humans take at least 2 seconds to complete name, email, and message

interface SubmissionRecord {
  timestamp: number
  signature: string
}

interface RateLimitStorage {
  records: SubmissionRecord[]
  lastSubmittedAt: number
}

function getStorage(): RateLimitStorage {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { records: [], lastSubmittedAt: 0 }
    const parsed = JSON.parse(raw) as RateLimitStorage
    const now = Date.now()
    // Clean up records older than 1 hour
    const activeRecords = (parsed.records || []).filter(
      (r) => typeof r.timestamp === 'number' && now - r.timestamp < ONE_HOUR_MS
    )
    return {
      records: activeRecords,
      lastSubmittedAt: typeof parsed.lastSubmittedAt === 'number' ? parsed.lastSubmittedAt : 0,
    }
  } catch {
    return { records: [], lastSubmittedAt: 0 }
  }
}

function saveStorage(data: RateLimitStorage): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // Gracefully handle storage quota or private browsing limits
  }
}

function createSignature(email: string, message: string): string {
  const normalizedEmail = email.trim().toLowerCase()
  const normalizedMessage = message.trim().toLowerCase().slice(0, 100)
  return `${normalizedEmail}:${normalizedMessage}`
}

export interface SecurityCheckResult {
  allowed: boolean
  message?: string
}

/**
 * Validates the contact submission against spam triggers and rate limits.
 */
export function validateContactSubmission(params: {
  name: string
  email: string
  message: string
  botcheck?: boolean | string | null
  fillDurationMs?: number
}): SecurityCheckResult {
  const { name, email, message, botcheck, fillDurationMs } = params

  // 1. Honeypot check (hidden checkbox that only dumb bots check)
  if (botcheck) {
    return {
      allowed: false,
      message: 'Suspicious submission detected. Please try again.',
    }
  }

  // 2. Minimum fill time check (bots submit immediately)
  if (typeof fillDurationMs === 'number' && fillDurationMs > 0 && fillDurationMs < MIN_FILL_TIME_MS) {
    return {
      allowed: false,
      message: 'Please take a moment to review your message before submitting.',
    }
  }

  // 3. Name validation
  const cleanName = name.trim()
  if (!cleanName || cleanName.length < 2) {
    return {
      allowed: false,
      message: 'Please provide your name (at least 2 characters).',
    }
  }

  // 4. Email validation
  const cleanEmail = email.trim()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
  if (!cleanEmail || !emailRegex.test(cleanEmail)) {
    return {
      allowed: false,
      message: 'Please provide a valid email address.',
    }
  }

  // 5. Message validation
  const cleanMessage = message.trim()
  if (!cleanMessage || cleanMessage.length < 10) {
    return {
      allowed: false,
      message: 'Please provide a message with at least 10 characters.',
    }
  }

  // 6. Rate Limiting & Cooldown checks via LocalStorage
  const storage = getStorage()
  const now = Date.now()

  // Cooldown check (60 seconds)
  if (storage.lastSubmittedAt > 0) {
    const elapsedSeconds = Math.floor((now - storage.lastSubmittedAt) / 1000)
    if (elapsedSeconds < COOLDOWN_SECONDS) {
      const remainingSeconds = COOLDOWN_SECONDS - elapsedSeconds
      return {
        allowed: false,
        message: `Please wait ${remainingSeconds} second${remainingSeconds === 1 ? '' : 's'} before sending another message.`,
      }
    }
  }

  // Hourly limit check
  if (storage.records.length >= MAX_HOURLY_SUBMISSIONS) {
    return {
      allowed: false,
      message: 'Message limit reached for this session. Please email rich.dsz1997@gmail.com directly.',
    }
  }

  // Duplicate submission check
  const incomingSignature = createSignature(cleanEmail, cleanMessage)
  const isDuplicate = storage.records.some((record) => record.signature === incomingSignature)
  if (isDuplicate) {
    return {
      allowed: false,
      message: 'This message has already been received. Thank you for your patience.',
    }
  }

  return { allowed: true }
}

/**
 * Records a successful submission to maintain rate limits across page refreshes.
 */
export function recordContactSubmission(email: string, message: string): void {
  const storage = getStorage()
  const now = Date.now()
  const signature = createSignature(email, message)

  const updatedRecords = [
    ...storage.records.filter((r) => now - r.timestamp < ONE_HOUR_MS),
    { timestamp: now, signature },
  ]

  saveStorage({
    records: updatedRecords,
    lastSubmittedAt: now,
  })
}

