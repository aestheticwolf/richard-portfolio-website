import React, { useState, useEffect, useCallback } from 'react'
import { musicConfig, type MusicPreset } from './music.config'
import { MusicContext } from './useMusic'
import { fetchPublicPlaylists, mapDbPlaylistToPreset } from '../../lib/publicPlaylists'

const FALLBACK_PRESETS = musicConfig.presets

function resolveDefault(presets: MusicPreset[]): MusicPreset {
  return presets[0]
}

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isStopped, setIsStopped] = useState(false)

  const [playlists, setPlaylists] = useState<MusicPreset[]>(FALLBACK_PRESETS)
  const [loadingPlaylists, setLoadingPlaylists] = useState(true)
  const [currentPreset, setCurrentPreset] = useState<MusicPreset>(resolveDefault(FALLBACK_PRESETS))

  // Load playlists from Supabase on mount
  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoadingPlaylists(true)
      try {
        const rows = await fetchPublicPlaylists()
        if (cancelled) return

        if (rows.length === 0) {
          // Fallback to config presets
          setPlaylists(FALLBACK_PRESETS)
          setCurrentPreset(resolveDefault(FALLBACK_PRESETS))
        } else {
          const mapped = rows.map(mapDbPlaylistToPreset)
          setPlaylists(mapped)

          // Prefer is_default from DB, else first
          const defaultRow = rows.find((r) => r.is_default) ?? rows[0]
          setCurrentPreset(mapped.find((p) => p.id === defaultRow.id) ?? mapped[0])
        }
      } catch {
        if (cancelled) return
        // Fallback to config presets on any error
        setPlaylists(FALLBACK_PRESETS)
        setCurrentPreset(resolveDefault(FALLBACK_PRESETS))
      } finally {
        if (!cancelled) setLoadingPlaylists(false)
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [])

  // Listen for Escape key to close player
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const toggleOpen = useCallback(() => setIsOpen((prev) => !prev), [])

  const selectPresetById = useCallback(
    (id: string) => {
      const found = playlists.find((p) => p.id === id)
      if (found) {
        setCurrentPreset(found)
        setIsStopped(false)
      }
    },
    [playlists],
  )

  const stopMusic = useCallback(() => {
    setIsPlaying(false)
    setIsStopped(true)
  }, [])

  return (
    <MusicContext.Provider
      value={{
        isOpen,
        setIsOpen,
        toggleOpen,
        isPlaying,
        setIsPlaying,
        isStopped,
        currentPreset,
        setCurrentPreset,
        selectPresetById,
        playlists,
        loadingPlaylists,
        stopMusic,
      }}
    >
      {children}
    </MusicContext.Provider>
  )
}
