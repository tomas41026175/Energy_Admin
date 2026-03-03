import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { StatusBadge } from '../StatusBadge'

describe('StatusBadge', () => {
  it('renders 啟用 for active status', () => {
    render(<StatusBadge status="active" />)
    expect(screen.getByText('啟用')).toBeInTheDocument()
  })

  it('renders 停用 for inactive status', () => {
    render(<StatusBadge status="inactive" />)
    expect(screen.getByText('停用')).toBeInTheDocument()
  })

  it('applies green classes for active status', () => {
    const { container } = render(<StatusBadge status="active" />)
    expect(container.firstChild).toHaveClass('bg-green-100', 'text-green-800')
  })

  it('applies gray classes for inactive status', () => {
    const { container } = render(<StatusBadge status="inactive" />)
    expect(container.firstChild).toHaveClass('bg-gray-100', 'text-gray-800')
  })

  it('renders as a span element', () => {
    const { container } = render(<StatusBadge status="active" />)
    expect(container.firstChild?.nodeName).toBe('SPAN')
  })
})
