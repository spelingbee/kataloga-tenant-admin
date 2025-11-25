<template>
  <div class="item-sales-trend-chart">
    <div v-if="!hasData" class="item-sales-trend-chart__empty">
      <p>No sales data available for the selected period</p>
    </div>
    <div v-else class="item-sales-trend-chart__content">
      <svg class="item-sales-trend-chart__svg" :viewBox="`0 0 ${width} ${height}`">
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

        <!-- Y-axis labels (Revenue) -->
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

        <!-- Revenue line path -->
        <path
          :d="revenueLinePath"
          fill="none"
          stroke="#10b981"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
        />

        <!-- Revenue area fill -->
        <path
          :d="revenueAreaPath"
          fill="url(#revenueGradient)"
          opacity="0.2"
        />

        <!-- Quantity line path -->
        <path
          :d="quantityLinePath"
          fill="none"
          stroke="#0ea5e9"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-dasharray="5,5"
        />

        <!-- Revenue data points -->
        <g class="data-points">
          <circle
            v-for="(point, i) in revenueDataPoints"
            :key="`revenue-point-${i}`"
            :cx="point.x"
            :cy="point.y"
            r="4"
            fill="#10b981"
            stroke="#ffffff"
            stroke-width="2"
            class="data-point"
            @mouseenter="showTooltip(i, $event, 'revenue')"
            @mouseleave="hideTooltip"
          />
        </g>

        <!-- Quantity data points -->
        <g class="data-points">
          <circle
            v-for="(point, i) in quantityDataPoints"
            :key="`quantity-point-${i}`"
            :cx="point.x"
            :cy="point.y"
            r="4"
            fill="#0ea5e9"
            stroke="#ffffff"
            stroke-width="2"
            class="data-point"
            @mouseenter="showTooltip(i, $event, 'quantity')"
            @mouseleave="hideTooltip"
          />
        </g>

        <!-- Gradient definitions -->
        <defs>
          <linearGradient id="revenueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#10b981" stop-opacity="0.4" />
            <stop offset="100%" stop-color="#10b981" stop-opacity="0" />
          </linearGradient>
        </defs>
      </svg>

      <!-- Legend -->
      <div class="item-sales-trend-chart__legend">
        <div class="legend-item">
          <div class="legend-item__indicator legend-item__indicator--revenue"></div>
          <span>Revenue</span>
        </div>
        <div class="legend-item">
          <div class="legend-item__indicator legend-item__indicator--quantity"></div>
          <span>Quantity</span>
        </div>
      </div>

      <!-- X-axis labels -->
      <div class="item-sales-trend-chart__x-axis">
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
        class="item-sales-trend-chart__tooltip"
        :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
      >
        <p class="tooltip-date">{{ tooltip.date }}</p>
        <p v-if="tooltip.type === 'revenue'" class="tooltip-value">
          Revenue: {{ formatCurrency(tooltip.value) }}
        </p>
        <p v-else class="tooltip-value">
          Quantity: {{ tooltip.value }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { SaleRecord } from '~/types'

interface Props {
  sales: SaleRecord[]
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
  value: 0,
  type: 'revenue' as 'revenue' | 'quantity',
})

