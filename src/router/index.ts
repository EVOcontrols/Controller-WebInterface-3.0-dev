import { useIndexStore } from '@/stores';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginPage.vue'),
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
    console.log('no route');
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

export default router;
