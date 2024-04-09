import { Address } from 'viem';
import { computed } from 'vue';

import ApiService from '@/services/api';
import useStore from '@/stores/labels.js';

import useChain from './useChain';

interface UseLabels {
  requestLabels: (addresses: Address[]) => Promise<void>;
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
      if (existingLabel === undefined) {
        addressSet.add(address);
      }
    }
    const uniqueAddresses = Array.from(addressSet);
    const labels = await apiService.value.getLabels(uniqueAddresses);
    store.addLabels(chain.value, labels);
  }

  function getLabelText(address: Address): string | null {
    const label = store.getLabel(chain.value, address);
    return label
      ? label.namespace
        ? `${label.namespace}: ${label.value}`
        : label.value
      : null;
  }

  return {
    requestLabels,
    getLabelText,
  };
}

export default useLabels;
