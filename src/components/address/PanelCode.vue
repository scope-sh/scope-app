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
    <SourceAttributes
      v-if="source"
      :source="source"
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
import useChain from '@/composables/useChain';
import useCommands from '@/composables/useCommands';
import useToast from '@/composables/useToast';
import ApiService from '@/services/api';
import type { Contract } from '@/services/api';
import { Command } from '@/stores/commands';

import CardSource from './code/CardSource.vue';
import NoticeProxy from './code/NoticeProxy.vue';
import SourceAttributes from './code/SourceAttributes.vue';
import SourceHighlighter from './code/SourceHighlighter.vue';

const PANEL_CODE = 'panel_code';

const { id: chainId } = useChain();
const { setCommands } = useCommands(PANEL_CODE);
const { send: sendToast } = useToast();

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
  contract.value = null;
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

const commands = computed<Command[]>(() => {
  const commands: Command[] = [];
  const storedAbi = abi.value;
  if (storedAbi) {
    commands.push({
      icon: 'copy',
      label: 'Copy ABI',
      act: () => {
        navigator.clipboard.writeText(JSON.stringify(storedAbi, null, 2));
        sendToast({
          type: 'success',
          message: 'ABI copied to clipboard',
        });
      },
    });
  }
  return commands;
});

watch(
  commands,
  () => {
    setCommands(commands.value);
  },
  {
    immediate: true,
  },
);
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
