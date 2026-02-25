import type { Order } from '../services/api'

interface OrderTableProps {
  orders: Order[]
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

function formatRate(r: number) {
  return `${(r * 100).toFixed(2)}%`
}

function formatDateTime(s: string) {
  const d = new Date(s)
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatLocation(o: Order) {
  const cityState = [o.locationCity, o.locationState].filter(Boolean).join(', ')
  const zip = o.locationZip?.trim()

  if (!cityState && !zip) {
    return '—'
  }

  if (!cityState && zip) {
    return zip
  }

  if (cityState && !zip) {
    return cityState
  }

  return `${cityState} ${zip}`
}

export default function OrderTable({ orders }: OrderTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-700/60">
      <table className="min-w-full divide-y divide-slate-700/60">
        <thead className="bg-slate-800/80">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Id</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Latitude</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Longitude</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Location
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-slate-300 uppercase tracking-wider">Subtotal</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-slate-300 uppercase tracking-wider">Tax Rate</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-slate-300 uppercase tracking-wider">Tax Amount</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-slate-300 uppercase tracking-wider">Total</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Created At</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700/40">
          {orders.length === 0 ? (
            <tr>
              <td colSpan={9} className="px-4 py-12 text-center text-slate-500">
                No orders found.
              </td>
            </tr>
          ) : (
            orders.map((o) => (
              <tr key={o.id} className="bg-slate-900/40 hover:bg-slate-800/50 transition">
                <td className="px-4 py-3 text-sm text-slate-300 font-mono">{o.id}</td>
                <td className="px-4 py-3 text-sm text-slate-300 font-mono">{o.latitude}</td>
                <td className="px-4 py-3 text-sm text-slate-300 font-mono">{o.longitude}</td>
                <td className="px-4 py-3 text-sm text-slate-300">
                  <div className="flex flex-col">
                    <span className="truncate max-w-[220px]">{formatLocation(o)}</span>
                    {o.locationSource && (
                      <span className="mt-0.5 text-[10px] uppercase tracking-wide text-slate-500">
                        {o.locationSource}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-right text-slate-200">{formatCurrency(o.subtotal)}</td>
                <td className="px-4 py-3 text-sm text-right text-slate-200">{formatRate(o.compositeTaxRate)}</td>
                <td className="px-4 py-3 text-sm text-right text-primary-400">{formatCurrency(o.taxAmount)}</td>
                <td className="px-4 py-3 text-sm text-right font-medium text-emerald-400">{formatCurrency(o.totalAmount)}</td>
                <td className="px-4 py-3 text-sm text-slate-400 whitespace-nowrap">
                  {formatDateTime(o.createdAt)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
