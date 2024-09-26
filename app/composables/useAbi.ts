import type { AbiConstructor, AbiError } from 'abitype';
import type { AbiEvent, AbiFunction, Address, Hex } from 'viem';
import { computed } from 'vue';

import useChain from './useChain';

import ApiService from '@/services/api.js';
import type { AbiRequest, Abis } from '@/services/api.js';
import type { AbiRequestMap } from '@/stores/abi';
import useStore from '@/stores/abi';
import {
  STANDARD_ERROR,
  STANDARD_ERROR_SIGNATURE,
} from '@/utils/context/errors';

interface UseAbi {
  requestAbi: (address: Address, request: AbiRequest) => Promise<void>;
  addAbis: (value: Abis) => void;
  getConstructors: (address: Address) => AbiConstructor[];
  getEventAbi: (address: Address, signature: Hex) => AbiEvent | null;
  getFunctionAbi: (address: Address, signature: Hex) => AbiFunction | null;
  getFunctionName: (address: Address, signature: Hex) => string | null;
  getErrorAbi: (address: Address, signature: Hex) => AbiError | null;
}

function useAbi(): UseAbi {
  const store = useStore();
  const { id: chain } = useChain();
  const apiService = computed(() => new ApiService(chain.value));

  async function requestAbi(
    address: Address,
    request: AbiRequest,
  ): Promise<void> {
    store.requestAbi(address, request, handleAbiFetch);
  }

  async function handleAbiFetch(requests: AbiRequestMap): Promise<void> {
    // Fetch an ABI for every piece only once
    const uniqueRequests = new Map<Address, AbiRequest>();
    for (const [address, request] of requests) {
      const uniqueAddressRequest: AbiRequest = {};
      if (request.constructors) {
        if (store.getConstructors(chain.value, address).length > 0) {
          continue;
        }
        uniqueAddressRequest.constructors = true;
      }
      if (request.events) {
        for (const signature of request.events) {
          if (store.getEventAbi(chain.value, address, signature)) {
            continue;
          }
          uniqueAddressRequest.events ||= [];
          uniqueAddressRequest.events.push(signature);
        }
      }
      if (request.functions) {
        for (const signature of request.functions) {
          if (store.getFunctionAbi(chain.value, address, signature)) {
            continue;
          }
          uniqueAddressRequest.functions ||= [];
          uniqueAddressRequest.functions.push(signature);
        }
      }
      if (request.functionNames) {
        for (const signature of request.functionNames) {
          if (store.getFunctionName(chain.value, address, signature)) {
            continue;
          }
          uniqueAddressRequest.functionNames ||= [];
          uniqueAddressRequest.functionNames.push(signature);
        }
      }
      if (request.errors) {
        for (const signature of request.errors) {
          if (store.getErrorAbi(chain.value, address, signature)) {
            continue;
          }
          uniqueAddressRequest.errors ||= [];
          uniqueAddressRequest.errors.push(signature);
        }
      }

      if (Object.keys(uniqueAddressRequest).length > 0) {
        uniqueRequests.set(address, uniqueAddressRequest);
      }
    }

    await fetchAbis(uniqueRequests);
  }

  async function fetchAbis(requests: AbiRequestMap): Promise<void> {
    if (requests.size === 0) {
      return;
    }
    const requestMapping = Object.fromEntries(
      [...requests].map(([address, request]) => [address, request]),
    );
    // Fetch ABIs in a single request
    const abis = await apiService.value.getContractAbi(requestMapping);
    store.addAbis(chain.value, abis);
  }

  function addAbis(value: Abis): void {
    store.addAbis(chain.value, value);
  }

  function getConstructors(address: Address): AbiConstructor[] {
    return store.getConstructors(chain.value, address);
  }

  function getEventAbi(address: Address, signature: Hex): AbiEvent | null {
    return store.getEventAbi(chain.value, address, signature);
  }

  function getFunctionAbi(
    address: Address,
    signature: Hex,
  ): AbiFunction | null {
    return store.getFunctionAbi(chain.value, address, signature);
  }

  function getFunctionName(address: Address, signature: Hex): string | null {
    return store.getFunctionName(chain.value, address, signature);
  }

  function getErrorAbi(address: Address, signature: Hex): AbiError | null {
    if (signature === STANDARD_ERROR_SIGNATURE) {
      return STANDARD_ERROR;
    }
    return store.getErrorAbi(chain.value, address, signature);
  }

  return {
    requestAbi,
    addAbis,
    getConstructors,
    getEventAbi,
    getFunctionAbi,
    getFunctionName,
    getErrorAbi,
  };
}

export default useAbi;
