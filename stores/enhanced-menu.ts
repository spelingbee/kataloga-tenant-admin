/**
 * Enhanced Menu Store with Mass Operations
 * 
 * Implements standardized API response handling with:
 * - Clean state management (no API wrappers in store)
 * - Paginated data handling
 * - Bulk operations support
 * - Widget-level error isolation
 * - Safe default values
 * - Optimistic updates
 */

import { defineStore } from 'pinia';
import type { 
  Menu, 
  MenuItem, 
  MenuItemParams,
  LocationAvailability,
  WidgetError 
} from '~/types/business';
import type { 
  ApiError, 
  PaginationMeta, 
  PaginatedResult,
  BulkOperationResult 
} from '~/types/enhanced-api';

// ============================================================================
// State Interface
// ============================================================================

interface EnhancedMenuState {
  // Clean business data (no API wrappers)
  menus: Menu[];
  currentMenu: Menu | null;
  menuItems: MenuItem[];
  pagination: PaginationMeta | null;
  
  // Operation states
  isFetching: boolean;
  isSubmitting: boolean;
  
  // Widget-level error isolation
  errors: {
    menus: ApiError | null;
    items: ApiError | null;
    bulk: ApiError | null;
    locations: ApiError | null;
  };
  
  // Bulk operations
  selectedItems: Set<string>;
  bulkOperationResult: BulkOperationResult<MenuItem> | null;
  
  // Location availability cache
  locationAvailabilityCache: Map<string, LocationAvailability[]>;
}

// ============================================================================
// Store Definition
// ============================================================================

