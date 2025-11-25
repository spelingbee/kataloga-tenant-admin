<template>
  <div class="plan-comparison">
    <h2 class="plan-comparison__title">Compare Plans</h2>
    <p class="plan-comparison__subtitle">Choose the plan that fits your business needs</p>

    <div class="plan-comparison__table">
      <div class="plan-comparison__plans">
        <div
          v-for="plan in plans"
          :key="plan.id"
          class="plan-comparison__plan"
          :class="{ 'plan-comparison__plan--current': isCurrentPlan(plan) }"
        >
          <div class="plan-comparison__plan-header">
            <h3 class="plan-comparison__plan-name">{{ plan.displayName }}</h3>
            <div class="plan-comparison__plan-price">
              <span class="plan-comparison__plan-amount">
                {{ plan.price === 0 ? 'Free' : `$${plan.price}` }}
              </span>
              <span v-if="plan.price > 0" class="plan-comparison__plan-cycle">
                / {{ plan.billingCycle }}
              </span>
            </div>
            <span v-if="isCurrentPlan(plan)" class="plan-comparison__current-badge">
              Current Plan
            </span>
          </div>

          <div class="plan-comparison__plan-limits">
            <div class="plan-comparison__limit-item">
              <span class="plan-comparison__limit-label">Users</span>
              <span class="plan-comparison__limit-value">
                {{ plan.maxUsers === -1 ? 'Unlimited' : plan.maxUsers }}
              </span>
            </div>
            <div class="plan-comparison__limit-item">
              <span class="plan-comparison__limit-label">Locations</span>
              <span class="plan-comparison__limit-value">
                {{ plan.maxLocations === -1 ? 'Unlimited' : plan.maxLocations }}
              </span>
            </div>
            <div class="plan-comparison__limit-item">
              <span class="plan-comparison__limit-label">Menu Items</span>
              <span class="plan-comparison__limit-value">
                {{ plan.maxMenuItems === -1 ? 'Unlimited' : plan.maxMenuItems }}
              </span>
            </div>
            <div class="plan-comparison__limit-item">
              <span class="plan-comparison__limit-label">Categories</span>
              <span class="plan-comparison__limit-value">
                {{ plan.maxCategories === -1 ? 'Unlimited' : plan.maxCategories }}
              </span>
            </div>
          </div>

          <div class="plan-comparison__plan-features">
            <h4 class="plan-comparison__features-title">Features</h4>
            <ul class="plan-comparison__features-list">
              <li
                v-for="feature in allFeatures"
                :key="feature.key"
                class="plan-comparison__feature-item"
              >
                <span
                  class="plan-comparison__feature-icon"
                  :class="{
                    'plan-comparison__feature-icon--enabled': hasFeature(plan, feature.key),
                    'plan-comparison__feature-icon--disabled': !hasFeature(plan, feature.key),
                  }"
                >
                  {{ hasFeature(plan, feature.key) ? '✓' : '✗' }}
                </span>
                <span class="plan-comparison__feature-text">{{ feature.label }}</span>
              </li>
            </ul>
          </div>

          <button
            v-if="!isCurrentPlan(plan)"
            class="plan-comparison__select-btn"
            @click="$emit('select-plan', plan)"
          >
            {{ plan.price === 0 ? 'Downgrade' : 'Upgrade' }}
          </button>
          <button
            v-else
            class="plan-comparison__current-btn"
            disabled
          >
            Current Plan
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Plan } from '~/types'

interface Props {
  plans: Plan[]
  currentPlanId: string
}

const props = defineProps<Props>()

defineEmits<{
  'select-plan': [plan: Plan]
}>()

const isCurrentPlan = (plan: Plan): boolean => {
  return plan.id === props.currentPlanId
}

const hasFeature = (plan: Plan, featureKey: string): boolean => {
  return plan.features?.some((f) => f.featureKey === featureKey && f.isEnabled) || false
}

const allFeatures = computed(() => [
  { key: 'sales_analytics', label: 'Sales Analytics' },
  { key: 'advanced_reporting', label: 'Advanced Reporting' },
  { key: 'api_access', label: 'API Access' },
  { key: 'custom_branding', label: 'Custom Branding' },
  { key: 'multi_location', label: 'Multi-Location' },
  { key: 'audit_trail', label: 'Audit Trail' },
  { key: 'data_export', label: 'Data Export' },
  { key: 'multi_user', label: 'Multi-User' },
  { key: 'priority_support', label: 'Priority Support' },
])
</script>

<style scoped lang="scss">
@use './plan-comparison-table';
</style>
