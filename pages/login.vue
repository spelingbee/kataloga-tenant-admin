<template>
  <div class="login-redirect-page">
    <div class="bg-blobs">
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
    </div>

    <div class="content-card">
      <header class="header">
        <div class="logo">
          <Icon name="layout-dashboard" class="logo-icon" />
          <span>Kataloga Admin</span>
        </div>
        <h1>{{ t('landing.findDashboard') }}</h1>
        <p>{{ t('landing.enterSlug') }}</p>
      </header>

      <form @submit.prevent="handleRedirect" class="form">
        <div class="input-group">
          <label for="slug">{{ t('landing.enterSlug') }}</label>
          <div class="input-wrapper">
            <span class="prefix">admin.kataloga.kg/t/</span>
            <input 
              id="slug"
              v-model="slug" 
              type="text" 
              :placeholder="t('landing.slugPlaceholder')"
              required
              :class="{ 'has-error': error }"
            />
          </div>
          <p v-if="error" class="error-msg">{{ error }}</p>
        </div>

        <button type="submit" class="submit-btn" :disabled="!slug.trim()">
          {{ t('landing.go') }}
          <Icon name="arrow-right" size="18" />
        </button>
      </form>

      <footer class="footer">
        <p>
          {{ t('auth.alreadyHaveAccount') === 'Already have an account?' ? 'Don\'t have a restaurant yet?' : t('auth.signUp') }} 
          <NuxtLink to="/register" class="link">{{ t('landing.getStarted') }}</NuxtLink>
        </p>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import Icon from "../components/ui/Icon.vue";

definePageMeta({
  layout: false
})

const { t } = useI18n()
const slug = ref('')
const error = ref('')
const router = useRouter()

const handleRedirect = () => {
  if (!slug.value.trim()) {
    error.value = t('landing.slugRequired')
    return
  }

  const cleanSlug = slug.value.trim().toLowerCase().replace(/[^a-z0-9-]/g, '')
  if (cleanSlug.length < 2) {
    error.value = t('landing.invalidSlug')
    return
  }

  router.push(`/t/${cleanSlug}/login`)
}
</script>

<style scoped lang="scss">
@use '@/assets/scss/variables' as *;

.login-redirect-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #0f172a;
  color: #fff;
  position: relative;
  overflow: hidden;
  padding: 24px;
}

.bg-blobs {
  position: absolute;
  inset: 0;
  z-index: 0;
  
  .blob {
    position: absolute;
    width: 40vw;
    height: 40vw;
    border-radius: 50%;
    filter: blur(100px);
    opacity: 0.15;
  }
  
  .blob-1 {
    background: #3b82f6;
    top: -10%;
    right: -10%;
  }
  
  .blob-2 {
    background: #10b981;
    bottom: -10%;
    left: -10%;
  }
}

.content-card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 480px;
  background: rgba(30, 41, 59, 0.7);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 48px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.header {
  text-align: center;
  margin-bottom: 40px;
  
  .logo {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-bottom: 24px;
    font-weight: 700;
    font-size: 1.25rem;
    color: #3b82f6;
    
    .logo-icon {
      color: #3b82f6;
    }
  }
  
  h1 {
    font-size: 1.875rem;
    font-weight: 700;
    margin-bottom: 12px;
    background: linear-gradient(to right, #fff, #94a3b8);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  p {
    color: #94a3b8;
    line-height: 1.6;
  }
}

.form {
  margin-bottom: 32px;
}

.input-group {
  margin-bottom: 24px;
  
  label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    margin-bottom: 8px;
    color: #cbd5e1;
  }
}

.input-wrapper {
  display: flex;
  align-items: center;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 0 16px;
  transition: all 0.2s ease;
  
  &:focus-within {
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
  }
  
  .prefix {
    color: #64748b;
    font-size: 0.875rem;
    user-select: none;
    margin-right: 2px;
  }
  
  input {
    flex: 1;
    background: transparent;
    border: none;
    color: #fff;
    font-size: 1rem;
    padding: 12px 0;
    outline: none;
    
    &::placeholder {
      color: #475569;
    }
  }
}

.error-msg {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 8px;
}

.submit-btn {
  width: 100%;
  background: #3b82f6;
  color: #fff;
  border: none;
  border-radius: 12px;
  padding: 14px;
  font-weight: 600;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background: #2563eb;
    transform: translateY(-1px);
    box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.3);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.footer {
  text-align: center;
  color: #94a3b8;
  font-size: 0.875rem;
  
  .link {
    color: #3b82f6;
    text-decoration: none;
    font-weight: 600;
    
    &:hover {
      text-decoration: underline;
    }
  }
}

@media (max-width: 480px) {
  .content-card {
    padding: 32px 24px;
  }
  
  .input-wrapper {
    flex-wrap: wrap;
    padding: 8px 16px;
    
    .prefix {
      width: 100%;
      margin-bottom: 2px;
    }
  }
}
</style>
