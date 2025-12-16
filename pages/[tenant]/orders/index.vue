<template>
  <div class="orders-page">
    <div class="orders-page__header">
      <div>
        <h1 class="orders-page__title">Orders</h1>
        <p class="orders-page__subtitle">
          Manage and track your restaurant orders
        </p>
      </div>
      <button class="orders-page__back" @click="navigateToTenant('/')">
        ← Back to Dashboard
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="orders-page__loading">
      <div class="loading-spinner" />
      <p>Loading orders...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="orders-page__error">
      <p>{{ error }}</p>
      <button @click="refreshData">Retry</button>
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
            <p class="stat-card__label">Pending Orders</p>
            <p class="stat-card__value">{{ orderStats.pending || 0 }}</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-card__icon stat-card__icon--confirmed">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="stat-card__content">
            <p class="stat-card__label">Confirmed Orders</p>
            <p class="stat-card__value">{{ orderStats.confirmed || 0 }}</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-card__icon stat-card__icon--revenue">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="stat-card__content">
            <p class="stat-card__label">Today's Revenue</p>
            <p class="stat-card__value">${{ formatCurrency(orderStats.todayRevenue || 0) }}</p>
          </div>
        </div>
      </div>

      <!-- Orders List -->
      <div class="orders-list">
        <div class="orders-list__header">
          <h2 class="orders-list__title">Recent Orders</h2>
          <div class="orders-list__filters">
            <select v-model="statusFilter" class="filter-select">
              <option value="">All Orders</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PREPARING">Preparing</option>
              <option value="READY">Ready</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        <div v-if="filteredOrders.length === 0" class="orders-list__empty">
          <p>No orders found</p>
          <p class="orders-list__empty-subtitle">Orders will appear here when customers place them</p>
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
                <h3 class="order-item__number">Order #{{ order.orderNumber }}</h3>
                <p class="order-item__time">{{ formatTime(order.createdAt) }}</p>
              </div>
              <div class="order-item__status">
                <span class="status-badge" :class="`status-badge--${order.status.toLowerCase()}`">
                  {{ order.status }}
                </span>
              </div>
            </div>

            <div class="order-item__details">
              <div class="order-item__customer">
                <p><strong>Customer:</strong> {{ order.customerName || 'Anonymous' }}</p>
                <p v-if="order.customerPhone"><strong>Phone:</strong> {{ order.customerPhone }}</p>
              </div>
              
              <div class="order-item__items">
                <p><strong>Items:</strong></p>
                <ul class="order-item__items-list">
                  <li v-for="item in order.items" :key="item.id">
                    {{ item.quantity }}x {{ item.menuItem.name }} - ${{ formatCurrency(item.price) }}
                  </li>
                </ul>
              </div>

              <div class="order-item__payment">
                <p><strong>Payment:</strong> {{ order.paymentMethod }} - {{ order.paymentStatus }}</p>
                <p><strong>Total:</strong> ${{ formatCurrency(order.total) }}</p>
              </div>
            </div>

            <div v-if="order.status === 'PENDING'" class="order-item__actions">
              <button 
                class="action-btn action-btn--confirm" 
                @click="confirmOrder(order.id)"
                :disabled="actionLoading"
              >
                Confirm Order
              </button>
              <button 
                class="action-btn action-btn--reject" 
                @click="rejectOrder(order.id)"
                :disabled="actionLoading"
              >
                Reject Order
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

definePageMeta({
  middleware: ['auth']
})

const { navigateToTenant } = useNavigation()

// Mock data - replace with real API calls
const loading = ref(false)
const error = ref<string | null>(null)
const actionLoading = ref(false)
const statusFilter = ref('')

const orderStats = ref({
  pending: 3,
  confirmed: 12,
  todayRevenue: 245.50
})

const orders = ref([
  {
    id: '1',
    orderNumber: '001',
    status: 'PENDING',
    customerName: 'John Doe',
    customerPhone: '+1234567890',
    paymentMethod: 'CASH',
    paymentStatus: 'PENDING',
    total: 25.50,
    createdAt: new Date().toISOString(),
    items: [
      {
        id: '1',
        quantity: 2,
        price: 12.75,
        menuItem: { name: 'Margherita Pizza' }
      }
    ]
  },
  {
    id: '2',
    orderNumber: '002',
    status: 'CONFIRMED',
    customerName: 'Jane Smith',
    customerPhone: '+1234567891',
    paymentMethod: 'STRIPE',
    paymentStatus: 'PAID',
    total: 18.00,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    items: [
      {
        id: '2',
        quantity: 1,
        price: 18.00,
        menuItem: { name: 'Caesar Salad' }
      }
    ]
  }
])

const filteredOrders = computed(() => {
  if (!statusFilter.value) return orders.value
  return orders.value.filter(order => order.status === statusFilter.value)
})

const formatCurrency = (value: number): string => {
  return value.toFixed(2)
}

const formatTime = (timestamp: string): string => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

const confirmOrder = async (orderId: string) => {
  actionLoading.value = true
  try {
    // TODO: Implement API call to confirm order
    const order = orders.value.find(o => o.id === orderId)
    if (order) {
      order.status = 'CONFIRMED'
    }
    // Show success notification
    alert('Order confirmed successfully!')
  } catch (error) {
    alert('Failed to confirm order')
  } finally {
    actionLoading.value = false
  }
}

const rejectOrder = async (orderId: string) => {
  actionLoading.value = true
  try {
    // TODO: Implement API call to reject order
    const order = orders.value.find(o => o.id === orderId)
    if (order) {
      order.status = 'CANCELLED'
    }
    // Show success notification
    alert('Order rejected successfully!')
  } catch (error) {
    alert('Failed to reject order')
  } finally {
    actionLoading.value = false
  }
}

const refreshData = async () => {
  loading.value = true
  error.value = null
  try {
    // TODO: Implement API calls to fetch orders and stats
    await new Promise(resolve => setTimeout(resolve, 1000)) // Mock delay
  } catch (err: any) {
    error.value = err.message || 'Failed to load orders'
  } finally {
    loading.value = false
  }
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
  align-items: center;
  margin-bottom: $spacing-xl;
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