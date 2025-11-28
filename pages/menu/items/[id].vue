<template>
  <div class="menu-item-edit-page">
    <div class="menu-item-edit-page__header">
      <button
        class="menu-item-edit-page__back-btn"
        @click="handleCancel"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Menu
      </button>

      <h1 class="menu-item-edit-page__title">Edit Menu Item</h1>
      <p class="menu-item-edit-page__subtitle">
        Update menu item details
      </p>
    </div>

    <LoadingSpinner v-if="loadingItem" />

    <MenuItemForm
      v-else-if="menuItem"
      :initial-data="menuItem"
      submit-label="Update Menu Item"
      :loading="loading"
      @submit="handleUpdate"
      @cancel="handleCancel"
    />

    <div v-else-if="!loadingItem" class="menu-item-edit-page__not-found">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h2>Menu Item Not Found</h2>
      <p>The menu item you're looking for doesn't exist or has been deleted.</p>
      <button @click="handleCancel">
        Return to Menu
      </button>
    </div>

    <div v-if="error" class="menu-item-edit-page__error">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { MenuItem } from '~/types'
import MenuItemForm from '~/components/menu/MenuItemForm.vue'
import LoadingSpinner from '~/components/ui/LoadingSpinner.vue'

definePageMeta({
  middleware: ['auth'],
})

const route = useRoute()
const router = useRouter()
const menuStore = useMenuStore()

const itemId = route.params.id as string

const menuItem = ref<MenuItem | null>(null)
const loadingItem = ref(true)
const loading = ref(false)
const error = ref<string>('')

onMounted(async () => {
  await loadMenuItem()
})

const loadMenuItem = async () => {
  loadingItem.value = true
  error.value = ''

  try {
    // Get current menu or use first menu
    if (!menuStore.currentMenu) {
      await menuStore.fetchMenus()
    }

    if (!menuStore.currentMenu) {
      error.value = 'No menu found.'
      return
    }

    // Find the menu item in the store
    const item = menuStore.menuItems.find((i) => i.id === itemId)

    if (item) {
      menuItem.value = item
    } else {
      // If not in store, fetch menu items
      await menuStore.fetchMenuItems(menuStore.currentMenu.id)
      const foundItem = menuStore.menuItems.find((i) => i.id === itemId)
      
      if (foundItem) {
        menuItem.value = foundItem
      } else {
        menuItem.value = null
      }
    }
  } catch (err: any) {
    console.error('Failed to load menu item:', err)
    error.value = err.response?.data?.message || 'Failed to load menu item.'
  } finally {
    loadingItem.value = false
  }
}

const handleUpdate = async (data: Partial<MenuItem>) => {
  loading.value = true
  error.value = ''

  try {
    if (!menuStore.currentMenu) {
      error.value = 'No menu found.'
      return
    }

    await menuStore.updateMenuItem(menuStore.currentMenu.id, itemId, data)

    // Show success notification (you can add a toast notification here)
    console.log('Menu item updated successfully')

    // Navigate back to menu list
    await router.push('/menu')
  } catch (err: any) {
    console.error('Failed to update menu item:', err)
    error.value = err.response?.data?.message || 'Failed to update menu item. Please try again.'
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  router.push('/menu')
}
</script>

<style scoped lang="scss">
@use '@/assets/scss/variables' as *;

.menu-item-edit-page {
  padding: $spacing-xl;
  min-height: 100vh;
  background: $bg-secondary;
}

.menu-item-edit-page__header {
  max-width: 800px;
  margin-bottom: $spacing-xl;
}

.menu-item-edit-page__back-btn {
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

.menu-item-edit-page__title {
  margin: 0 0 $spacing-xs 0;
  font-size: $font-size-3xl;
  font-weight: $font-weight-bold;
  color: $text-primary;
}

.menu-item-edit-page__subtitle {
  margin: 0;
  font-size: $font-size-lg;
  color: $text-secondary;
}

.menu-item-edit-page__not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 500px;
  margin: $spacing-3xl auto;
  padding: $spacing-3xl;
  text-align: center;
  background: $bg-primary;
  border: 1px solid $border-color;
  border-radius: $radius-lg;
  
  svg {
    width: 64px;
    height: 64px;
    margin-bottom: $spacing-lg;
    color: $text-light;
  }
  
  h2 {
    margin: 0 0 $spacing-md 0;
    font-size: $font-size-2xl;
    font-weight: $font-weight-semibold;
    color: $text-primary;
  }
  
  p {
    margin: 0 0 $spacing-xl 0;
    font-size: $font-size-base;
    color: $text-secondary;
  }
  
  button {
    padding: $spacing-sm $spacing-xl;
    font-size: $font-size-base;
    font-weight: $font-weight-medium;
    color: $text-white;
    background: $primary-color;
    border: none;
    border-radius: $radius-md;
    cursor: pointer;
    transition: background $transition-base;
    
    &:hover {
      background: $primary-dark;
    }
  }
}

.menu-item-edit-page__error {
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
