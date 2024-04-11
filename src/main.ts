import { createHead } from '@unhead/vue';
import { createPinia } from 'pinia';
import { createApp } from 'vue';
import { createWebHistory, createRouter } from 'vue-router';

import App from './App.vue';
import routes from './routes';

const routerHistory = createWebHistory();
const router = createRouter({
  history: routerHistory,
  routes,
});
const pinia = createPinia();
const head = createHead();

const app = createApp(App);

app.use(router);
app.use(pinia);
app.use(head);

app.mount('#app');

export { routerHistory, router };
