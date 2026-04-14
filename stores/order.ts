import { defineStore } from 'pinia'

type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED'

interface OrderItem {
  id: string
  productId: string
  quantity: number
  price: number
  product: {
    name: string
    description?: string
  }
}

interface Order {
  id: string
  orderNumber: string
  status: OrderStatus
  total: number
  customerName?: string
  customerPhone?: string
  paymentMethod: string
  paymentStatus: string
  createdAt: string
  items: OrderItem[]
  user?: {
    firstName: string
    lastName: string
    phone?: string
  }
}

interface OrderStats {
  pending: number
  confirmed: number
  todayRevenue: number
}

interface OrderState {
  orders: Order[]
  stats: OrderStats
  loading: boolean
  actionLoading: boolean
  error: string | null
}

export const useOrderStore = defineStore('order', {
  state: (): OrderState => ({
    orders: [],
    stats: {
      pending: 0,
      confirmed: 0,
      todayRevenue: 0
    },
    loading: false,
    actionLoading: false,
    error: null
  }),

  actions: {
    async fetchOrders(params?: { status?: string; page?: number; limit?: number }) {
      const { fetchWithCache } = useDataCache()
      this.loading = true
      this.error = null

      try {
        const cacheKey = `orders-${JSON.stringify(params || {})}`
        const data = await fetchWithCache(
          cacheKey,
          async () => {
            const api = useApi()
            const response = await api.get<{ data: any[], meta: any }>('/orders', { params })
            // Map raw backend orders to our interface
            return response.data.map((order: any) => ({
              ...order,
              customerName: order.user ? `${order.user.firstName} ${order.user.lastName}`.trim() : 'Anonymous',
              customerPhone: order.user?.phone || null,
              orderNumber: order.id.slice(0, 8).toUpperCase(), // Fallback if no orderNumber
              items: order.items || []
            }))
          },
          { ttl: 2 * 60 * 1000, staleWhileRevalidate: true }
        )
        
        this.orders = data
      } catch (err: any) {
        this.error = err.message || 'Failed to fetch orders'
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchOrderStats() {
      const { fetchWithCache } = useDataCache()
      
      try {
        const data = await fetchWithCache(
          'order-stats',
          async () => {
            const api = useApi()
            const response = await api.get<any>('/orders/analytics/summary', {
              params: { period: 'today' }
            })

            const summary = response.summary || {}
            const breakdown = response.statusBreakdown || {}
            
            return {
              pending: breakdown.PENDING || 0,
              confirmed: breakdown.CONFIRMED || 0,
              todayRevenue: summary.totalRevenue || 0
            }
          },
          { ttl: 1 * 60 * 1000, staleWhileRevalidate: true }
        )
        
        this.stats = data
      } catch (err: any) {
        console.error('Failed to fetch order stats:', err)
      }
    },

    async updateOrderStatus(orderId: string, status: OrderStatus) {
      this.actionLoading = true
      const api = useApi()

      try {
        const response = await api.patch(`/orders/${orderId}/status`, { status })
        
        // Update local state
        const index = this.orders.findIndex(o => o.id === orderId)
        if (index !== -1) {
          this.orders[index].status = status
        }
        
        // Refresh stats since counts changed
        await this.fetchOrderStats()
        
        return response
      } catch (err: any) {
        throw err
      } finally {
        this.actionLoading = false
      }
    }
  }
})
