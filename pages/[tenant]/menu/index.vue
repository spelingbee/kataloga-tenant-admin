<script setup lang="ts">
import MenuItemList from '~/components/menu/MenuItemList.vue'
import MenuTabSwitcher from '~/components/menu/MenuTabSwitcher.vue'
import { PageHeader, FormDialog } from "~/components/ui";
import { useEnhancedMenuStore } from '~/stores/enhanced-menu'

const { t } = useI18n()
const menuStore = useEnhancedMenuStore()
const router = useRouter()
const { navigateToTenant } = useNavigation()

definePageMeta({
  middleware: ['auth']
})

const isCreatingMenu = ref(false)
const showCreateModal = ref(false)
const newMenuName = ref('Main Menu')

const handleAddItem = () => {
  navigateToTenant('/menu/items/new')
}

const handleCreateFirstMenu = async () => {
  try {
    isCreatingMenu.value = true
    await menuStore.createMenu({
      name: newMenuName.value,
      isActive: true
    })
    newMenuName.value = 'Main Menu'
  } catch (error) {
    console.error('Failed to create menu:', error)
  } finally {
    isCreatingMenu.value = false
  }
}

const handleCreateAdditionalMenu = async () => {
  if (!newMenuName.value) return
  
  try {
    isCreatingMenu.value = true
    await menuStore.createMenu({
      name: newMenuName.value,
      isActive: true
    })
    showCreateModal.value = false
    newMenuName.value = 'New Menu'
  } catch (error) {
    console.error('Failed to create additional menu:', error)
  } finally {
    isCreatingMenu.value = false
  }
}

const handleSelectMenu = async (id: string) => {
  const menu = menuStore.menus?.find(m => m.id === id)
  if (menu) {
    menuStore.currentMenu = menu
    // MenuItemList uses a watch on currentMenu to refetch items
  }
}

// Initial load
onMounted(async () => {
  const promises = []
  if (!menuStore.menus || menuStore.menus.length === 0) {
    promises.push(menuStore.fetchMenus())
  }
  // Catalog is used in the creation form, better to have it pre-fetched
  if (!menuStore.catalogProducts || menuStore.catalogProducts.length === 0) {
    promises.push(menuStore.fetchCatalog())
  }
  
  if (promises.length > 0) {
    await Promise.all(promises)
  }
})
</script>

<template>
  <div class="menu-page">
    <PageHeader 
      :title="t('menu.title')" 
      :subtitle="t('menu.subtitle')"
      :back-label="t('dashboard.title')"
      back-to="/"
    >
      <template #actions v-if="menuStore.menus?.length > 0">
        <button class="menu-page__add-btn" @click="handleAddItem">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          {{ t('menu.addMenuItem') }}
        </button>
      </template>
    </PageHeader>

    <div v-if="menuStore.isFetching && (!menuStore.menus || menuStore.menus.length === 0)" class="menu-page__loading">
      <div class="loading-spinner" />
      <p>{{ t('common.loading') }}</p>
    </div>

    <div v-else-if="!menuStore.menus || menuStore.menus.length === 0" class="menu-page__empty">
      <div class="menu-page__empty-card">
        <EmptyState
          icon="📋"
          :title="t('menu.noMenusYet')"
          :description="t('menu.createFirstMenuDesc')"
        />
        
        <div class="empty-card__form">
          <input 
            v-model="newMenuName" 
            type="text" 
            :placeholder="t('menu.namePlaceholder') || 'Название меню (например, Основное)'"
            class="empty-card__input"
          />
          <button 
            class="empty-card__btn" 
            :disabled="!newMenuName || isCreatingMenu"
            @click="handleCreateFirstMenu"
          >
            <span v-if="isCreatingMenu" class="loading-spinner-small"></span>
            {{ t('menu.createMenu') || 'Создать меню' }}
          </button>
        </div>
      </div>
    </div>

    <div v-else class="menu-page__main-content">
      <MenuTabSwitcher 
        :menus="menuStore.menus" 
        :current-menu-id="menuStore.currentMenu?.id || null"
        @select="handleSelectMenu"
        @create="showCreateModal = true"
      />
      
      <MenuItemList />
    </div>

    <!-- Create Menu Modal -->
    <FormDialog
      v-if="showCreateModal"
      :show="showCreateModal"
      :title="t('menu.createMenu')"
      @close="showCreateModal = false"
      @submit="handleCreateAdditionalMenu"
    >
      <div class="menu-create-form">
        <label class="menu-create-form__label">{{ t('common.name') }}</label>
        <input 
          v-model="newMenuName" 
          type="text" 
          class="menu-create-form__input"
          :placeholder="t('menu.namePlaceholder')"
          autofocus
        />
      </div>
    </FormDialog>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/scss/variables' as *;

.menu-page {
  padding: $spacing-xl;
  min-height: 100vh;
  background: $bg-secondary;
}

.menu-page__empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: $spacing-2xl $spacing-xl;
  margin-top: $spacing-2xl;
}

.empty-card {
  background: $bg-primary;
  padding: $spacing-2xl;
  border-radius: $radius-lg;
  box-shadow: $shadow-md;
  text-align: center;
  max-width: 500px;
  width: 100%;
  border: 1px solid $border-light;

  &__icon {
    width: 64px;
    height: 64px;
    background: rgba($primary-color, 0.1);
    color: $primary-color;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto $spacing-lg;

    svg {
      width: 32px;
      height: 32px;
    }
  }

  h2 {
    font-size: $font-size-2xl;
    font-weight: $font-weight-bold;
    color: $text-primary;
    margin-bottom: $spacing-sm;
  }

  p {
    font-size: $font-size-base;
    color: $text-secondary;
    margin-bottom: $spacing-xl;
    line-height: 1.5;
  }

  &__form {
    display: flex;
    flex-direction: column;
    gap: $spacing-md;
  }

  &__input {
    padding: $spacing-md;
    border: 1px solid $border-color;
    border-radius: $radius-md;
    font-size: $font-size-base;
    width: 100%;
    
    &:focus {
      outline: none;
      border-color: $primary-color;
      box-shadow: 0 0 0 2px rgba($primary-color, 0.1);
    }
  }

  &__btn {
    padding: $spacing-md;
    background: $primary-color;
    color: white;
    border: none;
    border-radius: $radius-md;
    font-size: $font-size-base;
    font-weight: $font-weight-bold;
    cursor: pointer;
    transition: all $transition-base;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: $spacing-sm;

    &:hover:not(:disabled) {
      background: $primary-dark;
      transform: translateY(-1px);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
}

.menu-page__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $spacing-2xl;
  gap: $spacing-md;
  color: $text-secondary;
}

.loading-spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(white, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.menu-page__add-btn {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-sm $spacing-lg;
  font-size: $font-size-base;
  font-weight: $font-weight-medium;
  color: $text-white;
  background: $primary-color;
  border: none;
  border-radius: $radius-md;
  cursor: pointer;
  transition: background $transition-base;
  
  svg {
    width: 20px;
    height: 20px;
  }
  
  &:hover {
    background: $primary-dark;
  }
}

.menu-page__main-content {
  display: flex;
  flex-direction: column;
}

.menu-create-form {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
  padding: $spacing-md 0;

  &__label {
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    color: $text-secondary;
  }

  &__input {
    padding: $spacing-sm;
    border: 1px solid $border-color;
    border-radius: $radius-md;
    font-size: $font-size-base;
    
    &:focus {
      outline: none;
      border-color: $primary-color;
      box-shadow: 0 0 0 2px rgba($primary-color, 0.1);
    }
  }
}
</style>
