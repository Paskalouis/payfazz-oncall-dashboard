export const REQUIRED_COLUMNS = [
  'Issue Type',
  'Key',
  'Summary',
  'Assignee',
  'Created',
  'Updated',
  'Labels',
  'Σ Time Spent',
] as const

export type OnCallIssue = {
  issueType: string
  key: string
  summary: string
  assignee: string
  created: string
  updated: string
  labels: string
  timeSpent: number | null
}

export type CsvValidationResult =
  | { success: true; data: OnCallIssue[]; rowCount: number }
  | { success: false; error: string; missingColumns?: string[] }

export function validateCsvColumns(headers: string[]): {
  valid: boolean
  missingColumns: string[]
} {
  const normalizedHeaders = headers.map((h) => h.trim())
  const missingColumns = REQUIRED_COLUMNS.filter(
    (col) => !normalizedHeaders.includes(col),
  )
  return {
    valid: missingColumns.length === 0,
    missingColumns,
  }
}

export function parseCsv(csvText: string): CsvValidationResult {
  const lines = csvText.split('\n').filter((line) => line.trim())

  if (lines.length === 0) {
    return { success: false, error: 'CSV file is empty' }
  }

  const headers = parseCSVLine(lines[0])
  const validation = validateCsvColumns(headers)

  if (!validation.valid) {
    return {
      success: false,
      error: `Missing required columns: ${validation.missingColumns.join(', ')}`,
      missingColumns: validation.missingColumns,
    }
  }

  const headerIndexMap = new Map<string, number>()
  headers.forEach((header, index) => {
    headerIndexMap.set(header.trim(), index)
  })

  const data: OnCallIssue[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
    if (values.length === 0) continue

    const timeSpentRaw = values[headerIndexMap.get('Σ Time Spent') ?? -1] || ''
    const timeSpent = timeSpentRaw ? parseInt(timeSpentRaw, 10) : null

    data.push({
      issueType: values[headerIndexMap.get('Issue Type') ?? -1] || '',
      key: values[headerIndexMap.get('Key') ?? -1] || '',
      summary: values[headerIndexMap.get('Summary') ?? -1] || '',
      assignee: values[headerIndexMap.get('Assignee') ?? -1] || '',
      created: values[headerIndexMap.get('Created') ?? -1] || '',
      updated: values[headerIndexMap.get('Updated') ?? -1] || '',
      labels: values[headerIndexMap.get('Labels') ?? -1] || '',
      timeSpent: isNaN(timeSpent as number) ? null : timeSpent,
    })
  }

  return { success: true, data, rowCount: data.length }
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }

  result.push(current.trim())
  return result
}

export function formatTimeSpent(seconds: number | null): string {
  if (seconds === null || seconds === 0) return '-'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
  }
  return `${minutes}m`
}

export type LabelStats = {
  label: string
  count: number
  percentage: number
  totalTimeSeconds: number
  totalTimeHours: number
}

export function extractMonth(dateString: string): string {
  // Parse "1/28/2026 15:35:33" format to "2026-01"
  const match = dateString.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (!match) return 'Unknown'
  const [, month, , year] = match
  return `${year}-${month.padStart(2, '0')}`
}

