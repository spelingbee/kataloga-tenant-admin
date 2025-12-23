/**
 * Performance Optimizer for Production
 * 
 * Requirement 9.5: Performance optimization for production
 * 
 * This module provides performance optimization utilities for the tenant-admin
 * application, focusing on API request optimization, caching, and resource management.
 */

import type { EnhancedRequestOptions } from '~/types/enhanced-api';

// ============================================================================
// Performance Configuration
// ============================================================================

interface PerformanceConfig {
  // Request optimization
  enableRequestBatching: boolean;
  batchTimeout: number;
  maxBatchSize: number;
  
  // Caching
  enableResponseCaching: boolean;
  cacheTimeout: number;
  maxCacheSize: number;
  
  // Logging
  enablePerformanceLogging: boolean;
  logSlowRequests: boolean;
  slowRequestThreshold: number;
  
  // Resource management
  enableResourceCleanup: boolean;
  cleanupInterval: number;
  maxMemoryUsage: number;
}

const getPerformanceConfig = (): PerformanceConfig => {
  const isDevelopment = import.meta.dev;
  
  return {
    // Request optimization
    enableRequestBatching: !isDevelopment,
    batchTimeout: 50, // ms
    maxBatchSize: 10,
    
    // Caching
    enableResponseCaching: !isDevelopment,
    cacheTimeout: 5 * 60 * 1000, // 5 minutes
    maxCacheSize: 100,
    
    // Logging
    enablePerformanceLogging: isDevelopment,
    logSlowRequests: true,
    slowRequestThreshold: 2000, // 2 seconds
    
    // Resource management
    enableResourceCleanup: !isDevelopment,
    cleanupInterval: 30 * 1000, // 30 seconds
    maxMemoryUsage: 50 * 1024 * 1024 // 50MB
  };
};

// ============================================================================
// Request Batching
// ============================================================================

interface BatchedRequest {
  endpoint: string;
  options: EnhancedRequestOptions;
  resolve: (value: any) => void;
  reject: (error: any) => void;
  timestamp: number;
}

class RequestBatcher {
  private queue: BatchedRequest[] = [];
  private batchTimer: NodeJS.Timeout | null = null;
  private config: PerformanceConfig;

  constructor(config: PerformanceConfig) {
    this.config = config;
  }

  /**
   * Add request to batch queue
   */
  addRequest(
    endpoint: string,
    options: EnhancedRequestOptions,
    resolve: (value: any) => void,
    reject: (error: any) => void
  ): void {
    if (!this.config.enableRequestBatching) {
      // Execute immediately if batching is disabled
      this.executeRequest(endpoint, options, resolve, reject);
      return;
    }

    this.queue.push({
      endpoint,
      options,
      resolve,
      reject,
      timestamp: Date.now()
    });

    // Start batch timer if not already running
    if (!this.batchTimer) {
      this.batchTimer = setTimeout(() => {
        this.processBatch();
      }, this.config.batchTimeout);
    }

    // Process immediately if batch is full
    if (this.queue.length >= this.config.maxBatchSize) {
      this.processBatch();
    }
  }

  /**
   * Process current batch
   */
  private processBatch(): void {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }

    if (this.queue.length === 0) return;

    const batch = [...this.queue];
    this.queue = [];

    // Group requests by endpoint for potential optimization
    const groupedRequests = this.groupRequestsByEndpoint(batch);

    // Execute each group
    Object.entries(groupedRequests).forEach(([endpoint, requests]) => {
      if (requests.length === 1) {
        // Single request - execute normally
        const req = requests[0];
        this.executeRequest(req.endpoint, req.options, req.resolve, req.reject);
      } else {
        // Multiple requests to same endpoint - could be optimized
        requests.forEach(req => {
          this.executeRequest(req.endpoint, req.options, req.resolve, req.reject);
        });
      }
    });
  }

  /**
   * Group requests by endpoint
   */
  private groupRequestsByEndpoint(requests: BatchedRequest[]): Record<string, BatchedRequest[]> {
    return requests.reduce((groups, request) => {
      const key = request.endpoint;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(request);
      return groups;
    }, {} as Record<string, BatchedRequest[]>);
  }

  /**
   * Execute individual request
   */
  private async executeRequest(
    endpoint: string,
    options: EnhancedRequestOptions,
    resolve: (value: any) => void,
    reject: (error: any) => void
  ): Promise<void> {
    try {
      // This would be replaced with actual API service call
      const result = await this.performRequest(endpoint, options);
      resolve(result);
    } catch (error) {
      reject(error);
    }
  }

  /**
   * Perform the actual request (placeholder)
   */
  private async performRequest(endpoint: string, options: EnhancedRequestOptions): Promise<any> {
    // This would integrate with the actual API service
    throw new Error('Request execution not implemented in optimizer');
  }
}

