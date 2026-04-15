<template>
  <div class="register-page">
    <div class="register-card">
      <div class="register-card__header">
        <h1 class="register-card__title">Create Your Restaurant Account</h1>
        <p class="register-card__subtitle">Set up your online menu in just a few steps</p>
      </div>

      <NuxtLink to="/onboarding" class="register-option register-option--primary">
        <div class="register-option__icon">🚀</div>
        <h3 class="register-option__title">Quick Setup</h3>
        <p class="register-option__description">
          Get your restaurant online in 5 minutes with our guided wizard
        </p>
        <div class="register-option__features">
          <div class="feature">✓ Step-by-step guidance</div>
          <div class="feature">✓ Telegram bot integration</div>
          <div class="feature">✓ Instant dashboard access</div>
        </div>
        <div class="register-option__cta">Start Setup →</div>
      </NuxtLink>

      <div class="register-footer">
        <p>Already have an account? <NuxtLink to="/login" class="register-footer__link">Sign In</NuxtLink></p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
  middleware: []
})
</script>

<style scoped lang="scss">
@use '@/assets/scss/variables' as *;

.register-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: $spacing-xl;
  background: $bg-secondary;
}

.register-card {
  width: 100%;
  max-width: 480px;
  padding: $spacing-xl;
  background: $bg-primary;
  border-radius: $radius-lg;
  box-shadow: $shadow-lg;
}

.register-card__header {
  margin-bottom: $spacing-xl;
  text-align: center;
}

.register-card__title {
  margin: 0 0 $spacing-sm 0;
  font-size: 1.75rem;
  font-weight: 600;
  color: $text-primary;
}

.register-card__subtitle {
  margin: 0;
  font-size: 0.875rem;
  color: $text-secondary;
}

.register-option {
  display: block;
  padding: $spacing-lg;
  text-decoration: none;
  border: 2px solid $primary-color;
  border-radius: $radius-lg;
  background: linear-gradient(135deg, rgba($primary-color, 0.05) 0%, rgba($primary-color, 0.1) 100%);
  transition: all $transition-base;
  cursor: pointer;
  margin-bottom: $spacing-lg;

  &:hover {
    background: linear-gradient(135deg, rgba($primary-color, 0.1) 0%, rgba($primary-color, 0.15) 100%);
    transform: translateY(-2px);
    box-shadow: $shadow-md;
  }
}

.register-option__icon {
  font-size: 2rem;
  margin-bottom: $spacing-sm;
}

.register-option__title {
  margin: 0 0 $spacing-xs 0;
  font-size: $font-size-lg;
  font-weight: 600;
  color: $text-primary;
}

.register-option__description {
  margin: 0 0 $spacing-md 0;
  font-size: $font-size-sm;
  color: $text-secondary;
}

.register-option__features {
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;
  margin-bottom: $spacing-md;
}

.feature {
  font-size: $font-size-sm;
  color: $success-color;
  font-weight: 500;
}

.register-option__cta {
  font-size: $font-size-sm;
  font-weight: 600;
  color: $primary-color;
}

.register-footer {
  text-align: center;
  font-size: $font-size-sm;
  color: $text-secondary;

  p {
    margin: 0;
  }
}

.register-footer__link {
  color: $primary-color;
  text-decoration: none;
  font-weight: 500;

  &:hover {
    text-decoration: underline;
  }
}
</style>
