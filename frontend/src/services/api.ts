import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

export interface Order {
  id: number
  latitude: number
  longitude: number
  subtotal: number
  locationState?: string
  locationCounty?: string
  locationCity?: string
  locationZip?: string
  locationDistrict?: string
  locationSource?: string
  locationReportingCode?: string
  compositeTaxRate: number
  taxAmount: number
  totalAmount: number
  stateRate: number
  countyRate: number
  cityRate: number
  specialRate: number
  jurisdictions: string
  createdAt: string
}

export interface CreateOrderRequest {
  latitude: number
  longitude: number
  subtotal: number
}

export interface OrdersQueryParams {
  page?: number
  pageSize?: number
  dateFrom?: string
  dateTo?: string
  timeFrom?: string
  timeTo?: string
  minTotalAmount?: number
  maxTotalAmount?: number
  sortBy?: string
  sortDirection?: string
}

export interface OrdersPageResponse {
  data: Order[]
  totalCount: number
  totalPages: number
}

export interface ImportOrdersResponse {
  importedCount: number
  errors: string[]
}

export interface ImportOrdersProgress {
  progressId: string
  totalRows: number
  processedRows: number
  importedCount: number
  errorCount: number
  completed: boolean
}

export const ordersApi = {
  getOrders: (params?: OrdersQueryParams) =>
    api.get<OrdersPageResponse>('/orders', { params }),

  createOrder: (body: CreateOrderRequest) =>
    api.post<Order>('/orders', body),

  importOrders: (file: File, progressId?: string) => {
    const form = new FormData()
    form.append('file', file)
    const url = progressId
      ? `${API_BASE}/orders/import?progressId=${progressId}`
      : `${API_BASE}/orders/import`
    return axios.post<ImportOrdersResponse>(url, form)
  },

  getImportProgress: (progressId: string) =>
    api.get<ImportOrdersProgress>(`/orders/import/progress/${progressId}`),
}

export default api
