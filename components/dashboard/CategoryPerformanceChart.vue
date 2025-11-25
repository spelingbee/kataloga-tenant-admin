<template>
  <div class="category-performance-chart">
    <div v-if="!hasData" class="category-performance-chart__empty">
      <p>No category data available</p>
    </div>
    <div v-else class="category-performance-chart__content">
      <!-- Bar Chart -->
      <div class="chart-container">
        <div
          v-for="category in categories"
          :key="category.categoryId"
          class="category-bar"
        >
          <div class="category-bar__label">
            <span class="category-name">{{ category.categoryName }}</span>
            <span class="category-items">{{ category.itemCount }} items</span>
          </div>
          <div class="category-bar__visual">
            <div
              class="bar-fill"
              :style="{
                width: getBarWidth(category.revenue) + '%',
                background: getBarColor(category.revenue),
              }"
            >
              <span class="bar-value">{{ formatCurrency(category.revenue) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Summary Stats -->
      <div class="summary-stats">
        <div class="stat-card">
          <p class="stat-card__label">Total Categories</p>
          <p class="stat-card__value">{{ categories.length }}</p>
        </div>
        <div class="stat-card">
          <p class="stat-card__label">Total Revenue</p>
          <p class="stat-card__value">{{ formatCurrency(totalRevenue) }}</p>
        </div>
        <div class="stat-card">
          <p class="stat-card__label">Avg per Category</p>
          <p class="stat-card__value">{{ formatCurrency(averageRevenue) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CategoryPerformance } from '~/types'

interface Props {
  categories: CategoryPerformance[]
}

const props = defineProps<Props>()

const hasData = computed(() => props.categories && props.categories.length > 0)

const maxRevenue = computed(() => {
  if (!hasData.value) return 0
  return Math.max(...props.categories.map((cat) => cat.revenue))
})

const totalRevenue = computed(() => {
  if (!hasData.value) return 0
  return props.categories.reduce((sum, cat) => sum + cat.revenue, 0)
})

const averageRevenue = computed(() => {
  if (!hasData.value) return 0
  return totalRevenue.value / props.categories.length
})

const getBarWidth = (revenue: number): number => {
  if (maxRevenue.value === 0) return 0
  return (revenue / maxRevenue.value) * 100
}

const getBarColor = (revenue: number): string => {
  const percentage = (revenue / maxRevenue.value) * 100
  if (percentage >= 80) {
    return 'linear-gradient(90deg, #10b981 0%, #34d399 100%)'
  } else if (percentage >= 50) {
    return 'linear-gradient(90deg, #0ea5e9 0%, #38bdf8 100%)'
  } else if (percentage >= 30) {
    return 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)'
  }
  return 'linear-gradient(90deg, #64748b 0%, #94a3b8 100%)'
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value)
}
</script>

<style scoped lang="scss">
@use '~/assets/scss/variables' as *;

.category-performance-chart {
  width: 100%;
}

.category-performance-chart__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  color: $text-secondary;
  font-size: $font-size-base;
}

.category-performance-chart__content {
  display: flex;
  flex-direction: column;
  gap: $spacing-xl;
}

.chart-container {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
}

.category-bar {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.category-bar__label {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.category-name {
  font-size: $font-size-base;
  font-weight: $font-weight-medium;
  color: $text-primary;
}

.category-items {
  font-size: $font-size-sm;
  color: $text-secondary;
}

.category-bar__visual {
  height: 40px;
  background: $bg-secondary;
  border-radius: $radius-md;
  overflow: hidden;
  position: relative;
}

.bar-fill {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 $spacing-md;
  border-radius: $radius-md;
  transition: width $transition-slow;
  min-width: 80px;
}

.bar-value {
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
  color: $text-white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: $spacing-md;
  padding-top: $spacing-lg;
  border-top: 1px solid $border-color;
}

.stat-card {
  text-align: center;
  padding: $spacing-md;
  background: $bg-secondary;
  border-radius: $radius-md;
}

.stat-card__label {
  font-size: $font-size-sm;
  color: $text-secondary;
  margin: 0 0 $spacing-xs 0;
}

.stat-card__value {
  font-size: $font-size-xl;
  font-weight: $font-weight-bold;
  color: $text-primary;
  margin: 0;
}

@media (max-width: $breakpoint-md) {
  .category-bar__label {
    flex-direction: column;
    align-items: flex-start;
    gap: $spacing-xs;
  }

  .summary-stats {
    grid-template-columns: 1fr;
  }
}
</style>
