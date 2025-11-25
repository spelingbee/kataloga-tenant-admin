<template>
  <div class="menu-item-sales-history">
    <!-- Header with Item Info -->
    <div class="sales-history-header">
      <div class="sales-history-header__info">
        <h2 class="sales-history-header__title">{{ itemName }}</h2>
        <p class="sales-history-header__subtitle">Sales History</p>
      </div>
      <button class="sales-history-header__close" @click="$emit('close')">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Date Range Filter -->
    <div class="sales-history-controls">
      <div class="date-range-filter">
        <label class="date-range-filter__label">Date Range:</label>
        <div class="date-range-filter__inputs">
          <input
            v-model="startDate"
            type="date"
            class="date-range-filter__input"
            @change="handleDateChange"
          />
          <span class="date-range-filter__separator">to</span>
          <input
            v-model="endDate"
            type="date"
            class="date-range-filter__input"
            @change="handleDateChange"
          />
        </div>
      </div>

      <button
        v-if="hasDataExport"
        class="export-csv-button"
        :disabled="loading"
        @click="handleExport"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="export-csv-button__icon"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
          />
        </svg>
        Export to CSV
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="sales-history-loading">
      <div class="loading-spinner"></div>
      <p>Loading sales history...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="sales-history-error">
      <p>{{ error }}</p>
      <button @click="loadSalesHistory">Retry</button>
    </div>

    <!-- Content -->
    <div v-else-if="salesHistory" class="sales-history-content">
      <!-- Summary Cards -->
      <div class="summary-cards">
        <div class="summary-card">
          <div class="summary-card__icon summary-card__icon--quantity">
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
                d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z"
              />
            </svg>
          </div>
          <div class="summary-card__content">
            <p class="summary-card__label">Total Quantity Sold</p>
            <p class="summary-card__value">{{ salesHistory.totalQuantity }}</p>
          </div>
        </div>

        <div class="summary-card">
          <div class="summary-card__icon summary-card__icon--revenue">
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
          <div class="summary-card__content">
            <p class="summary-card__label">Total Revenue</p>
            <p class="summary-card__value">{{ formatCurrency(salesHistory.totalRevenue) }}</p>
          </div>
        </div>
      </div>

      <!-- Sales Trend Chart -->
      <div class="chart-section">
        <h3 class="chart-section__title">Sales Trend</h3>
        <div class="chart-section__content">
          <ItemSalesTrendChart :sales="salesHistory.sales" />
        </div>
      </div>

      <!-- Sales History Table -->
      <div class="sales-table-section">
        <h3 class="sales-table-section__title">Sales Records</h3>
        <div class="sales-table">
          <div class="sales-table__header">
            <div class="sales-table__header-cell">Date</div>
            <div class="sales-table__header-cell">Quantity</div>
            <div class="sales-table__header-cell">Revenue</div>
          </div>
          <div v-if="salesHistory.sales.length === 0" class="sales-table__empty">
            <p>No sales records found for the selected period.</p>
          </div>
          <div v-else class="sales-table__body">
            <div
              v-for="sale in salesHistory.sales"
              :key="sale.id"
              class="sales-table__row"
            >
              <div class="sales-table__cell">{{ formatDate(sale.date) }}</div>
              <div class="sales-table__cell">{{ sale.quantity }}</div>
              <div class="sales-table__cell">{{ formatCurrency(sale.totalAmount) }}</div>
            </div>
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

interface Props {
  menuItemId: string
  menuItemName?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
}>()

const analyticsStore = useAnalyticsStore()
const { hasDataExport } = useFeatureAccess()

// Date range state
const today = new Date()
const thirtyDaysAgo = new Date(today)
thirtyDaysAgo.setDate(today.getDate() - 30)

const startDate = ref(thirtyDaysAgo.toISOString().split('T')[0])
const endDate = ref(today.toISOString().split('T')[0])

// Computed properties
const loading = computed(() => analyticsStore.loading)
const error = computed(() => analyticsStore.error)
const salesHistory = computed(() => analyticsStore.itemSalesHistory)
const itemName = computed(() => props.menuItemName || salesHistory.value?.menuItemName || 'Menu Item')

// Methods
const loadSalesHistory = async () => {
  const dateRange = {
    startDate: startDate.value,
    endDate: endDate.value,
  }
  await analyticsStore.fetchItemSalesHistory(props.menuItemId, dateRange)
}

const handleDateChange = () => {
  loadSalesHistory()
}

