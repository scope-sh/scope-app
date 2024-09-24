import type { AbiEvent, AbiFunction, Address, Hex } from 'viem';

import useChain from './useChain';

import type { Abis } from '@/services/api.js';
import useStore from '@/stores/abi';

interface UseAbi {
  addAbis: (value: Abis) => void;
  getEventAbi: (address: Address, signature: Hex) => AbiEvent | null;
  getFunctionAbi: (address: Address, signature: Hex) => AbiFunction | null;
  getFunctionName: (address: Address, signature: Hex) => string | null;
}

function useAbi(): UseAbi {
  const store = useStore();
  const { id: chain } = useChain();

  function addAbis(value: Abis): void {
    store.addAbis(chain.value, value);
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

  return {
    addAbis,
    getEventAbi,
    getFunctionAbi,
    getFunctionName,
  };
}

export default useAbi;
