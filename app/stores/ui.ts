import { defineStore } from 'pinia';
import { ref } from 'vue';

import type { Toast } from '@/utils/ui.js';

const store = defineStore('ui', () => {
  const toast = ref<Toast | null>(null);
  const isPaletteOpen = ref(false);

  function setToast(newToast: Toast | null): void {
    toast.value = newToast;
  }

  function setPaletteOpen(isOpen: boolean): void {
    isPaletteOpen.value = isOpen;
  }

  return {
    toast,
    isPaletteOpen,
    setToast,
    setPaletteOpen,
  };
});

export default store;
