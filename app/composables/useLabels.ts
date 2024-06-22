import type { Address } from 'viem';
import { computed } from 'vue';

import useChain from './useChain';

import ApiService, { type Label } from '@/services/api.js';
import type { Requests, RequestType } from '@/stores/labels.js';
import useStore from '@/stores/labels.js';

interface UseLabels {
  requestLabel: (address: Address, type: RequestType) => Promise<void>;
  getLabel: (address: Address) => Label | null;
  getLabels: (address: Address) => Label[];
  getLabelText: (address: Address) => string | null;
  getLabelIcon: (address: Address) => string | null;
}

function useLabels(): UseLabels {
  const store = useStore();
  const { id: chain } = useChain();
  const apiService = computed(() => new ApiService(chain.value));

  async function requestLabel(
    address: Address,
    type: RequestType,
  ): Promise<void> {
    store.requestLabel(address, type, handleLabelFetch);
  }

  async function handleLabelFetch(requests: Requests): Promise<void> {
    // Fetch a label for every address only once
    const primaryLabelAddresses = new Set<Address>();
    const allLabelAddresses = new Set<Address>();
    for (const [address, type] of requests) {
      const existingLabels = store.getAddressLabels(chain.value, address);
      if (existingLabels && existingLabels.type === 'all') {
        continue;
      }
      if (type === 'primary') {
        if (existingLabels && existingLabels.type === 'primary') {
          continue;
        }
        primaryLabelAddresses.add(address);
      } else {
        allLabelAddresses.add(address);
      }
    }
    fetchPrimaryLabels([...primaryLabelAddresses]);
    fetchAllLabels([...allLabelAddresses]);
  }

  async function fetchPrimaryLabels(addresses: Address[]): Promise<void> {
    if (addresses.length === 0) {
      return;
    }
    // Fetch primary labels in a single request
    const primaryLabels =
      await apiService.value.getPrimaryAddressLabels(addresses);
    store.addPrimaryLabels(chain.value, primaryLabels);
  }

  async function fetchAllLabels(addresses: Address[]): Promise<void> {
    // Fetch all labels for each address
    for (const address of addresses) {
      const labels = await apiService.value.getAllAddressLabels(address);
      store.addAllLabels(chain.value, address, labels);
    }
  }

  function getLabel(address: Address): Label | null {
    const allLabels = store.getLabels(chain.value, address);
    return allLabels[0] || null;
  }

  function getLabels(address: Address): Label[] {
    const allLabels = store.getLabels(chain.value, address);
    return allLabels;
  }

  function getLabelText(address: Address): string | null {
    const label = getLabel(address);
    return label
      ? label.namespace
        ? `${label.namespace.value}: ${label.value}`
        : label.value
      : null;
  }

  function getLabelIcon(address: Address): string | null {
    const label = getLabel(address);
    if (!label) {
      return null;
    }
    if (!label.iconUrl) {
      return null;
    }
    return label.iconUrl;
  }

  return {
    requestLabel,
    getLabel,
    getLabels,
    getLabelText,
    getLabelIcon,
  };
}

export default useLabels;
