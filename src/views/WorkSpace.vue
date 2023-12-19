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
import type { FuncsNumberPerPage } from '@/typings/funcs';
import ModalWrapper from '@/components/ModalWrapper.vue';
import gears from '@/assets/img/gears-animated.svg?raw';
import type { ControllerSettings } from '@/typings/settings';
import spinner from '@/assets/img/spinner-inside-button.svg?raw';
import type { Device } from '@/stores';

const indexStore = useIndexStore();

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
} = storeToRefs(indexStore);

const funcsStore = useFuncsStore();

const { readFile } = useReadWriteFiles();

const route = useRoute();

const router = useRouter();

const { api, isAborted } = useApi();

const menuItems = ['panel', 'functions', 'settings'] as const;

const isScreenBlocked = ref(false);

let blockScreenTimer = 0;

const devicesArr = ref<
    {
        '1w-gpio': number;
        '1w-rom': number;
        '1w-sens': number;
        'adc-in': number;
        addr: number;
        'bin-in': number;
        'bin-out': number;
        'bin-var': number;
        code: number;
        'ext-dev': number;
        index: number;
        'int-var': number;
        'mb-iface': number;
        'mb-var': number;
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
        isDisabled.value = false;
    }
}

async function getCommonSettings() {
    const commonFileSettings = await readFile({
        type: 'settings',
        subType: 'common',
        user: userRole.value,
    });
    if (commonFileSettings !== 'error') {
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
        indexStore.setLang('ru');
        indexStore.setTempUnit('°C');
        funcsStore.setFuncsNumberPerPage(5 as FuncsNumberPerPage);
        indexStore.setNumberingSystem('dec');

        // await new Promise((res) => setTimeout(res, 1000));
        // await getCommonSettings();
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

async function setDevicesStates() {
    try {
        for (let index = 0; index < devices.value.length; index += 1) {
            const reqArr: { type: string; device: number; index: number; quant: number }[] = [];
            devices.value[index].interf.forEach((i) => {
                reqArr.push({
                    type: i,
                    device: devices.value[index].addr,
                    index: 0,
                    quant: devicesArr.value[index][i],
                });
            });
            let filteredReqArr;
            if (visibleWidgets.value.length !== 0) {
                filteredReqArr = reqArr.filter((el) => {
                    return visibleWidgets.value.find((w) => {
                        return w.w.d === el.device && w.w.i === el.type;
                    });
                });
            } else {
                filteredReqArr = reqArr;
            }
            const r = await api.post('get_ent_state', {
                list: filteredReqArr,
            });
            indexStore.setDevicesState(devicesArr.value[index].addr, r.data.state);
        }
    } catch (error) {
        console.error(error);
        if (isAborted.value) {
            return;
        }
    }
    getDevicesStatesTimer = setTimeout(setDevicesStates, timeout.value);
}

async function getDevices(device: number = 0, index: number = 0) {
    try {
        const r0 = await api.post('get_dev_capab', {
            device: device,
        });
        devicesArr.value = [...devicesArr.value, Object.assign(r0.data, { index: index })];
    } catch (error) {
        getDevicesTimer = setTimeout(() => {
            getDevices();
        }, timeout.value);
    }
}

onMounted(async () => {
    if (route.name === 'devices-settings') return;
    try {
        const r = await api.get<ControllerSettings>('get_config');
        indexStore.setNGCModbusMode(r.data.modbus[0]?.mode || 'off');
        await getDevices();
        if (ngcModbusMode.value === 'ext-devs') {
            const r = (await (await api.post('get_ext_devs')).data).list as Device[];
            const newR = [];
            for (let i = 0; i < r.length; i += 1) {
                newR.push(Object.assign(r[i], { index: i + 1 }));
            }
            const devices = newR.filter((item) => item.type !== 'none');
            devices.forEach(async (d) => {
                await getDevices(d.addr, d.index);
            });
        }
        setDevicesStates();
    } catch (error) {
        if (isAborted.value) {
            return;
        }
        //
    }
});

watch(
    () => devicesArr.value,
    () => {
        for (let i = 0; i < devicesArr.value.length; i += 1) {
            if (devices.value.findIndex((obj) => obj.addr === devicesArr.value[i].addr) === -1) {
                const interfArr: string[] = [];
                for (let j = 0; j < interfaces.value.length; j++) {
                    if (devicesArr.value[i][interfaces.value[j].value]) {
                        interfArr.push(interfaces.value[j].value);
                    }
                }
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
                    ),
                );
            }
        }
    },
);

onBeforeMount(() => {
    getDevicesTimer = undefined;
    getDevicesStatesTimer = undefined;
});
</script>
