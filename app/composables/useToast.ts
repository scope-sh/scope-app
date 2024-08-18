import type { Ref } from 'vue';
import { onMounted, ref, watch } from 'vue';

import useUiStore from '@/stores/ui.js';
import type { Toast, ToastData } from '@/utils/ui.js';

interface UseToast {
  items: Ref<Toast[]>;
  send: (toast: ToastData) => void;
  hide: (index: number) => void;
}

function useToast(): UseToast {
  const items = ref<Toast[]>([]);
  const store = useUiStore();

  onMounted(() => {
    items.value = store.toasts;

    watch(
      () => store.toasts,
      (newToasts) => {
        items.value = newToasts;
      },
    );
  });

  function send(toast: ToastData): void {
    // Generate a random id
    const id = Math.floor(Math.random() * 1000000);
    store.addToast({
      ...toast,
      id,
    });
  }

  function hide(id: number): void {
    store.removeToast(id);
  }

  return { items, send, hide };
}

export default useToast;
