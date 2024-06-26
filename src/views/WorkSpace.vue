<template>
    <div class="w-full h-full flex flex-col overflow-hidden">
        <div class="h-[5.063rem] bg-[#092740] flex flex-row w-full items-center">
            <RouterLink
                :to="{ name: 'widgets' }"
                class="ml-10"
                ><span
                    v-html="logo"
                    class="[&>svg]:h-[1.688rem] [&>svg]:w-[1.688rem]"
                ></span
            ></RouterLink>
            <DateTimeInfo />
            <div class="flex-1 flex flex-row justify-center h-full ml-4">
                <div class="flex flex-row h-full gap-x-8 relative">
                    <RouterLink
                        v-for="item in menuItems"
                        :key="item"
                        :to="{ name: item }"
                        class="font-semibold text-[#638bae] text-[0.938rem] leading-[1.2] hover:text-[#67c4e2e0] on:!text-[#adebff] h-full flex items-center"
                        :class="{ on: activeMenuItem === item }"
                    >
                        {{ t(`menuItems.${item}`) }}
                    </RouterLink>
                    <SelectedItemLine
                        :activeItemIndex="menuItems.indexOf(activeMenuItem)"
                        :withBg="true"
                    />
                </div>
            </div>
            <div class="w-40 z-[70]">
                <LangNcSwitcher v-if="isDev" />
            </div>
            <div
                class="relative group text-[#638bae] hover:text-[#adebff] active:text-[#adebff] flex flex-row items-center mr-10 pr-2 pt-1 pb-1 font-semibold text-[0.938rem] leading-[1.2] tracking-[0.03em] cursor-pointer transition-all duration-300"
                :disabled="isDisabled"
                ref="userBlock"
                @click="showUserSubmenu"
            >
                <span
                    v-html="currentUserRole === 'admin' ? admin : user"
                    class="mr-2"
                ></span>
                {{ currentUserRole === 'admin' ? t('admin') : t('user') }}
                <transition name="fade-150">
                    <div
                        class="absolute top-full -left-[1.125rem] p-2 cursor-default bg-[#133A5A] rounded-[7px] transition-all duration-300"
                        :style="{
                            filter: 'drop-shadow(0px 0px 11px #0F2A4B)',
                            width: 'calc(100% + 18px)',
                        }"
                        @mouseenter.stop
                        v-show="isUserSubmenuVisible"
                    >
                        <a
                            href=""
                            @click.prevent="logout"
                            class="flex items-center gap-2 transition-all duration-300 text-sm text-[#ADEBFF] p-2 pb-[10px] rounded-[4px] hover:bg-[#134d7e] hover:pl-3"
                        >
                            <SignoutIcon />
                            {{ t('logout') }}
                        </a>
                    </div>
                </transition>
            </div>
        </div>
        <Transition
            name="fade-150"
            mode="out-in"
        >
            <h1
                class="font-semibold text-[#8dc5f6] text-[1.625rem] leading-[1.192] tracking-[0.02em] mt-6 mx-10"
                :key="activeMenuItem"
            >
                {{ t('menuItems.' + activeMenuItem) }}
            </h1>
        </Transition>
        <router-view v-slot="{ Component }">
            <transition
                name="fade-150"
                mode="out-in"
            >
                <component
                    :is="Component"
                    class="flex-1"
                />
            </transition>
        </router-view>
        <ModalWrapper
            v-if="extDeviceInInitIndex !== undefined"
            :is-saving="true"
            :trigger-close="extDeviceInInitState !== undefined"
            @close="extDeviceInInitIndex = undefined"
        >
            <template #custom>
                <div class="flex flex-col">
                    <span
                        v-html="gears"
                        class="self-center mb-4 [&>svg]:w-12"
                    ></span>
                    <div
                        class="text-[#9adbf6] text-sm leading-[1.167] tracking-[0.03em] whitespace-pre"
                    >
                        <div>
                            {{ t('initializing', { index: extDeviceInInitIndex }) }}
                        </div>
                    </div>
                </div>
            </template>
        </ModalWrapper>
        <ModalWrapper
            v-if="isScreenBlocked"
            :is-saving="true"
            :trigger-close="!isLongQueryRunning"
            @close="isScreenBlocked = false"
        >
            <template #custom>
                <div class="flex flex-col">
                    <span
                        v-html="spinner"
                        class="self-center mb-4 [&>svg]:w-8 [&>svg>path]:fill-[#148ef8]"
                    ></span>
                    <div
                        class="text-[#9adbf6] text-sm leading-[1.167] tracking-[0.03em] whitespace-pre"
                    >
                        <div>
                            {{ t('longQuery') }}
                        </div>
                    </div>
                </div>
            </template>
        </ModalWrapper>
    </div>
