/**
 * Legacy Development Tools Plugin
 * 
 * Initializes legacy compatibility development tools in development mode
 * Requirement 7.3: Development warnings and monitoring
 */

export default defineNuxtPlugin(() => {
  // Only load in development mode
  if (!import.meta.dev) {
    return;
  }

  // Dynamically import dev tools to avoid including in production
  import('~/utils/legacy-dev-tools').then((module) => {
    const LegacyDevTools = module.default;
    
    // Initialize dev tools
    LegacyDevTools.init();
    LegacyDevTools.startMonitoring();
    
    console.log('🛠️ Legacy compatibility development tools initialized');
  }).catch((error) => {
    console.warn('Failed to load legacy dev tools:', error);
  });
});