<template>
  <ScopePanel
    ref="panelEl"
    title="Code"
  >
    <NoticeProxy
      v-if="isProxy"
      v-model:show-as-proxy="showAsProxy"
      :implementation
    />
    <SourceAttributes
      v-if="source"
      :source="source"
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
import NoticeProxy from './code/NoticeProxy.vue';
import SourceAttributes from './code/SourceAttributes.vue';
import SourceHighlighter from './code/SourceHighlighter.vue';

import ScopeButton from '@/components/__common/ScopeButton.vue';
import ScopePanel from '@/components/__common/ScopePanel.vue';
import ScopeTabs from '@/components/__common/ScopeTabs.vue';
import type { Contract } from '@/services/api';

const props = defineProps<{
  address: Address;
  bytecode: Hex | null;
  contract: Contract | null;
}>();

const showAsProxy = ref(true);

const isProxy = computed(() => props.contract && props.contract.implementation);
const implementation = computed(() =>
  props.contract && props.contract.implementation
    ? props.contract.implementation.address
    : null,
);
const abi = computed(() =>
  props.contract
    ? showAsProxy.value && props.contract.implementation
      ? props.contract.implementation.abi
      : props.contract.abi
    : null,
);
const source = computed(() =>
  props.contract
    ? showAsProxy.value && props.contract.implementation
      ? props.contract.implementation.source
      : props.contract.source
    : null,
);

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
  flex-direction: column;
  gap: var(--spacing-3);
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
