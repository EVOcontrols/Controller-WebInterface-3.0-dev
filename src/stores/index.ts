import type { ControllerDateTime, Lang, Toast, UserRole } from '@/typings/common';
import type { TempUnit } from '@/typings/common';

export const useIndexStore = defineStore('indexStore', () => {
  const authToken = useStorage<string>('authToken', '');

  const userRole = useStorage<'user' | 'admin'>('userRole', 'user', undefined, {
    mergeDefaults: (val: any) => (val === 'user' || val === 'admin' ? val : 'user'),
  });

  const isAuth = ref(!!authToken.value && !!userRole.value);

  const lang = ref<Lang>('en');

  const newToast = ref<Toast | undefined>();

  const toastIdForDeleting = ref<number | undefined>();

  const notConnected = ref(false);

  const controllerDateTime = shallowRef<ControllerDateTime | undefined>();

  const tempUnit = ref<TempUnit>('°C');

  function setIsAuth(cred: { token: string; role: UserRole } | undefined) {
    isAuth.value = !!cred;
    authToken.value = cred?.token || '';
    userRole.value = cred?.role || 'user';
  }

  function setLang(value: Lang) {
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

  function setTempUnit(unit: TempUnit) {
    tempUnit.value = unit;
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
    tempUnit,
    setIsAuth,
    setLang,
    addNewToast,
    deleteToast,
    setIsNotConnected,
    setControllerDateTime,
    setTempUnit,
  };
});
