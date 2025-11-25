/**
 * Feature Access Plugin
 * Initializes feature access checking and upgrade modal
 */
export default defineNuxtPlugin(async (nuxtApp) => {
  const subscriptionStore = useSubscriptionStore()

  // Fetch subscription data on app initialization
  try {
    await subscriptionStore.fetchSubscription()
  } catch (error) {
    console.error('Failed to fetch subscription:', error)
  }
})
