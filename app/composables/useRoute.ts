import {
  type RouteLocationNormalizedLoaded,
  useRoute as vueUseRoute,
} from 'vue-router';

import type { RouteLocation } from '@/utils/routing';

function useRoute<R extends RouteLocation>(): RouteLocationNormalizedLoaded &
  R {
  const route = vueUseRoute() as RouteLocationNormalizedLoaded & R;
  return route;
}

export default useRoute;
