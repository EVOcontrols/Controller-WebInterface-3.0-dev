<template>
    <div class="flex-1 relative w-full overflow-hidden">
        <div
            v-if="showDeviceLabel"
            class="absolute bg-[#1B4569] rounded-[6px] h-10 px-3 top-[41px] flex items-center z-[1]"
            :style="[{ width: 'fit-content' }, { left: deviceLabelLeft + 'px' }]"
        >
            Название устройства на 32 символа
        </div>
        <div
            class="relative h-[45px] flex items-center px-3 font-medium w-full overflow-hidden border-b-[2px] border-[#1D4162]"
        >
            <div class="flex whitespace-nowrap w-full flex-none">
                <div class="flex flex-1 overflow-hidden w-full flex-none">
                    <ArrowIcon
                        v-if="!isStartScrollEl"
                        class="absolute top-[50%] translate-y-[-50%] rotate-180 left-[6px] cursor-pointer"
                        :class="{ disabled: notConnected }"
                        @click="handleArrowClick('toStart')"
                    />
                    <div class="flex overflow-x-hidden ml-2 bg-113 pl-2 pr-1 rounded-l-lg w-full">
                        <div
                            v-dragscroll.x
                            v-on:dragscrollmove="handleScrollMove"
                            class="flex items-center overflow-x-auto no-scrollbar w-full flex-none"
                            ref="scrollWrapper"
                        >
                            <div
                                class="flex items-center flex-none"
                                ref="scrollEl"
                            >
                                <div
                                    v-for="device in curDevs"
                                    :key="device"
                                    class="device h-6 min-w-[4rem] flex items-center mr-[6px] rounded text-0.81 font-roboto text-[#ADEBFF] cursor-pointer transition-all duration-300 justify-center select-none"
                                    :class="
                                        curChoosenDevs.includes(device)
                                            ? 'bg-[#148ef8]'
                                            : 'bg-[#1B4569] hover:bg-[#143959]'
                                    "
                                    @mousedown="mousedown"
                                    @mouseup="mouseup(device, $event)"
                                    @mouseenter="(e) => handleDeviceEnter(device, e as MouseEvent)"
                                    @mouseleave="handleDeviceLeave"
                                >
                                    {{ device }}
                                </div>
                            </div>
                        </div>
                    </div>
                    <ArrowIcon
                        v-if="!isEndScrollEl"
                        class="h-full cursor-pointer mr-[6px]"
                        :class="{ disabled: notConnected }"
                        @click="handleArrowClick('toEnd')"
                    />
                    <div class="flex gap-[6px] mr-[18px] ml-[6px]">
                        <AddIcon
                            class="cursor-pointer w-[50px] h-6 rounded-[3px] border border-[#148EF8] py-1 active:bg-[#148EF8]"
                            :class="{ disabled: notConnected }"
                        />
                        <UpdateIcon
                            class="cursor-pointer w-[50px] h-6 rounded-[3px] border border-[#148EF8] py-1 active:bg-[#148EF8]"
                            :class="{ disabled: notConnected }"
                        />
                    </div>
                </div>
            </div>
        </div>
        <div class="w-full h-full flex">
            <div class="w-[58%] h-full">
                <div class="flex overflow-y-hidden rounded-l-lg w-full">
                    <div
                        v-dragscroll.y
                        class="flex overflow-y-auto w-full scrollbar-4 flex-1 flex-col"
                        :style="{ height: 'calc(100vh - 460px)' }"
                    >
                        <div class="flex flex-col items-center flex-none w-full">
                            <div
                                class="w-full h-[50px] border-y border-[#1D4162] text-sm pl-5 pt-5 sticky top-0 bg-[#092740]"
                            >
                                Discrete inputs
                            </div>
                            <div
                                class="w-full flex text-[#6CB5D3] items-center transition-colors duration-500 select-none pt-5 flex flex-col"
                                v-for="(s, index) in diArr"
                                :key="index"
                            >
                                <div class="w-full h-[25px] text-sm flex text-[13px] gap-2">
                                    <div
                                        class="bg-[#1B4569] h-full min-w-[44px] px-[10px] pt-1 rounded-r flex justify-center text-[#8DC5F6]"
                                    >
                                        {{ s.dev }}
                                    </div>
                                    <div class="text-[#ADEBFF] pt-1">
                                        Пользовательское название устройства
                                    </div>
                                </div>
                                <div class="w-full flex mt-3 mb-[18px] gap-1 px-[18px]">
                                    <div
                                        class="w-[90px] h-10 flex items-center justify-between text-[#35FED0] text-xs rounded px-[6px]"
                                        :class="el.val ? 'bg-[#176F6F]' : 'bg-[#0D424D]'"
                                        v-for="(el, i) in s.vals"
                                        :key="i"
                                    >
                                        <span>RO</span>
                                        <span>{{
                                            curNumberingSystem === 'dec'
                                                ? el.reg_addr
                                                : el.reg_addr.toString(16)
                                        }}</span>
                                    </div>
                                    <AddIcon
                                        class="cursor-pointer w-[90px] h-10 rounded-[3px] border border-[#148EF8] py-[10px] active:bg-[#148EF8]"
                                        :class="{ disabled: notConnected }"
                                    />
                                </div>
                            </div>
                        </div>
                        <div class="flex flex-col items-center flex-none w-full">
                            <div
                                class="w-full h-[50px] border-y border-[#1D4162] text-sm pl-5 pt-5 sticky top-0 bg-[#092740]"
                            >
                                Coils
                            </div>
                            <div
                                class="w-full flex text-[#6CB5D3] items-center transition-colors duration-500 select-none pt-5 flex flex-col"
                                v-for="(s, index) in coilArr"
                                :key="index"
                            >
                                <div class="w-full h-[25px] text-sm flex text-[13px] gap-2">
                                    <div
                                        class="bg-[#1B4569] h-full min-w-[44px] px-[10px] pt-1 rounded-r flex justify-center text-[#8DC5F6]"
                                    >
                                        {{ s.dev }}
                                    </div>
                                    <div class="text-[#ADEBFF] pt-1">
                                        Пользовательское название устройства
                                    </div>
                                </div>
                                <div class="w-full flex mt-3 mb-[18px] gap-1 px-[18px]">
                                    <div
                                        class="w-[90px] h-10 flex items-center justify-between text-[#35FED0] text-xs rounded px-[6px]"
                                        :class="el.val ? 'bg-[#176F6F]' : 'bg-[#0D424D]'"
                                        v-for="(el, i) in s.vals"
                                        :key="i"
                                    >
                                        <div class="flex flex-col justify-end gap-[6px]">
                                            <div class="h-[12px]"></div>
                                            <div class="h-[12px]">RW</div>
                                        </div>
                                        <div class="flex flex-col items-end justify-end gap-[6px]">
                                            <div class="h-[12px] text-[#97FFE7]">
                                                {{ el.val ? t('on') : t('off') }}
                                            </div>
                                            <div class="h-[12px]">
                                                {{
                                                    curNumberingSystem === 'dec'
                                                        ? el.reg_addr
                                                        : el.reg_addr.toString(16)
                                                }}
                                            </div>
                                        </div>
                                    </div>
                                    <AddIcon
                                        class="cursor-pointer w-[90px] h-10 rounded-[3px] border border-[#148EF8] py-[10px] active:bg-[#148EF8]"
                                        :class="{ disabled: notConnected }"
                                    />
                                </div>
                            </div>
                        </div>
                        <div class="flex flex-col items-center flex-none w-full">
                            <div
                                class="w-full h-[50px] border-y border-[#1D4162] text-sm pl-5 pt-5 sticky top-0 bg-[#092740]"
                            >
                                Input registers
                            </div>
                            <div
                                class="w-full flex text-[#6CB5D3] items-center transition-colors duration-500 select-none pt-5 flex flex-col"
                                v-for="(s, index) in irArr"
                                :key="index"
                            >
                                <div class="w-full h-[25px] text-sm flex text-[13px] gap-2">
                                    <div
                                        class="bg-[#1B4569] h-full min-w-[44px] px-[10px] pt-1 rounded-r flex justify-center text-[#8DC5F6]"
                                    >
                                        {{ s.dev }}
                                    </div>
                                    <div class="text-[#ADEBFF] pt-1">
                                        Пользовательское название устройства
                                    </div>
                                </div>
                                <div class="w-full flex mt-3 mb-[18px] gap-1 px-[18px]">
                                    <div
                                        class="w-[90px] h-10 flex items-center justify-between text-[#35FED0] text-xs rounded px-[6px] bg-[#006B83]"
                                        v-for="(el, i) in s.vals"
                                        :key="i"
                                    >
                                        <div class="flex flex-col justify-end gap-[6px]">
                                            <div class="h-[12px]"></div>
                                            <div class="h-[12px] text-[#01F0FF]">RO</div>
                                        </div>
                                        <div class="flex flex-col items-end justify-end gap-[6px]">
                                            <div class="h-[12px] text-[#9BE7FF]">
                                                {{
                                                    curNumberingSystem === 'dec'
                                                        ? el.val
                                                        : el.val.toString(16)
                                                }}
                                            </div>
                                            <div class="h-[12px] text-[#01F0FF]">
                                                {{
                                                    curNumberingSystem === 'dec'
                                                        ? el.reg_addr
                                                        : el.reg_addr.toString(16)
                                                }}
                                            </div>
                                        </div>
                                    </div>
                                    <AddIcon
                                        class="cursor-pointer w-[90px] h-10 rounded-[3px] border border-[#148EF8] py-[10px] active:bg-[#148EF8]"
                                        :class="{ disabled: notConnected }"
                                    />
                                </div>
                            </div>
                        </div>
                        <div class="flex flex-col items-center flex-none w-full">
                            <div
                                class="w-full h-[50px] border-y border-[#1D4162] text-sm pl-5 pt-5 sticky top-0 bg-[#092740]"
                            >
                                Holding registers
                            </div>
                            <div
                                class="w-full flex text-[#6CB5D3] items-center transition-colors duration-500 select-none pt-5 flex flex-col"
                                v-for="(s, index) in hrArr"
                                :key="index"
                            >
                                <div class="w-full h-[25px] text-sm flex text-[13px] gap-2">
                                    <div
                                        class="bg-[#1B4569] h-full min-w-[44px] px-[10px] pt-1 rounded-r flex justify-center text-[#8DC5F6]"
                                    >
                                        {{ s.dev }}
                                    </div>
                                    <div class="text-[#ADEBFF] pt-1">
                                        Пользовательское название устройства
                                    </div>
                                </div>
                                <div class="w-full flex mt-3 mb-[18px] gap-1 px-[18px]">
                                    <div
                                        class="w-[90px] h-10 flex items-center justify-between text-[#35FED0] text-xs rounded px-[6px] bg-[#006B83]"
                                        v-for="(el, i) in s.vals"
                                        :key="i"
                                    >
                                        <div class="flex flex-col justify-end gap-[6px]">
                                            <div class="h-[12px]"></div>
                                            <div class="h-[12px] text-[#01F0FF]">RW</div>
                                        </div>
                                        <div class="flex flex-col items-end justify-end gap-[6px]">
                                            <div class="h-[12px] text-[#9BE7FF]">
                                                {{
                                                    curNumberingSystem === 'dec'
                                                        ? el.val
                                                        : el.val.toString(16)
                                                }}
                                            </div>
                                            <div class="h-[12px] text-[#01F0FF]">
                                                {{
                                                    curNumberingSystem === 'dec'
                                                        ? el.reg_addr
                                                        : el.reg_addr.toString(16)
                                                }}
                                            </div>
                                        </div>
                                    </div>
                                    <AddIcon
                                        class="cursor-pointer w-[90px] h-10 rounded-[3px] border border-[#148EF8] py-[10px] active:bg-[#148EF8]"
                                        :class="{ disabled: notConnected }"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="w-[42%] h-full border-l border-[#1D4162]"></div>
        </div>
    </div>
