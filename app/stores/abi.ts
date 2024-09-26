import { useDebounceFn } from '@vueuse/core';
import type { AbiConstructor, AbiError } from 'abitype';
import { defineStore } from 'pinia';
import type { AbiEvent, AbiFunction, Address, Hex } from 'viem';
import { ref } from 'vue';

import type { Abis, AbiRequest } from '@/services/api.js';
import type { Chain } from '@/utils/chains.js';

type AbiRequestMap = Map<Address, AbiRequest>;

const store = defineStore('abi', () => {
  const abis = ref<Partial<Record<Chain, Abis>>>({});
  const requests: AbiRequestMap = new Map();

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
        errors: {},
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

      const newErrors = newAddressAbis.errors;
      for (const signatureString in newErrors) {
        const signature = signatureString as Hex;
        const newError = newErrors[signature];
        if (!newError) {
          continue;
        }
        addressAbis.errors[signature] = newError;
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

  function getErrorAbi(
    chain: Chain,
    address: Address,
    signature: Hex,
  ): AbiError | null {
    const chainAbis = abis.value[chain];
    if (!chainAbis) {
      return null;
    }
    const addressAbis = chainAbis[address];
    if (!addressAbis) {
      return null;
    }
    return addressAbis.errors[signature] || null;
  }

  const debouncedFn = useDebounceFn(
    (onFetch: (requests: AbiRequestMap) => void) => {
      onFetch(requests);
      requests.clear();
    },
    50,
    { maxWait: 500 },
  );

  async function requestAbi(
    address: Address,
    request: AbiRequest,
    onFetch: (requests: AbiRequestMap) => void,
  ): Promise<void> {
    // If we receive two requests for the same address, make sure to merge them
    const oldRequest = requests.get(address);
    const newRequest: AbiRequest = {};
    if (oldRequest) {
      if (oldRequest.constructors || request.constructors) {
        newRequest.constructors = true;
      }
      if (oldRequest.events || request.events) {
        newRequest.events = [
          ...(oldRequest.events || []),
          ...(request.events || []),
        ];
      }
      if (oldRequest.functions || request.functions) {
        newRequest.functions = [
          ...(oldRequest.functions || []),
          ...(request.functions || []),
        ];
      }
      if (oldRequest.functionNames || request.functionNames) {
        newRequest.functionNames = [
          ...(oldRequest.functionNames || []),
          ...(request.functionNames || []),
        ];
      }
      if (oldRequest.errors || request.errors) {
        newRequest.errors = [
          ...(oldRequest.errors || []),
          ...(request.errors || []),
        ];
      }
    } else {
      Object.assign(newRequest, request);
    }
    requests.set(address, newRequest);
    debouncedFn(onFetch);
  }

  return {
    addAbis,
    getConstructors,
    getEventAbi,
    getFunctionAbi,
    getFunctionName,
    getErrorAbi,
    requestAbi,
  };
});

export default store;
export type { AbiRequestMap };
