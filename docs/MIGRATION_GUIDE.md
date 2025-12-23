# Migration Guide: Tenant Admin API Standardization

## Overview

This guide provides step-by-step instructions for migrating from the legacy API format to the new standardized ApiResponse format in the Tenant Admin application.

## Table of Contents

1. [Migration Overview](#migration-overview)
2. [Breaking Changes](#breaking-changes)
3. [Step-by-Step Migration](#step-by-step-migration)
4. [Code Examples](#code-examples)
5. [Testing Migration](#testing-migration)
6. [Performance Optimizations](#performance-optimizations)
7. [Troubleshooting](#troubleshooting)

## Migration Overview

### What's Changing

The Tenant Admin application is migrating from direct API responses to a standardized `ApiResponse<T>` format that provides:

- **Consistent error handling** with structured error codes and messages
- **Request tracing** with unique request IDs for debugging
- **Automatic response unwrapping** for cleaner component code
- **Enhanced file operations** with progress tracking and better error handling
- **Bulk operations support** with partial failure handling
- **Silent token refresh** with request queuing

### Timeline

- **Phase 1**: Enhanced API Service and Core Infrastructure ✅
- **Phase 2**: Form Handling and Validation ✅
- **Phase 3**: Store Standardization ✅
- **Phase 4**: File Operations and Reports ✅
- **Phase 5**: Legacy Compatibility Layer ✅
- **Phase 6**: Production Optimization ✅

## Breaking Changes

### 1. API Response Format

**Before:**
```typescript
// Direct data response
const menus = await $fetch('/api/menu');
// menus = [{ id: '1', name: 'Menu 1' }, ...]
```

**After:**
```typescript
// Wrapped in ApiResponse (automatically unwrapped by service)
const menus = await $api.get<Menu[]>('/menu');
// menus = [{ id: '1', name: 'Menu 1' }, ...] (same result, but with error handling)
```

### 2. Error Handling

**Before:**
```typescript
try {
  const data = await $fetch('/api/menu');
} catch (error) {
  // Generic error handling
  console.error('Request failed:', error);
}
```

**After:**
```typescript
try {
  const data = await $api.get<Menu[]>('/menu');
} catch (error: ApiError) {
  // Structured error with request ID
  console.error(`API Error [${error.requestId}]:`, error.message);
  // error.code = 'VALIDATION_ERROR'
  // error.details = [{ field: 'name', message: 'Required' }]
}
```

### 3. Form Validation

**Before:**
```typescript
// Manual error mapping
const errors = ref<Record<string, string>>({});

const handleError = (error: any) => {
  if (error.data?.errors) {
    errors.value = error.data.errors;
  }
};
```

**After:**
```typescript
// Automatic error mapping with DOM awareness
const { fieldErrors, handleValidationError } = useEnhancedApiForm();

const handleError = (error: ApiError) => {
  handleValidationError(error); // Automatically maps and scrolls to errors
};
```

### 4. Store State Management

**Before:**
```typescript
// Stores might contain API wrappers
const store = useMenuStore();
store.menus = apiResponse; // Contains success, statusCode, etc.
```

**After:**
```typescript
// Stores contain only clean business data
const store = useEnhancedMenuStore();
store.menus = menuData; // Only Menu[] objects, no API wrappers
```

## Step-by-Step Migration

### Step 1: Update API Calls

Replace direct `$fetch` calls with the enhanced API service:

```typescript
// Before
const { data } = await $fetch<{ data: Menu[] }>('/api/menu');

// After
const menus = await $api.get<Menu[]>('/menu');
```

### Step 2: Update Error Handling

Replace generic error handling with structured error handling:

```typescript
// Before
catch (error) {
  toast.error('Something went wrong');
}

// After
catch (error: ApiError) {
  // Error is automatically shown with request ID
  // Additional handling if needed:
  if (error.code === 'VALIDATION_ERROR') {
    handleValidationError(error);
  }
}
```

### Step 3: Update Form Components

Replace manual form error handling with the enhanced form composable:

```vue
<template>
  <form @submit="handleSubmit">
    <input 
      v-model="form.name" 
      :class="{ 'error': getFieldError('name') }"
      @input="clearFieldError('name')"
    />
    <span v-if="getFieldError('name')" class="error-message">
      {{ getFieldError('name') }}
    </span>
    
    <!-- Global errors -->
    <div v-if="globalErrors.length" class="global-errors">
      <p v-for="error in globalErrors" :key="error">{{ error }}</p>
    </div>
  </form>
</template>

<script setup lang="ts">
const { 
  fieldErrors, 
  globalErrors, 
  handleValidationError, 
  clearFieldError,
  getFieldError 
} = useEnhancedApiForm();

const handleSubmit = async () => {
  try {
    await $api.post('/menu-items', form.value);
  } catch (error: ApiError) {
    handleValidationError(error);
  }
};
</script>
```

### Step 4: Update Store Usage

Replace direct API calls in stores with the enhanced patterns:

```typescript
// Before
const menuStore = defineStore('menu', {
  actions: {
    async fetchMenus() {
      try {
        const response = await $fetch('/api/menu');
        this.menus = response.data;
      } catch (error) {
        this.error = error;
      }
    }
  }
});

// After
const menuStore = defineStore('enhanced-menu', {
  actions: {
    async fetchMenus() {
      this.isFetching = true;
      this.errors.menus = null;
      
      try {
        const menus = await $api.get<Menu[]>('/menu');
        this.menus = menus; // Clean business data only
      } catch (error) {
        this.errors.menus = error as ApiError; // Structured error
        this.menus = []; // Safe fallback
      } finally {
        this.isFetching = false;
      }
    }
  }
});
```

### Step 5: Update File Operations

Replace manual file handling with enhanced file operations:

```typescript
// Before
const downloadReport = async () => {
  try {
    const response = await $fetch('/api/reports/sales', {
      method: 'POST',
      body: { format: 'xlsx' },
      responseType: 'blob'
    });
    
    // Manual file download logic
    const url = URL.createObjectURL(response);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sales-report.xlsx';
    link.click();
  } catch (error) {
    toast.error('Download failed');
  }
};

// After
const downloadReport = async () => {
  try {
    await $api.downloadReport({
      type: 'sales',
      format: 'xlsx',
      dateRange: { start: '2024-01-01', end: '2024-01-31' }
    }, {
      showProgress: true,
      successMessage: 'Sales report downloaded successfully'
    });
  } catch (error: ApiError) {
    // Automatic error handling with request ID
    if (error.code === 'FEATURE_NOT_AVAILABLE') {
      toast.error('Reports are not available in your current plan');
    }
  }
};
```

## Code Examples

### Complete Component Migration Example

```vue
<!-- Before: Legacy Component -->
<template>
  <div>
    <form @submit.prevent="saveMenuItem">
      <input v-model="form.name" />
      <span v-if="errors.name">{{ errors.name }}</span>
      
      <input v-model="form.price" type="number" />
      <span v-if="errors.price">{{ errors.price }}</span>
      
      <button :disabled="loading">Save</button>
    </form>
  </div>
</template>

<script setup lang="ts">
const form = ref({ name: '', price: 0 });
const errors = ref<Record<string, string>>({});
const loading = ref(false);

const saveMenuItem = async () => {
  loading.value = true;
  errors.value = {};
  
  try {
    await $fetch('/api/menu-items', {
      method: 'POST',
      body: form.value
    });
    
    toast.success('Item saved');
  } catch (error: any) {
    if (error.data?.errors) {
      errors.value = error.data.errors;
    } else {
      toast.error('Save failed');
    }
  } finally {
    loading.value = false;
  }
};
</script>
```

```vue
<!-- After: Enhanced Component -->
<template>
  <div>
    <form @submit.prevent="saveMenuItem">
      <input 
        v-model="form.name" 
        name="name"
        :class="{ 'error': getFieldError('name') }"
        @input="clearFieldError('name')"
      />
      <span v-if="getFieldError('name')" class="error-message">
        {{ getFieldError('name') }}
      </span>
      
      <input 
        v-model="form.price" 
        name="price"
        type="number"
        :class="{ 'error': getFieldError('price') }"
        @input="clearFieldError('price')"
      />
      <span v-if="getFieldError('price')" class="error-message">
        {{ getFieldError('price') }}
      </span>
      
      <!-- Global errors for fields not visible -->
      <div v-if="globalErrors.length" class="global-errors">
        <p v-for="error in globalErrors" :key="error">{{ error }}</p>
      </div>
      
      <button :disabled="isSubmitting">
        {{ isSubmitting ? 'Saving...' : 'Save' }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
const { $api } = useNuxtApp();
const form = ref({ name: '', price: 0 });

const { 
  fieldErrors, 
  globalErrors, 
  isSubmitting,
  handleValidationError, 
  clearFieldError,
  getFieldError,
  setSubmitting
} = useEnhancedApiForm();

const saveMenuItem = async () => {
  setSubmitting(true);
  
  try {
    await $api.post<MenuItem>('/menu-items', form.value, {
      successMessage: 'Menu item saved successfully'
    });
    
    // Form is automatically reset or redirected
  } catch (error: ApiError) {
    handleValidationError(error); // Automatic error mapping and scroll
  } finally {
    setSubmitting(false);
  }
};
</script>
```

### Store Migration Example

```typescript
// Before: Legacy Store
export const useMenuStore = defineStore('menu', {
  state: () => ({
    menus: [],
    loading: false,
    error: null
  }),
  
  actions: {
    async fetchMenus() {
      this.loading = true;
      try {
        const response = await $fetch('/api/menu');
        this.menus = response.data || response;
      } catch (error) {
        this.error = error;
      } finally {
        this.loading = false;
      }
    }
  }
});

// After: Enhanced Store
export const useEnhancedMenuStore = defineStore('enhanced-menu', {
  state: (): EnhancedMenuState => ({
    // Clean business data
    menus: [],
    menuItems: [],
    pagination: null,
    
    // Operation states
    isFetching: false,
    isSubmitting: false,
    
    // Widget-level error isolation
    errors: {
      menus: null,
      items: null,
      bulk: null
    },
    
    // Bulk operations
    selectedItems: new Set<string>(),
    bulkOperationResult: null
  }),
  
  actions: {
    async fetchMenus() {
      this.isFetching = true;
      this.errors.menus = null;
      
      try {
        const menus = await $api.get<Menu[]>('/menu');
        this.menus = menus; // Clean data only
      } catch (error) {
        this.errors.menus = error as ApiError;
        this.menus = []; // Safe fallback
      } finally {
        this.isFetching = false;
      }
    },
    
    async bulkUpdateItems(menuId: string, updates: Partial<MenuItem>) {
      if (this.selectedItems.size === 0) return;
      
      this.isSubmitting = true;
      this.errors.bulk = null;
      
      try {
        const itemIds = Array.from(this.selectedItems);
        
        const result = await $api.bulkOperation<MenuItem>(
          `/menu/${menuId}/items/bulk-update`,
          itemIds.map(id => ({ id, ...updates })),
          { successMessage: `Updated ${itemIds.length} items` }
        );
        
        // Update successful items in local state
        result.successful.forEach(updatedItem => {
          const index = this.menuItems.findIndex(item => item.id === updatedItem.id);
          if (index !== -1) {
            this.menuItems[index] = updatedItem;
          }
        });
        
        this.selectedItems.clear();
        this.bulkOperationResult = result;
        
      } catch (error) {
        this.errors.bulk = error as ApiError;
      } finally {
        this.isSubmitting = false;
      }
    }
  }
});
```

## Testing Migration

### 1. Unit Tests

Ensure your components work with the new API format:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import MenuItemForm from '~/components/menu/MenuItemForm.vue';

describe('MenuItemForm Migration', () => {
  it('should handle validation errors correctly', async () => {
    const mockApi = {
      post: vi.fn().mockRejectedValue({
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: [
          { field: 'name', message: 'Name is required' },
          { field: 'price', message: 'Price must be positive' }
        ],
        requestId: 'req-123'
      })
    };

    const wrapper = mount(MenuItemForm, {
      global: {
        provide: {
          $api: mockApi
        }
      }
    });

    // Trigger form submission
    await wrapper.find('form').trigger('submit');

    // Check that errors are displayed
    expect(wrapper.find('[name="name"]').classes()).toContain('error');
    expect(wrapper.find('[name="price"]').classes()).toContain('error');
  });
});
```

### 2. Integration Tests

Test the complete flow with real API responses:

```typescript
import { describe, it, expect } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useEnhancedMenuStore } from '~/stores/enhanced-menu';

describe('Enhanced Menu Store Integration', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should handle API responses correctly', async () => {
    const store = useEnhancedMenuStore();
    
    // Mock successful API response
    const mockMenus = [
      { id: '1', name: 'Menu 1', isActive: true },
      { id: '2', name: 'Menu 2', isActive: false }
    ];

    // Test that store contains clean data
    await store.fetchMenus();
    
    expect(store.menus).toEqual(mockMenus);
    expect(store.menus[0]).not.toHaveProperty('success');
    expect(store.menus[0]).not.toHaveProperty('statusCode');
  });
});
```

### 3. E2E Tests

Test complete user workflows:

```typescript
import { test, expect } from '@playwright/test';

test('Menu management workflow', async ({ page }) => {
  await page.goto('/menu');
  
  // Create new menu item
  await page.click('[data-testid="add-item"]');
  await page.fill('[name="name"]', 'Test Item');
  await page.fill('[name="price"]', '15.99');
  await page.click('[data-testid="save"]');
  
  // Should show success message
  await expect(page.locator('.toast-success')).toContainText('Menu item saved successfully');
  
  // Should appear in list
  await expect(page.locator('[data-testid="menu-items"]')).toContainText('Test Item');
});
```

## Performance Optimizations

### 1. Enable Production Optimizations

Add to your `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  // ... other config
  
  plugins: [
    // ... other plugins
    '~/plugins/performance-optimizer.client.ts'
  ],
  
  build: {
    // Enable tree shaking
    analyze: process.env.ANALYZE === 'true',
    
    // Optimize chunks
    optimization: {
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      },
    },
  },
  
  // Enable compression
  nitro: {
    compressPublicAssets: true,
  }
});
```

### 2. Create Performance Plugin

```typescript
// plugins/performance-optimizer.client.ts
import { initializeProductionOptimizations } from '~/utils/performance-optimizer';

