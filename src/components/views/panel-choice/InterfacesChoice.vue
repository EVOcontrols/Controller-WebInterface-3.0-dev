<template>
    <div class="flex whitespace-nowrap w-full flex-none">
        <div class="flex flex-1 overflow-hidden w-full flex-none">
            <ArrowIcon
                v-if="!isStartScrollEl"
                class="absolute top-[50%] translate-y-[-50%] rotate-180 left-[6px] cursor-pointer"
                :class="{ disabled: notConnected }"
                @click="handleArrowClick('toStart')"
            />
            <div class="flex overflow-x-hidden relative ml-2 pl-2 pr-1 rounded-l-lg w-full">
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
                            v-for="interf in interfaces"
                            :key="interf.value"
                            class="interf h-8 px-3 flex items-center mr-[6px] rounded-[6px] text-0.81 font-roboto text-[#ADEBFF] cursor-pointer transition-all duration-300 justify-center select-none"
                            :class="{
                                active: chosenInterfaces.includes(interf.value),
                            }"
                            @mousedown="mousedown"
                            @mouseup="mouseup(interf, $event)"
                        >
                            {{ interf.label[locale] }}
                        </div>
                    </div>
                </div>
            </div>

            <div class="relative flex items-center pr-5 pl-[1.875rem] ml-[1px]">
                <ArrowIcon
                    v-if="!isEndScrollEl"
                    class="absolute top-[50%] translate-y-[-50%] left-1 cursor-pointer"
                    :class="{ disabled: notConnected }"
                    @click="handleArrowClick('toEnd')"
                />
                <div class="h-[39px] w-[1px] bg-[#0C3051] mr-3"></div>
                <!-- eslint-disable-next-line vuejs-accessibility/label-has-for -->
                <label class="flex items-center cursor-pointer nc:cursor-default group">
                    <check-box
                        :isDisabled="notConnected"
                        @change="toggleChooseAllInterfaces()"
                        :isAllChosen="isAllInterfacesChosen"
                    />
                    <span
                        class="ml-2 text-sm font-medium leading-none select-none nc:!text-426"
                        :class="
                            isAllInterfacesChosen ? 'text-8dc' : 'text-578 group-hover:text-8dc'
                        "
                    >
                        {{ t('select') }}
                    </span>
                </label>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import CheckBox from './CheckBox.vue';
import ArrowIcon from '@/assets/ArrowIcon.vue';
import type { Interf } from '@/stores';

const isAllInterfacesChosen = ref(false);

const indexStore = useIndexStore();

const mouseupX = ref<number>(0);

const scrollWrapper = ref<HTMLElement | undefined>();

const scrollEl = ref<HTMLElement | undefined>();

const isStartScrollEl = ref(true);

const isEndScrollEl = ref(false);

const { chosenInterfaces, interfaces, notConnected } = storeToRefs(indexStore);

function toggleChooseAllInterfaces() {
    isAllInterfacesChosen.value = !isAllInterfacesChosen.value;
    indexStore.toggleChooseAllInterfaces(isAllInterfacesChosen);
}

function handleArrowClick(direction: 'toStart' | 'toEnd') {
    const el = scrollEl.value;
    const wrapper = scrollWrapper.value;
    if (!el || !wrapper) return;
    if (direction === 'toStart') {
        wrapper.scrollTo({ left: 0, behavior: 'smooth' });
        isStartScrollEl.value = true;
        isEndScrollEl.value = false;
    } else {
        wrapper.scrollTo({ left: wrapper.offsetWidth, behavior: 'smooth' });
        isStartScrollEl.value = false;
        isEndScrollEl.value = true;
    }
}

function handleScrollMove() {
    const wrapper = scrollWrapper.value;
    const el = scrollEl.value;
    if (!el || !wrapper) return;
    isStartScrollEl.value = wrapper.scrollLeft < 20 ? true : false;
    isEndScrollEl.value =
        Math.round(wrapper.scrollLeft) > el.offsetWidth - wrapper.offsetWidth - 20 ? true : false;
}

function mousedown(e: MouseEvent) {
    mouseupX.value = e.screenX;
}

function mouseup(interf: Interf, e: MouseEvent) {
    if (mouseupX.value) {
        if (Math.abs(e.screenX - mouseupX.value) < 20) {
            indexStore.toggleInterface(interf.value);
        }
        mouseupX.value = 0;
    }
}

onBeforeMount(() => {
    isAllInterfacesChosen.value = chosenInterfaces.value.length === interfaces.value.length;
});

onMounted(() => {
    const wrapper = scrollWrapper.value;
    const el = scrollEl.value;
    if (!wrapper || !el) return;
    isEndScrollEl.value = !(wrapper.offsetWidth <= el.offsetWidth);
});

watch(
    () => chosenInterfaces.value,
    () => {
        isAllInterfacesChosen.value = chosenInterfaces.value.length === interfaces.value.length;
    },
);

const { t, locale } = useI18n({
    messages: {
        ru: {
            select: 'Выбрать все',
            allInterfaces: 'Все интерфейсы',
        },
        en: {
            select: 'Select all',
            allInterfaces: 'All interfaces',
        },
    },
});
</script>

<style lang="postcss" scoped>
.interf {
    background: #143959;
    &:hover {
        background: #214e76;
    }

    &.active {
        background: #148ef8;
    }
}
</style>
