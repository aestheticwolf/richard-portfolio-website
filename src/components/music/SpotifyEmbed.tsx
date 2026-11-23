import React, { useEffect, useRef, useState } from 'react'
import { formatSpotifyEmbedUrl } from './music.config'
import { Loader2, AlertCircle, ExternalLink } from 'lucide-react'

interface SpotifyEmbedProps {
  spotifyUrl: string
  height?: number
  onPlaybackStateChange?: (isPlaying: boolean) => void
  title?: string
  isLight?: boolean
}

export const SpotifyEmbed: React.FC<SpotifyEmbedProps> = ({
  spotifyUrl,
  height = 152,
  onPlaybackStateChange,
  title = 'Spotify Player',
  isLight = false,
}) => {
  const [loadedUrl, setLoadedUrl] = useState<string | null>(null)
  const [hasError, setHasError] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const embedUrl = formatSpotifyEmbedUrl(spotifyUrl)

  // Track vs playlist detection
  const isTrack = spotifyUrl.includes('/track/')

  // Detect mobile viewport (< 640px)
  // On mobile screens (< 640px), Spotify embeds automatically render in compact 80px bar format.
  // When given 152px on mobile, Spotify only draws the 80px widget and leaves the bottom 72px as a blank white/empty void.
  // Setting height to 80px on mobile (< 640px) or for any single track eliminates this blank space completely.
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 640
    }
    return false
  })

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const actualHeight = isMobile || isTrack ? 80 : (height || 152)

  const isLoading = loadedUrl !== embedUrl

  // Safety timeout: if iframe takes longer than 8s, dismiss loading skeleton
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setLoadedUrl(embedUrl)
    }, 8000)

    return () => window.clearTimeout(timeout)
  }, [embedUrl])

  // Listen for message events from Spotify iframe if available
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (typeof event.origin === 'string' && event.origin.includes('spotify.com')) {
        try {
          const payload = typeof event.data === 'string' ? JSON.parse(event.data) : event.data
          if (payload && payload.type === 'playback_update') {
            const isPaused = Boolean(payload.data?.isPaused)
            onPlaybackStateChange?.(!isPaused)
          }
        } catch {
          // Non-JSON message from other extensions or frames
        }
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [onPlaybackStateChange])

  return (
    <div
      ref={containerRef}
      className={`spotify-embed-container relative w-full overflow-hidden rounded-xl transition-all ${
        isLight
          ? 'bg-slate-900 border border-slate-200/80 shadow-md ring-1 ring-slate-900/5'
          : 'bg-[#121212] border border-white/8 shadow-md'
      }`}
      style={{
        minHeight: `${actualHeight}px`,
        height: `${actualHeight}px`,
        lineHeight: 0,
      }}
    >
      {/* Loading Skeleton Shimmer */}
      {isLoading && !hasError && (
        <div
          className={`absolute inset-0 z-10 flex flex-col items-center justify-center gap-1.5 backdrop-blur-md transition-opacity duration-300 ${
            isLight ? 'bg-slate-900/90' : 'bg-[#121212]/95'
          }`}
          style={{ minHeight: `${actualHeight}px`, height: `${actualHeight}px` }}
        >
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-300">
            <Loader2 size={15} className="animate-spin text-emerald-400" />
            <span>Connecting to Spotify...</span>
          </div>
          <div className="h-1 w-28 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-1/2 animate-[pulse_1.5s_ease-in-out_infinite] rounded-full bg-emerald-500/60" />
          </div>
        </div>
      )}

      {/* Error State Fallback */}
      {hasError && (
        <div
          className="flex flex-col items-center justify-center gap-1.5 p-3 text-center text-xs text-zinc-400 bg-red-950/20"
          style={{ minHeight: `${actualHeight}px`, height: `${actualHeight}px` }}
        >
          <AlertCircle size={18} className="text-amber-400" />
          <p className="font-medium text-zinc-300 text-[11px]">Unable to load Spotify embed</p>
          <a
            href={spotifyUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:underline"
          >
            <span>Open track on Spotify</span>
            <ExternalLink size={11} />
          </a>
        </div>
      )}

      {/* Official Spotify IFrame Embed */}
      <iframe
        key={`${embedUrl}-${actualHeight}-${isLight ? 'light' : 'dark'}`}
        src={embedUrl}
        width="100%"
        height={actualHeight}
        style={{
          border: 0,
          borderRadius: '12px',
          display: 'block',
          width: '100%',
          height: `${actualHeight}px`,
          backgroundColor: '#121212',
          colorScheme: 'dark',
        }}
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        title={title}
        className={`w-full transition-opacity duration-300 ${isTrack || isMobile ? 'is-track-height' : 'is-playlist-height'}`}
        onLoad={() => {
          setLoadedUrl(embedUrl)
          setHasError(false)
        }}
        onError={() => {
          setHasError(true)
          setLoadedUrl(embedUrl)
        }}
      />
    </div>
  )
}
