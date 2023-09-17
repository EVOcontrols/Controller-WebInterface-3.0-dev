<template>
  <div class="w-full h-full overflow-hidden flex flex-col bg-[#10375A]">
    <router-view v-slot="{ Component }">
      <transition
        name="fade-300"
        mode="out-in"
      >
        <component :is="Component" />
      </transition>
    </router-view>
    <ToastsContainer />
    <Transition
      mode="out-in"
      name="fade-300"
    >
      <div
        v-if="notConnected && route.name !== 'login'"
        class="fixed top-0 bottom-0 left-0 right-0 z-[100] bg-[#001d34b2]"
      ></div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import '@/assets/main.postcss';
import ToastsContainer from './components/toast/ToastsContainer.vue';

const indexStore = useIndexStore();

const { lang, notConnected } = storeToRefs(indexStore);

const route = useRoute();

const { locale } = useI18n();

const { toast } = useToast();

let notConnectedToastId: number | undefined;

watch(
  lang,
  () => {
    const currentLang = lang.value === 'ru' ? 'ru' : 'en';
    locale.value = currentLang;
  },
  { immediate: true },
);

watch(notConnected, () => {
  if (notConnected.value) {
    notConnectedToastId = toast.warning(
      t('msg.disconnected.header'),
      t('msg.disconnected.text'),
      0,
    );
  } else {
    if (notConnectedToastId) {
      indexStore.deleteToast(notConnectedToastId);
    }
    toast.success(
      t('msg.connected.header'),
      route.name === 'login' ? t('msg.connected.text.login') : t('msg.connected.text.other'),
    );
  }
});

useCheckControllerAccessibility();

const { t } = useI18n({
  messages: {
    en: {
      msg: {
        disconnected: { header: 'The device offline', text: 'Check connection' },
        connected: {
          header: 'The device online',
          text: { login: 'Please try to log in again', other: 'Continue working with NG' },
        },
      },
    },
    ru: {
      msg: {
        disconnected: { header: 'Соединение отсутствует', text: 'Проверьте подключение' },
        connected: {
          header: 'Соединение восстановлено',
          text: { login: 'Повторите авторизацию', other: 'Продолжайте работать с NG' },
        },
      },
    },
  },
});
</script>
