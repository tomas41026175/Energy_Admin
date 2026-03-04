import type { RefObject } from 'react'
import { Input } from '@/shared/ui/Input'
import { PAGE_SIZE_OPTIONS } from '@/shared/constants'
import type { UserStatus } from '@/domains/users/users.types'

const STATUS_OPTIONS: { value: UserStatus | ''; label: string }[] = [
  { value: '', label: '全部' },
  { value: 'active', label: '啟用' },
  { value: 'inactive', label: '停用' },
]

const ChevronDownIcon = () => (
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
)

const ClearIcon = () => (
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
)

const SELECT_CLASS = 'w-full appearance-none px-3 py-2 pr-8 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'

interface UsersFilterBarProps {
  searchInputRef: RefObject<HTMLInputElement>
  searchInput: string
  statusFilter: UserStatus | ''
  limit: typeof PAGE_SIZE_OPTIONS[number]
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onClearSearch: () => void
  onStatusChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  onLimitChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
}

export const UsersFilterBar = ({
  searchInputRef,
  searchInput,
  statusFilter,
  limit,
  onSearchChange,
  onClearSearch,
  onStatusChange,
  onLimitChange,
}: UsersFilterBarProps) => (
  <div className="flex flex-col sm:flex-row gap-3 mb-6">
    {/* Search with clear button */}
    <div className="flex-1 relative">
      <Input
        ref={searchInputRef}
        placeholder="搜尋姓名或 Email… (/ 快捷鍵)"
        value={searchInput}
        onChange={onSearchChange}
        aria-label="搜尋使用者姓名或 Email"
      />
      {searchInput && (
        <button
          onClick={onClearSearch}
          className="animate-pop-in absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
          aria-label="清除搜尋"
        >
          <ClearIcon />
        </button>
      )}
    </div>

    {/* Status filter */}
    <div className="relative w-full sm:w-36">
      <select value={statusFilter} onChange={onStatusChange} aria-label="依狀態篩選" className={SELECT_CLASS}>
        {STATUS_OPTIONS.map(({ value, label }) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-400">
        <ChevronDownIcon />
      </div>
    </div>

    {/* Page size selector */}
    <div className="relative w-full sm:w-28">
      <select value={limit} onChange={onLimitChange} aria-label="每頁筆數" className={SELECT_CLASS}>
        {PAGE_SIZE_OPTIONS.map((size) => (
          <option key={size} value={size}>{size} 筆/頁</option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-400">
        <ChevronDownIcon />
      </div>
    </div>
  </div>
)
