<template>
  <div class="menu-item-new-page">
    <div class="menu-item-new-page__header">
      <button
        class="menu-item-new-page__back-btn"
        @click="handleCancel"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        {{ t('menu.backToMenu') }}
      </button>

      <h1 class="menu-item-new-page__title">{{ t('menu.addMenuItem') }}</h1>
      <p class="menu-item-new-page__subtitle">
        {{ t('menu.newItemSubtitle') }}
      </p>
    </div>

    <MenuItemForm
      :submit-label="t('common.create')"
      :loading="isSubmitting"
      @submit="handleCreate"
      @cancel="handleCancel"
    />

    <div v-if="error" class="menu-item-new-page__error">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useEnhancedMenuStore } from '~/stores/enhanced-menu'
import MenuItemForm from '~/components/menu/MenuItemForm.vue'

const { t } = useI18n()
const menuStore = useEnhancedMenuStore()
const { isSubmitting, currentMenu } = storeToRefs(menuStore)
const error = ref<string>('')

const route = useRoute()

const handleCreate = async (data: any) => {
  error.value = ''

  try {
    // Optimization: If we have menus in store but currentMenu isn't set, 
    // pick the first one instead of making a new API request.
    if (!currentMenu.value && menuStore.menus.length > 0) {
      menuStore.currentMenu = menuStore.menus[0]
    }

    if (!currentMenu.value) {
      await menuStore.fetchMenus()
    }

    if (!currentMenu.value) {
      const tenantSlug = route.params.tenant as string
      error.value = t('errors.noMenuFound') || 'No menu found. Please contact support to set up your menu first.'
      console.error('No menu available for tenant:', tenantSlug)
      return
    }

    await menuStore.createMenuItem(currentMenu.value.id, data)
    await handleCancel()
  } catch (err: any) {
    console.error('Failed to create menu item:', err)
    error.value = err.message || t('errors.saveFailed')
  }
}

const { navigateToTenant } = useNavigation()

const handleCancel = () => {
  navigateToTenant('/menu')
}
</script>

<style scoped lang="scss">
@use '@/assets/scss/variables' as *;

.menu-item-new-page {
  padding: $spacing-xl;
  min-height: 100vh;
  background: $bg-secondary;
}

.menu-item-new-page__header {
  max-width: 800px;
  margin-bottom: $spacing-xl;
}

.menu-item-new-page__back-btn {
  display: inline-flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-sm $spacing-md;
  margin-bottom: $spacing-lg;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  color: $text-secondary;
  background: transparent;
  border: none;
  border-radius: $radius-md;
  cursor: pointer;
  transition: all $transition-base;
  
  svg {
    width: 18px;
    height: 18px;
  }
  
  &:hover {
    color: $primary-color;
    background: $bg-primary;
  }
}

.menu-item-new-page__title {
  margin: 0 0 $spacing-xs 0;
  font-size: $font-size-3xl;
  font-weight: $font-weight-bold;
  color: $text-primary;
}

.menu-item-new-page__subtitle {
  margin: 0;
  font-size: $font-size-lg;
  color: $text-secondary;
}

.menu-item-new-page__error {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  max-width: 800px;
  padding: $spacing-md;
  margin-top: $spacing-lg;
  font-size: $font-size-sm;
  color: $error-color;
  background: rgba($error-color, 0.1);
  border: 1px solid $error-color;
  border-radius: $radius-md;
  
  svg {
    flex-shrink: 0;
    width: 20px;
    height: 20px;
  }
}
</style>
