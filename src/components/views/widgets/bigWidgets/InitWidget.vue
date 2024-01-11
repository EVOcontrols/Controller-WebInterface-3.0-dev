<template>
    <div class="flex-1 flex flex-col">
        <div class="flex-1 flex overflow-y-hidden pl-2 rounded-l-lg w-full pb-3">
            <div
                v-dragscroll.y
                class="scrollWrapper flex overflow-y-auto w-full scrollbar-4 flex-1"
                :style="{ height: 'calc(100vh - 410px)' }"
                ref="scrollWrapper"
            >
                <div
                    class="flex flex-col items-start flex-none pt-3 px-[18px] w-full gap-[10px]"
                    ref="scrollEl"
                >
                    <div
                        class="scrollEl label flex text-[#6CB5D3] items-center transition-colors duration-500 rounded select-none gap-[14px]"
                        v-for="(s, index) in props.w.state"
                        :key="index"
                    >
                        <span class="w-[22px] text-end">{{ index + 1 }}</span>
                        <span class="block w-[300px] overflow-hidden"> label </span>
                        <div class="flex flex-col">
                            <div class="flex">
                                <span
                                    class="h-9 px-4 text-sm font-Roboto flex items-center rounded-l-[8px]"
                                    :class="
                                        itemsStatuses[index] === null ||
                                        itemsStatuses[index] === undefined
                                            ? 'bg-[#023E71] text-[#2B9BFF]'
                                            : 'bg-[#0F304B] text-[#5F93C2] cursor-pointer'
                                    "
                                    @click="changeItemStatus(index, null)"
                                    >{{ t('items.not') }}</span
                                >
                                <span
                                    class="h-9 px-4 text-sm font-Roboto flex items-center"
                                    :class="
                                        itemsStatuses[index] === 'l'
                                            ? 'bg-[#023E71] text-[#2B9BFF]'
                                            : 'bg-[#0F304B] text-[#5F93C2] cursor-pointer'
                                    "
                                    @click="changeItemStatus(index, 'l')"
                                    >{{ t('items.download') }}</span
                                >
                                <span
                                    class="h-9 px-4 text-sm font-Roboto flex items-center rounded-r-[8px]"
                                    :class="
                                        itemsStatuses[index] !== null &&
                                        itemsStatuses[index] !== 'l' &&
                                        itemsStatuses[index] !== undefined
                                            ? 'bg-[#023E71] text-[#2B9BFF]'
                                            : 'bg-[#0F304B] text-[#5F93C2] cursor-pointer'
                                    "
                                    @click="changeItemStatus(index, 'const')"
                                    >{{ t('items.const') }}</span
                                >
                                <div
                                    v-if="
                                        itemsStatuses[index] !== null &&
                                        itemsStatuses[index] !== 'l' &&
                                        itemsStatuses[index] !== undefined
                                    "
                                    class="h-9 text-sm font-Roboto rounded-[8px] ml-2"
                                    :class="[
                                        { 'bg-[#0D424D]': props.w.w.i === 'bin-out' },
                                        {
                                            'bg-[#185385]': [
                                                'pw-out',
                                                'int-var',
                                                'tim-var',
                                            ].includes(props.w.w.i),
                                        },
                                        {
                                            '!bg-[#5C2345] !text-[#F83068]':
                                                isInvalidData === index,
                                        },
                                    ]"
                                >
                                    <div
                                        v-if="props.w.w.i === 'bin-out'"
                                        class="h-full pl-[10px] w-[5.5rem] flex items-center justify-start gap-[6px]"
                                    >
                                        <IButtonOutIcon
                                            class="cursor-pointer"
                                            :isHovered="hoveredBinOutItem === index"
                                            :isActive="
                                                itemsStatuses[index] !== 'const'
                                                    ? !!itemsStatuses[index]
                                                    : !!0
                                            "
                                            @mouseenter="handleMouseEnter(index)"
                                            @mouseleave="handleMouseLeave"
                                            @click="handleBinOutClick(index)"
                                        />
                                        {{
                                            itemsStatuses[index] !== 'const' && itemsStatuses[index]
                                                ? t('on')
                                                : t('off')
                                        }}
                                    </div>
                                    <div
                                        v-else-if="props.w.w.i === 'pwm-out'"
                                        class="h-full w-[4.5rem] flex items-center justify-start px-3"
                                    >
                                        <input
                                            v-focus="[isInvalidData === index, index]"
                                            class="w-full flex-1 bg-transparent h-full text-[#8DC5F6] text-[#8DC5F6] text-end transition-colors duration-300"
                                            :class="{ '!text-[#F83068]': isInvalidData === index }"
                                            type="text"
                                            :maxlength="5"
                                            :value="
                                                String(
                                                    itemsStatuses[index]
                                                        ? Number(itemsStatuses[index]) / 100
                                                        : 0,
                                                )
                                            "
                                            ref="dataInput"
                                            @input="
                                                (event) => handleInput(event as InputEvent, index)
                                            "
                                        />%
                                    </div>
                                    <div
                                        v-else-if="props.w.w.i === 'bin-var'"
                                        class="h-full w-[4.5rem] flex items-center justify-start px-3"
                                    >
                                        <span
                                            class="cursor-pointer text-[#97FFE7] text-sm min-w-[73px] h-full rounded-l-[6px] font-roboto flex items-center justify-center"
                                            :class="[
                                                itemsStatuses[index] !== 'const' &&
                                                !!itemsStatuses[index]
                                                    ? 'bg-[#176F6F]'
                                                    : 'bg-[#0D424D]',
                                                { 'cursor-pointer': !itemsStatuses[index] },
                                            ]"
                                            @click="handleBinVarClick(index, true)"
                                            >{{ t('true') }}</span
                                        >
                                        <span
                                            class="text-[#97FFE7] text-sm min-w-[73px] h-full rounded-r-[6px] font-roboto flex items-center justify-center"
                                            :class="[
                                                itemsStatuses[index] === 'const' ||
                                                !itemsStatuses[index]
                                                    ? 'bg-[#176F6F]'
                                                    : 'bg-[#0D424D]',
                                                { 'cursor-pointer': itemsStatuses[index] },
                                            ]"
                                            @click="handleBinVarClick(index, false)"
                                            >{{ t('false') }}</span
                                        >
                                    </div>
                                    <div
                                        v-else-if="props.w.w.i === 'int-var'"
                                        class="h-full w-[4.5rem] flex items-center justify-start px-3"
                                    >
                                        <input
                                            v-focus="[isInvalidData === index, index]"
                                            class="w-full flex-1 bg-transparent h-full text-[#8DC5F6] text-[#8DC5F6] text-end transition-colors duration-300"
                                            :class="{ '!text-[#F83068]': isInvalidData === index }"
                                            type="string"
                                            :maxlength="6"
                                            :value="
                                                String(
                                                    itemsStatuses[index]
                                                        ? Number(itemsStatuses[index])
                                                        : 0,
                                                )
                                            "
                                            ref="dataInput"
                                            @input="
                                                (event) => handleInput(event as InputEvent, index)
                                            "
                                        />
                                    </div>
                                    <div
                                        v-else-if="props.w.w.i === 'tim-var'"
                                        class="h-full"
                                    >
                                        <div
                                            class="h-full w-[4.5rem] flex items-center justify-start px-3"
                                        >
                                            <input
                                                v-focus="[isInvalidData === index, index]"
                                                class="w-full flex-1 bg-transparent h-full text-[#8DC5F6] text-[#8DC5F6] text-end transition-colors duration-300"
                                                :class="{
                                                    '!text-[#F83068]': isInvalidData === index,
                                                }"
                                                type="number"
                                                :value="
                                                    String(
                                                        itemsStatuses[index]
                                                            ? Number(itemsStatuses[index])
                                                            : 0,
                                                    )
                                                "
                                                ref="dataInput"
                                                @input="
                                                    (event) =>
                                                        handleInput(event as InputEvent, index)
                                                "
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div
                                class="pt-1 text-[#F83068] text-sm"
                                v-if="isInvalidData === index"
                            >
                                {{ t('error.text') + min + t('error.separator') + max }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="h-[3.125rem] border-t border-[#1D4162] px-4 flex items-center justify-end">
            <div class="flex">
                <OutlinedButton
                    class="mr-2"
                    @click="$emit('init')"
                    >{{ t('back') }}</OutlinedButton
                >
                <PrimaryButton @click="handleSaveClick">{{ t('save') }}</PrimaryButton>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import PrimaryButton from '@/components/Ui/PrimaryButton.vue';
import OutlinedButton from '@/components/Ui/OutlinedButton.vue';
import type { Widget } from '@/stores';
import IButtonOutIcon from '@/assets/IButtonOutIcon.vue';

const indexStore = useIndexStore();

const api = indexStore.getApi().api;

const isAborted = indexStore.getApi().isAborted;

const { devicesState, valuesRange } = storeToRefs(indexStore);

const itemsStatuses = ref<[string | number | null] | []>([]);

const hoveredBinOutItem = ref<number | null>(null);

const dataInput = ref<HTMLInputElement | undefined>();

const min = ref(0);

const max = ref(0);

const isInvalidData = ref<number | null>(null);

const props = defineProps<{
    w: { w: Widget; state: number[] };
}>();

const emit = defineEmits<{
    (e: 'init'): void;
}>();

async function getEntInit() {
    try {
        const quant = devicesState.value[props.w.w.d].find((el) => el.type === props.w.w.i)?.value
            .length;
        if (!quant) return;
        const r = await api.post('get_ent_init', {
            type: props.w.w.i,
            device: props.w.w.d,
            index: 0,
            quant: quant,
        });
        const res = await r.data.value;
        itemsStatuses.value = res;
    } catch (error) {
        if (isAborted.value) {
            return;
        }
        setTimeout(() => {
            getEntInit();
        }, 20);
    }
}

function changeItemStatus(index: number, status: null | number | string) {
    if (isInvalidData.value !== null) return;
    itemsStatuses.value[index] = status !== 'const' ? status : 0;
}

async function handleSaveClick() {
    if (isInvalidData.value !== null) return;
    try {
        const r = await api.post('set_ent_init', {
            type: props.w.w.i,
            device: props.w.w.d,
            index: 0,
            value: itemsStatuses.value,
        });
        if (r.data.status === 'ok') {
            emit('init');
        } else {
            console.log(r.data.status);
            throw new Error();
        }
    } catch (error) {
        if (isAborted.value) {
            return;
        }
        setTimeout(() => {
            handleSaveClick();
        }, 5);
    }
}

function handleMouseEnter(index: number) {
    hoveredBinOutItem.value = index;
}

function handleMouseLeave() {
    hoveredBinOutItem.value = null;
}

function handleBinOutClick(index: number) {
    itemsStatuses.value[index] = itemsStatuses.value[index] ? 0 : 1;
}

function handleInput(e: InputEvent, index: number) {
    const target = e.target as HTMLInputElement;
    const values = valuesRange.value.find((obj) => obj.interf === props.w.w.i)?.values;
    if (!target || !values) return;
    let val = target.value;
    if (val.includes(',')) val = val.replace(',', '.');
    if (props.w.w.i !== 'pwm-out' && val.includes('.')) {
        val.replace('.', '');
    }
    min.value = values.min;
    max.value = values.max;
    if (!(+val >= min.value && +val <= max.value)) {
        isInvalidData.value = index;
    } else {
        isInvalidData.value = null;
    }
    itemsStatuses.value[index] = val ? (props.w.w.i === 'pwm-out' ? +val * 100 : +val) : 0;
}

function handleBinVarClick(index: number, res: boolean) {
    const prevStatuses = [...itemsStatuses.value] as [string | number | null];
    prevStatuses[index] = res ? 1 : 0;
    itemsStatuses.value = [...prevStatuses];
}

onBeforeMount(() => {
    getEntInit();
});

const { t } = useI18n({
    messages: {
        ru: {
            back: 'Назад',
            save: 'Сохранить',
            items: {
                not: 'НЕТ',
                download: 'ЗАГРУЗИТЬ',
                const: 'КОНСТАНТА',
            },
            on: 'ВКЛ',
            off: 'ВЫКЛ',
            error: {
                text: 'Введите значение от ',
                separator: ' до ',
            },
            true: 'ИСТИНА',
            false: 'ЛОЖЬ',
        },
        en: {
            back: 'Back',
            save: 'Save',
            items: {
                not: 'NULL',
                download: 'DOWNLOAD',
                const: 'CONSTANT',
            },
            on: 'ON',
            off: 'OFF',
            error: {
                text: 'Enter a value between ',
                separator: ' and ',
            },
            true: 'TRUE',
            false: 'FALSE',
        },
    },
});
</script>
