<template>
  <div>
    <ScopeDialog
      :title="'Application code form'"
      :open="dialogOpen"
    >
      <form @submit.prevent="handleSubmit">
        <div class="code">
          <label for="input-code">Code</label>
          <input
            id="input-code"
            ref="inputEl"
            v-model="code"
            :class="{ error: !isInputValid }"
          />
        </div>
        <div>
          <button type="submit">Unlock</button>
        </div>
      </form>
    </ScopeDialog>
  </div>
</template>

<script setup lang="ts">
import { useFocus, useStorage } from '@vueuse/core';
import { ref, watch } from 'vue';

import ScopeDialog from '@/components/__common/ScopeDialog.vue';
import useEnv from '@/composables/useEnv';

const inputEl = ref<HTMLInputElement | null>(null);
const isInputValid = ref(true);
const dialogOpen = ref(true);
const code = ref('');

const { appPassphrase } = useEnv();
const locked = useStorage('scope-locked', appPassphrase.length > 0);

useFocus(inputEl, {
  initialValue: true,
});

watch(code, () => {
  isInputValid.value = true;
});

function handleSubmit(): void {
  if (code.value === appPassphrase) {
    locked.value = false;
  } else {
    isInputValid.value = false;
  }
}
</script>

<style scoped>
form {
  display: flex;
  gap: var(--spacing-10);
  flex-direction: column;
  margin: var(--spacing-6);
}

.code {
  display: flex;
  gap: var(--spacing-2);
  flex-direction: column;
}

label {
  color: var(--color-text-placeholder);
}

input {
  padding: var(--spacing-2);
  transition: all 0.25s ease-in-out;
  border: 1px solid var(--color-border-tertiary);
  border-radius: var(--border-radius-s);
  outline: none;
  background: transparent;
  color: var(--color-text-primary);
}

input.error {
  border-color: var(--color-error);
}

button {
  padding: var(--spacing-2);
  border: 1px solid var(--color-border-tertiary);
  border-radius: var(--border-radius-s);
  background: var(--color-background-secondary);
  color: var(--color-text-secondary);
  font-size: var(--font-size-m);
  cursor: pointer;

  &:hover {
    border-color: var(--color-border-quaternary);
  }
}
</style>
