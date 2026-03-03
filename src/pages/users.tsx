import { useState } from 'react'
import { UsersTable } from '@/domains/users/UsersTable'
import { Input } from '@/shared/ui/Input'
import { useDebounce } from '@/shared/hooks/useDebounce'
import type { UserStatus } from '@/domains/users/users.types'

const STATUS_OPTIONS: { value: UserStatus | ''; label: string }[] = [
  { value: '', label: '全部' },
  { value: 'active', label: '啟用' },
  { value: 'inactive', label: '停用' },
]

const UsersPage = () => {
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [statusFilter, setStatusFilter] = useState<UserStatus | ''>('')

  const debouncedSearch = useDebounce(searchInput, 400)

  // 含 @ 自動路由至 email，否則路由至 name
  const isEmailSearch = debouncedSearch.includes('@')

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchInput(e.target.value)
    setPage(1)
  }

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    setStatusFilter(e.target.value as UserStatus | '')
    setPage(1)
  }

  const tableParams = {
    page,
    limit: 10,
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
          <div className="flex-1">
            <Input
              placeholder="搜尋姓名或 Email…"
              value={searchInput}
              onChange={handleSearchChange}
              aria-label="搜尋使用者姓名或 Email"
            />
          </div>
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
        </div>

        <UsersTable params={tableParams} onPageChange={setPage} />
      </div>
    </>
  )
}

export default UsersPage
