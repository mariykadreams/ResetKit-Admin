import { useState } from 'react'
import { ordersApi, type Order } from '../services/api'
import OrderForm from '../components/OrderForm'

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
    <div>
      <h1 className="text-2xl font-semibold text-slate-100 mb-2">Create Order</h1>
      <p className="text-slate-400 mb-8">
        Enter delivery coordinates and subtotal. Tax will be calculated automatically.
      </p>

      {success && (
        <div className="mb-6 p-4 rounded-lg border border-emerald-500/50 bg-emerald-500/10 text-emerald-300">
          Order created successfully. Tax has been calculated and stored.
        </div>
      )}

      <OrderForm onSubmit={handleSubmit} />

      {lastOrder && (
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="p-4 rounded-lg border border-slate-700 bg-slate-900/60">
            <h2 className="text-sm font-semibold text-slate-200 mb-3">Location details</h2>
            <dl className="space-y-2 text-sm text-slate-300">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-slate-400">Source</dt>
                  <dd>{lastOrder.locationSource || '—'}</dd>
                </div>
                <div>
                  <dt className="text-slate-400">ZIP (ZCTA)</dt>
                  <dd>{lastOrder.locationZip || '—'}</dd>
                </div>
              </div>
              <div>
                <dt className="text-slate-400">Reporting code</dt>
                <dd>{lastOrder.locationReportingCode || '—'}</dd>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-slate-400">State</dt>
                  <dd>{lastOrder.locationState || '—'}</dd>
                </div>
                <div>
                  <dt className="text-slate-400">County</dt>
                  <dd>{lastOrder.locationCounty || '—'}</dd>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-slate-400">City / Place</dt>
                  <dd>{lastOrder.locationCity || '—'}</dd>
                </div>
                <div>
                  <dt className="text-slate-400">District</dt>
                  <dd>{lastOrder.locationDistrict || '—'}</dd>
                </div>
              </div>
              <div>
                <dt className="text-slate-400">Jurisdictions</dt>
                <dd>{lastOrder.jurisdictions || '—'}</dd>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-slate-400">Latitude</dt>
                  <dd>{lastOrder.latitude}</dd>
                </div>
                <div>
                  <dt className="text-slate-400">Longitude</dt>
                  <dd>{lastOrder.longitude}</dd>
                </div>
              </div>
              <div>
                <dt className="text-slate-400">Created at</dt>
                <dd>{new Date(lastOrder.createdAt).toLocaleString()}</dd>
              </div>
            </dl>
          </div>

          <div className="p-4 rounded-lg border border-slate-700 bg-slate-900/60">
            <h2 className="text-sm font-semibold text-slate-200 mb-3">Tax calculation</h2>
            <dl className="space-y-2 text-sm text-slate-300">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-slate-400">Subtotal</dt>
                  <dd>${lastOrder.subtotal.toFixed(2)}</dd>
                </div>
                <div>
                  <dt className="text-slate-400">Composite tax rate</dt>
                  <dd>{(lastOrder.compositeTaxRate * 100).toFixed(3)}%</dd>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-slate-400">State rate</dt>
                  <dd>{(lastOrder.stateRate * 100).toFixed(2)}%</dd>
                </div>
                <div>
                  <dt className="text-slate-400">County / local rate</dt>
                  <dd>{(lastOrder.countyRate * 100).toFixed(2)}%</dd>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-slate-400">City rate</dt>
                  <dd>{(lastOrder.cityRate * 100).toFixed(2)}%</dd>
                </div>
                <div>
                  <dt className="text-slate-400">Special rate</dt>
                  <dd>{(lastOrder.specialRate * 100).toFixed(2)}%</dd>
                </div>
              </div>

              <div className="border-t border-slate-700 pt-3 mt-3">
                <dt className="text-slate-400">Tax amount</dt>
                <dd className="font-medium text-slate-100">${lastOrder.taxAmount.toFixed(2)}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Total (subtotal + tax)</dt>
                <dd className="font-semibold text-primary-300">${lastOrder.totalAmount.toFixed(2)}</dd>
              </div>
            </dl>
          </div>
        </div>
      )}
    </div>
  )
}
