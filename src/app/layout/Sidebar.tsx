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
  collapsed?: boolean
  onToggleCollapse?: () => void
}

const HomeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-5 h-5 shrink-0"
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
    className="w-5 h-5 shrink-0"
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

const CollapseIcon = ({ collapsed }: { collapsed: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-4 h-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {collapsed ? (
      <polyline points="9 18 15 12 9 6" />
    ) : (
      <polyline points="15 18 9 12 15 6" />
    )}
  </svg>
)

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: '儀表板', icon: <HomeIcon /> },
  { to: '/users', label: '使用者', icon: <UsersIcon /> },
]

interface SidebarContentProps {
  onClose?: () => void
  collapsed?: boolean
  onToggleCollapse?: () => void
}

const SidebarContent = ({ onClose, collapsed = false, onToggleCollapse }: SidebarContentProps) => (
  <div className="flex flex-col h-full">
    {/* Brand */}
    <div
      className={cn(
        'flex items-center h-16 border-b border-gray-200 shrink-0',
        collapsed ? 'justify-center px-3' : 'justify-between px-6',
      )}
    >
      {!collapsed && (
        <span className="text-blue-600 font-bold text-lg tracking-tight">⚡ Energy Admin</span>
      )}
      {collapsed && (
        <span className="text-blue-600 font-bold text-xl">⚡</span>
      )}
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
    <nav className="flex-1 px-2 py-4 space-y-1" aria-label="主導覽">
      {NAV_ITEMS.map(({ to, label, icon }) => (
        <NavLink
          key={to}
          to={to}
          title={collapsed ? label : undefined}
          onClick={onClose}
          className={({ isActive }) =>
            cn(
              'flex items-center rounded-lg text-sm font-medium transition-colors duration-150',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
              collapsed ? 'justify-center px-2 py-2' : 'gap-3 px-3 py-2',
              isActive
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
            )
          }
        >
          {icon}
          {!collapsed && label}
        </NavLink>
      ))}
    </nav>

    {/* Collapse toggle button (desktop only) */}
    {onToggleCollapse && (
      <div className="px-2 pb-4">
        <button
          onClick={onToggleCollapse}
          className={cn(
            'w-full flex items-center rounded-lg px-2 py-2 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
            collapsed ? 'justify-center' : 'gap-2',
          )}
          aria-label={collapsed ? '展開側欄' : '收合側欄'}
        >
          <CollapseIcon collapsed={collapsed} />
          {!collapsed && <span>收合</span>}
        </button>
      </div>
    )}
  </div>
)

export const Sidebar = ({ isOpen, onClose, collapsed = false, onToggleCollapse }: SidebarProps) => (
  <>
    {/* Desktop sidebar — sticky, always visible on lg+ */}
    <aside
      className={cn(
        'hidden lg:flex lg:flex-col lg:shrink-0 bg-white border-r border-gray-200 sticky top-0 h-screen transition-all duration-200',
        collapsed ? 'lg:w-16' : 'lg:w-64',
      )}
    >
      <SidebarContent collapsed={collapsed} onToggleCollapse={onToggleCollapse} />
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
