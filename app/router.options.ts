import type { RouterConfig } from '@nuxt/schema';

import Address from '@/pages/Address.vue';
import Block from '@/pages/Block.vue';
import Chain from '@/pages/Chain.vue';
import Transaction from '@/pages/Transaction.vue';
import UserOp from '@/pages/UserOp.vue';

export default <RouterConfig>{
  routes: (_routes) => [
    {
      name: 'home',
      path: '/',
      redirect: '/1',
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
      name: 'userop',
      component: UserOp,
    },
  ],
};
