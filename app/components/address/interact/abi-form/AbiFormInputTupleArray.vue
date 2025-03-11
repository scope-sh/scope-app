<template>
  <div class="root">
    <div class="name">
      {{ abiInput.internalType || 'tuple[]' }} {{ abiInput.name }}
    </div>
    <div class="items">
      <div
        v-for="(_, index) in model"
        :key="index"
        class="item"
      >
        <AbiFormInputTuple
          :model-value="model ? model[index] : undefined"
          :abi-input="getTupleArrayItemInput(abiInput)"
          :type="getTupleArrayItemInput(abiInput).type"
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

import AbiFormInputTuple from './AbiFormInputTuple.vue';

import ScopeIcon from '@/components/__common/ScopeIcon.vue';
import {
  getTupleArrayItemInput,
  getInitialValue,
  type TupleArrayInput as AbiTupleArrayInput,
  getArrayLength,
} from '@/utils/validation/abi';

const model = defineModel<unknown[]>();

const { abiInput } = defineProps<{
  abiInput: AbiTupleArrayInput;
}>();

const length = computed(() => getArrayLength(abiInput));

onMounted(() => {
  const initialValue = getInitialValue(getTupleArrayItemInput(abiInput));
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
  const itemInput = getTupleArrayItemInput(abiInput);
  const initialValue = getInitialValue(itemInput);
  model.value.push(initialValue);
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
  gap: var(--spacing-2);
  flex-direction: column;
}

.items {
  display: flex;
  gap: var(--spacing-2);
  flex-direction: column;
  margin-left: var(--spacing-6);
}

.name {
  color: var(--color-text-secondary);
  font-family: var(--font-mono);
  font-size: var(--font-size-m);
}

.item {
  display: flex;
  gap: var(--spacing-4);
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
