/**
 * Tests for Enhanced Dashboard Store
 * 
 * Tests widget error isolation, safe defaults, feature access, and metrics calculation
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useEnhancedDashboardStore } from '~/stores/enhanced-dashboard';
import { 
  createMockApiResponse,
  createMockErrorResponse,
  createMockMenu,
  createMockMenuItem,
  createMockPaginatedResult
} from '~/utils/test-factories';
import type { 
  DashboardMetrics,
  SalesAnalytics,
  TopSellingItem,
  CategoryPerformance,
  SalesTrendData,
  RecentOrder,
  Menu
} from '~/types/business';
import type { ApiError } from '~/types/enhanced-api';

// Mock the Nuxt app
const mockApi = {
  get: vi.fn(),
  getPaginated: vi.fn(),
};

// Mock useNuxtApp globally
vi.mock('#app', () => ({
  useNuxtApp: vi.fn(() => ({
    $api: mockApi
  }))
}));

global.useNuxtApp = vi.fn(() => ({
  $api: mockApi
}));

describe('Enhanced Dashboard Store', () => {
  let store: ReturnType<typeof useEnhancedDashboardStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useEnhancedDashboardStore();
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should have safe default values for all widgets', () => {
      // Requirement 5.2: Safe default values
      expect(store.widgets.overview.data).toEqual({
        totalRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        activeMenuItems: 0,
        topSellingItems: [],
        recentOrders: []
      });

      expect(store.widgets.analytics.data).toEqual({
        totalRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        topItems: [],
        categoryPerformance: [],
        salesTrend: []
      });

      expect(store.widgets.topItems.data).toEqual([]);
      expect(store.widgets.recentOrders.data).toEqual([]);
      expect(store.widgets.categoryPerformance.data).toEqual([]);
      expect(store.widgets.salesTrend.data).toEqual([]);
    });

    it('should have no errors initially', () => {
      expect(store.hasAnyErrors).toBe(false);
      expect(store.widgetErrors.overview).toBeNull();
      expect(store.widgetErrors.analytics).toBeNull();
    });

    it('should have feature access enabled by default', () => {
      expect(store.hasAnalyticsAccess).toBe(true);
      expect(store.hasReportsAccess).toBe(true);
    });
  });

  describe('Widget Error Isolation (Requirement 5.1)', () => {
    it('should isolate overview widget errors', async () => {
      const overviewError: ApiError = {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch overview data'
      };
      
      mockApi.getPaginated.mockRejectedValue(overviewError);

      await store.loadOverviewWidget();

      // Overview widget should have error and safe defaults
      expect(store.widgets.overview.error).toEqual(overviewError);
      expect(store.widgets.overview.data.totalRevenue).toBe(0);
      expect(store.widgets.overview.data.activeMenuItems).toBe(0);

      // Other widgets should not be affected
      expect(store.widgets.analytics.error).toBeNull();
      expect(store.widgets.topItems.error).toBeNull();
    });

    it('should isolate analytics widget errors', async () => {
      const analyticsError: ApiError = {
        code: 'ANALYTICS_ERROR',
        message: 'Analytics service unavailable'
      };
      
      mockApi.get.mockRejectedValue(analyticsError);

      await store.loadAnalyticsWidget();

      // Analytics widget should have error and safe defaults
      expect(store.widgets.analytics.error).toEqual(analyticsError);
      expect(store.widgets.analytics.data).toEqual({
        totalRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        topItems: [],
        categoryPerformance: [],
        salesTrend: []
      });

      // Other widgets should not be affected
      expect(store.widgets.overview.error).toBeNull();
    });

    it('should continue loading other widgets when one fails', async () => {
      // Mock overview to fail
      mockApi.getPaginated.mockRejectedValueOnce(new Error('Overview failed'));
      
      // Mock analytics to succeed
      const mockAnalytics: SalesAnalytics = {
        totalRevenue: 1000,
        totalOrders: 50,
        averageOrderValue: 20,
        topItems: [],
        categoryPerformance: [],
        salesTrend: []
      };
      mockApi.get.mockResolvedValueOnce(mockAnalytics);

      // Initialize dashboard (loads all widgets)
      await store.initializeDashboard();

      // Overview should have error, analytics should have data
      expect(store.widgets.overview.error).toBeTruthy();
      expect(store.widgets.analytics.error).toBeNull();
      expect(store.widgets.analytics.data).toEqual(mockAnalytics);
    });
  });

  describe('Safe Default Values (Requirement 5.2)', () => {
    it('should set safe defaults when overview widget fails', async () => {
      mockApi.getPaginated.mockRejectedValue(new Error('Network error'));

      await store.loadOverviewWidget();

      expect(store.widgets.overview.data).toEqual({
        totalRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        activeMenuItems: 0,
        topSellingItems: [],
        recentOrders: []
      });
    });

    it('should set empty arrays for list widgets on error', async () => {
      mockApi.get.mockRejectedValue(new Error('API error'));

      await store.loadTopItemsWidget();
      await store.loadCategoryPerformanceWidget();
      await store.loadSalesTrendWidget();

      expect(store.widgets.topItems.data).toEqual([]);
      expect(store.widgets.categoryPerformance.data).toEqual([]);
      expect(store.widgets.salesTrend.data).toEqual([]);
    });

    it('should set safe defaults when recent orders widget fails', async () => {
      mockApi.getPaginated.mockRejectedValue(new Error('Orders API error'));

      await store.loadRecentOrdersWidget();

      expect(store.widgets.recentOrders.data).toEqual([]);
    });
  });

  describe('Data Extraction for Charts (Requirement 5.3)', () => {
    it('should extract chart data from sales trend', async () => {
      const mockTrendData: SalesTrendData[] = [
        { date: '2024-01-01', revenue: 100, orders: 5 },
        { date: '2024-01-02', revenue: 150, orders: 8 },
        { date: '2024-01-03', revenue: 200, orders: 10 }
      ];
      
      mockApi.get.mockResolvedValue(mockTrendData);
      await store.loadSalesTrendWidget();

      const chartData = store.chartData;
      expect(chartData.salesTrend).toEqual([
        { date: '2024-01-01', revenue: 100, orders: 5 },
        { date: '2024-01-02', revenue: 150, orders: 8 },
        { date: '2024-01-03', revenue: 200, orders: 10 }
      ]);
    });

    it('should extract chart data from category performance', async () => {
      const mockCategoryData: CategoryPerformance[] = [
        { categoryId: 'cat-1', categoryName: 'Beverages', revenue: 500, itemCount: 10 },
        { categoryId: 'cat-2', categoryName: 'Food', revenue: 800, itemCount: 15 }
      ];
      
      mockApi.get.mockResolvedValue(mockCategoryData);
      await store.loadCategoryPerformanceWidget();

      const chartData = store.chartData;
      expect(chartData.categoryPerformance).toEqual([
        { name: 'Beverages', value: 500 },
        { name: 'Food', value: 800 }
      ]);
    });

    it('should extract top items chart data (limited to 5)', async () => {
      const mockTopItems: TopSellingItem[] = [
        { menuItemId: '1', menuItemName: 'Coffee', quantity: 100, revenue: 300 },
        { menuItemId: '2', menuItemName: 'Tea', quantity: 80, revenue: 200 },
        { menuItemId: '3', menuItemName: 'Sandwich', quantity: 60, revenue: 400 },
        { menuItemId: '4', menuItemName: 'Cake', quantity: 40, revenue: 250 },
        { menuItemId: '5', menuItemName: 'Juice', quantity: 30, revenue: 150 },
        { menuItemId: '6', menuItemName: 'Water', quantity: 20, revenue: 50 }
      ];
      
      mockApi.get.mockResolvedValue(mockTopItems);
      await store.loadTopItemsWidget();

      const chartData = store.chartData;
      expect(chartData.topItems).toHaveLength(5); // Limited to 5 items
      expect(chartData.topItems[0]).toEqual({
        name: 'Coffee',
        quantity: 100,
        revenue: 300
      });
    });
  });

  describe('Feature Access Handling (Requirement 5.4)', () => {
    it('should handle 403 errors as feature restrictions for analytics', async () => {
      const forbiddenError = {
        response: { status: 403 },
        requestId: 'req-123'
      };
      
      mockApi.get.mockRejectedValue(forbiddenError);

      await store.loadAnalyticsWidget();

      expect(store.hasAnalyticsAccess).toBe(false);
      expect(store.widgets.analytics.error).toEqual({
        code: 'FEATURE_NOT_AVAILABLE',
        message: 'Analytics not available in your current plan',
        requestId: 'req-123'
      });
      expect(store.widgets.analytics.data).toEqual({
        totalRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        topItems: [],
        categoryPerformance: [],
        salesTrend: []
      });
    });

    it('should handle 403 errors for top items widget', async () => {
      const forbiddenError = {
        response: { status: 403 }
      };
      
      mockApi.get.mockRejectedValue(forbiddenError);

      await store.loadTopItemsWidget();

      expect(store.widgets.topItems.data).toEqual([]);
      expect(store.widgets.topItems.error).toBeNull(); // 403 is handled gracefully
    });

    it('should handle 403 errors for category performance', async () => {
      const forbiddenError = {
        response: { status: 403 }
      };
      
      mockApi.get.mockRejectedValue(forbiddenError);

      await store.loadCategoryPerformanceWidget();

      expect(store.widgets.categoryPerformance.data).toEqual([]);
    });

    it('should handle 403 errors for sales trend', async () => {
      const forbiddenError = {
        response: { status: 403 }
      };
      
      mockApi.get.mockRejectedValue(forbiddenError);

      await store.loadSalesTrendWidget();

      expect(store.widgets.salesTrend.data).toEqual([]);
    });
  });

  describe('Metrics Calculation (Requirement 5.5)', () => {
    it('should calculate derived metrics from menu data', async () => {
      const mockMenus = [
        createMockMenu({
          items: [
            createMockMenuItem({ isActive: true }),
            createMockMenuItem({ isActive: true }),
            createMockMenuItem({ isActive: false })
          ]
        }),
        createMockMenu({
          items: [
            createMockMenuItem({ isActive: true }),
            createMockMenuItem({ isActive: false })
          ]
        })
      ];
      
      const mockMenusResult = createMockPaginatedResult(mockMenus);
      mockApi.getPaginated.mockResolvedValue(mockMenusResult);

      // Mock sales data call to fail (optional data)
      mockApi.get.mockRejectedValue(new Error('Sales not available'));

      await store.loadOverviewWidget();

      expect(store.widgets.overview.data.activeMenuItems).toBe(3); // 3 active items total
      expect(store.widgets.overview.data.totalRevenue).toBe(0); // Sales data failed
      expect(store.widgets.overview.data.totalOrders).toBe(0);
      expect(store.widgets.overview.data.averageOrderValue).toBe(0);
    });

    it('should calculate metrics including sales data when available', async () => {
      const mockMenus = [
        createMockMenu({
          items: [createMockMenuItem({ isActive: true })]
        })
      ];
      
      const mockMenusResult = createMockPaginatedResult(mockMenus);
      mockApi.getPaginated.mockResolvedValue(mockMenusResult);

      // Mock successful sales data
      const mockSalesData = {
        totalRevenue: 1500,
        totalOrders: 75
      };
      mockApi.get.mockResolvedValue(mockSalesData);

      await store.loadOverviewWidget();

      expect(store.widgets.overview.data.totalRevenue).toBe(1500);
      expect(store.widgets.overview.data.totalOrders).toBe(75);
      expect(store.widgets.overview.data.averageOrderValue).toBe(20); // 1500 / 75
      expect(store.widgets.overview.data.activeMenuItems).toBe(1);
    });

    it('should handle zero orders for average calculation', async () => {
      const mockMenus = [createMockMenu({ items: [] })];
      const mockMenusResult = createMockPaginatedResult(mockMenus);
      mockApi.getPaginated.mockResolvedValue(mockMenusResult);

      const mockSalesData = {
        totalRevenue: 100,
        totalOrders: 0 // Zero orders
      };
      mockApi.get.mockResolvedValue(mockSalesData);

      await store.loadOverviewWidget();

      expect(store.widgets.overview.data.averageOrderValue).toBe(0); // Avoid division by zero
    });
  });

  describe('Widget Management', () => {
    it('should refresh specific widgets', async () => {
      const mockAnalytics: SalesAnalytics = {
        totalRevenue: 2000,
        totalOrders: 100,
        averageOrderValue: 20,
        topItems: [],
        categoryPerformance: [],
        salesTrend: []
      };
      
      mockApi.get.mockResolvedValue(mockAnalytics);

      await store.refreshWidget('analytics');

      expect(store.widgets.analytics.data).toEqual(mockAnalytics);
      expect(store.widgets.analytics.lastUpdated).toBeTruthy();
    });

    it('should clear widget errors', () => {
      store.widgets.overview.error = {
        code: 'TEST_ERROR',
        message: 'Test error'
      };
      store.widgets.analytics.error = {
        code: 'TEST_ERROR',
        message: 'Test error'
      };

      store.clearWidgetError('overview');

      expect(store.widgets.overview.error).toBeNull();
      expect(store.widgets.analytics.error).toBeTruthy(); // Other errors preserved
    });

    it('should clear all widget errors', () => {
      store.widgets.overview.error = { code: 'ERROR', message: 'Test' };
      store.widgets.analytics.error = { code: 'ERROR', message: 'Test' };
      store.widgets.topItems.error = { code: 'ERROR', message: 'Test' };

      store.clearAllErrors();

      expect(store.widgets.overview.error).toBeNull();
      expect(store.widgets.analytics.error).toBeNull();
      expect(store.widgets.topItems.error).toBeNull();
    });

    it('should reset dashboard to initial state', () => {
      // Set some state
      store.widgets.overview.data.totalRevenue = 1000;
      store.widgets.analytics.error = { code: 'ERROR', message: 'Test' };
      store.hasAnalyticsAccess = false;

      store.resetDashboard();

      expect(store.widgets.overview.data.totalRevenue).toBe(0);
      expect(store.widgets.analytics.error).toBeNull();
      expect(store.hasAnalyticsAccess).toBe(true);
    });
  });

  describe('Loading States', () => {
    it('should track loading states per widget', async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise(resolve => {
        resolvePromise = resolve;
      });
      
      mockApi.get.mockReturnValue(promise);

      // Start loading
      const loadPromise = store.loadAnalyticsWidget();
      
      expect(store.widgets.analytics.isLoading).toBe(true);
      expect(store.isAnyWidgetLoading).toBe(true);

      // Resolve the promise
      resolvePromise!({
        totalRevenue: 100,
        totalOrders: 5,
        averageOrderValue: 20,
        topItems: [],
        categoryPerformance: [],
        salesTrend: []
      });
      
      await loadPromise;

      expect(store.widgets.analytics.isLoading).toBe(false);
      expect(store.isAnyWidgetLoading).toBe(false);
    });

    it('should track initialization state', async () => {
      mockApi.getPaginated.mockResolvedValue(createMockPaginatedResult([]));
      mockApi.get.mockResolvedValue({});

      expect(store.isInitializing).toBe(false);

      const initPromise = store.initializeDashboard();
      expect(store.isInitializing).toBe(true);

      await initPromise;
      expect(store.isInitializing).toBe(false);
    });
  });

  describe('Getters', () => {
    it('should detect errors across widgets', () => {
      expect(store.hasAnyErrors).toBe(false);

      store.widgets.overview.error = { code: 'ERROR', message: 'Test' };
      expect(store.hasAnyErrors).toBe(true);
    });

    it('should provide widget error summary', () => {
      store.widgets.overview.error = { code: 'OVERVIEW_ERROR', message: 'Overview failed' };
      store.widgets.analytics.error = { code: 'ANALYTICS_ERROR', message: 'Analytics failed' };

      const errors = store.widgetErrors;
      expect(errors.overview).toEqual({ code: 'OVERVIEW_ERROR', message: 'Overview failed' });
      expect(errors.analytics).toEqual({ code: 'ANALYTICS_ERROR', message: 'Analytics failed' });
      expect(errors.topItems).toBeNull();
    });

    it('should provide chart data with safe defaults', () => {
      const chartData = store.chartData;
      
      expect(chartData.salesTrend).toEqual([]);
      expect(chartData.categoryPerformance).toEqual([]);
      expect(chartData.topItems).toEqual([]);
    });
  });
});