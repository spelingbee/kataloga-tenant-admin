<template>
  <div class="error-page">
    <div class="error-card">
      <div class="error-card__icon">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      
      <h1 class="error-card__title">Tenant Required</h1>
      
      <p class="error-card__message">
        This application requires a tenant identifier in the URL path.
      </p>
      
      <div class="error-card__details">
        <p>Please access the application using this format:</p>
        <ul>
          <li><code>{{ appDomain }}/your-restaurant</code></li>
          <li><code>{{ appDomain }}/demo-restaurant</code></li>
          <li><code>{{ appDomain }}/gustav</code></li>
        </ul>
      </div>
      
      <div class="error-card__help">
        <p>If you don't have a tenant account yet, please contact your administrator.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
  middleware: []
})

const config = useRuntimeConfig()
const appDomain = computed(() => {
  const domain = config.public.appDomain as string
  return domain || 'app.kataloga.kg'
})
</script>

<style scoped lang="scss">
@use '@/assets/scss/variables' as *;

.error-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: $spacing-xl;
  background: $bg-secondary;
}

.error-card {
  width: 100%;
  max-width: 600px;
  padding: $spacing-xl;
  background: $bg-primary;
  border-radius: $radius-lg;
  box-shadow: $shadow-lg;
  text-align: center;
}

.error-card__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  margin-bottom: $spacing-lg;
  color: $warning-color;
  background: rgba($warning-color, 0.1);
  border-radius: 50%;
  
  svg {
    width: 48px;
    height: 48px;
  }
}

.error-card__title {
  margin: 0 0 $spacing-md 0;
  font-size: 2rem;
  font-weight: 600;
  color: $text-primary;
}

.error-card__message {
  margin: 0 0 $spacing-lg 0;
  font-size: 1.125rem;
  color: $text-secondary;
}

.error-card__details {
  padding: $spacing-lg;
  margin-bottom: $spacing-lg;
  text-align: left;
  background: $bg-secondary;
  border-radius: $radius-md;
  
  p {
    margin: 0 0 $spacing-sm 0;
    font-weight: 500;
    color: $text-primary;
  }
  
  ul {
    margin: 0;
    padding-left: $spacing-lg;
    list-style: disc;
    
    li {
      margin: $spacing-xs 0;
      color: $text-secondary;
      
      code {
        padding: 2px 6px;
        font-family: 'Courier New', monospace;
        font-size: 0.875rem;
        color: $primary-color;
        background: rgba($primary-color, 0.1);
        border-radius: $radius-sm;
      }
    }
  }
}

.error-card__help {
  padding-top: $spacing-lg;
  border-top: 1px solid $border-color;
  
  p {
    margin: 0;
    font-size: 0.875rem;
    color: $text-light;
  }
}
</style>
