import type { RouteRecordRaw } from 'vue-router';

import Address from './pages/Address.vue';
import Block from './pages/Block.vue';
import Chain from './pages/Chain.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    redirect: '/1',
  },
  {
    path: '/:chain',
    name: 'chain',
    component: Chain,
  },
  {
    path: '/:chain/block/:number',
    name: 'block',
    component: Block,
  },
  {
    path: '/:chain/address/:address',
    name: 'address',
    component: Address,
  },
];

export default routes;