</template>
<script lang="ts" setup>
import ArrowIcon from '@/assets/ArrowIcon.vue';
import AddIcon from '@/assets/AddIcon.vue';
import UpdateIcon from '@/assets/UpdateIcon.vue';
import type { Widget } from '@/stores';

const indexStore = useIndexStore();

const { curNumberingSystem, devicesState, notConnected, choosenMbDevices } =
    storeToRefs(indexStore);

const api = indexStore.getApi().api;

const isAborted = indexStore.getApi().isAborted;

let getMbInfoTimer: ReturnType<typeof setTimeout> | undefined;

const isStartScrollEl = ref(true);

const isEndScrollEl = ref(false);

const scrollWrapper = ref<HTMLElement | undefined>();

const scrollEl = ref<HTMLElement | undefined>();

const curChoosenDevs = ref<number[]>([]);

const showDeviceLabel = ref(false);

const deviceLabelLeft = ref(28);

const mouseupX = ref<number>(0);

const props = defineProps<{
    w: { w: Widget; state: number[] };
}>();

const state = ref<number[]>([...props.w.state]);

const fullState = ref<
    { type?: 'hr' | 'ir' | 'coil' | 'di'; reg_addr: number; dev_addr: number; val: number }[]
>([]);

const curState = computed<
    { type?: 'hr' | 'ir' | 'coil' | 'di'; reg_addr: number; dev_addr: number; val: number }[] | []
