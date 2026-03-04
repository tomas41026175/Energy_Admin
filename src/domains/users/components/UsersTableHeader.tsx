import { cn } from '@/shared/utils/cn'

export type SortField = 'id' | 'name' | 'created_at'
export type SortOrder = 'asc' | 'desc'

interface SortIconProps {
  field: SortField
  sortField: SortField | null
  sortOrder: SortOrder
}

const SortIcon = ({ field, sortField, sortOrder }: SortIconProps) => {
  const isActive = sortField === field
  return (
    <span className="inline-flex flex-col" aria-hidden="true">
      <span className={cn('leading-none text-[10px]', isActive && sortOrder === 'asc' ? 'text-blue-600' : 'text-gray-300')}>▲</span>
      <span className={cn('leading-none text-[10px]', isActive && sortOrder === 'desc' ? 'text-blue-600' : 'text-gray-300')}>▼</span>
    </span>
  )
}

interface SortableHeaderProps {
  label: string
  field: SortField
  sortField: SortField | null
  sortOrder: SortOrder
  onSort: (field: SortField) => void
  className?: string
}

export const SortableHeader = ({ label, field, sortField, sortOrder, onSort, className }: SortableHeaderProps) => (
  <th
    scope="col"
    className={cn('text-left text-xs font-medium text-gray-500 uppercase tracking-wider', className)}
  >
    <button
      onClick={() => onSort(field)}
      className="flex items-center gap-1 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
      aria-label={`依${label}排序`}
    >
      {label}
      <SortIcon field={field} sortField={sortField} sortOrder={sortOrder} />
    </button>
  </th>
)
