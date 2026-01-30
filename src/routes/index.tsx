import { createFileRoute } from '@tanstack/react-router'
import * as React from 'react'
import { CsvUploader } from '~/components/CsvUploader'
import { LabelPieChart } from '~/components/LabelPieChart'
import { TimeSpentChart } from '~/components/TimeSpentChart'
import { MonthSelector } from '~/components/MonthSelector'
import { ComparisonCard } from '~/components/ComparisonCard'
import { LabelComparisonTable } from '~/components/LabelComparisonTable'
import { TrendChart } from '~/components/TrendChart'
import { TopIssuesTable } from '~/components/TopIssuesTable'
import { ResolutionTimeChart } from '~/components/ResolutionTimeChart'
import {
  type OnCallIssue,
  type CsvValidationResult,
  getAvailableMonths,
  aggregateByLabel,
  filterIssuesByMonth,
  getPreviousMonth,
  formatMonthDisplay,
  aggregateByMonth,
  getTopTimeConsumingIssues,
  aggregateResolutionByLabel,
} from '~/utils/oncall'

export const Route = createFileRoute('/')({
  component: Dashboard,
})

function Dashboard() {
  const [uploadedData, setUploadedData] = React.useState<OnCallIssue[] | null>(
    null,
  )
  const [selectedMonth, setSelectedMonth] = React.useState('all')

  const handleUploadSuccess = (
    result: Extract<CsvValidationResult, { success: true }>,
  ) => {
    setUploadedData(result.data)
    setSelectedMonth('all')
  }

  const handleReset = () => {
    setUploadedData(null)
    setSelectedMonth('all')
  }

  const months = uploadedData ? getAvailableMonths(uploadedData) : []
  const filteredIssues = uploadedData
    ? filterIssuesByMonth(uploadedData, selectedMonth)
    : []
  const labelStats = aggregateByLabel(filteredIssues)

  const totalIssues = filteredIssues.length
  const totalHours = labelStats.reduce(
    (sum, stat) => sum + stat.totalTimeHours,
    0,
  )

  // Calculate previous month comparison data
  const isSpecificMonth = selectedMonth !== 'all'
  const previousMonth = isSpecificMonth ? getPreviousMonth(selectedMonth) : null
  const hasPreviousMonthData = previousMonth && months.includes(previousMonth)

  const previousIssues = hasPreviousMonthData && uploadedData
    ? filterIssuesByMonth(uploadedData, previousMonth)
    : []
  const previousLabelStats = aggregateByLabel(previousIssues)
  const previousTotalIssues = hasPreviousMonthData ? previousIssues.length : null
  const previousTotalHours = hasPreviousMonthData
    ? previousLabelStats.reduce((sum, stat) => sum + stat.totalTimeHours, 0)
    : null
  const previousMonthName = hasPreviousMonthData
    ? formatMonthDisplay(previousMonth).split(' ')[0] // Just month name like "December"
    : null

  // New insight widgets data
  const monthlyTrend = uploadedData ? aggregateByMonth(uploadedData) : []
  const topIssues = getTopTimeConsumingIssues(filteredIssues)
  const resolutionStats = aggregateResolutionByLabel(filteredIssues)

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          OnCall Dashboard
        </h1>
        <p className="text-gray-600">
          Upload your Jira CSV export to view and analyze on-call issues.
        </p>
      </div>

      {!uploadedData ? (
        <div className="max-w-xl">
          <CsvUploader onUploadSuccess={handleUploadSuccess} />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <MonthSelector
              months={months}
              selectedMonth={selectedMonth}
              onMonthChange={setSelectedMonth}
            />
            <button
              onClick={handleReset}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Upload New File
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <ComparisonCard
              label="Issues"
              currentValue={totalIssues}
              previousValue={previousTotalIssues}
              previousMonthName={isSpecificMonth ? previousMonthName : null}
            />
            <ComparisonCard
              label="Hours"
              currentValue={totalHours}
              previousValue={previousTotalHours}
              previousMonthName={isSpecificMonth ? previousMonthName : null}
              format="hours"
            />
          </div>

          {!isSpecificMonth && monthlyTrend.length >= 2 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Monthly Trend
              </h2>
              <TrendChart data={monthlyTrend} />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Issues by Label
              </h2>
              <LabelPieChart data={labelStats} />
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Time Spent by Label
              </h2>
              <TimeSpentChart data={labelStats} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Avg Resolution Time by Label
              </h2>
              <ResolutionTimeChart data={resolutionStats} />
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Top Time-Consuming Issues
              </h2>
              <TopIssuesTable data={topIssues} />
            </div>
          </div>

          {isSpecificMonth && hasPreviousMonthData && previousMonthName && (
            <LabelComparisonTable
              currentStats={labelStats}
              previousStats={previousLabelStats}
              previousMonthName={previousMonthName}
            />
          )}
        </div>
      )}
    </div>
  )
}
