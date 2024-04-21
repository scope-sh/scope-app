import { Address } from 'viem';
import type { RouteLocationRaw } from 'vue-router';

import type { Chain } from './chains';

interface HomeRoute {
  name: 'home';
}

interface ChainRoute {
  name: 'chain';
  chain?: Chain;
}

interface BlockRoute {
  name: 'block';
  chain?: Chain;
  number: bigint;
}

interface TransactionRoute {
  name: 'transaction';
  chain?: Chain;
  hash: string;
}

interface AddressRoute {
  name: 'address';
  chain?: Chain;
  address: Address;
}

interface UserOpRoute {
  name: 'userop';
  chain?: Chain;
  hash: string;
}

type Route =
  | HomeRoute
  | ChainRoute
  | BlockRoute
  | TransactionRoute
  | AddressRoute
  | UserOpRoute;

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
    case 'transaction':
      return {
        name: 'transaction',
        params: {
          chain: route.chain,
          hash: route.hash,
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
    case 'userop':
      return {
        name: 'userop',
        params: {
          chain: route.chain,
          hash: route.hash,
        },
      };
  }
}

export { getRouteLocation };
export type { Route };
