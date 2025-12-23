/**
 * Integration Tests for Stores - Clean Data Storage
 * 
 * Requirement 8.4: Verify stores save only clean data without API wrappers
 * 
 * These tests ensure that Pinia stores maintain clean business data
 * and don't leak ApiResponse wrappers into the state.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useEnhancedMenuStore } from '~/stores/enhanced-menu';
import { useEnhancedDashboardStore } from '~/stores/enhanced-dashboard';
import type { ApiResponse, ApiMeta } from '~/types/enhanced-api';
import type { Menu, MenuItem, DashboardMetrics } from '~/types/business';
import { createMockApiResponse } from '~/utils/test-factories';

// Mock Nuxt app
const mockNuxtApp = {
  $api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    getPaginated: vi.fn(),
    bulkOperation: vi.fn()
  }
};

// Mock useNuxtApp globally
vi.mock('#app', () => ({
  useNuxtApp: () => mockNuxtApp
}));

// Also mock the direct import
vi.mock('nuxt/app', () => ({
  useNuxtApp: () => mockNuxtApp
}));

// Mock global useNuxtApp
global.useNuxtApp = vi.fn(() => mockNuxtApp);

vi.mock('~/composables/useTenant', () => ({
  useTenant: () => ({
    getTenantSlug: () => 'test-tenant'
  })
}));

describe('Stores Integration - Clean Data Storage (Requirement 8.4)', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe('Enhanced Menu Store', () => {
    it('should store only clean Menu data without ApiResponse wrappers', async () => {
      const menuStore = useEnhancedMenuStore();
      
      // Mock API response with wrapper
      const mockMenus: Menu[] = [
        {
          id: '1',
          name: 'Main Menu',
          description: 'Primary menu',
          isActive: true,
          items: []
        },
        {
          id: '2', 
          name: 'Drinks Menu',
          description: 'Beverages',
          isActive: true,
          items: []
        }
      ];

      const apiResponse = createMockApiResponse(mockMenus);
      mockNuxtApp.$api.get.mockResolvedValue(mockMenus); // API service unwraps automatically

      // Fetch menus
      await menuStore.fetchMenus();

      // Verify store contains only clean business data
      expect(menuStore.menus).toEqual(mockMenus);
      expect(menuStore.menus).not.toHaveProperty('success');
      expect(menuStore.menus).not.toHaveProperty('statusCode');
      expect(menuStore.menus).not.toHaveProperty('meta');
      expect(menuStore.menus).not.toHaveProperty('error');

      // Verify each menu item is clean
      menuStore.menus.forEach(menu => {
        expect(menu).not.toHaveProperty('success');
        expect(menu).not.toHaveProperty('statusCode');
        expect(menu).not.toHaveProperty('meta');
        expect(menu).not.toHaveProperty('error');
        expect(typeof menu.id).toBe('string');
        expect(typeof menu.name).toBe('string');
        expect(typeof menu.isActive).toBe('boolean');
      });
    });

    it('should store paginated menu items without pagination wrappers', async () => {
      const menuStore = useEnhancedMenuStore();
      
      const mockMenuItems: MenuItem[] = [
        {
          id: '1',
          name: 'Pizza Margherita',
          description: 'Classic pizza',
          price: 12.99,
          isActive: true,
          categoryId: 'cat1',
          menuId: 'menu1'
        }
      ];

      const mockPaginatedResult = {
        items: mockMenuItems,
        pagination: {
          page: 1,
          limit: 20,
          totalItems: 1,
          totalPages: 1
        }
      };

      mockNuxtApp.$api.getPaginated.mockResolvedValue(mockPaginatedResult);

      // Fetch menu items
      await menuStore.fetchMenuItems('menu1');

      // Verify clean separation of data and pagination
      expect(menuStore.menuItems).toEqual(mockMenuItems);
      expect(menuStore.pagination).toEqual(mockPaginatedResult.pagination);

      // Verify menu items are clean business objects
      menuStore.menuItems.forEach(item => {
        expect(item).not.toHaveProperty('success');
        expect(item).not.toHaveProperty('statusCode');
        expect(item).not.toHaveProperty('meta');
        expect(item).not.toHaveProperty('error');
        expect(typeof item.id).toBe('string');
        expect(typeof item.name).toBe('string');
        expect(typeof item.price).toBe('number');
      });

      // Verify pagination is separate and clean
      expect(menuStore.pagination).toHaveProperty('page');
      expect(menuStore.pagination).toHaveProperty('limit');
      expect(menuStore.pagination).toHaveProperty('totalItems');
      expect(menuStore.pagination).toHaveProperty('totalPages');
      expect(menuStore.pagination).not.toHaveProperty('success');
    });

    it('should handle CRUD operations with clean state updates', async () => {
      const menuStore = useEnhancedMenuStore();
      
      // Setup initial state
      const initialItem: MenuItem = {
        id: '1',
        name: 'Original Item',
        description: 'Original description',
        price: 10.00,
        isActive: true,
        categoryId: 'cat1',
        menuId: 'menu1'
      };

      menuStore.menuItems = [initialItem];

      // Mock update response
      const updatedItem: MenuItem = {
        ...initialItem,
        name: 'Updated Item',
        price: 15.00
      };

      mockNuxtApp.$api.patch.mockResolvedValue(updatedItem);

      // Perform update
      await menuStore.updateMenuItem('menu1', '1', { 
        name: 'Updated Item', 
        price: 15.00 
      });

      // Verify state contains clean updated data
      expect(menuStore.menuItems[0]).toEqual(updatedItem);
      expect(menuStore.menuItems[0]).not.toHaveProperty('success');
      expect(menuStore.menuItems[0]).not.toHaveProperty('meta');
      
      // Verify the update preserved all business properties
      expect(menuStore.menuItems[0].id).toBe('1');
      expect(menuStore.menuItems[0].name).toBe('Updated Item');
      expect(menuStore.menuItems[0].price).toBe(15.00);
      expect(menuStore.menuItems[0].isActive).toBe(true);
    });

    it('should handle bulk operations with clean result storage', async () => {
      const menuStore = useEnhancedMenuStore();
      
      // Setup selection
      menuStore.selectedItems.add('1');
      menuStore.selectedItems.add('2');

      const mockBulkResult = {
        successful: [
          { id: '1', name: 'Item 1', price: 20.00, isActive: false, categoryId: 'cat1', menuId: 'menu1' },
          { id: '2', name: 'Item 2', price: 25.00, isActive: false, categoryId: 'cat1', menuId: 'menu1' }
        ],
        failed: [],
        totalProcessed: 2,
        successCount: 2,
        errorCount: 0
      };

      mockNuxtApp.$api.bulkOperation.mockResolvedValue(mockBulkResult);

      // Perform bulk update
      await menuStore.bulkUpdateItems('menu1', { isActive: false });

      // Verify bulk result is stored cleanly
      expect(menuStore.bulkOperationResult).toEqual(mockBulkResult);
      expect(menuStore.bulkOperationResult?.successful).toBeInstanceOf(Array);
      
      // Verify successful items are clean business objects
      menuStore.bulkOperationResult?.successful.forEach(item => {
        expect(item).not.toHaveProperty('success');
        expect(item).not.toHaveProperty('statusCode');
        expect(item).not.toHaveProperty('meta');
        expect(typeof item.id).toBe('string');
        expect(typeof item.isActive).toBe('boolean');
      });
    });
  });

  describe('Enhanced Dashboard Store', () => {
    it('should store widget data without ApiResponse wrappers', async () => {
      const dashboardStore = useEnhancedDashboardStore();
      
      const mockMetrics: DashboardMetrics = {
        totalRevenue: 1500.00,
        totalOrders: 45,
        averageOrderValue: 33.33,
        activeMenuItems: 25,
        topSellingItems: [],
        recentOrders: []
      };

      // Mock paginated menus response
      const mockMenusResult = {
        items: [
          {
            id: '1',
            name: 'Menu 1',
            isActive: true,
            items: [
              { id: '1', name: 'Item 1', isActive: true },
              { id: '2', name: 'Item 2', isActive: false }
            ]
          }
        ],
        pagination: { page: 1, limit: 100, totalItems: 1, totalPages: 1 }
      };

      mockNuxtApp.$api.getPaginated.mockResolvedValue(mockMenusResult);
      mockNuxtApp.$api.get.mockResolvedValue({ totalRevenue: 0, totalOrders: 0 });

      // Load overview widget
      await dashboardStore.loadOverviewWidget();

      // Verify widget data is clean
      const overviewData = dashboardStore.widgets.overview.data;
      expect(overviewData).not.toHaveProperty('success');
      expect(overviewData).not.toHaveProperty('statusCode');
      expect(overviewData).not.toHaveProperty('meta');
      expect(overviewData).not.toHaveProperty('error');

      // Verify business data structure
      expect(typeof overviewData.totalRevenue).toBe('number');
      expect(typeof overviewData.totalOrders).toBe('number');
      expect(typeof overviewData.averageOrderValue).toBe('number');
      expect(typeof overviewData.activeMenuItems).toBe('number');
      expect(Array.isArray(overviewData.topSellingItems)).toBe(true);
      expect(Array.isArray(overviewData.recentOrders)).toBe(true);
    });

    it('should maintain clean state during widget error isolation', async () => {
      const dashboardStore = useEnhancedDashboardStore();
      
      // Mock one widget to fail, others to succeed
      mockNuxtApp.$api.getPaginated.mockRejectedValueOnce(new Error('Network error'));
      mockNuxtApp.$api.get
        .mockResolvedValueOnce([]) // analytics success
        .mockResolvedValueOnce([]) // top items success
        .mockResolvedValueOnce({ items: [], pagination: {} }); // recent orders success

      // Initialize dashboard (some widgets will fail)
      await dashboardStore.initializeDashboard();

      // Verify failed widget has clean error state
      expect(dashboardStore.widgets.overview.error).toBeTruthy();
      expect(dashboardStore.widgets.overview.data).not.toHaveProperty('success');
      expect(dashboardStore.widgets.overview.data).not.toHaveProperty('meta');

      // Verify successful widgets have clean data
      Object.entries(dashboardStore.widgets).forEach(([key, widget]) => {
        if (key !== 'overview') {
          expect(widget.data).not.toHaveProperty('success');
          expect(widget.data).not.toHaveProperty('statusCode');
          expect(widget.data).not.toHaveProperty('meta');
        }
      });
    });
  });

  describe('State Serialization Safety', () => {
    it('should serialize store state without circular references or API wrappers', async () => {
      const menuStore = useEnhancedMenuStore();
      
      // Setup store with data
      const mockMenus: Menu[] = [
        {
          id: '1',
          name: 'Test Menu',
          description: 'Test',
          isActive: true,
          items: [
            {
              id: '1',
              name: 'Test Item',
              description: 'Test item',
              price: 10.00,
              isActive: true,
              categoryId: 'cat1',
              menuId: '1'
            }
          ]
        }
      ];

      mockNuxtApp.$api.get.mockResolvedValue(mockMenus);
      await menuStore.fetchMenus();

      // Test serialization
      let serializedState: string;
      expect(() => {
        serializedState = JSON.stringify(menuStore.$state);
      }).not.toThrow();

      // Test deserialization
      let deserializedState: any;
      expect(() => {
        deserializedState = JSON.parse(serializedState!);
      }).not.toThrow();

      // Verify deserialized state structure
      expect(deserializedState).toHaveProperty('menus');
      expect(deserializedState).toHaveProperty('menuItems');
      expect(deserializedState).toHaveProperty('pagination');
      expect(deserializedState).toHaveProperty('errors');

      // Verify no API wrapper properties in serialized data
      const serializedString = serializedState!;
      expect(serializedString).not.toContain('"success"');
      expect(serializedString).not.toContain('"statusCode"');
      expect(serializedString).not.toContain('"meta"');
      expect(serializedString).not.toContain('"requestId"');
    });

    it('should handle deep nested objects without API wrapper contamination', async () => {
      const menuStore = useEnhancedMenuStore();
      
      // Mock complex nested data
      const complexMenu: Menu = {
        id: '1',
        name: 'Complex Menu',
        description: 'Menu with nested data',
        isActive: true,
        items: [
          {
            id: '1',
            name: 'Complex Item',
            description: 'Item with locations',
            price: 15.00,
            isActive: true,
            categoryId: 'cat1',
            menuId: '1',
            locations: [
              {
                locationId: 'loc1',
                locationName: 'Main Store',
                isAvailable: true,
                stock: 10
              }
            ]
          }
        ]
      };

      mockNuxtApp.$api.get.mockResolvedValue([complexMenu]);
      await menuStore.fetchMenus();

      // Verify deep nested objects are clean
      const menu = menuStore.menus[0];
      expect(menu.items![0].locations![0]).not.toHaveProperty('success');
      expect(menu.items![0].locations![0]).not.toHaveProperty('meta');
      
      // Verify business properties are preserved
      expect(menu.items![0].locations![0].locationId).toBe('loc1');
      expect(menu.items![0].locations![0].isAvailable).toBe(true);
      expect(menu.items![0].locations![0].stock).toBe(10);
    });
  });
});