</template>

<script setup lang="ts">
import logo from '@/assets/img/logo.svg?raw';
import SignoutIcon from '@/assets/SignoutIcon.vue';
import admin from '@/assets/img/admin.svg?raw';
import user from '@/assets/img/user.svg?raw';
import DateTimeInfo from '@/components/DateTimeInfo.vue';
import SelectedItemLine from '@/components/SelectedItemLine.vue';
import LangNcSwitcher from '@/components/dev/LangNcSwitcher.vue';
import type { CommonSettingsFileType } from '@/typings/files';
import type { LabelsType, MbType } from '@/typings/files';
import type { FuncsNumberPerPage } from '@/typings/funcs';
import ModalWrapper from '@/components/ModalWrapper.vue';
import gears from '@/assets/img/gears-animated.svg?raw';
import type { ControllerSettings } from '@/typings/settings';
import spinner from '@/assets/img/spinner-inside-button.svg?raw';
import type { Device } from '@/stores';
import axios from 'axios';
import { useStoreCommonSettingsFile } from '@/composables/useStoreCommonSettingsFile';

const indexStore = useIndexStore();

const { storeCommonSettingsFile } = useStoreCommonSettingsFile();

const {
    isAuth,
    userRole,
    extDeviceInInitState,
    extDevsList,
    rebootingDeviceAddr,
    isLongQueryRunning,
    devices,
    interfaces,
    timeout,
    visibleWidgets,
    ngcModbusMode,
    chosenDevices,
    chosenInterfaces,
    isPriorWOpen,
    devicesState,
} = storeToRefs(indexStore);

const funcsStore = useFuncsStore();

const { readFile } = useReadWriteFiles();

const route = useRoute();

const router = useRouter();

const api = indexStore.getApi().api as axios.AxiosInstance;

const isAborted = indexStore.getApi().isAborted;

const menuItems = ['panel', 'functions', 'settings'] as const;

const isScreenBlocked = ref(false);

let blockScreenTimer = 0;

const devicesArr = ref<
    {
        '1w-gpio': { val: number; bus: number } | number;
        '1w-rom': { val: number; bus: number } | number;
        '1w-sens': { val: number; bus: number } | number;
        'adc-in': number;
        addr: number;
        'bin-in': number;
        'bin-out': number;
        'bin-var': number;
        code: number;
        devStatus: 'on' | 'off' | 'init' | 'no-conn' | 'error';
        'ext-dev': number;
        index: number;
        'int-var': number;
        'mb-iface': number;
        'mb-var': { val: number; bus: number } | number;
        message: string;
        'ow-iface': number;
        'pwm-out': number;
        state: string;
        status: string;
        'tim-var': number;
        type: string;
        'udf-act': number;
        'udf-cond': number;
        'udf-timer': number;
        'udf-trans': number;
        'udf-trig': number;
        serial: string;
        version: string;
    }[]
>([]);

const activeMenuItem = computed<(typeof menuItems)[number]>(() => {
    let activeItem: (typeof menuItems)[number] = 'panel';
    route.matched.some((r) => {
        if (menuItems.includes(r.name as any)) {
            activeItem = r.name as any;
            return true;
        }
        return false;
    });
    return activeItem;
});

const isDev = import.meta.env.DEV;

const isDisabled = ref(false);

const extDeviceInInitIndex = ref<number>();

const isUserSubmenuVisible = ref(false);

const userBlock = ref<HTMLElement | null>(null);

const zIndex = ref<number | 'unset'>(0);

let zIndexTimer: ReturnType<typeof setTimeout> | undefined;

const currentUserRole = userRole.value;

let getDevicesTimer: ReturnType<typeof setTimeout> | undefined;

