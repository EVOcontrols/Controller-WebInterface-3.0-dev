<template>
    <div class="overflow-y-hidden flex-1">
        <div
            v-dragscroll.y
            class="w-full flex-1 scrollbar-4 relative"
            :class="{ 'overflow-y-auto': props.items.length }"
            :style="[{ 'max-height': 'calc(100vh - 296px)' }, { height: 'calc(100vh - 296px)' }]"
            ref="scrollWrapper"
            @scroll="handleScroll"
        >
            <div
                v-if="props.items.length"
                class="bg-[#092740] rounded-[6px] overflow-hidden"
                :style="{ 'min-height': 'calc(100% - 32px)' }"
                ref="scrollEl"
            >
                <Algoritm
                    v-for="(item, i) in props.items"
                    :key="i"
                    :item="item"
                    :checked="
                        props.checkedArr.includes(props.items[i + props.page * funcsNumberPerPage])
                    "
                    :index="i + props.page * funcsNumberPerPage"
                    :isActive="
                        !!(activeLabel && activeLabel.i === i + props.page * funcsNumberPerPage)
                    "
                    :isOpen="openedAlgoritms.includes(i)"
                    :device="props.device"
                    :curAction="props.curAction"
                    @selectAlgoritm="
                        (value: boolean) => {
                            selectAlgoritm(value, props.items[i + props.page * funcsNumberPerPage]);
                        }
                    "
                    @deleteAlgoritm="
                        () => {
                            deleteAlgoritm(
                                [props.items[i + props.page * funcsNumberPerPage]],
                                i + props.page * funcsNumberPerPage,
                            );
                        }
                    "
                    @dblclick.stop="
                        (e: Event) => {
                            handleDblClick(i, e);
                        }
                    "
                    @oneClick="handleClick(i)"
                    @addAlgoritm="emit('addAlgoritm', i)"
                    @creatingFinish="emit('creatingFinish', i)"
                />
            </div>
            <div
                v-else
                class="bg-[#092740] rounded-[6px] h-full flex items-center justify-center"
            >
                <span
                    v-html="spinner"
                    class="self-center mb-4 [&>svg]:w-[5rem] [&>svg>path]:fill-[#148ef8]"
                ></span>
            </div>
            <div class="w-full !h-8 bg-[#10375A]"></div>
        </div>
        <transition name="label">
            <div
                v-if="activeLabel"
                class="h-[4.25rem] absolute left-0 bg-[#163E61] rounded-r-[16px] shadow-[0_0_13px_0_#153149] p-4 flex"
                :style="[{ width: 'calc(100% + 12px)' }, { top: activeLabelTop + 'px' }]"
                @click.stop
            >
                <div class="flex w-full h-9 items-center">
                    <span
                        class="select-none w-10 h-full flex items-center justify-center rounded-l-[8px] bg-[#1d5377] px-[6px] transition-colors duration-300 text-[#42CBF6]"
                        >{{ activeLabel.i + 1 }}</span
                    >
                    <input
                        type="text"
                        :placeholder="t('placeholder')"
                        :value="activeLabel.label"
                        :maxlength="32"
                        class="flex-1 bg-[#1F4669] h-full text-[#8DC5F6] px-3 placeholder:text-[#8DC5F6] rounded-r-[8px]"
                        @input="(e) => handleLabelInput(e as InputEvent)"
                    />
                </div>
            </div>
        </transition>
    </div>
</template>

<script lang="ts" setup>
import Algoritm from '@/components/views/customAlgoritms/Algoritm.vue';
import spinner from '@/assets/img/spinner-inside-button.svg?raw';
import type { Device } from '@/stores';

const funcsStore = useFuncsStore();

const { funcsNumberPerPage } = storeToRefs(funcsStore);

const props = defineProps<{
    items: Algoritm[];
    checkedArr: Algoritm[];
    page: number;
    device?: Device;
    curAction:
        | { label: 'triggers'; val: 'udf-trig' }
        | { label: 'conditions'; val: 'udf-cond' }
        | { label: 'actions'; val: 'udf-act' }
        | { label: 'transformations'; val: 'udf-trans' };
}>();

const emit = defineEmits<{
    (e: 'selectAlgoritm', value: boolean, index: Algoritm): void;
    (e: 'deleteAlgoritm', indexes: Algoritm[], index: number): void;
    (e: 'addAlgoritm', index: number): void;
    (e: 'creatingFinish', index: number): void;
}>();

const scrollWrapper = ref<HTMLElement | undefined>();
const activeLabel = ref<{ label: string; i: number }>();
const activeLabelTop = ref(86);
const scrollEl = ref<HTMLElement | undefined>();
const scrollTop = ref<number>(0);
const isScrolling = ref(false);
const isNotMainScrolling = ref(false);
const openedAlgoritms = ref<number[]>([]);
const clickTimeout = ref<number | null>(null);

