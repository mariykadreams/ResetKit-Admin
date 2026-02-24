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

export const ordersApi = {
  getOrders: (params?: OrdersQueryParams) =>
    api.get<OrdersPageResponse>('/orders', { params }),

  createOrder: (body: CreateOrderRequest) =>
    api.post<Order>('/orders', body),

  importOrders: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return axios.post<ImportOrdersResponse>(`${API_BASE}/orders/import`, form)
  },
}

export default api
