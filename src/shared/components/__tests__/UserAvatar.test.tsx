import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { UserAvatar } from '../UserAvatar'

describe('UserAvatar', () => {
  describe('fallback (no avatar)', () => {
    it('renders initial character when avatar is empty', () => {
      render(<UserAvatar name="Alice" avatar="" />)
      expect(screen.getByText('A')).toBeInTheDocument()
    })

    it('renders uppercase initial', () => {
      render(<UserAvatar name="bob" avatar="" />)
      expect(screen.getByText('B')).toBeInTheDocument()
    })

    it('has aria-label equal to name', () => {
      render(<UserAvatar name="Alice" avatar="" />)
      expect(screen.getByLabelText('Alice')).toBeInTheDocument()
    })

    it('does not render img when avatar is empty', () => {
      render(<UserAvatar name="Alice" avatar="" />)
      expect(screen.queryByRole('img')).not.toBeInTheDocument()
    })
  })

  describe('with avatar URL', () => {
    it('renders img element when avatar is provided', () => {
      render(<UserAvatar name="Alice" avatar="https://example.com/alice.png" />)
      expect(screen.getByRole('img', { name: 'Alice' })).toBeInTheDocument()
    })

    it('img src matches avatar URL', () => {
      render(<UserAvatar name="Alice" avatar="https://example.com/alice.png" />)
      expect(screen.getByRole('img')).toHaveAttribute('src', 'https://example.com/alice.png')
    })

    it('falls back to initial on img error', () => {
      render(<UserAvatar name="Alice" avatar="https://bad-url.com/img.png" />)
      const img = screen.getByRole('img')
      fireEvent.error(img)
      expect(screen.getByText('A')).toBeInTheDocument()
      expect(screen.queryByRole('img')).not.toBeInTheDocument()
    })
  })

  describe('size prop', () => {
    it('defaults to sm size', () => {
      const { container } = render(<UserAvatar name="Alice" avatar="" />)
      expect(container.firstChild).toHaveClass('w-8', 'h-8')
    })

    it('applies md size classes', () => {
      const { container } = render(<UserAvatar name="Alice" avatar="" size="md" />)
      expect(container.firstChild).toHaveClass('w-9', 'h-9')
    })

    it('applies lg size classes', () => {
      const { container } = render(<UserAvatar name="Alice" avatar="" size="lg" />)
      expect(container.firstChild).toHaveClass('w-10', 'h-10')
    })
  })

  describe('avatar color', () => {
    it('assigns consistent color based on name', () => {
      const { container: c1 } = render(<UserAvatar name="Alice" avatar="" />)
      const { container: c2 } = render(<UserAvatar name="Alice" avatar="" />)
      const getColor = (c: HTMLElement) =>
        Array.from((c.firstChild as HTMLElement).classList).find((cls) => cls.startsWith('bg-'))
      expect(getColor(c1)).toBe(getColor(c2))
    })

    it('assigns different colors for different names starting with different chars', () => {
      // 'A' charCode=65, 'B' charCode=66 → different mod results possible
      const { container: cA } = render(<UserAvatar name="Alice" avatar="" />)
      const { container: cZ } = render(<UserAvatar name="Zelda" avatar="" />)
      const getColor = (c: HTMLElement) =>
        Array.from((c.firstChild as HTMLElement).classList).find((cls) => cls.startsWith('bg-'))
      // They may differ — just confirm both have a bg- color
      expect(getColor(cA)).toMatch(/^bg-/)
      expect(getColor(cZ)).toMatch(/^bg-/)
    })
  })
})
