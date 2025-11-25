<template>
  <div class="register-page">
    <div class="register-card">
      <div class="register-card__header">
        <h1 class="register-card__title">Tenant Registration</h1>
        <p class="register-card__subtitle">Create your restaurant account</p>
      </div>

      <form class="register-form" @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="firstName" class="form-group__label">First Name</label>
          <input
            id="firstName"
            v-model="formData.firstName"
            type="text"
            class="form-group__input"
            :class="{ 'form-group__input--error': errors.firstName }"
            placeholder="Enter your first name"
            required
          />
          <span v-if="errors.firstName" class="form-group__error">{{ errors.firstName }}</span>
        </div>

        <div class="form-group">
          <label for="lastName" class="form-group__label">Last Name</label>
          <input
            id="lastName"
            v-model="formData.lastName"
            type="text"
            class="form-group__input"
            :class="{ 'form-group__input--error': errors.lastName }"
            placeholder="Enter your last name"
            required
          />
          <span v-if="errors.lastName" class="form-group__error">{{ errors.lastName }}</span>
        </div>

        <div class="form-group">
          <label for="email" class="form-group__label">Email</label>
          <input
            id="email"
            v-model="formData.email"
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
          <label for="tenantName" class="form-group__label">Restaurant Name</label>
          <input
            id="tenantName"
            v-model="formData.tenantName"
            type="text"
            class="form-group__input"
            :class="{ 'form-group__input--error': errors.tenantName }"
            placeholder="Enter your restaurant name"
            required
          />
          <span v-if="errors.tenantName" class="form-group__error">{{ errors.tenantName }}</span>
        </div>

        <div class="form-group">
          <label for="password" class="form-group__label">Password</label>
          <input
            id="password"
            v-model="formData.password"
            type="password"
            class="form-group__input"
            :class="{ 'form-group__input--error': errors.password }"
            placeholder="Enter your password"
            required
            autocomplete="new-password"
          />
          <span v-if="errors.password" class="form-group__error">{{ errors.password }}</span>
        </div>

        <div class="form-group">
          <label for="confirmPassword" class="form-group__label">Confirm Password</label>
          <input
            id="confirmPassword"
            v-model="formData.confirmPassword"
            type="password"
            class="form-group__input"
            :class="{ 'form-group__input--error': errors.confirmPassword }"
            placeholder="Confirm your password"
            required
            autocomplete="new-password"
          />
          <span v-if="errors.confirmPassword" class="form-group__error">{{ errors.confirmPassword }}</span>
        </div>

        <div v-if="errors.general" class="register-form__error">
          {{ errors.general }}
        </div>

        <button
          type="submit"
          class="register-form__submit"
          :disabled="loading"
        >
          {{ loading ? 'Creating Account...' : 'Create Account' }}
        </button>

        <div class="register-form__footer">
          <p class="register-form__footer-text">
            Already have an account?
            <NuxtLink to="/login" class="register-form__footer-link">Sign In</NuxtLink>
          </p>
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

const formData = ref({
  firstName: '',
  lastName: '',
  email: '',
  tenantName: '',
  password: '',
  confirmPassword: '',
})

const loading = ref(false)
const errors = ref<{
  firstName?: string
  lastName?: string
  email?: string
  tenantName?: string
  password?: string
  confirmPassword?: string
  general?: string
}>({})

const api = useApi()
const router = useRouter()

const validateForm = (): boolean => {
  errors.value = {}
  
  if (!formData.value.firstName) {
    errors.value.firstName = 'First name is required'
    return false
  }
  
  if (!formData.value.lastName) {
    errors.value.lastName = 'Last name is required'
    return false
  }
  
  if (!formData.value.email) {
    errors.value.email = 'Email is required'
    return false
  }
  
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email)) {
    errors.value.email = 'Please provide a valid email address'
    return false
  }
  
  if (!formData.value.tenantName) {
    errors.value.tenantName = 'Restaurant name is required'
    return false
  }
  
  if (!formData.value.password) {
    errors.value.password = 'Password is required'
    return false
  }
  
  if (formData.value.password.length < 6) {
    errors.value.password = 'Password must be at least 6 characters long'
    return false
  }
  
  if (formData.value.password !== formData.value.confirmPassword) {
    errors.value.confirmPassword = 'Passwords do not match'
    return false
  }
  
  return true
}

const handleRegister = async () => {
  if (!validateForm()) {
    return
  }
  
  loading.value = true
  errors.value = {}
  
  try {
    // Call tenant registration endpoint
    await api.post('/tenant-registration/register', {
      firstName: formData.value.firstName,
      lastName: formData.value.lastName,
      email: formData.value.email,
      tenantName: formData.value.tenantName,
      password: formData.value.password,
    })
    
    // Registration successful, redirect to login
    await router.push('/login')
  } catch (error: any) {
    console.error('Registration error:', error)
    
    if (error.response?.status === 400) {
      errors.value.general = error.response?.data?.message || 'Invalid registration data'
    } else if (error.response?.status === 409) {
      errors.value.general = 'Email or tenant name already exists'
    } else {
      errors.value.general = 'An error occurred during registration. Please try again.'
    }
  } finally {
    loading.value = false
  }
}
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
  max-width: 500px;
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

.register-form {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
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

.register-form__error {
  padding: $spacing-sm $spacing-md;
  font-size: 0.875rem;
  color: $error-color;
  background: rgba($error-color, 0.1);
  border-radius: $radius-sm;
  border-left: 3px solid $error-color;
}

.register-form__submit {
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

.register-form__footer {
  margin-top: $spacing-md;
  text-align: center;
}

.register-form__footer-text {
  margin: 0;
  font-size: 0.875rem;
  color: $text-secondary;
}

.register-form__footer-link {
  color: $primary-color;
  text-decoration: none;
  font-weight: 500;
  
  &:hover {
    text-decoration: underline;
  }
}
</style>
