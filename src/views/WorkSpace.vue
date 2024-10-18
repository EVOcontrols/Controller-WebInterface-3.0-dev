<template>
    <div class="w-full h-full flex flex-col overflow-hidden">
        <div class="h-[5.063rem] !min-h-[5.063rem] bg-[#092740] flex flex-row w-full items-center">
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
            <div
                class="ml-[45px] relative group text-[#638bae] hover:text-[#adebff] active:text-[#adebff] flex flex-row items-center mr-10 pr-2 pt-1 pb-1 font-semibold text-[0.938rem] leading-[1.2] tracking-[0.03em] cursor-pointer transition-all duration-300"
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
            v-if="activeMenuItem !== 'presetAlgoritms'"
        >
            <h1
                class="font-semibold text-[#8dc5f6] text-[1.625rem] leading-[1.192] tracking-[0.02em] mt-6 mx-10"
                :key="activeMenuItem"
            >
                {{ t('menuItems.' + activeMenuItem) }}
            </h1>
        </Transition>
        <router-view v-slot="{ Component }">
            <div
                v-if="isEditPopUpShown"
                @mouseleave="indexStore.toggleIsEditPopUpShown(false)"
                class="absolute flex flex-col gap-3 py-5 px-5 left-[136px] top-[174px] w-[270px] bg-[#1B4569] rounded-[10px] transition-[visibility,opacity] z-[1]"
            >
                <span class="w-full text-[#A0D5FF] font-semibold text_wrap">{{
                    t('infoBlock.title')
                }}</span>
                <div class="w-full text-balance text-[#77C3FF] text_wrap">
                    {{ t('infoBlock.text.p1')
                    }}{{ ngcModbusMode === 'off' ? t('infoBlock.text.off') : t('infoBlock.text.mb')
                    }}{{ t('infoBlock.text.p2') }}
                    <span
                        class="underline text-[#ADEBFF] font-semibold cursor-pointer"
                        @click="scrollSettings"
                    >
                        {{ t('infoBlock.text.link') }}</span
                    >
                    >{{ t('infoBlock.text.p3') }}
                </div>
            </div>
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
            v-if="extDeviceInInitIndex !== undefined && !isAddingDev"
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
import type { DeviceAddr } from '@/typings/common';
import type { DeviceWorkState } from '@/typings/settings';
import ModalWrapper from '@/components/ModalWrapper.vue';
import gears from '@/assets/img/gears-animated.svg?raw';
import type { ControllerSettings, ExtDevsListRaw } from '@/typings/settings';
import spinner from '@/assets/img/spinner-inside-button.svg?raw';
import type { Device, Interf } from '@/stores';
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
    isEditPopUpShown,
    isRebootRequired,
    needToReqData,
    mbDevs,
    isAddingDev,
} = storeToRefs(indexStore);

const { toast } = useToast();

const funcsStore = useFuncsStore();

const { readFile } = useReadWriteFiles();

const route = useRoute();

const router = useRouter();

const api = indexStore.getApi().api as axios.AxiosInstance;

const isAborted = indexStore.getApi().isAborted;

const menuItems = ['panel', 'presetAlgoritms', 'customAlgoritms', 'settings'] as const;

const isScreenBlocked = ref(false);

let blockScreenTimer = 0;

