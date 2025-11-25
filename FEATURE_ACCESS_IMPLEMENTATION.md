# Feature Access Control Implementation Guide

This document describes the implementation of feature access control in the Tenant Admin Dashboard.

## Overview

The feature access control system restricts access to premium features based on the user's subscription plan (FREE, PRO, BUSINESS). It provides:

1. **Feature checking** - Verify if a user has access to a feature
2. **Upgrade prompts** - Show modal dialogs when users try to access locked features
3. **Visual indicators** - Display badges showing which plan is required
4. **Feature guards** - Wrap components to hide/show based on access

## Components

### 1. useFeatureAccess Composable

Location: `composables/useFeatureAccess.ts`

The main composable for checking feature access.

**Usage:**

```typescript
import { FeatureKey } from '~/types'

const { 
  hasFeature,
  requireFeature,
  hasSalesAnalytics,
  hasMultiLocation,
  hasMultiUser,
  redirectToUpgrade,
} = useFeatureAccess()

// Check if user has a feature
if (hasFeature(FeatureKey.SALES_ANALYTICS)) {
  // User has access
}

// Check and show modal if not available
requireFeature(FeatureKey.MULTI_LOCATION)

// Use computed properties
if (hasSalesAnalytics.value) {
  // Load analytics data
}
```

**Available Methods:**

- `hasFeature(featureKey)` - Returns boolean indicating if user has access
- `requireFeature(featureKey)` - Checks access and shows upgrade modal if not available
- `redirectToUpgrade(featureKey?)` - Navigate to subscription page
- `getRequiredPlan(featureKey)` - Get the plan name required for a feature
- `getFeatureName(featureKey)` - Get human-readable feature name

**Available Computed Properties:**

- `hasMultiLocation` - Multi-location support
- `hasSalesAnalytics` - Sales analytics dashboard
- `hasDataExport` - Data export functionality
- `hasMultiUser` - Multi-user access
- `hasAuditTrail` - Audit trail and change history
- `hasAdvancedReporting` - Advanced reporting
- `hasApiAccess` - API access
- `hasCustomBranding` - Custom branding
- `currentPlan` - Current subscription plan object
- `planName` - Current plan name (FREE, PRO, BUSINESS)
- `isFreePlan`, `isProPlan`, `isBusinessPlan` - Plan type checks

### 2. FeatureLockedModal Component

Location: `components/ui/FeatureLockedModal.vue`

A modal dialog that appears when users try to access a locked feature.

**Props:**

- `show` (boolean) - Whether to show the modal
- `featureKey` (FeatureKey | null) - The feature being requested
- `featureName` (string) - Human-readable feature name
- `currentPlan` (string) - User's current plan
- `requiredPlan` (string) - Plan required for the feature

**Events:**

- `@close` - Emitted when modal is closed
- `@upgrade` - Emitted when user clicks upgrade button

**Usage:**

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

The modal is automatically integrated into `app.vue` and controlled by the `useFeatureAccess` composable.

### 3. FeatureBadge Component

Location: `components/ui/FeatureBadge.vue`

A small badge that indicates which plan is required for a feature.

**Props:**

- `requiredPlan` ('PRO' | 'BUSINESS') - The plan required
- `variant` ('default' | 'compact') - Badge style

**Usage:**

```vue
<template>
  <div class="feature-item">
    <span>Sales Analytics</span>
    <FeatureBadge required-plan="PRO" />
  </div>
</template>
```

### 4. FeatureGuard Component

Location: `components/ui/FeatureGuard.vue`

A wrapper component that shows/hides content based on feature access.

**Props:**

- `feature` (FeatureKey) - The feature to check
- `showFallback` (boolean) - Whether to show a fallback UI when locked
- `fallbackTitle` (string) - Title for fallback UI
- `fallbackMessage` (string) - Message for fallback UI

**Usage:**

```vue
<template>
  <FeatureGuard 
    :feature="FeatureKey.SALES_ANALYTICS"
    fallback-title="Sales Analytics Locked"
    fallback-message="Upgrade to PRO to access sales analytics"
  >
    <!-- This content only shows if user has access -->
    <SalesAnalyticsDashboard />
  </FeatureGuard>
</template>
```

## Implementation Patterns

### Pattern 1: Page-Level Feature Check

