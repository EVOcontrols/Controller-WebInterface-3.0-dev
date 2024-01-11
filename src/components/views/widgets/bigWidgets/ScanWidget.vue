<template>
    <div class="flex-1 flex relative">
        <transition name="label">
            <div
                v-if="activeLabel"
                class="absolute -right-[7.6%] bg-[#092E4B] z-[2] h-[68px] w-[57.5%] rounded-r-[16px] p-4 pr-6 flex items-center select-none origin-top-left flex flex-col gap-[6px]"
                :style="{ top: activeLabelTop + 'px' }"
                @click.stop
            >
                <div class="flex w-full h-9 items-center">
                    <span
                        class="w-10 h-full flex items-center justify-center rounded-l-[8px] bg-[#194265] px-[6px] transition-colors duration-300"
                        >{{ activeLabel.i + 1 }}</span
                    >
                    <input
                        type="text"
                        :placeholder="placeholder"
                        ref="labelInput"
                        class="flex-1 bg-[#123553] h-full text-[#8DC5F6] px-3 placeholder:text-[#8DC5F6]"
                    />
                </div>
            </div>
        </transition>
        <div
            class="w-[50%] flex overflow-y-auto scrollbar-4 flex-1"
            :style="{ height: 'calc(100vh - 410px)' }"
        >
            <draggable
                class="list-group py-[18px] w-full"
                data-list="idsList"
                :list="idsList"
                group="bionicles"
                itemKey="element.id+'-'+index"
                :move="handleMoveItem"
                @end="handleDragEndItem"
                :options="{ animation: 500 }"
                ref="scrollEl"
            >
                <template #item="{ element, index }">
                    <div
                        v-if="element.id !== '0000000000000000'"
                        class="list-group-item label group w-full flex text-[#6CB5D3] items-center transition-colors duration-500 rounded select-none hover:bg-[#0C2F4D] gap-2 min-h-[30px] px-[18px]"
                    >
                        <span>{{ index + 1 }}</span>
                        <span class="flex-1">{{ element.id }}</span>
                        <CloseIcon
                            class="label-close cursor-pointer rotate-45"
                            @click="addId(element.id, index)"
                        />
                    </div>
                </template>
            </draggable>
        </div>
        <div
            class="w-[50%] border-l border-[#1D4162] flex overflow-y-auto scrollbar-4 flex-1"
            :style="{ height: 'calc(100vh - 410px)' }"
            id="scrollWrapper"
            @scroll="handleScroll"
        >
            <draggable
                class="list-group py-[18px] w-full"
                data-list="valsList"
                :list="valsList"
                group="bionicles"
                itemKey="element.id+'-'+index"
                :move="handleMoveItem"
                @end="handleDragEndItem"
                :options="{ animation: 500 }"
                id="scrollEl"
            >
                <template #item="{ element, index }">
                    <div
                        v-if="w.w.i === '1w-sens'"
                        class="list-group-item group w-full flex items-center transition-colors duration-500 rounded select-none gap-2 min-h-[30px] px-[18px]"
                        :class="[
                            { label: element.val[0] !== null },
                            {
                                'hover:bg-[#0C2F4D]': element.val[0] !== null,
                            },
                        ]"
                        @dblclick="handleDblClick(element.val[0], index)"
                    >
                        <span
                            :class="element.val[0] === null ? 'text-[#194F76]' : 'text-[#6CB5D3]'"
                            >{{ index + 1 }}</span
                        >
                        <span class="flex-1 text-[#6CB5D3]">{{
                            element.val[0] !== null ? 'label' : ''
                        }}</span>
                        <span
                            v-if="element.val[0] !== null"
                            :class="element.val[0] > 0 ? 'text-[#EB8246]' : 'text-[#35A1FF]'"
                            >{{
                                tempUnit === '°C'
                                    ? `${Math.round(element.val[0] / 10) / 10}°C`
                                    : `${(Math.round(element.val[0] / 10) / 10) * 1.8 + 32}°F`
                            }}</span
                        >
                        <CloseIcon
                            v-if="element.val[0] !== null"
                            class="label-close cursor-pointer"
                            @click="removeId(index)"
                        />
                    </div>
                    <div
                        v-else
                        class="list-group-item group w-full flex items-center transition-colors duration-500 rounded select-none gap-2 min-h-[30px] px-[18px]"
                        :class="[
                            { label: element.val !== null },
                            { 'hover:bg-[#0C2F4D]': element.val !== null },
                        ]"
                        @dblclick="handleDblClick(element.val, index)"
                    >
                        <span :class="element.val === null ? 'text-[#194F76]' : 'text-[#6CB5D3]'">{{
                            index + 1
                        }}</span>
                        <span class="flex-1 text-[#6CB5D3]">{{
                            element.val !== null ? 'label' : ''
                        }}</span>
                        <CloseIcon
                            v-if="element.val !== null"
                            class="label-close cursor-pointer"
                            @click="removeId(index)"
                        />
                    </div>
                </template>
            </draggable>
        </div>
        <div
            class="absolute w-full h-full flex items-center justify-center transition-all duration-500"
            :class="loading ? 'opacity-100' : 'opacity-0'"
            :style="[{ background: 'rgba(9, 39, 64, 0.75)' }, { 'z-index': loading ? '2' : -1 }]"
        >
            <span class="loader"></span>
        </div>
    </div>
