<template>
  <div class="orders-page">
    <PageHeader 
      :title="t('orders.title')" 
      :subtitle="t('orders.subtitle')"
      :back-label="t('dashboard.title')"
      @back="goBack"
    />

    <!-- Loading State -->
    <div v-if="orderStore.loading && orderStore.orders.length === 0" class="orders-page__loading">
      <div class="loading-spinner" />
      <p>{{ t('common.loading') }}</p>
    </div>

    <!-- Error State -->
    <div v-else-if="orderStore.error" class="orders-page__error">
      <p>{{ orderStore.error }}</p>
      <button @click="refreshData">{{ t('common.retry') }}</button>
    </div>

    <!-- Orders Content -->
    <div v-else class="orders-page__content">
      <!-- Order Stats -->
      <div class="order-stats">
        <div class="stat-card">
          <div class="stat-card__icon stat-card__icon--pending">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="stat-card__content">
            <p class="stat-card__label">{{ t('orders.pendingOrders') }}</p>
            <p class="stat-card__value">{{ orderStore.stats.pending || 0 }}</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-card__icon stat-card__icon--confirmed">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="stat-card__content">
            <p class="stat-card__label">{{ t('orders.confirmedOrders') }}</p>
            <p class="stat-card__value">{{ orderStore.stats.confirmed || 0 }}</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-card__icon stat-card__icon--revenue">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="stat-card__content">
            <p class="stat-card__label">{{ t('orders.todayRevenue') }}</p>
            <p class="stat-card__value">{{ formatCurrency(orderStore.stats.todayRevenue || 0) }}</p>
          </div>
        </div>
      </div>

      <!-- Orders List -->
      <div class="orders-list">
        <div class="orders-list__header">
          <h2 class="orders-list__title">{{ t('orders.recentOrders') }}</h2>
          <div class="orders-list__filters">
            <select v-model="statusFilter" class="filter-select">
              <option value="">{{ t('orders.allOrders') }}</option>
              <option value="PENDING">{{ t('orders.status.pending') }}</option>
              <option value="CONFIRMED">{{ t('orders.status.confirmed') }}</option>
              <option value="PREPARING">{{ t('orders.status.preparing') }}</option>
              <option value="READY">{{ t('orders.status.ready') }}</option>
              <option value="DELIVERED">{{ t('orders.status.delivered') }}</option>
              <option value="CANCELLED">{{ t('orders.status.cancelled') }}</option>
            </select>
          </div>
        </div>

        <div v-if="filteredOrders.length === 0" class="orders-list__empty">
          <p>{{ t('orders.noOrders') }}</p>
          <p class="orders-list__empty-subtitle">{{ t('orders.ordersWillAppear') }}</p>
        </div>

        <div v-else class="orders-list__items">
          <div
            v-for="order in filteredOrders"
            :key="order.id"
            class="order-item"
            :class="`order-item--${order.status.toLowerCase()}`"
          >
            <div class="order-item__header">
              <div class="order-item__info">
                <h3 class="order-item__number">{{ t('orders.orderNumber', { orderNumber: order.orderNumber }) }}</h3>
                <p class="order-item__time">{{ formatTime(order.createdAt) }}</p>
              </div>
              <div class="order-item__status">
                <span class="status-badge" :class="`status-badge--${order.status.toLowerCase()}`">
                  {{ t(`orders.status.${order.status.toLowerCase()}`) }}
                </span>
              </div>
            </div>

            <div class="order-item__details">
              <div class="order-item__customer">
                <p><strong>{{ t('orders.customer') }}</strong> {{ order.customerName || t('orders.anonymous') }}</p>
                <p v-if="order.customerPhone"><strong>{{ t('orders.phone') }}</strong> {{ order.customerPhone }}</p>
              </div>
              
              <div class="order-item__items">
                <p><strong>{{ t('orders.items') }}</strong></p>
                <ul class="order-item__items-list">
                  <li v-for="item in order.items" :key="item.id">
                    {{ item.quantity }}x {{ item.product?.name || 'Item' }} - {{ formatCurrency(item.price) }}
                  </li>
                </ul>
              </div>

              <div class="order-item__payment">
                <p><strong>{{ t('orders.payment') }}</strong> {{ order.paymentMethod || t('orders.payment.cash') }} - {{ order.paymentStatus || t('orders.payment.pending') }}</p>
                <p><strong>{{ t('common.total') }}:</strong> {{ formatCurrency(order.total) }}</p>
              </div>
            </div>

            <div v-if="order.status === 'PENDING'" class="order-item__actions">
              <button 
                class="action-btn action-btn--confirm" 
                @click="confirmOrder(order.id)"
                :disabled="orderStore.actionLoading"
              >
                {{ t('orders.confirmOrder') }}
              </button>
              <button 
                class="action-btn action-btn--reject" 
                @click="rejectOrder(order.id)"
                :disabled="orderStore.actionLoading"
              >
                {{ t('orders.rejectOrder') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useOrderStore } from '~/stores/order'
import { useNavigation } from '~/composables/useNavigation'
import {PageHeader} from "~/components/ui";

const { t } = useI18n()

definePageMeta({
  middleware: ['auth']
})

const { navigateToTenant } = useNavigation()
const orderStore = useOrderStore()

const statusFilter = ref('')

const filteredOrders = computed(() => {
  if (!statusFilter.value) return orderStore.orders
  return orderStore.orders.filter(order => order.status === statusFilter.value)
})

const { formatCurrency } = useCurrency()

const formatTime = (timestamp: string): string => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  
  if (minutes < 1) return t('dashboard.justNow')
  if (minutes < 60) return t('dashboard.minutesAgo', { minutes })
  
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return t('dashboard.hoursAgo', { hours })
  
  const days = Math.floor(hours / 24)
  return t('dashboard.daysAgo', { days })
}