Use this pattern for entire pages that require a feature.

```vue
<template>
  <div class="page">
    <!-- Show fallback UI if no access -->
    <div v-if="!hasFeature" class="locked-message">
      <h2>Feature Locked</h2>
      <p>Upgrade to access this feature</p>
      <button @click="redirectToUpgrade(featureKey)">
        Upgrade Now
      </button>
    </div>

    <!-- Show content if has access -->
    <div v-else class="content">
      <!-- Page content -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { FeatureKey } from '~/types'

const { hasFeature, requireFeature, redirectToUpgrade } = useFeatureAccess()
const featureKey = FeatureKey.SALES_ANALYTICS

// Check on mount and show modal if needed
onMounted(() => {
  if (!hasFeature(featureKey)) {
    requireFeature(featureKey)
  }
})
</script>
```

### Pattern 2: Component-Level Feature Guard

Use this pattern to wrap specific components.

```vue
<template>
  <div class="dashboard">
    <h1>Dashboard</h1>
    
    <!-- Basic stats (always visible) -->
    <BasicStats />
    
    <!-- Advanced analytics (PRO/BUSINESS only) -->
    <FeatureGuard 
      :feature="FeatureKey.SALES_ANALYTICS"
      fallback-title="Advanced Analytics"
      fallback-message="Upgrade to PRO for detailed analytics"
    >
      <AdvancedAnalytics />
    </FeatureGuard>
  </div>
</template>
```

### Pattern 3: Conditional Rendering with Badges

Use this pattern for navigation or feature lists.

```vue
<template>
  <nav class="sidebar">
    <NuxtLink to="/dashboard">Dashboard</NuxtLink>
    <NuxtLink to="/menu">Menu</NuxtLink>
    
    <NuxtLink 
      to="/analytics" 
      :class="{ 'locked': !hasSalesAnalytics }"
      @click.prevent="handleAnalyticsClick"
    >
      Analytics
      <FeatureBadge v-if="!hasSalesAnalytics" required-plan="PRO" />
    </NuxtLink>
    
    <NuxtLink 
      to="/locations"
      :class="{ 'locked': !hasMultiLocation }"
      @click.prevent="handleLocationsClick"
    >
      Locations
      <FeatureBadge v-if="!hasMultiLocation" required-plan="PRO" />
    </NuxtLink>
  </nav>
</template>

<script setup lang="ts">
import { FeatureKey } from '~/types'

const { 
  hasSalesAnalytics, 
  hasMultiLocation,
  requireFeature 
} = useFeatureAccess()

const router = useRouter()

const handleAnalyticsClick = () => {
  if (hasSalesAnalytics.value) {
    router.push('/analytics')
  } else {
    requireFeature(FeatureKey.SALES_ANALYTICS)
  }
}

const handleLocationsClick = () => {
  if (hasMultiLocation.value) {
    router.push('/locations')
  } else {
    requireFeature(FeatureKey.MULTI_LOCATION)
  }
}
</script>
```

### Pattern 4: Button/Action-Level Checks

Use this pattern for specific actions within a page.

```vue
<template>
  <div class="menu-page">
    <h1>Menu Management</h1>
    
    <!-- Basic actions (always available) -->
    <button @click="addItem">Add Item</button>
    
    <!-- Premium action (BUSINESS only) -->
    <button 
      @click="handleExport"
      :disabled="!hasDataExport"
      :title="hasDataExport ? 'Export data' : 'Upgrade to BUSINESS for export'"
    >
      Export Data
      <FeatureBadge v-if="!hasDataExport" required-plan="BUSINESS" variant="compact" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { FeatureKey } from '~/types'

const { hasDataExport, requireFeature } = useFeatureAccess()

const handleExport = () => {
  if (!requireFeature(FeatureKey.DATA_EXPORT)) {
    return // Modal will be shown
  }
  
  // Proceed with export
  exportData()
}
</script>
```

## Feature Keys

Available feature keys in `types/index.ts`:

