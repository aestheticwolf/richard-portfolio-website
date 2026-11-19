import { supabase } from './supabase'

export interface PublicCertification {
  id: string
  title: string
  issuer: string
  issueDate: string
  credentialId?: string
  credentialUrl?: string
  description?: string
  skills: string[]
  certificateUrl?: string
  fileType: 'image' | 'pdf' | null
  displayOrder: number
}

type SupabaseCertRow = {
  id: string
  title: string
  issuer: string
  issue_date: string
  credential_id: string | null
  credential_url: string | null
  description: string | null
  skills: string[] | null
  certificate_url: string | null
  file_type: 'image' | 'pdf' | null
  display_order: number
}

function sanitizeUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined
  const trimmed = url.trim()
  try {
    const parsed = new URL(trimmed)
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return trimmed
    }
    return undefined
  } catch {
    return undefined
  }
}

export function detectFileType(url: string | null | undefined): 'image' | 'pdf' | null {
  if (!url) return null
  const clean = url.split('?')[0].toLowerCase()
  if (clean.endsWith('.pdf')) return 'pdf'
  if (/\.(jpe?g|png|webp|gif|svg)$/.test(clean)) return 'image'
  return 'image'
}

/**
 * Cloudinary PDF rasterizer helper:
 * Converts page 1 of Cloudinary-hosted PDFs into an instant high-resolution .jpg thumbnail.
 */
export function getCertificateThumbnailUrl(
  url: string | null | undefined,
  fileType?: 'image' | 'pdf' | null,
): string | null {
  if (!url) return null
  const type = fileType || detectFileType(url)
  if (type === 'pdf' && url.includes('res.cloudinary.com')) {
    return url.replace(/\.pdf(\?.*)?$/i, '.jpg$1')
  }
  return url
}

export async function getPublishedCertifications(): Promise<PublicCertification[]> {
  const { data, error } = await supabase
    .from('certifications')
    .select('id, title, issuer, issue_date, credential_id, credential_url, description, skills, certificate_url, file_type, display_order')
    .eq('is_published', true)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[Certifications] Load error:', error.message)
    return []
  }

  const rows = (data ?? []) as SupabaseCertRow[]
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    issuer: row.issuer,
    issueDate: row.issue_date,
    credentialId: row.credential_id || undefined,
    credentialUrl: sanitizeUrl(row.credential_url),
    description: row.description || undefined,
    skills: row.skills || [],
    certificateUrl: sanitizeUrl(row.certificate_url),
    fileType: row.file_type || detectFileType(row.certificate_url),
    displayOrder: row.display_order ?? 0,
  }))
}
