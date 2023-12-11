import type { ControllerDateTime, DeviceAddr, Lang, Toast, UserRole } from '@/typings/common';
import type { TempUnit, NumberingSystem } from '@/typings/common';
import type { ControllerSettings, ExtDevsList, ExtDevsListRaw } from '@/typings/settings';

export interface Device {
    addr: number;
    type: string;
    interf: [
        | '1w-gpio'
        | '1w-rom'
        | '1w-sens'
        | 'adc-in'
        | 'bin-in'
        | 'bin-out'
        | 'bin-var'
        | 'int-var'
        | 'mb-var'
        | 'pwm-out'
        | 'tim-var',
    ];
}

export interface Interf {
    value:
        | '1w-gpio'
        | '1w-rom'
        | '1w-sens'
        | 'adc-in'
        | 'bin-in'
        | 'bin-out'
        | 'bin-var'
        | 'int-var'
        | 'mb-var'
        | 'pwm-out'
        | 'tim-var';
    label: {
        ru: string;
        en: string;
    };
}

export interface Widget {
    d: number;
    i: string;
    deviceName: string;
    component: any;
}

export interface InterfVal {
    type: string;
    device: number;
    index: number;
    value: number[];
}

export const useIndexStore = defineStore('indexStore', () => {
    const timeout = ref(500);

    const devices = ref<Device[]>([]);

    const interfaces = ref<Interf[]>([
        // { value: 'ibtn', label: { ru: '1-wire ID', en: '1-wire ID' } },
        // { value: '1w-sens', label: { ru: 'Термометры', en: 'Thermometers' } },
        { value: 'bin-in', label: { ru: 'Дискретные входы', en: 'Discrete inputs' } },
        { value: 'adc-in', label: { ru: 'Аналоговые входы', en: 'Analog inputs' } },
        { value: 'bin-out', label: { ru: 'Дискретные выходы', en: 'Discrete outputs' } },
        { value: 'pwm-out', label: { ru: 'ШИМ-выходы', en: 'PWM outputs' } },
        // { value: 'mb-var', label: { ru: 'Переменные MODBUS', en: 'MODBUS variables' } },
        { value: 'bin-var', label: { ru: 'Бинарные переменные', en: 'Binary variables' } },
        { value: 'int-var', label: { ru: 'Целочисленные переменные', en: 'Integer variables' } },
        { value: 'tim-var', label: { ru: 'Переменные времени', en: 'Time variables' } },
    ]);

    const visibleWidgets = ref<any[]>([]);

    const devicesState = ref<
        {
            device: number;
            interfVal: InterfVal[];
        }[]
    >([]);

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

    const ngcModbusMode = ref<ControllerSettings['modbus'][number]['mode']>('off');

    const extDevsList = ref<ExtDevsList>();

    const isLongQueryRunning = ref(false);

    const chosenDevices = ref<number[]>(
        (JSON.parse(localStorage.getItem('chosenDevices')) as number[]) || [],
    );

    const chosenInterfaces = ref<string[]>(
        (JSON.parse(localStorage.getItem('chosenInterfaces')) as string[]) || [],
    );

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

    function setNGCModbusMode(mode: ControllerSettings['modbus'][number]['mode']) {
        ngcModbusMode.value = mode;
    }

    function setExtDevsList(list: ExtDevsListRaw) {
        extDevsList.value = list
            .map((d, i) => ({ ...d, index: i + 1 }))
            .filter((d): d is ExtDevsList[number] => d.type !== 'none');
    }

    function setLongQueryRunning(value: boolean) {
        isLongQueryRunning.value = value;
    }

    function setDevices(device: Device) {
        devices.value.push(device);
    }

    function toggleDevice(device: number) {
        const index = chosenDevices.value.findIndex((d) => d === device);
        let newArr;
        if (index >= 0) {
            chosenDevices.value.splice(index, 1);
            newArr = [...chosenDevices.value];
        } else {
            chosenDevices.value.push(device);
            newArr = [...chosenDevices.value];
        }
        chosenDevices.value = [...newArr];
        localStorage.setItem('chosenDevices', JSON.stringify(chosenDevices.value));
    }

    function toggleChooseAllDevices(isAllDevicesChoosen?: Ref<boolean>) {
        if (!isAllDevicesChoosen || !isAllDevicesChoosen.value) {
            chosenDevices.value = [];
        } else {
            const arr: number[] = [];
            devices.value.forEach((d) => {
                arr.push(d.addr);
            });
            chosenDevices.value = arr;
        }
        localStorage.setItem('chosenDevices', JSON.stringify(chosenDevices.value));
    }

    function toggleInterface(interf: string) {
        const index = chosenInterfaces.value.findIndex((i) => i === interf);
        let newArr;
        if (index >= 0) {
            chosenInterfaces.value.splice(index, 1);
            newArr = [...chosenInterfaces.value];
        } else {
            chosenInterfaces.value.push(interf);
            newArr = [...chosenInterfaces.value];
        }
        chosenInterfaces.value = [...newArr];
        localStorage.setItem('chosenInterfaces', JSON.stringify(chosenInterfaces.value));
    }

    function toggleChooseAllInterfaces(isAllInterfacesChoosen?: Ref<boolean>) {
        if (!isAllInterfacesChoosen || !isAllInterfacesChoosen.value) {
            chosenInterfaces.value = [];
        } else {
            const values: string[] = [];
            interfaces.value.forEach((val) => {
                values.push(val.value);
            });
            chosenInterfaces.value = [...values];
        }
        localStorage.setItem('chosenInterfaces', JSON.stringify(chosenInterfaces.value));
    }

    function setDevicesState(device: number, interfVal: InterfVal[]) {
        if (
            devicesState.value.length === 0 ||
            devicesState.value.findIndex((obj) => obj.device === device) === -1
        ) {
            devicesState.value = [...devicesState.value, { device: device, interfVal: interfVal }];
        } else {
            const state = devicesState.value.find((obj) => obj.device === device);
            const devIndex = devicesState.value.findIndex((obj) => obj.device === device);
            interfVal.forEach((i) => {
                const index = state?.interfVal.findIndex((interf) => interf.type === i.type);
                if (index === -1) {
                    devicesState.value.find((obj) => obj.device === device)?.interfVal.push(i);
                } else {
                    const interfIndex = devicesState.value[devIndex].interfVal.findIndex(
                        (interf) => interf.type === i.type,
                    );
                    const prevDeviceState = [...devicesState.value];
                    prevDeviceState[devIndex].interfVal[interfIndex].value = i.value;
                    devicesState.value = [...prevDeviceState];
                }
            });
        }
    }

    function getSortedDevices() {
        return devices.value.sort((d1, d2) => {
            return d1.addr - d2.addr;
        });
    }

    function getSortedChosenDevices() {
        const sortedDevices = getSortedDevices();
        return [...chosenDevices.value].sort((d1, d2) => {
            const index1 = sortedDevices.findIndex((dev) => dev.addr === d1);
            const index2 = sortedDevices.findIndex((dev) => dev.addr === d2);
            return index1 - index2;
        });
    }

    function setVisibleWidgets(entities: any[]) {
        visibleWidgets.value = entities;
    }

    return {
        timeout,
        devices,
        interfaces,
        visibleWidgets,
        devicesState,
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
        ngcModbusMode,
        extDevsList,
        extDeviceInInitState,
        isLongQueryRunning,
        chosenDevices,
        chosenInterfaces,
        setDevices,
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
        setNGCModbusMode,
        setExtDevsList,
        setLongQueryRunning,
        toggleDevice,
        toggleChooseAllDevices,
        toggleInterface,
        toggleChooseAllInterfaces,
        setDevicesState,
        getSortedDevices,
        getSortedChosenDevices,
        setVisibleWidgets,
    };
});
