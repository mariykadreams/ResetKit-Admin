import { useState } from 'react'
import { ordersApi } from '../services/api'
import OrderForm from '../components/OrderForm'

export default function CreateOrderPage() {
  const [success, setSuccess] = useState(false)

  async function handleSubmit(latitude: number, longitude: number, subtotal: number) {
    const { data } = await ordersApi.createOrder({ latitude, longitude, subtotal })
    setSuccess(true)
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
    </div>
  )
}
