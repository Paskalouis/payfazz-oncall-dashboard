import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { MonthlyStats } from '~/utils/oncall'

type Props = {
  data: MonthlyStats[]
}

export function TrendChart({ data }: Props) {
  if (data.length < 2) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        Need at least 2 months of data to show trends
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <XAxis dataKey="monthDisplay" tick={{ fontSize: 12 }} />
        <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
        <Tooltip
          formatter={(value, name) => {
            if (name === 'issues') return [`${value}`, 'Issues']
            return [`${value}h`, 'Hours']
          }}
        />
        <Legend />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="issues"
          name="Issues"
          stroke="#0C45E1"
          strokeWidth={2}
          dot={{ fill: '#0C45E1', r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="hours"
          name="Hours"
          stroke="#F59E0B"
          strokeWidth={2}
          dot={{ fill: '#F59E0B', r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
