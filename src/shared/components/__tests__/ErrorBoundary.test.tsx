import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ErrorBoundary } from '../ErrorBoundary'

// Component that throws on demand
const ThrowingComponent = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) throw new Error('Test error message')
  return <div>Normal content</div>
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // Suppress console.error for expected throws
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={false} />
      </ErrorBoundary>,
    )
    expect(screen.getByText('Normal content')).toBeInTheDocument()
  })

  it('renders default fallback UI when child throws', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>,
    )
    expect(screen.getByText('發生錯誤')).toBeInTheDocument()
    expect(screen.getByText('Test error message')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /重試/i })).toBeInTheDocument()
  })

  it('renders custom fallback when provided and child throws', () => {
    render(
      <ErrorBoundary fallback={<div>Custom fallback</div>}>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>,
    )
    expect(screen.getByText('Custom fallback')).toBeInTheDocument()
    expect(screen.queryByText('發生錯誤')).not.toBeInTheDocument()
  })

  it('resets error state when 重試 is clicked', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>,
    )
    expect(screen.getByText('發生錯誤')).toBeInTheDocument()

    // Swap to non-throwing first, then click Try again to reset hasError
    rerender(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={false} />
      </ErrorBoundary>,
    )
    // Still shows error (hasError is still true)
    expect(screen.getByText('發生錯誤')).toBeInTheDocument()

    // Click 重試 → resets hasError → children re-render without throwing
    fireEvent.click(screen.getByRole('button', { name: /重試/i }))
    expect(screen.getByText('Normal content')).toBeInTheDocument()
  })

  it('calls console.error when child throws', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>,
    )
    expect(console.error).toHaveBeenCalled()
  })
})
