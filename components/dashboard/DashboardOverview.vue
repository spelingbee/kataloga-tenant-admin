<template>
  <div class="dashboard-overview">
    <!-- Header -->
    <div class="dashboard-overview__header">
      <div>
        <h1 class="dashboard-overview__title">Dashboard</h1>
        <p class="dashboard-overview__subtitle">
          Welcome back, {{ userName }}!
        </p>
      </div>
      <button class="dashboard-overview__logout" @click="handleLogout">
        Logout
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="dashboard-overview__loading">
      <div class="loading-spinner" />
      <p>Loading dashboard...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="dashboard-overview__error">
      <p>{{ error }}</p>
      <button @click="refreshData">Retry</button>
    </div>

    <!-- Dashboard Content -->
    <div v-else class="dashboard-overview__content">
      <!-- Key Metrics -->
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-card__icon metric-card__icon--primary">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div class="metric-card__content">
            <p class="metric-card__label">Total Menu Items</p>
            <p class="metric-card__value">{{ metrics?.totalMenuItems || 0 }}</p>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-card__icon metric-card__icon--success">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="metric-card__content">
            <p class="metric-card__label">Active Items</p>
            <p class="metric-card__value">{{ metrics?.activeMenuItems || 0 }}</p>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-card__icon metric-card__icon--info">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
          <div class="metric-card__content">
            <p class="metric-card__label">Categories</p>
            <p class="metric-card__value">{{ metrics?.totalCategories || 0 }}</p>
          </div>
        </div>

        <!-- Today's Sales (PRO/BUSINESS only) -->
        <div v-if="metrics?.todaySales" class="metric-card">
          <div class="metric-card__icon metric-card__icon--warning">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="metric-card__content">
            <p class="metric-card__label">Today's Revenue</p>
            <p class="metric-card__value">${{ formatCurrency(metrics.todaySales.revenue) }}</p>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <h2 class="quick-actions__title">Quick Actions</h2>
        <div class="quick-actions__grid">
          <button class="action-button" @click="router.push('/menu/items/new')">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Menu Item</span>
          </button>

          <button class="action-button" @click="router.push('/categories')">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <span>Manage Categories</span>
          </button>

          <button class="action-button" @click="router.push('/menu')">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span>View All Items</span>
          </button>

          <button v-if="hasAnalyticsAccess" class="action-button" @click="router.push('/analytics')">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span>View Analytics</span>
          </button>
        </div>
      </div>

      <!-- Plan Limits -->
      <PlanLimitIndicator
        :plan-name="planName"
        :current="currentUsage"
        :max="maxLimits"
        @upgrade="router.push('/subscription')"
      />

      <!-- Recent Activity -->
      <div class="recent-activity">
        <h2 class="recent-activity__title">Recent Activity</h2>
        <div v-if="recentActivity.length > 0" class="recent-activity__list">
          <div
            v-for="activity in recentActivity"
            :key="activity.id"
            class="activity-item"
          >
            <div class="activity-item__icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="activity-item__content">
              <p class="activity-item__text">{{ activity.message }}</p>
              <p class="activity-item__time">{{ formatTime(activity.timestamp) }}</p>
            </div>
          </div>
        </div>
        <div v-else class="recent-activity__empty">
          <p>No recent activity</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDashboardStore } from '~/stores/dashboard'
import { useAuthStore } from '~/stores/auth'
import PlanLimitIndicator from '~/components/ui/PlanLimitIndicator.vue'

const dashboardStore = useDashboardStore()
const authStore = useAuthStore()
const router = useRouter()

// Computed properties
const loading = computed(() => dashboardStore.loading)
const error = computed(() => dashboardStore.error)
const metrics = computed(() => dashboardStore.metrics)
const hasAnalyticsAccess = computed(() => dashboardStore.hasAnalyticsAccess)

const userName = computed(() => {
  const user = authStore.user
  return user ? `${user.firstName} ${user.lastName}` : 'User'
})

// Mock data for plan limits (will be replaced with real data)
const planName = ref('FREE')
const currentUsage = computed(() => ({
  menuItems: metrics.value?.totalMenuItems || 0,
  categories: metrics.value?.totalCategories || 0,
  locations: 0,
  users: 1,
}))

const maxLimits = ref({
  menuItems: 50,
  categories: 10,
  locations: 0,
  users: 1,
})

// Mock recent activity (will be replaced with real data)
const recentActivity = ref([
  {
    id: '1',
    message: 'Welcome to your dashboard!',
    timestamp: new Date().toISOString(),
  },
])

