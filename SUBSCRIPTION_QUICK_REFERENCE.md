# Subscription Management - Quick Reference

## Overview

The subscription management feature allows tenant admins to view their current subscription details, usage statistics, and compare available plans.

## Components

### SubscriptionDetails

Displays current subscription information including:
- Plan name and status (Trial, Active, Canceled, Expired)
- Pricing and billing cycle
- Start date and next billing date
- Plan features list
- Usage vs. limits with progress bars
- Upgrade and manage buttons

**Location:** `components/ui/SubscriptionDetails.vue`

**Props:**
- `subscription: Subscription` - Current subscription data
- `usage: UsageStats` - Current usage statistics

**Events:**
- `@upgrade` - Emitted when user clicks upgrade button
- `@manage` - Emitted when user clicks manage subscription button

**Usage:**
```vue
<SubscriptionDetails
  :subscription="subscription"
  :usage="usage"
  @upgrade="showPlanComparison = true"
  @manage="handleManageSubscription"
/>
```

### PlanComparisonTable

Displays a comparison table of all available plans with:
- Plan names and pricing
- Resource limits (users, locations, menu items, categories)
- Feature availability matrix
- Current plan indicator
- Upgrade/downgrade buttons

**Location:** `components/ui/PlanComparisonTable.vue`

**Props:**
- `plans: Plan[]` - Array of available plans
- `currentPlanId: string` - ID of the current plan

**Events:**
- `@select-plan` - Emitted when user selects a plan to upgrade/downgrade

**Usage:**
```vue
<PlanComparisonTable
  :plans="availablePlans"
  :current-plan-id="subscription.planId"
  @select-plan="handleSelectPlan"
/>
```

## Store

### useSubscriptionStore

Manages subscription and plan data.

**State:**
- `subscription: Subscription | null` - Current subscription
- `availablePlans: Plan[]` - Available plans
- `loading: boolean` - Loading state
- `error: string | null` - Error message

**Getters:**
- `currentPlan` - Current plan object
- `planName` - Current plan name (FREE, PRO, BUSINESS)
- `isFreePlan` - Boolean indicating if current plan is FREE
- `isProPlan` - Boolean indicating if current plan is PRO
- `isBusinessPlan` - Boolean indicating if current plan is BUSINESS
- `isActive` - Boolean indicating if subscription is active
- `isTrial` - Boolean indicating if subscription is in trial

**Actions:**
- `fetchSubscription()` - Fetch current subscription
- `fetchPlans()` - Fetch available plans
- `fetchUsageStats()` - Fetch usage statistics
- `clearSubscription()` - Clear subscription data

**Usage:**
```typescript
import { useSubscriptionStore } from '~/stores/subscription'

const subscriptionStore = useSubscriptionStore()

// Fetch subscription
await subscriptionStore.fetchSubscription()

// Check plan
if (subscriptionStore.isProPlan) {
  // PRO plan features
}

// Get usage stats
const stats = await subscriptionStore.fetchUsageStats()
```

## API Endpoints

### GET /subscription
Fetch current subscription details.

**Response:**
```json
{
  "id": "sub_123",
  "status": "ACTIVE",
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": "2024-02-01T00:00:00Z",
  "tenantId": "tenant_123",
  "planId": "plan_pro",
  "plan": {
    "id": "plan_pro",
    "name": "PRO",
    "displayName": "Pro Plan",
    "price": 49.99,
    "billingCycle": "month",
    "maxUsers": 5,
    "maxLocations": 3,
    "maxMenuItems": 500,
    "maxCategories": 50,
    "features": [...]
  }
}
```

### GET /subscription/plans
Fetch all available plans.

**Response:**
```json
[
  {
    "id": "plan_free",
    "name": "FREE",
    "displayName": "Free Plan",
    "price": 0,
    "billingCycle": "month",
    "maxUsers": 1,
    "maxLocations": 1,
    "maxMenuItems": 50,
    "maxCategories": 10,
    "features": [...]
  },
  ...
]
```

### GET /subscription/usage
Fetch current usage statistics.

**Response:**
```json
{
  "users": { "current": 2, "max": 5 },
  "locations": { "current": 1, "max": 3 },
  "menuItems": { "current": 45, "max": 500 },
  "categories": { "current": 8, "max": 50 }
}
```

## Page

### /subscription

Main subscription page that displays:
1. Current subscription details
2. Plan comparison table
3. Loading and error states

**Location:** `pages/subscription/index.vue`

**Features:**
- Loads subscription and plan data on mount
- Displays usage statistics with progress bars
- Shows plan comparison for upgrade options
- Handles upgrade and manage subscription actions

## Styling

All components follow the SCSS style guide:
- BEM methodology without nested selectors
- Variables for all colors, spacing, and other values
- Component-specific SCSS files co-located with components
- Responsive design with mobile breakpoints

**SCSS Files:**
- `components/ui/_subscription-details.scss`
- `components/ui/_plan-comparison-table.scss`

## Types

### Subscription
```typescript
interface Subscription {
  id: string
  status: SubscriptionStatus
  startDate: string
  endDate: string
  tenantId: string
  planId: string
  plan: Plan
}

enum SubscriptionStatus {
  TRIAL = 'TRIAL',
  ACTIVE = 'ACTIVE',
  CANCELED = 'CANCELED',
  EXPIRED = 'EXPIRED',
}
```

### Plan
```typescript
interface Plan {
  id: string
  name: string
  displayName: string
  price: number
  billingCycle: string
  maxUsers: number
  maxLocations: number
  maxMenuItems: number
  maxCategories: number
  features: PlanFeature[]
}
```

### UsageStats
```typescript
interface UsageStats {
  users: { current: number; max: number }
  locations: { current: number; max: number }
  menuItems: { current: number; max: number }
  categories: { current: number; max: number }
}
```

## Future Enhancements

1. **Payment Integration**: Integrate with Stripe or similar payment processor
2. **Plan Upgrade Flow**: Implement actual plan upgrade/downgrade functionality
3. **Billing History**: Display past invoices and payment history
4. **Payment Method Management**: Allow users to update payment methods
5. **Subscription Cancellation**: Implement subscription cancellation flow
6. **Trial Extension**: Allow trial period extensions
7. **Promo Codes**: Support discount codes and promotions
8. **Usage Alerts**: Send notifications when approaching plan limits

## Testing

To test the subscription feature:

1. Navigate to `/subscription` page
2. Verify subscription details are displayed correctly
3. Check usage progress bars show correct percentages
4. Verify plan comparison table displays all plans
5. Test upgrade button (currently shows alert)
6. Test manage subscription button (currently shows alert)
7. Verify responsive design on mobile devices

## Notes

- The upgrade and manage subscription actions currently show alerts
- Actual payment processing needs to be implemented
- Backend endpoints for subscription management need to be created
- Usage statistics are fetched from the backend
- Plan limits are enforced by the backend
