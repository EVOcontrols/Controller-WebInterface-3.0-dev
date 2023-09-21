import type { ControllerDateTime, Toast } from '@/typings/common';

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

  const controllerDateTime = shallowRef<ControllerDateTime | undefined>();

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

  function setControllerDateTime(dateTime: ControllerDateTime) {
    controllerDateTime.value = dateTime;
  }

  return {
    isAuth,
    authToken,
    userRole,
    lang,
    newToast,
    toastIdForDeleting,
    notConnected,
    controllerDateTime,
    setIsAuth,
    setLang,
    addNewToast,
    deleteToast,
    setIsNotConnected,
    setControllerDateTime,
  };
});