export default defineNuxtPlugin(() => {
  if (import.meta.client) {
    initializeProductionOptimizations();
  }
});
```

### 3. Monitor Performance

```typescript
// composables/usePerformanceMonitoring.ts
import { getPerformanceOptimizer } from '~/utils/performance-optimizer';

export const usePerformanceMonitoring = () => {
  const optimizer = getPerformanceOptimizer();
  
  const getStats = () => optimizer.getStats();
  
  const logPerformanceReport = () => {
    const stats = getStats();
    console.group('Performance Report');
    console.log('Request Count:', stats.metrics.requestCount);
    console.log('Average Response Time:', stats.metrics.averageResponseTime.toFixed(2), 'ms');
    console.log('Cache Hit Rate:', (stats.cache.hitRate * 100).toFixed(1), '%');
    console.log('Memory Usage:', formatBytes(stats.metrics.memoryUsage));
    console.groupEnd();
  };
  
  return {
    getStats,
    logPerformanceReport
  };
};
```

## Troubleshooting

### Common Issues

#### 1. "Cannot read property 'success' of undefined"

**Problem**: Trying to access ApiResponse properties directly.

**Solution**: The API service automatically unwraps responses. Access data directly:

```typescript
// Wrong
const response = await $api.get('/menu');
if (response.success) { // Error: response is already unwrapped
  console.log(response.data);
}

