import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

type Theme = 'light' | 'dark'

const storageKey = 'richard-portfolio-theme'

function readTheme(): Theme {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(readTheme)

  useEffect(() => {
    const syncTheme = () => setTheme(readTheme())
    window.addEventListener('storage', syncTheme)
    return () => window.removeEventListener('storage', syncTheme)
  }, [])

  const toggleTheme = () => {
    const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark'

    // Zero-lag instant theme switch: temporarily suppress transitions across the DOM
    // to prevent hundreds of CSS properties from animating simultaneously
    const styleEl = document.createElement('style')
    styleEl.setAttribute('id', 'disable-theme-transitions')
    styleEl.textContent = `
      *, *::before, *::after {
        -webkit-transition: none !important;
        -moz-transition: none !important;
        -o-transition: none !important;
        -ms-transition: none !important;
        transition: none !important;
      }
    `
    document.head.appendChild(styleEl)

    document.documentElement.dataset.theme = nextTheme
    document.documentElement.style.colorScheme = nextTheme
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(nextTheme)
    localStorage.setItem(storageKey, nextTheme)
    setTheme(nextTheme)

    // Force layout / reflow so styles are applied synchronously in this frame
    void window.getComputedStyle(document.documentElement).opacity

    // Re-enable transitions on the subsequent frame for smooth user hover/click interactions
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const el = document.getElementById('disable-theme-transitions')
        if (el) el.remove()
      })
    })
  }

  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="theme-toggle"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
    >
      <span className="theme-toggle-icon inline-flex items-center justify-center shrink-0">
        {isDark ? <Sun size={15} aria-hidden="true" /> : <Moon size={15} aria-hidden="true" />}
      </span>
      <span className="theme-toggle-label hidden sm:inline text-xs font-semibold tracking-wide">
        {isDark ? 'Light' : 'Dark'}
      </span>
    </button>
  )
}
