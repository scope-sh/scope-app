import { defineStore } from 'pinia';
import { ref } from 'vue';

import type { Toast, Link } from '@/utils/ui.js';

const store = defineStore('ui', () => {
  const toast = ref<Toast | null>(null);
  const isPaletteOpen = ref(false);
  const linkHover = ref<Link | null>(null);

  function setToast(newToast: Toast | null): void {
    toast.value = newToast;
  }

  function setPaletteOpen(isOpen: boolean): void {
    isPaletteOpen.value = isOpen;
  }

  function setLinkHover(link: Link | null): void {
    linkHover.value = link;
  }

  return {
    toast,
    isPaletteOpen,
    linkHover,
    setToast,
    setPaletteOpen,
    setLinkHover,
  };
});

export default store;
