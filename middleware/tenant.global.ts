import { isSystemRoute } from '~/constants/routes'

/**
 * Global middleware to ensure tenant slug is present in URL
 * Redirects to error page if tenant is missing
 */
export default defineNuxtRouteMiddleware((to) => {
  const { getTenantSlug } = useTenant()
  const tenantSlug = getTenantSlug(to.path)
  
  const pathSegments = to.path.split('/').filter(Boolean)
  const firstSegment = pathSegments[0]
  
  // Skip check for root, system routes and error pages
  if (
    to.path === '/' || 
    to.path.startsWith('/error') || 
    (firstSegment && isSystemRoute(firstSegment))
  ) {
    return
  }
  
  // Check if route starts with valid tenant slug (either /t/slug or /slug)
  if (!tenantSlug) {
    return navigateTo('/error/no-tenant')
  }
})
