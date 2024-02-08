<template>
    <div
        v-if="props.activeIO"
        class="relative h-[3.125rem] border-t border-[#1D4162] px-4 flex items-center justify-between"
    >
        <div class="text-[#8DC5F6] flex items-center gap-2">
            <span
                class="block text-center rounded-[6px] p-[6px] min-w-[26px]"
                :class="styles"
                >{{ props.activeIO.index + 1 }}</span
            >
            <span
                v-if="props.w.i === 'mb-var'"
                class="block text-center rounded-[6px] p-[6px] min-w-[26px]"
                :class="styles"
                >{{ t('device')
                }}{{
                    props.activeIO.val && typeof props.activeIO.val == 'object'
                        ? props.activeIO.val.dev_addr
                        : ''
                }}</span
            >
            <div
                v-if="props.w.i === 'mb-var'"
                class="flex flex-col"
            >
                <span>label</span>
                <span>label</span>
            </div>
            <span v-else>{{ curLabel ? curLabel : '' }}</span>
        </div>
        <span
            class="rounded p-[6px]"
            :class="styles"
            v-if="
                ![
                    'bin-in',
                    'bin-out',
                    'int-var',
                    'bin-var',
                    'tim-var',
                    '1w-sens',
                    '1w-rom',
                    'mb-var',
                ].includes(props.w.i)
            "
            >{{ activeIOVal ? activeIOVal / 100 : '0' }}%</span
        >
        <span
            class="rounded p-[6px]"
            :class="styles"
            v-else-if="['int-var'].includes(props.w.i)"
            >{{ props.activeIO.val === null ? '-' : props.activeIO.val }}</span
        >
        <span
            class="rounded p-[6px]"
            :class="styles"
            v-else-if="['1w-sens'].includes(props.w.i)"
            >{{
                props.activeIO.val === null || typeof props.activeIO.val !== 'number'
                    ? '-'
                    : tempUnit === '°C'
                    ? `${Math.round(props.activeIO.val / 10) / 10}°C`
                    : `${(Math.round(props.activeIO.val / 10) / 10) * 1.8 + 32}°F`
            }}</span
        >
        <div
            v-if="props.w.i === 'mb-var'"
            class="absolute h-[34px] bg-[#092740] rounded-tr-[12px] left-0 -top-[34px] border-t border-r border-[#1D4162] pt-3 pl-4 pr-3 z-[3]"
        >
            <div
                class="rounded-[6px] h-[26px] px-[6px] uppercase flex items-center justify-center min-w-[28px]"
                :class="styles"
            >
                {{
                    props.activeIO.val && typeof props.activeIO.val == 'object'
                        ? props.activeIO.val.type
                        : ''
                }}
            </div>
        </div>
    </div>
    <div
        v-else
        class="h-[3.125rem] border-t border-[#1D4162] px-4 flex items-center"
        :class="
            props.isInfoVisible || props.isCalibration || props.isMb
                ? 'justify-between'
                : 'justify-end'
        "
    >
        <div
            class="relative group"
            v-if="props.isInfoVisible || props.isCalibration"
        >
            <span v-html="info"></span>
            <div
                class="absolute left-0 top-[50%] -translate-y-[50%] ml-[22px] invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-[visibility,opacity] z-[1]"
            >
                <div class="rounded-xl bg-[#1b4569] px-4 py-2 whitespace-nowrap">
                    <div
                        v-if="['bin-in'].includes(props.w.i)"
                        class="text-xs flex gap-2"
                    >
                        <div class="flex gap-1 items-center">
                            <span class="block w-[10px] h-[10px] bg-[#00D6AF] rounded-[50%]"></span>
                            {{ t('binInInfo.active') }}
                        </div>
                        <div class="flex gap-1 items-center">
                            <span class="block w-[10px] h-[10px] bg-[#2A5D73] rounded-[50%]"></span>
                            {{ t('binInInfo.notActive') }}
                        </div>
                    </div>
                    <div
                        v-else-if="props.isCalibration"
                        class="text-xs flex gap-4"
                    >
                        <div class="flex items-center">
                            <span
                                v-html="calibrationArrow"
                                class="rotate-180"
                            ></span>
                            <span
                                v-html="calibrationArrow"
                                class="ml-[1px] mr-[6px]"
                            ></span>
                            {{ t('calibration.level') }}
                        </div>
                        <div class="flex gap-1 items-center">
                            <span class="block w-1 h-1 bg-[#00B3CB] rounded-[50%]"></span>
                            {{ t('calibration.calibr') }}
                        </div>
                        <div class="flex gap-1 items-center">
                            <span class="block w-1 h-1 bg-[#26647E] rounded-[50%]"></span>
                            {{ t('calibration.notCalibr') }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div
            class="flex"
            v-else-if="props.isMb"
        >
            <span
                class="h-[22px] w-16 text-sm font-Roboto flex items-center rounded-l-[8px] flex items-center justify-center"
                :class="
                    curNumberingSystem === 'dec'
                        ? 'bg-[#023E71] text-[#2B9BFF] select-none'
                        : 'bg-[#0F304B] text-[#5F93C2] cursor-pointer'
                "
                @click="indexStore.setCurNumberingSystem('dec')"
                >DEC</span
            >
            <span
                class="h-[22px] w-16 text-sm font-Roboto flex items-center rounded-r-[8px] flex items-center justify-center"
                :class="
                    curNumberingSystem === 'hex'
                        ? 'bg-[#023E71] text-[#2B9BFF] select-none'
                        : 'bg-[#0F304B] text-[#5F93C2] cursor-pointer'
                "
                @click="indexStore.setCurNumberingSystem('hex')"
                >HEX</span
            >
        </div>
        <div class="flex">
            <OutlinedButton
                v-if="
                    isBig &&
                    !['bin-in'].includes(props.w.i) &&
                    !props.isCalibration &&
                    !props.isPriorWOpen
                "
                @click="
                    $emit(
                        props.w.i === 'adc-in'
                            ? 'calibr'
                            : ['1w-sens', '1w-rom'].includes(props.w.i)
                            ? 'scan'
                            : 'init',
                    )
                "
                class="mr-2"
                >{{ btnText }}</OutlinedButton
            >
            <div
                v-if="props.isPriorWOpen"
                class="flex gap-2 items-center mr-8 text-[#148EF8]"
            >
                {{ t('scanning') }}
                <div class="spinner-box">
                    <div class="flex items-center justify-center gap-1">
                        <div
                            class="pulse-bubble-1 w-[5px] h-[5px] rounded-[50%] bg-[#4799E2]"
                        ></div>
                        <div
                            class="pulse-bubble-2 w-[5px] h-[5px] rounded-[50%] bg-[#4799E2]"
                        ></div>
                        <div
                            class="pulse-bubble-3 w-[5px] h-[5px] rounded-[50%] bg-[#4799E2]"
                        ></div>
                    </div>
                </div>
            </div>
            <PrimaryButton
                v-if="props.isCalibration || props.isPriorWOpen"
                @click="$emit('back')"
                >{{ t('btn.back') }}</PrimaryButton
            >
            <PrimaryButton
                v-else
                @click="$emit('enter')"
                >{{ isBig ? t('btn.close') : t('btn.open') }}</PrimaryButton
            >
        </div>
    </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import PrimaryButton from '@/components/Ui/PrimaryButton.vue';
import OutlinedButton from '@/components/Ui/OutlinedButton.vue';
import info from '@/assets/img/info.svg?raw';
import calibrationArrow from '@/assets/img/calibration-arrow.svg?raw';
import type { Widget } from '@/stores';

const indexStore = useIndexStore();

const { devicesState, tempUnit, curNumberingSystem, labels } = storeToRefs(indexStore);

const props = defineProps<{
    isInfoVisible: boolean;
    activeIO?: {
        index: number;
        val:
            | number
            | {
                  type?: 'hr' | 'ir' | 'coil' | 'di';
                  reg_addr: number;
                  dev_addr: number;
                  val: number;
              }
            | null;
    } | null;
    isBig?: boolean;
    w: Widget;
    isCalibration?: boolean;
    isPriorWOpen?: boolean;
    isMb?: boolean;
}>();

const activeIOVal = ref<number | null>(0);

const btnText = computed<string>(() => {
    if (['pwm-out', 'bin-out', 'int-var', 'bin-var', 'tim-var', 'mb-var'].includes(props.w.i)) {
        return t('bigWBtn.init');
    } else if (props.w.i === 'adc-in') {
        return t('bigWBtn.calibration');
    } else if (['1w-sens', '1w-rom'].includes(props.w.i)) {
        return t('bigWBtn.scan');
    } else {
        return '';
    }
});

const curLabel = computed<string | undefined>(() => {
    if (props.activeIO && labels.value[props.w.d] && labels.value) {
        const val = labels.value[props.w.d]?.find((el) => el.interf === props.w.i);
        if (val) {
            const bus = props.w.bus || 0;
            return val.val[bus][props.activeIO.index] as string;
        }
    }
    return undefined;
});

const styles = computed<string>(() => {
    if (['bin-in', 'bin-out'].includes(props.w.i)) {
        if (!props.activeIO) return '';
        return props.activeIO.val
            ? 'bg-[#074a56] text-[#00D6AF]'
            : 'border border-[#2A5D73] text-[#2A5D73]';
    } else if (['int-var', 'bin-var'].includes(props.w.i)) {
        return 'bg-[#234764] text-[#8DC5F6]';
    } else if (
        props.w.i === 'mb-var' &&
        props.activeIO &&
        props.activeIO.val &&
        typeof props.activeIO?.val === 'object'
    ) {
        return props.activeIO.val.type === 'hr' || props.activeIO.val.type === 'ir'
            ? 'bg-[#006B83] text-[#01F0FF]'
            : props.activeIO.val.val
            ? 'bg-[#176F6F] text-[#35FED0]'
            : 'bg-[#0D424D] text-[#35FED0]';
    } else {
        return 'bg-[#07435c] text-[#00b3cb]';
    }
});

onBeforeMount(() => {
    if (props.activeIO) {
        activeIOVal.value =
            typeof props.activeIO.val === 'number'
                ? (props.activeIO.val as number)
                : (props.activeIO.val?.val as number);
    }
});

watch(
    () => devicesState.value,
    () => {
        if (!props.activeIO) return;
        const newState = devicesState.value[props.w.d].find((obj) => obj.type === props.w.i)?.value;
        if (newState) {
            activeIOVal.value = newState[props.activeIO.index] as number;
        }
    },
);

const { t } = useI18n({
    messages: {
        ru: {
            btn: {
                open: 'Открыть',
                close: 'Закрыть',
                back: 'Назад',
            },
            bigWBtn: {
                init: 'Инициализация',
                calibration: 'Калибровка',
                scan: 'Сканировать',
            },
            binInInfo: {
                active: 'Активен',
                notActive: 'Не активен',
            },
            calibration: {
                level: 'Задать верхний или нижний порог',
                calibr: 'Откалибровано',
                notCalibr: 'Не откалибровано',
            },
            scanning: 'Сканирование',
            device: 'У ',
        },
        en: {
            btn: {
                open: 'Open',
                close: 'Close',
                back: 'Back',
            },
            bigWBtn: {
                init: 'Initialization',
                calibration: 'Calibration',
                scan: 'Scan',
            },
            binInInfo: {
                active: 'Active',
                notActive: 'Not active',
            },
            calibration: {
                level: 'Set min or max level',
                calibr: 'Calibrated',
                notCalibr: 'Not calibrated',
            },
            scanning: 'Scanning',
            device: 'D ',
        },
    },
});
</script>
<style scoped>
@keyframes pulse {
    from {
        opacity: 1;
        transform: scale(1);
    }
    to {
        opacity: 0.25;
        transform: scale(0.75);
    }
}

.pulse-bubble-1 {
    animation: pulse 0.5s ease 0s infinite alternate;
}
.pulse-bubble-2 {
    animation: pulse 0.5s ease 0.25s infinite alternate;
}
.pulse-bubble-3 {
    animation: pulse 0.5s ease 0.5s infinite alternate;
}
</style>
