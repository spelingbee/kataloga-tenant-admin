import { defineStore } from 'pinia'
import type { Category } from '~/types'

interface CategoryState {
  categories: Category[]
  loading: boolean
  error: string | null
}

interface CategoryWithItemCount extends Category {
  itemCount?: number
}

/**
 * Category Store - Manages categories state
 */
export const useCategoryStore = defineStore('category', {
  state: (): CategoryState => ({
    categories: [],
    loading: false,
    error: null,
  }),

  getters: {
    sortedCategories: (state) => {
      return [...state.categories].sort((a, b) => a.displayOrder - b.displayOrder)
    },
    
    getCategoryById: (state) => (id: string) => {
      return state.categories.find(cat => cat.id === id)
    },
  },

  actions: {
    async fetchCategories() {
      this.loading = true
      this.error = null
      const api = useApi()

      try {
        const response = await api.get<{ data: CategoryWithItemCount[] }>('/tenant-admin/categories')
        this.categories = response.data
      } catch (error: any) {
        this.error = error.message || 'Failed to fetch categories'
        console.error('Error fetching categories:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async createCategory(data: { name: string; description?: string }) {
      this.loading = true
      this.error = null
      const api = useApi()

      try {
        const response = await api.post<Category>('/tenant-admin/categories', data)
        this.categories.push(response)
        return response
      } catch (error: any) {
        this.error = error.message || 'Failed to create category'
        console.error('Error creating category:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateCategory(id: string, data: { name?: string; description?: string }) {
      this.loading = true
      this.error = null
      const api = useApi()

      try {
        const response = await api.patch<Category>(`/tenant-admin/categories/${id}`, data)
        const index = this.categories.findIndex(cat => cat.id === id)
        if (index !== -1) {
          this.categories[index] = response
        }
        return response
      } catch (error: any) {
        this.error = error.message || 'Failed to update category'
        console.error('Error updating category:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteCategory(id: string) {
      this.loading = true
      this.error = null
      const api = useApi()

      try {
        await api.delete(`/tenant-admin/categories/${id}`)
        this.categories = this.categories.filter(cat => cat.id !== id)
      } catch (error: any) {
        this.error = error.message || 'Failed to delete category'
        console.error('Error deleting category:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async reorderCategories(categoryOrders: { id: string; displayOrder: number }[]) {
      this.loading = true
      this.error = null
      const api = useApi()

      try {
        await api.post('/tenant-admin/categories/reorder', { categories: categoryOrders })
        
        // Update local state
        categoryOrders.forEach(({ id, displayOrder }) => {
          const category = this.categories.find(cat => cat.id === id)
          if (category) {
            category.displayOrder = displayOrder
          }
        })
      } catch (error: any) {
        this.error = error.message || 'Failed to reorder categories'
        console.error('Error reordering categories:', error)
        throw error
      } finally {
        this.loading = false
      }
    },
  },
})
