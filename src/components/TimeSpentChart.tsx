import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import type { LabelStats } from '~/utils/oncall'

const COLORS = [
  '#0C45E1', // Fazz Blue (primary)
  '#10B981', // Emerald green
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#EF4444', // Red
  '#84CC16', // Lime
  '#F97316', // Orange
  '#6366F1', // Indigo
]

type Props = {
  data: LabelStats[]
}

export function TimeSpentChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center text-gray-500">
        No data available
      </div>
    )
  }

  const chartData = data
    .filter((item) => item.totalTimeHours > 0)
    .sort((a, b) => b.totalTimeHours - a.totalTimeHours)
    .map((item) => ({
      name: item.label,
      hours: parseFloat(item.totalTimeHours.toFixed(2)),
    }))

  if (chartData.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center text-gray-500">
        No time tracking data available
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
      >
        <XAxis
          type="number"
          tickFormatter={(value) => `${value}h`}
          domain={[0, 'auto']}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={90}
          tick={{ fontSize: 12 }}
        />
        <Tooltip
          formatter={(value) => [`${value} hours`, 'Time Spent']}
        />
        <Bar dataKey="hours" radius={[0, 4, 4, 0]}>
          {chartData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
