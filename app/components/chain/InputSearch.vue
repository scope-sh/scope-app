<template>
  <div class="wrapper">
    <input
      :placeholder
      :value
      :disabled="isLoading"
      @input="handleInput"
      @keydown.enter="handleSubmit"
      @focus="handleFocus"
      @blur="handleBlur"
    />
    <div class="icon-wrapper">
      <ScopeIcon
        class="icon"
        kind="arrow-right"
        @click="handleClick"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import ScopeIcon from '@/components/__common/ScopeIcon.vue';

const value = defineModel<string>({
  required: true,
});

defineProps<{
  isLoading: boolean;
  placeholder: string;
}>();

const emit = defineEmits<{
  submit: [];
  focus: [];
  blur: [];
}>();

function handleInput(event: Event): void {
  const newValue = (event.target as HTMLInputElement).value;
  value.value = newValue;
}

function handleSubmit(): void {
  emit('submit');
}

function handleClick(): void {
  emit('submit');
}

function handleFocus(): void {
  emit('focus');
}

function handleBlur(): void {
  emit('blur');
}
</script>

<style scoped>
.wrapper {
  position: relative;
}

input {
  width: 100%;
  padding: var(--spacing-4) var(--spacing-5);
  transition: 0.25s ease-in-out;
  border: 1px solid var(--color-border-secondary);
  border-radius: var(--border-radius-s);
  outline: none;
  background: transparent;
  box-shadow: inset 2px 2px 2px rgb(0 0 0 / 40%);
  color: var(--color-text-primary);
  font-size: var(--font-size-l);
}

@media (width >= 768px) {
  input {
    font-size: var(--font-size-s);
  }
}

input:disabled {
  opacity: 0.6;
}

input:focus {
  border-color: var(--color-border-primary);
}

input::placeholder {
  color: var(--color-text-placeholder);
}

.icon-wrapper {
  display: flex;
  position: absolute;
  top: 0;
  right: 0;
  align-items: center;
  height: 100%;
  padding: 0 8px;
}

.icon {
  width: 15px;
  height: 15px;
  transition: 0.25s ease-in-out;
  opacity: 0.8;
  cursor: pointer;
}

.icon:hover {
  opacity: 1;
}
</style>
