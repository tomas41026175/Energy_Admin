import { useState } from 'react'
import { UsersTable } from '@/domains/users/UsersTable'
import { useAuthStore } from '@/auth/auth.store'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { useToast } from '@/shared/hooks/useToast'
import { useDebounce } from '@/shared/hooks/useDebounce'
import type { UserStatus } from '@/domains/users/users.types'

const STATUS_OPTIONS: { value: UserStatus | ''; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

const UsersPage = () => {
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [statusFilter, setStatusFilter] = useState<UserStatus | ''>('')

  const logout = useAuthStore((s) => s.logout)
  const user = useAuthStore((s) => s.user)
  const { addToast } = useToast()

  const debouncedSearch = useDebounce(searchInput, 400)

  const handleLogout = (): void => {
    logout()
    addToast('info', 'You have been signed out.')
  }

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
    ...(debouncedSearch ? { name: debouncedSearch } : {}),
    ...(statusFilter ? { status: statusFilter } : {}),
  }

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg"
      >
        Skip to main content
      </a>

      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">Users</h1>
            <div className="flex items-center gap-3 sm:gap-4">
              {user && (
                <span className="hidden sm:inline text-sm text-gray-600">{user.username}</span>
              )}
              <Button variant="danger" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </header>

        <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search by name…"
                value={searchInput}
                onChange={handleSearchChange}
                aria-label="Search users by name"
              />
            </div>
            <div className="sm:w-40">
              <select
                value={statusFilter}
                onChange={handleStatusChange}
                aria-label="Filter by status"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {STATUS_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <UsersTable params={tableParams} onPageChange={setPage} />
        </main>
      </div>
    </>
  )
}

export default UsersPage
