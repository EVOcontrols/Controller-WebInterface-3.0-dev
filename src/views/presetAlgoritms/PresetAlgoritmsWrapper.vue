<template>
    <div class="px-10 mt-[1.625rem] flex gap-5">
        <AlgoritmsBlock
            :items="algoritms"
            :activeItem="algoritmPreset"
            :checkedArr="selectedAlgoritms"
            @deleteAlgoritm="
                (indexes: number[]) => {
                    setAlgoritmsForDelete(indexes, 1);
                }
            "
            @createAlgoritm="setIsCreatingAlgoritm"
            @setActiveAlgoritm="setActiveAlgoritm"
            @selectAlgoritm="selectAlgoritm"
        />
        <TemplatesBlock
            v-if="isCreatingAlgoritm"
            :items="templateGroups"
            @createAlgoritm="showCreatePopUp"
        />
        <PresetAlgoritmBlocksWrapper v-else-if="algoritmPreset !== undefined" />
        <NewAlgoritmPopUp
            v-if="isCreatingAlgoritmPopUpSwown"
            :isLoading="isNewAlgoritmCreating"
            @close="isCreatingAlgoritmPopUpSwown = false"
            @create="createAlgoritm"
        />
        <ControlBlock
            v-if="!!selectedAlgoritms.length"
            :count="selectedAlgoritms.length"
            :isAllChoosen="selectedAlgoritms.length === algoritms.length"
            @close="setSelectedAlgoritmsCount"
            @selectAllAlgoritms="setChooseAll"
            @deleteAlgoritms="
                () => {
                    setAlgoritmsForDelete(selectedAlgoritms, 2);
                }
            "
        />
        <DeleteAlgoritmPopUp
            v-if="algoritmsForDeletion.length"
            :algoritms="algoritmsForDeletion"
            :isLoading="isAlgoritmsDeleting"
            :type="algoritmsForDeletionType"
            @close="algoritmsForDeletion = []"
            @delete="deleteAlgoritms"
        />
    </div>
</template>

<script lang="ts" setup>
import TemplatesBlock from '@/components/views/presetAlgoritms/TemplatesBlock.vue';
import AlgoritmsBlock from '@/components/views/presetAlgoritms/AlgoritmsBlock.vue';
import NewAlgoritmPopUp from '@/components/views/presetAlgoritms/NewAlgoritmPopUp.vue';
import DeleteAlgoritmPopUp from '@/components/views/presetAlgoritms/DeleteAlgoritmPopUp.vue';
import ControlBlock from '@/components/views/presetAlgoritms/ControlBlock.vue';
import PresetAlgoritmBlocksWrapper from '@/components/views/presetAlgoritms/PresetAlgoritmBlocksWrapper.vue';

const isCreatingAlgoritm = ref(false);
const isCreatingAlgoritmPopUpSwown = ref(false);
const isNewAlgoritmCreating = ref(false);
const algoritmPreset = ref<number>();
const selectedAlgoritms = ref<number[]>([]);
const algoritmsForDeletion = ref<number[]>([]);
const algoritmsForDeletionType = ref<1 | 2>();
const isAlgoritmsDeleting = ref(false);

const algoritms = ref<number[]>([
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25,
    26, 27, 28, 29, 30, 31,
]);

const templateGroups = ref<
    { templates: { name: string; descr: string; count: number; maxCount: number }[] }[]
>([
    {
        templates: [
            { name: 'Шаблон', descr: 'Описание шаблона', count: 0, maxCount: 16 },
            { name: 'Шаблон', descr: 'Описание шаблона', count: 15, maxCount: 16 },
            { name: 'Шаблон', descr: 'Описание шаблона', count: 16, maxCount: 16 },
        ],
    },
    {
        templates: [{ name: 'Шаблон', descr: 'Описание шаблона', count: 0, maxCount: 16 }],
    },
    {
        templates: [
            { name: 'Шаблон', descr: 'Описание шаблона', count: 15, maxCount: 16 },
            { name: 'Шаблон', descr: 'Описание шаблона', count: 16, maxCount: 16 },
        ],
    },
    {
        templates: [
            { name: 'Шаблон', descr: 'Описание шаблона', count: 0, maxCount: 16 },
            { name: 'Шаблон', descr: 'Описание шаблона', count: 15, maxCount: 16 },
            { name: 'Шаблон', descr: 'Описание шаблона', count: 16, maxCount: 16 },
        ],
    },
    {
        templates: [{ name: 'Шаблон', descr: 'Описание шаблона', count: 0, maxCount: 16 }],
    },
    {
        templates: [
            { name: 'Шаблон', descr: 'Описание шаблона', count: 15, maxCount: 16 },
            { name: 'Шаблон', descr: 'Описание шаблона', count: 16, maxCount: 16 },
        ],
    },
    {
        templates: [
            { name: 'Шаблон', descr: 'Описание шаблона', count: 0, maxCount: 16 },
            { name: 'Шаблон', descr: 'Описание шаблона', count: 15, maxCount: 16 },
            { name: 'Шаблон', descr: 'Описание шаблона', count: 16, maxCount: 16 },
        ],
    },
    {
        templates: [{ name: 'Шаблон', descr: 'Описание шаблона', count: 0, maxCount: 16 }],
    },
    {
        templates: [
            { name: 'Шаблон', descr: 'Описание шаблона', count: 15, maxCount: 16 },
            { name: 'Шаблон', descr: 'Описание шаблона', count: 16, maxCount: 16 },
        ],
    },
]);

function showCreatePopUp() {
    isCreatingAlgoritmPopUpSwown.value = true;
}

function createAlgoritm() {
    isNewAlgoritmCreating.value = true;
    setTimeout(() => {
        isNewAlgoritmCreating.value = false;
        isCreatingAlgoritm.value = false;
        isCreatingAlgoritmPopUpSwown.value = false;
        //TODO
        algoritmPreset.value = 10;
    }, 5000);
}

function setActiveAlgoritm(index: number) {
    algoritmPreset.value = index;
    isCreatingAlgoritm.value = false;
}

function setIsCreatingAlgoritm() {
    isCreatingAlgoritm.value = true;
    algoritmPreset.value = undefined;
}

function setSelectedAlgoritmsCount() {
    selectedAlgoritms.value = [];
}

function selectAlgoritm(value: boolean, index: number) {
    let prevArr = [...selectedAlgoritms.value];
    if (value) {
        prevArr.push(index);
    } else {
        prevArr = prevArr.filter((el) => el !== index);
    }
    selectedAlgoritms.value = [...prevArr];
}

function setChooseAll(res: boolean) {
    if (res) {
        selectedAlgoritms.value =
            selectedAlgoritms.value.length === algoritms.value.length ? [] : [...algoritms.value];
    } else {
        selectedAlgoritms.value = [];
    }
}

function setAlgoritmsForDelete(indexes: number[], type: 1 | 2) {
    let prevArr = [...algoritmsForDeletion.value];
    prevArr.push(...indexes);
    algoritmsForDeletion.value = [...prevArr];
    algoritmsForDeletionType.value = type;
}

function deleteAlgoritms() {
    //TODO
    isAlgoritmsDeleting.value = true;
    setTimeout(() => {
        algoritmsForDeletion.value = [];
        selectedAlgoritms.value = [];
        isAlgoritmsDeleting.value = false;
    }, 5000);
}
</script>