let getDevicesStatesTimer: ReturnType<typeof setTimeout> | undefined;

let getExtStatusesTimer: ReturnType<typeof setTimeout> | undefined;

watch(extDeviceInInitState, () => {
    if (extDeviceInInitState.value !== undefined && rebootingDeviceAddr.value === undefined) {
        const extDevice = extDevsList.value?.find((d) => d.addr === extDeviceInInitState.value);
        extDeviceInInitIndex.value = extDevice?.index;
    }
});

watch(isLongQueryRunning, (isRunning) => {
    clearTimeout(blockScreenTimer);
    if (isRunning) {
        blockScreenTimer = setTimeout(() => {
            isScreenBlocked.value = true;
        }, timeout.value);
    }
});

async function logout() {
    isDisabled.value = true;
    try {
        await api.post('logout');
        indexStore.setIsAuth(undefined);
        router.push({ name: 'login' });
    } catch (error) {
        if (isAborted.value) {
            return;
        }
        isDisabled.value = false;
        setTimeout(() => {
            logout();
        }, 20);
    }
}

async function getCommonSettings() {
    const commonFileSettings = await readFile({
        type: 'settings',
        subType: 'common',
        user: userRole.value,
    });
    if (commonFileSettings && commonFileSettings !== 'error') {
        const { lang, tempUnit, funcsNumberPerPage, numberingSystem } =
            commonFileSettings !== 'notFound' ? commonFileSettings : ({} as CommonSettingsFileType);
        if (lang === 'en' || lang === 'ru') {
            indexStore.setLang(lang);
        }
        if (tempUnit === '°C' || tempUnit === '°F') {
            indexStore.setTempUnit(tempUnit);
        }
        if (typeof funcsNumberPerPage === 'number' && funcsNumberPerPage > 0) {
            funcsStore.setFuncsNumberPerPage(funcsNumberPerPage as FuncsNumberPerPage);
        }
        if (numberingSystem === 'hex' || numberingSystem === 'dec') {
            indexStore.setNumberingSystem(numberingSystem);
        }
    } else {
        setCommonSettings();
        await new Promise((res) => setTimeout(res, 1000));
        await getCommonSettings();
    }
}

async function setCommonSettings() {
    try {
        await storeCommonSettingsFile('ru', '°C', 10, 'dec');
    } catch (error) {
        if (isAborted.value) {
            return;
        }
        setTimeout(() => {
            setCommonSettings();
        }, 20);
    }
}

function userSubmenuListener() {
    isUserSubmenuVisible.value = false;
    zIndexTimer = setTimeout(() => {
        zIndex.value = 'unset';
    }, 300);
}

function showUserSubmenu() {
    isUserSubmenuVisible.value = !isUserSubmenuVisible.value;
    userBlock.value?.removeEventListener('mouseleave', userSubmenuListener);
    if (zIndexTimer) {
        clearTimeout(zIndexTimer);
        zIndexTimer = undefined;
    }
    if (isUserSubmenuVisible.value) {
        userBlock.value?.addEventListener('mouseleave', userSubmenuListener, { once: true });
        zIndex.value = 1;
    } else {
        zIndexTimer = setTimeout(() => {
            zIndex.value = 'unset';
            zIndexTimer = undefined;
        }, 300);
    }
}

if (isAuth.value) {
    await getCommonSettings();
    indexStore.setIsInterfaceStarted(true);
}

const { t } = useI18n({
    messages: {
        en: {
            logout: 'Log out',
            menuItems: {
                panel: 'Control panel',
                functions: 'Functions',
                settings: 'Settings',
            },
            initializing: 'Extension device #{index} initializing, please wait...',
            longQuery: 'Query took longer than expected. Please wait...',
            admin: 'Administrator',
            user: 'User',
        },
        ru: {
            logout: 'Выйти',
            menuItems: {
                panel: 'Панель управления',
                functions: 'Функции',
                settings: 'Настройки',
            },
            initializing:
                'Идет инициализация устройства расширения #{index}, пожалуйста подождите...',
            longQuery: 'Запрос занял больше времени, чем ожидалось. Пожалуйста, подождите...',
            admin: 'Администратор',
            user: 'Пользователь',
        },
    },
});

