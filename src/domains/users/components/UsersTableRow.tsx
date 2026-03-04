import { UserAvatar } from '@/shared/components/UserAvatar'
import { StatusBadge } from '@/shared/components/StatusBadge'
import type { User } from '../users.types'

const formatDateUTC8 = (dateStr: string): string => {
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return dateStr
  const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(dateStr)
  return new Intl.DateTimeFormat('zh-TW', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    ...(isDateOnly ? {} : { hour: '2-digit', minute: '2-digit' }),
  }).format(date)
}

interface TableRowProps {
  user: User
  index: number
}

export const TableRow = ({ user, index }: TableRowProps) => (
  <tr
    className="hover:bg-gray-50 transition-colors duration-100 animate-fade-in [animation-fill-mode:backwards]"
    style={{ animationDelay: `${index * 30}ms` }}
  >
    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{user.id}</td>
    <td className="px-4 py-3 whitespace-nowrap">
      <div className="flex items-center gap-2.5">
        <UserAvatar name={user.name} avatar={user.avatar} size="sm" />
        <span className="text-sm font-medium text-gray-900">{user.name}</span>
      </div>
    </td>
    <td className="hidden lg:table-cell px-4 py-3 whitespace-nowrap text-sm text-gray-500">
      {user.email}
    </td>
    <td className="px-4 py-3 whitespace-nowrap">
      <StatusBadge status={user.status} />
    </td>
    <td className="hidden lg:table-cell px-4 py-3 whitespace-nowrap text-sm text-gray-500">
      {formatDateUTC8(user.created_at)}
    </td>
  </tr>
)

interface UserCardProps {
  user: User
  index: number
}

export const UserCard = ({ user, index }: UserCardProps) => (
  <div
    className="bg-white rounded-lg border border-gray-200 p-4 animate-fade-in [animation-fill-mode:backwards]"
    style={{ animationDelay: `${index * 40}ms` }}
  >
    <div className="flex items-start justify-between gap-2">
      <div className="flex items-center gap-3 min-w-0">
        <UserAvatar name={user.name} avatar={user.avatar} size="lg" />
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
          <p className="text-xs text-gray-500 mt-0.5 truncate">{user.email}</p>
          <p className="text-xs text-gray-400 mt-0.5">ID: {user.id}</p>
        </div>
      </div>
      <StatusBadge status={user.status} />
    </div>
    <p className="text-xs text-gray-400 mt-2 text-right">{formatDateUTC8(user.created_at)}</p>
  </div>
)