export const useEnhancedMenuStore = defineStore('enhanced-menu', {
  state: (): EnhancedMenuState => ({
    // Clean business data
    menus: [],
    currentMenu: null,
    menuItems: [],
    pagination: null,
    
    // Operation states
    isFetching: false,
    isSubmitting: false,
    
    // Widget-level error isolation (Requirement 3.4)
    errors: {
      menus: null,
      items: null,
      bulk: null,
      locations: null,
    },
    
    // Bulk operations
    selectedItems: new Set<string>(),
    bulkOperationResult: null,
    
    // Location availability cache
    locationAvailabilityCache: new Map<string, LocationAvailability[]>(),
  }),

  getters: {
    // Menu getters
    activeMenus: (state) => state.menus.filter(menu => menu.isActive),
    
    // Menu item getters
    activeMenuItems: (state) => state.menuItems.filter(item => item.isActive),
    
    menuItemsByCategory: (state) => {
      const grouped: Record<string, MenuItem[]> = {};
      state.menuItems.forEach(item => {
        const categoryId = item.categoryId || 'uncategorized';
        if (!grouped[categoryId]) {
          grouped[categoryId] = [];
        }
        grouped[categoryId].push(item);
      });
      return grouped;
    },

    // Selection getters
    hasSelectedItems: (state) => state.selectedItems.size > 0,
    selectedItemsCount: (state) => state.selectedItems.size,
    selectedItemsList: (state) => {
      return state.menuItems.filter(item => state.selectedItems.has(item.id));
    },
    
    // Error state getters
    hasErrors: (state) => {
      return Object.values(state.errors).some(error => error !== null);
    },
    
    // Safe pagination info (Requirement 5.2 - Safe defaults)
    paginationInfo: (state) => {
      return state.pagination || {
        page: 1,
        limit: 20,
        totalItems: 0,
        totalPages: 1,
      };
    },
  },

  actions: {
    // ========================================================================
    // Menu Management
    // ========================================================================

    /**
     * Fetch all menus with error isolation (Requirement 6.1)
     */
    async fetchMenus(): Promise<void> {
      this.isFetching = true;
      this.errors.menus = null;
      
      try {
        const { $api } = useNuxtApp();
        
        // API service automatically unwraps ApiResponse<Menu[]>
        const menus = await $api.get<Menu[]>('/menu');
        
        // Store only clean business data (Requirement 3.1)
        this.menus = menus;
        
        // Set first menu as current if none selected
        if (!this.currentMenu && menus.length > 0) {
          this.currentMenu = menus[0];
        }
        
      } catch (error) {
        // Widget-level error isolation (Requirement 3.4)
        this.errors.menus = error as ApiError;
        
        // Safe default values (Requirement 5.2)
        this.menus = [];
        
      } finally {
        this.isFetching = false;
      }
    },

    /**
     * Fetch menu items with pagination support (Requirement 6.1)
     */
    async fetchMenuItems(menuId: string, params?: MenuItemParams): Promise<void> {
      this.isFetching = true;
      this.errors.items = null;
      
      try {
        const { $api } = useNuxtApp();
        
        // Get paginated result (Requirement 3.2)
        const result = await $api.getPaginated<MenuItem>(
          `/menu/${menuId}/items`,
          params
        );
        
        // Store clean data with separated pagination (Requirement 3.2)
        this.menuItems = result.items;
        this.pagination = result.pagination;
        
      } catch (error) {
        this.errors.items = error as ApiError;
        
        // Fallback to menu items if available (safe defaults)
        if (this.currentMenu?.items) {
          this.menuItems = this.currentMenu.items;
          this.pagination = {
            page: 1,
            limit: this.currentMenu.items.length,
            totalItems: this.currentMenu.items.length,
            totalPages: 1,
          };
        } else {
          this.menuItems = [];
          this.pagination = null;
        }
        
      } finally {
        this.isFetching = false;
      }
    },

    // ========================================================================
    // CRUD Operations (Requirement 6.2)
    // ========================================================================

    /**
     * Create menu item with optimistic update (Requirement 6.4)
     */
    async createMenuItem(menuId: string, data: Partial<MenuItem>): Promise<MenuItem> {
      this.isSubmitting = true;
      this.errors.items = null;
      
      try {
        const { $api } = useNuxtApp();
        
        const newItem = await $api.post<MenuItem>(`/menu/${menuId}/items`, data, {
          successMessage: 'Элемент меню создан успешно'
        });
        
        // Update local state (Requirement 6.2)
        if (this.pagination?.page === 1) {
          this.menuItems.unshift(newItem);
          if (this.pagination) {
            this.pagination.totalItems++;
          }
        }
        
        return newItem;
        
      } catch (error) {
        this.errors.items = error as ApiError;
        throw error;
      } finally {
        this.isSubmitting = false;
      }
    },

    /**
     * Update menu item with local state sync (Requirement 6.2)
     */
    async updateMenuItem(menuId: string, itemId: string, data: Partial<MenuItem>): Promise<MenuItem> {
      this.isSubmitting = true;
      this.errors.items = null;
      
      try {
        const { $api } = useNuxtApp();
        
        const updatedItem = await $api.patch<MenuItem>(
          `/menu/${menuId}/items/${itemId}`,
          data,
          { successMessage: 'Элемент меню обновлен' }
        );
        
        // Update local state (Requirement 6.2)
        const index = this.menuItems.findIndex(item => item.id === itemId);
        if (index !== -1) {
          this.menuItems[index] = updatedItem;
        }
        
        return updatedItem;
        
      } catch (error) {
        this.errors.items = error as ApiError;
        throw error;
      } finally {
        this.isSubmitting = false;
      }
    },

    /**
     * Delete menu item with local state cleanup (Requirement 6.2)
     */
    async deleteMenuItem(menuId: string, itemId: string): Promise<void> {
      this.isSubmitting = true;
      this.errors.items = null;
      
      try {
        const { $api } = useNuxtApp();
        
        await $api.delete(`/menu/${menuId}/items/${itemId}`, {
          successMessage: 'Элемент меню удален'
        });
        
        // Update local state (Requirement 6.2)
        this.menuItems = this.menuItems.filter(item => item.id !== itemId);
        if (this.pagination) {
          this.pagination.totalItems--;
        }
        
        // Remove from selection if selected
        this.selectedItems.delete(itemId);
        
      } catch (error) {
        this.errors.items = error as ApiError;
        throw error;
      } finally {
        this.isSubmitting = false;
      }
    },

    // ========================================================================
    // Bulk Operations (Requirement 6.3)
    // ========================================================================

    /**
     * Bulk update menu items (Requirement 6.3)
     */
    async bulkUpdateItems(menuId: string, updates: Partial<MenuItem>): Promise<void> {
      if (this.selectedItems.size === 0) return;
      
      this.isSubmitting = true;
      this.errors.bulk = null;
      
      try {
        const { $api } = useNuxtApp();
        const itemIds = Array.from(this.selectedItems);
        
        const result = await $api.bulkOperation<MenuItem>(
          `/menu/${menuId}/items/bulk-update`,
          itemIds.map(id => ({ id, ...updates })),
          { successMessage: `Обновлено ${itemIds.length} элементов` }
        );
        
        this.bulkOperationResult = result;
        
        // Update successful items in local state (Requirement 6.2)
        result.successful.forEach(updatedItem => {
          const index = this.menuItems.findIndex(item => item.id === updatedItem.id);
          if (index !== -1) {
            this.menuItems[index] = updatedItem;
          }
        });
        
        // Clear selection
        this.selectedItems.clear();
        
        // Handle partial failures
        if (result.errorCount > 0) {
          const errorMessage = `Не удалось обновить ${result.errorCount} из ${result.totalProcessed} элементов`;
          this.errors.bulk = {
            code: 'BULK_PARTIAL_FAILURE',
            message: errorMessage,
            details: result.failed
          } as ApiError;
        }
        
      } catch (error) {
        this.errors.bulk = error as ApiError;
        throw error;
      } finally {
        this.isSubmitting = false;
      }
    },

    /**
     * Bulk price update with different methods (Requirement 6.3)
     */
    async bulkUpdatePrice(
      menuId: string,
      method: 'set' | 'increase' | 'decrease' | 'percentage',
      value: number
    ): Promise<void> {
      if (this.selectedItems.size === 0) return;
      
      this.isSubmitting = true;
      this.errors.bulk = null;
      
      try {
        const { $api } = useNuxtApp();
        const itemIds = Array.from(this.selectedItems);
        
        const result = await $api.bulkOperation<MenuItem>(
          `/menu/${menuId}/items/bulk-price-update`,
          { itemIds, method, value },
          { successMessage: `Цены обновлены для ${itemIds.length} элементов` }
        );
        
        this.bulkOperationResult = result;
        
        // Update successful items in local state
        result.successful.forEach(updatedItem => {
          const index = this.menuItems.findIndex(item => item.id === updatedItem.id);
          if (index !== -1) {
            this.menuItems[index] = updatedItem;
          }
        });
        
        // Clear selection
        this.selectedItems.clear();
        
      } catch (error) {
        this.errors.bulk = error as ApiError;
        throw error;
      } finally {
        this.isSubmitting = false;
      }
    },

    /**
     * Bulk toggle availability (Requirement 6.3)
     */
    async bulkToggleAvailability(menuId: string, isActive: boolean): Promise<void> {
      if (this.selectedItems.size === 0) return;
      
      await this.bulkUpdateItems(menuId, { isActive });
    },

    // ========================================================================
    // Location Availability (Requirement 6.5)
    // ========================================================================

    /**
     * Get location availability for menu item (Requirement 6.5)
     */
    async getLocationAvailability(itemId: string): Promise<LocationAvailability[]> {
      // Check cache first
      if (this.locationAvailabilityCache.has(itemId)) {
        return this.locationAvailabilityCache.get(itemId)!;
      }
      
      this.errors.locations = null;
      
      try {
        const { $api } = useNuxtApp();
        
        const locations = await $api.get<LocationAvailability[]>(`/menu-items/${itemId}/locations`);
        
        // Cache the result
        this.locationAvailabilityCache.set(itemId, locations);
        
        // Update menu item in local state with nested data (Requirement 6.5)
        const itemIndex = this.menuItems.findIndex(item => item.id === itemId);
        if (itemIndex !== -1) {
          this.menuItems[itemIndex].locations = locations;
        }
        
        return locations;
        
      } catch (error) {
        this.errors.locations = error as ApiError;
        throw error;
      }
    },

    /**
     * Update location availability for menu item (Requirement 6.5)
     */
    async updateLocationAvailability(
      itemId: string, 
      locationId: string, 
      isAvailable: boolean
    ): Promise<void> {
      this.errors.locations = null;
      
      try {
        const { $api } = useNuxtApp();
        
        const updatedLocation = await $api.patch<LocationAvailability>(
          `/menu-items/${itemId}/locations/${locationId}`,
          { isAvailable },
          { successMessage: 'Доступность по локации обновлена' }
        );
        
        // Update cache
        const cachedLocations = this.locationAvailabilityCache.get(itemId);
        if (cachedLocations) {
          const locIndex = cachedLocations.findIndex(l => l.locationId === locationId);
          if (locIndex !== -1) {
            cachedLocations[locIndex] = updatedLocation;
          }
        }
        
        // Update local menu item state
        const itemIndex = this.menuItems.findIndex(item => item.id === itemId);
        if (itemIndex !== -1 && this.menuItems[itemIndex].locations) {
          const locIndex = this.menuItems[itemIndex].locations!.findIndex(
            l => l.locationId === locationId
          );
          if (locIndex !== -1) {
            this.menuItems[itemIndex].locations![locIndex] = updatedLocation;
          }
        }
        
      } catch (error) {
        this.errors.locations = error as ApiError;
        throw error;
      }
    },

    /**
     * Bulk update location availability (Requirement 6.5)
     */
    async bulkUpdateLocationAvailability(
      itemIds: string[],
      locationIds: string[],
      isAvailable: boolean
    ): Promise<void> {
      this.isSubmitting = true;
      this.errors.bulk = null;
      
      try {
        const { $api } = useNuxtApp();
        
        await $api.post('/menu-items/bulk-location-update', {
          menuItemIds: itemIds,
          locationIds,
          isAvailable,
        }, {
          successMessage: `Доступность обновлена для ${itemIds.length} элементов`
        });
        
        // Refresh location data for affected items
        for (const itemId of itemIds) {
          // Clear cache to force refresh
          this.locationAvailabilityCache.delete(itemId);
          await this.getLocationAvailability(itemId);
        }
        
      } catch (error) {
        this.errors.bulk = error as ApiError;
        throw error;
      } finally {
        this.isSubmitting = false;
      }
    },

    // ========================================================================
    // Selection Management
    // ========================================================================

    /**
     * Toggle item selection
     */
    toggleItemSelection(itemId: string): void {
      if (this.selectedItems.has(itemId)) {
        this.selectedItems.delete(itemId);
      } else {
        this.selectedItems.add(itemId);
      }
    },

    /**
     * Select all visible items
     */
    selectAllItems(): void {
      this.menuItems.forEach(item => {
        this.selectedItems.add(item.id);
      });
    },

    /**
     * Clear all selections
     */
    clearSelection(): void {
      this.selectedItems.clear();
    },

    /**
     * Check if item is selected
     */
    isItemSelected(itemId: string): boolean {
      return this.selectedItems.has(itemId);
    },

    // ========================================================================
    // State Management
    // ========================================================================

    /**
     * Set current menu
     */
    setCurrentMenu(menu: Menu): void {
      this.currentMenu = menu;
      // Clear items when switching menus
      this.menuItems = [];
      this.pagination = null;
      this.clearSelection();
    },

    /**
     * Clear specific error (widget-level error management)
     */
    clearError(errorType: keyof EnhancedMenuState['errors']): void {
      this.errors[errorType] = null;
    },

    /**
     * Clear all errors
     */
    clearAllErrors(): void {
      Object.keys(this.errors).forEach(key => {
        this.errors[key as keyof EnhancedMenuState['errors']] = null;
      });
    },

    /**
     * Clear bulk operation result
     */
    clearBulkResult(): void {
      this.bulkOperationResult = null;
    },

    /**
     * Reset store to initial state
     */
    $reset(): void {
      this.menus = [];
      this.currentMenu = null;
      this.menuItems = [];
      this.pagination = null;
      this.isFetching = false;
      this.isSubmitting = false;
      this.clearAllErrors();
      this.clearSelection();
      this.bulkOperationResult = null;
      this.locationAvailabilityCache.clear();
    },
  },
});

// ============================================================================
// Type Exports
// ============================================================================

export type { EnhancedMenuState };