/**
 * Format currency
 */
const formatCurrency = (value: number): string => {
  return value.toFixed(2)
}

/**
 * Format timestamp
 */
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

/**
 * Refresh dashboard data
 */
const refreshData = async () => {
  await dashboardStore.fetchDashboardData()
}

/**
 * Handle logout
 */
const handleLogout = async () => {
  try {
    await authStore.logout()
    await router.push('/login')
  } catch (error) {
    console.error('Logout error:', error)
    await router.push('/login')
  }
}

// Load dashboard data on mount
onMounted(async () => {
  await refreshData()
})
</script>

<style scoped lang="scss">
@use '@/assets/scss/variables' as *;

.dashboard-overview {
  padding: $spacing-xl;
  min-height: 100vh;
  background: $bg-secondary;
}

.dashboard-overview__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-xl;
}

.dashboard-overview__title {
  margin: 0 0 $spacing-xs 0;
  font-size: $font-size-3xl;
  font-weight: $font-weight-bold;
  color: $text-primary;
}

.dashboard-overview__subtitle {
  margin: 0;
  font-size: $font-size-lg;
  color: $text-secondary;
}

.dashboard-overview__logout {
  padding: $spacing-sm $spacing-md;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  color: $text-white;
  background: $error-color;
  border: none;
  border-radius: $radius-md;
  cursor: pointer;
  transition: background $transition-base;
  
  &:hover {
    background: darken($error-color, 10%);
  }
}

.dashboard-overview__loading {
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

.dashboard-overview__error {
  padding: $spacing-xl;
  text-align: center;
  background: $bg-primary;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
}

.dashboard-overview__content {
  display: flex;
  flex-direction: column;
  gap: $spacing-xl;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: $spacing-lg;
}

.metric-card {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-lg;
  background: $bg-primary;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
  transition: transform $transition-base, box-shadow $transition-base;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: $shadow-md;
  }
}

.metric-card__icon {
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

.metric-card__icon--primary {
  background: rgba($primary-color, 0.1);
  color: $primary-color;
}

.metric-card__icon--success {
  background: rgba($success-color, 0.1);
  color: $success-color;
}

.metric-card__icon--info {
  background: rgba($info-color, 0.1);
  color: $info-color;
}

.metric-card__icon--warning {
  background: rgba($warning-color, 0.1);
  color: $warning-color;
}

.metric-card__content {
  flex: 1;
}

.metric-card__label {
  margin: 0 0 $spacing-xs 0;
  font-size: $font-size-sm;
  color: $text-secondary;
}

.metric-card__value {
  margin: 0;
  font-size: $font-size-2xl;
  font-weight: $font-weight-bold;
  color: $text-primary;
}

.quick-actions {
  padding: $spacing-lg;
  background: $bg-primary;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
}

.quick-actions__title {
  margin: 0 0 $spacing-lg 0;
  font-size: $font-size-xl;
  font-weight: $font-weight-semibold;
  color: $text-primary;
}

.quick-actions__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: $spacing-md;
}

.action-button {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-md;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  color: $text-primary;
  background: $bg-secondary;
  border: 1px solid $border-color;
  border-radius: $radius-md;
  cursor: pointer;
  transition: all $transition-base;
  
  svg {
    width: 20px;
    height: 20px;
    color: $primary-color;
  }
  
  &:hover {
    background: $bg-primary;
    border-color: $primary-color;
    transform: translateY(-2px);
    box-shadow: $shadow-sm;
  }
}

.recent-activity {
  padding: $spacing-lg;
  background: $bg-primary;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
}

.recent-activity__title {
  margin: 0 0 $spacing-lg 0;
  font-size: $font-size-xl;
  font-weight: $font-weight-semibold;
  color: $text-primary;
}

.recent-activity__list {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: $spacing-md;
  padding: $spacing-md;
  background: $bg-secondary;
  border-radius: $radius-md;
}

.activity-item__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: rgba($info-color, 0.1);
  border-radius: $radius-full;
  color: $info-color;
  flex-shrink: 0;
  
  svg {
    width: 16px;
    height: 16px;
  }
}

.activity-item__content {
  flex: 1;
}

.activity-item__text {
  margin: 0 0 $spacing-xs 0;
  font-size: $font-size-sm;
  color: $text-primary;
}

.activity-item__time {
  margin: 0;
  font-size: $font-size-xs;
  color: $text-light;
}

.recent-activity__empty {
  padding: $spacing-xl;
  text-align: center;
  color: $text-secondary;
}
</style>
