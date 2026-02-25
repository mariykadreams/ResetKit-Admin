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
    <div>
      <h1 className="text-2xl font-semibold text-slate-100 mb-2">CSV Import</h1>
      <p className="text-slate-400 mb-8">
        Upload a CSV file with columns: latitude, longitude, subtotal, timestamp. Tax will be
        calculated for each row and orders will be stored.
      </p>

      <CsvUpload onUpload={handleUpload} />
    </div>
  )
}
