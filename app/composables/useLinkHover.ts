import { computed, type Ref } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';

import useUiStore from '@/stores/ui.js';
import type { Route } from '@/utils/routing.js';

interface UseLinkHover {
  route: Ref<Route | null>;
  setRoute: (route: Route | null) => void;
}

function useLinkHover(): UseLinkHover {
  const store = useUiStore();

  const route = computed(() => store.hoveredRoute);

  onBeforeRouteLeave(() => {
    setRoute(null);
  });

  function setRoute(route: Route | null): void {
    store.setHoveredRoute(route);
  }

  return { route, setRoute };
}

export default useLinkHover;
