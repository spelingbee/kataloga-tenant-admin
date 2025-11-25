/**
 * Auth Plugin
 * Initializes authentication state on app load
 */
export default defineNuxtPlugin(async () => {
  const { initAuth } = useAuth()
  
  // Initialize auth state from stored token
  try {
    await initAuth()
  } catch (error) {
    console.error('Auth initialization error:', error)
    // Continue app load even if auth init fails
  }
})
