<template>
  <ScopePanelLoading
    v-if="isLoading"
    ref="panelEl"
    title="Code"
  />
  <ScopePanel
    v-else
    ref="panelEl"
    title="Code"
  >
    <NoticeProxy
      v-if="isProxy"
      v-model:show-as-proxy="showAsProxy"
      :implementation
    />
    <div class="code">
      <ScopeTabs
        v-if="source || abi"
        v-model="activeTab"
        :options="tabs"
      />
      <CardSource
        v-if="activeTab === 'source' && source"
        :source
        class="card"
      />
      <div
        v-else-if="activeTab === 'abi' && abi"
        class="abi"
      >
        <SourceHighlighter
          :value="JSON.stringify(abi, null, 2)"
          language="JSON"
        />
      </div>
      <div
        v-else-if="bytecode"
        class="bytecode"
      >
        <SourceHighlighter
          :value="bytecode"
          language="plaintext"
        />
      </div>
    </div>
  </ScopePanel>
</template>

<script setup lang="ts">
import type { Address, Hex } from 'viem';
import { computed, onMounted, ref, watch } from 'vue';

import ScopePanel from '@/components/__common/ScopePanel.vue';
import ScopePanelLoading from '@/components/__common/ScopePanelLoading.vue';
import ScopeTabs from '@/components/__common/ScopeTabs.vue';
import CardSource from '@/components/address/code/CardSource.vue';
import NoticeProxy from '@/components/address/code/NoticeProxy.vue';
import SourceHighlighter from '@/components/address/code/SourceHighlighter.vue';
import useChain from '@/composables/useChain';
import ApiService from '@/services/api';
import type { Contract } from '@/services/api';

const props = defineProps<{
  address: Address;
  bytecode: Hex | null;
}>();

type PanelEl = InstanceType<typeof ScopePanel>;

const panelEl = ref<PanelEl | null>(null);
const rootEl = computed(() => (panelEl.value ? panelEl.value.rootEl : null));

defineExpose({
  rootEl,
});

const { id: chainId } = useChain();

onMounted(() => {
  fetch();
});

watch(
  () => props.address,
  () => {
    fetch();
  },
);

const apiService = computed(() =>
  chainId.value ? new ApiService(chainId.value) : null,
);

const isLoading = ref(false);

const showAsProxy = ref(true);
const contract = ref<Contract | null>(null);

const isProxy = computed(() => contract.value && contract.value.isProxy);
const implementation = computed(() =>
  contract.value && contract.value.isProxy && contract.value.implementation
    ? contract.value.implementation.address
    : null,
);
const abi = computed(() =>
  contract.value
    ? showAsProxy.value &&
      contract.value.isProxy &&
      contract.value.implementation
      ? contract.value.implementation.abi
      : contract.value.abi
    : null,
);
const source = computed(() =>
  contract.value
    ? showAsProxy.value &&
      contract.value.isProxy &&
      contract.value.implementation
      ? contract.value.implementation.source
      : contract.value.source
    : null,
);

async function fetch(): Promise<void> {
  if (!apiService.value) {
    return;
  }
  isLoading.value = true;
  contract.value = await apiService.value.getContractSource(props.address);
  isLoading.value = false;
}

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
</script>

<style scoped>
.code {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.card,
.abi,
.bytecode {
  height: 680px;
}
</style>