>(() => {
    return fullState.value.filter((el) => el.val !== null);
});

const diArr = computed<
    | {
          dev: number;
          vals: { type: 'di'; reg_addr: number; dev_addr: number; val: number }[];
      }[]
    | []
>(() => {
    const arr = curState.value.filter(
        (el) => el.type === 'di' && curChoosenDevs.value.includes(el.dev_addr),
    ) as {
        type: 'di';
        reg_addr: number;
        dev_addr: number;
        val: number;
    }[];
    const res: {
        dev: number;
        vals: { type: 'di'; reg_addr: number; dev_addr: number; val: number }[];
    }[] = [];
    arr.forEach((el) => {
        const index = res.findIndex((elem) => elem.dev === el.dev_addr);
        if (index !== -1) {
            res[index].vals.push(el);
        } else {
            res.push({ dev: el.dev_addr, vals: [el] });
        }
    });
    return res.sort((a, b) => a.dev - b.dev);
});

const coilArr = computed<
    | {
          dev: number;
          vals: { type: 'coil'; reg_addr: number; dev_addr: number; val: number }[];
      }[]
    | []
>(() => {
    const arr = curState.value.filter(
        (el) => el.type === 'coil' && curChoosenDevs.value.includes(el.dev_addr),
    ) as {
        type: 'coil';
        reg_addr: number;
        dev_addr: number;
        val: number;
    }[];
    const res: {
        dev: number;
        vals: { type: 'coil'; reg_addr: number; dev_addr: number; val: number }[];
    }[] = [];
    arr.forEach((el) => {
        const index = res.findIndex((elem) => elem.dev === el.dev_addr);
        if (index !== -1) {
            res[index].vals.push(el);
        } else {
            res.push({ dev: el.dev_addr, vals: [el] });
        }
    });
    return res.sort((a, b) => a.dev - b.dev);
});

