import { useIndexStore } from '@/stores';
import type { Lang } from '@/typings/common';
import { createRouter, createWebHashHistory } from 'vue-router';

declare module 'vue-router' {
    interface RouteMeta {
        title: (lang: Lang) => string;
    }
}

const router = createRouter({
    history: createWebHashHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/login',
            name: 'login',
            component: () => import('@/views/LoginPage.vue'),
            meta: {
                title: (lang) => (lang === 'en' ? 'Login' : 'Вход'),
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
                            meta: {
                                title: (lang) =>
                                    lang === 'en' ? 'Control panel' : 'Панель управления',
                            },
                        },
                    ],
                },
                {
                    path: 'presetAlgoritms',
                    name: 'presetAlgoritms',
                    component: () => import('@/views/presetAlgoritms/PresetAlgoritmsWrapper.vue'),
                },
                {
                    path: 'customAlgoritms',
                    name: 'customAlgoritms',
                    component: () => import('@/views/customAlgoritms/CustomAlgoritmsWrapper.vue'),
                },
                {
                    path: 'settings',
                    name: 'settings',
                    component: () => import('@/views/settings/SettingsWrapper.vue'),
                    redirect: { name: 'common-settings' },
                    children: [
                        {
                            path: 'common',
                            name: 'common-settings',
                            component: () => import('@/views/settings/CommonSettings.vue'),
                            meta: {
                                title: (lang) =>
                                    lang === 'en' ? 'Common settings' : 'Общие настройки',
                            },
                        },
                        {
                            path: 'devices',
                            name: 'devices-settings',
                            component: () => import('@/views/settings/DevicesSettings.vue'),
                            meta: {
                                title: (lang) =>
                                    lang === 'en' ? 'Devices settings' : 'Настройки устройств',
                            },
                        },
                    ],
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
    const indexStore = useIndexStore();
    window.document.title = `EVO controls | ${to.meta.title(indexStore.lang)}`;
    Object.assign(to.meta, { previous: from.name });
});

export default router;
