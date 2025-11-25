<template>
  <div id="app">
    <NuxtPage />
    
    <!-- Global Feature Locked Modal -->
    <FeatureLockedModal
      :show="showUpgradeModal"
      :feature-key="requestedFeature"
      :feature-name="featureName"
      :current-plan="planName"
      :required-plan="requiredPlanName"
      @close="closeUpgradeModal"
      @upgrade="handleUpgrade"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// Global app setup
const { 
  showUpgradeModal, 
  requestedFeature, 
  closeUpgradeModal,
  redirectToUpgrade,
  getRequiredPlan,
  getFeatureName,
  planName,
} = useFeatureAccess()

const featureName = computed(() => {
  return requestedFeature.value ? getFeatureName(requestedFeature.value) : ''
})

const requiredPlanName = computed(() => {
  return requestedFeature.value ? getRequiredPlan(requestedFeature.value) : 'PRO'
})

const handleUpgrade = () => {
  closeUpgradeModal()
  redirectToUpgrade(requestedFeature.value || undefined)
}
</script>

<style lang="scss">
// Global styles are imported via nuxt.config.ts
</style>
