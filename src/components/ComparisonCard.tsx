type Props = {
  label: string
  currentValue: number
  previousValue: number | null
  previousMonthName: string | null
  format?: 'number' | 'hours'
}

export function ComparisonCard({
  label,
  currentValue,
  previousValue,
  previousMonthName,
  format = 'number',
}: Props) {
  const formatValue = (value: number) => {
    if (format === 'hours') {
      return value.toFixed(1)
    }
    return value.toString()
  }

  const hasComparison = previousValue !== null && previousMonthName !== null

  const diff = hasComparison ? currentValue - previousValue : 0
  const percentChange = hasComparison && previousValue !== 0
    ? ((currentValue - previousValue) / previousValue) * 100
    : 0

  // For issues/hours: decrease is good (green), increase is bad (red)
  const isImprovement = diff < 0
  const isNeutral = diff === 0

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="text-2xl font-bold text-gray-900">
        {formatValue(currentValue)}
      </div>
      <div className="text-sm text-gray-500">{label}</div>
      {hasComparison && (
        <div
          className={`text-sm mt-1 ${
            isNeutral
              ? 'text-gray-500'
              : isImprovement
                ? 'text-green-600'
                : 'text-red-600'
          }`}
        >
          {isNeutral ? (
            <span>No change vs {previousMonthName}</span>
          ) : (
            <span>
              {isImprovement ? '↓' : '↑'}{' '}
              {diff > 0 ? '+' : ''}
              {format === 'hours' ? diff.toFixed(1) : diff}{' '}
              ({percentChange > 0 ? '+' : ''}
              {percentChange.toFixed(1)}%) vs {previousMonthName}
            </span>
          )}
        </div>
      )}
      {!hasComparison && previousMonthName === null && (
        <div className="text-sm mt-1 text-gray-400">
          No previous data
        </div>
      )}
    </div>
  )
}
