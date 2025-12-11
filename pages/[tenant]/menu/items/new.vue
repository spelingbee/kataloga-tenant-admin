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
        Back to Menu
      </button>

      <h1 class="menu-item-new-page__title">Add New Menu Item</h1>
      <p class="menu-item-new-page__subtitle">
        Create a new item for your menu
      </p>
    </div>

    <MenuItemForm
      submit-label="Create Menu Item"
      :loading="loading"
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
import { ref } from 'vue'
import type { MenuItem } from '~/types'
import MenuItemForm from '~/components/menu/MenuItemForm.vue'

definePageMeta({
  middleware: ['auth'],
})

const menuStore = useMenuStore()
const router = useRouter()

const loading = ref(false)
const error = ref<string>('')

const handleCreate = async (data: Partial<MenuItem>) => {
  loading.value = true
  error.value = ''

  try {
    // Get current menu or use first menu
    if (!menuStore.currentMenu) {
      await menuStore.fetchMenus()
    }

    if (!menuStore.currentMenu) {
      error.value = 'No menu found. Please create a menu first.'
      return
    }

    await menuStore.createMenuItem(menuStore.currentMenu.id, data)

    // Show success notification (you can add a toast notification here)
    console.log('Menu item created successfully')

    // Navigate back to menu list
    await navigateToTenant('/menu')
  } catch (err: any) {
    console.error('Failed to create menu item:', err)
    error.value = err.response?.data?.message || 'Failed to create menu item. Please try again.'
  } finally {
    loading.value = false
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
