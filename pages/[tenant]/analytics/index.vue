<template>
  <div class="analytics-page">
    <div class="analytics-page__header">
      <h1 class="analytics-page__title">Sales Analytics</h1>
      <p class="analytics-page__subtitle">
        Track your sales performance and business insights
      </p>
    </div>

    <!-- Feature Access Check -->
    <div v-if="!hasSalesAnalytics" class="analytics-page__upgrade">
      <div class="upgrade-prompt">
        <div class="upgrade-prompt__icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
            />
          </svg>
        </div>
        <h2 class="upgrade-prompt__title">Upgrade to Access Sales Analytics</h2>
        <p class="upgrade-prompt__description">
          Sales analytics is available on PRO and BUSINESS plans. Upgrade now to track your
          sales performance, view top-selling items, and make data-driven decisions.
        </p>
        <button class="upgrade-prompt__button" @click="navigateToSubscription">
          View Plans & Upgrade
        </button>
      </div>
    </div>

    <!-- Analytics Dashboard -->
    <div v-else class="analytics-page__content">
      <SalesAnalyticsDashboard />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { FeatureKey } from '~/types'

definePageMeta({
  middleware: 'auth',
  layout: 'default',
})

const { hasSalesAnalytics, requireFeature } = useFeatureAccess()
const router = useRouter()

// Check feature access on mount and show modal if needed
onMounted(() => {
  if (!hasSalesAnalytics.value) {
    requireFeature(FeatureKey.SALES_ANALYTICS)
  }
})

const { navigateToTenant } = useNavigation()

const navigateToSubscription = () => {
  navigateToTenant('/subscription')
}
</script>

<style scoped lang="scss">
@use '~/assets/scss/variables' as *;

.analytics-page {
  padding: $spacing-xl;
  max-width: $max-content-width;
  margin: 0 auto;
}

.analytics-page__header {
  margin-bottom: $spacing-xl;
}

.analytics-page__title {
  font-size: $font-size-3xl;
  font-weight: $font-weight-bold;
  color: $text-primary;
  margin: 0 0 $spacing-sm 0;
}

.analytics-page__subtitle {
  font-size: $font-size-lg;
  color: $text-secondary;
  margin: 0;
}

.analytics-page__upgrade {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.upgrade-prompt {
  max-width: 500px;
  text-align: center;
  padding: $spacing-2xl;
  background: $bg-primary;
  border-radius: $radius-lg;
  box-shadow: $shadow-lg;
}

.upgrade-prompt__icon {
  width: 80px;
  height: 80px;
  margin: 0 auto $spacing-lg;
  padding: $spacing-lg;
  background: linear-gradient(135deg, $primary-light 0%, $primary-color 100%);
  border-radius: $radius-full;
  color: $text-white;

  svg {
    width: 100%;
    height: 100%;
  }
}

.upgrade-prompt__title {
  font-size: $font-size-2xl;
  font-weight: $font-weight-bold;
  color: $text-primary;
  margin: 0 0 $spacing-md 0;
}

.upgrade-prompt__description {
  font-size: $font-size-base;
  color: $text-secondary;
  line-height: $line-height-relaxed;
  margin: 0 0 $spacing-xl 0;
}

.upgrade-prompt__button {
  padding: $spacing-md $spacing-xl;
  background: $primary-color;
  color: $text-white;
  border: none;
  border-radius: $radius-md;
  font-size: $font-size-base;
  font-weight: $font-weight-semibold;
  cursor: pointer;
  transition: background $transition-base;

  &:hover {
    background: $primary-dark;
  }

  &:active {
    transform: translateY(1px);
  }
}

.analytics-page__content {
  // Content styles handled by child component
}

@media (max-width: $breakpoint-md) {
  .analytics-page {
    padding: $spacing-lg;
  }

  .analytics-page__title {
    font-size: $font-size-2xl;
  }

  .analytics-page__subtitle {
    font-size: $font-size-base;
  }

  .upgrade-prompt {
    padding: $spacing-xl;
  }

  .upgrade-prompt__icon {
    width: 60px;
    height: 60px;
  }

  .upgrade-prompt__title {
    font-size: $font-size-xl;
  }
}
</style>
