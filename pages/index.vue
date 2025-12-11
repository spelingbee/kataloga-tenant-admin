<template>
  <div class="welcome-page">
    <div class="welcome-card">
      <h1>Tenant Admin Dashboard</h1>
      <p>Please access via: app.kataloga.kg/{tenant-slug}</p>
      <p class="example">Example: app.kataloga.kg/pizza-palace</p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})
</script>

<style scoped lang="scss">
@use '@/assets/scss/variables' as *;

.welcome-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: $bg-secondary;
}

.welcome-card {
  padding: $spacing-xl;
  background: $bg-primary;
  border-radius: $radius-lg;
  box-shadow: $shadow-lg;
  text-align: center;
  
  h1 {
    margin: 0 0 $spacing-md 0;
    color: $text-primary;
  }
  
  p {
    margin: $spacing-sm 0;
    color: $text-secondary;
  }
  
  .example {
    font-family: monospace;
    color: $primary-color;
  }
}
</style>
