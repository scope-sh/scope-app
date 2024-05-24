import { defineStore } from 'pinia';
import { AbiEvent, AbiFunction, Address, Hex } from 'viem';
import { ref } from 'vue';

import { Chain } from '@/utils/chains';
import { merge } from '@/utils/misc';

const store = defineStore('abi', () => {
  const eventAbis = ref<
    Partial<Record<Chain, Record<Address, Record<Hex, AbiEvent>>>>
  >({});
  const functionAbis = ref<
    Partial<Record<Chain, Record<Address, Record<Hex, AbiFunction>>>>
  >({});

  function addEventAbis(
    chain: Chain,
    value: Record<Address, Record<Hex, AbiEvent>>,
  ): void {
    eventAbis.value = merge(eventAbis.value, { [chain]: value });
  }

  function getEventAbi(
    chain: Chain,
    address: Address,
    signature: Hex,
  ): AbiEvent | null {
    const chainAbis = eventAbis.value[chain];
    if (!chainAbis) {
      return null;
    }
    const addressAbis = chainAbis[address];
    if (!addressAbis) {
      return null;
    }
    return addressAbis[signature] || null;
  }

  function addFunctionAbis(
    chain: Chain,
    value: Record<Address, Record<Hex, AbiFunction>>,
  ): void {
    functionAbis.value = merge(functionAbis.value, { [chain]: value });
  }

  function getFunctionAbi(
    chain: Chain,
    address: Address,
    signature: Hex,
  ): AbiFunction | null {
    const chainAbis = functionAbis.value[chain];
    if (!chainAbis) {
      return null;
    }
    const addressAbis = chainAbis[address];
    if (!addressAbis) {
      return null;
    }
    return addressAbis[signature] || null;
  }

  return {
    addEventAbis,
    getEventAbi,
    addFunctionAbis,
    getFunctionAbi,
  };
});

export default store;
