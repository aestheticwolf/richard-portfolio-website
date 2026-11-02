export type ResumeRequest = {
  name: string
  email: string
}

const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/submit-resume-request`
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export async function submitResumeRequest(request: ResumeRequest) {
  let response: Response

  try {
    response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: publishableKey,
      },
      body: JSON.stringify({ full_name: request.name, email: request.email }),
    })
  } catch {
    throw new Error('Unable to submit your request. Please try again.')
  }

  const data = await response.json().catch((): unknown => null)
  if (response.ok && typeof data === 'object' && data !== null && (data as { success?: unknown }).success === true) {
    return
  }

  switch (response.status) {
    case 400:
      throw new Error('Please check your name and email address.')
    case 403:
      throw new Error('Resume requests are unavailable from this website.')
    case 429:
      throw new Error('Too many requests. Please try again later.')
    case 500:
      throw new Error('Resume request service is unavailable. Please try again later.')
    default:
      throw new Error('Unable to submit your request. Please try again.')
  }
}
