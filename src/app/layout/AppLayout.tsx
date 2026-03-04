import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/auth/auth.store'
import { useToast } from '@/shared/hooks/useToast'
import { useNetworkStatus } from '@/shared/hooks/useNetworkStatus'
import { Button } from '@/shared/ui/Button'
import { Sidebar } from './Sidebar'

export const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const { pathname } = useLocation()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const { addToast } = useToast()
  const { isOnline } = useNetworkStatus()

  const handleLogout = (): void => {
    logout()
    addToast('info', '您已登出。')
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
      />

      <div className="flex flex-col flex-1 min-w-0">
        {/* Offline Banner */}
        {!isOnline && (
          <div
            role="alert"
            className="animate-slide-down bg-yellow-50 border-b border-yellow-200 text-yellow-800 text-sm text-center py-2 px-4"
          >
            ⚠️ 目前離線，顯示的資料可能不是最新
          </div>
        )}

        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 shrink-0 sticky top-0 z-10">
          {/* Hamburger (mobile only) */}
          <button
            className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={() => setSidebarOpen(true)}
            aria-label="開啟選單"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Right side: username + logout */}
          <div className="flex items-center gap-3 ml-auto">
            {user && (
              <span className="hidden sm:inline text-sm text-gray-600">{user.username}</span>
            )}
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              登出
            </Button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">
          <div key={pathname} className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
