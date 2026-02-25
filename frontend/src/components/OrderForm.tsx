import { useState } from 'react'

interface OrderFormProps {
  onSubmit: (latitude: number, longitude: number, subtotal: number) => Promise<void>
}

export default function OrderForm({ onSubmit }: OrderFormProps) {
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [subtotal, setSubtotal] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const lat = parseFloat(latitude)
    const lng = parseFloat(longitude)
    const sub = parseFloat(subtotal)

    if (isNaN(lat) || lat < -90 || lat > 90) {
      setError('Latitude must be between -90 and 90.')
      return
    }
    if (isNaN(lng) || lng < -180 || lng > 180) {
      setError('Longitude must be between -180 and 180.')
      return
    }
    if (isNaN(sub) || sub <= 0) {
      setError('Subtotal must be greater than 0.')
      return
    }

    setLoading(true)
    try {
      await onSubmit(lat, lng, sub)
      setLatitude('')
      setLongitude('')
      setSubtotal('')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create order.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-200 mb-1">Latitude</label>
          <p className="text-xs text-slate-500 mb-2">
            Use decimal degrees. Valid range is -90 to 90.
          </p>
          <input
            type="number"
            step="any"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            placeholder="e.g. 40.7128"
            className="w-full px-4 py-2.5 rounded-lg border border-slate-700 bg-slate-950 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-200 mb-1">Longitude</label>
          <p className="text-xs text-slate-500 mb-2">
            Use decimal degrees. Valid range is -180 to 180.
          </p>
          <input
            type="number"
            step="any"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            placeholder="e.g. -74.0060"
            className="w-full px-4 py-2.5 rounded-lg border border-slate-700 bg-slate-950 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            disabled={loading}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-200 mb-1">Subtotal ($)</label>
        <p className="text-xs text-slate-500 mb-2">
          Enter the pre-tax order amount. Must be greater than 0.
        </p>
        <input
          type="number"
          step="0.01"
          min="0.01"
          value={subtotal}
          onChange={(e) => setSubtotal(e.target.value)}
          placeholder="e.g. 29.99"
          className="w-full px-4 py-2.5 rounded-lg border border-slate-700 bg-slate-950 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          disabled={loading}
        />
      </div>

      {error && (
        <div
          className="rounded-lg border border-red-500/70 bg-red-500/10 px-3 py-2 text-xs text-red-200"
          role="alert"
        >
          {error}
        </div>
      )}

      <div className="flex items-center justify-between gap-4 pt-2">
        <p className="text-xs text-slate-500">
          You can also import many orders at once from the CSV import page.
        </p>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium rounded-lg bg-primary-600 text-white hover:bg-primary-500 disabled:opacity-60 disabled:cursor-not-allowed transition"
        >
          {loading ? 'Creating…' : 'Create order'}
        </button>
      </div>
    </form>
  )
}
