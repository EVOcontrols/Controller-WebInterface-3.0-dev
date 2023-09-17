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
      path: '/c',
      name: 'c',
      component: () => import('@/views/WorkSpace.vue'),
      redirect: { name: 'widgets' },
      children: [
        {
          path: 'panel',
          name: 'panel',
          component: () => import('@/views/panel/PanelWrapper.vue'),
          redirect: { name: 'widgets' },
          children: [
            {
              path: '',
              name: 'widgets',
              component: () => import('@/views/panel/WidgetsPage.vue'),
            },
          ],
        },
        {
          path: 'functions',
          name: 'functions',
          component: () => import('@/views/functions/FunctionsWrapper.vue'),
        },
        {
          path: 'settings',
          name: 'settings',
          component: () => import('@/views/settings/SettingsWrapper.vue'),
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
