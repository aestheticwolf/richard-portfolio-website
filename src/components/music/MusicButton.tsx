import React from 'react'
import { Music2 } from 'lucide-react'
import { useMusic } from './useMusic'
import { MusicEqualizer } from './MusicEqualizer'

interface MusicButtonProps {
  className?: string
}

export const MusicButton: React.FC<MusicButtonProps> = ({ className = '' }) => {
  const { isOpen, toggleOpen, isPlaying, currentPreset } = useMusic()

  return (
    <button
      type="button"
      onClick={toggleOpen}
      className={`music-nav-btn ${isOpen ? 'is-open' : ''} ${isPlaying ? 'is-playing' : ''} ${className}`}
      aria-label={
        isPlaying
          ? `Music playing: ${currentPreset.title}. Click to open player`
          : 'Open Spotify music player'
      }
      aria-expanded={isOpen}
      title={
        isPlaying
          ? `Now Playing: ${currentPreset.title}`
          : 'Soundscapes & Music'
      }
    >
      <span className="music-nav-icon inline-flex items-center justify-center shrink-0">
        {isPlaying ? (
          <MusicEqualizer isPlaying={true} variant="nav" accentColor="#34d399" />
        ) : (
          <Music2 size={15} aria-hidden="true" />
        )}
      </span>

      <span className="music-nav-label hidden sm:inline text-xs font-semibold tracking-wide">
        {isPlaying ? 'Now Playing' : 'Music'}
      </span>

      {/* Tiny active playing badge dot */}
      {isPlaying && (
        <span
          className="music-playing-dot absolute top-1.5 right-1.5 sm:static sm:top-auto sm:right-auto w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse shrink-0"
          aria-hidden="true"
        />
      )}
    </button>
  )
}
