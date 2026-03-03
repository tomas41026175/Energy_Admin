import { render, screen, act, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ToastProvider } from '../Toast'
import { useToast } from '@/shared/hooks/useToast'

const ToastTrigger = ({
  type = 'info' as const,
  message = 'Test message',
}: {
  type?: 'success' | 'error' | 'warning' | 'info'
  message?: string
}) => {
  const { addToast } = useToast()
  return <button onClick={() => addToast(type, message)}>Show Toast</button>
}

describe('ToastProvider', () => {
  it('renders children', () => {
    render(
      <ToastProvider>
        <div>Child content</div>
      </ToastProvider>,
    )
    expect(screen.getByText('Child content')).toBeInTheDocument()
  })

  it('shows toast when addToast is called', () => {
    render(
      <ToastProvider>
        <ToastTrigger type="success" message="Saved!" />
      </ToastProvider>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Show Toast' }))
    expect(screen.getByText('Saved!')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('removes toast after 3 seconds', () => {
    vi.useFakeTimers()
    render(
      <ToastProvider>
        <ToastTrigger message="Auto dismiss" />
      </ToastProvider>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Show Toast' }))
    expect(screen.getByText('Auto dismiss')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(3000)
    })
    expect(screen.queryByText('Auto dismiss')).not.toBeInTheDocument()
    vi.useRealTimers()
  })

  it('closes toast when close button clicked', () => {
    render(
      <ToastProvider>
        <ToastTrigger message="Closeable" />
      </ToastProvider>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Show Toast' }))
    expect(screen.getByText('Closeable')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /關閉/i }))
    expect(screen.queryByText('Closeable')).not.toBeInTheDocument()
  })

  it('applies correct style for error type', () => {
    render(
      <ToastProvider>
        <ToastTrigger type="error" message="Error msg" />
      </ToastProvider>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Show Toast' }))
    expect(screen.getByRole('alert')).toHaveClass('bg-red-50')
  })

  it('applies correct style for success type', () => {
    render(
      <ToastProvider>
        <ToastTrigger type="success" message="OK" />
      </ToastProvider>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Show Toast' }))
    expect(screen.getByRole('alert')).toHaveClass('bg-green-50')
  })

  it('throws if useToast used outside ToastProvider', () => {
    const ConsumerWithoutProvider = () => {
      useToast()
      return null
    }
    expect(() => render(<ConsumerWithoutProvider />)).toThrow(
      'useToast must be used within ToastProvider',
    )
  })
})
