import type { Address, Hex } from 'viem';
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

interface OpRoute {
  name: 'op';
  chain?: Chain;
  hash: string;
}

interface SimulateRoute {
  name: 'simulate';
}

interface OpSimulationRoute {
  name: 'op-simulation';
  chain?: Chain;
  entryPoint: Address;
  sender: Address;
  nonce: Hex;
  initCode: Hex;
  callData: Hex;
  accountGasLimits: Hex;
  preVerificationGas: Hex;
  gasFees: Hex;
  paymasterAndData: Hex;
  signature: Hex;
}

type Route =
  | HomeRoute
  | ChainRoute
  | BlockRoute
  | TransactionRoute
  | AddressRoute
  | OpRoute
  | SimulateRoute
  | OpSimulationRoute;

function isExplorerRoute(routeName: string | symbol | undefined): boolean {
  if (!routeName) {
    return false;
  }
  if (typeof routeName === 'symbol') {
    return false;
  }
  const exploreRoutes = ['home', 'chain', 'block', 'transaction', 'address', 'op'];
  return exploreRoutes.includes(routeName);
}

function isSimulatorRoute(routeName: string | symbol | undefined): boolean {
  if (!routeName) {
    return false;
  }
  if (typeof routeName === 'symbol') {
    return false;
  }
  const simulateRoutes = ['simulate', 'op-simulation'];
  return simulateRoutes.includes(routeName);
}

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
    case 'op':
      return {
        name: 'op',
        params: {
          chain: route.chain,
          hash: route.hash,
        },
      };
    case 'simulate':
      return {
        name: 'simulate',
      };
    case 'op-simulation':
      return {
        name: 'op-simulation',
        params: {
          chain: route.chain,
        },
        query: {
          entryPoint: route.entryPoint,
          sender: route.sender,
          nonce: route.nonce.toString(),
          initCode: route.initCode,
          callData: route.callData,
          accountGasLimits: route.accountGasLimits.toString(),
          preVerificationGas: route.preVerificationGas.toString(),
          gasFees: route.gasFees.toString(),
          paymasterAndData: route.paymasterAndData,
          signature: route.signature,
        },
      };
  }
}

export { getRouteLocation, isExplorerRoute, isSimulatorRoute };
export type { Route, OpSimulationRoute };
