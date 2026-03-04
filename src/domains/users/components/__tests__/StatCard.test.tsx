import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatCard } from '../StatCard'

describe('StatCard', () => {
  it('renders label and value when loaded', () => {
    render(<StatCard label="總使用者" value={42} isLoading={false} isError={false} colorClass="text-blue-600" />)
    expect(screen.getByText('總使用者')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('shows skeleton when loading', () => {
    const { container } = render(
      <StatCard label="總使用者" value={undefined} isLoading={true} isError={false} colorClass="text-blue-600" />
    )
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('shows error message when isError is true', () => {
    render(<StatCard label="總使用者" value={undefined} isLoading={false} isError={true} colorClass="text-blue-600" />)
    expect(screen.getByText('載入失敗')).toBeInTheDocument()
  })

  it('renders em dash when value is undefined', () => {
    render(<StatCard label="總使用者" value={undefined} isLoading={false} isError={false} colorClass="text-blue-600" />)
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('applies colorClass to value element', () => {
    render(<StatCard label="測試" value={99} isLoading={false} isError={false} colorClass="text-green-600" />)
    const valueEl = screen.getByText('99')
    expect(valueEl.className).toContain('text-green-600')
  })
})
