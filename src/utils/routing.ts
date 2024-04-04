import { Address } from 'viem';
import type { RouteLocationRaw } from 'vue-router';

import type { Chain } from './chains';

interface HomeRoute {
  name: 'home';
}

interface ChainRoute {
  name: 'chain';
  chain: Chain;
}

interface BlockRoute {
  name: 'block';
  chain?: Chain;
  number: bigint;
}

interface AddressRoute {
  name: 'address';
  chain?: Chain;
  address: Address;
}

type Route = HomeRoute | ChainRoute | BlockRoute | AddressRoute;

function getRouteLocation(route: Route): RouteLocationRaw {
  switch (route.name) {
    case 'home':
      return {
        name: 'home',
      };
    case 'chain':
      return {
        name: 'chain',
        params: {
          chain: route.chain,
        },
      };
    case 'block':
      return {
        name: 'block',
        params: {
          chain: route.chain,
          number: route.number.toString(),
        },
      };
    case 'address':
      return {
        name: 'address',
        params: {
          chain: route.chain,
          address: route.address,
        },
      };
  }
}

export { getRouteLocation };
export type { Route };
