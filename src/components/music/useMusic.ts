import { createContext, useContext } from 'react'
import type { MusicPreset } from './music.config'

export interface MusicContextValue {
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  toggleOpen: () => void
  isPlaying: boolean
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>
  /** True when the user explicitly stopped playback (signals iframe not to auto-resume) */
  isStopped: boolean
  currentPreset: MusicPreset
  setCurrentPreset: (preset: MusicPreset) => void
  selectPresetById: (id: string) => void
  /** Dynamically loaded playlists (from Supabase, with config fallback) */
  playlists: MusicPreset[]
  /** True while the initial playlist fetch is in-flight */
  loadingPlaylists: boolean
  /** Stop playback and set isStopped flag */
  stopMusic: () => void
}

export const MusicContext = createContext<MusicContextValue | undefined>(undefined)

export function useMusic(): MusicContextValue {
  const context = useContext(MusicContext)
  if (!context) {
    throw new Error('useMusic must be used within a MusicProvider')
  }
  return context
}
