import { createPinia } from 'pinia';
import { createHead } from 'unhead';
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
createHead();

const app = createApp(App);

app.use(router);
app.use(pinia);

app.mount('#app');

export { routerHistory, router };
