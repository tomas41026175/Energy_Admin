import { Component, type ReactNode } from 'react'

const MAX_RETRY_COUNT = 3

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  retryCount: number
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null, retryCount: 0 }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error }
  }

  componentDidCatch(): void {
    // Production: integrate with error tracking service (e.g. Sentry)
  }

  private handleRetry = (): void => {
    if (this.state.retryCount >= MAX_RETRY_COUNT) return
    this.setState((prev) => ({
      hasError: false,
      error: null,
      retryCount: prev.retryCount + 1,
    }))
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      const isMaxRetry = this.state.retryCount >= MAX_RETRY_COUNT

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">發生錯誤</h2>
          <p className="text-gray-600 mb-4">{this.state.error?.message}</p>
          {isMaxRetry ? (
            <p className="text-sm text-gray-500">已重試 {MAX_RETRY_COUNT} 次，請重新整理頁面。</p>
          ) : (
            <button
              onClick={this.handleRetry}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              重試（{this.state.retryCount}/{MAX_RETRY_COUNT}）
            </button>
          )}
        </div>
      )
    }

    return this.props.children
  }
}
