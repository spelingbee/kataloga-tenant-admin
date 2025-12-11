<template>
  <div class="top-selling-items-chart">
    <div v-if="!hasData" class="top-selling-items-chart__empty">
      <p>No sales data available</p>
    </div>
    <div v-else class="top-selling-items-chart__list">
      <div
        v-for="(item, index) in items"
        :key="item.menuItemId"
        class="item-row"
        @click="viewItemHistory(item)"
      >
        <div class="item-row__rank">
          <span class="rank-badge" :class="`rank-badge--${index + 1}`">
            {{ index + 1 }}
          </span>
        </div>
        <div class="item-row__info">
          <p class="item-row__name">{{ item.menuItemName }}</p>
          <p class="item-row__quantity">{{ item.quantity }} sold</p>
        </div>
        <div class="item-row__revenue">
          <p class="revenue-amount">{{ formatCurrency(item.revenue) }}</p>
          <div class="revenue-bar">
            <div
              class="revenue-bar__fill"
              :style="{ width: getBarWidth(item.revenue) + '%' }"
            ></div>
          </div>
        </div>
        <div class="item-row__action">
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
              d="M8.25 4.5l7.5 7.5-7.5 7.5"
            />
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { TopSellingItem } from '~/types'

interface Props {
  items: TopSellingItem[]
}

const props = defineProps<Props>()
const router = useRouter()

const hasData = computed(() => props.items && props.items.length > 0)

const maxRevenue = computed(() => {
  if (!hasData.value) return 0
  return Math.max(...props.items.map((item) => item.revenue))
})

const getBarWidth = (revenue: number): number => {
  if (maxRevenue.value === 0) return 0
  return (revenue / maxRevenue.value) * 100
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value)
}

const { tenantPath } = useNavigation()

const viewItemHistory = (item: TopSellingItem) => {
  router.push({
    path: tenantPath(`/analytics/items/${item.menuItemId}`),
    query: { name: item.menuItemName },
  })
}
</script>

<style scoped lang="scss">
@use '~/assets/scss/variables' as *;

.top-selling-items-chart {
  width: 100%;
}

.top-selling-items-chart__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  color: $text-secondary;
  font-size: $font-size-base;
}

.top-selling-items-chart__list {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.item-row {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-md;
  background: $bg-secondary;
  border-radius: $radius-md;
  transition: all $transition-base;
  cursor: pointer;

  &:hover {
    background: $bg-tertiary;
    box-shadow: $shadow-sm;
    transform: translateX(4px);
  }
}

.item-row__rank {
  flex-shrink: 0;
}

.rank-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: $radius-full;
  font-size: $font-size-sm;
  font-weight: $font-weight-bold;
  color: $text-white;
}

.rank-badge--1 {
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);
}

.rank-badge--2 {
  background: linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%);
  box-shadow: 0 2px 8px rgba(192, 192, 192, 0.3);
}

.rank-badge--3 {
  background: linear-gradient(135deg, #cd7f32 0%, #e8a87c 100%);
  box-shadow: 0 2px 8px rgba(205, 127, 50, 0.3);
}

.rank-badge--4,
.rank-badge--5,
.rank-badge--6,
.rank-badge--7,
.rank-badge--8,
.rank-badge--9,
.rank-badge--10 {
  background: $secondary-color;
}

.item-row__info {
  flex: 1;
  min-width: 0;
}

.item-row__name {
  font-size: $font-size-base;
  font-weight: $font-weight-medium;
  color: $text-primary;
  margin: 0 0 $spacing-xs 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-row__quantity {
  font-size: $font-size-sm;
  color: $text-secondary;
  margin: 0;
}

.item-row__revenue {
  flex-shrink: 0;
  min-width: 150px;
  text-align: right;
}

.revenue-amount {
  font-size: $font-size-lg;
  font-weight: $font-weight-semibold;
  color: $text-primary;
  margin: 0 0 $spacing-xs 0;
}

.revenue-bar {
  height: 6px;
  background: $border-color;
  border-radius: $radius-full;
  overflow: hidden;
}

.revenue-bar__fill {
  height: 100%;
  background: linear-gradient(90deg, $primary-color 0%, $primary-light 100%);
  border-radius: $radius-full;
  transition: width $transition-slow;
}

.item-row__action {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $text-secondary;
  transition: color $transition-base;

  svg {
    width: 20px;
    height: 20px;
  }

  .item-row:hover & {
    color: $primary-color;
  }
}

@media (max-width: $breakpoint-md) {
  .item-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .item-row__revenue {
    width: 100%;
    text-align: left;
  }

  .item-row__action {
    align-self: flex-end;
  }
}
</style>
