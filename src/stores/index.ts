import type { Toast } from '@/typings/common';

export const useIndexStore = defineStore('indexStore', () => {
  const authToken = useStorage<string>('authToken', '');

  const userRole = useStorage<'user' | 'admin' | undefined>('userRole', undefined, undefined, {
    mergeDefaults: (val: any) => (val === 'user' || val === 'admin' ? val : undefined),
  });

  const isAuth = ref(!!authToken.value && !!userRole.value);

  const lang = useStorage<'en' | 'ru'>('lang', 'en');

  const newToast = ref<Toast | undefined>();

  const toastIdForDeleting = ref<number | undefined>();

  const notConnected = ref(false);

  function setIsAuth(cred: { token: string; role: 'user' | 'admin' } | undefined) {
    isAuth.value = !!cred;
    authToken.value = cred?.token || '';
    userRole.value = cred?.role || 'user';
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

  function setIsNotConnected(isNotConnected: boolean) {
    notConnected.value = isNotConnected;
  }

  return {
    isAuth,
    authToken,
    userRole,
    lang,
    newToast,
    toastIdForDeleting,
    notConnected,
    setIsAuth,
    setLang,
    addNewToast,
    deleteToast,
    setIsNotConnected,
  };
});
