import type { RouterConfig } from '@nuxt/schema';
import type { Component } from 'vue';

import type { RouteName } from './utils/routing';

import Address from '@/pages/Address.vue';
import Block from '@/pages/Block.vue';
import Blocks from '@/pages/Blocks.vue';
import Chain from '@/pages/Chain.vue';
import GlobalAddress from '@/pages/GlobalAddress.vue';
import Home from '@/pages/Home.vue';
import Op from '@/pages/Op.vue';
import OpSimulation from '@/pages/OpSimulation.vue';
import Simulate from '@/pages/Simulate.vue';
import Transaction from '@/pages/Transaction.vue';

interface Route {
  path: string;
  name: RouteName;
  component: Component;
}

const routes: Route[] = [
  {
    name: 'home',
    path: '/',
    component: Home,
  },
  {
    name: 'global-address',
    path: '/address/:address',
    component: GlobalAddress,
  },
  {
    name: 'chain',
    path: '/:chain',
    component: Chain,
  },
  {
    name: 'blocks',
    path: '/:chain/blocks',
    component: Blocks,
  },
  {
    path: '/:chain/block/:number',
    name: 'block',
    component: Block,
  },
  {
    path: '/:chain/tx/:hash',
    name: 'transaction',
    component: Transaction,
  },
  {
    path: '/:chain/address/:address',
    name: 'address',
    component: Address,
  },
  {
    path: '/:chain/op/:hash',
    name: 'op',
    component: Op,
  },
  {
    path: '/simulate',
    name: 'simulate',
    component: Simulate,
  },
  {
    path: '/:chain/op/simulation',
    name: 'op-simulation',
    component: OpSimulation,
  },
];

export default <RouterConfig>{
  routes: (_routes) => routes,
};
