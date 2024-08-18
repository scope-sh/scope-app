import { defineStore } from 'pinia';
import { ref } from 'vue';

import { type Toast, type Link, MAX_TOASTS } from '@/utils/ui.js';

const store = defineStore('ui', () => {
  const toasts = ref<Toast[]>([]);
  const isPaletteOpen = ref(false);
  const linkHover = ref<Link | null>(null);

  function addToast(toast: Toast): void {
    const activeToasts = toasts.value;
    toasts.value = [...activeToasts.slice(-MAX_TOASTS + 1), toast];
  }

  function removeToast(id: number): void {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  }

  function setPaletteOpen(isOpen: boolean): void {
    isPaletteOpen.value = isOpen;
  }

  function setLinkHover(link: Link | null): void {
    linkHover.value = link;
  }

  return {
    toasts,
    isPaletteOpen,
    linkHover,
    addToast,
    removeToast,
    setPaletteOpen,
    setLinkHover,
  };
});

export default store;
