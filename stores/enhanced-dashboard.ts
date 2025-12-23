/**
 * Enhanced Dashboard Store with Widget Error Isolation
 * 
 * Implements requirements 5.1-5.5:
 * - Partial failure isolation per widget
 * - Safe default values on errors
 * - Data extraction for charts
 * - Feature access handling (403 errors)
 * - Metrics calculation from ApiResponse data
 */

import { defineStore } from 'pinia';
import type { 
  ApiError, 
  PaginatedResult,
  EnhancedRequestOptions 
} from '~/types/enhanced-api';
import type {
  DashboardMetrics,
  SalesAnalytics,
  TopSellingItem,
  CategoryPerformance,
  SalesTrendData,
  RecentOrder,
  Menu,
  MenuItem,
  Category
} from '~/types/business';

// ============================================================================
// Widget-specific State Types
// ============================================================================

interface WidgetState<T> {
  data: T;
  isLoading: boolean;
  error: ApiError | null;
  lastUpdated: string | null;
}

interface EnhancedDashboardState {
  // Widget states with error isolation
  widgets: {
    overview: WidgetState<DashboardMetrics>;
    analytics: WidgetState<SalesAnalytics>;
    topItems: WidgetState<TopSellingItem[]>;
    recentOrders: WidgetState<RecentOrder[]>;
    categoryPerformance: WidgetState<CategoryPerformance[]>;
    salesTrend: WidgetState<SalesTrendData[]>;
  };
  
  // Global loading state
  isInitializing: boolean;
  
  // Feature access flags
  hasAnalyticsAccess: boolean;
  hasReportsAccess: boolean;
}

// ============================================================================
// Safe Default Values
// ============================================================================

const createSafeOverviewDefaults = (): DashboardMetrics => ({
  totalRevenue: 0,
  totalOrders: 0,
  averageOrderValue: 0,
  activeMenuItems: 0,
  topSellingItems: [],
  recentOrders: []
});

const createSafeAnalyticsDefaults = (): SalesAnalytics => ({
  totalRevenue: 0,
  totalOrders: 0,
  averageOrderValue: 0,
  topItems: [],
  categoryPerformance: [],
  salesTrend: []
});

const createWidgetState = <T>(defaultData: T): WidgetState<T> => ({
  data: defaultData,
  isLoading: false,
  error: null,
  lastUpdated: null
});

// ============================================================================
// Enhanced Dashboard Store
// ============================================================================