const irArr = computed<
    | {
          dev: number;
          vals: { type: 'ir'; reg_addr: number; dev_addr: number; val: number }[];
      }[]
    | []
>(() => {
    const arr = curState.value.filter(
        (el) => el.type === 'ir' && curChoosenDevs.value.includes(el.dev_addr),
    ) as {
        type: 'ir';
        reg_addr: number;
        dev_addr: number;
        val: number;
    }[];
    const res: {
        dev: number;
        vals: { type: 'ir'; reg_addr: number; dev_addr: number; val: number }[];
    }[] = [];
    arr.forEach((el) => {
        const index = res.findIndex((elem) => elem.dev === el.dev_addr);
        if (index !== -1) {
            res[index].vals.push(el);
        } else {
            res.push({ dev: el.dev_addr, vals: [el] });
        }
    });
    return res.sort((a, b) => a.dev - b.dev);
});

const hrArr = computed<
    | {
          dev: number;
          vals: { type: 'hr'; reg_addr: number; dev_addr: number; val: number }[];
      }[]
    | []
>(() => {
    const arr = curState.value.filter(
        (el) => el.type === 'hr' && curChoosenDevs.value.includes(el.dev_addr),
    ) as {
        type: 'hr';
        reg_addr: number;
        dev_addr: number;
        val: number;
    }[];
    const res: {
        dev: number;
        vals: { type: 'hr'; reg_addr: number; dev_addr: number; val: number }[];
    }[] = [];
    arr.forEach((el) => {
        const index = res.findIndex((elem) => elem.dev === el.dev_addr);
        if (index !== -1) {
            res[index].vals.push(el);
        } else {
            res.push({ dev: el.dev_addr, vals: [el] });
        }
    });
    return res.sort((a, b) => a.dev - b.dev);
});

const curDevs = computed<number[]>(() => {
    return [...new Set(curState.value.map((el) => el.dev_addr))].sort((a, b) => a - b);
});

