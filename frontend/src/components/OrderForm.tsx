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
    <form onSubmit={handleSubmit} className="max-w-md space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">Latitude</label>
        <input
          type="number"
          step="any"
          value={latitude}
          onChange={(e) => setLatitude(e.target.value)}
          placeholder="e.g. 40.7128"
          className="w-full px-4 py-2.5 rounded-lg border border-slate-600 bg-slate-900 text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          disabled={loading}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">Longitude</label>
        <input
          type="number"
          step="any"
          value={longitude}
          onChange={(e) => setLongitude(e.target.value)}
          placeholder="e.g. -74.0060"
          className="w-full px-4 py-2.5 rounded-lg border border-slate-600 bg-slate-900 text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          disabled={loading}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">Subtotal ($)</label>
        <input
          type="number"
          step="0.01"
          min="0.01"
          value={subtotal}
          onChange={(e) => setSubtotal(e.target.value)}
          placeholder="e.g. 29.99"
          className="w-full px-4 py-2.5 rounded-lg border border-slate-600 bg-slate-900 text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          disabled={loading}
        />
      </div>

      {error && (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-2.5 text-sm font-medium rounded-lg bg-primary-600 text-white hover:bg-primary-500 disabled:opacity-60 transition"
      >
        {loading ? 'Creating...' : 'Create Order'}
      </button>
    </form>
  )
}
