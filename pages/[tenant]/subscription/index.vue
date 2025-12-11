<template>
  <div class="subscription-page">
    <div class="subscription-page__header">
      <h1 class="subscription-page__title">Subscription & Plans</h1>
      <p class="subscription-page__subtitle">Manage your subscription and explore available plans</p>
    </div>

    <div v-if="loading" class="subscription-page__loading">
      <p>Loading subscription information...</p>
    </div>

    <div v-else-if="error" class="subscription-page__error">
      <p>{{ error }}</p>
      <button @click="loadData" class="subscription-page__retry-btn">Retry</button>
    </div>

    <div v-else class="subscription-page__content">
      <SubscriptionDetails
        v-if="subscription"
        :subscription="subscription"
        :usage="usage"
        @upgrade="showPlanComparison = true"
        @manage="handleManageSubscription"
      />

      <PlanComparisonTable
        v-if="showPlanComparison && availablePlans.length > 0"
        :plans="availablePlans"
        :current-plan-id="subscription?.planId || ''"
        @select-plan="handleSelectPlan"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSubscriptionStore } from '~/stores/subscription'
import type { Plan } from '~/types'

definePageMeta({
  middleware: ['auth']
})

const subscriptionStore = useSubscriptionStore()

const loading = ref(true)
const error = ref<string | null>(null)
const showPlanComparison = ref(true)
const usage = ref({
  users: { current: 0, max: 0 },
  locations: { current: 0, max: 0 },
  menuItems: { current: 0, max: 0 },
  categories: { current: 0, max: 0 },
})

const subscription = computed(() => subscriptionStore.subscription)
const availablePlans = computed(() => subscriptionStore.availablePlans)

const loadData = async () => {
  loading.value = true
  error.value = null

  try {
    await Promise.all([
      subscriptionStore.fetchSubscription(),
      subscriptionStore.fetchPlans(),
    ])

    // Fetch usage stats
    const stats = await subscriptionStore.fetchUsageStats()
    usage.value = stats
  } catch (err: any) {
    error.value = err.message || 'Failed to load subscription information'
  } finally {
    loading.value = false
  }
}

const handleManageSubscription = () => {
  // TODO: Implement subscription management (e.g., cancel, update payment method)
  alert('Subscription management will be implemented in a future update')
}

const handleSelectPlan = (plan: Plan) => {
  // TODO: Implement plan upgrade/downgrade flow
  alert(`Plan upgrade to ${plan.displayName} will be implemented in a future update`)
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
@use '@/assets/scss/variables' as *;

.subscription-page {
  padding: $spacing-xl;
  min-height: 100vh;
  background: $bg-secondary;
}

.subscription-page__header {
  margin-bottom: $spacing-xl;
}

.subscription-page__title {
  font-size: 2rem;
  font-weight: 700;
  color: $text-primary;
  margin: 0 0 $spacing-xs;
}

.subscription-page__subtitle {
  font-size: 1rem;
  color: $text-secondary;
  margin: 0;
}

.subscription-page__loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  background: $bg-primary;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;

  p {
    font-size: 1rem;
    color: $text-secondary;
  }
}

.subscription-page__error {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: $spacing-md;
  min-height: 400px;
  background: $bg-primary;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;

  p {
    font-size: 1rem;
    color: $error-color;
  }
}

.subscription-page__retry-btn {
  padding: $spacing-sm $spacing-lg;
  background: $primary-color;
  color: $bg-primary;
  border: none;
  border-radius: $radius-md;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background $transition-base;

  &:hover {
    background: darken($primary-color, 10%);
  }
}

.subscription-page__content {
  display: flex;
  flex-direction: column;
  gap: $spacing-xl;
}
</style>
