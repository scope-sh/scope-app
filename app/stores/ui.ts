import { defineStore } from 'pinia';
import { ref } from 'vue';

import type { Route } from '@/utils/routing.js';
import { type Toast, MAX_TOASTS } from '@/utils/ui.js';

const store = defineStore('ui', () => {
  const toasts = ref<Toast[]>([]);
  const isPaletteOpen = ref(false);
  const hoveredRoute = ref<Route | null>(null);

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

  function setHoveredRoute(route: Route | null): void {
    hoveredRoute.value = route;
  }

  return {
    toasts,
    isPaletteOpen,
    hoveredRoute,
    addToast,
    removeToast,
    setPaletteOpen,
    setHoveredRoute,
  };
});

export default store;
