<template>
  <div class="sales-analytics-dashboard">
    <!-- Date Range Selector -->
    <div class="sales-analytics-dashboard__controls">
      <div class="date-range-selector">
        <label class="date-range-selector__label">Date Range:</label>
        <div class="date-range-selector__inputs">
          <input
            v-model="startDate"
            type="date"
            class="date-range-selector__input"
            @change="handleDateChange"
          />
          <span class="date-range-selector__separator">to</span>
          <input
            v-model="endDate"
            type="date"
            class="date-range-selector__input"
            @change="handleDateChange"
          />
        </div>
      </div>

      <div class="period-selector">
        <label class="period-selector__label">Period:</label>
        <select v-model="selectedPeriod" class="period-selector__select" @change="handlePeriodChange">
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>

      <button
        v-if="hasDataExport"
        class="export-button"
        :disabled="loading"
        @click="handleExport"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="export-button__icon"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
          />
        </svg>
        Export Data
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="sales-analytics-dashboard__loading">
      <div class="loading-spinner"></div>
      <p>Loading analytics data...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="sales-analytics-dashboard__error">
      <p>{{ error }}</p>
      <button @click="loadAnalytics">Retry</button>
    </div>

    <!-- Analytics Content -->
    <div v-else class="sales-analytics-dashboard__content">
      <!-- Overview Cards -->
      <div class="overview-cards">
        <div class="metric-card">
          <div class="metric-card__icon metric-card__icon--revenue">
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
                d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div class="metric-card__content">
            <p class="metric-card__label">Total Revenue</p>
            <p class="metric-card__value">{{ formatCurrency(totalRevenue) }}</p>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-card__icon metric-card__icon--orders">
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
                d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
              />
            </svg>
          </div>
          <div class="metric-card__content">
            <p class="metric-card__label">Total Orders</p>
            <p class="metric-card__value">{{ totalOrders }}</p>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-card__icon metric-card__icon--average">
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
                d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
              />
            </svg>
          </div>
          <div class="metric-card__content">
            <p class="metric-card__label">Average Order Value</p>
            <p class="metric-card__value">{{ formatCurrency(averageOrderValue) }}</p>
          </div>
        </div>
      </div>

      <!-- Charts Grid -->
      <div class="charts-grid">
        <!-- Sales Trend Chart -->
        <div class="chart-card">
          <h3 class="chart-card__title">Sales Trend</h3>
          <div class="chart-card__content">
            <SalesTrendChart :data="salesTrend" :period="selectedPeriod" />
          </div>
        </div>

        <!-- Top Selling Items -->
        <div class="chart-card">
          <h3 class="chart-card__title">Top Selling Items</h3>
          <div class="chart-card__content">
            <TopSellingItemsChart :items="topItems" />
          </div>
        </div>

        <!-- Category Performance -->
        <div class="chart-card chart-card--full">
          <h3 class="chart-card__title">Category Performance</h3>
          <div class="chart-card__content">
            <CategoryPerformanceChart :categories="categoryPerformance" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAnalyticsStore } from '~/stores/analytics'
import { useFeatureAccess } from '~/composables/useFeatureAccess'

const analyticsStore = useAnalyticsStore()
const { hasDataExport } = useFeatureAccess()

// Date range state
const today = new Date()
const thirtyDaysAgo = new Date(today)
thirtyDaysAgo.setDate(today.getDate() - 30)

const startDate = ref(thirtyDaysAgo.toISOString().split('T')[0])
const endDate = ref(today.toISOString().split('T')[0])
const selectedPeriod = ref<'daily' | 'weekly' | 'monthly'>('daily')

// Computed properties
const loading = computed(() => analyticsStore.loading)
const error = computed(() => analyticsStore.error)
const totalRevenue = computed(() => analyticsStore.totalRevenue)
const totalOrders = computed(() => analyticsStore.totalOrders)
const averageOrderValue = computed(() => analyticsStore.averageOrderValue)
const topItems = computed(() => analyticsStore.topItems)
const categoryPerformance = computed(() => analyticsStore.categoryPerformance)
const salesTrend = computed(() => analyticsStore.salesTrend)

// Methods
const loadAnalytics = async () => {
  const dateRange = {
    startDate: startDate.value,
    endDate: endDate.value,
  }
  await analyticsStore.fetchAllAnalytics(dateRange, selectedPeriod.value)
}

const handleDateChange = () => {
  loadAnalytics()
}

const handlePeriodChange = () => {
  loadAnalytics()
}

const handleExport = async () => {
  try {
    const dateRange = {
      startDate: startDate.value,
      endDate: endDate.value,
    }
    await analyticsStore.exportSalesData(dateRange, 'csv')
  } catch (error) {
    console.error('Export failed:', error)
  }
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value)
}

