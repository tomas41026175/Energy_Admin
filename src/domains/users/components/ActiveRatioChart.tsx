import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { Skeleton } from '@/shared/ui/Skeleton'
import { CHART_COLORS, CHART_INNER_RADIUS, CHART_OUTER_RADIUS } from '@/shared/constants'

const PIE_COLORS = [CHART_COLORS.active, CHART_COLORS.inactive] as const

interface ActiveRatioChartProps {
  active: number | undefined
  inactive: number | undefined
  isLoading: boolean
}

export const ActiveRatioChart = ({ active, inactive, isLoading }: ActiveRatioChartProps) => {
  const data = [
    { name: '啟用', value: active ?? 0 },
    { name: '停用', value: inactive ?? 0 },
  ]

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-base font-semibold text-gray-900 mb-4">使用者狀態分佈</h2>
      {isLoading ? (
        <Skeleton variant="rectangular" height={200} />
      ) : (
        <div aria-hidden="true" className="outline-none [&_svg]:outline-none [&_svg_*]:outline-none">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart style={{ outline: 'none' }}>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={CHART_INNER_RADIUS}
                outerRadius={CHART_OUTER_RADIUS}
                dataKey="value"
                label={({ name, percent }: { name?: string; percent?: number }) =>
                  `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`
                }
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number | undefined) => value != null ? `${value} 人` : ''} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
