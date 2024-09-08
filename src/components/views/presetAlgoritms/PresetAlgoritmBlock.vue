<template>
    <div
        class="relative pb-[1.75rem]"
        :class="[{ 'pt-[1.125rem]': props.isFirst }]"
    >
        <div
            class="mb-[1.75rem] h-[1px] w-full bg-[#0B3D68]"
            v-if="!props.isFirst"
        ></div>
        <div
            v-for="(item, i) in props.queue"
            :key="i"
        >
            <div
                v-if="item.name === 'title'"
                class="text-sm"
                :class="{ 'mt-[0.875rem]': i }"
            >
                {{ props.titles[item.index] }}
            </div>
            <div
                v-else-if="item.name === 'btns' && props.btns[item.index]"
                class="flex"
                :class="{ 'ml-[4.5rem]': props.btns[item.index].inline }"
            >
                <div
                    v-if="props.btns[item.index].subtitle"
                    class="text-sm text-[#8DC5F6] mr-3 mt-[1rem] !h-6 flex items-center select-none"
                >
                    {{ props.btns[item.index].subtitle }}
                </div>
                <div
                    v-for="(btn, j) in props.btns[item.index].vals"
                    class="h-[1.875rem] flex items-center justify-center px-3 mt-[0.875rem] select-none"
                    :class="[
                        props.btns[item.index].isGreen
                            ? btn.val === props.btns[item.index].val
                                ? 'bg-[#176F6F] text-[#97FFE7]'
                                : 'bg-[#0D424D] text-[#176F6F] cursor-pointer'
                            : btn.val === props.btns[item.index].val
                            ? 'bg-[#023E71] text-[#2B9BFF]'
                            : 'bg-[#143959] text-[#5F93C2] cursor-pointer',
                        { 'rounded-l-[8px]': j === 0 },
                        { 'rounded-r-[8px]': j === props.btns[item.index].vals.length - 1 },
                        btn.class ? btn.class : '',
                    ]"
                    :key="j"
                    @click="
                        () => {
                            if (btn.val !== props.btns[item.index].val) {
                                $emit('handleBtnClick', item.index, btn.val);
                            }
                        }
                    "
                >
                    {{ btn.label }}
                </div>
            </div>
            <div
                v-else-if="item.name === 'tabs' && props.tabs[item.index]"
                class="flex overflow-x-hidden w-full"
            >
                <div
                    v-dragscroll.x
                    class="flex items-center overflow-x-auto no-scrollbar w-full flex-none"
                    ref="scrollWrapper"
                >
                    <div
                        class="flex gap-[6px] items-center flex-none"
                        ref="scrollEl"
                    >
                        <div
                            v-for="(tab, j) in props.tabs[item.index].vals"
                            class="cursor-pointer h-8 rounded-[6px] flex items-center justify-center px-3 mt-[0.875rem] select-none nowrap transition-all duration-500"
                            :class="
                                props.tabs[item.index].val === tab.val
                                    ? 'bg-[#148EF8] text-[#ADEBFF]'
                                    : 'bg-[#143959] text-[#8DC5F6]'
                            "
                            :key="j"
                            @click="
                                () => {
                                    $emit('handleTabClick', item.index, tab.val);
                                }
                            "
                        >
                            {{ tab.label }}
                        </div>
                    </div>
                </div>
            </div>
            <div
                v-else-if="item.name === 'radioBtns' && props.radioBtns[item.index]"
                class="gap-3 w-full mt-[0.875rem]"
                :class="
                    props.radioBtns[item.index].wrap
                        ? 'grid grid-cols-2'
                        : 'flex flex-col flex-wrap'
                "
                :style="[
                    {
                        height: props.radioBtns[item.index].wrap
                            ? `${
                                  Math.ceil(props.radioBtns[item.index].vals.length / 2) * 16 +
                                  12 * Math.ceil(props.radioBtns[item.index].vals.length / 2)
                              }px`
                            : 'auto',
                    },
                    { 'grid-template-columns': 'repeat(2, 186px)' },
                ]"
            >
                <div
                    v-for="option in props.radioBtns[item.index].vals"
                    class="h-4 flex gap-2"
                    :key="option.val"
                >
                    <input
                        type="radio"
                        :name="props.radioBtns[item.index].groupName"
                        :id="option.val"
                        :value="option.val"
                        :checked="option.val === props.radioBtns[item.index].val"
                        @change="
                            () => {
                                $emit('handleRadioBtnClick', item.index, option.val);
                            }
                        "
                    />
                    <label
                        :for="option.val"
                        :class="{
                            'cursor-pointer': option.val !== props.radioBtns[item.index].val,
                        }"
                        >{{ option.label }}</label
                    >
                </div>
            </div>
            <div
                v-else-if="item.name === 'checkBox' && props.checkBoxes[item.index]"
                class="flex gap-3 w-full mt-[0.875rem]"
            >
                <div
                    class="flex flex-col gap-3"
                    :style="{ width: 'calc(50% - 70px)' }"
                >
                    <div class="text-sm mb-[0.875rem]">
                        {{ props.checkBoxes[item.index][1].title }}
                    </div>
                    <div
                        v-for="option in props.checkBoxes[item.index][1].vals"
                        class="h-4 flex gap-2"
                        :key="option.val"
                    >
                        <input
                            type="checkbox"
                            :id="option.val"
                            :checked="props.checkBoxes[item.index][1].valsArr.includes(option.val)"
                            @change="
                                () => {
                                    $emit(
                                        'handleCheckboxClick',
                                        item.index,
                                        option.val,
                                        !props.checkBoxes[item.index][1].valsArr.includes(
                                            option.val,
                                        ),
                                        1,
                                    );
                                }
                            "
                        />
                        <label
                            class="select-none nowrap"
                            :class="{
                                'cursor-pointer': !props.checkBoxes[item.index][1].valsArr.includes(
                                    option.val,
                                ),
                            }"
                            :for="option.val"
                            >{{ option.label }}</label
                        >
                    </div>
                </div>
                <div class="w-[1px] h-[44px] bg-[#0B3D68] mt-[1.75rem] mx-6"></div>
                <div
                    class="flex flex-col gap-3"
                    :style="{ width: 'calc(50% - 10px)' }"
                >
                    <div class="text-sm mb-[0.875rem]">
                        {{ props.checkBoxes[item.index][2].title }}
                    </div>
                    <div
                        v-for="option in props.checkBoxes[item.index][2].vals"
                        class="h-4 flex gap-2"
                        :key="option.val"
                    >
                        <input
                            type="checkbox"
                            :id="option.val"
                            :checked="props.checkBoxes[item.index][2].valsArr.includes(option.val)"
                            @change="
                                () => {
                                    $emit(
                                        'handleCheckboxClick',
                                        item.index,
                                        option.val,
                                        !props.checkBoxes[item.index][2].valsArr.includes(
                                            option.val,
                                        ),
                                        2,
                                    );
                                }
                            "
                        />
                        <label
                            class="select-none nowrap"
                            :class="{
                                'cursor-pointer': !props.checkBoxes[item.index][2].valsArr.includes(
                                    option.val,
                                ),
                            }"
                            :for="option.val"
                            >{{ option.label }}</label
                        >
                    </div>
                </div>
            </div>
            <div
                v-else-if="item.name === 'input' && props.inputs[item.index]"
                class="flex items-center gap-3 mt-[0.875rem]"
                :class="{ 'absolute bottom-[1.75rem] left-0': props.inputs[item.index].inline }"
            >
                <div
                    v-if="props.inputs[item.index].subtitle"
                    class="text-sm text-[#8DC5F6] !h-full select-none flex items-center"
                >
                    {{ props.inputs[item.index].subtitle }}
                </div>
                <UiInput
                    :init-value="props.inputs[item.index].val"
                    :name="'i'"
                    initType="number"
                    class="table-cell w-16 !h-8 text-center !px-2"
                    :min-max="[props.inputs[item.index].min, props.inputs[item.index].max]"
                    :status="props.inputs[item.index].isError ? 'invalid' : 'valid'"
                    :input-type="['int']"
                    :nullable="false"
                    :required="true"
                    @status-changed="
                        emit(
                            'setInputError',
                            item.index,
                            $event === 'invalid' || $event === 'empty',
                        )
                    "
                    @value-changed="
                        $event === undefined ? '' : emit('handleInput', item.index, $event)
                    "
                />
            </div>
        </div>
        <div
            class="absolute bottom-0 -left-[40px] w-8 bg-[#0A2B47]"
            :style="{ height: 'calc(100% - 26px)' }"
            v-if="props.isLast"
        ></div>
        <div
            class="absolute -left-[36px] w-6 h-6 bg-[#0A2B47] rounded-[50%] border border-[#158EF8] text-sm text-[#158EF8] flex items-center justify-center"
            :class="props.isFirst ? 'top-[0.875rem]' : 'top-6'"
        >
            {{ props.numb + 1 }}
        </div>
    </div>