// Correct
const menus = await $api.get<Menu[]>('/menu');
console.log(menus); // Direct access to Menu[]
```

#### 2. Form validation not working

**Problem**: Validation errors not displaying in form fields.

**Solution**: Ensure form fields have proper `name` attributes or `data-field` attributes:

```vue
<!-- Wrong -->
<input v-model="form.name" />

<!-- Correct -->
<input v-model="form.name" name="name" />
<!-- or -->
<input v-model="form.name" data-field="name" />
```

#### 3. Store contains API wrappers

**Problem**: Store state includes `success`, `statusCode`, etc.

**Solution**: Ensure you're storing only the unwrapped data:

```typescript
// Wrong
this.menus = apiResponse; // Includes success, statusCode, etc.

// Correct
const menus = await $api.get<Menu[]>('/menu'); // Already unwrapped
this.menus = menus; // Clean Menu[] data
```

#### 4. File downloads not working

**Problem**: File downloads fail or don't trigger browser download.

**Solution**: Use the enhanced file operations:

```typescript
// Wrong
const blob = await $fetch('/reports/sales', { responseType: 'blob' });

// Correct
await $api.downloadFile('/reports/sales', { format: 'xlsx' });
```

#### 5. Performance issues in production

**Problem**: Slow response times or high memory usage.

**Solution**: Enable performance optimizations:

```typescript
// Add to app.vue or main layout
import { initializeProductionOptimizations } from '~/utils/performance-optimizer';