export function formatMonthDisplay(monthKey: string): string {
  // Convert "2026-01" to "January 2026"
  if (monthKey === 'all') return 'All Months'
  const [year, month] = monthKey.split('-')
  const date = new Date(parseInt(year), parseInt(month) - 1)
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

export function getAvailableMonths(issues: OnCallIssue[]): string[] {
  const months = new Set<string>()
  for (const issue of issues) {
    const month = extractMonth(issue.created)
    if (month !== 'Unknown') {
      months.add(month)
    }
  }
  return Array.from(months).sort().reverse()
}

export function aggregateByLabel(issues: OnCallIssue[]): LabelStats[] {
  const labelMap = new Map<string, { count: number; totalTimeSeconds: number }>()

  for (const issue of issues) {
    const label = issue.labels || 'No Label'
    const existing = labelMap.get(label) || { count: 0, totalTimeSeconds: 0 }
    existing.count++
    existing.totalTimeSeconds += issue.timeSpent || 0
    labelMap.set(label, existing)
  }

  const totalIssues = issues.length
  const stats: LabelStats[] = []

  for (const [label, data] of labelMap) {
    stats.push({
      label,
      count: data.count,
      percentage: totalIssues > 0 ? (data.count / totalIssues) * 100 : 0,
      totalTimeSeconds: data.totalTimeSeconds,
      totalTimeHours: data.totalTimeSeconds / 3600,
    })
  }

  return stats.sort((a, b) => b.count - a.count)
}

export function filterIssuesByMonth(
  issues: OnCallIssue[],
  month: string,
): OnCallIssue[] {
  if (month === 'all') return issues
  return issues.filter((issue) => extractMonth(issue.created) === month)
}

export function getPreviousMonth(month: string): string {
  const [year, m] = month.split('-').map(Number)
  const date = new Date(year, m - 2) // m-1 for 0-indexed, -1 for previous
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

// Monthly aggregation for trend chart
export type MonthlyStats = {
  month: string
  monthDisplay: string
  issues: number
  hours: number
}

export function aggregateByMonth(issues: OnCallIssue[]): MonthlyStats[] {
  const monthMap = new Map<string, { issues: number; hours: number }>()

  for (const issue of issues) {
    const month = extractMonth(issue.created)
    if (month === 'Unknown') continue

    const existing = monthMap.get(month) || { issues: 0, hours: 0 }
    existing.issues++
    existing.hours += (issue.timeSpent || 0) / 3600
    monthMap.set(month, existing)
  }

  return Array.from(monthMap.entries())
    .map(([month, data]) => ({
      month,
      monthDisplay: formatMonthDisplay(month).split(' ')[0], // Just month name
      issues: data.issues,
      hours: parseFloat(data.hours.toFixed(1)),
    }))
    .sort((a, b) => a.month.localeCompare(b.month)) // Chronological order
}

// Date parsing for resolution time
export function parseDate(dateString: string): Date | null {
  // Parse "1/28/2026 15:35:33" format
  const match = dateString.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})/)
  if (!match) return null
  const [, month, day, year, hours, minutes, seconds] = match
  return new Date(
    parseInt(year),
    parseInt(month) - 1,
    parseInt(day),
    parseInt(hours),
    parseInt(minutes),
    parseInt(seconds)
  )
}

export function calculateResolutionHours(issue: OnCallIssue): number | null {
  const created = parseDate(issue.created)
  const updated = parseDate(issue.updated)
  if (!created || !updated) return null
  const diffMs = updated.getTime() - created.getTime()
  if (diffMs < 0) return null
  return diffMs / (1000 * 60 * 60) // Convert to hours
}

// Resolution time aggregation by label
export type LabelResolutionStats = {
  label: string
  avgHours: number
  count: number
}

export function aggregateResolutionByLabel(issues: OnCallIssue[]): LabelResolutionStats[] {
  const labelMap = new Map<string, { totalHours: number; count: number }>()

  for (const issue of issues) {
    const label = issue.labels || 'No Label'
    const resolutionHours = calculateResolutionHours(issue)
    if (resolutionHours === null) continue

    const existing = labelMap.get(label) || { totalHours: 0, count: 0 }
    existing.totalHours += resolutionHours
    existing.count++
    labelMap.set(label, existing)
  }

  return Array.from(labelMap.entries())
    .map(([label, data]) => ({
      label,
      avgHours: parseFloat((data.totalHours / data.count).toFixed(1)),
      count: data.count,
    }))
    .sort((a, b) => b.avgHours - a.avgHours) // Longest resolution time first
}

// Top time-consuming issues
export type TopIssue = {
  key: string
  summary: string
  label: string
  timeSpentHours: number
  timeSpentFormatted: string
}

export function getTopTimeConsumingIssues(issues: OnCallIssue[], limit = 10): TopIssue[] {
  return issues
    .filter((issue) => issue.timeSpent && issue.timeSpent > 0)
    .sort((a, b) => (b.timeSpent || 0) - (a.timeSpent || 0))
    .slice(0, limit)
    .map((issue) => ({
      key: issue.key,
      summary: issue.summary,
      label: issue.labels || 'No Label',
      timeSpentHours: (issue.timeSpent || 0) / 3600,
      timeSpentFormatted: formatTimeSpent(issue.timeSpent),
    }))
}
