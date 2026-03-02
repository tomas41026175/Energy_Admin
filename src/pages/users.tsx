import { useState } from 'react'
import { UsersTable } from '@/domains/users/UsersTable'
import { useAuthStore } from '@/auth/auth.store'
import { Button } from '@/shared/ui/Button'
import { useToast } from '@/shared/hooks/useToast'

const UsersPage = () => {
  const [page, setPage] = useState(1)
  const logout = useAuthStore((s) => s.logout)
  const user = useAuthStore((s) => s.user)
  const { addToast } = useToast()

  const handleLogout = (): void => {
    logout()
    addToast('info', 'You have been signed out.')
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
          <UsersTable params={{ page, limit: 10 }} onPageChange={setPage} />
        </main>
      </div>
    </>
  )
}

export default UsersPage
