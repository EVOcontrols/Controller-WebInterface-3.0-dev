<template>
    <div
        class="relative flex flex-col"
        :style="{ width: 'calc(50% - 6px)' }"
    >
        <div
            class="bg-[#092740] rounded-[6px] py-[15px] px-6 flex items-center gap-2 relative mb-4"
        >
            <input
                type="checkbox"
                class="cursor-pointer"
                :id="'all'"
                :checked="props.isAllChecked"
                @change="
                    () => {
                        emit('selectAllAlgoritms', !props.isAllChecked);
                    }
                "
            />
            <DropDown class="table-cell text-[0.813rem] [&>div>div]:!w-[10.375rem] ml-4">
                <template #trigger-element="{ onClick }">
                    <button
                        class="rounded-lg h-10 w-[326px] bg-[#0f304b] flex flex-row items-center gap-2 p-2"
                        @click="onClick"
                    >
                        <div class="font-roboto text-[#8dc5f6] text-sm pl-[7px]">
                            {{ t(`actions.${curAction.label}`) }}
                        </div>
                    </button>
                </template>
                <template #body="{ isOpen, onSelect }">
                    <div
                        class="w-full rounded-lg bg-[#0f304b] flex flex-col py-[0.31rem]"
                        v-if="isOpen"
                    >
                        <div class="p-[6px]">
                            <div
                                v-for="action in actions"
                                :key="action.val"
                                class="flex flex-row h-[2.188rem] hover:bg-[#134d7d] shrink-0 items-center pl-2 pr-3 rounded hover:pl-3 transition-[background-color,padding] select-none cursor-pointer on:bg-[#134d7d] items-center gap-2"
                                :class="{
                                    on: JSON.stringify(action) === JSON.stringify(curAction),
                                }"
                                @click="
                                    () => {
                                        emit('setCurAction', action);
                                        onSelect();
                                    }
                                "
                            >
                                {{ t(`actions.${action.label}`) }}
                            </div>
                        </div>
                    </div>
                </template>
            </DropDown>
            <UiInput
                :init-value="headerInput"
                :placeholder="t('placeholder')"
                name="'name, group, template'"
                initType="string"
                class="table-cell w-[15rem] !pl-[40px] !pr-6 !h-[40px] flex-1"
                :status="'valid'"
                :input-type="['string']"
                @value-changed="$event === undefined ? (headerInput = '') : (headerInput = $event)"
            />
            <span
                v-html="search"
                class="[&>svg]:h-[20px] [&>svg]:w-[20px] absolute top-[25px] left-[15.5rem]"
            ></span>
            <PrimaryButton
                class="w-[3.25rem] h-[2.5rem] flex items-center justify-center relative group"
                :is-disabled="
                    !!props.needToAddAlgoritm ||
                    props.items.filter((el) => el.val !== null).length === props.items.length
                "
                @click="
                    () => {
                        emit(
                            'addAlgoritm',
                            props.items.findIndex((el) => el.val === null),
                        );
                    }
                "
            >
                <span
                    v-html="add"
                    class="[&>svg]:h-[13.3px] [&>svg]:w-[13.3px] [&>svg>path]:fill-[#ADEBFF]"
                ></span>
                <div
                    class="absolute right-0 -bottom-[58px] pl-8 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-[visibility,opacity] z-[1]"
                >
                    <div
                        class="rounded-[6px] bg-[#1B4569] p-3 w-[250px] h-[50px] text-[13px] text-[#77C3FF]"
                    >
                        {{ t('addAlgoritm') }}
                    </div>
                </div></PrimaryButton
            >
        </div>
        <AlgoritmsWrapper
            :items="pages[curPage] || []"
            :checkedArr="props.selectedAlgoritms"
            :page="curPage"
            :device="props.device"
            :curAction="props.curAction"
            @selectAlgoritm="
                (value: boolean, index: Algoritm) => {
                    emit('selectAlgoritm', value, index);
                }
            "
            @deleteAlgoritm="deleteAlgoritm"
            @addAlgoritm="
                (index: number) => {
                    emit('addAlgoritm', index);
                }
            "
            @creatingFinish="(index: number) => emit('creatingFinish', index)"
        />
        <div
            v-if="pages.length"
            class="absolute bottom-0 left-[50%] translate-x-[-50%] w-[5.625rem] h-[2.875rem] rounded-t-[8px] bg-[#113351] shadow-[0_0_7px_0_#07243D] flex items-center justify-center gap-1 py-[10px]"
        >
            <ArrowIcon
                class="rotate-180"
                :class="[
                    { disabled: pages.length <= 1 || curPage === 0 },
                    { 'cursor-pointer': pages.length > 1 && curPage },
                ]"
                @click="
                    () => {
                        if (curPage !== 0) {
                            curPage--;
                        }
                    }
                "
            />
            <UiInput
                :init-value="curPage + 1"
                :name="'page'"
                initType="number"
                class="table-cell w-9 !h-[1.625rem] text-center !px-2"
                :min-max="[1, pages.length]"
                :status="pageError ? 'invalid' : 'valid'"
                :input-type="['int']"
                :nullable="false"
                :required="true"
                @status-changed="pageError = $event === 'invalid' || $event === 'empty'"
                @value-changed="$event === undefined ? '' : (curPage = $event - 1)"
            />
            <ArrowIcon
                class=""
                :class="[
                    { disabled: pages.length <= 1 || curPage === pages.length - 1 },
                    { 'cursor-pointer': pages.length > 1 && curPage !== pages.length - 1 },
                ]"
                @click="
                    () => {
                        if (curPage !== pages.length - 1) {
                            curPage++;
                        }
                    }
                "
            />
        </div>
    </div>
