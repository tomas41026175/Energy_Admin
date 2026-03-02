import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConfirmDialog } from '../ConfirmDialog'

const defaultProps = {
  open: true,
  title: 'Delete User',
  description: 'Are you sure you want to delete this user?',
  onConfirm: vi.fn(),
  onCancel: vi.fn(),
}

describe('ConfirmDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders title and description when open', async () => {
    await act(async () => {
      render(<ConfirmDialog {...defaultProps} />)
    })
    expect(screen.getByText('Delete User')).toBeInTheDocument()
    expect(screen.getByText('Are you sure you want to delete this user?')).toBeInTheDocument()
  })

  it('does not render content when closed', async () => {
    await act(async () => {
      render(<ConfirmDialog {...defaultProps} open={false} />)
    })
    expect(screen.queryByText('Delete User')).not.toBeInTheDocument()
  })

  it('calls onConfirm when confirm button is clicked', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    await act(async () => {
      render(<ConfirmDialog {...defaultProps} onConfirm={onConfirm} />)
    })
    await user.click(screen.getByRole('button', { name: 'Confirm' }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    await act(async () => {
      render(<ConfirmDialog {...defaultProps} onCancel={onCancel} />)
    })
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('calls onCancel when Escape key is pressed', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    await act(async () => {
      render(<ConfirmDialog {...defaultProps} onCancel={onCancel} />)
    })
    await user.keyboard('{Escape}')
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('renders custom confirm and cancel labels', async () => {
    await act(async () => {
      render(
        <ConfirmDialog {...defaultProps} confirmLabel="Yes, Delete" cancelLabel="No, Keep" />,
      )
    })
    expect(screen.getByRole('button', { name: 'Yes, Delete' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'No, Keep' })).toBeInTheDocument()
  })

  it('has aria-modal attribute on dialog panel', async () => {
    await act(async () => {
      render(<ConfirmDialog {...defaultProps} />)
    })
    // headlessui renders two elements with role="dialog": the root Dialog and the Dialog.Panel
    const dialogs = screen.getAllByRole('dialog')
    // At least one element should carry aria-modal="true"
    const hasAriaModal = dialogs.some((el) => el.getAttribute('aria-modal') === 'true')
    expect(hasAriaModal).toBe(true)
  })

  it('renders danger variant confirm button with red styling', async () => {
    await act(async () => {
      render(<ConfirmDialog {...defaultProps} variant="danger" />)
    })
    const confirmBtn = screen.getByRole('button', { name: 'Confirm' })
    expect(confirmBtn).toHaveClass('bg-red-600')
  })
})
