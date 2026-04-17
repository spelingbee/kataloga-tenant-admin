import { isSystemRoute } from '~/constants/routes'

/**
 * Global middleware to ensure tenant slug is present in URL
 * Redirects to error page if tenant is missing
 */
export default defineNuxtRouteMiddleware((to) => {
  // Extract tenant from path (first segment)
  const pathSegments = to.path.split('/').filter(Boolean)
  const tenantSlug = pathSegments[0]
  
  // Skip check for root, system routes and error pages
  if (
    to.path === '/' || 
    to.path.startsWith('/error') || 
    (tenantSlug && isSystemRoute(tenantSlug))
  ) {
    return
  }
  
  // Check if route starts with valid tenant slug
  if (!tenantSlug) {
    return navigateTo('/error/no-tenant')
  }
})
