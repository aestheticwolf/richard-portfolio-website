const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-published-resume`

export async function hasPublishedResume() {
  const response = await fetch(functionUrl, { method: 'GET' })
  if (response.status === 404) return false
  if (!response.ok) throw new Error('Resume availability could not be checked.')
  return true
}

export async function getPublishedResumeDownloadUrl() {
  const response = await fetch(functionUrl, { method: 'POST' })
  if (response.status === 404) throw new Error('A resume is not available right now.')
  if (!response.ok) throw new Error('Resume download could not be prepared. Please try again.')

  const data = await response.json() as { signedUrl?: unknown }
  if (typeof data.signedUrl !== 'string') throw new Error('Resume download could not be prepared. Please try again.')
  return data.signedUrl
}
