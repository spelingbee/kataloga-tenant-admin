import { defineStore } from 'pinia'
import type { Menu, MenuItem, PaginatedResponse, PaginationParams } from '~/types'

interface MenuState {
  menus: Menu[]
  currentMenu: Menu | null
  menuItems: MenuItem[]
  totalItems: number
  currentPage: number
  totalPages: number
  loading: boolean
  error: string | null
  selectedItems: Set<string>
}

interface MenuItemFilters {
  search?: string
  categoryId?: string
  minPrice?: number
  maxPrice?: number
  isActive?: boolean
  locationId?: string
}

/**
 * Menu Store - Manages menu and menu items state
 */
export const useMenuStore = defineStore('menu', {
  state: (): MenuState => ({
    menus: [],
    currentMenu: null,
    menuItems: [],
    totalItems: 0,
    currentPage: 1,
    totalPages: 1,
    loading: false,
    error: null,
    selectedItems: new Set<string>(),
  }),

  getters: {
    activeMenuItems: (state) => state.menuItems.filter(item => item.isActive),
    
    menuItemsByCategory: (state) => {
      const grouped: Record<string, MenuItem[]> = {}
      state.menuItems.forEach(item => {
        const categoryId = item.categoryId || 'uncategorized'
        if (!grouped[categoryId]) {
          grouped[categoryId] = []
        }
        grouped[categoryId].push(item)
      })
      return grouped
    },

    hasSelectedItems: (state) => state.selectedItems.size > 0,
    
    selectedItemsCount: (state) => state.selectedItems.size,
    
    selectedItemsList: (state) => {
      return state.menuItems.filter(item => state.selectedItems.has(item.id))
    },
  },

  actions: {
    /**
     * Fetch all menus for the tenant
     */
    async fetchMenus() {
      this.loading = true
      this.error = null
      const api = useApi()

      try {
        const response = await api.get<Menu[]>('/menu')
        this.menus = response
        
        // Set first menu as current if none selected
        if (!this.currentMenu && response.length > 0) {
          this.currentMenu = response[0]
        }
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to fetch menus'
        console.error('Error fetching menus:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Fetch menu items with pagination and filters
     */
    async fetchMenuItems(
      menuId: string,
      params?: PaginationParams & MenuItemFilters
    ) {
      this.loading = true
      this.error = null
      const api = useApi()

      try {
        const queryParams = new URLSearchParams()
        
        // Pagination
        if (params?.page) queryParams.append('page', params.page.toString())
        if (params?.limit) queryParams.append('limit', params.limit.toString())
        if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
        if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder)
        
        // Filters
        if (params?.search) queryParams.append('search', params.search)
        if (params?.categoryId) queryParams.append('categoryId', params.categoryId)
        if (params?.minPrice !== undefined) queryParams.append('minPrice', params.minPrice.toString())
        if (params?.maxPrice !== undefined) queryParams.append('maxPrice', params.maxPrice.toString())
        if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString())
        if (params?.locationId) queryParams.append('locationId', params.locationId)

        const response = await api.get<PaginatedResponse<MenuItem>>(
          `/menu/${menuId}/items?${queryParams.toString()}`
        )

        this.menuItems = response.data
        this.totalItems = response.total
        this.currentPage = response.page
        this.totalPages = response.totalPages
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to fetch menu items'
        console.error('Error fetching menu items:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Create a new menu item
     */
    async createMenuItem(menuId: string, data: Partial<MenuItem>) {
      this.loading = true
      this.error = null
      const api = useApi()

      try {
        const response = await api.post<MenuItem>(`/menu/${menuId}/items`, data)
        
        // Add to local state if on first page
        if (this.currentPage === 1) {
          this.menuItems.unshift(response)
          this.totalItems++
        }
        
        return response
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to create menu item'
        console.error('Error creating menu item:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Update an existing menu item
     */
    async updateMenuItem(menuId: string, itemId: string, data: Partial<MenuItem>) {
      this.loading = true
      this.error = null
      const api = useApi()

      try {
        const response = await api.patch<MenuItem>(
          `/menu/${menuId}/items/${itemId}`,
          data
        )
        
        // Update in local state
        const index = this.menuItems.findIndex(item => item.id === itemId)
        if (index !== -1) {
          this.menuItems[index] = response
        }
        
        return response
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to update menu item'
        console.error('Error updating menu item:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Delete a menu item
     */
    async deleteMenuItem(menuId: string, itemId: string) {
      this.loading = true
      this.error = null
      const api = useApi()

      try {
        await api.delete(`/menu/${menuId}/items/${itemId}`)
        
        // Remove from local state
        this.menuItems = this.menuItems.filter(item => item.id !== itemId)
        this.totalItems--
        
        // Remove from selection if selected
        this.selectedItems.delete(itemId)
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to delete menu item'
        console.error('Error deleting menu item:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Toggle menu item availability
     */
    async toggleAvailability(menuId: string, itemId: string) {
      const item = this.menuItems.find(i => i.id === itemId)
      if (!item) return

      try {
        await this.updateMenuItem(menuId, itemId, {
          isActive: !item.isActive,
        })
      } catch (error) {
        console.error('Error toggling availability:', error)
        throw error
      }
    },

    /**
     * Get location availability for a menu item
     */
    async getLocationAvailability(itemId: string) {
      const api = useApi()
      
      try {
        const response = await api.get<any[]>(`/menu-items/${itemId}/locations`)
        
        // Update the menu item in local state with location data
        const itemIndex = this.menuItems.findIndex(item => item.id === itemId)
        if (itemIndex !== -1) {
          this.menuItems[itemIndex].locations = response
        }
        
        return response
      } catch (error: any) {
        console.error('Error fetching location availability:', error)
        throw error
      }
    },

    /**
     * Toggle location-specific availability for a menu item
     */
    async toggleLocationAvailability(itemId: string, locationId: string) {
      const api = useApi()
      const item = this.menuItems.find(i => i.id === itemId)
      if (!item || !item.locations) return

      const location = item.locations.find(l => l.locationId === locationId)
      if (!location) return

      try {
        const response = await api.patch(
          `/menu-items/${itemId}/locations/${locationId}`,
          { isAvailable: !location.isAvailable }
        )
        
        // Update local state
        const itemIndex = this.menuItems.findIndex(i => i.id === itemId)
        if (itemIndex !== -1 && this.menuItems[itemIndex].locations) {
          const locIndex = this.menuItems[itemIndex].locations!.findIndex(
            l => l.locationId === locationId
          )
          if (locIndex !== -1) {
            this.menuItems[itemIndex].locations![locIndex] = response
          }
        }
        
        return response
      } catch (error: any) {
        console.error('Error toggling location availability:', error)
        throw error
      }
    },

    /**
     * Bulk update location availability for multiple items
     */
    async bulkUpdateLocationAvailability(
      itemIds: string[],
      locationIds: string[],
      isAvailable: boolean
    ) {
      const api = useApi()
      
      try {
        const response = await api.post('/menu-items/bulk-location-update', {
          menuItemIds: itemIds,
          locationIds,
          isAvailable,
        })
        
        // Refresh location data for affected items
        for (const itemId of itemIds) {
          await this.getLocationAvailability(itemId)
        }
        
        return response
      } catch (error: any) {
        console.error('Error bulk updating location availability:', error)
        throw error
      }
    },

    /**
     * Bulk update menu items
     */
    async bulkUpdateItems(menuId: string, itemIds: string[], data: Partial<MenuItem>) {
      this.loading = true
      this.error = null
      const api = useApi()

      try {
        await api.post(`/menu/${menuId}/items/bulk-update`, {
          itemIds,
          data,
        })
        
        // Update local state
        this.menuItems = this.menuItems.map(item => {
          if (itemIds.includes(item.id)) {
            return { ...item, ...data }
          }
          return item
        })
        
        // Clear selection after bulk update
        this.clearSelection()
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to bulk update items'
        console.error('Error bulk updating items:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Bulk update prices
     */
    async bulkUpdatePrice(
      menuId: string,
      itemIds: string[],
      method: 'set' | 'increase' | 'decrease' | 'percentage',
      value: number
    ) {
      this.loading = true
      this.error = null
      const api = useApi()

      try {
        await api.post(`/menu/${menuId}/items/bulk-price-update`, {
          itemIds,
          method,
          value,
        })
        
        // Refresh menu items to get updated prices
        await this.fetchMenuItems(menuId, {
          page: this.currentPage,
          limit: 20,
        })
        
        // Clear selection after bulk update
        this.clearSelection()
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to bulk update prices'
        console.error('Error bulk updating prices:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Selection management
     */
    toggleItemSelection(itemId: string) {
      if (this.selectedItems.has(itemId)) {
        this.selectedItems.delete(itemId)
      } else {
        this.selectedItems.add(itemId)
      }
    },

    selectAllItems() {
      this.menuItems.forEach(item => {
        this.selectedItems.add(item.id)
      })
    },

    clearSelection() {
      this.selectedItems.clear()
    },

    isItemSelected(itemId: string): boolean {
      return this.selectedItems.has(itemId)
    },

    /**
     * Set current menu
     */
    setCurrentMenu(menu: Menu) {
      this.currentMenu = menu
    },

    /**
     * Clear error
     */
    clearError() {
      this.error = null
    },
  },
})
