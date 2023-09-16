import type { Toast } from '@/typings/common';

export const useIndexStore = defineStore('indexStore', () => {
  const isAuth = ref(false);

  const lang = useStorage<'en' | 'ru'>('lang', 'en');

  const newToast = ref<Toast | undefined>();

  const toastIdForDeleting = ref<number | undefined>();

  const isNc = ref(false);

  function setIsAuth(value: boolean) {
    isAuth.value = value;
  }

  function setLang(value: 'en' | 'ru') {
    lang.value = value;
  }

  function addNewToast(toast: Toast) {
    newToast.value = toast;
  }

  function deleteToast(id: number) {
    toastIdForDeleting.value = id;
  }

  function setIsNc(value: boolean) {
    isNc.value = value;
  }

  return {
    isAuth,
    lang,
    newToast,
    toastIdForDeleting,
    isNc,
    setIsAuth,
    setLang,
    addNewToast,
    deleteToast,
    setIsNc,
  };
});
