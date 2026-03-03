import { useCallback, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { UsersTable } from '@/domains/users/UsersTable'
import { Input } from '@/shared/ui/Input'
import { useDebounce } from '@/shared/hooks/useDebounce'
import { useKeyboard } from '@/shared/hooks/useKeyboard'
import { DEBOUNCE_DELAY, PAGE_SIZE_OPTIONS } from '@/shared/constants'
import type { UserStatus } from '@/domains/users/users.types'

const STATUS_OPTIONS: { value: UserStatus | ''; label: string }[] = [
  { value: '', label: '全部' },
  { value: 'active', label: '啟用' },
  { value: 'inactive', label: '停用' },
]

const UsersPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const searchInputRef = useRef<HTMLInputElement>(null)

  // URL as single source of truth
  const searchInput = searchParams.get('q') ?? ''
  const statusFilter = (searchParams.get('status') ?? '') as UserStatus | ''
  const page = Number(searchParams.get('page') ?? '1')
  const limit = Number(searchParams.get('limit') ?? '10') as typeof PAGE_SIZE_OPTIONS[number]

  const debouncedSearch = useDebounce(searchInput, DEBOUNCE_DELAY)

  // 含 @ 自動路由至 email，否則路由至 name
  const isEmailSearch = debouncedSearch.includes('@')

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (e.target.value) next.set('q', e.target.value)
        else next.delete('q')
        next.delete('page')
        return next
      },
      { replace: true },
    )
  }

  const handleClearSearch = (): void => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        next.delete('q')
        next.delete('page')
        return next
      },
      { replace: true },
    )
    searchInputRef.current?.focus()
  }

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (e.target.value) next.set('status', e.target.value)
        else next.delete('status')
        next.delete('page')
        return next
      },
      { replace: true },
    )
  }

  const handlePageChange = (newPage: number): void => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        next.set('page', String(newPage))
        return next
      },
      { replace: true },
    )
  }

  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        next.set('limit', e.target.value)
        next.delete('page')
        return next
      },
      { replace: true },
    )
  }

  // Keyboard shortcut: / to focus search, Esc to clear
  const handleSlash = useCallback((): void => {
    searchInputRef.current?.focus()
  }, [])

  const handleEscape = useCallback((): void => {
    if (searchInput) handleClearSearch()
  }, [searchInput]) // eslint-disable-line react-hooks/exhaustive-deps

  useKeyboard('/', handleSlash)
  useKeyboard('Escape', handleEscape)

  const tableParams = {
    page,
    limit,
    ...(debouncedSearch
      ? isEmailSearch
        ? { email: debouncedSearch }
        : { name: debouncedSearch }
      : {}),
    ...(statusFilter ? { status: statusFilter } : {}),
  }

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg"
      >
        跳至主要內容
      </a>

      <div id="main-content">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">使用者管理</h1>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search with clear button */}
          <div className="flex-1 relative">
            <Input
              ref={searchInputRef}
              placeholder="搜尋姓名或 Email… (/ 快捷鍵)"
              value={searchInput}
              onChange={handleSearchChange}
              aria-label="搜尋使用者姓名或 Email"
            />
            {searchInput && (
              <button
                onClick={handleClearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                aria-label="清除搜尋"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>

          {/* Status filter */}
          <div className="relative w-full sm:w-36">
            <select
              value={statusFilter}
              onChange={handleStatusChange}
              aria-label="依狀態篩選"
              className="w-full appearance-none px-3 py-2 pr-8 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {STATUS_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>

          {/* Page size selector */}
          <div className="relative w-full sm:w-28">
            <select
              value={limit}
              onChange={handleLimitChange}
              aria-label="每頁筆數"
              className="w-full appearance-none px-3 py-2 pr-8 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size} 筆/頁
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>
        </div>

        <UsersTable
          params={tableParams}
          onPageChange={handlePageChange}
          searchQuery={debouncedSearch}
        />
      </div>
    </>
  )
}

export default UsersPage
