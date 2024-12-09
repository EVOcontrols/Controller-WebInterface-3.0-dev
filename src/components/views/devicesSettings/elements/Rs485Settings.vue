<template>
    <div class="mt-8 border-b border-[#0b3d68] pb-10 w-full">
        <h2 class="font-semibold text-xl leading-[1.2] whitespace-pre mb-[1.125rem]">
            {{ t('rsSettings', { counter: getCounter(index) }) }}
        </h2>
        <div class="flex flex-row items-center">
            <div class="text-[#6d9cc5] text-sm leading-[1.143] mr-[0.875rem]">
                {{ t('portMode') }}
            </div>
            <ButtonGroup
                :buttons="
                    modbusModes.map((v) => {
                        if (v === 'card-reader' && props.settings.mode !== 'card-reader') {
                            return null;
                        }
                        if (v === 'ext-devs' && props.settings.mode !== 'ext-devs') {
                            return { text: t(`portModes.${v}`), value: v, isDisabled: props.isUseExtDevsNow };
                        }
                        return { text: t(`portModes.${v}`), value: v };
                    })
                "
                :value="props.settings.mode"
                additional-classes="px-4"
                @change="emit('changeMode', $event)"
            />
        </div>
        <CollapseTransition :duration="300">
            <div v-if="props.settings.mode !== 'off'">
                <div class="flex flex-row mt-[2.8rem]">
                    <div class="text-[#6d9cc5] text-sm leading-[1.143] mr-[0.875rem]">
                        {{ t('speed') }}
                    </div>
                    <InputRange
                        :value="props.settings.rate"
                        @change="emit('changeRate', $event)"
                    />
                </div>
                <div class="flex flex-row items-center mt-[2.5rem]">
                    <div class="text-[#6d9cc5] text-sm leading-[1.143] mr-[0.875rem]">
                        {{ t('parity') }}
                    </div>
                    <ButtonGroup
                        :buttons="modbusParities.map((v) => ({ text: t(`parities.${v}`), value: v }))"
                        :value="props.settings.parity"
                        additional-classes="px-4"
                        @change="emit('changeParity', $event)"
                    />
                </div>
                <div class="flex flex-row items-center mt-[2.75rem]">
                    <div class="text-[#6d9cc5] text-sm leading-[1.143] mr-[0.875rem]">
                        {{ t('stop') }}
                    </div>
                    <ButtonGroup
                        :buttons="([1, 2] as const).map((v) => ({ text: v.toString(), value: v }))"
                        :value="props.settings.stop"
                        additional-classes="px-4"
                        @change="emit('changeStop', $event)"
                    />
                </div>
                <div
                    v-if="props.settings.mode === 'variables'"
                    class="flex flex-row items-center mt-[2.75rem]"
                >
                    <div class="text-[#6d9cc5] text-sm leading-[1.143] mr-5 whitespace-pre">
                        {{ t('numberingSystem') }}
                    </div>
                    <ButtonGroup
                        :buttons="numberingSystems.map((v) => ({ text: v.toUpperCase(), value: v }))"
                        :value="numberingSystem"
                        additional-classes="px-4"
                        @change="emit('changeNumberingSystem', $event)"
                    />
                </div>
                <AdvancedSettingsButton
                    :is-expanded="!!isAdvancedSettingsExpanded"
                    :is-error="!!advancedSettingsHaveError"
                    @click="isAdvancedSettingsExpanded = !isAdvancedSettingsExpanded"
                />
                <CollapseTransition :duration="300">
                    <div
                        v-show="isAdvancedSettingsExpanded"
                        class=""
                    >
                        <div class="table w-max mt-5">
                            <div
                                v-for="p in rsAdvancedParams[props.settings.mode as 'variables' | 'ext-devs']"
                                :key="`${props.settings.mode}${p.param}`"
                                class="table-row h-[3.43rem] align-top last:h-10"
                            >
                                <div class="text-[#6d9cc5] text-sm leading-[1.143] table-cell pr-4">
                                    {{ `${p.label}:` }}
                                </div>
                                <UiInput
                                    :init-value="
                                        isKeyOf(
                                            props.settings.advanced[props.settings.mode as 'variables' | 'ext-devs'],
                                            p.param,
                                        )
                                            ? props.settings.advanced[props.settings.mode as 'variables' | 'ext-devs'][
                                                  p.param
                                              ]
                                            : undefined
                                    "
                                    :name="p.param"
                                    initType="number"
                                    class="table-cell w-16 text-center !px-2"
                                    :min-max="[p.min, p.max]"
                                    :status="fieldsInvalidStatuses.has(`modbus-${p.param}`) ? 'invalid' : 'valid'"
                                    :input-type="['int']"
                                    @status-changed="
                                        $event === 'invalid' || $event === 'not-allowed'
                                            ? emit('toggleInvalidFieldStatus', `modbus-${p.param}`, 'add')
                                            : emit('toggleInvalidFieldStatus', `modbus-${p.param}`, 'delete')
                                    "
                                    @value-changed="
                                        (e?: number) => {
                                            if (props.settings.mode === 'off') return;
                                            emit('changeAdvancedParam', p.param as any, e);
                                        }
                                    "
                                />
                                <!-- <div
                                    class="text-[#ed4272] text-sm leading-[1.143] invisible opacity-0 transition-[opacity,visibility] error:visible error:opacity-100 pl-4 table-cell"
                                    :class="{
                                        error: fieldsInvalidStatuses.has(`modbus-${p.param}`),
                                    }"
                                >
                                    {{
                                        t('integerFromTo', {
                                            from: p.min,
                                            to: p.max,
                                        })
                                    }}
                                </div> -->
                            </div>
                        </div>
                    </div>
                </CollapseTransition>
            </div>
        </CollapseTransition>
    </div>
