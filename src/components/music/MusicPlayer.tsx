import React, { useEffect, useRef } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { X, ExternalLink, Sparkles, Volume2, Radio, Square } from 'lucide-react'
import { SiSpotify } from 'react-icons/si'
import { useMusic } from './useMusic'
import { MusicEqualizer } from './MusicEqualizer'
import { SpotifyEmbed } from './SpotifyEmbed'
import { musicConfig } from './music.config'

export const MusicPlayer: React.FC = () => {
  const {
    isOpen,
    setIsOpen,
    isPlaying,
    setIsPlaying,
    currentPreset,
    selectPresetById,
    playlists,
    loadingPlaylists,
    stopMusic,
  } = useMusic()

  const prefersReducedMotion = useReducedMotion()
  const playerRef = useRef<HTMLDivElement>(null)

  // Click outside to close (desktop & mobile)
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      // Don't close if clicked inside player or the navbar music button
      if (
        playerRef.current &&
        !playerRef.current.contains(target) &&
        !target.closest('.music-nav-btn')
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, setIsOpen])

  return (
    <>
      {/* ------------------------------------------------------------------ */}
      {/* Persistent panel — always mounted, animated via opacity/scale only  */}
      {/* This keeps the SpotifyEmbed iframe alive across open/close cycles.   */}
      {/* ------------------------------------------------------------------ */}
      <motion.aside
        ref={playerRef}
        initial={false}
        animate={
          isOpen
            ? { opacity: 1, scale: 1, y: 0 }
            : prefersReducedMotion
              ? { opacity: 0 }
              : { opacity: 0, scale: 0.94, y: -12 }
        }
        transition={{
          type: 'spring',
          damping: 26,
          stiffness: 340,
        }}
        style={{
          pointerEvents: isOpen ? 'auto' : 'none',
          visibility: isOpen ? 'visible' : 'hidden',
        }}
        className="music-player-popover fixed z-[70] top-[4.5rem] right-3 sm:right-6 md:right-8 lg:right-12 w-[calc(100vw-1.5rem)] sm:w-[380px] md:w-[400px] rounded-2xl overflow-hidden shadow-2xl select-none"
        role="dialog"
        aria-label="Spotify Music Player"
        aria-modal="true"
        aria-hidden={!isOpen}
      >
        {/* Ambient Aurora Glow inside Player Card */}
        <div
          className="absolute -top-24 -right-24 w-48 h-48 rounded-full pointer-events-none blur-3xl opacity-40"
          style={{
            background: currentPreset.accentColor
              ? `radial-gradient(circle, ${currentPreset.accentColor} 0%, transparent 70%)`
              : 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)',
          }}
        />

        {/* 1. Compact Header Bar */}
        <div className="music-player-header relative z-10 flex items-center justify-between px-3.5 py-2 sm:px-4 sm:py-2.5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#1ed760]/15 text-[#1ed760]">
              <SiSpotify size={13} />
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11.5px] sm:text-xs font-semibold text-white tracking-wide">
                  Spotify Player
                </span>
                <span
                  className={`inline-block w-1.5 h-1.5 rounded-full ${
                    isPlaying
                      ? 'bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse'
                      : 'bg-zinc-500'
                  }`}
                />
              </div>
              <p className="text-[9.5px] sm:text-[10px] text-zinc-400 font-medium leading-none mt-0.5">
                {isPlaying ? 'Active Playback' : 'Ready to Play'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Stop Music Button — only shown while playing */}
            {isPlaying && (
              <button
                type="button"
                onClick={stopMusic}
                className="music-stop-btn p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                aria-label="Stop music"
                title="Stop Music"
              >
                <Square size={13} />
              </button>
            )}

            {/* Close Button — music keeps playing */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="music-player-close-btn p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close player (music continues)"
              title="Close player (music continues)"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* 2. Main Player Body */}
        <div className="music-player-body relative z-10 p-3 sm:p-4 space-y-2 sm:space-y-3.5 overflow-y-auto">
          {/* Active Soundscape Card (Compact) */}
          <div className="music-track-card relative flex items-center gap-2.5 sm:gap-3 p-2 sm:p-2.5 rounded-xl bg-white/[0.04] border border-white/8">
            {/* Artwork with subtle floating shine */}
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden shrink-0 border border-white/15 shadow-md">
              {currentPreset.artworkUrl ? (
                <img
                  src={currentPreset.artworkUrl}
                  alt={currentPreset.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-900 to-indigo-950 text-violet-300">
                  <Radio size={16} />
                </div>
              )}

              {/* Equalizer overlay on artwork if playing */}
              {isPlaying && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center">
                  <MusicEqualizer isPlaying={true} variant="nav" accentColor="#ffffff" />
                </div>
              )}
            </div>

            {/* Track / Soundscape Info */}
            <div className="flex-1 min-w-0 pr-1">
              <div className="flex items-center gap-1">
                <span className="text-[8.5px] sm:text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.2 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/20">
                  {currentPreset.badgeText || 'SOUNDSCAPE'}
                </span>
              </div>
              <h4 className="text-[11px] sm:text-xs font-semibold text-white truncate mt-0.5">
                {currentPreset.title}
              </h4>
              <p className="text-[10px] sm:text-[11px] text-zinc-400 truncate leading-tight">
                {currentPreset.artistOrCurator}
              </p>
            </div>

            {/* Live Equalizer indicator */}
            <div className="shrink-0 flex items-center pr-0.5">
              <MusicEqualizer
                isPlaying={isPlaying}
                variant="player"
                accentColor={currentPreset.accentColor}
              />
            </div>
          </div>

          {/* Curated Soundscape Presets Switcher (Horizontally scrollable on mobile, grid on desktop) */}
          {musicConfig.ui.showTrackPresets && (
            <div className="music-presets-section">
              <div className="flex items-center justify-between mb-1 px-0.5">
                <span className="text-[9.5px] sm:text-[10px] font-medium uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                  <Sparkles size={10} className="text-amber-400" />
                  <span>Curated Soundscapes</span>
                </span>
                <span className="text-[9px] sm:text-[10px] text-zinc-500">
                  {loadingPlaylists ? '…' : `${playlists.length} Presets`}
                </span>
              </div>

              {loadingPlaylists ? (
                /* Skeleton pills while loading */
                <div className="flex overflow-x-auto gap-1.5 pb-0.5 sm:grid sm:grid-cols-3 sm:overflow-visible">
                  {[1, 2, 3].map((n) => (
                    <div
                      key={n}
                      className="music-preset-pill shrink-0 w-24 sm:w-auto h-[2.75rem] sm:h-[3.25rem] rounded-lg sm:rounded-xl bg-white/[0.03] border border-white/6 animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                <div className="flex overflow-x-auto no-scrollbar gap-1.5 pb-0.5 sm:grid sm:grid-cols-3 sm:gap-1.5 sm:overflow-visible">
                  {playlists.map((preset) => {
                    const isSelected = preset.id === currentPreset.id
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => selectPresetById(preset.id)}
                        className={`music-preset-pill shrink-0 sm:shrink flex flex-col items-start p-1.5 px-2.5 sm:p-2 rounded-lg sm:rounded-xl text-left transition-all min-w-[96px] max-w-[130px] sm:min-w-0 sm:max-w-none ${
                          isSelected
                            ? 'is-selected bg-violet-500/15 border-violet-400/35 text-white shadow-[0_0_12px_rgba(167,139,250,0.18)]'
                            : 'bg-white/[0.03] border-white/6 text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06]'
                        } border`}
                      >
                        <span className="text-[10px] sm:text-[10.5px] font-semibold leading-tight line-clamp-1">
                          {preset.title.split('&')[0].trim()}
                        </span>
                        <span className="text-[8.5px] sm:text-[9px] text-zinc-500 line-clamp-1 mt-0.5">
                          {preset.badgeText || 'Playlist'}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Official Spotify Interactive Embed — always mounted for persistent playback */}
          <div>
            <SpotifyEmbed
              spotifyUrl={currentPreset.spotifyUrl}
              height={musicConfig.ui.defaultEmbedHeight}
              title={currentPreset.title}
              onPlaybackStateChange={(playing) => setIsPlaying(playing)}
            />
          </div>

          {/* Quick tip / Spotify Attribution */}
          <div className="flex items-center justify-between pt-0.5 text-[9.5px] sm:text-[10.5px] text-zinc-400">
            <span className="inline-flex items-center gap-1 text-zinc-500">
              <Volume2 size={11} />
              <span>Interactive playback</span>
            </span>
            <a
              href={currentPreset.spotifyUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              <span>Open in Spotify</span>
              <ExternalLink size={10} />
            </a>
          </div>
        </div>
      </motion.aside>

      {/* Mobile backdrop — still uses AnimatePresence (doesn't affect iframe) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="music-player-backdrop fixed inset-0 z-[69] bg-black/40 backdrop-blur-[2px] md:hidden"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>
    </>
  )
}
