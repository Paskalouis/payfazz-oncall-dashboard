import type { LabelStats } from '~/utils/oncall'

type Props = {
  currentStats: LabelStats[]
  previousStats: LabelStats[]
  previousMonthName: string
}

type LabelComparison = {
  label: string
  currentIssues: number
  previousIssues: number
  issuesDiff: number
  issuesPercentChange: number
  currentHours: number
  previousHours: number
  hoursDiff: number
  hoursPercentChange: number
}

export function LabelComparisonTable({
  currentStats,
  previousStats,
  previousMonthName,
}: Props) {
  const previousMap = new Map(previousStats.map((s) => [s.label, s]))

  const allLabels = new Set([
    ...currentStats.map((s) => s.label),
    ...previousStats.map((s) => s.label),
  ])

  const comparisons: LabelComparison[] = Array.from(allLabels).map((label) => {
    const current = currentStats.find((s) => s.label === label)
    const previous = previousMap.get(label)

    const currentIssues = current?.count ?? 0
    const previousIssues = previous?.count ?? 0
    const issuesDiff = currentIssues - previousIssues
    const issuesPercentChange =
      previousIssues !== 0 ? (issuesDiff / previousIssues) * 100 : currentIssues > 0 ? 100 : 0

    const currentHours = current?.totalTimeHours ?? 0
    const previousHours = previous?.totalTimeHours ?? 0
    const hoursDiff = currentHours - previousHours
    const hoursPercentChange =
      previousHours !== 0 ? (hoursDiff / previousHours) * 100 : currentHours > 0 ? 100 : 0

    return {
      label,
      currentIssues,
      previousIssues,
      issuesDiff,
      issuesPercentChange,
      currentHours,
      previousHours,
      hoursDiff,
      hoursPercentChange,
    }
  })

  // Sort: regressions first (positive diff), then improvements (negative diff)
  // Within each group, sort by magnitude
  comparisons.sort((a, b) => {
    if (a.issuesDiff > 0 && b.issuesDiff <= 0) return -1
    if (a.issuesDiff <= 0 && b.issuesDiff > 0) return 1
    if (a.issuesDiff > 0 && b.issuesDiff > 0) {
      return b.issuesDiff - a.issuesDiff
    }
    return a.issuesDiff - b.issuesDiff
  })

  const formatChange = (diff: number, percentChange: number, isHours = false) => {
    if (diff === 0) return <span className="text-gray-500">-</span>

    const isImprovement = diff < 0
    const colorClass = isImprovement ? 'text-green-600' : 'text-red-600'
    const arrow = isImprovement ? '↓' : '↑'
    const formattedDiff = isHours ? diff.toFixed(1) : diff
    const sign = diff > 0 ? '+' : ''

    return (
      <span className={colorClass}>
        {arrow} {sign}{formattedDiff} ({sign}{percentChange.toFixed(1)}%)
      </span>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Label Comparison vs {previousMonthName}
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 pr-4 font-medium text-gray-700">Label</th>
              <th className="text-right py-2 px-2 font-medium text-gray-700">Issues</th>
              <th className="text-right py-2 px-2 font-medium text-gray-700">Prev</th>
              <th className="text-left py-2 px-2 font-medium text-gray-700">Change</th>
              <th className="text-right py-2 px-2 font-medium text-gray-700">Hours</th>
              <th className="text-right py-2 px-2 font-medium text-gray-700">Prev</th>
              <th className="text-left py-2 pl-2 font-medium text-gray-700">Change</th>
            </tr>
          </thead>
          <tbody>
            {comparisons.map((c) => (
              <tr key={c.label} className="border-b border-gray-100">
                <td className="py-2 pr-4 text-gray-900">{c.label}</td>
                <td className="py-2 px-2 text-right text-gray-900">{c.currentIssues}</td>
                <td className="py-2 px-2 text-right text-gray-500">{c.previousIssues}</td>
                <td className="py-2 px-2">{formatChange(c.issuesDiff, c.issuesPercentChange)}</td>
                <td className="py-2 px-2 text-right text-gray-900">{c.currentHours.toFixed(1)}</td>
                <td className="py-2 px-2 text-right text-gray-500">{c.previousHours.toFixed(1)}</td>
                <td className="py-2 pl-2">{formatChange(c.hoursDiff, c.hoursPercentChange, true)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
