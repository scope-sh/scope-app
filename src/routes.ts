import type { RouteRecordRaw } from 'vue-router';

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
];

export default routes;