</template>

<script lang="ts" setup>
import UiInput from '@/components/Ui/UiInput.vue';

const props = defineProps<{
    numb: number;
    queue: {
        name:
            | 'title'
            | 'subTitle'
            | 'btns'
            | 'tabs'
            | 'dropDown'
            | 'radioBtns'
            | 'input'
            | 'checkBox';
        index: number;
    }[];
    isFirst: boolean;
    isLast: boolean;
    titles: string[];
    btns: {
        subtitle?: string;
        isGreen?: boolean;
        vals: { label: string | number; val: string | number; class?: string }[];
        val: string | number;
        inline?: boolean;
    }[];
    tabs: {
        vals: { label: string; val: string | number }[];
        val: string | number;
    }[];
    radioBtns: {
        vals: { label: string; val: string }[];
        val: string;
        groupName: string;
        wrap?: boolean;
    }[];
    checkBoxes: {
        1: {
            title: string;
            vals: { label: string; val: string }[];
            valsArr: string[];
        };
        2: {
            title: string;
            vals: { label: string; val: string }[];
            valsArr: string[];
        };
    }[];
    inputs: {
        val: number;
        min: number;
        max?: number;
        subtitle?: string;
        isError: boolean;
        inline?: boolean;
    }[];
}>();

const emit = defineEmits<{
    (e: 'handleBtnClick', btnsItemIndex: number, val: string | number): void;
    (e: 'handleTabClick', tabsItemIndex: number, val: string | number): void;
    (e: 'handleRadioBtnClick', radioBtnsItemIndex: number, val: string): void;
    (e: 'handleInput', inputItemIndex: number, val: number): void;
    (e: 'setInputError', inputItemIndex: number, res: boolean): void;
    (
        e: 'handleCheckboxClick',
        checkboxItemIndex: number,
        val: string,
        status: boolean,
        part: 1 | 2,
    ): void;
}>();
</script>

<style scoped>
.nowrap {
    text-wrap: nowrap;
}
</style>