export const useEnhancedDashboardStore = defineStore('enhanced-dashboard', {
  state: (): EnhancedDashboardState => ({
    widgets: {
      overview: createWidgetState(createSafeOverviewDefaults()),
      analytics: createWidgetState(createSafeAnalyticsDefaults()),
      topItems: createWidgetState<TopSellingItem[]>([]),
      recentOrders: createWidgetState<RecentOrder[]>([]),
      categoryPerformance: createWidgetState<CategoryPerformance[]>([]),
      salesTrend: createWidgetState<SalesTrendData[]>([])
    },
    isInitializing: false,
    hasAnalyticsAccess: true,
    hasReportsAccess: true
  }),

  getters: {
    /**
     * Check if any widget has errors
     */
    hasAnyErrors: (state): boolean => {
      return Object.values(state.widgets).some(widget => widget.error !== null);
    },

    /**
     * Check if any widget is loading
     */
    isAnyWidgetLoading: (state): boolean => {
      return Object.values(state.widgets).some(widget => widget.isLoading);
    },

    /**
     * Get errors by widget for debugging
     */
    widgetErrors: (state) => {
      const errors: Record<string, ApiError | null> = {};
      Object.entries(state.widgets).forEach(([key, widget]) => {
        errors[key] = widget.error;
      });
      return errors;
    },

    /**
     * Get chart data for analytics (extracted from ApiResponse)
     */
    chartData: (state) => ({
      salesTrend: state.widgets.salesTrend.data.map(item => ({
        date: item.date,
        revenue: item.revenue,
        orders: item.orders
      })),
      categoryPerformance: state.widgets.categoryPerformance.data.map(item => ({
        name: item.categoryName,
        value: item.revenue
      })),
      topItems: state.widgets.topItems.data.slice(0, 5).map(item => ({
        name: item.menuItemName,
        quantity: item.quantity,
        revenue: item.revenue
      }))
    })
  },

  actions: {
    /**
     * Initialize dashboard - load all widgets with error isolation
     */
    async initializeDashboard(): Promise<void> {
      this.isInitializing = true;

      try {
        // Load widgets in parallel with error isolation
        await Promise.allSettled([
          this.loadOverviewWidget(),
          this.loadAnalyticsWidget(),
          this.loadTopItemsWidget(),
          this.loadRecentOrdersWidget(),
          this.loadCategoryPerformanceWidget(),
          this.loadSalesTrendWidget()
        ]);
      } finally {
        this.isInitializing = false;
      }
    },

    /**
     * Load overview metrics widget (Requirement 5.1: Partial Failure)
     */
    async loadOverviewWidget(): Promise<void> {
      const widget = this.widgets.overview;
      widget.isLoading = true;
      widget.error = null;

      try {
        const { $api } = useNuxtApp();

        // Fetch menus and calculate metrics
        const menusResult = await $api.getPaginated<Menu>('/menu', { 
          limit: 100 
        });

        // Calculate derived metrics (Requirement 5.5)
        let totalMenuItems = 0;
        let activeMenuItems = 0;

        menusResult.items.forEach(menu => {
          if (menu.items) {
            totalMenuItems += menu.items.length;
            activeMenuItems += menu.items.filter(item => item.isActive).length;
          }
        });

        // Try to get today's sales data
        let totalRevenue = 0;
        let totalOrders = 0;
        let averageOrderValue = 0;

        try {
          const today = new Date().toISOString().split('T')[0];
          const salesData = await $api.get<any>('/analytics/daily-summary', {
            params: { date: today },
            skipErrorHandling: true
          });

          totalRevenue = salesData.totalRevenue || 0;
          totalOrders = salesData.totalOrders || 0;
          averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
        } catch (salesError) {
          // Sales data is optional - don't fail the whole widget
          console.log('Sales data not available for overview');
        }

        // Update widget with calculated metrics
        widget.data = {
          totalRevenue,
          totalOrders,
          averageOrderValue,
          activeMenuItems,
          topSellingItems: [], // Will be populated by separate widget
          recentOrders: []     // Will be populated by separate widget
        };

        widget.lastUpdated = new Date().toISOString();

      } catch (error) {
        // Requirement 5.2: Safe default values on error
        widget.error = error as ApiError;
        widget.data = createSafeOverviewDefaults();
        
        console.error('Overview widget error:', error);
      } finally {
        widget.isLoading = false;
      }
    },

    /**
     * Load analytics widget with feature access handling (Requirement 5.4)
     */
    async loadAnalyticsWidget(): Promise<void> {
      const widget = this.widgets.analytics;
      widget.isLoading = true;
      widget.error = null;

      try {
        const { $api } = useNuxtApp();

        // Requirement 5.3: Data extraction for charts
        const analyticsData = await $api.get<SalesAnalytics>('/analytics/overview', {
          params: {
            period: '30d'
          }
        });

        widget.data = analyticsData;
        widget.lastUpdated = new Date().toISOString();
        this.hasAnalyticsAccess = true;

      } catch (error: any) {
        // Requirement 5.4: Handle 403 as feature restriction
        if (error.response?.status === 403) {
          this.hasAnalyticsAccess = false;
          widget.error = {
            code: 'FEATURE_NOT_AVAILABLE',
            message: 'Analytics not available in your current plan',
            requestId: error.requestId
          } as ApiError;
        } else {
          widget.error = error as ApiError;
        }

        // Requirement 5.2: Safe defaults
        widget.data = createSafeAnalyticsDefaults();
        
        console.error('Analytics widget error:', error);
      } finally {
        widget.isLoading = false;
      }
    },

    /**
     * Load top selling items widget
     */
    async loadTopItemsWidget(): Promise<void> {
      const widget = this.widgets.topItems;
      widget.isLoading = true;
      widget.error = null;

      try {
        const { $api } = useNuxtApp();

        const topItemsData = await $api.get<TopSellingItem[]>('/analytics/top-items', {
          params: { limit: 10, period: '7d' }
        });

        widget.data = topItemsData;
        widget.lastUpdated = new Date().toISOString();

      } catch (error: any) {
        if (error.response?.status === 403) {
          // Feature not available - use empty array
          widget.data = [];
        } else {
          widget.error = error as ApiError;
          widget.data = [];
        }
        
        console.error('Top items widget error:', error);
      } finally {
        widget.isLoading = false;
      }
    },

    /**
     * Load recent orders widget
     */
    async loadRecentOrdersWidget(): Promise<void> {
      const widget = this.widgets.recentOrders;
      widget.isLoading = true;
      widget.error = null;

      try {
        const { $api } = useNuxtApp();

        const ordersResult = await $api.getPaginated<RecentOrder>('/orders/recent', {
          limit: 5
        });

        widget.data = ordersResult.items;
        widget.lastUpdated = new Date().toISOString();

      } catch (error) {
        widget.error = error as ApiError;
        widget.data = [];
        
        console.error('Recent orders widget error:', error);
      } finally {
        widget.isLoading = false;
      }
    },

    /**
     * Load category performance widget
     */
    async loadCategoryPerformanceWidget(): Promise<void> {
      const widget = this.widgets.categoryPerformance;
      widget.isLoading = true;
      widget.error = null;

      try {
        const { $api } = useNuxtApp();

        const performanceData = await $api.get<CategoryPerformance[]>('/analytics/category-performance', {
          params: { period: '30d' }
        });

        widget.data = performanceData;
        widget.lastUpdated = new Date().toISOString();

      } catch (error: any) {
        if (error.response?.status === 403) {
          widget.data = [];
        } else {
          widget.error = error as ApiError;
          widget.data = [];
        }
        
        console.error('Category performance widget error:', error);
      } finally {
        widget.isLoading = false;
      }
    },

    /**
     * Load sales trend widget for charts
     */
    async loadSalesTrendWidget(): Promise<void> {
      const widget = this.widgets.salesTrend;
      widget.isLoading = true;
      widget.error = null;

      try {
        const { $api } = useNuxtApp();

        // Requirement 5.3: Extract data for chart rendering
        const trendData = await $api.get<SalesTrendData[]>('/analytics/sales-trend', {
          params: { 
            period: '30d',
            granularity: 'daily'
          }
        });

        widget.data = trendData;
        widget.lastUpdated = new Date().toISOString();

      } catch (error: any) {
        if (error.response?.status === 403) {
          widget.data = [];
        } else {
          widget.error = error as ApiError;
          widget.data = [];
        }
        
        console.error('Sales trend widget error:', error);
      } finally {
        widget.isLoading = false;
      }
    },

    /**
     * Refresh specific widget
     */
    async refreshWidget(widgetName: keyof EnhancedDashboardState['widgets']): Promise<void> {
      switch (widgetName) {
        case 'overview':
          await this.loadOverviewWidget();
          break;
        case 'analytics':
          await this.loadAnalyticsWidget();
          break;
        case 'topItems':
          await this.loadTopItemsWidget();
          break;
        case 'recentOrders':
          await this.loadRecentOrdersWidget();
          break;
        case 'categoryPerformance':
          await this.loadCategoryPerformanceWidget();
          break;
        case 'salesTrend':
          await this.loadSalesTrendWidget();
          break;
      }
    },

    /**
     * Clear widget error
     */
    clearWidgetError(widgetName: keyof EnhancedDashboardState['widgets']): void {
      this.widgets[widgetName].error = null;
    },

    /**
     * Clear all widget errors
     */
    clearAllErrors(): void {
      Object.values(this.widgets).forEach(widget => {
        widget.error = null;
      });
    },

    /**
     * Reset dashboard state
     */
    resetDashboard(): void {
      this.widgets = {
        overview: createWidgetState(createSafeOverviewDefaults()),
        analytics: createWidgetState(createSafeAnalyticsDefaults()),
        topItems: createWidgetState<TopSellingItem[]>([]),
        recentOrders: createWidgetState<RecentOrder[]>([]),
        categoryPerformance: createWidgetState<CategoryPerformance[]>([]),
        salesTrend: createWidgetState<SalesTrendData[]>([])
      };
      this.hasAnalyticsAccess = true;
      this.hasReportsAccess = true;
    }
  }
});