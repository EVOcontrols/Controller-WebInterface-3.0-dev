import type { ControllerDateTime, Lang, Toast, UserRole } from '@/typings/common';
import type { TempUnit, NumberingSystem } from '@/typings/common';

export const useIndexStore = defineStore('indexStore', () => {
  const authToken = useStorage<string>('authToken', '');

  const userRole = useStorage<'user' | 'admin'>('userRole', 'user', undefined, {
    mergeDefaults: (val: any) => (val === 'user' || val === 'admin' ? val : 'user'),
  });

  const isAuth = ref(!!authToken.value && !!userRole.value);

  const lang = useStorage<Lang>(
    'lang',
    /ru-ru/i.test(navigator.language) ? 'ru' : 'en',
    undefined,
    {
      mergeDefaults: (val: any) => (val === 'ru' || val === 'en' ? val : 'en'),
    },
  );

  const newToast = ref<Toast | undefined>();

  const toastIdForDeleting = ref<number | undefined>();

  const notConnected = ref(false);

  const controllerDateTime = shallowRef<ControllerDateTime | undefined>();

  const tempUnit = ref<TempUnit>('°C');

  const numberingSystem = ref<NumberingSystem>('dec');

  const isControllerRebooting = ref(false);

  const isInterfaceStarted = ref(false);

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

  function setNumberingSystem(system: NumberingSystem) {
    numberingSystem.value = system;
  }

  function setIsControllerRebooting(value: boolean) {
    isControllerRebooting.value = value;
  }

  function setIsInterfaceStarted(value: boolean) {
    isInterfaceStarted.value = value;
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
    numberingSystem,
    isControllerRebooting,
    isInterfaceStarted,
    setIsAuth,
    setLang,
    addNewToast,
    deleteToast,
    setIsNotConnected,
    setControllerDateTime,
    setTempUnit,
    setIsControllerRebooting,
    setIsInterfaceStarted,
    setNumberingSystem,
  };
});
