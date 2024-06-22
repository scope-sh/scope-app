import { useDebounceFn } from '@vueuse/core';
import type { Ref } from 'vue';
import { onMounted, ref, watch } from 'vue';

import useUiStore from '@/stores/ui.js';
import type { Toast } from '@/utils/ui.js';
import { TOAST_DURATION } from '@/utils/ui.js';

interface UseToast {
  active: Ref<Toast | null>;
  send: (toast: Toast) => void;
  hide: () => void;
}

function useToast(): UseToast {
  const active = ref<Toast | null>(null);
  const store = useUiStore();

  onMounted(() => {
    active.value = store.toast;

    watch(
      () => store.toast,
      (newChain) => {
        active.value = newChain;
      },
    );
  });

  const hideLater = useDebounceFn(() => {
    store.setToast(null);
  }, TOAST_DURATION);

  function send(toast: Toast): void {
    store.setToast(toast);
    hideLater();
  }

  function hide(): void {
    store.setToast(null);
  }

  return { active, send, hide };
}

export default useToast;
