const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/redeem-resume-access-link`
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL

export async function redeemResumeAccess(token: string): Promise<string> {
  let response: Response

  try {
    response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: publishableKey,
      },
      body: JSON.stringify({ token }),
    })
  } catch {
    throw new Error('Unable to connect. Please try again later.')
  }

  const data: unknown = await response.json().catch(() => null)

  if (
    response.ok &&
    typeof data === 'object' &&
    data !== null &&
    'signedUrl' in data &&
    typeof data.signedUrl === 'string'
  ) {
    try {
      const signedUrl = new URL(data.signedUrl)
      const expectedOrigin = new URL(supabaseUrl).origin

      if (signedUrl.protocol !== 'https:' || signedUrl.origin !== expectedOrigin) {
        throw new Error('Invalid download destination.')
      }

      return signedUrl.toString()
    } catch {
      throw new Error('Unable to prepare your resume download.')
    }
  }

  switch (response.status) {
    case 404:
      throw new Error('This resume access link is invalid or unavailable.')
    case 409:
      throw new Error('This resume access link has already been used.')
    case 410:
      throw new Error('This resume access link has expired or been revoked.')
    case 500:
      throw new Error('Resume access is temporarily unavailable. Please try again later.')
    default:
      throw new Error('Unable to access the resume. Please try again later.')
  }
}