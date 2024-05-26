import { AbiEvent, AbiFunction, Address, Hex } from 'viem';

import { Abis } from '@/services/api';
import useStore from '@/stores/abi';

import useChain from './useChain';

interface UseAbi {
  addAbis: (value: Abis) => void;
  getEventAbi: (address: Address, signature: Hex) => AbiEvent | null;
  getFunctionAbi: (address: Address, signature: Hex) => AbiFunction | null;
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

  return {
    addAbis,
    getEventAbi,
    getFunctionAbi,
  };
}

export default useAbi;
