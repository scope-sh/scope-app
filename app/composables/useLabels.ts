import type { Address } from 'viem';
import { computed } from 'vue';

import useChain from './useChain';

import ApiService, { type Label } from '@/services/api.js';
import type { Requests, RequestType } from '@/stores/labels.js';
import useStore from '@/stores/labels.js';
import type { Chain } from '@/utils/chains.js';

interface UseLabels {
  requestLabel: (address: Address, type: RequestType) => Promise<void>;
  getLabel: (address: Address) => Label | null;
  getLabels: (address: Address) => Label[];
  getLabelText: (address: Address) => string | null;
  getLabelIcon: (address: Address) => string | null;
}

function useLabels(chainOverride?: Chain): UseLabels {
  const store = useStore();
  const { id: availableChain } = useChain();
  const chain = computed(() => chainOverride ?? availableChain.value);
  const apiService = computed(() => new ApiService(chain.value));

  async function requestLabel(
    address: Address,
    type: RequestType,
  ): Promise<void> {
    store.requestLabel(chain.value, address, type, handleLabelFetch);
  }

  async function handleLabelFetch(requests: Requests): Promise<void> {
    for (const [chain, chainRequests] of requests) {
      // Fetch a label for every address only once
      const primaryLabelAddresses = new Set<Address>();
      const allLabelAddresses = new Set<Address>();
      for (const [address, type] of chainRequests) {
        const existingLabels = store.getAddressLabels(chain, address);
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
      fetchPrimaryLabels(chain, [...primaryLabelAddresses]);
      fetchAllLabels(chain, [...allLabelAddresses]);
    }
  }

  async function fetchPrimaryLabels(
    chain: Chain,
    addresses: Address[],
  ): Promise<void> {
    if (addresses.length === 0) {
      return;
    }
    // Fetch primary labels in a single request
    const primaryLabels =
      await apiService.value.getPrimaryAddressLabels(addresses);
    store.addPrimaryLabels(chain, primaryLabels);
  }

  async function fetchAllLabels(
    chain: Chain,
    addresses: Address[],
  ): Promise<void> {
    // Fetch all labels for each address
    for (const address of addresses) {
      const labels = await apiService.value.getAllAddressLabels(address);
      store.addAllLabels(chain, address, labels);
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
