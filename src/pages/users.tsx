import { useState } from 'react'
import { UsersTable } from '@/domains/users/UsersTable'
import { Input } from '@/shared/ui/Input'
import { useDebounce } from '@/shared/hooks/useDebounce'
import { cn } from '@/shared/utils/cn'
import type { UserStatus } from '@/domains/users/users.types'

const STATUS_OPTIONS: { value: UserStatus | ''; label: string }[] = [
  { value: '', label: '全部' },
  { value: 'active', label: '啟用' },
  { value: 'inactive', label: '停用' },
]

const DATE_INPUT_CLASS = cn(
  'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white',
  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
)

const UsersPage = () => {
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [emailInput, setEmailInput] = useState('')
  const [idInput, setIdInput] = useState('')
  const [statusFilter, setStatusFilter] = useState<UserStatus | ''>('')
  const [createdFrom, setCreatedFrom] = useState('')
  const [createdTo, setCreatedTo] = useState('')

  const debouncedSearch = useDebounce(searchInput, 400)
  const debouncedEmail = useDebounce(emailInput, 400)
  const debouncedId = useDebounce(idInput, 400)

  const makeInputHandler =
    (setter: (value: string) => void) =>
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      setter(e.target.value)
      setPage(1)
    }

  const handleSearchChange = makeInputHandler(setSearchInput)
  const handleEmailChange = makeInputHandler(setEmailInput)
  const handleIdChange = makeInputHandler(setIdInput)
  const handleCreatedFromChange = makeInputHandler(setCreatedFrom)
  const handleCreatedToChange = makeInputHandler(setCreatedTo)

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    setStatusFilter(e.target.value as UserStatus | '')
    setPage(1)
  }

  const tableParams = {
    page,
    limit: 10,
    ...(debouncedSearch ? { name: debouncedSearch } : {}),
    ...(debouncedEmail ? { email: debouncedEmail } : {}),
    ...(debouncedId ? { id: Number(debouncedId) } : {}),
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(createdFrom ? { createdFrom } : {}),
    ...(createdTo ? { createdTo } : {}),
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
        <div className="flex flex-col gap-3 mb-6">
          {/* 第一列：姓名 / Email / ID */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                placeholder="搜尋姓名…"
                value={searchInput}
                onChange={handleSearchChange}
                aria-label="依姓名搜尋使用者"
              />
            </div>
            <div className="flex-1">
              <Input
                placeholder="搜尋 Email…"
                value={emailInput}
                onChange={handleEmailChange}
                aria-label="依 Email 搜尋使用者"
              />
            </div>
            <div className="w-full sm:w-32">
              <Input
                type="number"
                placeholder="ID"
                value={idInput}
                onChange={handleIdChange}
                aria-label="依 ID 搜尋使用者"
              />
            </div>
          </div>

          {/* 第二列：狀態 / 建立日期起 / 建立日期迄 */}
          <div className="flex flex-col sm:flex-row gap-3">
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
            <div className="flex-1">
              <input
                type="date"
                value={createdFrom}
                onChange={handleCreatedFromChange}
                aria-label="建立日期起"
                className={DATE_INPUT_CLASS}
              />
            </div>
            <div className="flex-1">
              <input
                type="date"
                value={createdTo}
                onChange={handleCreatedToChange}
                aria-label="建立日期迄"
                className={DATE_INPUT_CLASS}
              />
            </div>
          </div>
        </div>

        <UsersTable params={tableParams} onPageChange={setPage} />
      </div>
    </>
  )
}

export default UsersPage
