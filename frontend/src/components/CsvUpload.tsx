import { useState, useRef } from 'react'

interface CsvUploadProps {
  onUpload: (file: File) => Promise<{ importedCount: number; errors: string[] }>
}

export default function CsvUpload({ onUpload }: CsvUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ importedCount: number; errors: string[] } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return
    setLoading(true)
    setResult(null)
    try {
      const r = await onUpload(file)
      setResult(r)
      setFile(null)
      if (inputRef.current) inputRef.current.value = ''
    } catch (err) {
      setResult({ importedCount: 0, errors: [err instanceof Error ? err.message : 'Upload failed.'] })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">CSV File</label>
          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary-600 file:text-white hover:file:bg-primary-500 file:cursor-pointer"
            disabled={loading}
          />
          <p className="mt-2 text-xs text-slate-500">
            CSV must have columns: latitude, longitude, subtotal, timestamp
          </p>
        </div>

        <button
          type="submit"
          disabled={!file || loading}
          className="w-full px-4 py-2.5 text-sm font-medium rounded-lg bg-primary-600 text-white hover:bg-primary-500 disabled:opacity-60 transition"
        >
          {loading ? 'Importing...' : 'Import Orders'}
        </button>
      </form>

      {result && (
        <div
          className={`rounded-lg border p-4 ${
            result.errors.length > 0
              ? 'border-amber-500/50 bg-amber-500/10'
              : 'border-emerald-500/50 bg-emerald-500/10'
          }`}
        >
          <p className="text-sm font-medium text-slate-200">
            Imported {result.importedCount} order{result.importedCount !== 1 ? 's' : ''}.
          </p>
          {result.errors.length > 0 && (
            <ul className="mt-2 text-sm text-amber-300 space-y-1">
              {result.errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
