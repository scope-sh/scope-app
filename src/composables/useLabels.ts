import { Address } from 'viem';
import { computed } from 'vue';

import ApiService, { Label } from '@/services/api';
import useStore from '@/stores/labels.js';

import useChain from './useChain';

interface UseLabels {
  requestLabels: (addresses: Address[]) => Promise<void>;
  getLabel: (address: Address) => Label | null;
  getLabelText: (address: Address) => string | null;
}

function useLabels(): UseLabels {
  const store = useStore();
  const { id: chain } = useChain();
  const apiService = computed(() => new ApiService(chain.value));

  async function requestLabels(addresses: Address[]): Promise<void> {
    // Fetch a label for every address only once
    const addressSet = new Set<Address>();
    for (const address of addresses) {
      const existingLabel = store.getLabel(chain.value, address);
      if (!existingLabel) {
        addressSet.add(address);
      }
    }
    const uniqueAddresses = Array.from(addressSet);
    if (uniqueAddresses.length === 0) {
      return;
    }
    const labels = await apiService.value.getLabels(uniqueAddresses);
    if (Object.keys(labels).length === 0) {
      return;
    }
    store.addLabels(chain.value, labels);
  }

  function getLabel(address: Address): Label | null {
    return store.getLabel(chain.value, address);
  }

  function getLabelText(address: Address): string | null {
    const label = getLabel(address);
    return label
      ? label.namespace
        ? `${label.namespace.value}: ${label.value}`
        : label.value
      : null;
  }

  return {
    requestLabels,
    getLabel,
    getLabelText,
  };
}

export default useLabels;
