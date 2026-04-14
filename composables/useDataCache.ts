import { ref, computed } from 'vue'

interface CacheEntry<T> {
  data: T
  timestamp: number
  loading: boolean
  error: string | null
}

interface CacheOptions {
  ttl?: number // Time to live in milliseconds (default: 5 minutes)
  staleWhileRevalidate?: boolean // Return stale data while fetching fresh data
}

const cache = new Map<string, CacheEntry<any>>()

export function useDataCache() {
  const DEFAULT_TTL = 5 * 60 * 1000 // 5 minutes

  const getCacheKey = (key: string): string => {
    return key
  }

  const isCacheValid = (entry: CacheEntry<any>, ttl: number): boolean => {
    return Date.now() - entry.timestamp < ttl
  }

  const getCachedData = <T>(key: string, options: CacheOptions = {}): CacheEntry<T> | null => {
    const cacheKey = getCacheKey(key)
    const entry = cache.get(cacheKey)
    
    if (!entry) return null

    const ttl = options.ttl || DEFAULT_TTL
    
    if (isCacheValid(entry, ttl)) {
      return entry
    }

    // If staleWhileRevalidate is enabled, return stale data
    if (options.staleWhileRevalidate) {
      return entry
    }

    return null
  }

  const setCachedData = <T>(key: string, data: T): void => {
    const cacheKey = getCacheKey(key)
    cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      loading: false,
      error: null,
    })
  }

  const setCacheLoading = (key: string, loading: boolean): void => {
    const cacheKey = getCacheKey(key)
    const entry = cache.get(cacheKey)
    
    if (entry) {
      entry.loading = loading
    } else {
      cache.set(cacheKey, {
        data: null,
        timestamp: Date.now(),
        loading,
        error: null,
      })
    }
  }

  const setCacheError = (key: string, error: string): void => {
    const cacheKey = getCacheKey(key)
    const entry = cache.get(cacheKey)
    
    if (entry) {
      entry.error = error
      entry.loading = false
    } else {
      cache.set(cacheKey, {
        data: null,
        timestamp: Date.now(),
        loading: false,
        error,
      })
    }
  }

  const invalidateCache = (key: string): void => {
    const cacheKey = getCacheKey(key)
    cache.delete(cacheKey)
  }

  const invalidateAll = (): void => {
    cache.clear()
  }

  const fetchWithCache = async <T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> => {
    const cachedEntry = getCachedData<T>(key, options)

    // Return cached data if valid
    if (cachedEntry && !cachedEntry.loading) {
      // If staleWhileRevalidate, fetch in background
      if (options.staleWhileRevalidate && !isCacheValid(cachedEntry, options.ttl || DEFAULT_TTL)) {
        // Fetch fresh data in background
        fetcher()
          .then((data) => setCachedData(key, data))
          .catch((error) => console.error('Background fetch failed:', error))
      }
      
      return cachedEntry.data
    }

    // If already loading, wait for it
    if (cachedEntry?.loading) {
      return new Promise((resolve, reject) => {
        const checkInterval = setInterval(() => {
          const entry = cache.get(getCacheKey(key))
          if (entry && !entry.loading) {
            clearInterval(checkInterval)
            if (entry.error) {
              reject(new Error(entry.error))
            } else {
              resolve(entry.data)
            }
          }
        }, 100)
      })
    }

    // Fetch fresh data
    setCacheLoading(key, true)
    
    try {
      const data = await fetcher()
      setCachedData(key, data)
      return data
    } catch (error: any) {
      setCacheError(key, error.message || 'Failed to fetch data')
      throw error
    }
  }

  return {
    getCachedData,
    setCachedData,
    invalidateCache,
    invalidateAll,
    fetchWithCache,
  }
}