type Algoritm = { val: 0 | 1 | null; label: string; isCreating?: boolean };

function selectAlgoritm(value: boolean, index: Algoritm) {
    emit('selectAlgoritm', value, index);
}

function deleteAlgoritm(indexes: Algoritm[], index: number) {
    emit('deleteAlgoritm', indexes, index);
}

function handleDblClick(index: number, e: Event) {
    const target = e.target as HTMLElement;
    if (target.closest('.modal')) return;
    setActiveLabel(index);
    setActiveLabelTop();
    window.addEventListener('click', saveData);
    window.addEventListener('keypress', saveData);
}

function handleClick(i: number) {
    if (clickTimeout.value) {
        clearTimeout(clickTimeout.value);
        clickTimeout.value = null;
    } else {
        clickTimeout.value = setTimeout(() => {
            if (openedAlgoritms.value.includes(i)) {
                openedAlgoritms.value = openedAlgoritms.value.filter((el) => el !== i);
            } else {
                openedAlgoritms.value.push(i);
            }
            clickTimeout.value = null;
        }, 300);
    }
}

function setActiveLabel(index: number) {
    activeLabel.value = {
        i: index + props.page * funcsNumberPerPage.value,
        label: 'Изменение',
    };
    isNotMainScrolling.value = true;
    setActiveLabelTop();
}

function setActiveLabelTop() {
    const wrapper = scrollWrapper.value;
    const el = scrollEl.value as HTMLElement;
    if (!activeLabel.value || !wrapper || !el) return;
    let addTop = 0;
    Array.from(el.children)
        .slice(0, activeLabel.value.i - props.page * funcsNumberPerPage.value)
        .forEach((el) => {
            if (el.children[1].clientHeight) {
                addTop += el.children[1].clientHeight;
            }
        });
    const top =
        (activeLabel.value.i - props.page * funcsNumberPerPage.value) * 58 -
        scrollTop.value +
        86 +
        addTop;
    if (top < 86) {
        activeLabelTop.value = 86;
    } else if (Math.round(top) > wrapper.offsetHeight + 18) {
        if (isNotMainScrolling.value) {
            setTimeout(() => {
                if (!activeLabel.value) return;
                isScrolling.value = true;
                wrapper.scrollTo({
                    top:
                        (activeLabel.value.i - props.page * funcsNumberPerPage.value) * 58 +
                        68 -
                        wrapper.offsetHeight,
                    behavior: 'smooth',
                });
            }, 0);
            setTimeout(() => {
                isScrolling.value = false;
                isNotMainScrolling.value = false;
            }, 300);
        }
        activeLabelTop.value = wrapper.offsetHeight + 86 - 68;
    } else {
        activeLabelTop.value = top;
    }
}

function handleScroll() {
    const el = scrollWrapper.value;
    if (!el) return;
    isNotMainScrolling.value = false;
    scrollTop.value = el.scrollTop;
}

function saveData(e: KeyboardEvent | MouseEvent) {
    if (!activeLabel.value) return;
    if (e.type === 'keypress') {
        const event: KeyboardEvent = e as KeyboardEvent;
        if (event.key === 'Enter') {
            setLabel(activeLabel.value.i, activeLabel.value.label);
            activeLabel.value = undefined;
        }
    } else if (e.type === 'click') {
        setLabel(activeLabel.value.i, activeLabel.value.label);
        activeLabel.value = undefined;
    }
}

async function setLabel(index: number, label: string | undefined) {
    if (!label) return;
    // const newLabels = [...curLabels.value];
    // newLabels[index] = label;
    // for (let i = 0; i < Math.ceil(newLabels.length / labelsFileLength); i += 1) {
    //     if (
    //         JSON.stringify(
    //             curLabels.value.slice(i * labelsFileLength, (i + 1) * labelsFileLength),
    //         ) !== JSON.stringify(newLabels.slice(i * labelsFileLength, (i + 1) * labelsFileLength))
    //     ) {
    //         saveLabel(
    //             newLabels.slice(i * labelsFileLength, (i + 1) * labelsFileLength) as string[],
    //             i,
    //         );
    //     }
    // }
}

function handleLabelInput(e: InputEvent) {
    const target = e.target as HTMLInputElement;
    if (!target || !activeLabel.value) return;
    activeLabel.value.label = target.value;
}

watch(
    () => scrollTop.value,
    () => {
        if (!isScrolling.value) setActiveLabelTop();
    },
);
watch(
    () => props.items,
    (newValue, oldValue) => {
        if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) openedAlgoritms.value = [];
    },
);

const { t } = useI18n({
    messages: {
        ru: {
            placeholder: 'Ввод названия',
        },
        en: {
            placeholder: 'Entering a title',
        },
    },
});
</script>