async function getEntState(
    device: number,
    filteredReqArr: {
        type: string;
        device: number;
        index: number;
        quant: number;
    }[],
) {
    if (!window.location.pathname.includes('panel')) {
        return;
    }
    try {
        const r = await api.post('get_ent_state', {
            list: filteredReqArr,
        });
        const state = await r.data.state;
        const newState = state.filter((el: any) => Array.isArray(el.value));
        indexStore.setDevicesState(device, newState);
    } catch (error) {
        if (isAborted.value) {
            return;
        }
        setTimeout(
            () => {
                getEntState(device, filteredReqArr);
            },
            isPriorWOpen.value ? 200 : 20,
        );
    }
}

async function setDevicesStates() {
    try {
        if (activeMenuItem.value !== 'panel') return;
        for (let index = 0; index < devices.value.length; index += 1) {
            const el = devices.value.find((el) => el.state === 'init');
            if (
                (!el &&
                    chosenDevices.value.includes(devices.value[index].addr) &&
                    devices.value[index].state !== 'init' &&
                    devices.value[index].state !== 'no-conn' &&
                    devices.value[index].state !== 'error') ||
                (chosenDevices.value.includes(devices.value[index].addr) && index === 0)
            ) {
                const reqArr: {
                    type: string;
                    device: number;
                    index: number;
                    quant: number;
                    bus?: number;
                }[] = [];
                for (const i of devices.value[index].interf) {
                    if (typeof i === 'string') {
                        reqArr.push({
                            type: i,
                            device: devices.value[index].addr,
                            index: 0,
                            quant: devicesArr.value[index][i] as number,
                        });
                    } else {
                        const interf = devicesArr.value[index][i.interf] as {
                            val: number;
                            bus: number;
                        };
                        reqArr.push({
                            type: i.interf,
                            device: devices.value[index].addr,
                            index: 0,
                            quant: interf.val,
                            bus: i.bus,
                        });
                    }
                }
                let filteredReqArr;
                if (visibleWidgets.value[index] && visibleWidgets.value[index].length !== 0) {
                    filteredReqArr = reqArr.filter((el) => {
                        return visibleWidgets.value[index].find((w) => {
                            return w.w.d === el.device && w.w.i === el.type;
                        });
                    });
                } else {
                    let numbOfVisibleW = 0;
                    visibleWidgets.value.forEach((el) => (numbOfVisibleW += el.length));
                    filteredReqArr = numbOfVisibleW ? [] : reqArr;
                }
                if (filteredReqArr.length)
                    getEntState(devicesArr.value[index].addr, filteredReqArr);
            }
        }
    } catch (error) {
        if (isAborted.value) {
            return;
        }
    }
    getDevicesStatesTimer = setTimeout(setDevicesStates, 3000);
    // getDevicesStatesTimer = setTimeout(
    //     setDevicesStates,
    //     isPriorWOpen.value ? timeout.value * 3 : timeout.value,
    // );
}

async function getOWIds(d: number, bus: number) {
    try {
        const r = await api.post('get_ow_ids', {
            device: d,
            bus: bus,
        });
        const ids = await r.data.ids;
        indexStore.setOWIds(d, bus, ids);
    } catch (error) {
        if (isAborted.value) {
            return;
        }
        setTimeout(() => {
            getOWIds(d, bus);
        }, 20);
    }
}

async function checkMb(d: number, mb: { mode: 'off' | 'variables' }[]) {
    try {
        let mbArr: { interf: string; bus: number }[] | null = null;
        if (d) {
            for (let i = 0; i < mb.length; i += 1) {
                if (mb[i].mode === 'variables') {
                    mbArr !== null
                        ? mbArr.push({ interf: 'mb-var', bus: i })
                        : (mbArr = [{ interf: 'mb-var', bus: i }]);
                }
            }
        } else {
            mbArr = mb.length ? [{ interf: 'mb-var', bus: 0 }] : null;
        }
        const arr = [...devicesArr.value];
        const device = devicesArr.value.find((dev) => dev.addr === d);
        if (device) {
            const val = arr[d]['mb-var'] as number;
            arr[d]['mb-var'] = mbArr ? { val: val, bus: 0 } : 0;
            devicesArr.value = [...arr];
        }
    } catch (error) {
        if (isAborted.value) {
            return;
        }
        setTimeout(() => {
            checkMb(d, mb);
        }, 20);
    }
}

