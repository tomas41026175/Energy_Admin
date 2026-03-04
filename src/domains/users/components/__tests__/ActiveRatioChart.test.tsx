import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ActiveRatioChart } from '../ActiveRatioChart'

// Recharts uses SVG — ResizeObserver must be polyfilled in jsdom
global.ResizeObserver = class ResizeObserver {
  observe(): void { /* noop */ }
  unobserve(): void { /* noop */ }
  disconnect(): void { /* noop */ }
}

describe('ActiveRatioChart', () => {
  it('renders chart title', () => {
    render(<ActiveRatioChart active={8} inactive={2} isLoading={false} />)
    expect(screen.getByText('使用者狀態分佈')).toBeInTheDocument()
  })

  it('shows skeleton when loading', () => {
    const { container } = render(<ActiveRatioChart active={undefined} inactive={undefined} isLoading={true} />)
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('renders chart container when not loading', () => {
    const { container } = render(<ActiveRatioChart active={8} inactive={2} isLoading={false} />)
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument()
  })

  it('handles undefined values gracefully', () => {
    expect(() => {
      render(<ActiveRatioChart active={undefined} inactive={undefined} isLoading={false} />)
    }).not.toThrow()
  })
})