</template>

<script lang="ts" setup>
import search from '@/assets/img/search.svg?raw';
import add from '@/assets/img/add.svg?raw';
import UiInput from '@/components/Ui/UiInput.vue';
import DropDown from '@/components/Ui/DropDown.vue';
import PrimaryButton from '@/components/Ui/PrimaryButton.vue';
import AlgoritmsWrapper from '@/components/views/customAlgoritms/AlgoritmsWrapper.vue';
import ArrowIcon from '@/assets/ArrowIcon.vue';
import type { Device } from '@/stores';

const funcsStore = useFuncsStore();

const { funcsNumberPerPage } = storeToRefs(funcsStore);

const props = defineProps<{
    items: Algoritm[];
    selectedAlgoritms: Algoritm[];
    isAllChecked: boolean;
    curAction:
        | { label: 'triggers'; val: 'udf-trig' }
        | { label: 'conditions'; val: 'udf-cond' }
        | { label: 'actions'; val: 'udf-act' }
        | { label: 'transformations'; val: 'udf-trans' };
    device?: Device;
    needToAddAlgoritm: Boolean;
}>();

const emit = defineEmits<{
    (e: 'deleteAlgoritm', indexes: Algoritm[], index: number): void;
    (e: 'addAlgoritm', index: number): void;
    (e: 'selectAlgoritm', value: boolean, index: Algoritm): void;
    (e: 'selectAllAlgoritms', value: boolean): void;
    (e: 'setIsAllChecked', value: boolean): void;
    (e: 'creatingFinish', index: number): void;
    (
        e: 'setCurAction',
        value:
            | { label: 'triggers'; val: 'udf-trig' }
            | { label: 'conditions'; val: 'udf-cond' }
            | { label: 'actions'; val: 'udf-act' }
            | { label: 'transformations'; val: 'udf-trans' },
    ): void;
}>();

type Algoritm = { val: 0 | 1 | null; label: string; isCreating?: boolean };

const curPage = ref(0);
const headerInput = ref('');
const pageError = ref(false);
const actions: (
    | { label: 'triggers'; val: 'udf-trig' }
    | { label: 'conditions'; val: 'udf-cond' }
    | { label: 'actions'; val: 'udf-act' }
    | { label: 'transformations'; val: 'udf-trans' }
)[] = [
    { label: 'triggers', val: 'udf-trig' },
    { label: 'conditions', val: 'udf-cond' },
    { label: 'actions', val: 'udf-act' },
    { label: 'transformations', val: 'udf-trans' },
];

const pages = computed<Algoritm[][]>(() => {
    const arr: Algoritm[][] = [];
    for (let i = 0; i < props.items.length; i += funcsNumberPerPage.value) {
        let end;
        if (i + funcsNumberPerPage.value < props.items.length) {
            end = i + funcsNumberPerPage.value;
        } else {
            end = props.items.length;
        }
        arr.push(props.items.filter((el) => el.label.includes(headerInput.value)).slice(i, end));
    }
    return arr;
});

function deleteAlgoritm(indexes: Algoritm[], index: number) {
    emit('deleteAlgoritm', indexes, index);
}

const { t } = useI18n({
    messages: {
        en: {
            placeholder: 'Enter name or number',
            actions: {
                triggers: 'Triggers',
                conditions: 'Conditions',
                actions: 'Actions',
                transformations: 'Transformations',
            },
            addAlgoritm: 'Add the algorithm to the first free cell',
        },
        ru: {
            placeholder: 'Введите название или номер',
            actions: {
                triggers: 'Триггеры',
                conditions: 'Условия',
                actions: 'Действия',
                transformations: 'Преобразования',
            },
            addAlgoritm: 'Добавить алгоритм в первую свободную ячейку',
        },
    },
});
</script>