</template>
<script>
import draggable from 'vuedraggable';
import CloseIcon from '@/components/toast/CloseIcon.vue';
import delay from 'delay';

export default {
    components: {
        draggable,
        CloseIcon,
    },
    props: ['idsArr', 'vals', 'OWIds', 'w', 'tempUnit', 'isLoading'],
    data() {
        return {
            idsList: [],
            valsList: [],
            idsTimer: undefined,
            valsTimer: undefined,
            loadTimer: undefined,
            loading: false,
            activeLabel: null,
            isActiveLabel: false,
            activeLabelTop: 10,
            scrollTop: 0,
            isScrolling: false,
            labelInput: undefined,
        };
    },
    computed: {
        placeholder() {
            return this.t('placeholder');
        },
    },
    methods: {
        handleDragEndItem() {
            if (this.originalList === this.futureList) {
                this.movingItem = this[this.futureList][this.originalIndex];
                this.futureItem = this[this.futureList][this.futureIndex];

                if (this.movingItem && this.futureItem) {
                    let _list = Object.assign([], this[this.futureList]);
                    _list[this.futureIndex] = this.movingItem;
                    _list[this.originalIndex] = this.futureItem;
                    this[this.futureList] = _list;
                }
            } else {
                this.movingItem = this[this.originalList][this.originalIndex];
                this.futureItem = this[this.futureList][this.futureIndex];

                if (this.movingItem && this.futureItem) {
                    let _listFrom = Object.assign([], this[this.originalList]);
                    let _listTo = Object.assign([], this[this.futureList]);
                    _listTo[this.futureIndex] = this.movingItem;
                    _listFrom[this.originalIndex] = this.futureItem;
                    this[this.originalList] = _listFrom;
                    this[this.futureList] = _listTo;
                }
            }
            document
                .querySelectorAll('.list-group-item')
                .forEach((el) => el.classList.remove('bg-[#0C2F4D]'));
            if (!(this.originalList === this.futureList && this.originalList === 'idsList')) {
                clearTimeout(this.idsTimer);
                clearTimeout(this.valsTimer);
                this.idsTimer = undefined;
                this.valsTimer = undefined;
                this.$emit(
                    'toggleScan',
                    this.valsList.map((el) => el.id),
                );
                this.awaitLoading();
                this.loading = true;
            }
        },
        handleMoveItem(event) {
            document
                .querySelectorAll('.list-group-item')
                .forEach((el) => el.classList.remove('bg-[#0C2F4D]'));
            const { index, futureIndex } = event.draggedContext;
            this.originalIndex = index;
            this.futureIndex = futureIndex;
            this.originalList = event.from.getAttribute('data-list');
            this.futureList = event.to.getAttribute('data-list');
            if (this[this.futureList][this.futureIndex]) {
                event.to.children[this.futureIndex].classList.add('bg-[#0C2F4D]');
            }
            return false;
        },
        setIds() {
            const curIds = this.OWIds[this.w.w.d][this.w.w.bus] || [];
            const arr = [];
            this.idsArr.forEach((id) => {
                if (!curIds.includes(id)) {
                    arr.push(id);
                }
            });
            const newArr = arr.map((el) => Object.assign({ id: el, val: [null, null] }));
            this.idsList = [...newArr];
            this.idsTimer = setTimeout(this.setIds, 1000);
        },
        setVals() {
            const curIds = this.OWIds[this.w.w.d][this.w.w.bus] || [];
            const newArr = [];
            for (let i = 0; i < this.vals.length; i += 1) {
                newArr.push({ id: curIds[i], val: this.vals[i] });
            }
            this.valsList = [...newArr];
            this.valsTimer = setTimeout(this.setVals, 1000);
        },
        async awaitLoading() {
            if (this.isLoading) {
                clearTimeout(this.loadTimer);
                this.loadTimer = undefined;
                this.setIds();
                this.setVals();
                await delay(2000);
                this.loading = false;
            } else {
                this.loadTimer = setTimeout(this.awaitLoading, 200);
            }
        },
        addId(id, index) {
            const place =
                this.w.w.i === '1w-sens'
                    ? this.valsList.findIndex((el) => el.val[0] === null)
                    : this.valsList.findIndex((el) => el.val === null);
            const vals = [...this.valsList];
            vals[place].id = id;
            this.valsList = [...vals];
            let ids = [...this.idsList];
            ids.splice(index, 1);
            this.idsList = [...ids];
            clearTimeout(this.idsTimer);
            clearTimeout(this.valsTimer);
            this.idsTimer = undefined;
            this.valsTimer = undefined;
            this.$emit(
                'toggleScan',
                this.valsList.map((el) => el.id),
            );
            this.awaitLoading();
            this.loading = true;
        },
        removeId(index) {
            const vals = [...this.valsList];
            vals[index].id = '0000000000000000';
            vals[index].val = [null, null];
            this.valsList = [...vals];
            clearTimeout(this.idsTimer);
            clearTimeout(this.valsTimer);
            this.idsTimer = undefined;
            this.valsTimer = undefined;
            this.$emit(
                'toggleScan',
                this.valsList.map((el) => el.id),
            );
            this.awaitLoading();
            this.loading = true;
        },
        handleScroll() {
            const el = document.getElementById('scrollWrapper');
            this.scrollTop = el.scrollTop;
        },
        handleDblClick(s, index) {
            if (s === null) return;
            this.activeLabel = { i: index, state: s };
            this.setActiveLabelTop();
            window.addEventListener('click', this.saveData);
            window.addEventListener('keypress', this.saveData);
        },
        setActiveLabelTop() {
            const wrapper = document.getElementById('scrollWrapper');
            const el = document.getElementById('scrollEl');
            if (!this.activeLabel || !wrapper || !el) return;
            const top = this.activeLabel.i * 30 - this.scrollTop + 10;
            if (top < 0) {
                this.activeLabelTop = 0;
            } else if (Math.round(top) > wrapper.offsetHeight - 68) {
                setTimeout(() => {
                    if (!this.activeLabel) return;
                    this.isScrolling = true;
                    wrapper.scrollTo({
                        top: this.activeLabel.i * 30 + 78 - wrapper.offsetHeight,
                        behavior: 'smooth',
                    });
                }, 0);
                setTimeout(() => {
                    this.isScrolling = false;
                }, 300);
                this.activeLabelTop = wrapper.offsetHeight - 68;
            } else {
                this.activeLabelTop = top;
            }
        },
        saveData(e) {
            if (!this.activeLabel) return;
            if (e.type === 'keypress') {
                if (e.key === 'Enter') {
                    this.activeLabel = null;
                    this.isLabelChange = false;
                }
            } else if (e.type === 'click') {
                this.activeLabel = null;
                this.isLabelChange = false;
            }
        },
    },
    watch: {
        scrollTop() {
            if (!this.isScrolling) this.setActiveLabelTop();
        },
    },
    mounted() {
        this.setIds();
        this.setVals();
    },
    unmounted() {
        clearTimeout(this.idsTimer);
        clearTimeout(this.valsTimer);
        clearTimeout(this.loadTimer);
        this.loadTimer = undefined;
        this.idsTimer = undefined;
        this.valsTimer = undefined;
        window.removeEventListener('click', this.saveData);
        window.removeEventListener('keypress', this.saveData);
    },
    setup() {
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
        return { t };
    },
};
</script>
<style scoped>
.label {
    cursor: move;
}
.loader {
    width: 48px;
    height: 48px;
    border: 5px solid #148ef8;
    border-bottom-color: transparent;
    border-radius: 50%;
    display: inline-block;
    box-sizing: border-box;
    animation: rotation 1s linear infinite;
}

@keyframes rotation {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}
</style>