const handleExport = async () => {
  try {
    const dateRange = {
      startDate: startDate.value,
      endDate: endDate.value,
    }
    await analyticsStore.exportItemSalesHistory(props.menuItemId, dateRange)
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

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

// Load sales history on mount
onMounted(() => {
  loadSalesHistory()
})
</script>

<style scoped lang="scss">
@use '~/assets/scss/variables' as *;

.menu-item-sales-history {
  // Component styles
}

.sales-history-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: $spacing-xl;
  padding-bottom: $spacing-lg;
  border-bottom: 1px solid $border-color;
}

.sales-history-header__info {
  flex: 1;
}

.sales-history-header__title {
  font-size: $font-size-2xl;
  font-weight: $font-weight-bold;
  color: $text-primary;
  margin: 0 0 $spacing-xs 0;
}

.sales-history-header__subtitle {
  font-size: $font-size-base;
  color: $text-secondary;
  margin: 0;
}

.sales-history-header__close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: $radius-md;
  color: $text-secondary;
  cursor: pointer;
  transition: all $transition-base;

  svg {
    width: 20px;
    height: 20px;
  }

  &:hover {
    background: $bg-secondary;
    color: $text-primary;
  }
}

.sales-history-controls {
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

.date-range-filter {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
  flex: 1;
  min-width: 300px;
}

.date-range-filter__label {
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  color: $text-secondary;
}

.date-range-filter__inputs {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
}

.date-range-filter__input {
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

.date-range-filter__separator {
  color: $text-secondary;
  font-size: $font-size-sm;
}

.export-csv-button {
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

.export-csv-button__icon {
  width: 20px;
  height: 20px;
}

.sales-history-loading {
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

.sales-history-error {
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

.sales-history-content {
  // Content styles
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: $spacing-lg;
  margin-bottom: $spacing-xl;
}

.summary-card {
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

.summary-card__icon {
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

.summary-card__icon--quantity {
  background: rgba(14, 165, 233, 0.1);
  color: $primary-color;
}

.summary-card__icon--revenue {
  background: rgba(16, 185, 129, 0.1);
  color: $success-color;
}

.summary-card__content {
  flex: 1;
}

.summary-card__label {
  font-size: $font-size-sm;
  color: $text-secondary;
  margin: 0 0 $spacing-xs 0;
}

.summary-card__value {
  font-size: $font-size-2xl;
  font-weight: $font-weight-bold;
  color: $text-primary;
  margin: 0;
}

.chart-section {
  padding: $spacing-lg;
  background: $bg-primary;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
  margin-bottom: $spacing-xl;
}

.chart-section__title {
  font-size: $font-size-lg;
  font-weight: $font-weight-semibold;
  color: $text-primary;
  margin: 0 0 $spacing-lg 0;
}

.chart-section__content {
  min-height: 300px;
}

.sales-table-section {
  padding: $spacing-lg;
  background: $bg-primary;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
}

.sales-table-section__title {
  font-size: $font-size-lg;
  font-weight: $font-weight-semibold;
  color: $text-primary;
  margin: 0 0 $spacing-lg 0;
}

.sales-table {
  border: 1px solid $border-color;
  border-radius: $radius-md;
  overflow: hidden;
}

.sales-table__header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  background: $bg-secondary;
  border-bottom: 1px solid $border-color;
}

.sales-table__header-cell {
  padding: $spacing-md;
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
  color: $text-primary;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.sales-table__empty {
  padding: $spacing-3xl;
  text-align: center;
  color: $text-secondary;

  p {
    margin: 0;
  }
}

.sales-table__body {
  // Body styles
}

.sales-table__row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  border-bottom: 1px solid $border-color;
  transition: background $transition-base;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: $bg-secondary;
  }
}

.sales-table__cell {
  padding: $spacing-md;
  font-size: $font-size-base;
  color: $text-primary;
}

@media (max-width: $breakpoint-md) {
  .sales-history-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .date-range-filter {
    min-width: auto;
  }

  .summary-cards {
    grid-template-columns: 1fr;
  }

  .sales-table__header {
    grid-template-columns: 2fr 1fr 1fr;
  }

  .sales-table__row {
    grid-template-columns: 2fr 1fr 1fr;
  }

  .sales-table__header-cell {
    padding: $spacing-sm;
    font-size: $font-size-xs;
  }

  .sales-table__cell {
    padding: $spacing-sm;
    font-size: $font-size-sm;
  }
}
</style>
