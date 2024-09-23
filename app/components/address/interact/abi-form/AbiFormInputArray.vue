<template>
  <div class="root">
    <div class="name">
      {{ abiInput.internalType || 'tuple' }} {{ abiInput.name }}
    </div>
    <div class="items">
      <div
        v-for="(itemModelValue, index) in modelValue"
        :key="index"
        class="item"
      >
        <AbiFormInputPrimitive
          :model-value="itemModelValue"
          :abi-input="getArrayItemInput(abiInput, index)"
          @update:model-value="(newValue) => handleModelUpdate(index, newValue)"
        />
        <button
          v-if="!length"
          type="button"
          @click="() => removeItem(index)"
        >
          <ScopeIcon kind="minus" />
        </button>
      </div>
    </div>
    <button
      v-if="!length"
      type="button"
      class="add"
      @click="addItem"
    >
      <ScopeIcon kind="plus" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';

import AbiFormInputPrimitive from './AbiFormInputPrimitive.vue';

import ScopeIcon from '@/components/__common/ScopeIcon.vue';
import {
  getArrayItemInput,
  getInitialValue,
  getArrayLength,
  type ArrayInput as AbiArrayInput,
} from '@/utils/validation/abi';

const model = defineModel<unknown[]>();

const { abiInput } = defineProps<{
  abiInput: AbiArrayInput;
}>();

const length = computed(() => getArrayLength(abiInput));

onMounted(() => {
  const initialValue = getInitialValue(getArrayItemInput(abiInput));
  model.value = length.value
    ? Array.from({ length: length.value }, () => initialValue)
    : [initialValue];
});

function handleModelUpdate(index: number, newValue: unknown): void {
  if (!model.value) {
    return;
  }
  model.value[index] = newValue;
}

function addItem(): void {
  if (!model.value) {
    return;
  }
  model.value.push(getInitialValue(getArrayItemInput(abiInput)));
}

function removeItem(index: number): void {
  if (!model.value) {
    return;
  }
  model.value.splice(index, 1);
}
</script>

<style scoped>
.root {
  display: flex;
  gap: var(--spacing-3);
  flex-direction: column;
}

.name {
  color: var(--color-text-secondary);
  font-family: var(--font-mono);
  font-size: var(--font-size-m);
}

.items {
  display: flex;
  gap: var(--spacing-3);
  flex-direction: column;
  margin-left: var(--spacing-6);
}

.item {
  display: flex;
  gap: var(--spacing-3);
  align-items: center;
}

button {
  display: flex;
  width: 16px;
  height: 16px;
  padding: 0;
  transition: opacity 0.5s;
  border: none;
  opacity: 0.4;
  background: transparent;
  color: var(--color-text-primary);
  cursor: pointer;

  &:hover {
    opacity: 1;
  }

  &:disabled {
    opacity: 0.1;
  }

  &.add {
    margin-left: var(--spacing-6);
  }
}
</style>
