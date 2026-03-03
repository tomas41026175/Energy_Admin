import { NavLink } from 'react-router-dom'
import { cn } from '@/shared/utils/cn'

interface NavItem {
  to: string
  label: string
  icon: React.ReactNode
}

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const HomeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-5 h-5"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
)

const UsersIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-5 h-5"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: '儀表板', icon: <HomeIcon /> },
  { to: '/users', label: '使用者', icon: <UsersIcon /> },
]

const SidebarContent = ({ onClose }: { onClose?: () => void }) => (
  <div className="flex flex-col h-full">
    {/* Brand */}
    <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 shrink-0">
      <span className="text-blue-600 font-bold text-lg tracking-tight">⚡ Energy Admin</span>
      {onClose && (
        <button
          onClick={onClose}
          className="lg:hidden p-1 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="關閉選單"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>

    {/* Navigation */}
    <nav className="flex-1 px-4 py-4 space-y-1" aria-label="主導覽">
      {NAV_ITEMS.map(({ to, label, icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
              isActive
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
            )
          }
        >
          {icon}
          {label}
        </NavLink>
      ))}
    </nav>
  </div>
)

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => (
  <>
    {/* Desktop sidebar — always visible on lg+ */}
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 bg-white border-r border-gray-200">
      <SidebarContent />
    </aside>

    {/* Mobile overlay */}
    {isOpen && (
      <div className="fixed inset-0 z-40 lg:hidden">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75"
          aria-hidden="true"
          onClick={onClose}
        />
        {/* Drawer */}
        <aside className="relative flex flex-col w-64 h-full bg-white shadow-xl">
          <SidebarContent onClose={onClose} />
        </aside>
      </div>
    )}
  </>
)
