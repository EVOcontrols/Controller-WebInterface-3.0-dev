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
    state: number[] | null[] | [number | null][];
    bus?: number;
}

export const useIndexStore = defineStore('indexStore', () => {
    const timeout = ref(500);
    const labels = ref<
        | [
              | {
                    interf: string;
                    val: [string[] | []];
                }[]
              | null,
          ]
        | []
    >([]);

    // const ip = ref<string>(window.location.host || '192.168.0.30');
    // const ip = ref<string>(window.location.host || '192.168.10.51');
    const ip = ref<string>('192.168.0.30');
    // const ip = ref<string>('10.8.0.1:49163');
    // const ip = ref<string>('65.21.176.66:49163');

    const mbDevs = ref<number[][][]>([]);

    const mbDevsLabels = ref<string[][][]>([]);

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
        { interf: 'tim-varms', values: { min: 0, max: 15000 } },
        { interf: 'tim-vars', values: { min: 0, max: 15000 } },
        { interf: 'tim-varmin', values: { min: 0, max: 250 } },
    ]);

    const valuesConstRange = ref<{ interf: string; values: { min: number; max: number } }[]>([
        { interf: 'tim-constms', values: { min: 0, max: 15000 } },
        { interf: 'tim-consts', values: { min: 0, max: 15000 } },
        { interf: 'tim-constmin', values: { min: 0, max: 250 } },
    ]);

    const sortedChosenInterfaces = ref<string[]>([]);

    const visibleWidgets = ref<
        {
            w: {
                d: number;
                i: string;
                bus?: number;
            };
        }[][]
    >([]);

    const devicesState = ref<InterfVal[][]>([]);

    const authToken = useStorage<string>('authToken', '');

    const userRole = useStorage<'user' | 'admin'>('userRole', 'user', undefined, {
        mergeDefaults: (val: any) => (val === 'user' || val === 'admin' ? val : 'user'),
    });

    //TODO
    const isAuth = ref(true);
    // const isAuth = ref(!!authToken.value && !!userRole.value);

    const lang = useStorage<Lang>('lang', /ru-ru/i.test(navigator.language) ? 'ru' : 'en', undefined, {
        mergeDefaults: (val: any) => (val === 'ru' || val === 'en' ? val : 'en'),
    });

    const newToast = ref<Toast | undefined>();

    const toastIdForDeleting = ref<number | undefined>();

    const notConnected = ref(false);

    const controllerDateTime = shallowRef<ControllerDateTime | undefined>();

    const tempUnit = ref<TempUnit>('°C');

    const numberingSystem = ref<NumberingSystem>('dec');

    const curNumberingSystem = ref<NumberingSystem>(numberingSystem.value);

    const rebootingDeviceAddr = ref<DeviceAddr>();

    const isInterfaceStarted = ref(false);

    const ngcModbusMode = ref<ControllerSettings['rs-485'][number]['mode']>('off');

    const extDevsList = ref<ExtDevsList>();

    const isLongQueryRunning = ref(false);

    const chosenDevices = ref<number[]>([]);

    const chosenInterfaces = ref<string[]>([]);

    const extDeviceInInitState = computed(() => extDevsList.value?.find((d) => d.state === 'init')?.addr);

    const api = ref();

    const isPriorWOpen = ref(false);

    const calibrVals = ref<[null | number][]>([]);

    const choosenMbDevices = ref<number[][]>([]);

    const isMbInit = ref(false);

    const isEditPopUpShown = ref(false);

    const needToReqData = ref(false);

    const isRebootRequired = ref(false);

    const needToRequestMainData = ref(false);

    const isAddingDev = ref(false);

    const devCapabs = ref<
        ({
            '1w-gpio': number;
            '1w-rom': number;
            '1w-sens': number;
            'adc-in': number;
            'bin-in': number;
            'bin-out': number;
            'bin-var': number;
            'int-var': number;
            'mb-var': number;
            'pwm-out': number;
            'tim-var': number;
            'udf-act': number;
            'udf-cond': number;
            'udf-trans': number;
            'udf-trig': number;
        } | null)[]
    >([]);

    function setNeedToReqData(res: boolean) {
        needToReqData.value = res;
    }

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

    function setNGCModbusMode(mode: ControllerSettings['rs-485'][number]['mode']) {
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
        const newArr = [...devices.value];
        const prevEl = newArr[newArr.length - 1];
        for (let i = newArr.length; i < device.addr; i++) {
            newArr.push(prevEl);
        }
        newArr.push(device);
        devices.value = newArr;
        setSortedDevices();
        setSortedChosenInterfaces();
    }

    function removeOWInterf(device: number, bus: number) {
        const newArr = [...devices.value];
        const newInterf = newArr[device].interf.filter((el) => typeof el === 'string' || el.bus !== bus);
        newArr[device].interf = newInterf as [
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
        devices.value = newArr;
        if (visibleWidgets.value.length) {
            const newWidgets = [...visibleWidgets.value];
            newWidgets[device] = newWidgets[device].filter(
                (el) => !el.w.i.includes('1w') || (el.w.i.includes('1w') && el.w.bus !== bus),
            );
            visibleWidgets.value = [...newWidgets];
        }
        if (devicesState.value.length) {
            const newState = [...devicesState.value];
            newState[device] = newState[device].filter(
                (el) => !el.type.includes('1w') || (el.type.includes('1w') && el.bus !== bus),
            );
            devicesState.value = [...newState];
        }
    }

    function removeMbInterf(device: number) {
        const newArr = [...devices.value];
        const newInterf = newArr[device]?.interf.filter((el) => typeof el === 'string' || el.bus !== 0);
        if (newInterf) {
            newArr[device].interf = newInterf as [
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
            devices.value = newArr;
            if (visibleWidgets.value.length) {
                const newWidgets = [...visibleWidgets.value];
                newWidgets[device] = newWidgets[device].filter((el) => el.w.i !== 'mb-var');
                visibleWidgets.value = [...newWidgets];
            }
            if (devicesState.value.length) {
                const newState = [...devicesState.value];
                newState[device] = newState[device].filter((el) => el.type !== 'mb-var');
                devicesState.value = [...newState];
            }
        }
    }

    function setDevicesToInitState() {
        devices.value = [];
        chosenDevices.value = [];
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
            chosenDevices.value = [...new Set(arr)];
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

    function toggleChooseAllInterfaces(isAllInterfacesChoosen?: Ref<boolean>, isFirstOpen?: boolean) {
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
                let index = -1;
                if (i.bus !== undefined) {
                    index = devicesState.value[device].findIndex((obj) => {
                        return obj.type === i.type && obj.bus === i.bus;
                    });
                } else {
                    index = devicesState.value[device].findIndex((obj) => obj.type === i.type);
                }
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

    function setDevicesStateToInitState() {
        devicesState.value = [];
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
        const newArr: {
            w: {
                d: number;
                i: string;
            };
        }[][] = [];
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
            if (!OWIds.value[d][bus]) {
                const busArr = OWIds.value[d];
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

    function setOWIdsToInitState() {
        OWIds.value = [];
    }

    function changeIsPriorWOpen(isStart?: boolean) {
        isPriorWOpen.value = !!isStart;
    }

    function setCalibrVals(arrMin: [number | null], arrMax: [number | null]) {
        calibrVals.value = [arrMin, arrMax];
    }

    function setCalibrValsToInitState() {
        calibrVals.value = [];
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

    function setLabels(
        d: number,
        interf:
            | '1w-rom'
            | '1w-sens'
            | 'bin-in'
            | 'adc-in'
            | 'bin-out'
            | 'pwm-out'
            | 'mb-var'
            | 'bin-var'
            | 'int-var'
            | 'tim-var',
        labelsArr: string[] | null,
        bus?: number,
    ) {
        const newArr = [...labels.value];
        const arr = [];
        for (let i = 0; i < labelsFileLength; i++) {
            arr.push('');
        }
        if (!newArr.length || !newArr[d]) {
            if (d) {
                for (let i = newArr.length; i < d; i++) {
                    newArr.push(null);
                }
            }
            const val = [];
            if (bus) {
                for (let i = 0; i < bus; i++) {
                    val.push([]);
                }
            }
            const labelsVal = [];
            labelsVal.push(...(labelsArr?.length ? labelsArr : arr));
            val.push(labelsVal);
            const obj = { interf: interf as string, val: val as [[] | string[]] };
            if (!newArr.length) {
                newArr.push([obj]);
            } else {
                newArr[d] = [obj];
            }
        } else {
            const interfObj = newArr[d]?.find((el) => el.interf === interf);
            if (interfObj) {
                const val = [...interfObj.val];
                if (bus && val.length < bus) {
                    for (let i = val.length; i < bus; i++) {
                        val.push([]);
                    }
                }
                const labelsVal = bus ? val[bus] : val[0];
                val[bus || 0] = labelsVal;
                interfObj.val = val as [string[] | []];
            } else {
                const val = [];
                if (bus) {
                    for (let i = 0; i < bus; i++) {
                        val.push([]);
                    }
                }
                const labelsVal = [];
                labelsVal.push(...(labelsArr ? labelsArr : arr));
                val.push(labelsVal);
                const obj = { interf: interf as string, val: val as [[] | string[]] };
                newArr[d] ? newArr[d]?.push(obj) : (newArr[d] = [obj]);
            }
        }
        labels.value = [...newArr] as [
            | {
                  interf: string;
                  val: [string[] | []];
              }[]
            | null,
        ];
    }

    function changeLabel(
        d: number,
        interf:
            | '1w-rom'
            | '1w-sens'
            | 'bin-in'
            | 'adc-in'
            | 'bin-out'
            | 'pwm-out'
            | 'mb-var'
            | 'bin-var'
            | 'int-var'
            | 'tim-var',
        labelsArr: string[],
        bus?: number,
    ) {
        const newArr = [...labels.value];
        const interfObj = newArr[d]?.find((el) => el.interf === interf);
        if (!interfObj) {
            setMbDevsLabels(d, bus || 0, labelsArr);
            return;
        }
        const val = [...interfObj.val];
        val[bus || 0] = labelsArr;
        interfObj.val = val as [string[] | []];
        labels.value = [...newArr] as [
            | {
                  interf: string;
                  val: [string[] | []];
              }[]
            | null,
        ];
    }

    function setMbDevs(d: number, bus: number, devs: number[]) {
        const prevDevs = [...mbDevs.value];
        if (d) {
            if (prevDevs.length < d) {
                for (let i = prevDevs.length; i < d; i++) {
                    prevDevs.push([]);
                }
                const val = [];
                if (bus) {
                    for (let i = 0; i < bus; i++) {
                        val.push([]);
                    }
                }
                val.push(devs);
                prevDevs.push(val);
            } else {
                const val = [];
                if (prevDevs[d] && prevDevs[d].length < bus) {
                    for (let i = prevDevs[d].length; i < bus; i++) {
                        val.push([]);
                    }
                    val.push(devs);
                    prevDevs[d] = val;
                } else {
                    if (!prevDevs[d]) prevDevs[d] = [];
                    prevDevs[d][bus] = devs;
                }
            }
        } else {
            if (prevDevs.length) {
                const val = prevDevs[d];
                if (prevDevs[d].length < bus) {
                    for (let i = prevDevs[d].length; i < bus; i++) {
                        val.push([]);
                    }

                    val.push(devs);
                    prevDevs[d] = val;
                } else {
                    prevDevs[d][bus] = devs;
                }
            } else {
                const val = [];
                if (bus) {
                    for (let i = 0; i < bus; i++) {
                        val.push([]);
                    }
                }
                val.push(devs);
                prevDevs.push(val);
            }
        }
        mbDevs.value = prevDevs;
    }
    function setMbDevsToInitState() {
        mbDevs.value = [];
    }

    function setMbDevsLabels(d: number, bus: number = 0, labelsArr: string[]) {
        const newArr = [...mbDevsLabels.value];
        if (!newArr.length || !newArr[d]) {
            if (d) {
                for (let i = newArr.length; i < d; i++) {
                    newArr.push([]);
                }
            }
            const val = [];
            if (bus) {
                for (let i = 0; i < bus; i++) {
                    val.push([]);
                }
            }
            const labelsVal = [];
            labelsVal.push(...labelsArr);
            val.push(labelsVal);
            newArr.push(val);
        } else {
            const val = [...newArr[d]];
            val[bus || 0] = [...labelsArr];
            newArr[d] = val;
        }
        mbDevsLabels.value = [...newArr];
    }

    function toggleIsMbInit(res: boolean) {
        isMbInit.value = res;
    }

    function toggleIsEditPopUpShown(res: boolean) {
        isEditPopUpShown.value = res;
    }

    function setIsRebootRequired(res: boolean) {
        isRebootRequired.value = res;
    }

    function setNeedToRequestMainData(res: boolean) {
        needToRequestMainData.value = res;
    }

    function setIsAddingDev(res: boolean) {
        isAddingDev.value = res;
    }

    function setDevCapabs(
        d: number,
        capabs: {
            '1w-gpio': number;
            '1w-rom': number;
            '1w-sens': number;
            'adc-in': number;
            'bin-in': number;
            'bin-out': number;
            'bin-var': number;
            'int-var': number;
            'mb-var': number;
            'pwm-out': number;
            'tim-var': number;
            'udf-act': number;
            'udf-cond': number;
            'udf-trans': number;
            'udf-trig': number;
        },
    ) {
        const newArr = [...devCapabs.value];
        if (!newArr.length || !newArr[d]) {
            if (d) {
                for (let i = newArr.length; i < d; i++) {
                    newArr.push(null);
                }
            }
            newArr.push({ ...capabs });
        } else {
            newArr[d] = { ...capabs };
        }
        devCapabs.value = [...newArr];
    }

    return {
        ip,
        api,
        labels,
        mbDevs,
        mbDevsLabels,
        OWIds,
        timeout,
        devices,
        sortedDevices,
        sortedChosenDevices,
        interfaces,
        valuesRange,
        valuesConstRange,
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
        isMbInit,
        isEditPopUpShown,
        needToReqData,
        isRebootRequired,
        needToRequestMainData,
        isAddingDev,
        devCapabs,
        setNeedToReqData,
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
        setLabels,
        changeLabel,
        setMbDevs,
        setMbDevsLabels,
        toggleIsMbInit,
        toggleIsEditPopUpShown,
        setDevicesToInitState,
        setDevicesStateToInitState,
        setOWIdsToInitState,
        setCalibrValsToInitState,
        setMbDevsToInitState,
        setIsRebootRequired,
        setNeedToRequestMainData,
        removeOWInterf,
        removeMbInterf,
        setIsAddingDev,
        setDevCapabs,
    };
});
