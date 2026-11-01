
import { supabase } from './supabase'

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
  updated_at: string
}

export async function getPublishedProfile(): Promise<PublicProfile | null> {
  const { data, error } = await supabase
    .from('portfolio_profile')
    .select(
      `
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
        updated_at
      `,
    )
    .eq('status', 'published')
    .maybeSingle()

  if (error) {
    throw new Error(`Unable to load portfolio profile: ${error.message}`)
  }

  return data as PublicProfile | null
}
