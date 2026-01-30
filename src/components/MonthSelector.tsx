import { formatMonthDisplay } from '~/utils/oncall'

type Props = {
  months: string[]
  selectedMonth: string
  onMonthChange: (month: string) => void
}

export function MonthSelector({ months, selectedMonth, onMonthChange }: Props) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="month-select" className="text-sm font-medium text-gray-700">
        Month:
      </label>
      <select
        id="month-select"
        value={selectedMonth}
        onChange={(e) => onMonthChange(e.target.value)}
        className="block w-48 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-[#0C45E1] focus:outline-none focus:ring-1 focus:ring-[#0C45E1]"
      >
        <option value="all">All Months</option>
        {months.map((month) => (
          <option key={month} value={month}>
            {formatMonthDisplay(month)}
          </option>
        ))}
      </select>
    </div>
  )
}