</template>

<script lang="ts" setup generic="T extends NGCSettings['modbuses'][number]">
import type { NGCSettings } from '@/typings/settings';
import ButtonGroup from '@/components/Ui/ButtonGroup.vue';
import InputRange from './InputRange.vue';
import UiInput from '@/components/Ui/UiInput.vue';
import AdvancedSettingsButton from '@/components/views/devicesSettings/elements/AdvancedSettingsButton.vue';
import CollapseTransition from '@/components/CollapseTransition.vue';

const props = defineProps<{
    index: number;
    isUseExtDevsNow: boolean;
    settings: NGCSettings['modbuses'][number];
    fieldsInvalidStatuses: Set<string>; // Only fields with 'modbus-' prefix
    numberingSystem: NGCSettings['numberingSystem'];
}>();

const emit = defineEmits<{
    (e: 'toggleInvalidFieldStatus', field: string, action: 'add' | 'delete'): void;
    (e: 'changeMode', mode: T['mode']): void;
    (e: 'changeRate', rate: T['rate']): void;
    (e: 'changeParity', parity: T['parity']): void;
    (e: 'changeStop', stop: T['stop']): void;
    (e: 'changeNumberingSystem', numberingSystem: NGCSettings['numberingSystem']): void;
    (e: 'changeAdvancedParam', param: 'cycle-delay', value?: number): void;
}>();

const isAdvancedSettingsExpanded = ref(false);

const advancedSettingsHaveError = computed(() => props.fieldsInvalidStatuses.size > 0);

const rsAdvancedParams = {
    variables: [
        { param: 'read-tmo', label: 'read-tmo', min: 0, max: 65535 },
        { param: 'write-tmo', label: 'write-tmo', min: 0, max: 65535 },
        { param: 'read-delay', label: 'read-delay', min: 0, max: 65535 },
        { param: 'write-delay', label: 'write-delay', min: 0, max: 65535 },
        { param: 'cycle-delay', label: 'cm-ddy', min: 0, max: 65535 },
    ],
    'ext-devs': [
        { param: 'get-tmo', label: 'get-tmo', min: 0, max: 65535 },
        { param: 'set-tmo', label: 'set-tmo', min: 0, max: 65535 },
        { param: '1w-scan-tmo', label: '1w-scan-tmo', min: 0, max: 65535 },
        { param: 'set-cfg-tmo', label: 'set-cfg-tmo', min: 0, max: 65535 },
        { param: 'cycle-delay', label: 'cycle-delay', min: 0, max: 65535 },
    ],
    'card-reader': [{ param: 'valid-time', label: 'valid-time', min: 0, max: 65535 }],
} as const;

function getCounter(index: number): string {
    const { locale } = useI18n();
    const count = index + 1;
    if (locale.value === 'ru') {
        switch (count) {
            case 1:
                return 'первой';
            case 2:
                return 'второй';
            case 3:
                return 'третьей';
            default:
                return `${count}`;
        }
    }

    switch (count) {
        case 1:
            return 'first';
        case 2:
            return 'second';
        case 3:
            return 'third';
        default:
            return `${count}`;
    }
}

const { t } = useI18n({
    messages: {
        en: {
            rsSettings: 'RS485 {counter} bus settings',
            portMode: 'Port mode',
            portModes: {
                off: 'OFF',
                variables: 'MODBUS VARIABLES',
                'ext-devs': 'EXTENSION DEVICES',
                'card-reader': 'CARD READER',
            },
            speed: 'Speed',
            parity: 'Parity',
            parities: {
                none: 'NONE',
                even: 'EVEN',
                odd: 'ODD',
            },
            stop: 'Stop bit',
            numberingSystem: 'Default display \nof registers and values',
        },
        ru: {
            rsSettings: 'Настройки {counter} шины RS485',
            portMode: 'Режим работы порта',
            portModes: {
                off: 'ОТКЛЮЧЕН',
                variables: 'ПЕРЕМЕННЫЕ MODBUS',
                'ext-devs': 'УСТРОЙСТВА РАСШИРЕНИЯ',
                'card-reader': 'КАРТРИДЕР',
            },
            speed: 'Скорость',
            parity: 'Четность',
            parities: {
                none: 'НЕТ',
                even: 'ЧЕТНЫЙ',
                odd: 'НЕЧЕТНЫЙ',
            },
            stop: 'Стоп-бит',
            numberingSystem: 'Отображение регистров \nи значений по умолчанию',
        },
    },
});
</script>
