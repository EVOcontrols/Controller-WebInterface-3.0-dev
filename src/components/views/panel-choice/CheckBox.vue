<template>
    <div class="vs-checkbox-con XXsnipcss_extracted_selector_selectionXX">
        <input
            type="checkbox"
            class="vs-checkbox"
            :disabled="props.isDisabled"
            @change.prevent="$emit('change')"
            :checked="props.isAllChosen && !notConnected"
        />
        <div
            class="vs-checkbox-mask"
            :class="{ isDisabled }"
        >
            <i
                class="vs-icon-check"
                :class="{ isDisabled }"
            >
                <span>
                    <div class="line1" />
                    <div class="line2" />
                </span>
            </i>
        </div>
    </div>
</template>

<script lang="ts" setup>
const props = defineProps<{
    isDisabled: boolean;
    isAllChosen: boolean;
}>();

const isAllChosen = ref(props.isAllChosen);

const emit = defineEmits<{
    (e: 'change'): void;
}>();

const indexStore = useIndexStore();

const { notConnected } = storeToRefs(indexStore);
</script>

<style lang="postcss" scoped>
.vs-checkbox-con {
    width: 23px;
    height: 23px;
    border-radius: 9px;
    position: relative;
    z-index: 1;
    border-radius: 9px;
    transform: scale(0.7);
}

input {
    outline: none;
    outline-color: initial;
    outline-style: none;
    outline-width: initial;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
}

.vs-checkbox {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    margin: 0;
    padding: 0;
    opacity: 0;
    z-index: 100;
    cursor: pointer;
    margin: 0px;
    padding: 0px;
    &:disabled {
        cursor: default !important;
    }
}

.vs-checkbox-mask {
    border-radius: 20%;
    width: 100%;
    height: 100%;
    position: absolute;
    z-index: 50;
    cursor: pointer;
    pointer-events: none;
    transition: all 0.25s ease;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    -webkit-box-pack: center;
    -ms-flex-pack: center;
    justify-content: center;
    z-index: -1;
    box-sizing: border-box;
    .nc & {
        cursor: default !important;
    }
}

.vs-checkbox:checked ~ .vs-checkbox-mask {
    box-shadow: 0 0 0 0 rgba(var(--vs-color), 0.35);
}

.vs-checkbox-mask:after,
.vs-checkbox-mask:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
}

.vs-checkbox-mask:before {
    border-radius: inherit;
    transition: all 0.25s ease;
    border: 1.7px solid #305d86;
    box-sizing: border-box;
    border-radius: inherit;
}
label:hover .vs-checkbox-mask:before {
    border-color: #2298ff;
}

.nc label .vs-checkbox-mask:before {
    border-color: #193e60;
}

.vs-checkbox:checked ~ .vs-checkbox-mask:before {
    opacity: 0;
    transform: scale(1.2);
}

.vs-checkbox-mask:after,
i:not(.vs-icon-check) {
    opacity: 0;
    transition: all 0.25s ease;
    transform: scale(0.5);
}

.vs-checkbox-mask:after {
    background: #148ef8;
    border-radius: inherit;
}

.nc .vs-checkbox-mask:after {
    background: #0e2b45;
}
.nc .vs-checkbox:checked ~ .vs-checkbox-mask:before {
    opacity: 1;
    transform: scale(1);
    z-index: 1;
}

.vs-checkbox:checked ~ .vs-checkbox-mask:after {
    opacity: 1;
    transform: scale(1);
}

.vs-icon-check {
    width: 23px;
    height: 23px;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    -webkit-box-pack: center;
    -ms-flex-pack: center;
    justify-content: center;
    transition: all 0.25s ease;
    border-radius: inherit;
}

.vs-checkbox-mask .vs-icon-check {
    opacity: 0;
    z-index: 200;
    transform: scale(0.9);
}

.vs-checkbox:checked ~ .vs-checkbox-mask .vs-icon-check {
    opacity: 1;
}

.vs-icon-check span {
    transform: rotate(49deg);
    display: block;
    position: relative;
    width: 6px;
    height: 13px;
    margin-top: -5px;
}

.vs-icon-check span .line1 {
    background: transparent;
    content: '';
    position: absolute;
    height: 2px;
    transition: all 0.2s ease;
    border-radius: 5px;
    z-index: 100;
    width: 7px;
    bottom: 0;
    background: initial;
    background-color: transparent;
}

.vs-icon-check span .line1:after {
    content: '';
    position: absolute;
    width: 0;
    height: 3px;
    transition: all 0.25s ease;
    background: initial;
    background-color: #adebff;
}

.vs-checkbox:checked ~ .vs-checkbox-mask .vs-icon-check span .line1:after {
    width: 100%;
    transition: all 0.25s ease 0.1s;
}

.nc .vs-icon-check span .line1:after {
    background-color: #3e688e;
    transition-delay: 0s !important;
}

.vs-icon-check span .line2 {
    bottom: 0;
    right: 0;
    z-index: 100;
    background: transparent;
    content: '';
    position: absolute;
    height: 12px;
    transition: all 0.2s ease;
    width: 2px;
    background: initial;
    background-color: transparent;
}

.vs-icon-check span .line2:after {
    content: '';
    position: absolute;
    width: 3px;
    height: 0%;
    transition: all 0.25s ease;
    bottom: 0;
    background: initial;
    background-color: #adebff;
}

.vs-checkbox:checked ~ .vs-checkbox-mask .vs-icon-check span .line2:after {
    transition: all 0.2s ease 0.3s;
    height: 100%;
}

.nc .vs-icon-check span .line2:after {
    background-color: #3e688e;
    transition-delay: 0s !important;
}
</style>