const devicesArr = ref<
    {
        '1w-gpio': { val: number; bus: number }[] | number;
        '1w-rom': { val: number; bus: number }[] | number;
        '1w-sens': { val: number; bus: number }[] | number;
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
        'mb-var': { val: number; bus: number }[] | number;
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
        [key: string]: any;
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
const timeoutDev = 10000;

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

function scrollSettings() {
    const settingsEl = document.getElementById('devicesSettings');
    if (!settingsEl) return;
    indexStore.toggleIsEditPopUpShown(false);
    settingsEl.scrollTo({ top: 290, behavior: 'smooth' });
}

watch(extDeviceInInitState, () => {
    if (extDeviceInInitState.value !== undefined && rebootingDeviceAddr.value === undefined) {
        const extDevice = extDevsList.value?.find(
            (d: {
                index: number;
                type: 'NG3-EDIO';
                addr: Exclude<DeviceAddr, 0>;
                state: DeviceWorkState;
                serial: string;
                version: string;
            }) => d.addr === extDeviceInInitState.value,
        );
        extDeviceInInitIndex.value = extDevice?.index;
    } else {
        if (extDeviceInInitIndex.value) {
            getMbDevs(extDeviceInInitIndex.value, 0);
        }
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
    if (commonFileSettings && commonFileSettings !== 'error' && commonFileSettings !== 'notFound') {
        const { lang, tempUnit, funcsNumberPerPage, numberingSystem } = commonFileSettings;
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
                presetAlgoritms: 'Preset algoritms',
                customAlgoritms: 'Custom Algorithms',
                settings: 'System settings',
            },
            initializing: 'Extension device #{index} initializing, please wait...',
            longQuery: 'Query took longer than expected. Please wait...',
            admin: 'Administrator',
            user: 'User',
            infoBlock: {
                title: 'Editing the list of expansion devices is not possible.',
                text: {
                    p1: 'RS485 NGC bus ',
                    off: 'disabled. ',
                    mb: 'is in “Modbus variables” mode. ',
                    p2: 'Click ',
                    link: 'here ',
                    p3: 'to go to the bus operating mode settings.',
                },
            },
            toast: {
                success: 'Saved',
                error: {
                    header: 'Error',
                    text: 'Check entered values',
                },
                reboot: {
                    rebootRequired: 'Reboot required',
                    press: 'Press',
                    here: 'here',
                    forReboot: 'for reboot',
                },
            },
        },
        ru: {
            logout: 'Выйти',
            menuItems: {
                panel: 'Панель управления',
                presetAlgoritms: 'Предустановленные алгоритмы',
                customAlgoritms: 'Пользовательские алгоритмы',
                settings: 'Настройки системы',
            },
            initializing:
                'Идет инициализация устройства расширения #{index}, пожалуйста подождите...',
            longQuery: 'Запрос занял больше времени, чем ожидалось. Пожалуйста, подождите...',
            admin: 'Администратор',
            user: 'Пользователь',
            infoBlock: {
                title: 'Редактирование списка устройств расширения невозможно.',
                text: {
                    p1: 'Шина RS485 NGC ',
                    off: 'отключена. ',
                    mb: 'находится в режиме “переменные Modbus". ',
                    p2: 'Нажмите ',
                    link: 'сюда ',
                    p3: 'для перехода к настройкам режима работы шины.',
                },
            },
            toast: {
                success: 'Сохранено',
                error: {
                    header: 'Ошибка',
                    text: 'Проверьте введённые значения',
                },
                reboot: {
                    rebootRequired: 'Требуется перезагрузка',
                    press: 'Нажмите',
                    here: 'сюда',
                    forReboot: 'для перезагрузки',
                },
            },
        },
    },
});

async function getEntState(
    device: number,
    filteredReqArr: {
        type: string;
        device: number;
        index: number;
        quantity: number;
        bus?: number;
    }[],
) {
    // if (!window.location.pathname.includes('panel')) {
    if (!window.location.hash.includes('panel')) {
        return;
    }
    try {
        const r = await api.post('get_ent_state', {
            entities: filteredReqArr,
        });
        const state = await r.data.entities;
        const newState = state.filter((el: any) => Array.isArray(el.state));
        indexStore.setDevicesState(device, newState);
    } catch (error) {
        if (isAborted.value) {
            return;
        }
        const timeoutProd = isPriorWOpen.value ? 200 : mbDevs.value.length ? 20 : 100;
        const timeout = isDev ? timeoutDev / 5 : timeoutProd;
        setTimeout(() => {
            getEntState(device, filteredReqArr);
        }, timeout);
    }
}

