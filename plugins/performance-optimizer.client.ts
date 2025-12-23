/**
 * Performance Optimizer Plugin for Production
 * 
 * Requirement 9.5: Performance optimization for production
 * 
 * This plugin initializes performance optimizations when the app runs in production mode.
 */

import { initializeProductionOptimizations } from '~/utils/performance-optimizer';

export default defineNuxtPlugin(() => {
  // Only run optimizations in production
  if (!import.meta.dev && import.meta.client) {
    try {
      initializeProductionOptimizations();
      
      // Log successful initialization
      console.info('[Tenant Admin] Production optimizations initialized');
      
      // Monitor performance periodically in production
      if ('requestIdleCallback' in window) {
        const monitorPerformance = () => {
          requestIdleCallback(() => {
            try {
              const { getPerformanceOptimizer } = require('~/utils/performance-optimizer');
              const optimizer = getPerformanceOptimizer();
              const stats = optimizer.getStats();
              
              // Log warnings for performance issues
              if (stats.metrics.averageResponseTime > 3000) {
                console.warn('[Performance] High average response time:', stats.metrics.averageResponseTime.toFixed(2), 'ms');
              }
              
              if (stats.metrics.memoryUsage > 50 * 1024 * 1024) { // 50MB
                console.warn('[Performance] High memory usage detected');
              }
              
              // Schedule next check
              setTimeout(monitorPerformance, 60000); // Every minute
            } catch (error) {
              // Ignore monitoring errors in production
            }
          });
        };
        
        // Start monitoring after initial load
        setTimeout(monitorPerformance, 10000); // After 10 seconds
      }
      
    } catch (error) {
      // Fail silently in production to avoid breaking the app
      console.error('[Performance] Failed to initialize optimizations:', error);
    }
  }
});