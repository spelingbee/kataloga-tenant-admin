<template>
  <div class="dashboard-skeleton">
    <!-- Header Skeleton -->
    <div class="dashboard-skeleton__header">
      <div>
        <Skeleton width="200px" height="32px" variant="text" />
        <Skeleton width="250px" height="20px" variant="text" style="margin-top: 8px" />
      </div>
      <div class="dashboard-skeleton__actions">
        <Skeleton width="120px" height="40px" variant="rectangular" />
        <Skeleton width="80px" height="40px" variant="rectangular" />
      </div>
    </div>

    <!-- Metrics Grid Skeleton -->
    <div class="metrics-grid">
      <div v-for="i in 4" :key="i" class="metric-card-skeleton">
        <Skeleton width="48px" height="48px" variant="circular" />
        <div class="metric-card-skeleton__content">
          <Skeleton width="120px" height="16px" variant="text" />
          <Skeleton width="60px" height="32px" variant="text" style="margin-top: 8px" />
        </div>
      </div>
    </div>

    <!-- Main Actions Skeleton -->
    <div class="main-actions-skeleton">
      <Skeleton width="180px" height="28px" variant="text" style="margin-bottom: 16px" />
      <div class="main-actions-skeleton__grid">
        <div v-for="i in 3" :key="i" class="action-card-skeleton">
          <Skeleton width="100%" height="120px" variant="card" />
        </div>
      </div>
    </div>

    <!-- Quick Actions Skeleton -->
    <div class="quick-actions-skeleton">
      <Skeleton width="150px" height="24px" variant="text" style="margin-bottom: 16px" />
      <div class="quick-actions-skeleton__grid">
        <Skeleton v-for="i in 3" :key="i" width="100%" height="48px" variant="rectangular" />
      </div>
    </div>

    <!-- Recent Activity Skeleton -->
    <div class="recent-activity-skeleton">
      <Skeleton width="180px" height="24px" variant="text" style="margin-bottom: 16px" />
      <div class="activity-list-skeleton">
        <div v-for="i in 3" :key="i" class="activity-item-skeleton">
          <Skeleton width="40px" height="40px" variant="circular" />
          <div class="activity-item-skeleton__content">
            <Skeleton width="80%" height="16px" variant="text" />
            <Skeleton width="100px" height="14px" variant="text" style="margin-top: 4px" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Skeleton from './Skeleton.vue'
</script>

<style scoped lang="scss">
.dashboard-skeleton {
  padding: 2rem;
  
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }
  
  &__actions {
    display: flex;
    gap: 1rem;
  }
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.metric-card-skeleton {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  
  &__content {
    flex: 1;
  }
}

.main-actions-skeleton {
  margin-bottom: 2rem;
  
  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
  }
}

.action-card-skeleton {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.quick-actions-skeleton {
  margin-bottom: 2rem;
  
  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }
}

.recent-activity-skeleton {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.activity-list-skeleton {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item-skeleton {
  display: flex;
  align-items: center;
  gap: 1rem;
  
  &__content {
    flex: 1;
  }
}
</style>
