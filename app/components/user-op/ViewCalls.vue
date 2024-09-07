<template>
  <div class="list">
    <div
      v-for="(call, index) in calls"
      :key="index"
      class="call"
    >
      <div class="index">{{ index }}</div>
      <div class="data">
        <div class="item">
          <div class="key">to</div>
          <LinkAddress
            :address="call.to"
            type="copyable"
          />
        </div>
        <div
          v-if="call.value > 0n"
          class="item"
        >
          <div class="key">value</div>
          <div>{{ formatEther(call.value, nativeCurrency) }}</div>
        </div>
        <div
          v-if="size(call.callData) > 0"
          class="item"
        >
          <div class="key">data</div>
          <div>
            {{ call.callData }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { size } from 'viem';

import LinkAddress from '@/components/__common/LinkAddress.vue';
import useChain from '@/composables/useChain';
import type { Call } from '@/utils/context/erc4337/entryPoint';
import { formatEther } from '@/utils/formatting';

const { nativeCurrency } = useChain();

defineProps<{
  calls: Call[];
}>();
</script>

<style scoped>
.list {
  margin-left: 0;
  color: var(--color-text-secondary);
  font-family: var(--font-mono);
  font-size: var(--font-size-m);
}

.call {
  display: flex;
  gap: var(--spacing-2);
  flex-direction: column;
}

.data {
  margin-left: 20px;
}

.item {
  display: flex;
  flex-direction: row;
  column-gap: var(--spacing-4);
  line-height: 1.4;
}

.key {
  flex: 0 0 240px;
  white-space: nowrap;
}
</style>
