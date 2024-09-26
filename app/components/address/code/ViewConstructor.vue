<template>
  <div
    v-if="view === 'decoded' && decoded"
    class="decoded"
  >
    <ArgumentTree :args="decoded" />
  </div>
  <ScopeTextView
    v-else
    size="tiny"
    :value="constructorData"
  />
</template>

<script setup lang="ts">
import type { Address, Hex } from 'viem';
import { decodeDeployData } from 'viem';
import { computed } from 'vue';

import ScopeTextView from '@/components/__common/ScopeTextView.vue';
import type { Argument } from '@/components/__common/arguments';
import { getArguments } from '@/components/__common/arguments';
import ArgumentTree from '@/components/__common/arguments/ArgumentTree.vue';
import useAbi from '@/composables/useAbi';

const { view, address, constructorData } = defineProps<{
  view: ConstructorView;
  address: Address;
  constructorData: Hex;
}>();

const { getConstructors } = useAbi();

const constructors = computed(() => getConstructors(address));

const decoded = computed<Argument[] | null>(() => {
  for (const constructor of constructors.value) {
    try {
      const decoded = decodeDeployData({
        abi: [constructor],
        data: constructorData,
        bytecode: '0x',
      });

      if (decoded) {
        return getArguments(constructor.inputs, decoded.args);
      }
    } catch {
      continue;
    }
  }
  return null;
});
</script>

<script lang="ts">
type ConstructorView = 'hex' | 'decoded';

// eslint-disable-next-line import/prefer-default-export
export type { ConstructorView };
</script>

<style scoped>
.decoded {
  display: flex;
  gap: var(--spacing-2);
  flex-direction: column;
  max-height: 160px;
  padding: var(--spacing-4);
  overflow-y: auto;
  border: 1px solid var(--color-border-tertiary);
  border-radius: var(--border-radius-s);
  word-break: break-all;
}
</style>