async function getMbInfo() {
    try {
        const r = await api.post('get_mb_info', {
            device: props.w.w.d,
            bus: 0,
        });
        const data = (await r.data) as {
            type: ['hr' | 'di' | 'coil' | 'ir'];
            dev_addr: number[];
            reg_addr: number[];
        };
        const arr = [];
        for (let i = 0; i < state.value.length; i += 1) {
            arr.push({
                type: data.type[i],
                reg_addr: data.reg_addr[i] as number,
                dev_addr: data.dev_addr[i] as number,
                val: state.value[i],
            });
        }
        fullState.value = [...arr];
    } catch (error) {
        if (isAborted.value) {
            return;
        }
        return new Promise((resolve) =>
            setTimeout(() => {
                getMbInfo();
            }, 5),
        );
    }
    getMbInfoTimer = setTimeout(getMbInfo, 3000);
}

function handleArrowClick(direction: 'toStart' | 'toEnd') {
    const el = scrollEl.value;
    const wrapper = scrollWrapper.value;
    if (!el || !wrapper) return;
    if (direction === 'toStart') {
        wrapper.scrollTo({ left: wrapper.scrollLeft - wrapper.offsetWidth, behavior: 'smooth' });
        isStartScrollEl.value = wrapper.scrollLeft - wrapper.offsetWidth < 20;
        isEndScrollEl.value = false;
    } else {
        wrapper.scrollTo({ left: wrapper.scrollLeft + wrapper.offsetWidth, behavior: 'smooth' });
        isStartScrollEl.value = false;
        isEndScrollEl.value =
            wrapper.scrollWidth - wrapper.offsetWidth - 20 <=
            wrapper.scrollLeft + wrapper.offsetWidth;
    }
}

function handleScrollMove() {
    const wrapper = scrollWrapper.value;
    const el = scrollEl.value;
    if (!el || !wrapper || wrapper.offsetWidth === el.offsetWidth) return;
    isStartScrollEl.value = wrapper.scrollLeft < 20 ? true : false;
    isEndScrollEl.value =
        Math.round(wrapper.scrollLeft) > el.offsetWidth - wrapper.offsetWidth - 20 ? true : false;
}

function mousedown(e: MouseEvent) {
    mouseupX.value = e.screenX;
}

function mouseup(d: number, e: MouseEvent) {
    if (mouseupX.value) {
        if (Math.abs(e.screenX - mouseupX.value) < 20) {
            const prevArr = [...curChoosenDevs.value];
            const index = prevArr.findIndex((el) => el === d);
            if (index !== -1) {
                prevArr.splice(index, 1);
            } else {
                prevArr.push(d);
            }
            curChoosenDevs.value = [...prevArr].sort((a, b) => a - b);
            indexStore.setChoosenMbDevices(props.w.w.d, curChoosenDevs.value);
        }
        mouseupX.value = 0;
    }
}

function handleDeviceEnter(d: number, e: MouseEvent) {
    showDeviceLabel.value = true;
    const target = e.target as HTMLElement;
    const parent = target.parentElement?.parentElement as HTMLElement;
    if (target && parent) {
        deviceLabelLeft.value = target.offsetLeft - parent.offsetLeft - parent.scrollLeft + 28;
    }
}

function handleDeviceLeave() {
    showDeviceLabel.value = false;
}

watch(
    () => devicesState.value,
    () => {
        const newState = devicesState.value[props.w.w.d].find((obj) => obj.type === props.w.w.i)
            ?.value as number[];
        state.value = newState ? newState : [...props.w.state];
    },
);

watch(
    () => curDevs.value,
    () => {
        if (choosenMbDevices.value[props.w.w.d] === undefined) {
            curChoosenDevs.value = curDevs.value;
            indexStore.setChoosenMbDevices(props.w.w.d, curChoosenDevs.value);
        }
    },
);

onMounted(() => {
    getMbInfo();
    const wrapper = scrollWrapper.value;
    const el = scrollEl.value;
    if (!wrapper || !el) return;
    isEndScrollEl.value = !(wrapper.offsetWidth <= el.offsetWidth);
    if (choosenMbDevices.value[props.w.w.d])
        curChoosenDevs.value = choosenMbDevices.value[props.w.w.d];
});

onBeforeUnmount(() => {
    clearTimeout(getMbInfoTimer);
    getMbInfoTimer = undefined;
});

const { t } = useI18n({
    messages: {
        ru: {
            noObj: 'Объекты отсутствуют',
            on: 'ВКЛ',
            off: 'ВЫКЛ',
        },
        en: {
            noObj: 'Objects disabled',
            on: 'ON',
            off: 'OFF',
        },
    },
});
</script>
