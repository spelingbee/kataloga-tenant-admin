# Feature Access Control - Quick Reference

## Import

```typescript
import { FeatureKey } from '~/types'
const { hasFeature, requireFeature, hasSalesAnalytics } = useFeatureAccess()
```

## Check Feature Access

```typescript
// Method 1: Direct check
if (hasFeature(FeatureKey.SALES_ANALYTICS)) {
  // User has access
}

// Method 2: Computed property
if (hasSalesAnalytics.value) {
  // User has access
}

// Method 3: Check and show modal
requireFeature(FeatureKey.MULTI_LOCATION) // Shows modal if no access
```

## Available Features

```typescript
FeatureKey.SALES_ANALYTICS      // PRO+
FeatureKey.MULTI_LOCATION       // PRO+
FeatureKey.MULTI_USER           // PRO+
FeatureKey.AUDIT_TRAIL          // PRO+
FeatureKey.DATA_EXPORT          // BUSINESS
FeatureKey.ADVANCED_REPORTING   // BUSINESS
FeatureKey.API_ACCESS           // BUSINESS
FeatureKey.CUSTOM_BRANDING      // BUSINESS
FeatureKey.PRIORITY_SUPPORT     // BUSINESS
```

## Components

### FeatureGuard

```vue
<FeatureGuard :feature="FeatureKey.SALES_ANALYTICS">
  <SalesAnalyticsDashboard />
</FeatureGuard>
```

### FeatureBadge

```vue
<FeatureBadge required-plan="PRO" />
<FeatureBadge required-plan="BUSINESS" variant="compact" />
```

### FeatureLockedModal

```vue
<FeatureLockedModal
  :show="showModal"
  :feature-key="FeatureKey.SALES_ANALYTICS"
  feature-name="Sales Analytics"
  current-plan="FREE"
  required-plan="PRO"
  @close="showModal = false"
  @upgrade="handleUpgrade"
/>
```

## Page-Level Protection

```vue
<script setup lang="ts">
import { onMounted } from 'vue'
import { FeatureKey } from '~/types'

const { hasFeature, requireFeature } = useFeatureAccess()

onMounted(() => {
  if (!hasFeature(FeatureKey.SALES_ANALYTICS)) {
    requireFeature(FeatureKey.SALES_ANALYTICS)
  }
})
</script>
```

## Conditional Rendering

```vue
<template>
  <div v-if="!hasSalesAnalytics" class="locked">
    <p>Upgrade to access this feature</p>
    <button @click="redirectToUpgrade(FeatureKey.SALES_ANALYTICS)">
      Upgrade
    </button>
  </div>
  
  <div v-else>
    <!-- Feature content -->
  </div>
</template>
```

## Button with Badge

```vue
<button 
  @click="handleExport"
  :disabled="!hasDataExport"
>
  Export
  <FeatureBadge v-if="!hasDataExport" required-plan="BUSINESS" />
</button>
```

## Navigation with Lock

```vue
<NuxtLink 
  to="/analytics"
  :class="{ 'locked': !hasSalesAnalytics }"
  @click.prevent="handleClick"
>
  Analytics
  <FeatureBadge v-if="!hasSalesAnalytics" required-plan="PRO" />
</NuxtLink>

<script setup lang="ts">
const handleClick = () => {
  if (!hasSalesAnalytics.value) {
    requireFeature(FeatureKey.SALES_ANALYTICS)
  } else {
    router.push('/analytics')
  }
}
</script>
```

## Computed Properties

```typescript
const {
  // Feature checks
  hasMultiLocation,
  hasSalesAnalytics,
  hasDataExport,
  hasMultiUser,
  hasAuditTrail,
  hasAdvancedReporting,
  hasApiAccess,
  hasCustomBranding,
  
  // Plan info
  currentPlan,
  planName,
  isFreePlan,
  isProPlan,
  isBusinessPlan,
} = useFeatureAccess()
```

## Redirect to Upgrade

```typescript
// Redirect with feature context
redirectToUpgrade(FeatureKey.SALES_ANALYTICS)

// Redirect without context
redirectToUpgrade()
```

## Get Feature Info

```typescript
// Get required plan name
const plan = getRequiredPlan(FeatureKey.SALES_ANALYTICS) // "PRO"

// Get feature display name
const name = getFeatureName(FeatureKey.SALES_ANALYTICS) // "Sales Analytics"
```
