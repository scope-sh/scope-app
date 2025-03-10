<template>
  <ScopePage
    v-model:section="section"
    :sections="sections"
  >
    <ScopePanel
      :title="type"
      :subtitle="address"
    >
      <div
        v-if="primaryLabel"
        class="label"
      >
        <LabelIcon
          :uri="primaryLabel.iconUrl || null"
          class="label-icon"
        />
        <div class="label-details">
          <div
            v-if="primaryLabel.namespace"
            class="label-namespace"
          >
            {{ primaryLabel.namespace.value }}
          </div>
          <div class="label-value">{{ primaryLabel.value }}</div>
        </div>
        <ScopePopover v-if="addressLabels.length > 1">
          <template #trigger>
            <ScopeIcon
              class="icon"
              kind="chevron-down"
            />
          </template>
          <template #default>
            <div class="panel-known-labels">
              <h3 class="panel-known-labels header">All known names</h3>
              <ul class="panel-known-labels list">
                <li
                  v-for="(label, index) in addressLabels"
                  :key="index"
                  class="panel-known-labels item"
                >
                  <template v-if="label.namespace">
                    {{ label.namespace.value }}:
                  </template>
                  {{ label.value }}
                </li>
              </ul>
            </div>
          </template>
        </ScopePopover>
      </div>
    </ScopePanel>

    <template #section>
      <template v-if="section === SECTION_CODE">
        <ScopePanelLoading
          v-if="isCodeLoading"
          title="Code"
        />
        <PanelCode
          v-else
          :address
          :status
        />
      </template>
    </template>
  </ScopePage>
</template>

<script setup lang="ts">
import {
  type Address,
  type Hex,
  createPublicClient,
  http,
  size,
  slice,
} from 'viem';
import { computed, onMounted, ref, watch } from 'vue';

import LabelIcon from '@/components/__common/LabelIcon.vue';
import ScopeIcon from '@/components/__common/ScopeIcon.vue';
import ScopePage from '@/components/__common/ScopePage.vue';
import ScopePanel from '@/components/__common/ScopePanel.vue';
import ScopePanelLoading from '@/components/__common/ScopePanelLoading.vue';
import ScopePopover from '@/components/__common/ScopePopover.vue';
import PanelCode, {
  type ChainStatus,
} from '@/components/global-address/PanelCode.vue';
import useEnv from '@/composables/useEnv';
import useRoute from '@/composables/useRoute';
import Service, { type Label } from '@/services/api';
import {
  type Chain,
  CHAINS,
  getChainData,
  getEndpointUrl,
} from '@/utils/chains';
import type { GlobalAddressRouteLocation } from '@/utils/routing';

const { quicknodeAppName, quicknodeAppKey } = useEnv();
const route = useRoute<GlobalAddressRouteLocation>();
const address = computed(() => route.params.address);

const SECTION_CODE = 'code';

const section = ref(SECTION_CODE);
const sections = computed(() => [
  {
    label: 'Code',
    value: SECTION_CODE,
  },
]);

onMounted(() => {
  fetchLabels();
  fetchCode();
});
watch(address, () => {
  fetchLabels();
  fetchCode();
});

const addressLabels = computed(() => {
  for (const chain of CHAINS) {
    const chainLabels = labels.value[chain] || [];
    if (chainLabels.length > 0) {
      return chainLabels;
    }
  }
  return [];
});
const primaryLabel = computed(() => addressLabels.value[0] || null);

const labels = ref<Partial<Record<Chain, Label[]>>>({});

const code = ref<
  Partial<
    Record<
      Chain,
      {
        bytecode: Hex | null;
        implementation: Address | null;
      }
    >
  >
>({});
const status = computed<ChainStatus[]>(() => {
  const status: ChainStatus[] = [];
  for (const chain of CHAINS) {
    const chainCode = code.value[chain];
    if (chainCode === undefined) {
      continue;
    }
    if (chainCode === null) {
      status.push({ chain, type: 'no-code' });
      continue;
    }
    const bytecode = chainCode.bytecode;
    if (bytecode === null) {
      status.push({ chain, type: 'no-code' });
      continue;
    }
    if (size(bytecode) === 23 && slice(bytecode, 0, 3) === '0xef0100') {
      status.push({ chain, type: 'delegation', target: slice(bytecode, 3) });
    } else {
      const implementation = chainCode.implementation;
      status.push({ chain, type: 'contract', code: bytecode, implementation });
    }
  }
  // Sort by status type (contract, delegation, no-code)
  return status.toSorted((a, b) => {
    if (a.type === 'contract' && b.type !== 'contract') {
      return -1;
    }
    if (a.type === 'delegation' && b.type !== 'delegation') {
      return -1;
    }
    if (a.type === 'no-code' && b.type !== 'no-code') {
      return 1;
    }
    return 0;
  });
});

const type = computed(() => {
  // "Smart EOA" if at least 1 chain has delegation
  // "Contract" if at least 1 chain has code
  // "EOA" otherwise
  if (status.value.some((s) => s.type === 'delegation')) {
    return 'Smart EOA';
  }
  if (status.value.some((s) => s.type === 'contract')) {
    return 'Contract';
  }
  return 'EOA';
});

async function fetchLabels(): Promise<void> {
  labels.value = {};
  const chainPromises = CHAINS.map(async (chain) => {
    const service = new Service(chain);
    const chainLabels = await service.getAllAddressLabels(address.value);
    labels.value[chain] = chainLabels;
  });
  await Promise.all(chainPromises);
}

const isCodeLoading = ref(true);
async function fetchCode(): Promise<void> {
  code.value = {};
  const chainPromises = CHAINS.map(async (chain) => {
    try {
      const client = createPublicClient({
        chain: getChainData(chain),
        transport: http(
          getEndpointUrl(chain, quicknodeAppName, quicknodeAppKey),
          {
            timeout: 5_000,
          },
        ),
      });
      const chainCode = await client.getCode({
        address: address.value,
      });

      if (chainCode === undefined) {
        code.value[chain] = {
          bytecode: null,
          implementation: null,
        };
      } else {
        // Check if the contract is a proxy
        const service = new Service(chain);
        const implementation = await service.getContractImplementation(
          address.value,
        );
        code.value[chain] = {
          bytecode: chainCode,
          implementation: implementation.address,
        };
      }
    } catch {
      // Ignore
    }
  });

  isCodeLoading.value = true;
  await Promise.all(chainPromises);
  isCodeLoading.value = false;
}
</script>

<style scoped>
.label {
  display: flex;
  gap: var(--spacing-6);
  align-items: center;
}

.label-icon {
  width: 40px;
  height: 40px;
}

.label-details {
  display: flex;
  gap: var(--spacing-2);
  flex-direction: column;
}

.label-namespace {
  display: flex;
  color: var(--color-text-secondary);
  font-size: var(--font-size-m);
}

.label-value {
  display: flex;
  font-size: var(--font-size-l);
}
</style>