async function checkOWs(d: number, ow: { mode: 'off' | 'sens' | 'rom' | 'gpio' }[]) {
    try {
        let owArr: { interf: string; bus: number }[] | null = null;
        for (let i = 0; i < ow.length; i += 1) {
            if (ow[i].mode !== 'off') {
                const interf =
                    ow[i].mode === 'sens' ? '1w-sens' : ow[i].mode === 'rom' ? '1w-rom' : '1w-gpio';
                owArr !== null
                    ? owArr.push({ interf: interf, bus: i })
                    : (owArr = [{ interf: interf, bus: i }]);
            }
        }
        const arr = [...devicesArr.value];
        const device = devicesArr.value.find((dev) => dev.addr === d);
        if (device) {
            Object.keys(device).forEach((i) => {
                if (i.includes('1w-') && owArr !== null) {
                    const obj = owArr.find((interf) => interf.interf === i);
                    if (obj) {
                        const interf = i as '1w-sens' | '1w-rom' | '1w-gpio';
                        const val = arr[d][interf] as number;
                        arr[d][interf] = { val: val, bus: obj.bus };
                        getOWIds(d, obj.bus);
                    } else {
                        const interf = i as '1w-sens' | '1w-rom' | '1w-gpio';
                        arr[d][interf] = 0;
                    }
                }
            });
            devicesArr.value = [...arr];
        }
    } catch (error) {
        if (isAborted.value) {
            return;
        }
        setTimeout(() => {
            checkOWs(d, ow);
        }, 20);
    }
}

async function getDevices(
    device: number = 0,
    index: number = 0,
    state?: 'on' | 'off' | 'init' | 'no-conn' | 'error',
    serial?: string,
    version?: string,
) {
    try {
        const r0 = await api.post('get_dev_capab', {
            device: device,
        });
        devicesArr.value = [
            ...devicesArr.value,
            Object.assign(
                r0.data,
                { index: index },
                { devStatus: state },
                { serial: serial },
                { version: version },
            ),
        ];
        if (device === 0) await setMbMode();
    } catch (error) {
        if (isAborted.value) {
            return;
        }
        setTimeout(() => {
            getDevices();
        }, 20);
    }
}

async function setMbMode() {
    try {
        const r = await api.get<ControllerSettings>('get_config');
        const min = (await r.data['adc-in']['clbr-min']) as [number | null];
        const max = (await r.data['adc-in']['clbr-max']) as [number | null];
        if (min && max) indexStore.setCalibrVals(min, max);
        indexStore.setNGCModbusMode(r.data.modbus[0]?.mode || 'off');
        if (ngcModbusMode.value === 'ext-devs') {
            await getExtDevs();
        }
        checkOWs(0, r.data['1-wire'] as { mode: 'off' | 'sens' | 'rom' | 'gpio' }[]);
        checkMb(0, ngcModbusMode.value === 'variables' ? [{ mode: 'variables' }] : []);
    } catch (error) {
        if (isAborted.value) {
            return;
        }
        setTimeout(() => {
            setMbMode();
        }, 20);
    }
}

async function getExtDevs() {
    try {
        const r = (await (await api.get('get_ext_devs')).data).list as Device[];
        const newR = [];
        for (let i = 0; i < r.length; i += 1) {
            newR.push(Object.assign(r[i], { index: i + 1 }));
        }
        const devices = newR.filter((item) => item.type !== 'none');
        devices.forEach(async (d) => {
            await getDevices(d.addr, d.index, d.state, d.serial, d.version);
            await getExtDevsCfg(d.addr);
        });
        getExtStatuses();
    } catch (error) {
        if (isAborted.value) {
            return;
        }
        setTimeout(() => {
            getExtDevs();
        }, 20);
    }
}

