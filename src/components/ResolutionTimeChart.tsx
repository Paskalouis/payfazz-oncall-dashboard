import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { LabelResolutionStats } from '~/utils/oncall'

type Props = {
  data: LabelResolutionStats[]
}

export function ResolutionTimeChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        No resolution time data available
      </div>
    )
  }

  // Take top 10 for display
  const chartData = data.slice(0, 10).map((item) => ({
    name: item.label,
    hours: item.avgHours,
    count: item.count,
  }))

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
      >
        <XAxis
          type="number"
          tickFormatter={(value) => `${value}h`}
          domain={[0, 'auto']}
          tick={{ fontSize: 12 }}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={90}
          tick={{ fontSize: 12 }}
        />
        <Tooltip
          formatter={(value, _, props) => [
            `${value} hours avg (${props.payload.count} issues)`,
            'Resolution Time',
          ]}
        />
        <Bar dataKey="hours" fill="#0C45E1" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
