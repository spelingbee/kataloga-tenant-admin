import { defineStore } from 'pinia'
import type {
  SalesAnalytics,
  TopSellingItem,
  CategoryPerformance,
  SalesTrendData,
  MenuItemSalesHistory,
} from '~/types'

interface AnalyticsState {
  overview: {
    totalRevenue: number
    totalOrders: number
    averageOrderValue: number
  } | null
  topItems: TopSellingItem[]
  categoryPerformance: CategoryPerformance[]
  salesTrend: SalesTrendData[]
  itemSalesHistory: MenuItemSalesHistory | null
  loading: boolean
  error: string | null
}

interface DateRange {
  startDate: string
  endDate: string
}

/**
 * Analytics Store - Manages sales analytics data
 */
export const useAnalyticsStore = defineStore('analytics', {
  state: (): AnalyticsState => ({
    overview: null,
    topItems: [],
    categoryPerformance: [],
    salesTrend: [],
    itemSalesHistory: null,
    loading: false,
    error: null,
  }),

  getters: {
    hasData: (state) => state.overview !== null,
    totalRevenue: (state) => state.overview?.totalRevenue || 0,
    totalOrders: (state) => state.overview?.totalOrders || 0,
    averageOrderValue: (state) => state.overview?.averageOrderValue || 0,
  },

  actions: {
    /**
     * Fetch analytics overview
     */
    async fetchOverview(dateRange?: DateRange): Promise<void> {
      this.loading = true
      this.error = null
      const api = useApi()

      try {
        const params = dateRange
          ? { startDate: dateRange.startDate, endDate: dateRange.endDate }
          : {}

        const response = await api.get('/analytics/overview', { params })
        this.overview = {
          totalRevenue: response.totalRevenue || 0,
          totalOrders: response.totalOrders || 0,
          averageOrderValue: response.averageOrderValue || 0,
        }
      } catch (error: any) {
        this.error = error.message || 'Failed to fetch analytics overview'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Fetch top-selling items
     */
    async fetchTopItems(dateRange?: DateRange, limit: number = 10): Promise<void> {
      this.loading = true
      this.error = null
      const api = useApi()

      try {
        const params = {
          ...(dateRange && {
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
          }),
          limit,
        }

        const response = await api.get('/analytics/top-items', { params })
        this.topItems = response.items || []
      } catch (error: any) {
        this.error = error.message || 'Failed to fetch top-selling items'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Fetch category performance
     */
    async fetchCategoryPerformance(dateRange?: DateRange): Promise<void> {
      this.loading = true
      this.error = null
      const api = useApi()

      try {
        const params = dateRange
          ? { startDate: dateRange.startDate, endDate: dateRange.endDate }
          : {}

        const response = await api.get('/analytics/category-performance', { params })
        this.categoryPerformance = response.categories || []
      } catch (error: any) {
        this.error = error.message || 'Failed to fetch category performance'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Fetch sales trend data
     */
    async fetchSalesTrend(
      dateRange?: DateRange,
      period: 'daily' | 'weekly' | 'monthly' = 'daily'
    ): Promise<void> {
      this.loading = true
      this.error = null
      const api = useApi()

      try {
        const params = {
          ...(dateRange && {
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
          }),
          period,
        }

        const response = await api.get('/analytics/sales', { params })
        this.salesTrend = response.trend || []
      } catch (error: any) {
        this.error = error.message || 'Failed to fetch sales trend'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Fetch all analytics data
     */
    async fetchAllAnalytics(
      dateRange?: DateRange,
      period: 'daily' | 'weekly' | 'monthly' = 'daily'
    ): Promise<void> {
      await Promise.all([
        this.fetchOverview(dateRange),
        this.fetchTopItems(dateRange),
        this.fetchCategoryPerformance(dateRange),
        this.fetchSalesTrend(dateRange, period),
      ])
    },

    /**
     * Fetch menu item sales history
     */
    async fetchItemSalesHistory(
      menuItemId: string,
      dateRange?: DateRange
    ): Promise<void> {
      this.loading = true
      this.error = null
      const api = useApi()

      try {
        const params = dateRange
          ? { startDate: dateRange.startDate, endDate: dateRange.endDate }
          : {}

        const response = await api.get(`/analytics/items/${menuItemId}/history`, {
          params,
        })
        this.itemSalesHistory = {
          menuItemId: response.menuItemId || menuItemId,
          menuItemName: response.menuItemName || '',
          totalQuantity: response.totalQuantity || 0,
          totalRevenue: response.totalRevenue || 0,
          sales: response.sales || [],
        }
      } catch (error: any) {
        this.error = error.message || 'Failed to fetch item sales history'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Export sales data
     */
    async exportSalesData(
      dateRange?: DateRange,
      format: 'csv' | 'excel' = 'csv'
    ): Promise<void> {
      const api = useApi()

      try {
        const params = {
          ...(dateRange && {
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
          }),
          format,
        }

        // This will trigger a download
        const response = await api.get('/analytics/export', {
          params,
          responseType: 'blob',
        })

        // Create download link
        const url = window.URL.createObjectURL(new Blob([response]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute(
          'download',
          `sales-export-${new Date().toISOString().split('T')[0]}.${format}`
        )
        document.body.appendChild(link)
        link.click()
        link.remove()
      } catch (error: any) {
        this.error = error.message || 'Failed to export sales data'
        throw error
      }
    },

    /**
     * Export item sales history to CSV
     */
    async exportItemSalesHistory(
      menuItemId: string,
      dateRange?: DateRange
    ): Promise<void> {
      const api = useApi()

      try {
        const params = {
          ...(dateRange && {
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
          }),
          format: 'csv',
        }

        // This will trigger a download
        const response = await api.get(`/analytics/items/${menuItemId}/history/export`, {
          params,
          responseType: 'blob',
        })

        // Create download link
        const url = window.URL.createObjectURL(new Blob([response]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute(
          'download',
          `item-sales-history-${menuItemId}-${new Date().toISOString().split('T')[0]}.csv`
        )
        document.body.appendChild(link)
        link.click()
        link.remove()
      } catch (error: any) {
        this.error = error.message || 'Failed to export item sales history'
        throw error
      }
    },

    /**
     * Clear analytics data
     */
    clearData(): void {
      this.overview = null
      this.topItems = []
      this.categoryPerformance = []
      this.salesTrend = []
      this.itemSalesHistory = null
      this.error = null
    },
  },
})
