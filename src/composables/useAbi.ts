import { AbiEvent, AbiFunction, Address, Hex } from 'viem';

import useStore from '@/stores/abi';

import useChain from './useChain';

interface UseAbi {
  addEventAbis: (value: Record<Address, Record<Hex, AbiEvent>>) => void;
  getEventAbi: (address: Address, signature: Hex) => AbiEvent | null;
  addFunctionAbis: (value: Record<Address, Record<Hex, AbiFunction>>) => void;
  getFunctionAbi: (address: Address, signature: Hex) => AbiFunction | null;
}

function useAbi(): UseAbi {
  const store = useStore();
  const { id: chain } = useChain();

  function addEventAbis(value: Record<Address, Record<Hex, AbiEvent>>): void {
    store.addEventAbis(chain.value, value);
  }

  function getEventAbi(address: Address, signature: Hex): AbiEvent | null {
    return store.getEventAbi(chain.value, address, signature);
  }

  function addFunctionAbis(
    value: Record<Address, Record<Hex, AbiFunction>>,
  ): void {
    store.addFunctionAbis(chain.value, value);
  }

  function getFunctionAbi(
    address: Address,
    signature: Hex,
  ): AbiFunction | null {
    return store.getFunctionAbi(chain.value, address, signature);
  }

  return {
    addEventAbis,
    getEventAbi,
    addFunctionAbis,
    getFunctionAbi,
  };
}

export default useAbi;
