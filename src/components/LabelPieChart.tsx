import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { PieLabelRenderProps } from 'recharts'
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

type ChartDataItem = {
  name: string
  value: number
  percentage: number
}

export function LabelPieChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center text-gray-500">
        No data available
      </div>
    )
  }

  const chartData: ChartDataItem[] = data.map((item) => ({
    name: item.label,
    value: item.count,
    percentage: item.percentage,
  }))

  const renderLabel = (props: PieLabelRenderProps) => {
    const entry = props.payload as ChartDataItem
    return `${entry.name}: ${entry.value} (${entry.percentage.toFixed(1)}%)`
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
          label={renderLabel}
          labelLine={false}
        >
          {chartData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => [`${value} issues`, 'Count']}
        />
        <Legend
          layout="horizontal"
          verticalAlign="bottom"
          align="center"
          wrapperStyle={{ paddingTop: 20 }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
