import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { Sidebar } from '../Sidebar'

const ROUTER_FUTURE = { v7_startTransition: true, v7_relativeSplatPath: true }

const renderSidebar = (props: { isOpen?: boolean; onClose?: () => void } = {}) =>
  render(
    <MemoryRouter future={ROUTER_FUTURE}>
      <Sidebar isOpen={props.isOpen ?? false} onClose={props.onClose ?? vi.fn()} />
    </MemoryRouter>,
  )

describe('Sidebar', () => {
  describe('Desktop sidebar', () => {
    it('renders brand text', () => {
      renderSidebar()
      expect(screen.getByText(/Energy Admin/i)).toBeInTheDocument()
    })

    it('renders dashboard nav link', () => {
      renderSidebar()
      expect(screen.getByRole('link', { name: /儀表板/i })).toBeInTheDocument()
    })

    it('renders users nav link', () => {
      renderSidebar()
      expect(screen.getByRole('link', { name: /使用者/i })).toBeInTheDocument()
    })

    it('dashboard link points to /dashboard', () => {
      renderSidebar()
      expect(screen.getByRole('link', { name: /儀表板/i })).toHaveAttribute('href', '/dashboard')
    })

    it('users link points to /users', () => {
      renderSidebar()
      expect(screen.getByRole('link', { name: /使用者/i })).toHaveAttribute('href', '/users')
    })

    it('has aria-label on nav element', () => {
      renderSidebar()
      expect(screen.getByRole('navigation', { name: '主導覽' })).toBeInTheDocument()
    })
  })

  describe('Mobile overlay (isOpen=false)', () => {
    it('does not show close button when overlay is closed', () => {
      renderSidebar({ isOpen: false })
      expect(screen.queryByRole('button', { name: /關閉選單/i })).not.toBeInTheDocument()
    })

    it('does not show mobile backdrop when closed', () => {
      const { container } = renderSidebar({ isOpen: false })
      expect(container.querySelector('.fixed.inset-0.z-40')).not.toBeInTheDocument()
    })
  })

  describe('Mobile overlay (isOpen=true)', () => {
    it('shows close button when overlay is open', () => {
      renderSidebar({ isOpen: true })
      expect(screen.getByRole('button', { name: /關閉選單/i })).toBeInTheDocument()
    })

    it('calls onClose when close button is clicked', () => {
      const onClose = vi.fn()
      renderSidebar({ isOpen: true, onClose })
      fireEvent.click(screen.getByRole('button', { name: /關閉選單/i }))
      expect(onClose).toHaveBeenCalledOnce()
    })

    it('calls onClose when backdrop is clicked', () => {
      const onClose = vi.fn()
      const { container } = render(
        <MemoryRouter future={ROUTER_FUTURE}>
          <Sidebar isOpen={true} onClose={onClose} />
        </MemoryRouter>,
      )
      const backdrop = container.querySelector('.fixed.inset-0.bg-gray-600')
      expect(backdrop).toBeInTheDocument()
      fireEvent.click(backdrop!)
      expect(onClose).toHaveBeenCalledOnce()
    })

    it('shows mobile overlay container', () => {
      const { container } = renderSidebar({ isOpen: true })
      expect(container.querySelector('.fixed.inset-0.z-40')).toBeInTheDocument()
    })
  })
})