// Process sales data by date
const chartData = computed(() => {
  const salesByDate = new Map<string, { quantity: number; revenue: number }>()

  props.sales.forEach((sale) => {
    const date = new Date(sale.date).toISOString().split('T')[0]
    const existing = salesByDate.get(date) || { quantity: 0, revenue: 0 }
    salesByDate.set(date, {
      quantity: existing.quantity + sale.quantity,
      revenue: existing.revenue + sale.totalAmount,
    })
  })

  return Array.from(salesByDate.entries())
    .map(([date, data]) => ({
      date,
      quantity: data.quantity,
      revenue: data.revenue,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
})

const hasData = computed(() => chartData.value.length > 0)

const maxRevenue = computed(() => {
  if (!hasData.value) return 0
  return Math.max(...chartData.value.map((d) => d.revenue))
})

const maxQuantity = computed(() => {
  if (!hasData.value) return 0
  return Math.max(...chartData.value.map((d) => d.quantity))
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
  const data = chartData.value
  const step = Math.ceil(data.length / 6)
  return data
    .filter((_, i) => i % step === 0)
    .map((d) => formatDate(d.date))
})

const revenueDataPoints = computed(() => {
  if (!hasData.value) return []
  const data = chartData.value
  const chartWidth = width - padding * 2
  const chartHeight = height - padding * 2
  const xStep = chartWidth / (data.length - 1 || 1)

  return data.map((d, i) => ({
    x: padding + i * xStep,
    y: padding + chartHeight - (d.revenue / maxRevenue.value) * chartHeight,
    revenue: d.revenue,
    date: d.date,
  }))
})

const quantityDataPoints = computed(() => {
  if (!hasData.value) return []
  const data = chartData.value
  const chartWidth = width - padding * 2
  const chartHeight = height - padding * 2
  const xStep = chartWidth / (data.length - 1 || 1)

  return data.map((d, i) => ({
    x: padding + i * xStep,
    y: padding + chartHeight - (d.quantity / maxQuantity.value) * chartHeight,
    quantity: d.quantity,
    date: d.date,
  }))
})

const revenueLinePath = computed(() => {
  if (!hasData.value) return ''
  return revenueDataPoints.value
    .map((point, i) => `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ')
})

const quantityLinePath = computed(() => {
  if (!hasData.value) return ''
  return quantityDataPoints.value
    .map((point, i) => `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ')
})

const revenueAreaPath = computed(() => {
  if (!hasData.value) return ''
  const points = revenueDataPoints.value
  const firstPoint = points[0]
  const lastPoint = points[points.length - 1]
  
  return `
    M ${firstPoint.x} ${height - padding}
    L ${firstPoint.x} ${firstPoint.y}
    ${revenueLinePath.value.substring(1)}
    L ${lastPoint.x} ${height - padding}
    Z
  `
})

const showTooltip = (index: number, event: MouseEvent, type: 'revenue' | 'quantity') => {
  const data = chartData.value[index]
  const point = type === 'revenue' ? revenueDataPoints.value[index] : quantityDataPoints.value[index]
  
  tooltip.value = {
    visible: true,
    x: point.x,
    y: point.y - 60,
    date: formatDate(data.date),
    value: type === 'revenue' ? data.revenue : data.quantity,
    type,
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
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
</script>

<style scoped lang="scss">
@use '~/assets/scss/variables' as *;

.item-sales-trend-chart {
  width: 100%;
  position: relative;
}

.item-sales-trend-chart__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  color: $text-secondary;
  font-size: $font-size-base;
}

.item-sales-trend-chart__content {
  position: relative;
}

.item-sales-trend-chart__svg {
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

.item-sales-trend-chart__legend {
  display: flex;
  justify-content: center;
  gap: $spacing-lg;
  margin-top: $spacing-md;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  font-size: $font-size-sm;
  color: $text-secondary;
}

.legend-item__indicator {
  width: 20px;
  height: 3px;
  border-radius: $radius-sm;
}

.legend-item__indicator--revenue {
  background: #10b981;
}

.legend-item__indicator--quantity {
  background: #0ea5e9;
  background-image: repeating-linear-gradient(
    90deg,
    #0ea5e9,
    #0ea5e9 5px,
    transparent 5px,
    transparent 10px
  );
}

.item-sales-trend-chart__x-axis {
  display: flex;
  justify-content: space-between;
  padding: $spacing-sm $spacing-xl 0;
  font-size: $font-size-xs;
  color: $text-secondary;
}

.x-axis-label {
  text-align: center;
}

.item-sales-trend-chart__tooltip {
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
  font-size: $font-size-base;
  font-weight: $font-weight-semibold;
  margin: 0;
}

@media (max-width: $breakpoint-md) {
  .item-sales-trend-chart__svg {
    height: 250px;
  }
}
</style>
