import { defineStore } from 'pinia'
import type { Subscription, Plan } from '~/types'

interface SubscriptionState {
  subscription: Subscription | null
  availablePlans: Plan[]
  loading: boolean
  error: string | null
}

interface UsageStats {
  users: { current: number; max: number }
  locations: { current: number; max: number }
  menuItems: { current: number; max: number }
  categories: { current: number; max: number }
}

/**
 * Subscription Store - Manages subscription and plan data
 */
export const useSubscriptionStore = defineStore('subscription', {
  state: (): SubscriptionState => ({
    subscription: null,
    availablePlans: [],
    loading: false,
    error: null,
  }),

  getters: {
    currentPlan: (state): Plan | null => state.subscription?.plan || null,
    
    planName: (state): string => state.subscription?.plan?.name || 'FREE',
    
    isFreePlan: (state): boolean => state.subscription?.plan?.name === 'FREE',
    
    isProPlan: (state): boolean => state.subscription?.plan?.name === 'PRO',
    
    isBusinessPlan: (state): boolean => state.subscription?.plan?.name === 'BUSINESS',
    
    isActive: (state): boolean => state.subscription?.status === 'ACTIVE',
    
    isTrial: (state): boolean => state.subscription?.status === 'TRIAL',
  },

  actions: {
    /**
     * Fetch current subscription
     */
    async fetchSubscription(): Promise<void> {
      this.loading = true
      this.error = null
      const api = useApi()

      try {
        const subscription = await api.get<Subscription>('/subscription')
        this.subscription = subscription
      } catch (error: any) {
        this.error = error.message || 'Failed to fetch subscription'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Fetch available plans
     */
    async fetchPlans(): Promise<void> {
      this.loading = true
      this.error = null
      const api = useApi()

      try {
        const plans = await api.get<Plan[]>('/subscription/plans')
        this.availablePlans = plans
      } catch (error: any) {
        this.error = error.message || 'Failed to fetch plans'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Fetch usage statistics
     */
    async fetchUsageStats(): Promise<UsageStats> {
      const api = useApi()

      try {
        const stats = await api.get<UsageStats>('/subscription/usage')
        return stats
      } catch (error: any) {
        throw error
      }
    },

    /**
     * Clear subscription data
     */
    clearSubscription(): void {
      this.subscription = null
      this.availablePlans = []
      this.error = null
    },
  },
})
