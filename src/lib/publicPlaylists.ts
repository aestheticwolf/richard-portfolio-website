/**
 * Public Playlists — Supabase integration for music_playlists table
 * Fetches active public playlists and maps them to MusicPreset shape.
 */

import { supabase } from './supabase'
import type { MusicPreset } from '../components/music/music.config'

// Re-export MusicPreset so callers can import from one place
export type { MusicPreset }

/** Shape of a row in the music_playlists table */
export interface DbPlaylist {
  id: string
  title: string
  spotify_url: string
  spotify_type: string
  description: string | null
  artist_or_curator: string | null
  category: string | null
  badge_text: string | null
  artwork_url: string | null
  accent_color: string | null
  sort_order: number
  collection: 'public' | 'admin'
  is_active: boolean
  is_default: boolean
  created_at: string
  updated_at: string
}

/**
 * Fetch active public playlists from Supabase, ordered by sort_order then created_at.
 */
export async function fetchPublicPlaylists(): Promise<DbPlaylist[]> {
  const { data, error } = await supabase
    .from('music_playlists')
    .select('*')
    .eq('collection', 'public')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) {
    console.error('[publicPlaylists] fetch error:', error.message)
    return []
  }

  return (data as DbPlaylist[]) ?? []
}

/**
 * Map a DB row to the MusicPreset interface used throughout the music components.
 */
export function mapDbPlaylistToPreset(db: DbPlaylist): MusicPreset {
  return {
    id: db.id,
    title: db.title,
    artistOrCurator: db.artist_or_curator ?? '',
    description: db.description ?? '',
    spotifyUrl: db.spotify_url,
    badgeText: db.badge_text ?? undefined,
    accentColor: db.accent_color ?? undefined,
    artworkUrl: db.artwork_url ?? undefined,
  }
}
