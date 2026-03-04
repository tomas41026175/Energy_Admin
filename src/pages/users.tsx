import { useCallback, useMemo, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { UsersTable } from '@/domains/users/UsersTable'
import { useDebounce } from '@/shared/hooks/useDebounce'
import { useKeyboard } from '@/shared/hooks/useKeyboard'
import { DEBOUNCE_DELAY, PAGE_SIZE_OPTIONS } from '@/shared/constants'
import { UsersFilterBar } from '@/domains/users/components/UsersFilterBar'
import type { UserStatus } from '@/domains/users/users.types'

const UsersPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const searchInputRef = useRef<HTMLInputElement>(null)

  // URL as single source of truth
  const searchInput = searchParams.get('q') ?? ''
  const statusFilter = (searchParams.get('status') ?? '') as UserStatus | ''
  const page = Number(searchParams.get('page') ?? '1')
  const limit = Number(searchParams.get('limit') ?? '10') as typeof PAGE_SIZE_OPTIONS[number]

  const debouncedSearch = useDebounce(searchInput, DEBOUNCE_DELAY)
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

  const handleClearSearch = useCallback((): void => {
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
  }, [setSearchParams])

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
  useKeyboard('/', useCallback((): void => { searchInputRef.current?.focus() }, []))
  useKeyboard('Escape', useCallback((): void => { if (searchInput) handleClearSearch() }, [searchInput, handleClearSearch]))

  const tableParams = useMemo(
    () => ({
      page,
      limit,
      ...(debouncedSearch
        ? isEmailSearch
          ? { email: debouncedSearch }
          : { name: debouncedSearch }
        : {}),
      ...(statusFilter ? { status: statusFilter } : {}),
    }),
    [page, limit, debouncedSearch, isEmailSearch, statusFilter],
  )

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

        <UsersFilterBar
          searchInputRef={searchInputRef}
          searchInput={searchInput}
          statusFilter={statusFilter}
          limit={limit}
          onSearchChange={handleSearchChange}
          onClearSearch={handleClearSearch}
          onStatusChange={handleStatusChange}
          onLimitChange={handleLimitChange}
        />

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
