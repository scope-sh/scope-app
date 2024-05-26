import { defineStore } from 'pinia';
import { AbiEvent, AbiFunction, Address, Hex } from 'viem';
import { ref } from 'vue';

import { Abis } from '@/services/api';
import { Chain } from '@/utils/chains';
import { merge } from '@/utils/misc';

const store = defineStore('abi', () => {
  const abis = ref<Partial<Record<Chain, Abis>>>({});

  function addAbis(chain: Chain, value: Abis): void {
    abis.value = merge(abis.value, { [chain]: value });
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
