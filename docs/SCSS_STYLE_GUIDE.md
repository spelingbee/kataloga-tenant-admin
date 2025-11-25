# SCSS Style Guide

This document describes the SCSS styling rules for the Tenant Admin Dashboard project.

## Table of Contents

1. [Core Principles](#core-principles)
2. [BEM Methodology](#bem-methodology)
3. [File Organization](#file-organization)
4. [Variables](#variables)
5. [Nesting Rules](#nesting-rules)
6. [Component Styling](#component-styling)
7. [Common Patterns](#common-patterns)
8. [Best Practices](#best-practices)

## Core Principles

### 1. BEM Methodology WITHOUT Nested Selectors

**❌ WRONG:**
```scss
.data-table {
  &__header {
    &--sortable {
      cursor: pointer;
    }
  }
}
```

**✅ CORRECT:**
```scss
.data-table {
  width: 100%;
}

.data-table__header {
  padding: $spacing-md;
}

.data-table__header--sortable {
  cursor: pointer;
}
```

**Why:** Nested selectors with `&__` reduce readability and make code harder to search.

### 2. Variables Required

**❌ WRONG:**
```scss
.button {
  padding: 8px 16px;
  border-radius: 4px;
  color: #0ea5e9;
}
```

**✅ CORRECT:**
```scss
.button {
  padding: $spacing-sm $spacing-md;
  border-radius: $radius-sm;
  color: $primary-color;
}
```

### 3. DART SASS Syntax

**❌ WRONG (old syntax):**
```scss
@import 'variables';
@import 'components/ui';
```

**✅ CORRECT (DART SASS):**
```scss
@use './variables' as *;
@use './components/ui';
```

### 4. Component Co-location

Styles should live next to the components they style:

```
components/
├── ui/
│   ├── DataTable/
│   │   ├── DataTable.vue
│   │   └── _data-table.scss
│   └── Modal/
│       ├── Modal.vue
│       ├── _base.scss
│       └── _modal.scss
```

## BEM Methodology

### Block-Element-Modifier Structure

```scss
// Block
.menu-item-card {
  padding: $spacing-md;
  background: $bg-primary;
}

// Element
.menu-item-card__title {
  font-size: 1.25rem;
  color: $text-primary;
}

.menu-item-card__price {
  font-size: 1.125rem;
  color: $primary-color;
}

// Modifier
.menu-item-card--featured {
  border: 2px solid $primary-color;
}

.menu-item-card__title--large {
  font-size: 1.5rem;
}
```

### BEM Naming Rules

1. **Block**: `.block-name`
2. **Element**: `.block-name__element-name`
3. **Modifier**: `.block-name--modifier-name` or `.block-name__element--modifier`
4. **Use kebab-case**: `menu-item-card` not `menuItemCard`
5. **No nested BEM**: Write each class separately

## File Organization

### Directory Structure

```
assets/scss/
├── main.scss              # Main entry point
├── _variables.scss        # All variables
├── _utilities.scss        # Global utility classes
├── abstracts/
│   ├── _mixins.scss      # Mixins
│   └── _functions.scss   # Functions
└── base/
    ├── _reset.scss       # Reset styles
    └── _typography.scss  # Typography
```

### Component Organization Rules

**Rule:** If styles > 100 lines OR component has sub-components, create a folder.

**Option A: Simple Component (<100 lines)**
```
components/ui/
└── FormInput.vue         # Styles inside component
```

**Option B: Medium Component (>100 lines)**
```
components/ui/
├── DataTable.vue
└── _data-table.scss      # Styles next to component
```

**Option C: Complex Component (folder with sub-components)**
```
components/ui/
└── Modal/
    ├── Modal.vue               # Main component
    ├── _base.scss              # Shared styles
    ├── _modal.scss             # Modal.vue styles
    ├── ConfirmDialog.vue       # Sub-component
    ├── _confirm-dialog.scss    # ConfirmDialog.vue styles
    ├── FormDialog.vue          # Sub-component
    └── _form-dialog.scss       # FormDialog.vue styles
```

### main.scss Structure

```scss
// Variables and abstractions
@use './variables' as *;
@use './abstracts/mixins' as *;
@use './abstracts/functions' as *;

// Base styles
@use './base/reset';
@use './base/typography';

// Global utilities (NOT component styles!)
@use './utilities';

// Component styles are imported in components themselves
```

## Variables

### Required Variable Categories

```scss
// _variables.scss

// Colors
$primary-color: #0ea5e9;
$secondary-color: #64748b;
$success-color: #10b981;
$warning-color: #f59e0b;
$error-color: #ef4444;
$info-color: #3b82f6;

// Backgrounds
$bg-primary: #ffffff;
$bg-secondary: #f8fafc;
$bg-dark: #0f172a;

// Text
$text-primary: #0f172a;
$text-secondary: #64748b;
$text-light: #94a3b8;

// Borders
$border-color: #e2e8f0;
$border-dark: #cbd5e1;

// Spacing
$spacing-xs: 0.25rem;
$spacing-sm: 0.5rem;
$spacing-md: 1rem;
$spacing-lg: 1.5rem;
$spacing-xl: 2rem;
$spacing-2xl: 3rem;

// Border Radius
$radius-sm: 0.25rem;
$radius-md: 0.5rem;
$radius-lg: 0.75rem;
$radius-full: 9999px;

// Shadows
$shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
$shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
$shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);

// Transitions
$transition-fast: 150ms ease-in-out;
$transition-base: 200ms ease-in-out;
$transition-slow: 300ms ease-in-out;

// Breakpoints
$breakpoint-sm: 640px;
$breakpoint-md: 768px;
$breakpoint-lg: 1024px;
$breakpoint-xl: 1280px;

// Z-index
$z-dropdown: 1000;
$z-modal: 2000;
$z-toast: 3000;
```

### Using Variables

```scss
@use '@/assets/scss/variables' as *;

.button {
  padding: $spacing-sm $spacing-md;
  background: $primary-color;
  border-radius: $radius-md;
  transition: background $transition-base;
  
  &:hover {
    background: darken($primary-color, 10%);
  }
}
```

## Nesting Rules

### Allowed Nesting (2-3 levels with context)

**✅ Pseudo-classes:**
```scss
.button {
  background: $primary-color;
  
  &:hover {
    background: darken($primary-color, 10%);
  }
  
  &:disabled {
    opacity: 0.5;
  }
}
```

**✅ Modifiers:**
```scss
.button {
  padding: $spacing-sm $spacing-md;
  
  &.is-loading {
    opacity: 0.7;
  }
}
```

**✅ Media queries:**
```scss
.card {
  padding: $spacing-lg;
  
  @media (max-width: $breakpoint-md) {
    padding: $spacing-md;
  }
}
```

**✅ Contextual nesting (2-3 levels):**
```scss
.card {
  padding: $spacing-md;
  
  button {
    margin-top: $spacing-sm;
    
    &:hover {  // 2 levels - OK
      background: $bg-secondary;
    }
    
    &:disabled {
      opacity: 0.5;
      
      &:hover {  // 3 levels - OK with context
        background: transparent;
      }
    }
  }
}
```

### Forbidden Nesting

**❌ Deep nesting without context:**
```scss
.data-table {
  .wrapper {
    .header {
      .title {  // ❌ 4 levels without context
        font-size: 1.5rem;
      }
    }
  }
}
```

**❌ Nested BEM elements:**
```scss
.card {
  &__header {  // ❌
    &__title { // ❌
    }
  }
}
```

## Component Styling

### Simple Component (Styles Inside)

```vue
<!-- components/ui/LoadingSpinner.vue -->
<template>
  <div class="loading-spinner">
    <div class="loading-spinner__circle"></div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/scss/variables' as *;

.loading-spinner {
  display: inline-block;
  width: 2rem;
  height: 2rem;
}

.loading-spinner__circle {
  width: 100%;
  height: 100%;
  border: 2px solid $border-color;
  border-top-color: $primary-color;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
```

### Medium Component (External Styles)

```vue
<!-- components/ui/DataTable.vue -->
<template>
  <div class="data-table">
    <div class="data-table__header">
      <!-- Header content -->
    </div>
    <div class="data-table__body">
      <!-- Body content -->
    </div>
  </div>
</template>

<style scoped lang="scss">
@use './data-table';
</style>
```

```scss
// components/ui/_data-table.scss
@use '../../assets/scss/variables' as *;

.data-table {
  width: 100%;
  border: 1px solid $border-color;
  border-radius: $radius-md;
}

.data-table__header {
  padding: $spacing-md;
  background: $bg-secondary;
  border-bottom: 1px solid $border-color;
}

.data-table__header-cell {
  font-weight: 600;
  color: $text-primary;
}

.data-table__header-cell--sortable {
  cursor: pointer;
  
  &:hover {
    color: $primary-color;
  }
}

.data-table__body {
  padding: $spacing-sm;
}

.data-table__row {
  padding: $spacing-sm $spacing-md;
  border-bottom: 1px solid $border-color;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background: $bg-secondary;
  }
}

.data-table__cell {
  padding: $spacing-sm;
}
```

### Complex Component (Folder Structure)

```vue
<!-- components/ui/Modal/Modal.vue -->
<template>
  <div class="modal-overlay">
    <div class="modal">
      <div class="modal__header">
        <h3 class="modal__title">{{ title }}</h3>
      </div>
      <div class="modal__body">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use './base';    // Shared modal styles
@use './modal';   // Modal.vue specific styles
</style>
```

```scss
// components/ui/Modal/_base.scss
@use '../../../assets/scss/variables' as *;

// Shared styles for all modal components
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: $z-modal;
}

.modal {
  background: $bg-primary;
  border-radius: $radius-lg;
  box-shadow: $shadow-lg;
  max-width: 90vw;
  max-height: 90vh;
  overflow: auto;
}

.modal__header {
  padding: $spacing-lg;
  border-bottom: 1px solid $border-color;
}

.modal__title {
  font-size: 1.25rem;
  font-weight: 600;
  color: $text-primary;
}

.modal__body {
  padding: $spacing-lg;
}
```

```scss
// components/ui/Modal/_modal.scss
@use '../../../assets/scss/variables' as *;

// Modal.vue specific styles (if needed)
```

## Common Patterns

### Button Styles

```scss
.btn {
  padding: $spacing-sm $spacing-md;
  border: none;
  border-radius: $radius-md;
  font-weight: 500;
  cursor: pointer;
  transition: all $transition-base;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.btn--primary {
  background: $primary-color;
  color: white;
  
  &:hover:not(:disabled) {
    background: darken($primary-color, 10%);
  }
}

.btn--secondary {
  background: $secondary-color;
  color: white;
  
  &:hover:not(:disabled) {
    background: darken($secondary-color, 10%);
  }
}

.btn--outline {
  background: transparent;
  border: 1px solid $border-color;
  color: $text-primary;
  
  &:hover:not(:disabled) {
    background: $bg-secondary;
  }
}

.btn--sm {
  padding: $spacing-xs $spacing-sm;
  font-size: 0.875rem;
}

.btn--lg {
  padding: $spacing-md $spacing-lg;
  font-size: 1.125rem;
}
```

### Form Styles

```scss
.form-field {
  margin-bottom: $spacing-lg;
}

.form-field__label {
  display: block;
  margin-bottom: $spacing-xs;
  font-weight: 500;
  color: $text-primary;
}

.form-field__input {
  width: 100%;
  padding: $spacing-sm $spacing-md;
  border: 1px solid $border-color;
  border-radius: $radius-md;
  font-size: 1rem;
  transition: border-color $transition-base;
  
  &:focus {
    outline: none;
    border-color: $primary-color;
  }
  
  &:disabled {
    background: $bg-secondary;
    cursor: not-allowed;
  }
}

.form-field__error {
  display: block;
  margin-top: $spacing-xs;
  color: $error-color;
  font-size: 0.875rem;
}

.form-field__hint {
  display: block;
  margin-top: $spacing-xs;
  color: $text-secondary;
  font-size: 0.875rem;
}
```

### Card Styles

```scss
.card {
  background: $bg-primary;
  border: 1px solid $border-color;
  border-radius: $radius-lg;
  padding: $spacing-lg;
  box-shadow: $shadow-sm;
}

.card__header {
  margin-bottom: $spacing-md;
  padding-bottom: $spacing-md;
  border-bottom: 1px solid $border-color;
}

.card__title {
  font-size: 1.25rem;
  font-weight: 600;
  color: $text-primary;
}

.card__body {
  color: $text-secondary;
}

.card__footer {
  margin-top: $spacing-md;
  padding-top: $spacing-md;
  border-top: 1px solid $border-color;
}
```

## Best Practices

### 1. Use Semantic Class Names

```scss
// ✅ Good
.menu-item-card
.user-profile-header
.sales-analytics-chart

// ❌ Bad
.box
.container-1
.blue-text
```

### 2. Avoid Magic Numbers

```scss
// ❌ Bad
.card {
  padding: 24px;
  margin-bottom: 16px;
}

// ✅ Good
.card {
  padding: $spacing-lg;
  margin-bottom: $spacing-md;
}
```

### 3. Use Consistent Spacing

```scss
// Use spacing scale consistently
$spacing-xs: 0.25rem;   // 4px
$spacing-sm: 0.5rem;    // 8px
$spacing-md: 1rem;      // 16px
$spacing-lg: 1.5rem;    // 24px
$spacing-xl: 2rem;      // 32px
```

### 4. Mobile-First Approach

```scss
.card {
  padding: $spacing-md;
  
  // Tablet and up
  @media (min-width: $breakpoint-md) {
    padding: $spacing-lg;
  }
  
  // Desktop and up
  @media (min-width: $breakpoint-lg) {
    padding: $spacing-xl;
  }
}
```

### 5. Use CSS Custom Properties for Dynamic Values

```scss
.theme-switcher {
  --theme-primary: #{$primary-color};
  --theme-background: #{$bg-primary};
  
  background: var(--theme-background);
  color: var(--theme-primary);
}
```

### 6. Avoid !important

```scss
// ❌ Bad
.button {
  color: red !important;
}

// ✅ Good - increase specificity properly
.modal .button {
  color: red;
}
```

### 7. Use Mixins for Repeated Patterns

```scss
// abstracts/_mixins.scss
@mixin truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

// Usage
.menu-item-card__title {
  @include truncate;
}

.loading-spinner {
  @include flex-center;
}
```

## Checklist Before Commit

- [ ] No nested BEM selectors (`&__` or `&--`)
- [ ] All BEM classes written separately
- [ ] Variables used instead of hardcoded values
- [ ] Nesting limited to 2-3 levels with context
- [ ] Styles >100 lines in separate files
- [ ] Complex components in folders
- [ ] Using `@use` instead of `@import`
- [ ] All style files have `_` prefix (except main.scss)
- [ ] Semantic class names
- [ ] Mobile-first media queries

## Common Mistakes

### ❌ Mistake 1: Nested BEM
```scss
.card {
  &__header {  // ❌
    &__title { // ❌
    }
  }
}
```

### ✅ Correct:
```scss
.card {
  padding: $spacing-md;
}

.card__header {
  border-bottom: 1px solid $border-color;
}

.card__header-title {
  font-size: 1.25rem;
}
```

### ❌ Mistake 2: Deep Nesting
```scss
.table {
  .row {        // ❌ Level 1
    .cell {     // ❌ Level 2
      span {    // ❌ Level 3
      }
    }
  }
}
```

### ✅ Correct:
```scss
.table {
  width: 100%;
}

.table__row {
  border-bottom: 1px solid $border-color;
}

.table__cell {
  padding: $spacing-sm;
  
  span {  // ✅ Only 1 level
    font-weight: 500;
  }
}
```

### ❌ Mistake 3: Hardcoded Values
```scss
.button {
  padding: 8px 16px;      // ❌
  border-radius: 4px;     // ❌
  color: #0ea5e9;         // ❌
}
```

### ✅ Correct:
```scss
.button {
  padding: $spacing-sm $spacing-md;
  border-radius: $radius-sm;
  color: $primary-color;
}
```

## Resources

- [BEM Methodology](http://getbem.com/)
- [SASS Documentation](https://sass-lang.com/)
- [CSS Guidelines](https://cssguidelin.es/)

## Summary

Following these SCSS guidelines ensures:
- **Readability**: Easy to find and understand code
- **Maintainability**: Easy to change and extend
- **Consistency**: Uniform style across the project
- **Performance**: Optimized CSS output
