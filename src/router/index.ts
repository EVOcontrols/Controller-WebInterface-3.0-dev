import { useIndexStore } from '@/stores';
import { createRouter, createWebHistory } from 'vue-router';

const commonPageTitle = 'EVO controls';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginPage.vue'),
      meta: {
        title: `${commonPageTitle} | Login`,
      },
    },
    {
      path: '/panel',
      name: 'panel',
      component: () => import('@/views/PanelPage.vue'),
      redirect: { name: 'widgets' },
      children: [
        {
          path: 'widgets',
          name: 'widgets',
          component: () => import('@/views/panel/WidgetsPage.vue'),
        },
      ],
    },
    {
      path: '/:(.*)*',
      redirect: { name: 'widgets' },
    },
  ],
});

router.beforeEach((to) => {
  if (!router.hasRoute(to.name as string)) {
    return { name: 'widgets' };
  }
  const indexStore = useIndexStore();
  const isAuth = indexStore.isAuth;
  if (to.name !== 'login' && !isAuth) {
    return { name: 'login' };
  }
  if (to.name === 'login' && isAuth) {
    return { name: 'widgets' };
  }
});

router.afterEach((to, from) => {
  window.document.title = (to.meta?.title as string) || 'EVO controls';
  Object.assign(to.meta, { previous: from.name });
});

export default router;
