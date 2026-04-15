/**
 * Auth Middleware
 * Protects routes that require authentication
 */
export default defineNuxtRouteMiddleware(async (to, from) => {
  // Skip middleware on server-side
  if (import.meta.server) return

  const authStore = useAuthStore()
  const api = useApi()
  const { getTenantSlug } = useTenant()

  // Get tenant slug from path
  const tenantSlug = getTenantSlug(to.path)
  
  // CRITICAL: Set tenant slug in API client for subsequent requests (like fetchUser)
  if (tenantSlug) {
    api.setTenant(tenantSlug)
  }
  
  // If we're on a route that doesn't have a tenant slug (like /login or system routes),
  // we don't need to enforce auth here.
  if (!tenantSlug) return

  // Check if we are on the login route
  const isLoginRoute = to.path.includes('/login')

  // If we are not authenticated, try to fetch the profile (handles existing cookies)
  if (!authStore.user) {
    try {
      await authStore.fetchUser()
    } catch (error) {
      // Profile fetch failed (no active session cookie)
      if (!isLoginRoute) {
        return navigateTo(`/${tenantSlug}/login`)
      }
    }
  }

  const stillAuthenticated = authStore.isAuthenticated && authStore.user

  // 1. If we are on the login route and ALREADY authenticated, redirect to dashboard
  if (isLoginRoute && stillAuthenticated) {
    return navigateTo(`/${tenantSlug}`)
  }

  // 2. If we are NOT on a login route and NOT authenticated, redirect to login
  if (!isLoginRoute && !stillAuthenticated) {
    return navigateTo(`/${tenantSlug}/login`)
  }

  // Verify user has correct role (OWNER, ADMIN, TENANT_ADMIN, or TENANT_STAFF)
  if (stillAuthenticated && authStore.user && !isLoginRoute) {
    const validRoles = ['OWNER', 'ADMIN', 'TENANT_ADMIN', 'TENANT_STAFF']
    if (!validRoles.includes(authStore.user.role)) {
      // User doesn't have tenant admin/staff role
      api.clearToken()
      authStore.clearUser()
      return navigateTo(`/${tenantSlug}/login`)
    }
  }
})
