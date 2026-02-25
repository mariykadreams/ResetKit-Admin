interface FiltersProps {
  dateFrom: string
  dateTo: string
  timeFrom: string
  timeTo: string
  minTotalAmount: string
  maxTotalAmount: string
  onDateFromChange: (v: string) => void
  onDateToChange: (v: string) => void
  onTimeFromChange: (v: string) => void
  onTimeToChange: (v: string) => void
  onMinTotalAmountChange: (v: string) => void
  onMaxTotalAmountChange: (v: string) => void
  onApply: () => void
  onClear: () => void
}

export default function Filters({
  dateFrom,
  dateTo,
  timeFrom,
  timeTo,
  minTotalAmount,
  maxTotalAmount,
  onDateFromChange,
  onDateToChange,
  onTimeFromChange,
  onTimeToChange,
  onMinTotalAmountChange,
  onMaxTotalAmountChange,
  onApply,
  onClear,
}: FiltersProps) {
  return (
    <div className="flex flex-wrap items-end gap-4">
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1">Date From</label>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => onDateFromChange(e.target.value)}
          className="px-3 py-2 rounded-md border border-slate-600 bg-slate-900 text-slate-200 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1">Time From</label>
        <input
          type="time"
          value={timeFrom}
          onChange={(e) => onTimeFromChange(e.target.value)}
          className="px-3 py-2 rounded-md border border-slate-600 bg-slate-900 text-slate-200 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1">Date To</label>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => onDateToChange(e.target.value)}
          className="px-3 py-2 rounded-md border border-slate-600 bg-slate-900 text-slate-200 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1">Time To</label>
        <input
          type="time"
          value={timeTo}
          onChange={(e) => onTimeToChange(e.target.value)}
          className="px-3 py-2 rounded-md border border-slate-600 bg-slate-900 text-slate-200 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1" title="Filter by Total (Subtotal + Tax)">
          Min Total ($, incl. tax)
        </label>
        <input
          type="number"
          min="0"
          step="0.01"
          placeholder="0"
          value={minTotalAmount}
          onChange={(e) => onMinTotalAmountChange(e.target.value)}
          className="px-3 py-2 rounded-md border border-slate-600 bg-slate-900 text-slate-200 text-sm w-28 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1" title="Filter by Total (Subtotal + Tax)">
          Max Total ($, incl. tax)
        </label>
        <input
          type="number"
          min="0"
          step="0.01"
          placeholder="Any"
          value={maxTotalAmount}
          onChange={(e) => onMaxTotalAmountChange(e.target.value)}
          className="px-3 py-2 rounded-md border border-slate-600 bg-slate-900 text-slate-200 text-sm w-28 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={onApply}
          className="px-4 py-2 text-sm font-medium rounded-md bg-primary-600 text-white hover:bg-primary-500 transition"
        >
          Apply
        </button>
        <button
          onClick={onClear}
          className="px-4 py-2 text-sm font-medium rounded-md border border-slate-600 text-slate-300 hover:bg-slate-700 transition"
        >
          Clear
        </button>
      </div>
    </div>
  )
}
