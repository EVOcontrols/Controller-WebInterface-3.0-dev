<template>
    <div
        class="rounded group inline-flex flex-col h-full transition-spacing duration-300 relative items-center select-none"
        :class="props.isBig ? 'px-[0.06rem]' : 'py-1 hover:bg-[#113655]'"
        @mousedown.left="quickChange(props.index, $event, props.s)"
    >
        <div
            v-if="props.isCalibration"
            class="flex gap-1 flex-col items-center mb-2 calibrGroup"
        >
            <div
                class="w-1 h-1 rounded-[50%]"
                :class="
                    props.checkedArr?.find((el) => el.dir === 'max' && el.index === index)
                        ? 'bg-[#00B3CB]'
                        : 'bg-[#07435D]'
                "
            ></div>
            <span
                v-if="props.checkedArr?.find((el) => el.dir === 'max' && el.index === index)"
                v-html="check"
                class="block bg-[#074a56] rounded-[3px] p-[1px]"
            ></span>
            <span
                v-else-if="
                    props.calibratedArr?.find((el) => el.dir === 'max' && el.index === index)
                "
                class="loader"
            ></span>
            <CalibrArrow
                v-else
                class="block p-[1px] bg-[#0D2F4B] rounded-[3px] rotate-180 transition-color duration-300 hover:bg-[#06516a] cursor-pointer"
                @click="emit('calibrate', index, 'max')"
            />
        </div>
        <div
            class="flex items-end flex-1 w-1.5 mx-2 overflow-hidden relative rounded-2xl parent z-[1] peer mb-2"
            :class="[
                props.isBig && props.w.i === 'pwm-out'
                    ? 'bg-[#063a52] overflow-visible'
                    : 'bg-[#07435d]',
                { ' cursor-pointer': props.w.i === 'pwm-out' },
            ]"
        >
            <div
                v-if="!notConnected"
                class="relative w-full bg-[#00b3cb] transition-all duration-500 rounded-[18px]"
                :style="{
                    height: `${
                        props.activeIndex === props.index ? props.activeValue / 100 : props.s / 100
                    }%`,
                }"
            >
                <div
                    v-if="props.isBig && props.w.i === 'pwm-out'"
                    class="bg-[#00B3CB] absolute top-[-0.22rem] -left-[6px] w-[18px] h-[0.44rem] inline-block rounded opacity-0 transition-none"
                    :class="{
                        'opacity-100': props.activeIndex === props.index,
                        'group-hover:opacity-100': props.activeIndex === null,
                    }"
                    @mousedown.stop="startChange(props.index, $event, props.s)"
                ></div>
            </div>
        </div>
        <div
            v-if="props.isCalibration"
            class="flex gap-1 flex-col items-center mb-[6px]"
        >
            <span
                v-if="props.checkedArr?.find((el) => el.dir === 'min' && el.index === index)"
                v-html="check"
                class="block bg-[#074a56] rounded-[3px] p-[1px]"
            ></span>
            <span
                v-else-if="
                    props.calibratedArr?.find((el) => el.dir === 'min' && el.index === index)
                "
                class="loader"
            ></span>
            <CalibrArrow
                v-else
                class="block p-[1px] bg-[#0D2F4B] rounded-[3px] transition-color duration-300 hover:bg-[#06516a] cursor-pointer"
                @click="emit('calibrate', index, 'min')"
            />
            <div
                class="w-1 h-1 rounded-[50%]"
                :class="
                    props.checkedArr?.find((el) => el.dir === 'min' && el.index === index)
                        ? 'bg-[#00B3CB]'
                        : 'bg-[#07435D]'
                "
            ></div>
        </div>
        <div
            class="text-0.81 font-medium text-center leading-none select-none"
            :class="notConnected ? 'text-[#3E688E]' : 'text-[#6CB5D3]'"
        >
            {{ props.index + 1 }}
        </div>
    </div>
</template>
<script setup lang="ts">
import type { Widget } from '@/stores';
import CalibrArrow from '@/assets/CalibrArrow.vue';
import check from '@/assets/img/check.svg?raw';

const props = defineProps<{
    w: Widget;
    isBig?: boolean;
    index: number;
    activeIndex: number | null;
    activeValue: number;
    s: number;
    isCalibration?: boolean;
    checkedArr?: { index: number; dir: 'min' | 'max' }[];
    calibratedArr?: { index: number; dir: 'min' | 'max' }[];
}>();

const emit = defineEmits<{
    (e: 'changeActiveIndex', index: number): void;
    (e: 'changeMouseOffset', val: number): void;
    (e: 'changeRange', yBottom: number, yTop: number, height: number): void;
    (e: 'changeValue', ev: MouseEvent): void;
    (e: 'stopChange'): void;
    (e: 'setValue', val: number, index: number): void;
    (e: 'setActiveValue', val: number): void;
    (e: 'calibrate', index: number, dir: 'min' | 'max'): void;
}>();

const indexStore = useIndexStore();

const { notConnected } = storeToRefs(indexStore);

function changeValue(e: MouseEvent) {
    emit('changeValue', e);
}

function quickChange(index: number, e: MouseEvent, currentState: number | null) {
    if (props.isBig && props.w.i === 'pwm-out') {
        const target = e.target as Element;
        const parent = target.closest('.parent');
        if (!parent) return;
        emit('changeActiveIndex', index);
        emit('changeMouseOffset', 0);
        const boundingRect = parent.getBoundingClientRect();
        emit(
            'changeRange',
            boundingRect.y + boundingRect.height,
            boundingRect.y,
            boundingRect.height,
        );
        emit('changeValue', e);
        document.addEventListener('mousemove', changeValue);
        document.addEventListener(
            'mouseup',
            () => {
                document.removeEventListener('mousemove', changeValue);
                emit('stopChange');
            },
            { once: true },
        );
    } else if (props.w.i === 'pwm-out') {
        emit('setValue', currentState === 0 ? 10000 : 0, props.index);
    }
}

function startChange(index: number, e: MouseEvent, s: number) {
    emit('setActiveValue', s);
    if (!e.target) return;
    const target = e.target as HTMLElement;
    const { offsetY } = e;
    const { clientHeight } = target;
    emit('changeMouseOffset', offsetY - clientHeight / 2);
    emit('changeActiveIndex', index);
    const parent = target.closest('.parent');
    if (!parent) return;
    const boundingRect = parent.getBoundingClientRect();
    emit('changeRange', boundingRect.y + boundingRect.height, boundingRect.y, boundingRect.height);
    document.addEventListener('mousemove', changeValue);
    document.addEventListener(
        'mouseup',
        () => {
            document.removeEventListener('mousemove', changeValue);
            emit('stopChange');
        },
        { once: true },
    );
}
</script>
