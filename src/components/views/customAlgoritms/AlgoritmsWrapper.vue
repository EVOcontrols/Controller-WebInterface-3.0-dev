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
                <AlgoritmBlock
                    v-for="(item, i) in props.items"
                    :key="i"
                    :item="item"
                    :side="props.side"
                    :checked="props.checkedArr.includes(props.items[i + props.page * funcsNumberPerPage])"
                    :index="i + props.page * funcsNumberPerPage"
                    :isActive="!!(activeLabel && activeLabel.i === i + props.page * funcsNumberPerPage)"
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
                            deleteAlgoritm([props.items[i]], i + props.page * funcsNumberPerPage, i);
                        }
                    "
                    @oneClick="handleClick(i)"
                    @doubleClick="handleDblClick(i)"
                    @addAlgoritm="addAlgoritm(i)"
                    @creatingFinish="handleCreatingFinish(i)"
                />
            </div>
            <div
                v-else
                class="bg-[#092740] rounded-[6px] h-full flex items-center justify-center"
                :style="{ 'max-height': 'calc(100% - 32px)' }"
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
                        ref="activeLabelInput"
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
import AlgoritmBlock from '@/components/views/customAlgoritms/AlgoritmBlock.vue';
import spinner from '@/assets/img/spinner-inside-button.svg?raw';
import type { Device } from '@/typings/main';

const { saveToFile } = useReadWriteFiles();

const funcsStore = useFuncsStore();
const indexStore = useIndexStore();

const isAborted = indexStore.getApi().isAborted;

const { funcsNumberPerPage, funcLabels } = storeToRefs(funcsStore);

const props = defineProps<{
    side: 'l' | 'r';
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
    (e: 'deleteAlgoritm', indexes: Algoritm[], index: number, smallIndex: number): void;
    (e: 'addAlgoritm', index: number, label: string | undefined): void;
    (e: 'creatingFinish', index: number): void;
}>();

const activeLabelInput = ref<HTMLInputElement | undefined>();
const scrollWrapper = ref<HTMLElement | undefined>();
const activeLabel = ref<{ label: string; i: number }>();
const activeLabelTop = ref(86);
const scrollEl = ref<HTMLElement | undefined>();
const scrollTop = ref<number>(0);
const isScrolling = ref(false);
const isNotMainScrolling = ref(false);
const openedAlgoritms = ref<number[]>([]);
const clickTimeout = ref<number | null>(null);

const curLabels = ref<string[]>([]);

type Algoritm = { val: 0 | 1 | null; label: string; isCreating?: boolean };

function selectAlgoritm(value: boolean, index: Algoritm) {
    emit('selectAlgoritm', value, index);
}

function deleteAlgoritm(indexes: Algoritm[], index: number, smallIndex: number) {
    emit('deleteAlgoritm', indexes, index, smallIndex);
}

function handleDblClick(index: number) {
    changeLabel(index);
}

function handleClick(i: number) {
    if (clickTimeout.value) {
        clearTimeout(clickTimeout.value);
        clickTimeout.value = null;
    } else {
        clickTimeout.value = setTimeout(() => {
            toggleOpenedAlgoritms(i);
            clickTimeout.value = null;
        }, 300);
    }
}

function handleCreatingFinish(i: number) {
    emit('creatingFinish', i);

    toggleOpenedAlgoritms(i);
}

function toggleOpenedAlgoritms(i: number) {
    if (openedAlgoritms.value.includes(i)) {
        openedAlgoritms.value = openedAlgoritms.value.filter((el) => el !== i);

        if (props.items[i].isCreating === true) {
            emit('creatingFinish', i);
        }
    } else {
        openedAlgoritms.value.push(i);
    }
}

function changeLabel(index: number, isCreating?: boolean) {
    setActiveLabel(index);
    setActiveLabelTop();

    const removeHandlers = () => {
        window.removeEventListener('click', handleSave);
        window.removeEventListener('keypress', handleSave);
    };
    const handleSave = (event: MouseEvent | KeyboardEvent) => saveData(index, event, isCreating, removeHandlers);

    setTimeout(() => {
        const label = activeLabelInput.value;
        if (label) label.focus();

        window.addEventListener('click', handleSave);
        window.addEventListener('keypress', handleSave);
    }, 20);
}

function addAlgoritm(index: number) {
    changeLabel(index, true);
}

function setActiveLabel(index: number) {
    activeLabel.value = {
        i: index + props.page * funcsNumberPerPage.value,
        label: curLabels.value[index + props.page * funcsNumberPerPage.value],
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
    const top = (activeLabel.value.i - props.page * funcsNumberPerPage.value) * 58 - scrollTop.value + 86 + addTop;
    if (top < 86) {
        activeLabelTop.value = 86;
    } else if (Math.round(top) > wrapper.offsetHeight + 18) {
        if (isNotMainScrolling.value) {
            setTimeout(() => {
                if (!activeLabel.value) return;
                isScrolling.value = true;
                wrapper.scrollTo({
                    top: (activeLabel.value.i - props.page * funcsNumberPerPage.value) * 58 + 68 - wrapper.offsetHeight,
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

async function saveData(
    index: number,
    e: KeyboardEvent | MouseEvent,
    isCreating?: boolean,
    removeHandlers?: () => void,
) {
    if (!activeLabel.value) return;
    if (e.type === 'keypress') {
        const event: KeyboardEvent = e as KeyboardEvent;
        if (event.key === 'Enter') {
            await sendLabel(index, activeLabel.value.i, activeLabel.value.label, isCreating, removeHandlers);
        }
    } else if (e.type === 'click') {
        await sendLabel(index, activeLabel.value.i, activeLabel.value.label, isCreating, removeHandlers);
    }
}

async function sendLabel(
    smallIndex: number,
    index: number,
    label: string | undefined,
    isCreating?: boolean,
    removeHandlers?: () => void,
) {
    await setLabel(index, label);
    activeLabel.value = undefined;

    if (removeHandlers) removeHandlers();

    if (isCreating) emit('addAlgoritm', smallIndex, label);
}

async function setLabel(index: number, label: string | undefined) {
    if (!label) return;
    const currLabels =
        funcLabels.value[props.device ? props.device.addr : 0].find((el) => el.name === props.curAction.val)?.val || [];

    const newLabels = [...currLabels];
    newLabels[index] = label;
    curLabels.value = [...newLabels];
    await saveLabel(newLabels as string[]);
}

async function saveLabel(labels: string[]) {
    const isSavingError = await saveToFile(
        {
            type: 'labels',
            interf: props.curAction.val,
            device: props.device ? props.device.addr : 0,
        },
        { labels },
    );
    if (isSavingError) {
        if (isAborted.value) {
            return;
        }
        setTimeout(() => {
            saveLabel(labels);
        }, 5);
    } else {
        funcsStore.setLabels(props.device ? props.device.addr : 0, props.curAction.val, labels);
    }
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
        if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
            const indexCreating = newValue.findIndex((item) => item.isCreating === true);
            openedAlgoritms.value = indexCreating !== -1 ? [indexCreating] : [];
            activeLabel.value = undefined;
        }
    },
);
watch(
    () => funcLabels.value,
    () => {
        curLabels.value =
            funcLabels.value[props.device ? props.device.addr : 0].find((el) => el.name === props.curAction.val)?.val ||
            [];
    },
);

defineExpose({ changeLabel });

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
