<!--
  Example usage of Enhanced API Form Composable
  
  This demonstrates all the key features:
  - Nested field validation (dot-notation)
  - DOM-aware validation with fallback
  - Auto-scroll and focus
  - Dirty check (clear errors on change)
-->

<template>
  <div class="enhanced-form-example">
    <h2>Enhanced API Form Example</h2>
    
    <!-- Global errors display -->
    <div v-if="form.globalErrors.value.length > 0" class="global-errors">
      <h3>Form Errors:</h3>
      <ul>
        <li v-for="error in form.globalErrors.value" :key="error">
          {{ error }}
        </li>
      </ul>
    </div>
    
    <!-- Sample form -->
    <form @submit.prevent="handleSubmit">
      <!-- Simple field -->
      <div class="field">
        <label for="email">Email:</label>
        <input
          id="email"
          name="email"
          type="email"
          v-model="formData.email"
          @input="form.clearFieldError('email')"
          :class="{ error: form.getFieldError('email') }"
        />
        <span v-if="form.getFieldError('email')" class="field-error">
          {{ form.getFieldError('email') }}
        </span>
      </div>
      
      <!-- Nested fields (items array) -->
      <div class="nested-fields">
        <h3>Menu Items:</h3>
        <div v-for="(item, index) in formData.items" :key="index" class="item-field">
          <div class="field">
            <label :for="`items.${index}.name`">Item {{ index + 1 }} Name:</label>
            <input
              :id="`items.${index}.name`"
              :name="`items.${index}.name`"
              :data-field="`items.${index}.name`"
              v-model="item.name"
              @input="form.clearFieldError(`items.${index}.name`)"
              :class="{ error: form.getFieldError(`items.${index}.name`) }"
            />
            <span v-if="form.getFieldError(`items.${index}.name`)" class="field-error">
              {{ form.getFieldError(`items.${index}.name`) }}
            </span>
          </div>
          
          <div class="field">
            <label :for="`items.${index}.price`">Item {{ index + 1 }} Price:</label>
            <input
              :id="`items.${index}.price`"
              :name="`items.${index}.price`"
              :data-field="`items.${index}.price`"
              type="number"
              step="0.01"
              v-model="item.price"
              @input="form.clearFieldError(`items.${index}.price`)"
              :class="{ error: form.getFieldError(`items.${index}.price`) }"
            />
            <span v-if="form.getFieldError(`items.${index}.price`)" class="field-error">
              {{ form.getFieldError(`items.${index}.price`) }}
            </span>
          </div>
        </div>
        
        <button type="button" @click="addItem">Add Item</button>
      </div>
      
      <!-- Submit button -->
      <div class="form-actions">
        <button type="submit" :disabled="form.isSubmitting.value">
          {{ form.isSubmitting.value ? 'Saving...' : 'Save Menu' }}
        </button>
        <button type="button" @click="form.clearAllErrors">
          Clear All Errors
        </button>
      </div>
    </form>
    
    <!-- Debug info -->
    <div class="debug-info">
      <h3>Debug Info:</h3>
      <p>Has Errors: {{ form.hasErrors.value }}</p>
      <p>Is Submitting: {{ form.isSubmitting.value }}</p>
      <p>Field Errors: {{ Object.keys(form.fieldErrors.value).length }}</p>
      <p>Global Errors: {{ form.globalErrors.value.length }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useEnhancedApiForm } from '~/composables/useEnhancedApiForm';
import type { ApiError } from '~/types/enhanced-api';

// Initialize form composable
const form = useEnhancedApiForm();

// Form data
const formData = ref({
  email: '',
  items: [
    { name: '', price: 0 },
    { name: '', price: 0 }
  ]
});

// Add new item
const addItem = () => {
  formData.value.items.push({ name: '', price: 0 });
};

// Simulate form submission with validation errors
const handleSubmit = async () => {
  form.setSubmitting(true);
  form.clearAllErrors();
  
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate validation error response
    const mockError: ApiError = {
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details: [
        { field: 'email', message: 'Email is required' },
        { field: 'items.0.name', message: 'Item name is required' },
        { field: 'items.0.price', message: 'Price must be greater than 0' },
        { field: 'items.1.name', message: 'Item name is required' },
        { field: 'hiddenField', message: 'This field is not visible in DOM' }
      ]
    };
    
    // Handle validation error
    form.handleValidationError(mockError);
    
  } catch (error) {
    console.error('Form submission error:', error);
  } finally {
    form.setSubmitting(false);
  }
};
</script>

<style scoped>
.enhanced-form-example {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.field {
  margin-bottom: 15px;
}

.field label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.field input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.field input.error {
  border-color: #e74c3c;
  background-color: #fdf2f2;
}

.field-error {
  color: #e74c3c;
  font-size: 0.875rem;
  margin-top: 5px;
  display: block;
}

.global-errors {
  background-color: #fdf2f2;
  border: 1px solid #e74c3c;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 20px;
}

.global-errors h3 {
  margin: 0 0 10px 0;
  color: #e74c3c;
}

.global-errors ul {
  margin: 0;
  padding-left: 20px;
}

.nested-fields {
  border: 1px solid #eee;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.item-field {
  border: 1px solid #f0f0f0;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 4px;
}

.form-actions {
  display: flex;
  gap: 10px;
}

.form-actions button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.form-actions button[type="submit"] {
  background-color: #3498db;
  color: white;
}

.form-actions button[type="submit"]:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}

.form-actions button[type="button"] {
  background-color: #95a5a6;
  color: white;
}

.debug-info {
  margin-top: 30px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 4px;
  font-family: monospace;
}

.debug-info h3 {
  margin: 0 0 10px 0;
}

.debug-info p {
  margin: 5px 0;
}
</style>