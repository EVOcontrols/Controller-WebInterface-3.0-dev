import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';
import { createI18n } from 'vue-i18n';

const app = createApp(App);

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

app.mount('#app');
