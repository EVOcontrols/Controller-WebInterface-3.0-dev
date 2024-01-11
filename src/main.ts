import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';
import { createI18n } from 'vue-i18n';
import VueDragscroll from 'vue-dragscroll';

const app = createApp(App);

app.directive('focus', {
    updated(el, val) {
        if (val.value[0]) {
            const elem = el as HTMLElement;
            const wrapper = elem.closest('.scrollWrapper') as HTMLElement;
            const element = elem.closest('.scrollEl') as HTMLElement;
            if (!element || !wrapper) return;
            wrapper.scrollTo({
                top: val.value[1] * 46 + (val.value[1] - 1) * 10,
                behavior: 'smooth',
            });
            el.focus();
        }
    },
});

const i18n = createI18n({
    legacy: false,
    availableLocales: langs,
    missingWarn: false,
    fallbackWarn: false,
    messages: commonMessages,
});

app.use(createPinia());
app.use(router);
app.use(i18n);
app.use(VueDragscroll);

app.mount('#app');
