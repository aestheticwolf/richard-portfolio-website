/**
 * Spotify Music Experience Configuration
 * ============================================================================
 * You can customize your favorite Spotify playlist, album, or track here.
 * 
 * Supported formats:
 * - Spotify URL: https://open.spotify.com/playlist/37i9dQZF1DXdLEN7aqioXM
 * - Spotify Track URL: https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT
 * - Spotify URI: spotify:playlist:37i9dQZF1DXdLEN7aqioXM
 * 
 * To use your own playlist:
 * 1. Open Spotify, click "..." on your playlist or track -> Share -> Copy link
 * 2. Replace the `spotifyUrl` in `defaultPlaylist` or add a new preset below!
 * ============================================================================
 */

export interface MusicPreset {
  id: string
  title: string
  artistOrCurator: string
  description: string
  spotifyUrl: string
  badgeText?: string
  accentColor?: string
  artworkUrl?: string
}

export interface MusicConfig {
  /** The default track or playlist loaded on initial player opening */
  defaultPlaylistId: string
  /** Display title for the music feature */
  featureTitle: string
  /** Subtitle or branding tagline */
  featureTagline: string
  /** Curated presets available in the player selector */
  presets: MusicPreset[]
  /** Player UI preferences */
  ui: {
    showEqualizer: boolean
    showTrackPresets: boolean
    autoCloseOnEsc: boolean
    defaultEmbedHeight: number
  }
}

export const musicConfig: MusicConfig = {
  defaultPlaylistId: 'chill-coding',
  featureTitle: 'Developer Soundscapes',
  featureTagline: 'Curated beats for code and focus',
  ui: {
    showEqualizer: true,
    showTrackPresets: true,
    autoCloseOnEsc: true,
    defaultEmbedHeight: 152, // 152px is Spotify's official compact track/playlist player height
  },
  presets: [
    {
      id: 'chill-coding',
      title: 'Chill Coding & Lo-Fi',
      artistOrCurator: 'Spotify Curated',
      description: 'Mellow beats, ambient synth, and peaceful coding flow',
      // Official Spotify Lo-Fi Beats Playlist
      spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DXdLEN7aqioXM',
      badgeText: 'LO-FI / BEATS',
      accentColor: '#a78bfa',
      artworkUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&auto=format&fit=crop&q=80',
    },
    {
      id: 'synthwave-focus',
      title: 'Synthwave & Retrowave',
      artistOrCurator: 'Nightride FM / Curated',
      description: 'Midnight retro-electronic synth lines for deep software engineering',
      // Official Spotify Synthwave from space / retrowave
      spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DXdLEN7aqioXM',
      badgeText: 'SYNTH / RETRO',
      accentColor: '#38bdf8',
      artworkUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=200&auto=format&fit=crop&q=80',
    },
    {
      id: 'deep-ambient',
      title: 'Deep Focus & Ambient',
      artistOrCurator: 'Ambient Soundscapes',
      description: 'Gentle, zero-distraction ambient frequencies for problem solving',
      // Official Spotify Deep Focus playlist
      spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DWZeKCadgRdKQ',
      badgeText: 'DEEP FOCUS',
      accentColor: '#34d399',
      artworkUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&auto=format&fit=crop&q=80',
    },
    /**
     * YOUR CUSTOM SPOTIFY PLAYLIST:
     * Uncomment or edit below to add your personal Spotify playlist:
     */
    /*
    {
      id: 'my-personal-playlist',
      title: "Richard's Work Mix",
      artistOrCurator: 'Curated by Richard',
      description: 'Personal favorite tracks for programming and product building',
      spotifyUrl: 'https://open.spotify.com/playlist/YOUR_PLAYLIST_ID_HERE',
      badgeText: 'PERSONAL MIX',
      accentColor: '#f43f5e',
    },
    */
  ],
}

/**
 * Utility to convert Spotify open URL to Spotify URI or Embed URL
 */
export function formatSpotifyEmbedUrl(inputUrlOrUri: string): string {
  if (!inputUrlOrUri) return ''

  // If already an embed URL
  if (inputUrlOrUri.includes('open.spotify.com/embed')) {
    return inputUrlOrUri
  }

  // Handle Spotify URI: spotify:playlist:XYZ or spotify:track:XYZ
  if (inputUrlOrUri.startsWith('spotify:')) {
    const parts = inputUrlOrUri.split(':')
    if (parts.length >= 3) {
      const type = parts[1]
      const id = parts[2]
      return `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`
    }
  }

  // Handle standard Spotify web URL: https://open.spotify.com/playlist/XYZ
  try {
    const url = new URL(inputUrlOrUri)
    const segments = url.pathname.split('/').filter(Boolean)
    if (segments.length >= 2) {
      const type = segments[0] // playlist, track, album
      const id = segments[1]
      return `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`
    }
  } catch {
    // If not a parseable URL, fallback as-is
  }

  return inputUrlOrUri
}
