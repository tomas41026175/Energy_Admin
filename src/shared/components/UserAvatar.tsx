import { useState } from 'react'
import { cn } from '@/shared/utils/cn'

const AVATAR_COLORS = [
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-teal-500',
] as const

const getAvatarColor = (name: string): string =>
  AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]

const SIZE_CLASSES: Record<NonNullable<UserAvatarProps['size']>, string> = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-10 h-10 text-sm',
}

interface UserAvatarProps {
  name: string
  avatar: string
  size?: 'sm' | 'md' | 'lg'
}

export const UserAvatar = ({ name, avatar, size = 'sm' }: UserAvatarProps) => {
  const [imgError, setImgError] = useState(false)
  const sizeClass = SIZE_CLASSES[size]

  if (!avatar || imgError) {
    return (
      <span
        className={cn(
          'inline-flex items-center justify-center rounded-full text-white font-medium shrink-0',
          sizeClass,
          getAvatarColor(name),
        )}
        aria-label={name}
      >
        {name.charAt(0).toUpperCase()}
      </span>
    )
  }

  return (
    <img
      src={avatar}
      alt={name}
      className={cn('rounded-full object-cover shrink-0', sizeClass)}
      onError={() => setImgError(true)}
    />
  )
}
