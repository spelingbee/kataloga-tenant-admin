/**
 * Tests for Enhanced Menu Store
 * 
 * Tests for clean state management, bulk operations, and error isolation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useEnhancedMenuStore } from '~/stores/enhanced-menu';
import { 
  createMockApiResponse,
  createMockErrorResponse,
  createMockMenu,
  createMockMenuItem,
  createMockMenuItems,
  createMockPaginatedResult,
  createMockBulkOperationResult
} from '~/utils/test-factories';
import type { Menu, MenuItem } from '~/types/business';
import type { ApiError } from '~/types/enhanced-api';

// Mock the Nuxt app
const mockApi = {
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
  getPaginated: vi.fn(),
  bulkOperation: vi.fn(),
};

// Mock useNuxtApp globally
vi.mock('#app', () => ({
  useNuxtApp: vi.fn(() => ({
    $api: mockApi
  }))
}));

// Also mock the composable import
vi.mock('~/composables/useNuxtApp', () => ({
  useNuxtApp: vi.fn(() => ({
    $api: mockApi
  }))
}));

// Mock the global useNuxtApp function
global.useNuxtApp = vi.fn(() => ({
  $api: mockApi
}));

describe('Enhanced Menu Store', () => {
  let store: ReturnType<typeof useEnhancedMenuStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useEnhancedMenuStore();
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should have clean initial state', () => {
      expect(store.menus).toEqual([]);
      expect(store.currentMenu).toBeNull();
      expect(store.menuItems).toEqual([]);
      expect(store.pagination).toBeNull();
      expect(store.isFetching).toBe(false);
      expect(store.isSubmitting).toBe(false);
      expect(store.selectedItems.size).toBe(0);
      expect(store.bulkOperationResult).toBeNull();
    });

    it('should have isolated error states', () => {
      expect(store.errors.menus).toBeNull();
      expect(store.errors.items).toBeNull();
      expect(store.errors.bulk).toBeNull();
      expect(store.errors.locations).toBeNull();
    });
  });

  describe('Menu Management', () => {
    it('should fetch menus successfully', async () => {
      const mockMenus = [createMockMenu(), createMockMenu()];
      mockApi.get.mockResolvedValue(mockMenus);

      await store.fetchMenus();

      expect(mockApi.get).toHaveBeenCalledWith('/menu');
      expect(store.menus).toEqual(mockMenus);
      expect(store.currentMenu).toEqual(mockMenus[0]); // First menu set as current
      expect(store.errors.menus).toBeNull();
      expect(store.isFetching).toBe(false);
    });

    it('should handle menu fetch errors with isolation', async () => {
      const mockError: ApiError = {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch menus'
      };
      mockApi.get.mockRejectedValue(mockError);

      await store.fetchMenus();

      expect(store.menus).toEqual([]); // Safe default
      expect(store.errors.menus).toEqual(mockError);
      expect(store.errors.items).toBeNull(); // Other errors not affected
    });

    it('should fetch menu items with pagination', async () => {
      const mockItems = createMockMenuItems(3);
      const mockResult = createMockPaginatedResult(mockItems);
      mockApi.getPaginated.mockResolvedValue(mockResult);

      await store.fetchMenuItems('menu-1', { page: 1, limit: 10 });

      expect(mockApi.getPaginated).toHaveBeenCalledWith('/menu/menu-1/items', { page: 1, limit: 10 });
      expect(store.menuItems).toEqual(mockItems);
      expect(store.pagination).toEqual(mockResult.pagination);
    });

    it('should fallback to menu items on fetch error', async () => {
      const mockMenu = createMockMenu({ items: createMockMenuItems(2) });
      store.currentMenu = mockMenu;
      
      const mockError: ApiError = {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch items'
      };
      mockApi.getPaginated.mockRejectedValue(mockError);

      await store.fetchMenuItems('menu-1');

      expect(store.menuItems).toEqual(mockMenu.items);
      expect(store.pagination).toEqual({
        page: 1,
        limit: 2,
        totalItems: 2,
        totalPages: 1
      });
    });
  });

  describe('CRUD Operations', () => {
    it('should create menu item with optimistic update', async () => {
      const newItem = createMockMenuItem();
      mockApi.post.mockResolvedValue(newItem);
      
      // Set up initial state
      store.pagination = { page: 1, limit: 10, totalItems: 5, totalPages: 1 };

      const result = await store.createMenuItem('menu-1', { name: 'New Item' });

      expect(mockApi.post).toHaveBeenCalledWith(
        '/menu/menu-1/items',
        { name: 'New Item' },
        { successMessage: 'Элемент меню создан успешно' }
      );
      expect(result).toEqual(newItem);
      expect(store.menuItems[0]).toEqual(newItem); // Added to beginning
      expect(store.pagination!.totalItems).toBe(6); // Incremented
    });

    it('should update menu item in local state', async () => {
      const existingItem = createMockMenuItem({ id: 'item-1', name: 'Old Name' });
      const updatedItem = { ...existingItem, name: 'New Name' };
      
      store.menuItems = [existingItem];
      mockApi.patch.mockResolvedValue(updatedItem);

      await store.updateMenuItem('menu-1', 'item-1', { name: 'New Name' });

      expect(store.menuItems[0]).toEqual(updatedItem);
    });

    it('should delete menu item and update state', async () => {
      const item1 = createMockMenuItem({ id: 'item-1' });
      const item2 = createMockMenuItem({ id: 'item-2' });
      
      store.menuItems = [item1, item2];
      store.pagination = { page: 1, limit: 10, totalItems: 2, totalPages: 1 };
      store.selectedItems.add('item-1');
      
      mockApi.delete.mockResolvedValue(undefined);

      await store.deleteMenuItem('menu-1', 'item-1');

      expect(store.menuItems).toEqual([item2]);
      expect(store.pagination!.totalItems).toBe(1);
      expect(store.selectedItems.has('item-1')).toBe(false); // Removed from selection
    });
  });

  describe('Bulk Operations', () => {
    beforeEach(() => {
      const items = createMockMenuItems(3);
      store.menuItems = items;
      store.selectedItems.add(items[0].id);
      store.selectedItems.add(items[1].id);
    });

    it('should perform bulk update successfully', async () => {
      const mockResult = createMockBulkOperationResult(
        store.menuItems.slice(0, 2), // successful items
        [] // no failures
      );
      mockApi.bulkOperation.mockResolvedValue(mockResult);

      await store.bulkUpdateItems('menu-1', { isActive: false });

      expect(mockApi.bulkOperation).toHaveBeenCalledWith(
        '/menu/menu-1/items/bulk-update',
        expect.arrayContaining([
          expect.objectContaining({ isActive: false })
        ]),
        { successMessage: expect.stringContaining('2 элементов') }
      );
      
      expect(store.bulkOperationResult).toEqual(mockResult);
      expect(store.selectedItems.size).toBe(0); // Selection cleared
    });

    it('should handle partial bulk operation failures', async () => {
      const successfulItems = [store.menuItems[0]];
      const failedItems = [{
        item: store.menuItems[1],
        error: { code: 'UPDATE_ERROR', message: 'Failed to update' },
        index: 1
      }];
      
      const mockResult = createMockBulkOperationResult(successfulItems, failedItems);
      mockApi.bulkOperation.mockResolvedValue(mockResult);

      await store.bulkUpdateItems('menu-1', { isActive: false });

      expect(store.errors.bulk).toEqual({
        code: 'BULK_PARTIAL_FAILURE',
        message: expect.stringContaining('Не удалось обновить 1 из 2'),
        details: failedItems
      });
    });

    it('should perform bulk price update', async () => {
      const mockResult = createMockBulkOperationResult(store.menuItems.slice(0, 2), []);
      mockApi.bulkOperation.mockResolvedValue(mockResult);

      await store.bulkUpdatePrice('menu-1', 'increase', 5);

      expect(mockApi.bulkOperation).toHaveBeenCalledWith(
        '/menu/menu-1/items/bulk-price-update',
        {
          itemIds: expect.arrayContaining([store.menuItems[0].id, store.menuItems[1].id]),
          method: 'increase',
          value: 5
        },
        { successMessage: expect.stringContaining('Цены обновлены') }
      );
    });

    it('should not perform bulk operations with empty selection', async () => {
      store.selectedItems.clear();

      await store.bulkUpdateItems('menu-1', { isActive: false });

      expect(mockApi.bulkOperation).not.toHaveBeenCalled();
    });
  });

  describe('Selection Management', () => {
    beforeEach(() => {
      store.menuItems = createMockMenuItems(3);
    });

    it('should toggle item selection', () => {
      const itemId = store.menuItems[0].id;

      store.toggleItemSelection(itemId);
      expect(store.isItemSelected(itemId)).toBe(true);

      store.toggleItemSelection(itemId);
      expect(store.isItemSelected(itemId)).toBe(false);
    });

    it('should select all items', () => {
      store.selectAllItems();
      
      expect(store.selectedItems.size).toBe(3);
      store.menuItems.forEach(item => {
        expect(store.isItemSelected(item.id)).toBe(true);
      });
    });

    it('should clear selection', () => {
      store.selectAllItems();
      store.clearSelection();
      
      expect(store.selectedItems.size).toBe(0);
    });

    it('should provide selection getters', () => {
      store.toggleItemSelection(store.menuItems[0].id);
      store.toggleItemSelection(store.menuItems[1].id);

      expect(store.hasSelectedItems).toBe(true);
      expect(store.selectedItemsCount).toBe(2);
      expect(store.selectedItemsList).toHaveLength(2);
    });
  });

  describe('Location Availability', () => {
    it('should fetch and cache location availability', async () => {
      const mockLocations = [
        { locationId: 'loc-1', locationName: 'Location 1', isAvailable: true },
        { locationId: 'loc-2', locationName: 'Location 2', isAvailable: false }
      ];
      mockApi.get.mockResolvedValue(mockLocations);
      
      const item = createMockMenuItem({ id: 'item-1' });
      store.menuItems = [item];

      const result = await store.getLocationAvailability('item-1');

      expect(result).toEqual(mockLocations);
      expect(store.locationAvailabilityCache.get('item-1')).toEqual(mockLocations);
      expect(store.menuItems[0].locations).toEqual(mockLocations);
    });

    it('should return cached location availability', async () => {
      const mockLocations = [
        { locationId: 'loc-1', locationName: 'Location 1', isAvailable: true }
      ];
      store.locationAvailabilityCache.set('item-1', mockLocations);

      const result = await store.getLocationAvailability('item-1');

      expect(result).toEqual(mockLocations);
      expect(mockApi.get).not.toHaveBeenCalled(); // Should use cache
    });

    it('should update location availability', async () => {
      const updatedLocation = { locationId: 'loc-1', locationName: 'Location 1', isAvailable: false };
      mockApi.patch.mockResolvedValue(updatedLocation);
      
      const item = createMockMenuItem({ 
        id: 'item-1',
        locations: [{ locationId: 'loc-1', locationName: 'Location 1', isAvailable: true }]
      });
      store.menuItems = [item];
      store.locationAvailabilityCache.set('item-1', item.locations!);

      await store.updateLocationAvailability('item-1', 'loc-1', false);

      expect(mockApi.patch).toHaveBeenCalledWith(
        '/menu-items/item-1/locations/loc-1',
        { isAvailable: false },
        { successMessage: 'Доступность по локации обновлена' }
      );
      
      expect(store.menuItems[0].locations![0]).toEqual(updatedLocation);
      expect(store.locationAvailabilityCache.get('item-1')![0]).toEqual(updatedLocation);
    });
  });

  describe('Error Management', () => {
    it('should clear specific errors', () => {
      store.errors.menus = { code: 'ERROR', message: 'Test error' };
      store.errors.items = { code: 'ERROR', message: 'Test error' };

      store.clearError('menus');

      expect(store.errors.menus).toBeNull();
      expect(store.errors.items).not.toBeNull(); // Other errors preserved
    });

    it('should clear all errors', () => {
      store.errors.menus = { code: 'ERROR', message: 'Test error' };
      store.errors.items = { code: 'ERROR', message: 'Test error' };
      store.errors.bulk = { code: 'ERROR', message: 'Test error' };

      store.clearAllErrors();

      expect(store.errors.menus).toBeNull();
      expect(store.errors.items).toBeNull();
      expect(store.errors.bulk).toBeNull();
      expect(store.errors.locations).toBeNull();
    });

    it('should detect if store has any errors', () => {
      expect(store.hasErrors).toBe(false);

      store.errors.menus = { code: 'ERROR', message: 'Test error' };
      expect(store.hasErrors).toBe(true);
    });
  });

  describe('State Management', () => {
    it('should set current menu and clear related state', () => {
      const menu = createMockMenu();
      store.menuItems = createMockMenuItems(2);
      store.pagination = { page: 1, limit: 10, totalItems: 2, totalPages: 1 };
      store.selectedItems.add('item-1');

      store.setCurrentMenu(menu);

      expect(store.currentMenu).toEqual(menu);
      expect(store.menuItems).toEqual([]);
      expect(store.pagination).toBeNull();
      expect(store.selectedItems.size).toBe(0);
    });

    it('should provide safe pagination info', () => {
      expect(store.paginationInfo).toEqual({
        page: 1,
        limit: 20,
        totalItems: 0,
        totalPages: 1
      });

      const pagination = { page: 2, limit: 10, totalItems: 25, totalPages: 3 };
      store.pagination = pagination;
      
      expect(store.paginationInfo).toEqual(pagination);
    });

    it('should reset store to initial state', () => {
      // Set up some state
      store.menus = createMockMenuItems(2) as any;
      store.currentMenu = createMockMenu();
      store.menuItems = createMockMenuItems(3);
      store.selectedItems.add('item-1');
      store.errors.menus = { code: 'ERROR', message: 'Test' };

      store.$reset();

      expect(store.menus).toEqual([]);
      expect(store.currentMenu).toBeNull();
      expect(store.menuItems).toEqual([]);
      expect(store.selectedItems.size).toBe(0);
      expect(store.errors.menus).toBeNull();
    });
  });

  describe('Getters', () => {
    beforeEach(() => {
      store.menuItems = [
        createMockMenuItem({ id: 'item-1', isActive: true, categoryId: 'cat-1' }),
        createMockMenuItem({ id: 'item-2', isActive: false, categoryId: 'cat-1' }),
        createMockMenuItem({ id: 'item-3', isActive: true, categoryId: 'cat-2' }),
        createMockMenuItem({ id: 'item-4', isActive: true, categoryId: undefined })
      ];
    });

    it('should filter active menu items', () => {
      expect(store.activeMenuItems).toHaveLength(3);
      expect(store.activeMenuItems.every(item => item.isActive)).toBe(true);
    });

    it('should group menu items by category', () => {
      const grouped = store.menuItemsByCategory;
      
      expect(grouped['cat-1']).toHaveLength(2);
      expect(grouped['cat-2']).toHaveLength(1);
      expect(grouped['uncategorized']).toHaveLength(1);
    });
  });
});