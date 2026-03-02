import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Skeleton } from '../Skeleton'

describe('Skeleton', () => {
  it('renders with default rectangular variant', () => {
    const { container } = render(<Skeleton />)
    const el = container.firstChild as HTMLElement
    expect(el).toHaveClass('rounded-lg')
    expect(el).toHaveClass('animate-pulse')
  })

  it('renders text variant with default height', () => {
    const { container } = render(<Skeleton variant="text" />)
    const el = container.firstChild as HTMLElement
    expect(el).toHaveClass('rounded')
    expect(el).toHaveClass('h-4')
  })

  it('renders circular variant', () => {
    const { container } = render(<Skeleton variant="circular" width={40} height={40} />)
    const el = container.firstChild as HTMLElement
    expect(el).toHaveClass('rounded-full')
  })

  it('applies numeric width and height as inline styles', () => {
    const { container } = render(<Skeleton width={100} height={50} />)
    const el = container.firstChild as HTMLElement
    expect(el.style.width).toBe('100px')
    expect(el.style.height).toBe('50px')
  })

  it('applies string width and height as inline styles', () => {
    const { container } = render(<Skeleton width="50%" height="2rem" />)
    const el = container.firstChild as HTMLElement
    expect(el.style.width).toBe('50%')
    expect(el.style.height).toBe('2rem')
  })

  it('is hidden from screen readers via aria-hidden', () => {
    const { container } = render(<Skeleton />)
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true')
  })

  it('accepts additional className', () => {
    const { container } = render(<Skeleton className="w-full" />)
    expect(container.firstChild).toHaveClass('w-full')
  })

  it('text variant with explicit height does not add default h-4', () => {
    const { container } = render(<Skeleton variant="text" height={20} />)
    const el = container.firstChild as HTMLElement
    expect(el).not.toHaveClass('h-4')
    expect(el.style.height).toBe('20px')
  })
})
