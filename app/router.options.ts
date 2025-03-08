import type { RouterConfig } from '@nuxt/schema';

import Address from '@/pages/Address.vue';
import Block from '@/pages/Block.vue';
import Chain from '@/pages/Chain.vue';
import GlobalAddress from '@/pages/GlobalAddress.vue';
import Op from '@/pages/Op.vue';
import OpSimulation from '@/pages/OpSimulation.vue';
import Simulate from '@/pages/Simulate.vue';
import Transaction from '@/pages/Transaction.vue';

export default <RouterConfig>{
  routes: (_routes) => [
    {
      name: 'home',
      path: '/',
      redirect: '/1',
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
  ],
};
