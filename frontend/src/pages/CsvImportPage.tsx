import Swal from 'sweetalert2'
import { ordersApi } from '../services/api'
import CsvUpload from '../components/CsvUpload'

export default function CsvImportPage() {
  async function handleUpload(file: File) {
    const progressId =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`

    Swal.fire({
      title: 'Importing orders',
      html: `
        <div style="margin-top: 12px; text-align: left;">
          <div style="font-size: 0.9rem; margin-bottom: 4px;">
            <span id="import-progress-text">Preparing import...</span>
          </div>
          <div style="font-size: 0.8rem; margin-bottom: 4px; color: #cbd5f5;">
            <span id="import-progress-count">0 / 0 rows</span>
            &nbsp;&middot;&nbsp;
            <span id="import-progress-percent">0%</span>
          </div>
          <div style="width: 100%; height: 8px; background: rgba(148, 163, 184, 0.3); border-radius: 999px; overflow: hidden;">
            <div
              id="import-progress-bar"
              style="height: 100%; width: 0%; background: #3b82f6; transition: width 0.3s ease;"
            ></div>
          </div>
        </div>
      `,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
    })

    const start = Date.now()
    let pollHandle: number | undefined

    const updateFromProgress = (totalRows: number, processedRows: number) => {
      const percent =
        totalRows > 0 ? Math.min(100, Math.round((processedRows / totalRows) * 100)) : 0
      const elapsedMs = Date.now() - start
      const rowsPerMs = processedRows > 0 ? processedRows / elapsedMs : 0
      const remainingRows = Math.max(totalRows - processedRows, 0)
      const remainingMs = rowsPerMs > 0 ? remainingRows / rowsPerMs : 0
      const remainingSeconds = Math.ceil(remainingMs / 1000)

      const bar = document.getElementById('import-progress-bar') as HTMLDivElement | null
      const text = document.getElementById('import-progress-text')
      const count = document.getElementById('import-progress-count')
      const percentLabel = document.getElementById('import-progress-percent')

      if (bar) {
        bar.style.width = `${percent}%`
      }

      if (count) {
        count.textContent = `${processedRows} / ${totalRows || '?'} rows processed`
      }

      if (percentLabel) {
        percentLabel.textContent = `${percent}%`
      }

      if (text) {
        if (processedRows === 0 || remainingSeconds <= 0 || !isFinite(remainingSeconds)) {
          text.textContent = 'Analyzing file...'
        } else {
          text.textContent = `About ${remainingSeconds} second${
            remainingSeconds !== 1 ? 's' : ''
          } remaining...`
        }
      }
    }

    const startPolling = () => {
      pollHandle = window.setInterval(async () => {
        try {
          const { data } = await ordersApi.getImportProgress(progressId)
          updateFromProgress(data.totalRows, data.processedRows)

          if (data.completed && pollHandle !== undefined) {
            window.clearInterval(pollHandle)
            pollHandle = undefined
          }
        } catch {
          // Ignore polling errors (e.g. progress not yet initialized)
        }
      }, 600)
    }

    startPolling()

    try {
      const { data } = await ordersApi.importOrders(file, progressId)

      // Ensure bar shows as complete
      updateFromProgress(data.importedCount + data.errors.length, data.importedCount + data.errors.length)

      Swal.fire({
        icon: data.errors.length ? 'warning' : 'success',
        title: data.errors.length ? 'Imported with warnings' : 'Import completed',
        html: `
          <p>Imported <b>${data.importedCount}</b> order${data.importedCount !== 1 ? 's' : ''}.</p>
          ${
            data.errors.length
              ? `<ul style="text-align:left; margin-top:12px;">
                  ${data.errors.map((e: string) => `<li>• ${e}</li>`).join('')}
                 </ul>`
              : ''
          }
        `,
      })

      return { importedCount: data.importedCount, errors: data.errors }
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Import failed',
        text: error?.message || 'Something went wrong while importing the file.',
      })
      throw error
    } finally {
      if (pollHandle !== undefined) {
        window.clearInterval(pollHandle)
      }
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100 tracking-tight mb-2">CSV Import</h1>
        <p className="text-sm text-slate-400 max-w-2xl">
          Upload a CSV file with columns:{' '}
          <span className="font-mono text-xs text-slate-200">
            latitude, longitude, subtotal, timestamp
          </span>
          . Tax will be calculated for each row and orders will be stored.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] items-start">
        <section className="rounded-xl border border-slate-800/60 bg-slate-900/60 p-6 shadow-sm shadow-slate-950/40">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
                Upload file
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Choose a CSV that matches the expected columns to start the import.
              </p>
            </div>
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-primary-500/50 bg-primary-600/20 text-primary-300">
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7 15L12 10L17 15M12 10V21M7 7H5C3.89543 7 3 7.89543 3 9V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V9C21 7.89543 20.1046 7 19 7H17"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>

          <CsvUpload onUpload={handleUpload} />
        </section>

        <aside className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4 text-sm">
          <div>
            <h2 className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
              How the import works
            </h2>
            <ol className="mt-2 space-y-1 list-decimal list-inside text-slate-300/90">
              <li>Select a CSV file that contains your order data.</li>
              <li>Click <span className="font-medium">Import Orders</span> to start the process.</li>
              <li>
                Watch the live progress dialog while rows are analyzed, taxed, and stored.
              </li>
            </ol>
          </div>

          <div className="border-t border-slate-800 pt-4">
            <h3 className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
              Required CSV columns
            </h3>
            <ul className="mt-2 space-y-1 text-slate-300/90">
              <li>
                <span className="font-mono text-xs text-slate-200">latitude</span> – order latitude.
              </li>
              <li>
                <span className="font-mono text-xs text-slate-200">longitude</span> – order
                longitude.
              </li>
              <li>
                <span className="font-mono text-xs text-slate-200">subtotal</span> – pre-tax order
                amount.
              </li>
              <li>
                <span className="font-mono text-xs text-slate-200">timestamp</span> – order date and
                time.
              </li>
            </ul>
            <p className="mt-3 text-xs text-slate-500">
              Extra columns are ignored by the importer; make sure the required ones are present and
              correctly named.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
