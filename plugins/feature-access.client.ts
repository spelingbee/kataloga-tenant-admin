/**
 * Feature Access Plugin
 * Initializes feature access checking and upgrade modal
 */
export default defineNuxtPlugin({
  name: 'feature-access',
  dependsOn: ['api'], // Wait for API to be ready
  async setup(nuxtApp) {
    // Fetch subscription data on app initialization
    try {
      const { isPublicRoute } = await import('~/constants/routes')
      const route = useRoute()
      
      // Skip subscription fetch on public pages where user won't have a session yet
      if (isPublicRoute(route.path)) {
        console.log(`[Feature Access Plugin] Skipping subscription fetch for public route: ${route.path}`)
        return
      }

      const subscriptionStore = useSubscriptionStore()
      await subscriptionStore.fetchSubscription()
    } catch (error) {
      console.error('Failed to fetch subscription:', error)
      // Continue app initialization even if subscription fetch fails
    }
  }
})
