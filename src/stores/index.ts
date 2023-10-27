import type { ControllerDateTime, DeviceAddr, Lang, Toast, UserRole } from '@/typings/common';
import type { TempUnit, NumberingSystem } from '@/typings/common';
import type { ExtDevsList, ExtDevsListRaw } from '@/typings/settings';

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

  const rebootingDeviceAddr = ref<DeviceAddr>();

  const isInterfaceStarted = ref(false);

  const extDevsList = ref<ExtDevsList>();

  const extDeviceInInitState = computed(
    () => extDevsList.value?.find((d) => d.state === 'init')?.addr,
  );

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

  function setRebootingDeviceAddr(value: DeviceAddr | undefined) {
    rebootingDeviceAddr.value = value;
  }

  function setIsInterfaceStarted(value: boolean) {
    isInterfaceStarted.value = value;
  }

  function setExtDevsList(list: ExtDevsListRaw) {
    extDevsList.value = list
      .map((d, i) => ({ ...d, index: i + 1 }))
      .filter((d): d is ExtDevsList[number] => d.type !== 'none');
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
    rebootingDeviceAddr,
    isInterfaceStarted,
    extDevsList,
    extDeviceInInitState,
    setIsAuth,
    setLang,
    addNewToast,
    deleteToast,
    setIsNotConnected,
    setControllerDateTime,
    setTempUnit,
    setRebootingDeviceAddr,
    setIsInterfaceStarted,
    setNumberingSystem,
    setExtDevsList,
  };
});
