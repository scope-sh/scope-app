import { useDebounceFn } from '@vueuse/core';
import { defineStore } from 'pinia';
import { Address } from 'viem';
import { ref } from 'vue';

import { Label } from '@/services/api.js';
import { Chain } from '@/utils/chains';

type RequestType = 'primary' | 'all';

interface AddressLabels {
  value: Label[];
  type: RequestType;
}

type Requests = Map<Address, RequestType>;

const store = defineStore('labels', () => {
  const labels = ref<Partial<Record<Chain, Record<Address, AddressLabels>>>>(
    {},
  );
  const requests: Requests = new Map();

  function addPrimaryLabels(chain: Chain, value: Record<Address, Label>): void {
    if (Object.keys(value).length === 0) {
      return;
    }
    const chainLabels = labels.value[chain] || {};
    const primaryLabels = Object.fromEntries(
      Object.entries(value).map(([address, label]) => [
        address,
        { value: [label], type: 'primary' },
      ]),
    ) as Record<Address, AddressLabels>;
    labels.value[chain] = { ...chainLabels, ...primaryLabels };
  }

  function addAllLabels(chain: Chain, address: Address, value: Label[]): void {
    if (value.length === 0) {
      return;
    }
    const chainLabels = labels.value[chain] || {};
    const addressLabels = chainLabels[address] || { value, type: 'all' };
    chainLabels[address] = addressLabels;
    labels.value[chain] = chainLabels;
  }

  function getLabels(chain: Chain, address: Address): Label[] {
    const chainLabels = labels.value[chain];
    if (!chainLabels) {
      return [];
    }
    const addressLabels = chainLabels[address];
    if (!addressLabels) {
      return [];
    }
    return addressLabels.value;
  }

  function getAddressLabels(
    chain: Chain,
    address: Address,
  ): AddressLabels | null {
    const chainLabels = labels.value[chain];
    if (!chainLabels) {
      return null;
    }
    return chainLabels[address] || null;
  }

  const debouncedFn = useDebounceFn(
    (onFetch: (requests: Requests) => void) => {
      onFetch(requests);
      requests.clear();
    },
    50,
    { maxWait: 500 },
  );

  async function requestLabel(
    address: Address,
    type: RequestType,
    onFetch: (requests: Requests) => void,
  ): Promise<void> {
    // If we receive two requests for the same address (primary and all), make sure to fetch all labels
    const oldRequestType = requests.get(address);
    const newRequestType = oldRequestType
      ? oldRequestType === 'primary'
        ? type
        : 'all'
      : type;
    requests.set(address, newRequestType);
    debouncedFn(onFetch);
  }

  return {
    addPrimaryLabels,
    addAllLabels,
    getLabels,
    getAddressLabels,
    requestLabel,
  };
});

export default store;
export type { Requests, RequestType };
