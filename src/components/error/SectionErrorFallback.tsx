import { useState, useEffect } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'

interface SectionErrorFallbackProps {
  title?: string
  description?: string
  onRetry?: () => void | Promise<void>
  className?: string
}

export default function SectionErrorFallback({
  title = 'Unable to Load This Section',
  description = 'Something prevented this content from loading properly.',
  onRetry,
  className = '',
}: SectionErrorFallbackProps) {
  const [retrying, setRetrying] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'
    }
    return 'dark'
  })

  useEffect(() => {
    const update = () => {
      setTheme(document.documentElement.dataset.theme === 'light' ? 'light' : 'dark')
    }
    const obs = new MutationObserver(update)
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => obs.disconnect()
  }, [])

  const isLight = theme === 'light'

  const handleRetry = async () => {
    if (!onRetry) return
    setRetrying(true)
    try {
      await onRetry()
    } finally {
      setTimeout(() => setRetrying(false), 500)
    }
  }

  return (
    <div
      role="alert"
      className={`relative w-full rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center overflow-hidden transition-colors border ${
        isLight ? 'bg-white border-slate-200/90 shadow-sm' : 'bg-white/3 border-white/10'
      } ${className}`}
    >
      <div
        className={`flex items-center justify-center w-12 h-12 rounded-full mb-4 shadow-sm border transition-colors ${
          isLight
            ? 'bg-violet-50 border-violet-200 text-violet-600'
            : 'bg-violet-500/10 border-violet-400/20 text-violet-400'
        }`}
      >
        <AlertCircle size={22} />
      </div>

      <h3
        className={`text-base sm:text-lg font-semibold mb-2 tracking-tight transition-colors ${
          isLight ? 'text-slate-900' : 'text-white'
        }`}
      >
        {title}
      </h3>

      <p
        className={`text-sm max-w-md mb-6 leading-relaxed transition-colors ${
          isLight ? 'text-slate-600' : 'text-zinc-400'
        }`}>
        {description}
      </p>

      {onRetry && (
        <button
          type="button"
          onClick={handleRetry}
          disabled={retrying}
          className="section-error-retry-btn active:scale-95 disabled:opacity-50"
        >
          <RefreshCw size={13} className={retrying ? 'animate-spin' : ''} />
          <span>Retry Loading</span>
        </button>
      )}
    </div>
  )
}
