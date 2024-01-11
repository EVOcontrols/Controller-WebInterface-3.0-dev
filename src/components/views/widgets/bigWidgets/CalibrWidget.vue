<template>
    <div class="flex-1 flex">
        <ShimStates
            :w="props.w"
            :isBig="true"
            :isCalibration="true"
            :calibratedArr="calibratedArr"
            :checkedArr="checkedArr"
            @calibrate="handleCalibrate"
        />
        <div
            class="relative border-l border-[#1D4162]"
            :style="{ width: 'calc(100% - 422px)' }"
        >
            <div class="flex overflow-y-hidden pl-2 rounded-l-lg w-full">
                <div
                    v-dragscroll.y
                    class="flex overflow-y-auto w-full scrollbar-4 flex-1"
                    :style="{ height: 'calc(100vh - 410px)' }"
                >
                    <div
                        class="flex flex-col items-center flex-none pt-[10px] px-2 w-full pb-[10px]"
                    >
                        <div
                            class="label w-full flex text-[#6CB5D3] items-center transition-colors duration-500 rounded select-none gap-2 min-h-[30px] hover:bg-[#0C2F4D]"
                            v-for="(s, index) in props.w.state"
                            :key="index"
                        >
                            <span class="w-[22px] text-end">{{ index + 1 }}</span>
                            <span class="flex-1"> label </span>
                            <div class="w-1 text-[#ADEBFF] text-end mr-[10px] flex flex-col gap-1">
                                <div
                                    class="w-1 h-1 rounded-[50%]"
                                    :class="
                                        checkedArr?.find(
                                            (el) => el.dir === 'max' && el.index === index,
                                        )
                                            ? 'bg-[#00B3CB]'
                                            : 'bg-[#07435D]'
                                    "
                                ></div>
                                <div
                                    class="w-1 h-1 rounded-[50%]"
                                    :class="
                                        checkedArr?.find(
                                            (el) => el.dir === 'min' && el.index === index,
                                        )
                                            ? 'bg-[#00B3CB]'
                                            : 'bg-[#07435D]'
                                    "
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import type { Widget } from '@/stores';
import ShimStates from '@/components/views/widgets/states/ShimStates.vue';

const indexStore = useIndexStore();

const api = indexStore.getApi().api;

const isAborted = indexStore.getApi().isAborted;

const { calibrVals } = storeToRefs(indexStore);

const calibratedArr = ref<{ index: number; dir: 'min' | 'max' }[]>([]);

const checkedArr = ref<{ index: number; dir: 'min' | 'max' }[]>([]);

const props = defineProps<{
    w: { w: Widget; state: number[] };
}>();

function handleCalibrate(index: number, dir: 'min' | 'max') {
    calibratedArr.value = [...calibratedArr.value, { index: index, dir: dir }];
    getValue(props.w.w.d, index, dir);
}

async function getValue(d: number, index: number, dir: 'min' | 'max') {
    try {
        const r = await api.post('calibr_adc_in', {
            device: d,
            index: index,
        });
        const val = await r.data.value;
        setValue(index, dir, val);
    } catch (error) {
        if (isAborted.value) {
            return;
        }
        setTimeout(() => {
            getValue(d, index, dir);
        }, 20);
    }
}

async function setValue(index: number, dir: 'min' | 'max', val: number) {
    try {
        const vals = dir === 'min' ? calibrVals.value[0] : calibrVals.value[1];
        vals[index] = val;
        const reqObj =
            dir === 'min'
                ? {
                      'adc-in': {
                          'clbr-min': vals,
                      },
                  }
                : {
                      'adc-in': {
                          'clbr-max': vals,
                      },
                  };
        const r = await api.post('set_config', reqObj);
        if (r.data.status === 'ok') {
            const arr = [...calibratedArr.value].filter(
                (el) => !(el.index === index && el.dir === dir),
            );
            calibratedArr.value = [...arr];
            checkedArr.value = [...checkedArr.value, { index: index, dir: dir }];
            return new Promise((resolve) =>
                setTimeout(() => {
                    const arr = [...checkedArr.value].filter(
                        (el) => !(el.index === index && el.dir === dir),
                    );
                    checkedArr.value = [...arr];
                }, 3000),
            );
        }
    } catch (error) {
        if (isAborted.value) {
            return;
        }
        setTimeout(() => {
            setValue(index, dir, val);
        }, 20);
    }
}
</script>