// Load analytics on mount
onMounted(() => {
  loadAnalytics()
})
</script>

<style scoped lang="scss">
@use '~/assets/scss/variables' as *;

.sales-analytics-dashboard {
  // Component styles
}

.sales-analytics-dashboard__controls {
  display: flex;
  gap: $spacing-lg;
  align-items: flex-end;
  margin-bottom: $spacing-xl;
  padding: $spacing-lg;
  background: $bg-primary;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
  flex-wrap: wrap;
}

.date-range-selector {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
  flex: 1;
  min-width: 300px;
}

.date-range-selector__label {
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  color: $text-secondary;
}

.date-range-selector__inputs {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
}

.date-range-selector__input {
  flex: 1;
  padding: $spacing-sm $spacing-md;
  border: 1px solid $border-color;
  border-radius: $radius-md;
  font-size: $font-size-base;
  color: $text-primary;
  transition: border-color $transition-base;

  &:focus {
    outline: none;
    border-color: $primary-color;
  }
}

.date-range-selector__separator {
  color: $text-secondary;
  font-size: $font-size-sm;
}

.period-selector {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.period-selector__label {
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  color: $text-secondary;
}

.period-selector__select {
  padding: $spacing-sm $spacing-md;
  border: 1px solid $border-color;
  border-radius: $radius-md;
  font-size: $font-size-base;
  color: $text-primary;
  background: $bg-primary;
  cursor: pointer;
  transition: border-color $transition-base;

  &:focus {
    outline: none;
    border-color: $primary-color;
  }
}

.export-button {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-sm $spacing-lg;
  background: $primary-color;
  color: $text-white;
  border: none;
  border-radius: $radius-md;
  font-size: $font-size-base;
  font-weight: $font-weight-medium;
  cursor: pointer;
  transition: background $transition-base;

  &:hover:not(:disabled) {
    background: $primary-dark;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.export-button__icon {
  width: 20px;
  height: 20px;
}

.sales-analytics-dashboard__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $spacing-3xl;
  color: $text-secondary;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid $border-color;
  border-top-color: $primary-color;
  border-radius: $radius-full;
  animation: spin 1s linear infinite;
  margin-bottom: $spacing-md;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.sales-analytics-dashboard__error {
  padding: $spacing-xl;
  text-align: center;
  color: $error-color;

  button {
    margin-top: $spacing-md;
    padding: $spacing-sm $spacing-lg;
    background: $primary-color;
    color: $text-white;
    border: none;
    border-radius: $radius-md;
    cursor: pointer;

    &:hover {
      background: $primary-dark;
    }
  }
}

.sales-analytics-dashboard__content {
  // Content styles
}

.overview-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: $spacing-lg;
  margin-bottom: $spacing-xl;
}

.metric-card {
  display: flex;
  gap: $spacing-md;
  padding: $spacing-lg;
  background: $bg-primary;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
  transition: box-shadow $transition-base;

  &:hover {
    box-shadow: $shadow-md;
  }
}

.metric-card__icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: $radius-md;
  flex-shrink: 0;

  svg {
    width: 24px;
    height: 24px;
  }
}

.metric-card__icon--revenue {
  background: rgba(16, 185, 129, 0.1);
  color: $success-color;
}

.metric-card__icon--orders {
  background: rgba(14, 165, 233, 0.1);
  color: $primary-color;
}

.metric-card__icon--average {
  background: rgba(245, 158, 11, 0.1);
  color: $warning-color;
}

.metric-card__content {
  flex: 1;
}

.metric-card__label {
  font-size: $font-size-sm;
  color: $text-secondary;
  margin: 0 0 $spacing-xs 0;
}

.metric-card__value {
  font-size: $font-size-2xl;
  font-weight: $font-weight-bold;
  color: $text-primary;
  margin: 0;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: $spacing-lg;
}

.chart-card {
  padding: $spacing-lg;
  background: $bg-primary;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
}

.chart-card--full {
  grid-column: 1 / -1;
}

.chart-card__title {
  font-size: $font-size-lg;
  font-weight: $font-weight-semibold;
  color: $text-primary;
  margin: 0 0 $spacing-lg 0;
}

.chart-card__content {
  min-height: 300px;
}

@media (max-width: $breakpoint-lg) {
  .charts-grid {
    grid-template-columns: 1fr;
  }

  .chart-card--full {
    grid-column: 1;
  }
}

@media (max-width: $breakpoint-md) {
  .sales-analytics-dashboard__controls {
    flex-direction: column;
    align-items: stretch;
  }

  .date-range-selector {
    min-width: auto;
  }

  .overview-cards {
    grid-template-columns: 1fr;
  }
}
</style>