async function getExtStatuses() {
    if (window.location.pathname.includes('panel')) {
        try {
            const r = (await (await api.get('get_ext_devs')).data).list as Device[];
            const newR = [];
            for (let i = 0; i < r.length; i += 1) {
                newR.push(Object.assign(r[i], { index: i + 1 }));
            }
            const devs = newR.filter((item) => item.type !== 'none');
            devs.forEach(async (d) => {
                if (d.state !== devices.value.find((el) => el.addr === d.addr)?.state) {
                    indexStore.changeDeviceState(d.addr, d.state);
                }
            });
        } catch (error) {
            if (isAborted.value) {
                return;
            }
            return new Promise((resolve) =>
                setTimeout(() => {
                    getExtStatuses();
                }, 20),
            );
        }
    }
    getExtStatusesTimer = setTimeout(getExtStatuses, 1000);
}

async function getExtDevsCfg(d: number) {
    try {
        const r = await api.post('get_ext_cfg', {
            device: d,
        });
        checkOWs(d, r.data['1-wire'] as { mode: 'off' | 'sens' | 'rom' | 'gpio' }[]);
        checkMb(d, r.data['mb-master'] as { mode: 'off' | 'variables' }[]);
    } catch (error) {
        if (isAborted.value) {
            return;
        }
        setTimeout(() => {
            getExtDevsCfg(d);
        }, 20);
    }
}

async function getLabelsPart(
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
    number: number,
    part: number,
    bus?: number,
) {
    const reqLabels = await readFile(
        {
            type: 'labels',
            device: d,
            bus: bus,
            interf: interf,
        },
        part,
    );
    if (reqLabels === 'error') {
        return new Promise((resolve) =>
            setTimeout(() => {
                getLabelsPart(d, interf, number, part, bus);
            }, 5),
        );
    } else if (reqLabels === 'notFound') {
        indexStore.setLabels(d, interf, null, part, bus);
        return;
    } else {
        const { labels } = reqLabels as LabelsType;
        indexStore.setLabels(d, interf, labels, part, bus);
    }
}

async function getMbDevsLabels(d: number, bus: number, part: number) {
    const reqLabels = await readFile(
        {
            type: 'labels',
            subType: 'mbDevices',
            device: d,
            bus: bus,
            interf: 'mb-var',
        },
        part,
    );
    const arr = [];
    for (let i = 0; i < labelsFileLength; i++) {
        arr.push('');
    }
    if (reqLabels === 'error') {
        return new Promise((resolve) =>
            setTimeout(() => {
                getMbDevsLabels(d, bus, part);
            }, 5),
        );
    } else if (reqLabels === 'notFound') {
        indexStore.setMbDevsLabels(d, bus, part, arr);
        return;
    } else {
        const { labels } = reqLabels as LabelsType;
        indexStore.setMbDevsLabels(d, bus, part, labels);
    }
}

// async function getMbLabels(d: number, bus: number, part: number) {
//     // const reqLabels = await readFile(
//     //     {
//     //         type: 'labels',
//     //         subType: 'mbDevices',
//     //         device: d,
//     //         bus: bus,
//     //         interf: 'mb-var',
//     //     },
//     //     part,
//     // );
//     // const arr = [];
//     // for (let i = 0; i < labelsFileLength; i++) {
//     //     arr.push('');
//     // }
//     // if (reqLabels === 'error') {
//     //     return new Promise((resolve) =>
//     //         setTimeout(() => {
//     //             getMbDevsLabels(d, bus, part);
//     //         }, 5),
//     //     );
//     // } else if (reqLabels === 'notFound') {
//     //     indexStore.setMbDevsLabels(d, bus, part, arr);
//     //     return;
//     // } else {
//     //     const { labels } = reqLabels as LabelsType;
//     //     indexStore.setMbDevsLabels(d, bus, part, labels);
//     // }
// }

async function getMbDevs(d: number, bus: number) {
    const mbDevs = await readFile({
        type: 'mb',
        subType: 'devs',
        device: d,
        bus: bus,
    });
    if (mbDevs === 'error') {
        return new Promise((resolve) =>
            setTimeout(() => {
                getMbDevs(d, bus);
            }, 5),
        );
    } else if (mbDevs === 'notFound') {
        indexStore.setMbDevs(d, bus, []);
        return;
    } else {
        const { devs } = mbDevs as MbType;
        indexStore.setMbDevs(d, bus, devs);
    }
}

