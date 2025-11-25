import { defineStore } from 'pinia'
import type { Location } from '~/types'

interface LocationState {
  locations: Location[]
  loading: boolean
  error: string | null
}

interface LocationStats {
  itemsAvailable: number
  totalItems: number
}

/**
 * Location Store - Manages locations state
 */
export const useLocationStore = defineStore('location', {
  state: (): LocationState => ({
    locations: [],
    loading: false,
    error: null,
  }),

  getters: {
    activeLocations: (state) => {
      return state.locations.filter(loc => loc.isActive)
    },
    
    getLocationById: (state) => (id: string) => {
      return state.locations.find(loc => loc.id === id)
    },
  },

  actions: {
    async fetchLocations() {
      this.loading = true
      this.error = null
      const api = useApi()

      try {
        const response = await api.get<Location[]>('/locations')
        this.locations = response
      } catch (error: any) {
        this.error = error.message || 'Failed to fetch locations'
        console.error('Error fetching locations:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchLocationStats(locationId: string): Promise<LocationStats> {
      const api = useApi()

      try {
        const response = await api.get<LocationStats>(`/locations/${locationId}/stats`)
        return response
      } catch (error: any) {
        console.error('Error fetching location stats:', error)
        throw error
      }
    },

    async createLocation(data: {
      name: string
      address: string
      city: string
      phone?: string
      email?: string
    }) {
      this.loading = true
      this.error = null
      const api = useApi()

      try {
        const response = await api.post<Location>('/locations', data)
        this.locations.push(response)
        return response
      } catch (error: any) {
        this.error = error.message || 'Failed to create location'
        console.error('Error creating location:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateLocation(
      id: string,
      data: {
        name?: string
        address?: string
        city?: string
        phone?: string
        email?: string
        isActive?: boolean
      }
    ) {
      this.loading = true
      this.error = null
      const api = useApi()

      try {
        const response = await api.patch<Location>(`/locations/${id}`, data)
        const index = this.locations.findIndex(loc => loc.id === id)
        if (index !== -1) {
          this.locations[index] = response
        }
        return response
      } catch (error: any) {
        this.error = error.message || 'Failed to update location'
        console.error('Error updating location:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async toggleLocationStatus(id: string) {
      const location = this.getLocationById(id)
      if (!location) return

      return this.updateLocation(id, { isActive: !location.isActive })
    },

    async deleteLocation(id: string) {
      this.loading = true
      this.error = null
      const api = useApi()

      try {
        await api.delete(`/locations/${id}`)
        this.locations = this.locations.filter(loc => loc.id !== id)
      } catch (error: any) {
        this.error = error.message || 'Failed to delete location'
        console.error('Error deleting location:', error)
        throw error
      } finally {
        this.loading = false
      }
    },
  },
})
