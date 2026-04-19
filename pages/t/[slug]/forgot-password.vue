<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-card__header">
        <h1 class="login-card__title">{{ $t('auth.forgotPasswordTitle', 'Восстановление пароля') }}</h1>
        <p class="login-card__subtitle">
          {{ success ? $t('auth.forgotPasswordSuccess', 'Инструкции по сбросу пароля отправлены на ваш email') : $t('auth.forgotPasswordSubtitle', 'Введите ваш email, чтобы получить ссылку для сброса пароля') }}
        </p>
      </div>

      <div v-if="success" class="success-message">
        <div class="success-icon">Check</div>
        <nuxt-link :to="`/t/${tenantSlug}/login`" class="login-form__submit link-btn">
          {{ $t('auth.backToLogin', 'Вернуться ко входу') }}
        </nuxt-link>
      </div>

      <form v-else class="login-form" @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="email" class="form-group__label">{{ $t('common.email') }}</label>
          <input
            id="email"
            v-model="email"
            type="email"
            class="form-group__input"
            :class="{ 'form-group__input--error': error }"
            :placeholder="$t('common.email')"
            required
            autocomplete="email"
          />
          <span v-if="error" class="form-group__error">{{ error }}</span>
        </div>

        <button
          type="submit"
          class="login-form__submit"
          :disabled="loading"
        >
          {{ loading ? $t('common.sending', 'Отправка...') : $t('common.send', 'Отправить') }}
        </button>

        <div class="auth-links">
          <nuxt-link :to="`/t/${tenantSlug}/login`" class="auth-link">
            {{ $t('auth.backToLogin', 'Вернуться ко входу') }}
          </nuxt-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
  middleware: []
})

const { t } = useI18n()
const { forgotPassword } = useAuth()
const route = useRoute()
const tenantSlug = computed(() => route.params.slug as string)

const email = ref('')
const loading = ref(false)
const success = ref(false)
const error = ref('')

const handleSubmit = async () => {
  if (!email.value) return
  
  loading.value = true
  error.value = ''
  
  try {
    await forgotPassword(email.value)
    success.value = true
  } catch (err: any) {
    console.error('Forgot password error:', err)
    error.value = err.response?.data?.message || t('auth.forgotPasswordError', 'Произошла ошибка при запросе сброса пароля')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
@use '@/assets/scss/variables' as *;

.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: $spacing-xl;
  background: $bg-secondary;
}

.login-card {
  width: 100%;
  max-width: 400px;
  padding: $spacing-xl;
  background: $bg-primary;
  border-radius: $radius-lg;
  box-shadow: $shadow-lg;
}

.login-card__header {
  margin-bottom: $spacing-xl;
  text-align: center;
}

.login-card__title {
  margin: 0 0 $spacing-sm 0;
  font-size: 1.75rem;
  font-weight: 600;
  color: $text-primary;
}

.login-card__subtitle {
  margin: 0;
  font-size: 0.875rem;
  color: $text-secondary;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;
}

.form-group__label {
  font-size: 0.875rem;
  font-weight: 500;
  color: $text-primary;
}

.form-group__input {
  width: 100%;
  padding: $spacing-sm $spacing-md;
  font-size: 1rem;
  color: $text-primary;
  background: $bg-primary;
  border: 1px solid $border-color;
  border-radius: $radius-md;
  transition: border-color $transition-base;
  
  &:focus {
    outline: none;
    border-color: $primary-color;
  }
}

.form-group__input--error {
  border-color: $error-color;
}

.form-group__error {
  font-size: 0.75rem;
  color: $error-color;
}

.login-form__submit {
  padding: $spacing-sm $spacing-md;
  font-size: 1rem;
  font-weight: 500;
  color: #ffffff;
  background: $primary-color;
  border: none;
  border-radius: $radius-md;
  cursor: pointer;
  text-align: center;
  text-decoration: none;
  transition: background $transition-base;
  
  &:hover:not(:disabled) {
    background: darken($primary-color, 10%);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.auth-links {
  margin-top: $spacing-md;
  text-align: center;
}

.auth-link {
  font-size: 0.875rem;
  color: $primary-color;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
}

.success-message {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
}

.success-icon {
  width: 64px;
  height: 64px;
  background: rgba($success-color, 0.1);
  color: $success-color;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  font-weight: bold;
}
</style>