const confirmOrder = async (orderId: string) => {
  try {
    await orderStore.updateOrderStatus(orderId, 'CONFIRMED' as any)
  } catch (error) {
    alert(t('orders.confirmFailed'))
  }
}

const rejectOrder = async (orderId: string) => {
  try {
    await orderStore.updateOrderStatus(orderId, 'CANCELLED' as any)
  } catch (error) {
    alert(t('orders.rejectFailed'))
  }
}

const refreshData = async () => {
  try {
    await Promise.all([
      orderStore.fetchOrders(),
      orderStore.fetchOrderStats()
    ])
  } catch (err) {
    console.error('Failed to load orders data')
  }
}

const goBack = () => {
  navigateToTenant('/')
}

onMounted(() => {
  refreshData()
})
</script>

<style scoped lang="scss">
@use '@/assets/scss/variables' as *;


.orders-page {
  padding: $spacing-xl;
  max-width: 1200px;
  margin: 0 auto;
  min-height: 100vh;
  background: $bg-secondary;
}

.orders-page__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: $spacing-xl;
}

.orders-page__header-left {
  display: flex;
  align-items: flex-start;
  gap: $spacing-lg;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  padding: $spacing-xs $spacing-sm;
  background: transparent;
  border: 1px solid $border-color;
  border-radius: $radius-md;
  color: $text-secondary;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  cursor: pointer;
  transition: all $transition-base;
  margin-top: 4px;

  svg {
    width: 16px;
    height: 16px;
  }

  &:hover {
    background: $bg-secondary;
    color: $primary-color;
    border-color: $primary-color;
  }
}

.orders-page__title {
  margin: 0 0 $spacing-xs 0;
  font-size: $font-size-3xl;
  font-weight: $font-weight-bold;
  color: $text-primary;
}

.orders-page__subtitle {
  margin: 0;
  font-size: $font-size-lg;
  color: $text-secondary;
}

.orders-page__back {
  padding: $spacing-sm $spacing-md;
  background: $bg-primary;
  border: 1px solid $border-color;
  border-radius: $radius-md;
  color: $text-primary;
  cursor: pointer;
  transition: all $transition-base;
  
  &:hover {
    background: $bg-secondary;
    border-color: $primary-color;
  }
}

.orders-page__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $spacing-3xl;
  gap: $spacing-md;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid $border-color;
  border-top-color: $primary-color;
  border-radius: $radius-full;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.orders-page__error {
  padding: $spacing-xl;
  text-align: center;
  background: $bg-primary;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
}

.orders-page__content {
  display: flex;
  flex-direction: column;
  gap: $spacing-xl;
}

.order-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: $spacing-lg;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-lg;
  background: $bg-primary;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
}

