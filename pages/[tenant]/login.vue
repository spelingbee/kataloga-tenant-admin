<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-card__header">
        <h1 class="login-card__title">Tenant Admin Login</h1>
        <p class="login-card__subtitle">Sign in to manage your restaurant</p>
      </div>

      <form class="login-form" @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email" class="form-group__label">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            class="form-group__input"
            :class="{ 'form-group__input--error': errors.email }"
            placeholder="Enter your email"
            required
            autocomplete="email"
          />
          <span v-if="errors.email" class="form-group__error">{{ errors.email }}</span>
        </div>

        <div class="form-group">
          <label for="password" class="form-group__label">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            class="form-group__input"
            :class="{ 'form-group__input--error': errors.password }"
            placeholder="Enter your password"
            required
            autocomplete="current-password"
          />
          <span v-if="errors.password" class="form-group__error">{{ errors.password }}</span>
        </div>

        <div v-if="errors.general" class="login-form__error">
          {{ errors.general }}
        </div>

        <button
          type="submit"
          class="login-form__submit"
          :disabled="loading"
        >
          {{ loading ? 'Signing in...' : 'Sign In' }}
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

const validateForm = (): boolean => {
  errors.value = {}
  
  if (!email.value) {
    errors.value.email = 'Email is required'
    return false
  }
  
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    errors.value.email = 'Please provide a valid email address'
    return false
  }
  
  if (!password.value) {
    errors.value.password = 'Password is required'
    return false
  }
  
  if (password.value.length < 6) {
    errors.value.password = 'Password must be at least 6 characters long'
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
    const tenantSlug = getTenantSlug()
    await router.push(`/${tenantSlug}`)
  } catch (error: any) {
    console.error('Login error:', error)
    
    if (error.response?.status === 401) {
      errors.value.general = 'Invalid email or password'
    } else if (error.response?.status === 429) {
      errors.value.general = 'Too many login attempts. Please try again later.'
    } else {
      errors.value.general = error.response?.data?.message || 'An error occurred during login. Please try again.'
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
</style>
