import { defineStore } from 'pinia'
import type { User, UserRole, PaginatedResponse } from '~/types'

interface TeamState {
  members: User[]
  loading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  limits: {
    current: number
    limit: number
    remaining: number
    canCreate: boolean
  } | null
}

interface InviteUserData {
  email: string
  firstName: string
  lastName: string
  role: UserRole
}

/**
 * Team Store - Manages team members and invitations
 */
export const useTeamStore = defineStore('team', {
  state: (): TeamState => ({
    members: [],
    loading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    },
    limits: null,
  }),

  getters: {
    /**
     * Get team members count
     */
    memberCount: (state) => state.members.length,

    /**
     * Check if can add more members
     */
    canAddMembers: (state) => state.limits?.canCreate ?? true,

    /**
     * Get remaining member slots
     */
    remainingSlots: (state) => state.limits?.remaining ?? 0,
  },

  actions: {
    /**
     * Fetch all team members
     */
    async fetchMembers(page: number = 1, limit: number = 10): Promise<void> {
      this.loading = true
      this.error = null
      const api = useApi()

      try {
        const response = await api.get<PaginatedResponse<User>>('/users', {
          params: { page, limit },
        })

        this.members = response.data
        this.pagination = {
          page: response.page,
          limit: response.limit,
          total: response.total,
          totalPages: response.totalPages,
        }
      } catch (error: any) {
        this.error = error.message || 'Failed to fetch team members'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Fetch subscription limits
     */
    async fetchLimits(): Promise<void> {
      const api = useApi()

      try {
        const response = await api.get<any>('/users/limits')
        this.limits = response.users
      } catch (error: any) {
        console.error('Failed to fetch limits:', error)
      }
    },

    /**
     * Invite a new team member
     */
    async inviteMember(data: InviteUserData): Promise<User> {
      this.loading = true
      this.error = null
      const api = useApi()

      try {
        const user = await api.post<User>('/users', {
          ...data,
          isActive: true,
        })

        // Add to members list
        this.members.unshift(user)
        this.pagination.total += 1

        // Update limits
        if (this.limits) {
          this.limits.current += 1
          this.limits.remaining -= 1
          this.limits.canCreate = this.limits.remaining > 0
        }

        return user
      } catch (error: any) {
        this.error = error.message || 'Failed to invite team member'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Update team member role
     */
    async updateMemberRole(userId: string, role: UserRole): Promise<User> {
      this.loading = true
      this.error = null
      const api = useApi()

      try {
        const user = await api.patch<User>(`/users/${userId}/role`, { role })

        // Update in members list
        const index = this.members.findIndex((m) => m.id === userId)
        if (index !== -1) {
          this.members[index] = user
        }

        return user
      } catch (error: any) {
        this.error = error.message || 'Failed to update member role'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Remove team member
     */
    async removeMember(userId: string): Promise<void> {
      this.loading = true
      this.error = null
      const api = useApi()

      try {
        await api.delete(`/users/${userId}`)

        // Remove from members list
        this.members = this.members.filter((m) => m.id !== userId)
        this.pagination.total -= 1

        // Update limits
        if (this.limits) {
          this.limits.current -= 1
          this.limits.remaining += 1
          this.limits.canCreate = true
        }
      } catch (error: any) {
        this.error = error.message || 'Failed to remove team member'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Deactivate team member
     */
    async deactivateMember(userId: string): Promise<User> {
      this.loading = true
      this.error = null
      const api = useApi()

      try {
        const user = await api.patch<User>(`/users/${userId}/deactivate`)

        // Update in members list
        const index = this.members.findIndex((m) => m.id === userId)
        if (index !== -1) {
          this.members[index] = user
        }

        return user
      } catch (error: any) {
        this.error = error.message || 'Failed to deactivate member'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Clear error
     */
    clearError(): void {
      this.error = null
    },
  },
})
