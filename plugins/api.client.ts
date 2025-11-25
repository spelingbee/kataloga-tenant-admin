/**
 * API Plugin
 * Initializes the API service on client-side
 */
export default defineNuxtPlugin(() => {
  const api = useApi()
  
  // Restore token from localStorage if available
  if (process.client) {
    const token = localStorage.getItem('tenant_access_token')
    if (token) {
      api.setToken(token)
    }
  }

  return {
    provide: {
      api
    }
  }
})