```typescript
enum FeatureKey {
  SALES_ANALYTICS = 'sales_analytics',        // PRO+
  ADVANCED_REPORTING = 'advanced_reporting',  // BUSINESS
  API_ACCESS = 'api_access',                  // BUSINESS
  CUSTOM_BRANDING = 'custom_branding',        // BUSINESS
  MULTI_LOCATION = 'multi_location',          // PRO+
  AUDIT_TRAIL = 'audit_trail',                // PRO+
  DATA_EXPORT = 'data_export',                // BUSINESS
  MULTI_USER = 'multi_user',                  // PRO+
  PRIORITY_SUPPORT = 'priority_support',      // BUSINESS
}
```

## Plan Feature Matrix

| Feature | FREE | PRO | BUSINESS |
|---------|------|-----|----------|
| Basic Menu Management | ✅ | ✅ | ✅ |
| Sales Analytics | ❌ | ✅ | ✅ |
| Multi-Location | ❌ | ✅ (3) | ✅ (∞) |
| Multi-User | ❌ | ✅ (5) | ✅ (∞) |
| Audit Trail | ❌ | ✅ | ✅ |
| Data Export | ❌ | ❌ | ✅ |
| Advanced Reporting | ❌ | ❌ | ✅ |
| API Access | ❌ | ❌ | ✅ |
| Custom Branding | ❌ | ❌ | ✅ |

## Backend Integration

The feature access system relies on the backend API returning subscription data with plan features:

```typescript
// Expected API response from /subscription
{
  id: "sub_123",
  status: "ACTIVE",
  plan: {
    id: "plan_pro",
    name: "PRO",
    displayName: "Pro Plan",
    features: [
      {
        id: "feat_1",
        featureKey: "sales_analytics",
        isEnabled: true
      },
      {
        id: "feat_2",
        featureKey: "multi_location",
        isEnabled: true
      }
    ]
  }
}
```

## Testing

### Manual Testing Checklist

1. **FREE Plan User:**
   - [ ] Cannot access analytics page (shows modal)
   - [ ] Cannot access locations page (shows modal)
   - [ ] Cannot access team page (shows modal)
   - [ ] Export buttons are disabled
   - [ ] Feature badges show on locked features

2. **PRO Plan User:**
   - [ ] Can access analytics page
   - [ ] Can access locations page (up to 3)
   - [ ] Can access team page (up to 5 users)
   - [ ] Cannot export data (shows modal)
   - [ ] Cannot access API settings (shows modal)

3. **BUSINESS Plan User:**
   - [ ] Can access all features
   - [ ] No feature badges visible
   - [ ] No upgrade prompts
   - [ ] All export options available

### Unit Testing

```typescript
// Example test for useFeatureAccess
import { describe, it, expect, beforeEach } from 'vitest'
import { useFeatureAccess } from '~/composables/useFeatureAccess'
import { FeatureKey } from '~/types'

describe('useFeatureAccess', () => {
  it('should return false for locked features on FREE plan', () => {
    // Mock subscription store with FREE plan
    const { hasFeature } = useFeatureAccess()
    
    expect(hasFeature(FeatureKey.SALES_ANALYTICS)).toBe(false)
    expect(hasFeature(FeatureKey.MULTI_LOCATION)).toBe(false)
  })
  
  it('should return true for unlocked features on PRO plan', () => {
    // Mock subscription store with PRO plan
    const { hasFeature } = useFeatureAccess()
    
    expect(hasFeature(FeatureKey.SALES_ANALYTICS)).toBe(true)
    expect(hasFeature(FeatureKey.MULTI_LOCATION)).toBe(true)
  })
})
```

## Troubleshooting

### Modal not showing

1. Check that subscription data is loaded in the store
2. Verify `useFeatureAccess` is called correctly
3. Check browser console for errors
4. Ensure `FeatureLockedModal` is in `app.vue`

### Feature always shows as locked

1. Verify subscription API is returning correct data
2. Check that plan features array includes the feature
3. Ensure `featureKey` matches exactly (case-sensitive)
4. Check subscription store state in Vue DevTools

### Styling issues

1. Ensure SCSS variables are imported
2. Check that component styles are scoped
3. Verify z-index values for modal overlay
4. Test responsive breakpoints

## Future Enhancements

1. **Grace Period** - Allow limited access after subscription expires
2. **Feature Trials** - Enable features temporarily for trial
3. **Usage Tracking** - Track feature usage for analytics
4. **A/B Testing** - Test different upgrade prompts
5. **Inline Upgrades** - Allow upgrading without leaving the page
