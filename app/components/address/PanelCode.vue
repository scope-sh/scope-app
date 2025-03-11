<template>
  <ScopePanel title="Code">
    <NoticeDelegation
      v-if="isDelegated && delegation"
      v-model:show-as-delegatee="showAsDelegatee"
      :delegation
    />
    <NoticeProxy
      v-else-if="isProxy"
      v-model:show-as-proxy="showAsProxy"
      :implementation
    />
    <SourceAttributes
      v-if="source"
      :address
      :source
    />
    <div class="code">
      <div class="code-header">
        <ScopeTabs
          v-if="source || abi"
          v-model="activeTab"
          :options="tabs"
        />
        <ScopeButton
          v-if="source"
          kind="minimal"
          @click="toggleSearch"
        >
          <template v-if="isSearching"> Hide Search </template>
          <template v-else> Search </template>
        </ScopeButton>
      </div>
      <CardSource
        v-if="activeTab === 'source' && source"
        :source
        :is-searching
        class="card"
        @close-search="handleCloseSearch"
      />
      <div
        v-else-if="activeTab === 'abi' && abi"
        class="abi"
      >
        <SourceHighlighter
          :value="JSON.stringify(abi, null, 2)"
          language="JSON"
          line-numbers
        />
      </div>
      <div
        v-else-if="bytecode"
        class="bytecode"
      >
        <SourceHighlighter
          :value="bytecode"
          language="plaintext"
          :line-numbers="false"
        />
      </div>
    </div>
  </ScopePanel>
</template>

<script setup lang="ts">
import type { Address, Hex } from 'viem';
import { computed, ref } from 'vue';

import CardSource from './code/CardSource.vue';
import NoticeDelegation from './code/NoticeDelegation.vue';
import NoticeProxy from './code/NoticeProxy.vue';
import SourceAttributes from './code/SourceAttributes.vue';
import SourceHighlighter from './code/SourceHighlighter.vue';

import ScopeButton from '@/components/__common/ScopeButton.vue';
import ScopePanel from '@/components/__common/ScopePanel.vue';
import ScopeTabs from '@/components/__common/ScopeTabs.vue';
import type { Contract } from '@/services/api';
import {
  isDelegating as isDelegatingEip7702,
  getDelegation as getDelegationEip7702,
} from '@/utils/context/eip7702';

const { contract, bytecode } = defineProps<{
  address: Address;
  bytecode: Hex | null;
  contract: Contract | null;
}>();

const showAsProxy = ref(true);
const showAsDelegatee = ref(true);

const isDelegated = computed(() => isDelegatingEip7702(bytecode));
const delegation = computed(() => getDelegationEip7702(bytecode));

const isProxy = computed(() => contract && contract.implementation);
const implementation = computed(() =>
  contract && contract.implementation ? contract.implementation.address : null,
);
const abi = computed(() => {
  if (!contract) {
    return null;
  }
  if (isDelegated.value) {
    if (showAsDelegatee.value) {
      return contract.delegation ? contract.delegation.abi : contract.abi;
    }
    return contract.abi;
  }
  if (showAsProxy.value) {
    return contract.implementation ? contract.implementation.abi : contract.abi;
  }
  return contract.abi;
});
const source = computed(() => {
  if (!contract) {
    return null;
  }
  if (isDelegated.value) {
    if (showAsDelegatee.value) {
      return contract.delegation ? contract.delegation.source : contract.source;
    }
    return contract.source;
  }
  if (showAsProxy.value) {
    return contract.implementation
      ? contract.implementation.source
      : contract.source;
  }
  return contract.source;
});

const activeTab = ref<string>('source');
const tabs = [
  {
    label: 'Source',
    value: 'source',
  },
  {
    label: 'ABI',
    value: 'abi',
  },
  {
    label: 'Bytecode',
    value: 'bytecode',
  },
];

const isSearching = ref(false);
function toggleSearch(): void {
  isSearching.value = !isSearching.value;
}
function handleCloseSearch(): void {
  isSearching.value = false;
}
</script>

<style scoped>
.code {
  display: flex;
  gap: var(--spacing-3);
  flex-direction: column;
}

.code-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card,
.abi,
.bytecode {
  height: 680px;
}
</style>
