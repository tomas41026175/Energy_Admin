import { memo } from 'react'
import { UserAvatar } from '@/shared/components/UserAvatar'
import { StatusBadge } from '@/shared/components/StatusBadge'
import { formatDateUTC8 } from '@/shared/utils/date'
import type { User } from '../users.types'

interface TableRowProps {
  user: User
  index: number
}

export const TableRow = memo(({ user, index }: TableRowProps) => (
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
))

interface UserCardProps {
  user: User
  index: number
}

export const UserCard = memo(({ user, index }: UserCardProps) => (
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
))
