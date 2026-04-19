<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-card__header">
        <h1 class="login-card__title">{{ $t('auth.loginTitle') }}</h1>
        <p class="login-card__subtitle">{{ $t('auth.loginSubtitle') }}</p>
      </div>

      <form class="login-form" @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email" class="form-group__label">{{ $t('common.email') }}</label>
          <input
            id="email"
            v-model="email"
            type="email"
            class="form-group__input"
            :class="{ 'form-group__input--error': errors.email }"
            :placeholder="$t('common.email')"
            required
            autocomplete="email"
          />
          <span v-if="errors.email" class="form-group__error">{{ errors.email }}</span>
        </div>

        <div class="form-group">
          <label for="password" class="form-group__label">{{ $t('common.password') }}</label>
          <input
            id="password"
            v-model="password"
            type="password"
            class="form-group__input"
            :class="{ 'form-group__input--error': errors.password }"
            :placeholder="$t('common.password')"
            required
            autocomplete="current-password"
          />
          <span v-if="errors.password" class="form-group__error">{{ errors.password }}</span>
        </div>

        <div v-if="errors.general" class="login-form__error">
          {{ errors.general }}
        </div>

        <div class="auth-links-alt">
          <nuxt-link :to="`/t/${route.params.slug}/forgot-password`" class="auth-link-alt">
            {{ $t('auth.forgotPasswordLink', 'Забыли пароль?') }}
          </nuxt-link>
        </div>

        <button
          type="submit"
          class="login-form__submit"
          :disabled="loading"
        >
          {{ loading ? $t('auth.signingIn') : $t('auth.signIn') }}
        </button>
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
const email = ref('')
const password = ref('')
const loading = ref(false)
const errors = ref<{
  email?: string
  password?: string
  general?: string
}>({})

const { login } = useAuth()
const router = useRouter()
const route = useRoute()

const validateForm = (): boolean => {
  errors.value = {}
  
  if (!email.value) {
    errors.value.email = t('validation.required', { field: t('common.email') })
    return false
  }
  
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    errors.value.email = t('validation.emailInvalid')
    return false
  }
  
  if (!password.value) {
    errors.value.password = t('validation.required', { field: t('common.password') })
    return false
  }
  
  if (password.value.length < 6) {
    errors.value.password = t('validation.passwordMin', { min: 6 })
    return false
  }
  
  return true
}

const handleLogin = async () => {
  if (!validateForm()) {
    return
  }
  
  loading.value = true
  errors.value = {}
  
  try {
    await login(email.value, password.value)
    const { getTenantSlug } = useTenant()
    const tenantSlug = getTenantSlug() || route.params.slug as string
    
    if (tenantSlug) {
      await router.push(`/t/${tenantSlug}`)
    } else {
      await router.push('/')
    }
  } catch (error: any) {
    console.error('Login error:', error)
    
    if (error.response?.status === 401) {
      errors.value.general = t('auth.invalidCredentials')
    } else if (error.response?.status === 429) {
      errors.value.general = t('auth.tooManyAttempts')
    } else {
      errors.value.general = error.response?.data?.message || t('auth.loginError')
    }
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
  
  &::placeholder {
    color: $text-light;
  }
}

.form-group__input--error {
  border-color: $error-color;
}

.form-group__error {
  font-size: 0.75rem;
  color: $error-color;
}

.login-form__error {
  padding: $spacing-sm $spacing-md;
  font-size: 0.875rem;
  color: $error-color;
  background: rgba($error-color, 0.1);
  border-radius: $radius-sm;
  border-left: 3px solid $error-color;
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
  transition: background $transition-base;
  
  &:hover:not(:disabled) {
    background: darken($primary-color, 10%);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.auth-links-alt {
  text-align: right;
  margin-top: -$spacing-sm;
}

.auth-link-alt {
  font-size: 0.8125rem;
  color: $primary-color;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
}
</style>
