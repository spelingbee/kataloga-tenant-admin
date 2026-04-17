/**
 * System routes that should NOT be treated as tenant slugs.
 * These are root-level public or system-internal pages.
 */
export const SYSTEM_ROUTES = [
  'error',
  'api',
  'admin',
  'health',
  'super-admin',
  'login',
  'register',
  'onboarding',
  'subscription', // Often a root-level plan management page
]

/**
 * Routes that do not require authentication
 */
export const PUBLIC_ROUTES = [
  'login',
  'register',
  'onboarding',
  'error'
]

/**
 * Check if a path segment is a system route
 */
export const isSystemRoute = (segment: string): boolean => {
  if (!segment) return false
  return SYSTEM_ROUTES.includes(segment.toLowerCase().trim())
}

/**
 * Check if a path starts with a public route
 */
export const isPublicRoute = (path: string): boolean => {
  const segment = path.split('/').filter(Boolean)[0]
  if (!segment) return false
  return PUBLIC_ROUTES.includes(segment.toLowerCase().trim())
}
