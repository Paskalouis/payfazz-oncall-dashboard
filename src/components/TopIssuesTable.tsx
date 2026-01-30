import type { TopIssue } from '~/utils/oncall'

type Props = {
  data: TopIssue[]
}

export function TopIssuesTable({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        No time tracking data available
      </div>
    )
  }

  const truncateSummary = (summary: string, maxLength = 40) => {
    if (summary.length <= maxLength) return summary
    return summary.slice(0, maxLength) + '...'
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-2 pr-2 font-medium text-gray-700">Key</th>
            <th className="text-left py-2 px-2 font-medium text-gray-700">Summary</th>
            <th className="text-left py-2 px-2 font-medium text-gray-700">Label</th>
            <th className="text-right py-2 pl-2 font-medium text-gray-700">Time</th>
          </tr>
        </thead>
        <tbody>
          {data.map((issue) => (
            <tr key={issue.key} className="border-b border-gray-100">
              <td className="py-2 pr-2 text-[#0C45E1] font-medium">{issue.key}</td>
              <td className="py-2 px-2 text-gray-700" title={issue.summary}>
                {truncateSummary(issue.summary)}
              </td>
              <td className="py-2 px-2">
                <span className="inline-block bg-gray-100 px-2 py-0.5 rounded text-xs text-gray-700">
                  {issue.label}
                </span>
              </td>
              <td className="py-2 pl-2 text-right text-gray-900 font-medium">
                {issue.timeSpentFormatted}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
