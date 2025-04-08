<template>
  <ScopePopover v-if="CHAINS.length > 1">
    <template #trigger>
      <IconChain
        class="trigger-icon"
        :chain="modelValue"
        kind="mono"
      />
    </template>
    <template #default>
      <div class="content">
        <div class="list">
          <div
            v-for="chain in CHAINS"
            ref="optionEls"
            :key="chain"
            class="item"
            @click="() => handleOptionClick(chain)"
          >
            <Popover.Close as="div">
              <IconChain
                class="icon"
                :chain="chain"
                kind="mono"
              />
            </Popover.Close>
          </div>
        </div>
        <div class="label">{{ label }}</div>
      </div>
    </template>
  </ScopePopover>
  <IconChain
    v-else
    class="trigger-icon"
    :chain="modelValue"
    kind="mono"
  />
</template>

<script setup lang="ts">
import { useElementHover } from '@vueuse/core';
import { Popover } from 'reka-ui/namespaced';
import { computed, useTemplateRef } from 'vue';

import IconChain from '@/components/__common/IconChain.vue';
import ScopePopover from '@/components/__common/ScopePopover.vue';
import type { Chain } from '@/utils/chains';
import { CHAINS, getChainName } from '@/utils/chains';

const selectedChain = defineModel<Chain>({
  required: true,
});

function handleOptionClick(option: Chain): void {
  selectedChain.value = option;
}

const optionEls = useTemplateRef<HTMLElement[]>('optionEls');
const isHovered = computed(() =>
  optionEls.value ? optionEls.value.map((el) => useElementHover(el)) : [],
);
const label = computed(() => {
  const hoveredIndex = isHovered.value.findIndex((hovered) => hovered.value);
  const hoveredChain = CHAINS[hoveredIndex] ?? selectedChain.value;
  return getChainName(hoveredChain);
});
</script>

<style scoped>
.trigger-icon {
  width: 32px;
  height: 32px;
  transition: all 0.25s ease-in-out;
  color: var(--color-text-secondary);

  &:hover {
    color: var(--color-text-primary);
  }
}

.content {
  display: flex;
  gap: var(--spacing-8);
  flex-direction: column;
}

.list {
  --icon-size: 32px;
  --icon-gap: var(--spacing-6);
  --icon-per-row: 4;

  display: flex;
  gap: var(--icon-gap);
  flex-wrap: wrap;
  width: calc(
    var(--icon-size) * var(--icon-per-row) + var(--icon-gap) *
      (var(--icon-per-row) - 1)
  );
}

.item {
  .icon {
    width: var(--icon-size);
    height: var(--icon-size);
    transition: 0.25s ease-in-out;
    opacity: 0.75;
    cursor: pointer;

    &:hover {
      opacity: 1;
    }
  }
}

.label {
  color: var(--color-text-secondary);
  font-family: var(--font-mono);
  font-size: var(--font-size-m);
  text-align: center;
  text-transform: lowercase;
}
</style>
