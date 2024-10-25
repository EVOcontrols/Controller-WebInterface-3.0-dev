<template>
    <div class="overflow-y-hidden flex-1">
        <div
            v-dragscroll.y
            class="overflow-y-auto w-full flex-1 scrollbar-4"
            :style="{ 'max-height': 'calc(100vh - 244px)' }"
        >
            <div class="bg-[#092740] rounded-[6px] overflow-hidden">
                <AlgoritmBlock
                    v-for="(item, i) in props.items"
                    :key="i"
                    :isActive="i + props.page * funcsNumberPerPage === props.activeItem"
                    :checked="props.checkedArr.includes(i + props.page * funcsNumberPerPage)"
                    @click.stop="emit('setActiveAlgoritm', i + props.page * funcsNumberPerPage)"
                    @selectAlgoritm="
                        (value: boolean) => {
                            selectAlgoritm(value, i + props.page * funcsNumberPerPage);
                        }
                    "
                    @deleteAlgoritm="
                        () => {
                            deleteAlgoritm([i + props.page * funcsNumberPerPage]);
                        }
                    "
                />
            </div>
            <div class="w-full !h-8 bg-[#10375A]"></div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import AlgoritmBlock from '@/components/views/presetAlgoritms/AlgoritmBlock.vue';

const funcsStore = useFuncsStore();

const { funcsNumberPerPage } = storeToRefs(funcsStore);

const props = defineProps<{
    items: number[];
    activeItem: number | undefined;
    checkedArr: number[];
    page: number;
}>();

const emit = defineEmits<{
    (e: 'setActiveAlgoritm', index: number): void;
    (e: 'selectAlgoritm', value: boolean, index: number): void;
    (e: 'deleteAlgoritm', indexes: number[]): void;
}>();

function selectAlgoritm(value: boolean, index: number) {
    emit('selectAlgoritm', value, index);
}

function deleteAlgoritm(indexes: number[]) {
    emit('deleteAlgoritm', indexes);
}
</script>
