import { defineStore } from 'pinia';
import { Address } from 'viem';
import { ref } from 'vue';

import { Label } from '@/services/api.js';

const store = defineStore('labels', () => {
  const labels = ref<Record<Address, Label>>({});

  function setLabels(value: Record<Address, Label>): void {
    labels.value = value;
  }

  function getLabel(address: Address): Label | null {
    return labels.value[address] || null;
  }

  return {
    setLabels,
    getLabel,
  };
});

export default store;
