# Feature Access Control

This document describes the plan-based feature access control system in the Tenant Admin Dashboard.

## Table of Contents

1. [Overview](#overview)
2. [Plan Structure](#plan-structure)
3. [Feature Keys](#feature-keys)
4. [Implementation](#implementation)
5. [Usage in Components](#usage-in-components)
6. [Backend Integration](#backend-integration)
7. [Upgrade Flow](#upgrade-flow)
8. [Best Practices](#best-practices)

## Overview

The Tenant Admin Dashboard implements a plan-based feature access control system that restricts features based on the tenant's subscription plan (FREE, PRO, BUSINESS).

### Architecture

```
Component
    ↓
useFeatureAccess() composable
    ↓
Subscription Store
    ↓
Backend API (feature validation)
```

### Key Concepts

1. **Plans**: FREE, PRO, BUSINESS
2. **Features**: Specific capabilities (e.g., sales_analytics, multi_location)
3. **Feature Guards**: Components that show/hide features based on access
4. **Upgrade Prompts**: UI elements encouraging plan upgrades

## Plan Structure

### Plan Hierarchy

```
FREE (Basic)
├── Basic menu management
├── Category management
├── Dish availability control
└── Image upload

PRO (Advanced)
├── All FREE features
├── Sales analytics
├── Multi-location (up to 3)
├── Audit trail
├── Multi-user (up to 5)
└── Basic data export

BUSINESS (Enterprise)
├── All PRO features
├── Advanced reporting
├── API access
├── Custom branding
├── Unlimited locations
├── Unlimited users
└── Priority support
```

### Plan Limits

```typescript
interface PlanLimits {
  maxUsers: number
  maxLocations: number
  maxMenuItems: number
  maxCategories: number
}

const PLAN_LIMITS: Record<string, PlanLimits> = {
  FREE: {
    maxUsers: 1,
    maxLocations: 1,
    maxMenuItems: 50,
    maxCategories: 10
  },
  PRO: {
    maxUsers: 5,
    maxLocations: 3,
    maxMenuItems: 500,
    maxCategories: 50
  },
  BUSINESS: {
    maxUsers: -1,  // Unlimited
    maxLocations: -1,  // Unlimited
    maxMenuItems: -1,  // Unlimited
    maxCategories: -1  // Unlimited
  }
}
```

## Feature Keys

### Available Features

```typescript
export enum FeatureKey {
  // Analytics
  SALES_ANALYTICS = 'sales_analytics',
  ADVANCED_REPORTING = 'advanced_reporting',
  
  // Data
  DATA_EXPORT = 'data_export',
  AUDIT_TRAIL = 'audit_trail',
  
  // Multi-tenant
  MULTI_LOCATION = 'multi_location',
  MULTI_USER = 'multi_user',
  
  // Integration
  API_ACCESS = 'api_access',
  
  // Customization
  CUSTOM_BRANDING = 'custom_branding',
  
  // Support
  PRIORITY_SUPPORT = 'priority_support'
}
```

### Feature-Plan Matrix

| Feature | FREE | PRO | BUSINESS |
|---------|------|-----|----------|
| Basic Menu Management | ✅ | ✅ | ✅ |
| Category Management | ✅ | ✅ | ✅ |
| Dish Availability | ✅ | ✅ | ✅ |
| Image Upload | ✅ | ✅ | ✅ |
| Sales Analytics | ❌ | ✅ | ✅ |
| Audit Trail | ❌ | ✅ | ✅ |
| Multi-Location | ❌ | ✅ (3) | ✅ (∞) |
| Multi-User | ❌ | ✅ (5) | ✅ (∞) |
| Data Export | ❌ | Basic | Advanced |
| Advanced Reporting | ❌ | ❌ | ✅ |
| API Access | ❌ | ❌ | ✅ |
| Custom Branding | ❌ | ❌ | ✅ |
| Priority Support | ❌ | ❌ | ✅ |

## Implementation

### useFeatureAccess Composable

```typescript
// composables/useFeatureAccess.ts
import { computed } from 'vue'
import { useSubscriptionStore } from '~/stores/subscription'
import { FeatureKey } from '~/types'

export function useFeatureAccess() {
  const subscriptionStore = useSubscriptionStore()
  
  /**
   * Check if the current tenant has access to a feature
   */
  const hasFeature = (featureKey: FeatureKey): boolean => {
    const subscription = subscriptionStore.subscription
    if (!subscription) return false
    
    return subscription.plan.features.some(
      f => f.featureKey === featureKey && f.isEnabled
    )
  }
  
  /**
   * Throw error if feature is not available
   */
  const requireFeature = (featureKey: FeatureKey): void => {
    if (!hasFeature(featureKey)) {
      throw new Error(`Feature ${featureKey} not available in current plan`)
    }
  }
  
  /**
   * Get the plan name that includes this feature
   */
  const getRequiredPlan = (featureKey: FeatureKey): string => {
    const featurePlanMap: Record<FeatureKey, string> = {
      [FeatureKey.SALES_ANALYTICS]: 'PRO',
      [FeatureKey.ADVANCED_REPORTING]: 'BUSINESS',
      [FeatureKey.API_ACCESS]: 'BUSINESS',
      [FeatureKey.CUSTOM_BRANDING]: 'BUSINESS',
      [FeatureKey.MULTI_LOCATION]: 'PRO',
      [FeatureKey.AUDIT_TRAIL]: 'PRO',
      [FeatureKey.DATA_EXPORT]: 'PRO',
      [FeatureKey.MULTI_USER]: 'PRO',
      [FeatureKey.PRIORITY_SUPPORT]: 'BUSINESS'
    }
    
    return featurePlanMap[featureKey] || 'PRO'
  }
  
  /**
   * Get upgrade URL for a specific feature
   */
  const getUpgradeUrl = (featureKey: FeatureKey): string => {
    return `/subscription?feature=${featureKey}`
  }
  
  /**
   * Check if current usage is within plan limits
   */
  const isWithinLimit = (limitType: 'users' | 'locations' | 'menuItems' | 'categories', currentCount: number): boolean => {
    const subscription = subscriptionStore.subscription
    if (!subscription) return false
    
    const limits = subscription.plan
    const limitMap = {
      users: limits.maxUsers,
      locations: limits.maxLocations,
      menuItems: limits.maxMenuItems,
      categories: limits.maxCategories
    }
    
    const limit = limitMap[limitType]
    
    // -1 means unlimited
    if (limit === -1) return true
    
    return currentCount < limit
  }
  
  /**
   * Get current plan name
   */
  const currentPlan = computed(() => {
    return subscriptionStore.subscription?.plan.name || 'FREE'
  })
  
  /**
   * Check if user can upgrade
   */
  const canUpgrade = computed(() => {
    const plan = currentPlan.value
    return plan === 'FREE' || plan === 'PRO'
  })
  
  return {
    hasFeature,
    requireFeature,
    getRequiredPlan,
    getUpgradeUrl,
    isWithinLimit,
    currentPlan,
    canUpgrade
  }
}
```

### Subscription Store

```typescript
// stores/subscription.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Subscription, Plan } from '~/types'

export const useSubscriptionStore = defineStore('subscription', () => {
  const subscription = ref<Subscription | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  const plan = computed(() => subscription.value?.plan)
  const planName = computed(() => plan.value?.name || 'FREE')
  
  const fetchSubscription = async () => {
    loading.value = true
    error.value = null
    
    try {
      const api = useApi()
      const response = await api.get<ApiResponse<Subscription>>('/subscription')
      subscription.value = response.data
    } catch (err) {
      error.value = 'Failed to fetch subscription'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  const hasFeature = (featureKey: string): boolean => {
    if (!subscription.value) return false
    
    return subscription.value.plan.features.some(
      f => f.featureKey === featureKey && f.isEnabled
    )
  }
  
  return {
    subscription: readonly(subscription),
    loading: readonly(loading),
    error: readonly(error),
    plan,
    planName,
    fetchSubscription,
    hasFeature
  }
})
```

## Usage in Components

### FeatureGuard Component

```vue
<!-- components/ui/FeatureGuard.vue -->
<script setup lang="ts">
import { useFeatureAccess } from '~/composables/useFeatureAccess'
import { FeatureKey } from '~/types'

const props = defineProps<{
  feature: FeatureKey
  showUpgrade?: boolean
}>()

const { hasFeature, getRequiredPlan, getUpgradeUrl } = useFeatureAccess()

const hasAccess = computed(() => hasFeature(props.feature))
const requiredPlan = computed(() => getRequiredPlan(props.feature))
const upgradeUrl = computed(() => getUpgradeUrl(props.feature))
</script>

<template>
  <div v-if="hasAccess">
    <slot />
  </div>
  <div v-else-if="showUpgrade" class="feature-locked">
    <div class="feature-locked__content">
      <h3 class="feature-locked__title">Feature Not Available</h3>
      <p class="feature-locked__message">
        This feature requires the {{ requiredPlan }} plan or higher.
      </p>
      <NuxtLink :to="upgradeUrl" class="btn btn--primary">
        Upgrade to {{ requiredPlan }}
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/scss/variables' as *;

.feature-locked {
  padding: $spacing-xl;
  text-align: center;
  background: $bg-secondary;
  border-radius: $radius-lg;
}

.feature-locked__title {
  font-size: 1.5rem;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: $spacing-md;
}

.feature-locked__message {
  color: $text-secondary;
  margin-bottom: $spacing-lg;
}
</style>
```

### Using FeatureGuard

```vue
<script setup lang="ts">
import { FeatureKey } from '~/types'
</script>

<template>
  <div>
    <!-- Show analytics only for PRO/BUSINESS -->
    <FeatureGuard :feature="FeatureKey.SALES_ANALYTICS" :show-upgrade="true">
      <SalesAnalyticsDashboard />
    </FeatureGuard>
    
    <!-- Show locations only for PRO/BUSINESS -->
    <FeatureGuard :feature="FeatureKey.MULTI_LOCATION">
      <LocationManagement />
    </FeatureGuard>
  </div>
</template>
```

### Conditional Rendering

```vue
<script setup lang="ts">
import { useFeatureAccess } from '~/composables/useFeatureAccess'
import { FeatureKey } from '~/types'

const { hasFeature } = useFeatureAccess()

const canViewAnalytics = computed(() => hasFeature(FeatureKey.SALES_ANALYTICS))
const canManageLocations = computed(() => hasFeature(FeatureKey.MULTI_LOCATION))
</script>

<template>
  <div>
    <nav>
      <NuxtLink to="/menu">Menu</NuxtLink>
      <NuxtLink to="/categories">Categories</NuxtLink>
      
      <NuxtLink v-if="canViewAnalytics" to="/analytics">
        Analytics
      </NuxtLink>
      
      <NuxtLink v-if="canManageLocations" to="/locations">
        Locations
      </NuxtLink>
    </nav>
  </div>
</template>
```

### Programmatic Checks

```vue
<script setup lang="ts">
import { useFeatureAccess } from '~/composables/useFeatureAccess'
import { FeatureKey } from '~/types'

const { hasFeature, requireFeature } = useFeatureAccess()

const exportData = async () => {
  try {
    // Throw error if feature not available
    requireFeature(FeatureKey.DATA_EXPORT)
    
    // Proceed with export
    const api = useApi()
    const response = await api.get('/analytics/export')
    // Handle export
  } catch (error) {
    if (error.message.includes('not available')) {
      showUpgradePrompt()
    }
  }
}

const handleCreateLocation = () => {
  if (!hasFeature(FeatureKey.MULTI_LOCATION)) {
    showUpgradePrompt()
    return
  }
  
  // Proceed with creation
  navigateTo('/locations/new')
}
</script>
```

### Plan Limit Checks

```vue
<script setup lang="ts">
import { useFeatureAccess } from '~/composables/useFeatureAccess'
import { useMenuStore } from '~/stores/menu'

const { isWithinLimit } = useFeatureAccess()
const menuStore = useMenuStore()

const canAddMenuItem = computed(() => {
  const currentCount = menuStore.itemCount
  return isWithinLimit('menuItems', currentCount)
})

const handleAddItem = () => {
  if (!canAddMenuItem.value) {
    showToast('You have reached your plan limit for menu items', 'warning')
    showUpgradePrompt()
    return
  }
  
  navigateTo('/menu/items/new')
}
</script>

<template>
  <div>
    <button
      @click="handleAddItem"
      :disabled="!canAddMenuItem"
      class="btn btn--primary"
    >
      Add Menu Item
    </button>
    
    <p v-if="!canAddMenuItem" class="warning-text">
      Plan limit reached. Upgrade to add more items.
    </p>
  </div>
</template>
```

## Backend Integration

### Feature Access Guard (Backend)

```typescript
// backend/src/common/guards/feature-access.guard.ts
@Injectable()
export class FeatureAccessGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private featureAccessService: FeatureAccessService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredFeature = this.reflector.get<FeatureKey>(
      'feature',
      context.getHandler(),
    )

    if (!requiredFeature) {
      return true
    }

    const request = context.switchToHttp().getRequest()
    const user = request.user
    const tenantId = user.tenantId

    const hasAccess = await this.featureAccessService.hasFeatureAccess(
      tenantId,
      requiredFeature,
    )

    if (!hasAccess) {
      throw new ForbiddenException({
        code: 'FEATURE_NOT_AVAILABLE',
        message: `Feature ${requiredFeature} not available in your plan`,
        details: {
          feature: requiredFeature,
          currentPlan: user.tenant.subscription.plan.name,
          requiredPlan: this.getRequiredPlan(requiredFeature),
          upgradeUrl: '/subscription/upgrade'
        }
      })
    }

    return true
  }
}
```

### Using Feature Guard in Controllers

```typescript
// backend/src/analytics/analytics.controller.ts
@Controller('analytics')
@UseGuards(JwtAuthGuard, FeatureAccessGuard)
export class AnalyticsController {
  @Get('overview')
  @RequireFeature(FeatureKey.SALES_ANALYTICS)
  async getOverview(@TenantContext() tenantId: string) {
    return this.analyticsService.getOverview(tenantId)
  }

  @Get('export')
  @RequireFeature(FeatureKey.DATA_EXPORT)
  async exportData(@TenantContext() tenantId: string) {
    return this.analyticsService.exportData(tenantId)
  }
}
```

## Upgrade Flow

### FeatureLockedModal Component

```vue
<!-- components/ui/FeatureLockedModal.vue -->
<script setup lang="ts">
import { FeatureKey } from '~/types'

const props = defineProps<{
  feature: FeatureKey
  requiredPlan: string
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
  upgrade: []
}>()

const featureNames: Record<FeatureKey, string> = {
  [FeatureKey.SALES_ANALYTICS]: 'Sales Analytics',
  [FeatureKey.ADVANCED_REPORTING]: 'Advanced Reporting',
  [FeatureKey.API_ACCESS]: 'API Access',
  [FeatureKey.CUSTOM_BRANDING]: 'Custom Branding',
  [FeatureKey.MULTI_LOCATION]: 'Multi-Location Support',
  [FeatureKey.AUDIT_TRAIL]: 'Audit Trail',
  [FeatureKey.DATA_EXPORT]: 'Data Export',
  [FeatureKey.MULTI_USER]: 'Multi-User Access',
  [FeatureKey.PRIORITY_SUPPORT]: 'Priority Support'
}

const featureName = computed(() => featureNames[props.feature])

const handleUpgrade = () => {
  emit('upgrade')
  navigateTo(`/subscription?feature=${props.feature}`)
}
</script>

<template>
  <Modal :is-open="isOpen" @close="emit('close')">
    <div class="feature-locked-modal">
      <div class="feature-locked-modal__icon">
        🔒
      </div>
      
      <h2 class="feature-locked-modal__title">
        {{ featureName }} Not Available
      </h2>
      
      <p class="feature-locked-modal__message">
        This feature requires the {{ requiredPlan }} plan or higher.
        Upgrade now to unlock this and other premium features.
      </p>
      
      <div class="feature-locked-modal__actions">
        <button @click="handleUpgrade" class="btn btn--primary">
          Upgrade to {{ requiredPlan }}
        </button>
        <button @click="emit('close')" class="btn">
          Maybe Later
        </button>
      </div>
    </div>
  </Modal>
</template>
```

### Upgrade Prompt Composable

```typescript
// composables/useUpgradePrompt.ts
export function useUpgradePrompt() {
  const isOpen = ref(false)
  const feature = ref<FeatureKey | null>(null)
  const requiredPlan = ref<string>('')
  
  const showUpgradePrompt = (featureKey: FeatureKey, plan: string) => {
    feature.value = featureKey
    requiredPlan.value = plan
    isOpen.value = true
  }
  
  const closeUpgradePrompt = () => {
    isOpen.value = false
    feature.value = null
    requiredPlan.value = ''
  }
  
  return {
    isOpen: readonly(isOpen),
    feature: readonly(feature),
    requiredPlan: readonly(requiredPlan),
    showUpgradePrompt,
    closeUpgradePrompt
  }
}
```

## Best Practices

### 1. Check Features Early

```typescript
// ✅ Good - check before navigation
const navigateToAnalytics = () => {
  if (!hasFeature(FeatureKey.SALES_ANALYTICS)) {
    showUpgradePrompt()
    return
  }
  navigateTo('/analytics')
}

// ❌ Bad - navigate then check
const navigateToAnalytics = () => {
  navigateTo('/analytics')
  // User sees page then gets blocked
}
```

### 2. Provide Clear Upgrade Paths

```typescript
// ✅ Good - specific upgrade message
showToast(
  'Sales Analytics requires PRO plan. Upgrade now!',
  'info',
  { action: 'Upgrade', onClick: () => navigateTo('/subscription') }
)

// ❌ Bad - vague message
showToast('Feature not available', 'error')
```

### 3. Cache Feature Checks

```typescript
// ✅ Good - computed property
const canViewAnalytics = computed(() => hasFeature(FeatureKey.SALES_ANALYTICS))

// ❌ Bad - repeated checks
<div v-if="hasFeature(FeatureKey.SALES_ANALYTICS)">
  <div v-if="hasFeature(FeatureKey.SALES_ANALYTICS)">
    <!-- Duplicate checks -->
  </div>
</div>
```

### 4. Handle Plan Limits Gracefully

```typescript
// ✅ Good - show limit and upgrade option
if (!isWithinLimit('menuItems', currentCount)) {
  showToast(
    `You've reached your plan limit of ${planLimit} menu items`,
    'warning',
    { action: 'Upgrade', onClick: showUpgradePrompt }
  )
  return
}

// ❌ Bad - just block action
if (!isWithinLimit('menuItems', currentCount)) {
  return
}
```

### 5. Test All Plan Scenarios

```typescript
// Test with different plans
describe('Feature Access', () => {
  it('allows analytics for PRO plan', () => {
    mockPlan('PRO')
    expect(hasFeature(FeatureKey.SALES_ANALYTICS)).toBe(true)
  })
  
  it('blocks analytics for FREE plan', () => {
    mockPlan('FREE')
    expect(hasFeature(FeatureKey.SALES_ANALYTICS)).toBe(false)
  })
})
```

## Summary

The feature access control system provides:

- Plan-based feature restrictions
- Clear upgrade paths
- Graceful degradation
- Backend validation
- User-friendly messaging
- Flexible implementation

For more information, see:
- [Developer Guide](./DEVELOPER_GUIDE.md)
- [API Integration](./API_INTEGRATION.md)
- [Plan Features and Limits](./PLAN_FEATURES_LIMITS.md)
