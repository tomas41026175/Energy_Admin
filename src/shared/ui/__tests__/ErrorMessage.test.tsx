import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { ErrorMessage } from '../ErrorMessage'

describe('ErrorMessage', () => {
  it('renders error message text', () => {
    render(<ErrorMessage message="Something went wrong" />)
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('has role="alert" for accessibility', () => {
    render(<ErrorMessage message="Error occurred" />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('renders retry button when onRetry provided', () => {
    render(<ErrorMessage message="Error" onRetry={() => {}} />)
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
  })

  it('does not render retry button when onRetry omitted', () => {
    render(<ErrorMessage message="Error" />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('calls onRetry when retry button clicked', async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    render(<ErrorMessage message="Error" onRetry={onRetry} />)
    await user.click(screen.getByRole('button', { name: /retry/i }))
    expect(onRetry).toHaveBeenCalledOnce()
  })

  it('renders error icon svg', () => {
    const { container } = render(<ErrorMessage message="Error" />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })
})
