import { computed, type Ref } from 'vue';

import useUiStore from '@/stores/ui.js';
import type { Link } from '@/utils/ui.js';

interface UseLinkHover {
  link: Ref<Link | null>;
  setLink: (link: Link | null) => void;
}

function useLinkHover(): UseLinkHover {
  const store = useUiStore();

  const link = computed(() => store.linkHover);

  function setLink(link: Link | null): void {
    store.setLinkHover(link);
  }

  return { link, setLink };
}

export default useLinkHover;
