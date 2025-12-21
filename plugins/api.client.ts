/**
 * API Plugin (DEPRECATED)
 * 
 * This plugin is deprecated in favor of enhanced-api.client.ts
 * Keeping for backward compatibility but disabled
 */

// Disabled - using enhanced-api.client.ts instead
export default defineNuxtPlugin({
  name: 'legacy-api',
  setup() {
    // This plugin is disabled - enhanced-api.client.ts provides $api
    return {};
  }
});
