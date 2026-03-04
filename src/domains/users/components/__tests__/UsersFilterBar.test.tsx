import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { createRef } from 'react'
import { UsersFilterBar } from '../UsersFilterBar'

const defaultProps = {
  searchInputRef: createRef<HTMLInputElement>(),
  searchInput: '',
  statusFilter: '' as const,
  limit: 10 as const,
  onSearchChange: vi.fn(),
  onClearSearch: vi.fn(),
  onStatusChange: vi.fn(),
  onLimitChange: vi.fn(),
}

describe('UsersFilterBar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders search input with correct placeholder', () => {
    render(<UsersFilterBar {...defaultProps} />)
    expect(screen.getByPlaceholderText('搜尋姓名或 Email… (/ 快捷鍵)')).toBeInTheDocument()
  })

  it('calls onSearchChange when typing in search input', async () => {
    render(<UsersFilterBar {...defaultProps} />)
    const input = screen.getByLabelText('搜尋使用者姓名或 Email')
    await userEvent.type(input, 'test')
    expect(defaultProps.onSearchChange).toHaveBeenCalled()
  })

  it('shows clear button when searchInput has value', () => {
    render(<UsersFilterBar {...defaultProps} searchInput="alice" />)
    expect(screen.getByLabelText('清除搜尋')).toBeInTheDocument()
  })

  it('hides clear button when searchInput is empty', () => {
    render(<UsersFilterBar {...defaultProps} searchInput="" />)
    expect(screen.queryByLabelText('清除搜尋')).not.toBeInTheDocument()
  })

  it('calls onClearSearch when clear button clicked', () => {
    render(<UsersFilterBar {...defaultProps} searchInput="alice" />)
    fireEvent.click(screen.getByLabelText('清除搜尋'))
    expect(defaultProps.onClearSearch).toHaveBeenCalledTimes(1)
  })

  it('calls onStatusChange when status filter changes', () => {
    render(<UsersFilterBar {...defaultProps} />)
    const select = screen.getByLabelText('依狀態篩選')
    fireEvent.change(select, { target: { value: 'active' } })
    expect(defaultProps.onStatusChange).toHaveBeenCalledTimes(1)
  })

  it('calls onLimitChange when page size changes', () => {
    render(<UsersFilterBar {...defaultProps} />)
    const select = screen.getByLabelText('每頁筆數')
    fireEvent.change(select, { target: { value: '25' } })
    expect(defaultProps.onLimitChange).toHaveBeenCalledTimes(1)
  })

  it('renders all page size options', () => {
    render(<UsersFilterBar {...defaultProps} />)
    const select = screen.getByLabelText('每頁筆數')
    expect(select).toContainHTML('<option value="10">10 筆/頁</option>')
    expect(select).toContainHTML('<option value="25">25 筆/頁</option>')
    expect(select).toContainHTML('<option value="50">50 筆/頁</option>')
  })

  it('renders all status filter options', () => {
    render(<UsersFilterBar {...defaultProps} />)
    const select = screen.getByLabelText('依狀態篩選')
    expect(select).toContainHTML('<option value="">全部</option>')
    expect(select).toContainHTML('<option value="active">啟用</option>')
    expect(select).toContainHTML('<option value="inactive">停用</option>')
  })
})
