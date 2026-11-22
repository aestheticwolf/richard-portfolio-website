import { Component, type ErrorInfo, type ReactNode } from 'react'
import ErrorView from './ErrorView'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onReset?: () => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log safely for internal monitoring if needed, never exposed in DOM
    if (import.meta.env.DEV) {
      console.error('[Portfolio ErrorBoundary caught]:', error, errorInfo)
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    if (this.props.onReset) {
      this.props.onReset()
    } else {
      window.location.reload()
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Safe production error view — 500 status without leaking technical details
      return (
        <ErrorView
          code={500}
          onRetry={this.handleReset}
        />
      )
    }

    return this.props.children
  }
}
