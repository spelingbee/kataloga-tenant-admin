<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-card__header">
        <h1 class="login-card__title">{{ $t('auth.resetPasswordTitle', 'Новый пароль') }}</h1>
        <p class="login-card__subtitle">
          {{ $t('auth.resetPasswordSubtitle', 'Введите новый пароль для вашей учетной записи') }}
        </p>
      </div>

      <div v-if="success" class="success-message">
        <p>{{ $t('auth.resetPasswordSuccess', 'Пароль успешно изменен') }}</p>
        <nuxt-link :to="`/${tenantSlug}/login`" class="login-form__submit link-btn">
          {{ $t('auth.signIn', 'Войти') }}
        </nuxt-link>
      </div>

      <form v-else class="login-form" @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="password" class="form-group__label">{{ $t('common.newPassword', 'Новый пароль') }}</label>
          <input
            id="password"
            v-model="password"
            type="password"
            class="form-group__input"
            :class="{ 'form-group__input--error': errors.password }"
            :placeholder="$t('common.newPassword', 'Новый пароль')"
            required
            autocomplete="new-password"
          />
          <span v-if="errors.password" class="form-group__error">{{ errors.password }}</span>
        </div>

        <div class="form-group">
          <label for="confirmPassword" class="form-group__label">{{ $t('common.confirmPassword', 'Подтвердите пароль') }}</label>
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            class="form-group__input"
            :class="{ 'form-group__input--error': errors.confirmPassword }"
            :placeholder="$t('common.confirmPassword', 'Подтвердите пароль')"
            required
            autocomplete="new-password"
          />
          <span v-if="errors.confirmPassword" class="form-group__error">{{ errors.confirmPassword }}</span>
        </div>

        <div v-if="errors.general" class="login-form__error">
          {{ errors.general }}
        </div>

        <button
          type="submit"
          class="login-form__submit"
          :disabled="loading"
        >
          {{ loading ? $t('common.saving', 'Сохранение...') : $t('auth.resetPassword', 'Сбросить пароль') }}
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
const { resetPassword } = useAuth()
const route = useRoute()
const router = useRouter()
const tenantSlug = computed(() => route.params.tenant as string)

const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const success = ref(false)
const errors = ref<{
  password?: string
  confirmPassword?: string
  general?: string
}>({})

const validateForm = (): boolean => {
  errors.value = {}
  
  if (password.value.length < 6) {
    errors.value.password = t('validation.passwordMin', { min: 6 })
    return false
  }
  
  if (password.value !== confirmPassword.value) {
    errors.value.confirmPassword = t('validation.passwordsDontMatch', 'Пароли не совпадают')
    return false
  }
  
  return true
}

const handleSubmit = async () => {
  if (!validateForm()) return
  
  const token = route.query.token as string
  if (!token) {
    errors.value.general = t('auth.invalidToken', 'Токен отсутствует или недействителен')
    return
  }
  
  loading.value = true
  errors.value = {}
  
  try {
    await resetPassword(token, password.value)
    success.value = true
    
    // Auto redirect after 3 seconds
    setTimeout(() => {
      router.push(`/${tenantSlug.value}/login`)
    }, 3000)
  } catch (err: any) {
    console.error('Reset password error:', err)
    errors.value.general = err.response?.data?.message || t('auth.resetPasswordError', 'Ошибка при сбросе пароля. Возможно, ссылка устарела.')
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

.success-message {
  text-align: center;
  background: rgba($success-color, 0.1);
  padding: $spacing-lg;
  border-radius: $radius-md;
  border: 1px solid $success-color;
  color: $success-color;
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
  
  p {
    margin: 0;
    font-weight: 500;
  }
}
</style>
