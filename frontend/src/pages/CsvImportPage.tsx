import { ordersApi } from '../services/api'
import CsvUpload from '../components/CsvUpload'

export default function CsvImportPage() {
  async function handleUpload(file: File) {
    const { data } = await ordersApi.importOrders(file)
    return { importedCount: data.importedCount, errors: data.errors }
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