// ============================================================================
// Response Caching
// ============================================================================

interface CacheEntry {
  data: any;
  timestamp: number;
  endpoint: string;
  options: string; // Serialized options for cache key
}

class ResponseCache {
  private cache = new Map<string, CacheEntry>();
  private config: PerformanceConfig;
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor(config: PerformanceConfig) {
    this.config = config;
    
    if (config.enableResourceCleanup) {
      this.startCleanupTimer();
    }
  }

  /**
   * Get cached response
   */
  get(endpoint: string, options: EnhancedRequestOptions): any | null {
    if (!this.config.enableResponseCaching) {
      return null;
    }

    const key = this.generateCacheKey(endpoint, options);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if cache entry is still valid
    const age = Date.now() - entry.timestamp;
    if (age > this.config.cacheTimeout) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Set cached response
   */
  set(endpoint: string, options: EnhancedRequestOptions, data: any): void {
    if (!this.config.enableResponseCaching) {
      return;
    }

    // Don't cache certain types of requests
    if (this.shouldSkipCaching(endpoint, options)) {
      return;
    }

    const key = this.generateCacheKey(endpoint, options);
    
    // Ensure cache doesn't exceed max size
    if (this.cache.size >= this.config.maxCacheSize) {
      this.evictOldestEntry();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      endpoint,
      options: JSON.stringify(options)
    });
  }

  /**
   * Clear cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; maxSize: number; hitRate: number } {
    return {
      size: this.cache.size,
      maxSize: this.config.maxCacheSize,
      hitRate: 0 // Would need hit/miss tracking for accurate calculation
    };
  }

  /**
   * Generate cache key
   */
  private generateCacheKey(endpoint: string, options: EnhancedRequestOptions): string {
    const optionsKey = JSON.stringify({
      method: options.method || 'GET',
      params: options.params,
      data: options.data
    });
    return `${endpoint}:${btoa(optionsKey)}`;
  }

  /**
   * Check if request should be cached
   */
  private shouldSkipCaching(endpoint: string, options: EnhancedRequestOptions): boolean {
    // Don't cache POST, PUT, PATCH, DELETE requests
    const method = options.method?.toUpperCase() || 'GET';
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return true;
    }

    // Don't cache blob requests
    if (options.isBlob || options.responseType === 'blob') {
      return true;
    }

    // Don't cache real-time data endpoints
    const realtimeEndpoints = ['/analytics/live', '/notifications', '/events'];
    if (realtimeEndpoints.some(pattern => endpoint.includes(pattern))) {
      return true;
    }

