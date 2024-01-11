import type { ControllerDateTime, DeviceAddr, Lang, Toast, UserRole } from '@/typings/common';
import type { TempUnit, NumberingSystem } from '@/typings/common';
import type { ControllerSettings, ExtDevsList, ExtDevsListRaw } from '@/typings/settings';

export interface Device {
    addr: number;
    type: string;
    interf: [
        | { interf: '1w-gpio'; bus: number }
        | { interf: '1w-rom'; bus: number }
        | { interf: '1w-sens'; bus: number }
        | '1w-gpio'
        | '1w-rom'
        | '1w-sens'
        | 'adc-in'
        | 'bin-in'
        | 'bin-out'
        | 'bin-var'
        | 'int-var'
        | 'mb-var'
        | { interf: 'mb-var'; bus: number }
        | 'pwm-out'
        | 'tim-var',
    ];
    state: 'on' | 'off' | 'init' | 'no-conn' | 'error';
    serial: string;
    version: string;
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
    bus?: number;
}

export interface InterfVal {
    type: string;
    device: number;
    index: number;
    value: number[] | [number | null][];
    bus?: number;
}

export const useIndexStore = defineStore('indexStore', () => {
    const timeout = ref(500);

    const OWIds = ref<string[][][]>([]);

    const devices = ref<Device[]>([]);

    const sortedDevices = ref<Device[]>([]);

    const sortedChosenDevices = ref<number[]>([]);

    const interfaces = ref<Interf[]>([
        { value: '1w-rom', label: { ru: '1-wire ID', en: '1-wire ID' } },
        { value: '1w-sens', label: { ru: '1-wire термометры', en: '1-wire Thermometers' } },
        { value: 'bin-in', label: { ru: 'Дискретные входы', en: 'Discrete inputs' } },
        { value: 'adc-in', label: { ru: 'Аналоговые входы', en: 'Analog inputs' } },
        { value: 'bin-out', label: { ru: 'Дискретные выходы', en: 'Discrete outputs' } },
        { value: 'pwm-out', label: { ru: 'ШИМ-выходы', en: 'PWM outputs' } },
        { value: 'mb-var', label: { ru: 'Переменные MODBUS', en: 'MODBUS variables' } },
        { value: 'bin-var', label: { ru: 'Бинарные переменные', en: 'Binary variables' } },
        { value: 'int-var', label: { ru: 'Целочисленные переменные', en: 'Integer variables' } },
        { value: 'tim-var', label: { ru: 'Переменные времени', en: 'Time variables' } },
    ]);

    const valuesRange = ref<{ interf: string; values: { min: number; max: number } }[]>([
        { interf: 'pwm-out', values: { min: 0, max: 100 } },
        { interf: 'int-var', values: { min: -32768, max: 32767 } },
    ]);

    const sortedChosenInterfaces = ref<string[]>([]);

    const visibleWidgets = ref<any[][]>([]);

    const devicesState = ref<InterfVal[][]>([]);

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

    const curNumberingSystem = ref<NumberingSystem>(numberingSystem.value);

    const rebootingDeviceAddr = ref<DeviceAddr>();

    const isInterfaceStarted = ref(false);

    const ngcModbusMode = ref<ControllerSettings['modbus'][number]['mode']>('off');

    const extDevsList = ref<ExtDevsList>();

    const isLongQueryRunning = ref(false);

    const chosenDevices = ref<number[]>([]);

    const chosenInterfaces = ref<string[]>([]);

    const extDeviceInInitState = computed(
        () => extDevsList.value?.find((d) => d.state === 'init')?.addr,
    );

    const api = ref();

    const isPriorWOpen = ref(false);

    const calibrVals = ref<[null | number][]>([]);

    const choosenMbDevices = ref<number[][]>([]);

    function getApi() {
        if (!api.value) {
            api.value = useApi();
        }
        return api.value;
    }

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

    function setCurNumberingSystem(system: NumberingSystem) {
        curNumberingSystem.value = system;
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
        devices.value = [...devices.value, device];
        setSortedDevices();
        setSortedChosenInterfaces();
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
        setSortedDevices();
    }

    function toggleChooseAllDevices(isAllDevicesChoosen?: Ref<boolean>, isFirstOpen?: boolean) {
        if ((!isAllDevicesChoosen || !isAllDevicesChoosen.value) && !isFirstOpen) {
            chosenDevices.value = [];
        } else {
            const arr: number[] = [];
            devices.value.forEach((d) => {
                arr.push(d.addr);
            });
            chosenDevices.value = arr;
        }
        setSortedDevices();
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
        setSortedChosenInterfaces();
    }

    function toggleChooseAllInterfaces(
        isAllInterfacesChoosen?: Ref<boolean>,
        isFirstOpen?: boolean,
    ) {
        if ((!isAllInterfacesChoosen || !isAllInterfacesChoosen.value) && !isFirstOpen) {
            chosenInterfaces.value = [];
        } else {
            const values: string[] = [];
            interfaces.value.forEach((val) => {
                values.push(val.value);
            });
            chosenInterfaces.value = [...values];
        }
        setSortedChosenInterfaces();
    }

    function setDevicesState(device: number, interfVal: InterfVal[]) {
        if (devicesState.value.length === 0 || devicesState.value.length - 1 < device) {
            if (device !== 0) {
                const arr = [...devicesState.value];
                for (let i = devicesState.value.length; i < device; i += 1) {
                    arr.push([]);
                }
                arr.push([...interfVal]);
                devicesState.value = [...arr];
            } else {
                devicesState.value = [[...interfVal]];
            }
        } else {
            interfVal.forEach((i) => {
                const index = devicesState.value[device].findIndex((obj) => obj.type === i.type);
                if (index === -1) {
                    devicesState.value[device].push(i);
                } else {
                    const prevDeviceState = [...devicesState.value];
                    prevDeviceState[device][index] = i;
                    devicesState.value = [...prevDeviceState];
                }
            });
        }
    }

    function setSortedChosenInterfaces() {
        sortedChosenInterfaces.value = [...chosenInterfaces.value].sort((i1, i2) => {
            const index1 = interfaces.value.findIndex((i) => i.value === i1);
            const index2 = interfaces.value.findIndex((i) => i.value === i2);
            return index1 - index2;
        });
    }

    function setSortedDevices() {
        sortedDevices.value = devices.value.sort((d1, d2) => {
            return d1.addr - d2.addr;
        });
        setSortedChosenDevices();
    }

    function setSortedChosenDevices() {
        sortedChosenDevices.value = [...chosenDevices.value].sort((d1, d2) => {
            const index1 = sortedDevices.value.findIndex((dev) => dev.addr === d1);
            const index2 = sortedDevices.value.findIndex((dev) => dev.addr === d2);
            return index1 - index2;
        });
    }

    function setVisibleWidgets(entities: { w: { d: number; i: string } }[]) {
        const newArr: any[][] = [];
        for (let i = 0; i < visibleWidgets.value.length; i += 1) {
            newArr.push([]);
        }
        entities.forEach((ent) => {
            if (!newArr[ent.w.d]) {
                newArr[ent.w.d] = [ent];
            } else {
                newArr[ent.w.d].push(ent);
            }
        });
        visibleWidgets.value = newArr;
    }

    function setOWIds(d: number, bus: number, ids: string[]) {
        if (!OWIds.value[d]) {
            const arr = [...OWIds.value];
            for (let i = OWIds.value.length; i < d; i += 1) {
                arr.push([]);
            }
            const busArr = [];
            for (let i = 0; i < bus; i += 1) {
                busArr.push([]);
            }
            busArr.push(ids);
            arr.push(busArr);
            OWIds.value = [...arr];
        } else {
            if (OWIds.value[d].length - 1 < bus) {
                const busArr = [];
                for (let i = OWIds.value[d].length; i < bus; i += 1) {
                    busArr.push([]);
                }
                busArr.push(ids);
                const arr = [...OWIds.value];
                arr[d] = busArr;
                OWIds.value = [...arr];
            } else {
                const arr = [...OWIds.value];
                arr[d][bus] = ids;
                OWIds.value = [...arr];
            }
        }
    }

    function changeIsPriorWOpen(isStart?: boolean) {
        isPriorWOpen.value = !!isStart;
    }

    function setCalibrVals(arrMin: [number | null], arrMax: [number | null]) {
        calibrVals.value = [arrMin, arrMax];
    }

    function changeDeviceState(addr: number, state: 'on' | 'off' | 'error' | 'init' | 'no-conn') {
        const prevDevices = [...devices.value];
        const index = prevDevices.findIndex((el) => el.addr === addr);
        if (index !== -1) {
            const prevEl: Device = Object.assign(prevDevices[index]);
            prevEl.state = state;
            prevDevices[index] = prevEl;
            devices.value = [...prevDevices];
        }
    }

    function setChoosenMbDevices(d: number, vals: number[]) {
        if (!choosenMbDevices.value[d]) {
            const arr = [...choosenMbDevices.value];
            for (let i = choosenMbDevices.value.length; i < d; i += 1) {
                arr.push([]);
            }
            arr.push(vals);
            choosenMbDevices.value = [...arr];
        } else {
            const arr = [...choosenMbDevices.value];
            arr[d] = vals;
            choosenMbDevices.value = [...arr];
        }
    }

    return {
        api,
        OWIds,
        timeout,
        devices,
        sortedDevices,
        sortedChosenDevices,
        interfaces,
        valuesRange,
        sortedChosenInterfaces,
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
        curNumberingSystem,
        rebootingDeviceAddr,
        isInterfaceStarted,
        ngcModbusMode,
        extDevsList,
        extDeviceInInitState,
        isLongQueryRunning,
        chosenDevices,
        chosenInterfaces,
        isPriorWOpen,
        calibrVals,
        choosenMbDevices,
        getApi,
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
        setCurNumberingSystem,
        setNGCModbusMode,
        setExtDevsList,
        setLongQueryRunning,
        toggleDevice,
        toggleChooseAllDevices,
        toggleInterface,
        toggleChooseAllInterfaces,
        setDevicesState,
        setSortedDevices,
        setSortedChosenDevices,
        setVisibleWidgets,
        setSortedChosenInterfaces,
        setOWIds,
        changeIsPriorWOpen,
        setCalibrVals,
        changeDeviceState,
        setChoosenMbDevices,
    };
});
