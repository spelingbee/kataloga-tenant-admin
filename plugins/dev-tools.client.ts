/**
 * Development Tools Plugin
 * 
 * Initializes development tools and debugging utilities
 * Only loads in development mode
 */

import { initDevTools, monitorApiCalls } from '~/utils/dev-tools';

export default defineNuxtPlugin((nuxtApp) => {
  // Only initialize in development mode
  if (!import.meta.dev) return;

  // Initialize development tools
  initDevTools();

  // Enable API call monitoring
  monitorApiCalls();

  // Add route change monitoring
  const router = nuxtApp.$router as any;
  if (router && router.beforeEach) {
    router.beforeEach((to: any, from: any) => {
      if (from.path !== to.path) {
        console.log(`🧭 Route change: ${from.path} → ${to.path}`);
      }
    });
  }

  console.log('🛠️ Development tools initialized');
});