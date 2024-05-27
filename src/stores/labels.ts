import { useDebounceFn } from '@vueuse/core';
import { defineStore } from 'pinia';
import { Address } from 'viem';
import { ref } from 'vue';

import { Label } from '@/services/api.js';
import { Chain } from '@/utils/chains';

const store = defineStore('labels', () => {
  const labels = ref<Partial<Record<Chain, Record<Address, Label>>>>({});
  const pendingAddresses = new Set<Address>();

  function addLabels(chain: Chain, value: Record<Address, Label>): void {
    const chainLabels = labels.value[chain] || {};
    labels.value[chain] = { ...chainLabels, ...value };
  }

  function getLabel(chain: Chain, address: Address): Label | null {
    const chainLabels = labels.value[chain];
    if (!chainLabels) {
      return null;
    }
    return chainLabels[address] || null;
  }

  const debouncedFn = useDebounceFn(
    (onFetch: (addresses: Set<Address>) => void) => {
      onFetch(pendingAddresses);
      pendingAddresses.clear();
    },
    50,
    { maxWait: 500 },
  );

  async function requestLabel(
    address: Address,
    onFetch: (addresses: Set<Address>) => void,
  ): Promise<void> {
    if (pendingAddresses.has(address)) {
      return;
    }
    pendingAddresses.add(address);
    debouncedFn(onFetch);
  }

  return {
    addLabels,
    getLabel,
    requestLabel,
  };
});

export default store;
