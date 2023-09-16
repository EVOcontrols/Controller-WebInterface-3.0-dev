<template>
  <div
    class="flex h-full w-full flex-col bg-[linear-gradient(108.08deg,#143554_-1.91%,#0a1b2b_98.91%)]"
  >
    <div
      class="group flex flex-1 flex-col items-center justify-center"
      :class="{ error: isError }"
    >
      <div class="flex flex-row">
        <span
          v-html="logo"
          class="mr-4"
        ></span>
        <span v-html="brand"></span>
      </div>
      <div class="my-6 text-base leading-[1.188] text-[#77b2d2]">
        {{ t('title') }}
      </div>
      <form
        @submit.prevent
        autocomplete="off"
      >
        <div
          v-for="inputType in ['login', 'password'] as const"
          :key="inputType"
          class="relative first:mb-3"
        >
          <LoginInput
            class="w-72"
            :inputType="inputType"
            :isPasswordVisible="isPasswordVisible"
            :isDisabled="isDisabled"
            :isError="isFieldError[inputType]"
            :placeholder="t(`placeholder.${inputType}`)"
            :setFocusTrigger="inputType === 'password' ? setFocusTrigger : 0"
            @change="credentials[inputType] = $event"
            @focus="inputType === 'password' ? (isPasswordFocus = true) : ''"
            @blur="inputType === 'password' ? (isPasswordFocus = false) : ''"
          />

          <span
            class="absolute bottom-0 right-full top-0 my-auto mr-4 h-1.5 w-1.5 scale-0 transform rounded bg-[#f83068] shadow-[0_0_0.25rem_0_#f83068] transition-transform on:scale-100"
            :class="{ on: isFieldError[inputType] }"
          ></span>
          <button
            v-if="inputType === 'password'"
            type="button"
            class="absolute bottom-0 right-3 top-0 my-auto z-[3] w-[1.125rem] h-[1.125rem]"
            @click="
              () => {
                isPasswordVisible = !isPasswordVisible;
                setFocusTrigger++;
              }
            "
          >
            <Transition
              mode="out-in"
              name="scale-y-150"
            >
              <span
                v-html="isPasswordVisible ? openEye : closedEye"
                :key="isPasswordVisible ? 'openEye' : 'closedEye'"
                class="w-[1.125rem] h-[1.125rem] block group/icon"
                :class="{ on: isPasswordFocus, error: isFieldError.password, off: isDisabled }"
              ></span>
            </Transition>
          </button>
        </div>
        <div class="w-full text-center">
          <button
            class="rounded-lg h-[2.563rem] w-[10.125rem] bg-[#2d72fa] mt-[1.125rem] font-semibold text-sm leading-[1.214] hover:bg-[#3e7df9] active:bg-[#174cb6] disabled:bg-[#0e2b45] disabled:text-[#3e688e]"
            :disabled="isDisabled || (isFieldError.login && isFieldError.password)"
          >
            {{ t('btn') }}
          </button>
        </div>
      </form>
    </div>
    <div class="flex h-[2.75rem] w-full flex-row">
      <div class="w-[6.25rem] text-end">
        <button
          v-for="(l, label) in { rus: 'ru' as 'ru', eng: 'en' as 'en' }"
          :key="l"
          class="ml-2 text-xs uppercase leading-[1.167] tracking-[0.083em] text-[#295c88] hover:text-[#2f8ee1] on:font-semibold on:text-[#45d2ff]"
          :class="{ on: locale === l }"
          @click="indexStore.setLang(l)"
        >
          {{ label }}
        </button>
      </div>
      <div class="flex-1 text-center text-xs leading-[1.167] tracking-[0.167em] text-[#295c88]">
        DESIGNED BY EVO CONTROLS
      </div>
      <div class="w-[6.25rem]"></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import brand from '@/assets/img/brand.svg?raw';
import logo from '@/assets/img/logo.svg?raw';
import openEye from '@/assets/img/open-eye.svg?raw';
import closedEye from '@/assets/img/closed-eye.svg?raw';
import LoginInput from '@/components/Ui/LoginInput.vue';

const indexStore = useIndexStore();

const isFieldError = ref({
  login: false,
  password: false,
});

const isError = computed(() => {
  return Object.values(isFieldError.value).some((v) => v);
});

const credentials = ref({
  login: '',
  password: '',
});

const setFocusTrigger = ref(0);

watch(
  () => credentials.value.login,
  () => {
    isFieldError.value.login = false;
  },
);

watch(
  () => credentials.value.password,
  () => {
    isFieldError.value.password = false;
  },
);

const isPasswordVisible = ref(false);

const isDisabled = ref(false);

const isPasswordFocus = ref(false);

const { locale } = useI18n();
const { t } = useI18n({
  messages: {
    en: {
      title: 'Your login and password',
      placeholder: {
        login: 'Login',
        password: 'Password',
      },
      btn: 'Log in',
      msg: {
        wrong: { header: 'Wrong login or password', text: 'Please try to log in again' },
        disconnected: { header: 'The device offline', text: 'Check connection' },
        connected: { header: 'The device online', text: 'Please try to log in again' },
      },
    },
    ru: {
      title: 'Ваш логин и пароль',
      placeholder: {
        login: 'Логин',
        password: 'Пароль',
      },
      btn: 'Войти',
      msg: {
        wrong: { header: 'Неправильный логин или пароль', text: 'Повторите авторизацию' },
        disconnected: { header: 'Соединение отсутствует', text: 'Проверьте подключение' },
        connected: { header: 'Соединение восстановлено', text: 'Повторите авторизацию' },
      },
    },
  },
});
</script>
