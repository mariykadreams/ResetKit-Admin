import { useState } from 'react'
import { ordersApi, type Order } from '../services/api'
import OrderForm from '../components/OrderForm'

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

export default function CreateOrderPage() {
  const [success, setSuccess] = useState(false)
  const [lastOrder, setLastOrder] = useState<Order | null>(null)

  async function handleSubmit(latitude: number, longitude: number, subtotal: number) {
    const { data } = await ordersApi.createOrder({ latitude, longitude, subtotal })
    setSuccess(true)
    setLastOrder(data)
    setTimeout(() => setSuccess(false), 4000)
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold text-slate-100 tracking-tight mb-2">
          New one-off order
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl">
          Create a single order by providing the delivery location and pre-tax subtotal. Jurisdictions
          and tax will be looked up automatically for you.
        </p>
      </header>

      {success && (
        <div className="rounded-xl border border-emerald-500/50 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200 flex items-start gap-3">
          <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300">
            ✓
          </span>
          <div>
            <p className="font-medium">Order created successfully.</p>
            <p className="text-xs text-emerald-200/80">
              Tax has been calculated and the order has been stored.
            </p>
          </div>
        </div>
      )}

      <section className="grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] items-start">
        <div className="rounded-xl border border-slate-800/60 bg-slate-900/60 p-6 shadow-sm shadow-slate-950/40">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
                Order details
              </h2>
              <p className="mt-1 text-xs text-slate-500 max-w-sm">
                Use precise coordinates and an accurate subtotal to ensure correct tax calculation.
              </p>
            </div>
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary-500/40 bg-primary-600/20 text-primary-300">
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 21C12 21 5 14.9378 5 9.85714C5 6.09979 8.13401 3 12 3C15.866 3 19 6.09979 19 9.85714C19 14.9378 12 21 12 21Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle
                  cx="12"
                  cy="9.75"
                  r="2.25"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>

          <OrderForm onSubmit={handleSubmit} />
        </div>

        <aside className="space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 text-sm">
            <h2 className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
              What happens when you create an order
            </h2>
            <ol className="mt-2 space-y-1 list-decimal list-inside text-slate-300/90">
              <li>We look up the tax jurisdictions for the given coordinates.</li>
              <li>State, county, city, and special rates are combined into a composite rate.</li>
              <li>Tax is calculated from the subtotal and stored together with the order.</li>
            </ol>
          </div>

          {lastOrder && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 text-sm space-y-4">
              <div>
                <h2 className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
                  Last created order
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Quick snapshot of the most recently created order.
                </p>
              </div>

              <dl className="space-y-3 text-slate-300">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-xs text-slate-400 uppercase tracking-wide">Subtotal</dt>
                    <dd className="font-medium">{formatCurrency(lastOrder.subtotal)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-400 uppercase tracking-wide">
                      Total (incl. tax)
                    </dt>
                    <dd className="font-semibold text-primary-300">
                      {formatCurrency(lastOrder.totalAmount)}
                    </dd>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-xs text-slate-400 uppercase tracking-wide">
                      Composite tax rate
                    </dt>
                    <dd>{(lastOrder.compositeTaxRate * 100).toFixed(3)}%</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-400 uppercase tracking-wide">Tax amount</dt>
                    <dd className="font-medium text-emerald-300">
                      {formatCurrency(lastOrder.taxAmount)}
                    </dd>
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-3 grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-xs text-slate-400 uppercase tracking-wide">Coordinates</dt>
                    <dd className="font-mono text-xs text-slate-200">
                      {lastOrder.latitude}, {lastOrder.longitude}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-400 uppercase tracking-wide">Created at</dt>
                    <dd className="text-xs text-slate-300">
                      {new Date(lastOrder.createdAt).toLocaleString()}
                    </dd>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <dt className="text-slate-400 uppercase tracking-wide">State</dt>
                    <dd>{lastOrder.locationState || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-400 uppercase tracking-wide">County</dt>
                    <dd>{lastOrder.locationCounty || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-400 uppercase tracking-wide">City / Place</dt>
                    <dd>{lastOrder.locationCity || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-400 uppercase tracking-wide">ZIP (ZCTA)</dt>
                    <dd>{lastOrder.locationZip || '—'}</dd>
                  </div>
                </div>
              </dl>
            </div>
          )}
        </aside>
      </section>
    </div>
  )
}
