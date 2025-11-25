<template>
  <div class="sales-trend-chart">
    <div v-if="!hasData" class="sales-trend-chart__empty">
      <p>No sales data available for the selected period</p>
    </div>
    <div v-else class="sales-trend-chart__content">
      <svg class="sales-trend-chart__svg" :viewBox="`0 0 ${width} ${height}`">
        <!-- Grid lines -->
        <g class="grid-lines">
          <line
            v-for="i in 5"
            :key="`grid-${i}`"
            :x1="padding"
            :y1="padding + ((height - padding * 2) / 4) * (i - 1)"
            :x2="width - padding"
            :y2="padding + ((height - padding * 2) / 4) * (i - 1)"
            stroke="#e2e8f0"
            stroke-width="1"
          />
        </g>

        <!-- Y-axis labels -->
        <g class="y-axis-labels">
          <text
            v-for="(label, i) in yAxisLabels"
            :key="`y-label-${i}`"
            :x="padding - 10"
            :y="padding + ((height - padding * 2) / 4) * i + 5"
            text-anchor="end"
            font-size="12"
            fill="#64748b"
          >
            {{ label }}
          </text>
        </g>

        <!-- Line path -->
        <path
          :d="linePath"
          fill="none"
          stroke="#0ea5e9"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
        />

        <!-- Area fill -->
        <path
          :d="areaPath"
          fill="url(#gradient)"
          opacity="0.2"
        />

        <!-- Data points -->
        <g class="data-points">
          <circle
            v-for="(point, i) in dataPoints"
            :key="`point-${i}`"
            :cx="point.x"
            :cy="point.y"
            r="4"
            fill="#0ea5e9"
            stroke="#ffffff"
            stroke-width="2"
            class="data-point"
            @mouseenter="showTooltip(i, $event)"
            @mouseleave="hideTooltip"
          />
        </g>

        <!-- Gradient definition -->
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#0ea5e9" stop-opacity="0.4" />
            <stop offset="100%" stop-color="#0ea5e9" stop-opacity="0" />
          </linearGradient>
        </defs>
      </svg>

      <!-- X-axis labels -->
      <div class="sales-trend-chart__x-axis">
        <span
          v-for="(label, i) in xAxisLabels"
          :key="`x-label-${i}`"
          class="x-axis-label"
        >
          {{ label }}
        </span>
      </div>

      <!-- Tooltip -->
      <div
        v-if="tooltip.visible"
        class="sales-trend-chart__tooltip"
        :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
      >
        <p class="tooltip-date">{{ tooltip.date }}</p>
        <p class="tooltip-value">{{ formatCurrency(tooltip.revenue) }}</p>
        <p class="tooltip-orders">{{ tooltip.orders }} orders</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { SalesTrendData } from '~/types'

interface Props {
  data: SalesTrendData[]
  period: 'daily' | 'weekly' | 'monthly'
}

const props = defineProps<Props>()

const width = 800
const height = 300
const padding = 50

const tooltip = ref({
  visible: false,
  x: 0,
  y: 0,
  date: '',
  revenue: 0,
  orders: 0,
})

const hasData = computed(() => props.data && props.data.length > 0)

const maxRevenue = computed(() => {
  if (!hasData.value) return 0
  return Math.max(...props.data.map((d) => d.revenue))
})

const yAxisLabels = computed(() => {
  const max = maxRevenue.value
  const step = max / 4
  return [
    formatCurrency(max),
    formatCurrency(max - step),
    formatCurrency(max - step * 2),
    formatCurrency(max - step * 3),
    formatCurrency(0),
  ]
})

const xAxisLabels = computed(() => {
  if (!hasData.value) return []
  const data = props.data
  const step = Math.ceil(data.length / 6)
  return data
    .filter((_, i) => i % step === 0)
    .map((d) => formatDate(d.date))
})

const dataPoints = computed(() => {
  if (!hasData.value) return []
  const data = props.data
  const chartWidth = width - padding * 2
  const chartHeight = height - padding * 2
  const xStep = chartWidth / (data.length - 1 || 1)

  return data.map((d, i) => ({
    x: padding + i * xStep,
    y: padding + chartHeight - (d.revenue / maxRevenue.value) * chartHeight,
    revenue: d.revenue,
    orders: d.orders,
    date: d.date,
  }))
})

const linePath = computed(() => {
  if (!hasData.value) return ''
  return dataPoints.value
    .map((point, i) => `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ')
})

const areaPath = computed(() => {
  if (!hasData.value) return ''
  const points = dataPoints.value
  const firstPoint = points[0]
  const lastPoint = points[points.length - 1]
  
  return `
    M ${firstPoint.x} ${height - padding}
    L ${firstPoint.x} ${firstPoint.y}
    ${linePath.value.substring(1)}
    L ${lastPoint.x} ${height - padding}
    Z
  `
})

const showTooltip = (index: number, event: MouseEvent) => {
  const point = dataPoints.value[index]
  const data = props.data[index]
  
  tooltip.value = {
    visible: true,
    x: point.x,
    y: point.y - 60,
    date: formatDate(data.date),
    revenue: data.revenue,
    orders: data.orders,
  }
}

const hideTooltip = () => {
  tooltip.value.visible = false
}

const formatCurrency = (value: number): string => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`
  }
  return `$${value.toFixed(0)}`
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  if (props.period === 'monthly') {
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  } else if (props.period === 'weekly') {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
</script>

<style scoped lang="scss">
@use '~/assets/scss/variables' as *;

.sales-trend-chart {
  width: 100%;
  position: relative;
}

.sales-trend-chart__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  color: $text-secondary;
  font-size: $font-size-base;
}

.sales-trend-chart__content {
  position: relative;
}

.sales-trend-chart__svg {
  width: 100%;
  height: auto;
  display: block;
}

.data-point {
  cursor: pointer;
  transition: r $transition-fast;

  &:hover {
    r: 6;
  }
}

.sales-trend-chart__x-axis {
  display: flex;
  justify-content: space-between;
  padding: $spacing-sm $spacing-xl 0;
  font-size: $font-size-xs;
  color: $text-secondary;
}

.x-axis-label {
  text-align: center;
}

.sales-trend-chart__tooltip {
  position: absolute;
  padding: $spacing-sm $spacing-md;
  background: $bg-dark;
  color: $text-white;
  border-radius: $radius-md;
  box-shadow: $shadow-lg;
  pointer-events: none;
  transform: translateX(-50%);
  z-index: 10;
  white-space: nowrap;

  &::after {
    content: '';
    position: absolute;
    bottom: -6px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 6px solid $bg-dark;
  }
}

.tooltip-date {
  font-size: $font-size-xs;
  margin: 0 0 $spacing-xs 0;
  opacity: 0.8;
}

.tooltip-value {
  font-size: $font-size-lg;
  font-weight: $font-weight-bold;
  margin: 0 0 $spacing-xs 0;
}

.tooltip-orders {
  font-size: $font-size-xs;
  margin: 0;
  opacity: 0.8;
}

@media (max-width: $breakpoint-md) {
  .sales-trend-chart__svg {
    height: 250px;
  }
}
</style>
