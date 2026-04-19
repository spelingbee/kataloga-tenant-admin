<template>
  <DashboardOverview />
</template>

<script setup lang="ts">
import DashboardOverview from '~/components/dashboard/DashboardOverview.vue'

definePageMeta({
  middleware: ['auth']
})
</script>
