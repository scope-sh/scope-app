<template>
  <div class="root">
    <ScopeSelect
      :model-value="model.toString()"
      :options
      placeholder="Select chain"
      @update:model-value="handleModelUpdate"
    >
      <template #trigger>
        <IconChain
          :chain="model"
          kind="mono"
          class="trigger-icon"
        />
        <span class="trigger-label">{{ getChainName(model) }}</span>
      </template>
      <template #item="{ item }">
        <IconChain
          :chain="getChain(item.value)"
          kind="coloured"
          class="item-icon"
        />
        <span>{{ item.label }}</span>
      </template>
    </ScopeSelect>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import IconChain from '@/components/__common/IconChain.vue';
import ScopeSelect, {
  type Option as SelectOption,
} from '@/components/__common/ScopeSelect.vue';
import {
  type Chain,
  CHAINS,
  getChainName,
  parseChain,
  DEFAULT_CHAIN,
} from '@/utils/chains';

const model = defineModel<Chain>({
  required: true,
});

function handleModelUpdate(value: string): void {
  const chain = parseChain(value);
  if (!chain) {
    return;
  }
  model.value = chain;
}

const options = computed<SelectOption[]>(() =>
  CHAINS.map((chain) => {
    return {
      value: chain.toString(),
      label: getChainName(chain),
    };
  }),
);

function getChain(value: string): Chain {
  return parseChain(value) ?? DEFAULT_CHAIN;
}
</script>

<style scoped>
.root {
  width: 160px;
}

.trigger-icon {
  width: 18px;
  height: 18px;
}

.trigger-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-icon {
  width: 20px;
  height: 20px;
}
</style>