onMounted(() => {
  if (!import.meta.dev) {
    initializeProductionOptimizations();
  }
});
```

### Debug Tools

#### 1. API Request Logging

Enable detailed API logging in development:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      apiDebug: process.env.NODE_ENV === 'development'
    }
  }
});
```

#### 2. Performance Monitoring

Monitor API performance in real-time:

```typescript
// Add to any page/component
const { logPerformanceReport } = usePerformanceMonitoring();

// Log performance stats
logPerformanceReport();
```

#### 3. Store State Inspection

Verify store state is clean:

```typescript
// In Vue DevTools console
const store = useEnhancedMenuStore();
console.log('Store state:', JSON.stringify(store.$state, null, 2));

// Should not contain 'success', 'statusCode', 'meta' properties
```

## Migration Checklist

- [ ] Replace `$fetch` calls with `$api` service methods
- [ ] Update error handling to use structured `ApiError` format
- [ ] Migrate form components to use `useEnhancedApiForm`
- [ ] Update stores to use enhanced patterns with clean state
- [ ] Replace manual file operations with enhanced file methods
- [ ] Add performance optimizations for production
- [ ] Update tests to work with new API format
- [ ] Verify no API wrappers leak into component state
- [ ] Test error scenarios and validation
- [ ] Monitor performance metrics

## Support

For additional help with migration:

1. Check the [Enhanced API Service documentation](./ENHANCED_API_SERVICE.md)
2. Review [Component Integration examples](./COMPONENT_INTEGRATION.md)
3. See [Plugin Implementation guide](./PLUGIN_IMPLEMENTATION.md)
4. Contact the development team for complex migration scenarios