async function setDevicesStates() {
    try {
        if (activeMenuItem.value !== 'panel') return;
        const el = devices.value.find((el: Device) => el.state === 'init');
        for (let index = 0; index < devices.value.length; index += 1) {
            if (
                ((!el &&
                    chosenDevices.value.includes(devices.value[index].addr) &&
                    devices.value[index].state !== 'init' &&
                    devices.value[index].state !== 'no-conn' &&
                    devices.value[index].state !== 'error') ||
                    (chosenDevices.value.includes(devices.value[index].addr) && index === 0)) &&
                !devices.value
                    .slice(0, index)
                    .filter((elem: Device) => elem.addr === devices.value[index].addr).length
            ) {
                const reqArr: {
                    type: string;
                    device: number;
                    index: number;
                    quantity: number;
                    bus?: number;
                }[] = [];
                for (const i of devices.value[index].interf) {
                    if (typeof i === 'string') {
                        reqArr.push({
                            type: i,
                            device: devices.value[index].addr,
                            index: 0,
                            quantity: devicesArr.value[index][i] as number,
                        });
                    } else {
                        const interfArr = devicesArr.value[index][i.interf] as {
                            val: number;
                            bus: number;
                        }[];
                        if (
                            (interfArr[i.bus] && interfArr[i.bus].val) ||
                            (interfArr[0] && interfArr[0].val)
                        ) {
                            reqArr.push({
                                type: i.interf,
                                device: devices.value[index].addr,
                                index: 0,
                                quantity: interfArr[i.bus]
                                    ? interfArr[i.bus].val
                                    : interfArr[0].val,
                                bus: i.bus,
                            });
                        }
                    }
                }
                let filteredReqArr;
                if (visibleWidgets.value[index] && visibleWidgets.value[index].length !== 0) {
                    filteredReqArr = reqArr.filter((el) => {
                        return visibleWidgets.value[index].find(
                            (w: {
                                w: {
                                    d: number;
                                    i: string;
                                    bus?: number;
                                };
                            }) => {
                                return w.w.d === el.device && w.w.i === el.type;
                            },
                        );
                    });
                } else {
                    let numbOfVisibleW = 0;
                    visibleWidgets.value.forEach(
                        (
                            el: {
                                w: {
                                    d: number;
                                    i: string;
                                    bus?: number;
                                };
                            }[],
                        ) => (numbOfVisibleW += el.length),
                    );
                    filteredReqArr = numbOfVisibleW ? [] : reqArr;
                }
                if (filteredReqArr.length) {
                    if (filteredReqArr.length > 8) {
                        getEntState(devicesArr.value[index].index, filteredReqArr.slice(0, 8));
                        getEntState(devicesArr.value[index].index, filteredReqArr.slice(8));
                    } else {
                        getEntState(devicesArr.value[index].index, filteredReqArr);
                    }
                }
            }
        }
    } catch (error) {
        if (isAborted.value) {
            return;
        }
    }
    // getDevicesStatesTimer = setTimeout(setDevicesStates, 3000);
    const timeoutProd = isPriorWOpen.value ? timeout.value * 5 : timeout.value;
    const timePause = isDev ? timeoutDev : timeoutProd;
    getDevicesStatesTimer = setTimeout(setDevicesStates, timePause);
}

async function getOWIds(
    d: number,
    obj: {
        interf: string;
        bus: number;
    },
) {
    try {
        const r = await api.post('get_ow_ids', {
            device: d,
            bus: obj.bus,
            type: obj.interf,
        });
        const ids = await r.data.ids;
        indexStore.setOWIds(d, obj.bus, ids);
    } catch (error) {
        if (isAborted.value) {
            return;
        }
        setTimeout(() => {
            getOWIds(d, obj);
        }, 5);
    }
}

