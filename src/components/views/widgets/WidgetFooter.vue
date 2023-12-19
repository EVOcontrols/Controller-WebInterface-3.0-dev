<template>
    <div
        v-if="props.activeIO"
        class="h-[3.125rem] border-t border-[#1D4162] px-4 flex items-center justify-between"
    >
        <div class="text-[#8DC5F6] flex items-center gap-2">
            <span
                class="block text-center rounded-[6px] p-[6px] min-w-[26px]"
                :class="styles"
                >{{ props.activeIO.index + 1 }}</span
            >
            label
        </div>
        <span
            class="rounded p-[6px]"
            :class="styles"
            v-if="!['bin-in', 'bin-out', 'int-var', 'bin-var', 'tim-var'].includes(props.w.i)"
            >{{ activeIOVal ? activeIOVal / 100 : '0' }}%</span
        >
        <span
            class="rounded p-[6px]"
            :class="styles"
            v-else-if="['int-var'].includes(props.w.i)"
            >{{ props.activeIO.val === null ? '-' : props.activeIO.val }}</span
        >
    </div>
    <div
        v-else
        class="h-[3.125rem] border-t border-[#1D4162] px-4 flex items-center"
        :class="props.isInfoVisible || props.isCalibration ? 'justify-between' : 'justify-end'"
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
        <div class="flex">
            <OutlinedButton
                v-if="isBig && !['bin-in'].includes(props.w.i) && !props.isCalibration"
                @click="$emit(props.w.i === 'adc-in' ? 'calibr' : 'init')"
                class="mr-2"
                >{{ btnText }}</OutlinedButton
            >
            <PrimaryButton
                v-if="$props.isCalibration"
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

const { devicesState } = storeToRefs(indexStore);

const props = defineProps<{
    isInfoVisible: boolean;
    activeIO?: { index: number; val: number | null } | null;
    isBig?: boolean;
    w: Widget;
    isCalibration?: boolean;
}>();

const activeIOVal = ref<number | null>(0);

const btnText = computed<string>(() => {
    if (['pwm-out', 'bin-out', 'int-var', 'bin-var', 'tim-var'].includes(props.w.i)) {
        return t('bigWBtn.init');
    } else if (props.w.i === 'adc-in') {
        return t('bigWBtn.calibration');
    } else {
        return '';
    }
});

const styles = computed<string>(() => {
    if (['bin-in', 'bin-out'].includes(props.w.i)) {
        if (!props.activeIO) return '';
        return props.activeIO.val
            ? 'bg-[#074a56] text-[#00D6AF]'
            : 'border border-[#2A5D73] text-[#2A5D73]';
    } else if (['int-var', 'bin-var'].includes(props.w.i)) {
        return 'bg-[#234764] text-[#8DC5F6]';
    } else {
        return 'bg-[#07435c] text-[#00b3cb]';
    }
});

onBeforeMount(() => {
    if (props.activeIO) {
        activeIOVal.value = props.activeIO.val;
    }
});

watch(
    () => devicesState.value,
    () => {
        if (!props.activeIO) return;
        const newState = devicesState.value
            .find((obj) => obj.device === props.w.d)
            ?.interfVal.find((obj) => obj.type === props.w.i)?.value;
        if (newState) {
            activeIOVal.value = newState[props.activeIO.index];
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
        },
    },
});
</script>
