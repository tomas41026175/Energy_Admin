import { UserAvatar } from '@/shared/components/UserAvatar'
import { StatusBadge } from '@/shared/components/StatusBadge'
import type { User } from '../users.types'

interface RecentUserRowProps {
  user: User
}

export const RecentUserRow = ({ user }: RecentUserRowProps) => (
  <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-b-0">
    <UserAvatar name={user.name} avatar={user.avatar} size="md" />
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
      <p className="text-xs text-gray-500 truncate">{user.email}</p>
    </div>
    <StatusBadge status={user.status} />
  </div>
)
