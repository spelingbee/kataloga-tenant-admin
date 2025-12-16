<template>
  <svg
    :class="['icon', `icon--${name}`]"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <!-- Check icon -->
    <path v-if="name === 'check'" d="M20 6L9 17l-5-5" />
    
    <!-- Alert Circle icon -->
    <g v-else-if="name === 'alert-circle'">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </g>
    
    <!-- Check Circle icon -->
    <g v-else-if="name === 'check-circle'">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22,4 12,14.01 9,11.01" />
    </g>
    
    <!-- External Link icon -->
    <g v-else-if="name === 'external-link'">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15,3 21,3 21,9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </g>
    
    <!-- Telegram icon (simplified) -->
    <g v-else-if="name === 'telegram'">
      <path d="M21.198 2.433a2.242 2.242 0 0 0-1.022.215l-8.609 3.33c-2.068.8-4.133 1.598-5.724 2.21a205.66 205.66 0 0 1-2.849 1.09c-.896.32-1.394.598-1.394 1.273 0 .405.202.78.498 1.077.295.296.677.459 1.042.459.405 0 .815-.118 1.394-.215l2.849-.537c1.591-.299 3.394-.598 5.724-.896l8.609-.896c.405-.043.896-.129 1.022-.598a2.14 2.14 0 0 0-.215-1.022L21.198 2.433z" />
    </g>
    
    <!-- Arrow Right icon -->
    <g v-else-if="name === 'arrow-right'">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12,5 19,12 12,19" />
    </g>
    
    <!-- Default fallback -->
    <circle v-else cx="12" cy="12" r="10" />
  </svg>
</template>

<script setup lang="ts">
interface Props {
  name: string
  size?: number | string
}

withDefaults(defineProps<Props>(), {
  size: 24
})
</script>

<style scoped lang="scss">
.icon {
  display: inline-block;
  vertical-align: middle;
  flex-shrink: 0;
}
</style>