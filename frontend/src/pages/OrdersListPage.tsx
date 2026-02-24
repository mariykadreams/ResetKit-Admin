import { useState, useEffect } from 'react'
import { ordersApi, type Order } from '../services/api'
import OrderTable from '../components/OrderTable'
import Pagination from '../components/Pagination'
import Filters from '../components/Filters'

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

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-100 mb-6">Orders</h1>

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

      {loading ? (
        <p className="text-slate-500 py-8">Loading...</p>
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
  )
}
