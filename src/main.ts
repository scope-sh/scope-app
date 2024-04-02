import { createApp } from 'vue';
import { createWebHistory, createRouter } from 'vue-router';

import App from './App.vue';
import routes from './routes';

const routerHistory = createWebHistory();
const router = createRouter({
  history: routerHistory,
  routes,
});

const app = createApp(App);

app.use(router);

app.mount('#app');

export { routerHistory, router };
