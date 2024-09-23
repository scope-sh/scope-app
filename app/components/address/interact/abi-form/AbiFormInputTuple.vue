<template>
  <div
    v-if="model"
    class="root"
  >
    <div class="name">
      {{ abiInput.internalType || 'tuple' }} {{ abiInput.name }}
    </div>
    <div class="components">
      <template
        v-for="(component, index) in abiInput.components"
        :key="index"
      >
        <AbiFormInput
          v-model:input="
            (model as Record<string, unknown>)[component.name || index]
          "
          :abi-input="component"
        />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import AbiFormInput from './AbiFormInput.vue';

import type { TupleInput as AbiTupleInput } from '@/utils/validation/abi';

const model = defineModel<unknown>();

defineProps<{
  abiInput: AbiTupleInput;
}>();
</script>

<style scoped>
.root {
  display: flex;
  gap: var(--spacing-4);
  flex-direction: column;
}

.components {
  display: flex;
  gap: var(--spacing-4);
  flex-direction: column;
  margin-left: var(--spacing-6);
}

.name {
  color: var(--color-text-secondary);
  font-family: var(--font-mono);
  font-size: var(--font-size-m);
}
</style>
