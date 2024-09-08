<template>
    <div
        class="relative flex flex-col"
        :style="{ width: 'calc(50% - 10px)' }"
    >
        <h1
            class="font-semibold text-[#8dc5f6] text-[1.625rem] leading-[1.192] tracking-[0.02em] mb-5"
        >
            {{ t('title') }}
        </h1>
        <div class="bg-[#092740] rounded-[6px] p-[15px] flex gap-2 relative mb-4">
            <UiInput
                :init-value="headerInput"
                :placeholder="t('placeholder')"
                name="'name, group, template'"
                initType="string"
                class="table-cell w-[15rem] !pl-[40px] !pr-6 !h-[40px] flex-1"
                :status="'valid'"
                :input-type="['string']"
                @value-changed="$event === undefined ? '' : (headerInput = $event)"
            />
            <span
                v-html="search"
                class="[&>svg]:h-[20px] [&>svg]:w-[20px] absolute top-[25px] left-[27px]"
            ></span>
            <DropDown class="table-cell text-[0.813rem] [&>div>div]:!w-[10.75rem]">
                <template #trigger-element="{ onClick }">
                    <button
                        class="rounded-lg h-10 w-[326px] bg-[#0f304b] flex flex-row items-center gap-2 p-2"
                        @click="onClick"
                    >
                        <div class="font-roboto text-[#8dc5f6] text-sm pl-[7px]">
                            {{ t('dropDownName') }}
                        </div>
                    </button>
                </template>
                <template #body="{ isOpen, onSelect }">
                    <div
                        class="w-full rounded-lg bg-[#0f304b] flex flex-col py-[0.31rem]"
                        v-if="isOpen"
                    >
                        <div class="max-h-[11.563rem] overflow-auto scrollbar-3 px-1.5">
                            <!-- <div
                                v-for="d in curDevices"
                                :key="d.val"
                                class="flex flex-row h-[2.188rem] hover:bg-[#134d7d] shrink-0 items-center pl-2 pr-3 rounded hover:pl-3 transition-[background-color,padding] select-none cursor-pointer on:bg-[#134d7d] items-center gap-2"
                                :class="{ on: d.val === choosenDevice }"
                                @click="
                                    () => {
                                        choosenDevice = d.val;
                                        onSelect();
                                    }
                                "
                            >
                                <div
                                    class="font-roboto text-[#8dc5f6] w-[50px] h-6 rounded bg-[#1B4569] flex items-center justify-center"
                                >
                                    {{ d.val }}
                                </div>
                                <div class="font-roboto text-[#8dc5f6] text-sm">
                                    {{ d.label }}
                                </div>
                            </div> -->
                            <div
                                class="flex flex-row h-[2.188rem] shrink-0 items-center pl-2 pr-3 rounded transition-[background-color,padding] select-none cursor-pointer on:bg-[#134d7d] items-center"
                            >
                                <input
                                    type="checkbox"
                                    class="cursor-pointer"
                                    :id="'c1'"
                                />
                                <label
                                    class="flex-1 pl-2 pt-[2px] font-roboto text-sm font-medium select-none capitalize-first cursor-pointer"
                                    :for="'c1'"
                                    >label</label
                                >
                            </div>
                        </div>
                    </div>
                </template>
            </DropDown>
            <OutlinedButton
                @click="emit('createAlgoritm')"
                class="h-full w-[8.5rem] pl-6 pr-[3.125rem] relative"
                >{{ t('btnText') }}
                <span
                    v-html="add"
                    class="[&>svg]:h-[11px] [&>svg]:w-[11px] absolute top-[12px] right-[17px]"
                ></span
            ></OutlinedButton>
        </div>
        <AlgoritmsWrapper
            :items="pages[curPage]"
            :activeItem="props.activeItem"
            :checkedArr="props.checkedArr"
            :page="curPage"
            @setActiveAlgoritm="setActiveAlgoritm"
            @selectAlgoritm="selectAlgoritm"
            @deleteAlgoritm="deleteAlgoritm"
        />
        <div
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
import OutlinedButton from '@/components/Ui/OutlinedButton.vue';
import AlgoritmsWrapper from '@/components/views/presetAlgoritms/AlgoritmsWrapper.vue';
import ArrowIcon from '@/assets/ArrowIcon.vue';

const funcsStore = useFuncsStore();

const props = defineProps<{
    items: number[];
    activeItem: number | undefined;
    checkedArr: number[];
}>();

const emit = defineEmits<{
    (e: 'createAlgoritm'): void;
    (e: 'setActiveAlgoritm', index: number): void;
    (e: 'selectAlgoritm', value: boolean, index: number): void;
    (e: 'deleteAlgoritm', indexes: number[]): void;
}>();

const { funcsNumberPerPage } = storeToRefs(funcsStore);

const curPage = ref(0);
const headerInput = ref('');
const pageError = ref(false);

const pages = computed<number[][]>(() => {
    const arr: number[][] = [];
    for (let i = 0; i < props.items.length; i += funcsNumberPerPage.value) {
        let end;
        if (i + funcsNumberPerPage.value < props.items.length) {
            end = i + funcsNumberPerPage.value;
        } else {
            end = props.items.length;
        }
        arr.push(props.items.slice(i, end));
    }
    return arr;
});

function setActiveAlgoritm(index: number) {
    emit('setActiveAlgoritm', index);
}

function selectAlgoritm(value: boolean, index: number) {
    emit('selectAlgoritm', value, index);
}

function deleteAlgoritm(indexes: number[]) {
    emit('deleteAlgoritm', indexes);
}

const { t } = useI18n({
    messages: {
        en: {
            title: 'Preset algoritms',
            placeholder: 'Title, group, template',
            dropDownName: 'Select groups',
            btnText: 'Algoritm',
        },
        ru: {
            title: 'Предустановленные алгоритмы',
            placeholder: 'Название, группа, шаблон',
            dropDownName: 'Выберите группы',
            btnText: 'Алгоритм',
        },
    },
});
</script>
