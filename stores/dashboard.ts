import { defineStore } from 'pinia'
import type { SalesAnalytics } from '~/types'

interface DashboardMetrics {
  totalMenuItems: number
  activeMenuItems: number
  totalCategories: number
  todaySales?: {
    revenue: number
    orders: number
  }
}

interface DashboardState {
  metrics: DashboardMetrics | null
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
      this.loading = true
      this.error = null
      const api = useApi()

      try {
        // Fetch menus with items
        const menusResponse = await api.get<any>('/menu', {
          params: { page: 1, limit: 100 }
        })
        
        // Fetch categories count
        const categoriesResponse = await api.get<any>('/tenant-admin/categories', {
          params: { page: 1, limit: 1 }
        })

        // Calculate metrics from responses
        let totalMenuItems = 0
        let activeMenuItems = 0
        
        if (menusResponse.data && Array.isArray(menusResponse.data)) {
          menusResponse.data.forEach((menu: any) => {
            if (menu.items && Array.isArray(menu.items)) {
              totalMenuItems += menu.items.length
              activeMenuItems += menu.items.filter((item: any) => item.isActive).length
            }
          })
        }
        
        const totalCategories = categoriesResponse.meta?.total || 0

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
        if (error.response?.status === 403) {
          console.log('Analytics not available in current plan')
        } else {
          console.error('Failed to fetch analytics:', error)
        }
      }
    },

    /**
     * Fetch all dashboard data
     */
    async fetchDashboardData(): Promise<void> {
      await this.fetchMetrics()
      await this.fetchAnalytics()
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
