import { useState, useEffect } from 'react'
import { ordersApi, type Order } from '../services/api'
import OrderTable from '../components/OrderTable'
import Pagination from '../components/Pagination'
import Filters from '../components/Filters'

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

export default function OrdersListPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [timeFrom, setTimeFrom] = useState('')
  const [timeTo, setTimeTo] = useState('')
  const [minTotalAmount, setMinTotalAmount] = useState('')
  const [maxTotalAmount, setMaxTotalAmount] = useState('')
  const [loading, setLoading] = useState(true)

  async function fetchOrders(overrides?: {
    p?: number
    df?: string
    dt?: string
    tf?: string
    tt?: string
    min?: string
    max?: string
  }) {
    setLoading(true)
    const p = overrides?.p ?? page
    const df = overrides?.df ?? dateFrom
    const dt = overrides?.dt ?? dateTo
    const tf = overrides?.tf ?? timeFrom
    const tt = overrides?.tt ?? timeTo
    const min = overrides?.min ?? minTotalAmount
    const max = overrides?.max ?? maxTotalAmount
    try {
      const { data } = await ordersApi.getOrders({
        page: p,
        pageSize,
        dateFrom: df || undefined,
        dateTo: dt || undefined,
        timeFrom: tf || undefined,
        timeTo: tt || undefined,
        minTotalAmount: min ? parseFloat(min) : undefined,
        maxTotalAmount: max ? parseFloat(max) : undefined,
        sortBy: 'CreatedAt',
        sortDirection: 'desc',
      })
      setOrders(data.data)
      setTotalCount(data.totalCount)
      setTotalPages(data.totalPages)
    } catch {
      setOrders([])
      setTotalCount(0)
      setTotalPages(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  function handleApplyFilters() {
    setPage(1)
    fetchOrders({ p: 1 })
  }

  function handleClearFilters() {
    setDateFrom('')
    setDateTo('')
    setTimeFrom('')
    setTimeTo('')
    setMinTotalAmount('')
    setMaxTotalAmount('')
    setPage(1)
    fetchOrders({ p: 1, df: '', dt: '', tf: '', tt: '', min: '', max: '' })
  }

  const pageTotalAmount = orders.reduce((sum, o) => sum + o.totalAmount, 0)
  const averageOrderValue = orders.length ? pageTotalAmount / orders.length : 0

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold text-slate-100 tracking-tight mb-2">Orders</h1>
        <p className="text-sm text-slate-400 max-w-2xl">
          Review imported orders, filter by date, time, and total amount, and quickly spot high-value
          activity.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-800/60 bg-slate-900/60 px-4 py-3">
          <p className="text-xs font-medium tracking-wide text-slate-400 uppercase">
            Total orders (matching filters)
          </p>
          <p className="mt-1 text-2xl font-semibold text-slate-50">
            {loading ? '—' : totalCount.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Across all pages for the current filter selection.
          </p>
        </div>

        <div className="rounded-xl border border-slate-800/60 bg-slate-900/60 px-4 py-3">
          <p className="text-xs font-medium tracking-wide text-slate-400 uppercase">
            Page total (incl. tax)
          </p>
          <p className="mt-1 text-2xl font-semibold text-emerald-400">
            {loading || !orders.length ? '—' : formatCurrency(pageTotalAmount)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Sum of order totals on the current page.
          </p>
        </div>

        <div className="rounded-xl border border-slate-800/60 bg-slate-900/60 px-4 py-3">
          <p className="text-xs font-medium tracking-wide text-slate-400 uppercase">
            Avg. order value
          </p>
          <p className="mt-1 text-2xl font-semibold text-primary-400">
            {loading || !orders.length ? '—' : formatCurrency(averageOrderValue)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Average total (including tax) on this page.
          </p>
        </div>
      </section>

      <section className="rounded-xl border border-slate-800/60 bg-slate-900/60 shadow-sm shadow-slate-950/40 overflow-hidden">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-5 py-4 border-b border-slate-800/60">
          <div>
            <h2 className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
              Orders list
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {loading
                ? 'Fetching the latest orders...'
                : `Showing ${orders.length} orders on this page out of ${totalCount.toLocaleString()} total for the current filters.`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => fetchOrders()}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-200 shadow-sm hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            <svg
              className="mr-1.5 h-3.5 w-3.5"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4.5 4.5A6.5 6.5 0 0117 8h-2.5a.75.75 0 000 1.5H18a.75.75 0 00.75-.75V4a.75.75 0 00-1.5 0v1.69A8 8 0 102 10.25.75.75 0 003.5 10 6.5 6.5 0 014.5 4.5z"
                fill="currentColor"
              />
            </svg>
            Refresh
          </button>
        </div>

        <div className="px-5 pt-4 pb-3 border-b border-slate-800/60 bg-slate-900/40">
          <Filters
            dateFrom={dateFrom}
            dateTo={dateTo}
            timeFrom={timeFrom}
            timeTo={timeTo}
            minTotalAmount={minTotalAmount}
            maxTotalAmount={maxTotalAmount}
            onDateFromChange={setDateFrom}
            onDateToChange={setDateTo}
            onTimeFromChange={setTimeFrom}
            onTimeToChange={setTimeTo}
            onMinTotalAmountChange={setMinTotalAmount}
            onMaxTotalAmountChange={setMaxTotalAmount}
            onApply={handleApplyFilters}
            onClear={handleClearFilters}
          />
        </div>

        <div>
          {loading ? (
            <OrdersTableSkeleton />
          ) : (
            <>
              <OrderTable orders={orders} />
              <Pagination
                page={page}
                totalPages={totalPages}
                totalCount={totalCount}
                pageSize={pageSize}
                onPageChange={setPage}
              />
            </>
          )}
        </div>
      </section>
    </div>
  )
}

function OrdersTableSkeleton() {
  const rows = Array.from({ length: 8 })
  const cols = Array.from({ length: 8 })

  return (
    <div className="overflow-x-auto">
      <div className="min-w-full border-t border-slate-800/60 bg-slate-950/40">
        {rows.map((_, rowIdx) => (
          <div
            key={rowIdx}
            className="animate-pulse border-b border-slate-800/40 bg-slate-900/40 last:border-b-0"
          >
            <div className="grid grid-cols-8 gap-4 px-4 py-3">
              {cols.map((__, colIdx) => (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: skeleton only
                  key={colIdx}
                  className="h-3.5 rounded-full bg-slate-800/70"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
