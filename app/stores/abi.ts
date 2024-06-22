import { defineStore } from 'pinia';
import type { AbiEvent, AbiFunction, Address, Hex } from 'viem';
import { ref } from 'vue';

import { type Abis } from '@/services/api.js';
import { type Chain } from '@/utils/chains.js';

const store = defineStore('abi', () => {
  const abis = ref<Partial<Record<Chain, Abis>>>({});

  function addAbis(chain: Chain, value: Abis): void {
    const chainAbis = abis.value[chain] || {};
    abis.value[chain] = chainAbis;

    for (const addressString in value) {
      const address = addressString as Address;
      const addressAbis = chainAbis[address] || { events: {}, functions: {} };
      chainAbis[address] = addressAbis;

      const newAddressAbis = value[address];
      if (!newAddressAbis) {
        continue;
      }

      const newEvents = newAddressAbis.events;
      for (const signatureString in newEvents) {
        const signature = signatureString as Hex;
        const newEvent = newEvents[signature];
        if (!newEvent) {
          continue;
        }
        addressAbis.events[signature] = newEvent;
      }

      const newFunctions = newAddressAbis.functions;
      for (const signatureString in newFunctions) {
        const signature = signatureString as Hex;
        const newFunction = newFunctions[signature];
        if (!newFunction) {
          continue;
        }
        addressAbis.functions[signature] = newFunction;
      }
    }
  }

  function getEventAbi(
    chain: Chain,
    address: Address,
    signature: Hex,
  ): AbiEvent | null {
    const chainAbis = abis.value[chain];
    if (!chainAbis) {
      return null;
    }
    const addressAbis = chainAbis[address];
    if (!addressAbis) {
      return null;
    }
    return addressAbis.events[signature] || null;
  }

  function getFunctionAbi(
    chain: Chain,
    address: Address,
    signature: Hex,
  ): AbiFunction | null {
    const chainAbis = abis.value[chain];
    if (!chainAbis) {
      return null;
    }
    const addressAbis = chainAbis[address];
    if (!addressAbis) {
      return null;
    }
    return addressAbis.functions[signature] || null;
  }

  return {
    addAbis,
    getEventAbi,
    getFunctionAbi,
  };
});

export default store;
