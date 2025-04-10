import type { Address, Hex } from 'viem';

import type { Chain } from './chains';

interface HomeRoute {
  name: 'home';
}

interface GlobalAddressRoute {
  name: 'global-address';
  address: Address;
}

interface ChainRoute {
  name: 'chain';
  chain?: Chain;
}

interface BlocksRoute {
  name: 'blocks';
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
  hash: Hex;
}

interface AddressRoute {
  name: 'address';
  chain?: Chain;
  address: Address;
}

interface OpRoute {
  name: 'op';
  chain?: Chain;
  hash: Hex;
}

interface SimulateRoute {
  name: 'simulate';
}

interface OpSimulationRoute {
  name: 'op-simulation';
  chain?: Chain;
  blockNumber?: number;
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
  | GlobalAddressRoute
  | ChainRoute
  | BlocksRoute
  | BlockRoute
  | TransactionRoute
  | AddressRoute
  | OpRoute
  | SimulateRoute
  | OpSimulationRoute;

type RouteName = Route['name'];

interface HomeRouteLocation {
  name: 'home';
}

interface GlobalAddressRouteLocation {
  name: 'global-address';
  params: {
    address: Address;
  };
}

interface ChainRouteLocation {
  name: 'chain';
  params: {
    chain?: Chain;
  };
}

interface BlocksRouteLocation {
  name: 'blocks';
  params: {
    chain?: Chain;
  };
}

interface BlockRouteLocation {
  name: 'block';
  params: {
    chain?: Chain;
    number: string;
  };
}

interface TransactionRouteLocation {
  name: 'transaction';
  params: {
    chain?: Chain;
    hash: Hex;
  };
}

interface AddressRouteLocation {
  name: 'address';
  params: {
    chain?: Chain;
    address: Address;
  };
}

interface OpRouteLocation {
  name: 'op';
  params: {
    chain?: Chain;
    hash: Hex;
  };
}

interface SimulateRouteLocation {
  name: 'simulate';
}

interface OpSimulationRouteLocation {
  name: 'op-simulation';
  params: {
    chain?: Chain;
  };
  query: {
    blockNumber?: number;
    entryPoint: Address;
    sender: Address;
    nonce: string;
    initCode: Hex;
    callData: Hex;
    accountGasLimits: string;
    preVerificationGas: string;
    gasFees: string;
    paymasterAndData: Hex;
    signature: Hex;
  };
}

type RouteLocation =
  | HomeRouteLocation
  | GlobalAddressRouteLocation
  | ChainRouteLocation
  | BlocksRouteLocation
  | BlockRouteLocation
  | TransactionRouteLocation
  | AddressRouteLocation
  | OpRouteLocation
  | SimulateRouteLocation
  | OpSimulationRouteLocation;

function isExplorerRoute(routeName: RouteName): boolean {
  switch (routeName) {
    case 'home':
    case 'global-address':
    case 'chain':
    case 'blocks':
    case 'block':
    case 'transaction':
    case 'address':
    case 'op':
      return true;
    case 'simulate':
    case 'op-simulation':
      return false;
  }
}

function isSimulatorRoute(routeName: RouteName): boolean {
  switch (routeName) {
    case 'simulate':
    case 'op-simulation':
      return true;
    case 'home':
    case 'global-address':
    case 'chain':
    case 'blocks':
    case 'block':
    case 'transaction':
    case 'address':
    case 'op':
      return false;
  }
}

function getRouteLocation(route: Route): RouteLocation {
  switch (route.name) {
    case 'home':
      return {
        name: 'home',
      };
    case 'global-address':
      return {
        name: 'global-address',
        params: {
          address: route.address,
        },
      };
    case 'chain':
      return {
        name: 'chain',
        params: {
          chain: route.chain,
        },
      };
    case 'blocks':
      return {
        name: 'blocks',
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
          blockNumber: route.blockNumber,
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
export type {
  Route,
  RouteName,
  BlockRoute,
  OpSimulationRoute,
  RouteLocation,
  HomeRouteLocation,
  GlobalAddressRouteLocation,
  ChainRouteLocation,
  BlockRouteLocation,
  TransactionRouteLocation,
  AddressRouteLocation,
  OpRouteLocation,
  SimulateRouteLocation,
  OpSimulationRouteLocation,
};
