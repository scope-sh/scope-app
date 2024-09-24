import type { AbiConstructor } from 'abitype';
import { defineStore } from 'pinia';
import type { AbiEvent, AbiFunction, Address, Hex } from 'viem';
import { ref } from 'vue';

import type { Abis } from '@/services/api.js';
import type { Chain } from '@/utils/chains.js';

const store = defineStore('abi', () => {
  const abis = ref<Partial<Record<Chain, Abis>>>({});

  function addAbis(chain: Chain, value: Abis): void {
    const chainAbis = abis.value[chain] || {};
    abis.value[chain] = chainAbis;

    for (const addressString in value) {
      const address = addressString as Address;
      const addressAbis = chainAbis[address] || {
        constructors: [],
        events: {},
        functionNames: {},
        functions: {},
      };
      chainAbis[address] = addressAbis;

      const newAddressAbis = value[address];
      if (!newAddressAbis) {
        continue;
      }

      const newConstructors = newAddressAbis.constructors;
      for (const constructor of newConstructors) {
        if (addressAbis.constructors.includes(constructor)) {
          continue;
        }
        addressAbis.constructors.push(constructor);
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

      const newFunctionNames = newAddressAbis.functionNames;
      for (const signatureString in newFunctionNames) {
        const signature = signatureString as Hex;
        const newFunctionName = newFunctionNames[signature];
        if (!newFunctionName) {
          continue;
        }
        addressAbis.functionNames[signature] = newFunctionName;
      }
    }
  }

  function getConstructors(chain: Chain, address: Address): AbiConstructor[] {
    const chainAbis = abis.value[chain];
    if (!chainAbis) {
      return [];
    }
    const addressAbis = chainAbis[address];
    if (!addressAbis) {
      return [];
    }
    return addressAbis.constructors;
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

  function getFunctionName(
    chain: Chain,
    address: Address,
    signature: Hex,
  ): string | null {
    const chainAbis = abis.value[chain];
    if (!chainAbis) {
      return null;
    }
    const addressAbis = chainAbis[address];
    if (!addressAbis) {
      return null;
    }
    return addressAbis.functionNames[signature] || null;
  }

  return {
    addAbis,
    getConstructors,
    getEventAbi,
    getFunctionAbi,
    getFunctionName,
  };
});

export default store;
