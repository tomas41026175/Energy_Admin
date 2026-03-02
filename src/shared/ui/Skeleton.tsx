import { cn } from '@/shared/utils/cn'

interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
  className?: string
}

const VARIANT_CLASSES: Record<NonNullable<SkeletonProps['variant']>, string> = {
  text: 'rounded',
  circular: 'rounded-full',
  rectangular: 'rounded-lg',
}

export const Skeleton = ({
  variant = 'rectangular',
  width,
  height,
  className,
}: SkeletonProps) => {
  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  }

  return (
    <div
      aria-hidden="true"
      style={style}
      className={cn(
        'animate-pulse bg-gray-200',
        VARIANT_CLASSES[variant],
        variant === 'text' && !height && 'h-4',
        className,
      )}
    />
  )
}