async function getLabels(
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
    number: number,
    bus?: number,
) {
    if (!number) return;
    setTimeout(() => {
        const parts = [];
        for (let i = 0; i < Math.ceil(number / labelsFileLength); i += 1) {
            parts.push(i);
        }
        parts.forEach(async (part) => {
            await getLabelsPart(d, interf, number, part, bus);
        });
        if (interf === 'mb-var') {
            getMbDevs(d, bus || 0);
            const parts = [0, 1, 2, 3];
            parts.forEach(async (part) => {
                await getMbDevsLabels(d, bus || 0, part);
            });
        }
    }, 3000);
}

onMounted(async () => {
    if (route.name === 'devices-settings') return;
    await getDevices();
    setDevicesStates();
});

watch(
    () => devicesArr.value,
    () => {
        for (let i = 0; i < devicesArr.value.length; i += 1) {
            if (devices.value.findIndex((obj) => obj.addr === devicesArr.value[i].addr) === -1) {
                let interfArr: [string | { interf: string; bus: number }] | null = null;
                for (let j = 0; j < interfaces.value.length; j++) {
                    if (devicesArr.value[i][interfaces.value[j].value]) {
                        if (
                            interfaces.value[j].value.includes('1w-') &&
                            typeof devicesArr.value[i][interfaces.value[j].value] === 'number'
                        ) {
                            break;
                        } else if (interfaces.value[j].value.includes('1w-')) {
                            const interfVal = devicesArr.value[i][interfaces.value[j].value] as {
                                val: number;
                                bus: number;
                            };
                            interfArr !== null
                                ? interfArr.push({
                                      interf: interfaces.value[j].value,
                                      bus: interfVal.bus,
                                  })
                                : (interfArr = [
                                      { interf: interfaces.value[j].value, bus: interfVal.bus },
                                  ]);
                        } else if (interfaces.value[j].value === 'mb-var') {
                            interfArr !== null
                                ? interfArr.push({
                                      interf: interfaces.value[j].value,
                                      bus: 0,
                                  })
                                : (interfArr = [{ interf: interfaces.value[j].value, bus: 0 }]);
                        } else {
                            interfArr !== null
                                ? interfArr.push(interfaces.value[j].value)
                                : (interfArr = [interfaces.value[j].value]);
                        }
                    }
                }
                if (interfArr === null) break;
                indexStore.setDevices(
                    Object.assign(
                        { addr: devicesArr.value[i].addr as number },
                        {
                            type: (devicesArr.value[i].type +
                                ' ' +
                                devicesArr.value[i].index) as string,
                        },
                        {
                            interf: interfArr as [
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
                                | 'pwm-out'
                                | 'tim-var',
                            ],
                        },
                        { state: devicesArr.value[i].devStatus },
                        { serial: devicesArr.value[i].serial },
                        { version: devicesArr.value[i].version },
                    ),
                );
                interfaces.value.forEach((interf) => {
                    let number;
                    if (typeof devicesArr.value[i][interf.value] === 'object') {
                        const el = devicesArr.value[i][interf.value] as {
                            val: number;
                            bus: number;
                        };
                        number = el.val;
                    } else {
                        number = devicesArr.value[i][interf.value] as number;
                    }
                    if (typeof devicesArr.value[i][interf.value] === 'object') {
                        const el = devicesArr.value[i][interf.value] as {
                            val: number;
                            bus: number;
                        };
                        getLabels(
                            i,
                            interf.value as
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
                            number,
                            el.bus,
                        );
                    } else {
                        getLabels(
                            i,
                            interf.value as
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
                            number,
                        );
                    }
                });
            }
        }
        indexStore.toggleChooseAllDevices(undefined, true);
        indexStore.toggleChooseAllInterfaces(undefined, true);
    },
);

watch(
    () => activeMenuItem.value,
    () => {
        if (activeMenuItem.value !== 'panel') {
            clearTimeout(getDevicesStatesTimer);
            getDevicesStatesTimer = undefined;
        } else {
            setDevicesStates();
        }
    },
);

onBeforeUnmount(() => {
    clearTimeout(getDevicesStatesTimer);
    getDevicesStatesTimer = undefined;
    clearTimeout(getExtStatusesTimer);
    getExtStatusesTimer = undefined;
});
</script>