async function checkMb(d: number, mb: { mode: 'off' | 'variables' }[]) {
    try {
        let mbArr: { interf: string; bus: number }[] | null = null;
        for (let i = 0; i < mb.length; i += 1) {
            if (mb[i].mode === 'variables') {
                mbArr !== null
                    ? mbArr.push({ interf: 'mb-var', bus: i })
                    : (mbArr = [{ interf: 'mb-var', bus: i }]);
            }
        }
        if (!mbArr) mbArr = [];
        const arr = [...devicesArr.value];
        const device = devicesArr.value.find((dev) => dev.index === d);
        if (device) {
            const res: { val: number; bus: number }[] = [];
            for (let j = 0; j < mbArr.length; j++) {
                const val = arr[d]['mb-var'] as number;
                res.push({ val: val, bus: mbArr[j].bus });
                // arr[d]['mb-var'] = mbArr ? { val: val, bus: 0 } : 0;
            }
            arr[d]['mb-var'] = res.length ? [...res] : 0;
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
        if (!owArr) owArr = [];
        const arr = [...devicesArr.value];
        const device = devicesArr.value.find((dev) => dev.index === d);
        if (device) {
            Object.keys(device).forEach((i) => {
                if (i.includes('1w-') && owArr !== null) {
                    const res: { val: number; bus: number }[] = [];
                    const interf = i as '1w-sens' | '1w-rom' | '1w-gpio';
                    for (let j = 0; j < owArr.length; j++) {
                        if (owArr.filter((elem) => elem.interf === i).length) {
                            if (owArr[j].interf === i) {
                                const val = arr[d][interf] as number;
                                res.push({ val: val, bus: owArr[j].bus });
                                // arr[d][interf] = { val: val, bus: owArr[j].bus };
                                getOWIds(d, owArr[j]);
                            }
                        } else {
                            arr[d][interf] = 0;
                        }
                    }
                    arr[d][interf] = res.length ? [...res] : 0;
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
        const r0: {
            data: {
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
            };
        } = await api.post('get_dev_capab', {
            device: index,
        });
        indexStore.setDevCapabs(index, r0.data);
        const newArr = [...devicesArr.value];
        for (let i = newArr.length; i < index; i++) {
            newArr.push(devicesArr.value[0]);
        }
        newArr.push(
            Object.assign(
                r0.data,
                { index: index },
                { devStatus: state },
                { serial: serial },
                { version: version },
            ),
        );
        devicesArr.value = [...newArr];
        if (device === 0) {
            await setMbMode();
        } else {
            await getExtDevsCfg(index);
        }
    } catch (error) {
        if (isAborted.value) {
            return;
        }
        setTimeout(() => {
            getDevices(device, index, state, serial, version);
        }, 20);
    }
}

async function setMbMode() {
    try {
        const r = await api.get<ControllerSettings>('get_config');
        indexStore.setIsRebootRequired(r.data['reboot-req']);
        if (r.data['reboot-req'] && route.name !== 'devices-settings') {
            const toastId = toast.info(
                t('toast.reboot.rebootRequired'),
                [
                    `${t('toast.reboot.press')} `,
                    {
                        text: t('toast.reboot.here'),
                        action: () => {
                            indexStore.deleteToast(toastId);
                            router.push({ name: 'devices-settings' });
                        },
                    },
                    ` ${t('toast.reboot.forReboot')}`,
                ],
                0,
            );
        }
        const min = (await r.data['adc-in']['clbr-min']) as [number | null];
        const max = (await r.data['adc-in']['clbr-max']) as [number | null];
        if (min && max) indexStore.setCalibrVals(min, max);
        indexStore.setNGCModbusMode(r.data['rs-485'][0]?.mode || 'off');
        if (ngcModbusMode.value === 'ext-devs') {
            await getExtDevs();
        }
        checkOWs(0, r.data['1-wire'] as { mode: 'off' | 'sens' | 'rom' | 'gpio' }[]);
        checkMb(0, ngcModbusMode.value === 'variables' ? [{ mode: 'variables' }] : []);
    } catch (error) {
        console.log(error);
        if (isAborted.value) {
            return;
        }
        setTimeout(() => {
            setMbMode();
        }, 20);
    }
}

async function getExtDevs() {
    if (isRebootRequired.value) return;
    try {
        const r0 = await api.get('get_ext_devs');
        const r = (await r0.data).list as Device[];
        indexStore.setExtDevsList(r0.data.list);
        const newR = [];
        for (let i = 0; i < r.length; i += 1) {
            newR.push(Object.assign(r[i], { index: i + 1 }));
        }
        const devices = newR.filter((item) => item.type !== 'none' && item.state === 'on');
        devices.forEach(async (d) => {
            await getDevices(d.addr, d.index, d.state, d.serial, d.version);
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
    if (window.location.hash.includes('panel') && !isRebootRequired.value) {
        try {
            const response = await api.get('get_ext_devs');
            const { list } = response.data as { list: Device[] };
            indexStore.setExtDevsList(list as ExtDevsListRaw);
            const newR = [];
            for (let i = 0; i < list.length; i += 1) {
                newR.push(Object.assign(list[i], { index: i + 1 }));
            }
            const devs = newR.filter((item) => item.type !== 'none');
            devs.forEach(async (d) => {
                if (d.state !== devices.value.find((el: Device) => el.addr === d.addr)?.state) {
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
    const timeout = isDev ? timeoutDev : 1000;
    getExtStatusesTimer = setTimeout(getExtStatuses, timeout);
}

async function getExtDevsCfg(d: number) {
    try {
        const r = await api.post('get_ext_cfg', {
            device: d,
        });
        checkOWs(d, r.data['1-wire'] as { mode: 'off' | 'sens' | 'rom' | 'gpio' }[]);
        checkMb(d, r.data['rs-485'] as { mode: 'off' | 'variables' }[]);
    } catch (error) {
        if (isAborted.value) {
            return;
        }
        setTimeout(() => {
            getExtDevsCfg(d);
        }, 20);
    }
}

// async function getLabelsPart(
//     d: number,
//     interf:
//         | '1w-rom'
//         | '1w-sens'
//         | 'bin-in'
//         | 'adc-in'
//         | 'bin-out'
//         | 'pwm-out'
//         | 'mb-var'
//         | 'bin-var'
//         | 'int-var'
//         | 'tim-var',
//     number: number,
//     part: number,
//     bus?: number,
// ) {
//     const reqLabels = await readFile(
//         {
//             type: 'labels',
//             device: d,
//             bus: bus,
//             interf: interf,
//         },
//         part,
//     );
//     if (reqLabels === 'error') {
//         return new Promise((resolve) =>
//             setTimeout(() => {
//                 getLabelsPart(d, interf, number, part, bus);
//             }, 5),
//         );
//     } else if (reqLabels === 'notFound') {
//         indexStore.setLabels(d, interf, null, part, bus);
//         return;
//     } else {
//         const { labels } = reqLabels as LabelsType;
//         indexStore.setLabels(d, interf, labels, part, bus);
//     }
// }

async function getMbDevsLabels(d: number, bus: number) {
    const reqLabels = await readFile({
        type: 'labels',
        subType: 'mbDevices',
        device: d,
        bus: bus,
        interf: 'mb-var',
    });
    const arr = [];
    for (let i = 0; i < labelsFileLength; i++) {
        arr.push('');
    }
    if (reqLabels === 'error') {
        return new Promise((resolve) =>
            setTimeout(() => {
                getMbDevsLabels(d, bus);
            }, 5),
        );
    } else if (reqLabels === 'notFound') {
        indexStore.setMbDevsLabels(d, bus, arr);
        return;
    } else {
        const { labels } = reqLabels as LabelsType;
        indexStore.setMbDevsLabels(d, bus, labels);
    }
}

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
    bus?: number,
) {
    if (interf === 'mb-var') {
        if (bus !== undefined) {
            const reqLabels = await readFile({
                type: 'labels',
                device: d,
                bus: bus,
                interf: 'mb-var',
            });
            if (reqLabels === 'error') {
                return new Promise((resolve) =>
                    setTimeout(() => {
                        getLabels(d, interf, bus);
                    }, 5),
                );
            } else if (reqLabels === 'notFound') {
                indexStore.setLabels(d, interf, [], bus);
            } else {
                const { labels } = reqLabels as LabelsType;
                indexStore.setLabels(d, interf, labels, bus);
            }
            getMbDevs(d, bus || 0);
            getMbDevsLabels(d, bus || 0);
        }
        // const parts = [0, 1, 2, 3];
        // parts.forEach(async (part) => {
        //     await getMbDevsLabels(d, bus || 0, part);
        // });
    } else {
        const reqLabels = await readFile({
            type: 'labels',
            device: d,
            bus: bus,
            interf: interf,
        });
        if (reqLabels === 'error') {
            return new Promise((resolve) =>
                setTimeout(() => {
                    getLabels(d, interf, bus);
                }, 5),
            );
        } else if (reqLabels === 'notFound') {
            indexStore.setLabels(d, interf, null, bus);
            return;
        } else {
            const { labels } = reqLabels as LabelsType;
            indexStore.setLabels(d, interf, labels, bus);
        }
    }
    // const parts = [];
    // for (let i = 0; i < Math.ceil(number / labelsFileLength); i += 1) {
    //     parts.push(i);
    // }
    // parts.forEach(async (part) => {
    //     await getLabelsPart(d, interf, number, part, bus);
    // });
}

onMounted(async () => {
    await getDevices();
    setDevicesStates();
});

function setInfo() {
    for (let i = 0; i < devicesArr.value.length; i += 1) {
        if (
            devices.value.findIndex((obj: Device) => obj.addr === devicesArr.value[i].index) === -1
        ) {
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
                        }[];
                        const res: { interf: string; bus: number }[] = [];
                        interfVal.forEach((el) => {
                            res.push({
                                interf: interfaces.value[j].value,
                                bus: el.bus,
                            });
                        });
                        interfArr !== null
                            ? res.forEach((el) => {
                                  if (interfArr !== null) interfArr.push(el);
                              })
                            : (interfArr = [...res] as [string | { interf: string; bus: number }]);
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
            if (interfArr === null) {
                break;
            }
            indexStore.setDevices(
                Object.assign(
                    { addr: devicesArr.value[i].index as number }, // index!
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
            interfaces.value.forEach((interf: Interf) => {
                // let number;
                // if (typeof devicesArr.value[i][interf.value] === 'object') {
                //     const el = devicesArr.value[i][interf.value] as {
                //         val: number;
                //         bus: number;
                //     }[];
                //     // number = el.val;
                // } else {
                //     number = devicesArr.value[i][interf.value] as number;
                // }
                if (typeof devicesArr.value[i][interf.value] === 'object') {
                    const el = devicesArr.value[i][interf.value] as {
                        val: number;
                        bus: number;
                    }[];
                    el.forEach((elem) => {
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
                            elem.bus,
                        );
                    });
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
                    );
                }
            });
        }
    }
    indexStore.toggleChooseAllDevices(undefined, true);
    indexStore.toggleChooseAllInterfaces(undefined, true);
    indexStore.setVisibleWidgets([]);
}

watch(
    () => devicesArr.value,
    () => {
        setInfo();
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

watch(needToReqData, async () => {
    if (needToReqData.value) {
        devicesArr.value = [];
        await getDevices();
        setDevicesStates();
        indexStore.setNeedToReqData(false);
    }
});

watch(extDeviceInInitIndex, () => {
    if (!extDeviceInInitIndex.value) {
        getExtDevs();
    }
});

onBeforeUnmount(() => {
    clearTimeout(getDevicesStatesTimer);
    getDevicesStatesTimer = undefined;
    clearTimeout(getExtStatusesTimer);
    getExtStatusesTimer = undefined;
});
</script>
<style scoped>
.text_wrap {
    text-wrap: wrap;
}
</style>