.stat-card__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: $radius-lg;
  
  svg {
    width: 24px;
    height: 24px;
  }
}

.stat-card__icon--pending {
  background: rgba($warning-color, 0.1);
  color: $warning-color;
}

.stat-card__icon--confirmed {
  background: rgba($success-color, 0.1);
  color: $success-color;
}

.stat-card__icon--revenue {
  background: rgba($primary-color, 0.1);
  color: $primary-color;
}

.stat-card__content {
  flex: 1;
}

.stat-card__label {
  margin: 0 0 $spacing-xs 0;
  font-size: $font-size-sm;
  color: $text-secondary;
}

.stat-card__value {
  margin: 0;
  font-size: $font-size-2xl;
  font-weight: $font-weight-bold;
  color: $text-primary;
}

.orders-list {
  background: $bg-primary;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
  overflow: hidden;
}

.orders-list__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-lg;
  border-bottom: 1px solid $border-color;
}

.orders-list__title {
  margin: 0;
  font-size: $font-size-xl;
  font-weight: $font-weight-semibold;
  color: $text-primary;
}

.filter-select {
  padding: $spacing-sm $spacing-md;
  border: 1px solid $border-color;
  border-radius: $radius-md;
  background: $bg-primary;
  color: $text-primary;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: $primary-color;
  }
}

.orders-list__empty {
  padding: $spacing-3xl;
  text-align: center;
  color: $text-secondary;
}

.orders-list__empty-subtitle {
  margin-top: $spacing-sm;
  font-size: $font-size-sm;
}

.orders-list__items {
  display: flex;
  flex-direction: column;
}

.order-item {
  padding: $spacing-lg;
  border-bottom: 1px solid $border-color;
  
  &:last-child {
    border-bottom: none;
  }
}

.order-item__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-md;
}

.order-item__number {
  margin: 0 0 $spacing-xs 0;
  font-size: $font-size-lg;
  font-weight: $font-weight-semibold;
  color: $text-primary;
}

.order-item__time {
  margin: 0;
  font-size: $font-size-sm;
  color: $text-secondary;
}

.status-badge {
  padding: $spacing-xs $spacing-sm;
  font-size: $font-size-xs;
  font-weight: $font-weight-medium;
  border-radius: $radius-sm;
  text-transform: uppercase;
}

.status-badge--pending {
  background: rgba($warning-color, 0.1);
  color: $warning-color;
}

.status-badge--confirmed {
  background: rgba($success-color, 0.1);
  color: $success-color;
}

.status-badge--cancelled {
  background: rgba($error-color, 0.1);
  color: $error-color;
}

.order-item__details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: $spacing-md;
  margin-bottom: $spacing-md;
}

.order-item__customer,
.order-item__items,
.order-item__payment {
  font-size: $font-size-sm;
  
  p {
    margin: 0 0 $spacing-xs 0;
  }
}

.order-item__items-list {
  margin: $spacing-xs 0 0 $spacing-md;
  padding: 0;
  list-style: disc;
  
  li {
    margin-bottom: $spacing-xs;
  }
}

.order-item__actions {
  display: flex;
  gap: $spacing-md;
  justify-content: flex-end;
}

.action-btn {
  padding: $spacing-sm $spacing-md;
  border: none;
  border-radius: $radius-md;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  cursor: pointer;
  transition: all $transition-base;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.action-btn--confirm {
  background: $success-color;
  color: $text-white;
  
  &:hover:not(:disabled) {
    background: darken($success-color, 10%);
  }
}

.action-btn--reject {
  background: $error-color;
  color: $text-white;
  
  &:hover:not(:disabled) {
    background: darken($error-color, 10%);
  }
}

@media (max-width: $breakpoint-md) {
  .orders-page {
    padding: $spacing-md;
  }
  
  .orders-page__header {
    flex-direction: column;
    align-items: flex-start;
    gap: $spacing-md;
  }
  
  .order-stats {
    grid-template-columns: 1fr;
  }
  
  .orders-list__header {
    flex-direction: column;
    align-items: flex-start;
    gap: $spacing-md;
  }
  
  .order-item__details {
    grid-template-columns: 1fr;
  }
  
  .order-item__actions {
    flex-direction: column;
  }
}
</style>