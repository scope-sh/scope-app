import { Address } from 'viem';

import { Label } from '@/services/api';
import useStore from '@/stores/labels.js';

interface UseLabels {
  setLabels: (value: Record<Address, Label>) => void;
  getLabelText: (address: Address) => string | null;
}

function useLabels(): UseLabels {
  const store = useStore();

  function setLabels(value: Record<Address, Label>): void {
    store.setLabels(value);
  }

  function getLabelText(address: Address): string | null {
    const label = store.getLabel(address);
    return label
      ? label.namespace
        ? `${label.namespace}: ${label.value}`
        : label.value
      : null;
  }

  return {
    setLabels,
    getLabelText,
  };
}

export default useLabels;
