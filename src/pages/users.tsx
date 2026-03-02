import { useState } from 'react'
import { UsersTable } from '@/domains/users/UsersTable'
import { useAuthStore } from '@/auth/auth.store'

const UsersPage = () => {
  const [page, setPage] = useState(1)
  const logout = useAuthStore((s) => s.logout)
  const user = useAuthStore((s) => s.user)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Users</h1>
          <div className="flex items-center gap-4">
            {user && <span className="text-sm text-gray-600">{user.username}</span>}
            <button
              onClick={logout}
              className="px-3 py-1 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <UsersTable params={{ page, limit: 10 }} onPageChange={setPage} />
      </main>
    </div>
  )
}

export default UsersPage
