import { cn } from '@/shared/utils/cn'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZE_CLASSES: Record<NonNullable<SpinnerProps['size']>, string> = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-8 h-8 border-[3px]',
}

export const Spinner = ({ size = 'md', className }: SpinnerProps) => {
  return (
    <span
      role="status"
      aria-label="載入中"
      className={cn(
        'inline-block rounded-full border-current border-t-transparent animate-spin',
        SIZE_CLASSES[size],
        className,
      )}
    />
  )
}
