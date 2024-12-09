<template>
    <input
        type="text"
        class="rounded-lg h-[2.563rem] bg-[#0f304b] px-4 text-[#84b5e3] text-sm leading-[1.143] focus:bg-[#113b5e] placeholder:text-[#5183b1] error:bg-[#451f3e] error:text-[#f83068]"
        :class="[
            {
                error: status === 'invalid' || status === 'not-allowed',
            },
        ]"
        spellcheck="false"
        v-model.trim="value"
        :required="required"
        :maxlength="maxLength"
        :autofocus="autofocus"
        :placeholder="placeholder"
        :disabled="disabled"
        autocomplete="off"
        @focus="onFocus"
        :name="name"
    />
</template>

<script
    setup
    lang="ts"
    generic="
        T extends 'string' | 'number',
        U extends boolean,
        V extends (T extends 'string' ? string : number) | (U extends true ? null : never)
    "
>
import type { InputFieldStatus } from '@/typings/common';

const props = withDefaults(
    defineProps<{
        initValue: V | undefined;
        initType: T;
        name: string;
        status?: InputFieldStatus;
        minMax?: [number | undefined, number | undefined];
        required?: boolean;
        maxLength?: number;
        autofocus?: boolean;
        autoSelect?: boolean;
        notAllowedValues?: (number | string)[];
        placeholder?: string;
        disabled?: boolean;
        inputType?: ('ip' | 'url')[] | ['int'] | ['latitude'] | ['longitude'] | ['string'];
        nullable?: U;
        debounceDelay?: number;
    }>(),
    {
        autoSelect: false,
        debounceDelay: 10,
    },
);

const emit = defineEmits<{
    (e: 'valueChanged', value: V | undefined): void;
    (e: 'statusChanged', status: InputFieldStatus): void;
}>();

let lastInitValue = props.initValue;

const value = ref<string>(props.initValue?.toString() || '');

function setStatus(status: InputFieldStatus) {
    emit('statusChanged', status);
}

function isIp(v: string) {
    return /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(
        v,
    );
}

function isUrl(v: string) {
    return /^(https?:\/\/)?((([-a-z0-9]{1,63}\.)*?[a-z0-9]([-a-z0-9]{0,253}[a-z0-9])?\.[a-z]{2,63})|((\d{1,3}\.){3}\d{1,3}))(:\d{1,5})?((\/|\?)((%[0-9a-f]{2})|[-\w\\+\\.\\?\\/@~#&=])*)?$/.test(
        v,
    );
}

function isLatitude(v: string) {
    return /^\d{1,4}\.\d{1,4}[NS]$/i.test(v);
}

function isLongitude(v: string) {
    return /^\d{1,4}\.\d{1,4}[EW]$/i.test(v);
}

function isFitValidationType(v: string) {
    if (!props.inputType) return true;
    return props.inputType.some((t) => {
        switch (t) {
            case 'ip':
                return isIp(v);
            case 'url':
                return isUrl(v);
            case 'latitude':
                return isLatitude(v);
            case 'longitude':
                return isLongitude(v);
            default:
                return true;
        }
    });
}

function valueChangedHandler() {
    const v = value.value;
    if (!v) {
        if (props.required) {
            setStatus('invalid');
        } else {
            setStatus('empty');
        }
        lastInitValue = undefined;
        emit('valueChanged', undefined);
        return;
    }
    if (props.initType === 'string') {
        if (props.notAllowedValues?.includes(v)) {
            setStatus('not-allowed');
            return;
        }
        if (v && !isFitValidationType(v)) {
            setStatus('invalid');
            return;
        }
        if (['apn', 'user', 'password'].includes(props.name)) {
            setStatus(/^(?![\d+_@.-]+$)[a-zA-Z0-9+_@.-]{1,31}$/i.test(v) ? 'valid' : 'invalid');
            lastInitValue = v as V;
            emit('valueChanged', v as V);
            return;
        }
        if (['root-name', 'user-name'].includes(props.name)) {
            //TODO
            setStatus(/^[a-zA-Z0-9]{4,31}$/.test(v) ? 'valid' : 'invalid');
            lastInitValue = v as V;
            emit('valueChanged', v as V);
            return;
        }
        lastInitValue = v as V;
        emit('valueChanged', v as V);
    } else if (v) {
        const parsed = parseFloat(v.replace(/,/, '.'));
        if (isNaN(parsed)) {
            setStatus('invalid');
            return;
        }
        if (props.minMax?.[0] !== undefined && parsed < props.minMax[0]) {
            setStatus('invalid');
            return;
        }
        if (props.minMax?.[1] !== undefined && parsed > props.minMax[1]) {
            setStatus('invalid');
            return;
        }
        if (props.notAllowedValues?.includes(parsed)) {
            setStatus('not-allowed');
            return;
        }
        if (props.inputType?.[0] === 'int' && parseInt(v).toString() !== v) {
            setStatus('invalid');
            return;
        }
        if (props.name.includes('port') && +v > 65535) {
            setStatus('invalid');
            return;
        }
        if (props.name === 'interval' && +v > 300000) {
            setStatus('invalid');
            return;
        }
        if (parsed !== lastInitValue) {
            lastInitValue = parsed as V;
            emit('valueChanged', parsed as V);
        }
    } else if (props.nullable === true) {
        lastInitValue = null as V;
        emit('valueChanged', null as V);
    }
    setStatus(v ? 'valid' : 'empty');
}

watchDebounced(
    value,
    () => {
        valueChangedHandler();
    },
    { immediate: true, debounce: props.debounceDelay },
);

watchDebounced(
    [() => props.notAllowedValues, () => props.required],
    () => {
        valueChangedHandler();
    },
    { debounce: props.debounceDelay },
);

watch(
    () => props.initValue,
    (v) => {
        if (v === lastInitValue) return;
        value.value = v?.toString() || '';
    },
);

watch([() => props.minMax?.[0], () => props.minMax?.[1]], valueChangedHandler);

function onFocus(e: FocusEvent) {
    if (props.autoSelect === false) return;
    (e.target as HTMLInputElement)?.select();
}

onBeforeUnmount(() => {
    emit('statusChanged', 'empty');
});
</script>
