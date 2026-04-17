import { defineStore } from 'pinia'
import type { SalesAnalytics } from '~/types'
import { useAuthStore } from '~/stores/auth'

interface DashboardMetrics {
  totalMenuItems: number
  activeMenuItems: number
  totalCategories: number
  todaySales?: {
    revenue: number
    orders: number
  }
}

interface SuperAdminMetrics {
  tenants: {
    total: number
    active: number
    growth?: number
  }
  users: {
    total: number
    active: number
    growth?: number
  }
  registrations: {
    total: number
    pending: number
    growth?: number
  }
  revenue?: {
    total: number
    growth: number
  }
}

interface DashboardState {
  metrics: DashboardMetrics | null
  superAdminMetrics: SuperAdminMetrics | null
  analytics: SalesAnalytics | null
  loading: boolean
  error: string | null
}

/**
 * Dashboard Store - Manages dashboard state and metrics
 */
export const useDashboardStore = defineStore('dashboard', {
  state: (): DashboardState => ({
    metrics: null,
    superAdminMetrics: null,
    analytics: null,
    loading: false,
    error: null,
  }),

  getters: {
    hasAnalyticsAccess: () => {
      // This will be determined by the user's plan
      // For now, we'll check if analytics data is available
      return true // Will be updated with feature access check
    },
  },

  actions: {
    /**
     * Fetch dashboard metrics (menu items, categories)
     */
    async fetchMetrics(): Promise<void> {
      // Only show loading state on initial load (SWR pattern)
      if (!this.metrics) {
        this.loading = true
      }
      this.error = null
      const api = useApi()

      try {
        // Fetch menus and categories in parallel
        const [menusResponse, categoriesResponse] = await Promise.all([
          api.get<any>('/menu', { params: { page: 1, limit: 100 } }),
          api.get<any>('/tenant-admin/categories', { params: { page: 1, limit: 1 } })
        ])

        // Calculate metrics from responses
        let totalMenuItems = 0
        let activeMenuItems = 0
        
        // Responses are already unwrapped by ApiClient
        const menus = menusResponse || []
        
        if (Array.isArray(menus)) {
          menus.forEach((menu: any) => {
            if (menu.items && Array.isArray(menu.items)) {
              totalMenuItems += menu.items.length
              activeMenuItems += menu.items.filter((item: any) => item.isActive).length
            }
          })
        }
        
        // Note: ApiClient.unwrapResponse currently discards 'meta' field.
        // If meta is needed, we should either use api.getRaw or update unwrapResponse.
        // For now, we'll try to get length from data if it's an array.
        const totalCategories = Array.isArray(categoriesResponse) ? categoriesResponse.length : 0

        this.metrics = {
          totalMenuItems,
          activeMenuItems,
          totalCategories,
        }


      } catch (error: any) {
        console.error('Failed to fetch dashboard metrics:', error)
        this.error = error.message || 'Failed to load dashboard metrics'
        
        // Set default metrics on error
        this.metrics = {
          totalMenuItems: 0,
          activeMenuItems: 0,
          totalCategories: 0,
        }
      } finally {
        this.loading = false
      }
    },

    /**
     * Fetch analytics data (PRO/BUSINESS only)
     */
    async fetchAnalytics(): Promise<void> {
      const api = useApi()

      try {
        // Try to fetch today's analytics
        const today = new Date().toISOString().split('T')[0]
        const analyticsData = await api.get<any>('/analytics/overview', {
          params: {
            startDate: today,
            endDate: today,
          }
        })

        if (this.metrics) {
          this.metrics.todaySales = {
            revenue: analyticsData.totalRevenue || 0,
            orders: analyticsData.totalOrders || 0,
          }
        }

        this.analytics = analyticsData
      } catch (error: any) {
        // If 403, user doesn't have access to analytics (FREE plan)
        if (error.statusCode === 403 || error.code === 'ACCESS_DENIED') {
          console.log('Analytics not available in current plan')
          this.analytics = null
          if (this.metrics) {
            this.metrics.todaySales = undefined
          }
        } else {
          console.error('Failed to fetch analytics:', error)
          // Don't set this.error to avoid breaking the whole dashboard overview
        }
      }
    },

    /**
     * Fetch super admin dashboard metrics
     */
    async fetchSuperAdminMetrics(): Promise<void> {
      // Only show loading state on initial load (SWR pattern)
      if (!this.superAdminMetrics) {
        this.loading = true
      }
      this.error = null
      const api = useApi()

      try {
        // Fetch super admin dashboard data
        const dashboardData = await api.get<SuperAdminMetrics>('/super-admin/analytics/dashboard')
        
        this.superAdminMetrics = dashboardData
      } catch (error: any) {
        console.error('Failed to fetch super admin metrics:', error)
        this.error = error.message || 'Failed to load super admin metrics'
        
        // Set default metrics on error
        this.superAdminMetrics = {
          tenants: { total: 0, active: 0, growth: 0 },
          users: { total: 0, active: 0, growth: 0 },
          registrations: { total: 0, pending: 0, growth: 0 },
          revenue: { total: 0, growth: 0 }
        }
      } finally {
        this.loading = false
      }
    },

    /**
     * Fetch all dashboard data
     */
    async fetchDashboardData(): Promise<void> {
      const authStore = useAuthStore()
      
      // Check if user is super admin
      if (authStore.user?.role === 'SUPER_ADMIN') {
        await this.fetchSuperAdminMetrics()
      } else {
        await Promise.all([
          this.fetchMetrics(),
          this.fetchAnalytics()
        ])
      }
    },

    /**
     * Clear dashboard state
     */
    clearDashboard(): void {
      this.metrics = null
      this.analytics = null
      this.error = null
    },
  },
})
