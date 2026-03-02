import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { EmptyState } from '../EmptyState'

describe('EmptyState', () => {
  it('renders title', () => {
    render(<EmptyState title="No users found" />)
    expect(screen.getByText('No users found')).toBeInTheDocument()
  })

  it('renders description when provided', () => {
    render(<EmptyState title="No data" description="Nothing to show here" />)
    expect(screen.getByText('Nothing to show here')).toBeInTheDocument()
  })

  it('does not render description when omitted', () => {
    render(<EmptyState title="No data" />)
    expect(screen.queryByText('Nothing to show here')).not.toBeInTheDocument()
  })

  it('renders action button when provided', () => {
    const onClick = vi.fn()
    render(<EmptyState title="No data" action={{ label: 'Create', onClick }} />)
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument()
  })

  it('calls action onClick when button clicked', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<EmptyState title="No data" action={{ label: 'Create', onClick }} />)
    await user.click(screen.getByRole('button', { name: 'Create' }))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('does not render action button when omitted', () => {
    render(<EmptyState title="No data" />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('renders icon svg', () => {
    const { container } = render(<EmptyState title="No data" />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })
})
