interface PaginationProps {
  page: number
  totalPages: number
  totalCount: number
  pageSize: number
  onPageChange: (page: number) => void
}

export default function Pagination({
  page,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
}: PaginationProps) {
  const start = totalCount === 0 ? 0 : (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, totalCount)

  return (
    <div className="flex items-center justify-between px-2 py-3 border-t border-slate-700/60 bg-slate-800/40">
      <p className="text-sm text-slate-400">
        Showing <span className="font-medium text-slate-300">{start}</span> to{' '}
        <span className="font-medium text-slate-300">{end}</span> of{' '}
        <span className="font-medium text-slate-300">{totalCount}</span> results
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="px-3 py-1.5 text-sm font-medium rounded-md border border-slate-600 bg-slate-800 text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition"
        >
          Previous
        </button>
        <span className="px-3 py-1.5 text-sm text-slate-400">
          Page {page} of {totalPages || 1}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="px-3 py-1.5 text-sm font-medium rounded-md border border-slate-600 bg-slate-800 text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition"
        >
          Next
        </button>
      </div>
    </div>
  )
}
