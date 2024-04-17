import type { RouteRecordRaw } from 'vue-router';

import Address from './pages/Address.vue';
import Block from './pages/Block.vue';
import Chain from './pages/Chain.vue';
import Transaction from './pages/Transaction.vue';
import UserOp from './pages/UserOp.vue';

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
    path: '/:chain/transaction/:hash',
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
];

export default routes;