    return false;
  }

  /**
   * Evict oldest cache entry
   */
  private evictOldestEntry(): void {
    let oldestKey: string | null = null;
    let oldestTimestamp = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Start cleanup timer
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      const age = now - entry.timestamp;
      if (age > this.config.cacheTimeout) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => {
      this.cache.delete(key);
    });

    if (this.config.enablePerformanceLogging && expiredKeys.length > 0) {
      console.log(`[Performance] Cleaned up ${expiredKeys.length} expired cache entries`);
    }
  }

  /**
   * Destroy cache and cleanup resources
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.cache.clear();
  }
}

// ============================================================================
// Performance Monitor
// ============================================================================

interface PerformanceMetrics {
  requestCount: number;
  averageResponseTime: number;
  slowRequestCount: number;
  errorCount: number;
  cacheHitRate: number;
  memoryUsage: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    requestCount: 0,
    averageResponseTime: 0,
    slowRequestCount: 0,
    errorCount: 0,
    cacheHitRate: 0,
    memoryUsage: 0
  };

  private responseTimes: number[] = [];
  private config: PerformanceConfig;

  constructor(config: PerformanceConfig) {
    this.config = config;
  }

  /**
   * Track request performance
   */
  trackRequest(duration: number, success: boolean): void {
    this.metrics.requestCount++;
    
    if (success) {
      this.responseTimes.push(duration);
      
      // Keep only last 100 response times for average calculation
      if (this.responseTimes.length > 100) {
        this.responseTimes.shift();
      }
      
      // Update average response time
      this.metrics.averageResponseTime = 
        this.responseTimes.reduce((sum, time) => sum + time, 0) / this.responseTimes.length;
      
      // Track slow requests
      if (duration > this.config.slowRequestThreshold) {
        this.metrics.slowRequestCount++;
        
        if (this.config.logSlowRequests) {
          console.warn(`[Performance] Slow request detected: ${duration}ms`);
        }
      }
    } else {
      this.metrics.errorCount++;
    }
  }

  /**
   * Update cache hit rate
   */
  updateCacheHitRate(hitRate: number): void {
    this.metrics.cacheHitRate = hitRate;
  }

  /**
   * Update memory usage
   */
  updateMemoryUsage(): void {
    if (import.meta.client && 'memory' in performance) {
      const memInfo = (performance as any).memory;
      this.metrics.memoryUsage = memInfo.usedJSHeapSize;
      
      // Warn if memory usage is high
      if (this.metrics.memoryUsage > this.config.maxMemoryUsage) {
        console.warn(`[Performance] High memory usage detected: ${this.formatBytes(this.metrics.memoryUsage)}`);
      }
    }
  }

  /**
   * Get current metrics
   */
  getMetrics(): PerformanceMetrics {
    this.updateMemoryUsage();
    return { ...this.metrics };
  }

  /**
   * Reset metrics
   */
  reset(): void {
    this.metrics = {
      requestCount: 0,
      averageResponseTime: 0,
      slowRequestCount: 0,
      errorCount: 0,
      cacheHitRate: 0,
      memoryUsage: 0
    };
    this.responseTimes = [];
  }

  /**
   * Format bytes for display
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
}

// ============================================================================
// Main Performance Optimizer
// ============================================================================

export class PerformanceOptimizer {
  private config: PerformanceConfig;
  private batcher: RequestBatcher;
  private cache: ResponseCache;
  private monitor: PerformanceMonitor;

  constructor() {
    this.config = getPerformanceConfig();
    this.batcher = new RequestBatcher(this.config);
    this.cache = new ResponseCache(this.config);
    this.monitor = new PerformanceMonitor(this.config);
  }

  /**
   * Optimize request execution
   */
  async optimizeRequest<T>(
    endpoint: string,
    options: EnhancedRequestOptions,
    executor: (endpoint: string, options: EnhancedRequestOptions) => Promise<T>
  ): Promise<T> {
    const startTime = performance.now();
    
    try {
      // Check cache first
      const cachedResult = this.cache.get(endpoint, options);
      if (cachedResult !== null) {
        this.monitor.trackRequest(performance.now() - startTime, true);
        return cachedResult;
      }

      // Execute request
      const result = await executor(endpoint, options);
      
      // Cache successful result
      this.cache.set(endpoint, options, result);
      
      // Track performance
      const duration = performance.now() - startTime;
      this.monitor.trackRequest(duration, true);
      
      return result;
      
    } catch (error) {
      // Track error
      const duration = performance.now() - startTime;
      this.monitor.trackRequest(duration, false);
      
      throw error;
    }
  }

  /**
   * Get performance statistics
   */
  getStats(): {
    metrics: PerformanceMetrics;
    cache: { size: number; maxSize: number; hitRate: number };
    config: PerformanceConfig;
  } {
    return {
      metrics: this.monitor.getMetrics(),
      cache: this.cache.getStats(),
      config: this.config
    };
  }

  /**
   * Clear all caches and reset metrics
   */
  reset(): void {
    this.cache.clear();
    this.monitor.reset();
  }

  /**
   * Destroy optimizer and cleanup resources
   */
  destroy(): void {
    this.cache.destroy();
    this.monitor.reset();
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let optimizerInstance: PerformanceOptimizer | null = null;

export const getPerformanceOptimizer = (): PerformanceOptimizer => {
  if (!optimizerInstance) {
    optimizerInstance = new PerformanceOptimizer();
  }
  return optimizerInstance;
};

// ============================================================================
// Production Optimization Utilities
// ============================================================================

/**
 * Optimize component loading for production
 */
export const optimizeComponentLoading = () => {
  if (import.meta.client && !import.meta.dev) {
    // Preload critical components
    const criticalComponents = [
      () => import('~/components/ui/EnhancedTable.vue'),
      () => import('~/components/menu/MenuItemForm.vue'),
      () => import('~/components/dashboard/DashboardOverview.vue')
    ];

    // Load components with requestIdleCallback if available
    if ('requestIdleCallback' in window) {
      criticalComponents.forEach(loader => {
        requestIdleCallback(() => {
          loader().catch(() => {
            // Ignore preload errors
          });
        });
      });
    }
  }
};

/**
 * Optimize bundle size by removing development code
 */
export const optimizeBundle = () => {
  if (!import.meta.dev) {
    // Remove development-only code
    console.log = () => {};
    console.debug = () => {};
    
    // Disable Vue devtools
    if (import.meta.client && window.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
      window.__VUE_DEVTOOLS_GLOBAL_HOOK__.enabled = false;
    }
  }
};

/**
 * Initialize production optimizations
 */
export const initializeProductionOptimizations = () => {
  if (!import.meta.dev) {
    optimizeComponentLoading();
    optimizeBundle();
    
    // Initialize performance optimizer
    getPerformanceOptimizer();
    
    console.info('[Performance] Production optimizations initialized');
  }
};