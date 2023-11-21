<template>
    <div v-if="settings">
        <ManageDevice
            :is-reboot-required="isRebootRequired"
            :device-addr="0"
            :device-state="undefined"
            :reboot-trigger="rebootTrigger"
            @ngc-rebooted-manually="isRebootRequired = false"
        />
        <Rs485Settings
            :settings="settings.modbus"
            :numbering-system="settings.numberingSystem"
            :fields-invalid-statuses="
                new Set([...fieldsInvalidStatuses].filter((s) => s.startsWith('modbus')))
            "
            @toggle-invalid-field-status="
                (field: string, action: 'add' | 'delete') => {
                    if (action === 'add') {
                        fieldsInvalidStatuses.add(field);
                    } else {
                        fieldsInvalidStatuses.delete(field);
                    }
                }
            "
            @change-mode="settings.modbus.mode = $event"
            @change-rate="settings.modbus.rate = $event"
            @change-parity="settings.modbus.parity = $event"
            @change-stop="settings.modbus.stop = $event"
            @change-numbering-system="settings.numberingSystem = $event"
            @change-advanced-param="
                (param, value) => {
                    if (!settings || settings.modbus.mode === 'off') return;
                    settings.modbus.advanced[settings.modbus.mode][param] = value;
                }
            "
        />
        <div
            v-for="topic in topics"
            :key="topic"
            class="mt-8 flex flex-col border-b border-[#0b3d68] last:border-none pb-10"
        >
            <h2 class="font-semibold text-xl leading-[1.2] whitespace-pre">
                {{ t(topic) }}
            </h2>
            <div v-if="topic === '1-wire'">
                <h3 class="text-sm leading-[1.143] mt-[1.125rem] mb-5">
                    {{ t('work-mode') }}
                </h3>
                <div class="table w-max">
                    <div
                        v-for="(w, i) in settings['1-wire']"
                        :key="i"
                        class="table-row h-11 align-top last:h-[1.875rem]"
                    >
                        <div class="text-[#6d9cc5] text-sm leading-[1.143] table-cell pr-4">
                            {{ `${t('bus')} ${i + 1}` }}
                        </div>
                        <ButtonGroup
                            :buttons="oneWireBuses"
                            :value="w.mode"
                            class="table-cell"
                            @change="w.mode = $event"
                        />
                    </div>
                </div>
                <AdvancedSettingsButton
                    :is-expanded="isAdvancedSettingsExpanded.oneWire"
                    :is-error="!!advancedSettingsHaveError.oneWire"
                    @click="
                        isAdvancedSettingsExpanded.oneWire = !isAdvancedSettingsExpanded.oneWire
                    "
                />
                <CollapseTransition :duration="300">
                    <div v-show="isAdvancedSettingsExpanded.oneWire">
                        <div class="table w-max mt-5 border-collapse">
                            <div
                                v-for="(w, i) in settings['1-wire']"
                                :key="i"
                                class="table-row-group [&:last-child>div:last-child]:!h-10"
                            >
                                <div
                                    v-for="(p, y) in oneWiresParams[i]"
                                    :key="p.param"
                                    class="table-row h-[3.43rem] align-top"
                                >
                                    <div
                                        class="text-[#6d9cc5] text-sm leading-[1.143] table-cell pr-9"
                                    >
                                        {{ y ? '' : `${t('bus')} ${i + 1}` }}
                                    </div>
                                    <div
                                        class="text-[#6d9cc5] text-sm leading-[1.143] table-cell pr-2.5"
                                    >
                                        {{ p.label }}
                                    </div>
                                    <UiInput
                                        :init-value="w[p.param]"
                                        :name="p.param"
                                        initType="number"
                                        class="table-cell w-16 text-center !px-2"
                                        :min-max="[p.min, p.max]"
                                        :status="
                                            fieldsInvalidStatuses.has(`1-wire-${i}-${p.param}`)
                                                ? 'invalid'
                                                : 'valid'
                                        "
                                        :input-type="['int']"
                                        @status-changed="
                                            $event === 'invalid' || $event === 'not-allowed'
                                                ? fieldsInvalidStatuses.add(
                                                      `1-wire-${i}-${p.param}`,
                                                  )
                                                : fieldsInvalidStatuses.delete(
                                                      `1-wire-${i}-${p.param}`,
                                                  )
                                        "
                                        @value-changed="
                                            $event === undefined ? '' : (w[p.param] = $event)
                                        "
                                    />
                                    <div
                                        class="text-[#ed4272] text-sm leading-[1.143] invisible opacity-0 transition-[opacity,visibility] error:visible error:opacity-100 pl-4 table-cell"
                                        :class="{
                                            error: fieldsInvalidStatuses.has(
                                                `1-wire-${i}-${p.param}`,
                                            ),
                                        }"
                                    >
                                        {{ t('integerFromTo', { from: p.min, to: p.max }) }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </CollapseTransition>
            </div>
            <div v-else-if="topic === 'adc-in'">
                <div class="table w-max border-spacing-y-3.5">
                    <div
                        v-for="(avg, i) in settings['adc-in']['avg-size']"
                        :key="i"
                        class="table-row text-[#6d9cc5] text-sm leading-[1.143]"
                    >
                        <div class="table-cell pr-9 whitespace-pre">
                            <span class="block max-h-px overflow-visible">
                                {{ i ? '' : t('adc-avg') }}
                            </span>
                        </div>
                        <div class="table-cell pr-2.5">
                            {{ `${t('input')} ${i + 1}:` }}
                        </div>
                        <UiInput
                            :init-value="settings['adc-in']['avg-size'][i]"
                            name="avg-size"
                            initType="number"
                            class="table-cell w-16 text-center !px-2"
                            :min-max="[2, 32]"
                            :status="
                                fieldsInvalidStatuses.has(`adc-avg-${i}`) ? 'invalid' : 'valid'
                            "
                            :input-type="['int']"
                            @status-changed="
                                $event === 'invalid' || $event === 'not-allowed'
                                    ? fieldsInvalidStatuses.add(`adc-avg-${i}`)
                                    : fieldsInvalidStatuses.delete(`adc-avg-${i}`)
                            "
                            @value-changed="
                                $event === undefined
                                    ? ''
                                    : (settings['adc-in']['avg-size'][i] = $event)
                            "
                        />
                        <div
                            class="text-[#ed4272] text-sm leading-[1.143] invisible opacity-0 transition-[opacity,visibility] error:visible error:opacity-100 pl-4 table-cell"
                            :class="{
                                error: fieldsInvalidStatuses.has(`adc-avg-${i}`),
                            }"
                        >
                            {{ t('integerFromTo', { from: 2, to: 32 }) }}
                        </div>
                    </div>
                </div>
                <div
                    class="table w-max border-spacing-y-3.5 mt-[1.5rem] last:-mb-3.5"
                    v-for="prefix in ['lim', 'clbr'] as const"
                    :key="prefix"
                >
                    <div
                        v-for="(p, i) in settings['adc-in'][`${prefix}-min`]"
                        :key="i"
                        class="table-row text-[#6d9cc5] text-sm leading-[1.143]"
                    >
                        <div class="table-cell pr-9 whitespace-pre w-[15.6rem]">
                            {{ i ? '' : t(prefix) }}
                        </div>
                        <template
                            v-for="m in ['max', 'min'] as const"
                            :key="m"
                        >
                            <div
                                class="table-cell pr-2.5"
                                :class="{ 'pl-4': m === 'min' }"
                            >
                                {{ `${t(`${prefix}-${m}`)} ${i + 1}:` }}
                            </div>
                            <UiInput
                                :init-value="settings['adc-in'][`${prefix}-${m}`][i]"
                                :name="m"
                                initType="number"
                                class="table-cell w-16 text-center !px-2"
                                :min-max="[0, undefined]"
                                :status="
                                    fieldsInvalidStatuses.has(`adc-${prefix}-${m}-${i}`)
                                        ? 'invalid'
                                        : 'valid'
                                "
                                :input-type="['int']"
                                :nullable="true"
                                @status-changed="
                                    $event === 'invalid' || $event === 'not-allowed'
                                        ? fieldsInvalidStatuses.add(`adc-${prefix}-${m}-${i}`)
                                        : fieldsInvalidStatuses.delete(`adc-${prefix}-${m}-${i}`)
                                "
                                @value-changed="
                                    $event === undefined
                                        ? ''
                                        : (settings['adc-in'][`${prefix}-${m}`][i] = $event)
                                "
                            />
                            <div
                                v-if="m === 'min'"
                                class="text-[#ed4272] text-sm leading-[1.143] invisible opacity-0 transition-[opacity,visibility] error:visible error:opacity-100 pl-4 table-cell"
                                :class="{
                                    error:
                                        fieldsInvalidStatuses.has(`adc-${prefix}-min-${i}`) ||
                                        fieldsInvalidStatuses.has(`adc-${prefix}-max-${i}`),
                                }"
                            >
                                {{ t('positiveInteger') }}
                            </div>
                        </template>
                    </div>
                </div>
            </div>
            <div
                v-else-if="topic === 'bin-out'"
                class="flex items-center mt-5"
            >
                <div class="text-[#6d9cc5] text-sm leading-[1.143] table-cell pr-4">
                    {{ t('delay') }}
                </div>
                <UiInput
                    :init-value="settings['bin-out']['min-delay']"
                    name="min-delay"
                    initType="number"
                    class="table-cell w-16 text-center !px-2"
                    :min-max="[0, 10000]"
                    :status="fieldsInvalidStatuses.has('bin-out') ? 'invalid' : 'valid'"
                    :input-type="['int']"
                    @status-changed="
                        $event === 'invalid' || $event === 'not-allowed'
                            ? fieldsInvalidStatuses.add('bin-out')
                            : fieldsInvalidStatuses.delete('bin-out')
                    "
                    @value-changed="
                        $event === undefined ? '' : (settings['bin-out']['min-delay'] = $event)
                    "
                />
                <span class="text-[#3e688e] text-sm leading-[1.143] ml-3">
                    {{ t('ms') }}
                </span>
                <div
                    class="text-[#ed4272] text-sm leading-[1.143] invisible opacity-0 transition-[opacity,visibility] error:visible error:opacity-100 pl-4 table-cell"
                    :class="{
                        error: fieldsInvalidStatuses.has('bin-out'),
                    }"
                >
                    {{ t('integerFromTo', { from: 0, to: 10000 }) }}
                </div>
            </div>
            <div v-else-if="topic === 'pwm-out'">
                <div class="table w-max border-spacing-y-3.5 -mb-3.5 mt-1.5">
                    <div
                        v-for="(freq, i) in settings['pwm-out']['frequency']"
                        :key="i"
                        class="table-row text-[#6d9cc5] text-sm leading-[1.143]"
                    >
                        <div class="table-cell pr-2.5">
                            {{ `${t('output')} ${i + 1}:` }}
                        </div>
                        <UiInput
                            :init-value="settings['pwm-out']['frequency'][i]"
                            name="frequency"
                            initType="number"
                            class="table-cell w-16 text-center !px-2"
                            :min-max="[50, 5000]"
                            :status="
                                fieldsInvalidStatuses.has(`pwm-out-${i}`) ? 'invalid' : 'valid'
                            "
                            :input-type="['int']"
                            @status-changed="
                                $event === 'invalid' || $event === 'not-allowed'
                                    ? fieldsInvalidStatuses.add(`pwm-out-${i}`)
                                    : fieldsInvalidStatuses.delete(`pwm-out-${i}`)
                            "
                            @value-changed="
                                $event === undefined
                                    ? ''
                                    : (settings['pwm-out']['frequency'][i] = $event)
                            "
                        />
                        <span class="text-[#3e688e] text-sm leading-[1.143] pl-3 table-cell">
                            {{ t('hz') }}
                        </span>
                        <div
                            class="text-[#ed4272] text-sm leading-[1.143] invisible opacity-0 transition-[opacity,visibility] error:visible error:opacity-100 pl-4 table-cell"
                            :class="{
                                error: fieldsInvalidStatuses.has(`pwm-out-${i}`),
                            }"
                        >
                            {{ t('integerFromTo', { from: 50, to: 5000 }) }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import ButtonGroup from '@/components/Ui/ButtonGroup.vue';
import CollapseTransition from '@/components/CollapseTransition.vue';
import UiInput from '@/components/Ui/UiInput.vue';
import AdvancedSettingsButton from '@/components/views/devicesSettings/elements/AdvancedSettingsButton.vue';
import type { ControllerSettings, ExtDevsListRaw, NGCSettings } from '@/typings/settings';
import { cloneDeep, isEmpty, isEqual, isEqualWith, omit, pick } from 'lodash-es';
import ManageDevice from './elements/ManageDevice.vue';
import Rs485Settings from './elements/Rs485Settings.vue';
import type { PartialDeep } from 'type-fest/source/partial-deep';

const props = defineProps<{
    controllerSettings: ControllerSettings;
    saveTrigger: number;
}>();

const emit = defineEmits<{
    (e: 'change', value: NGCSettings): void;
    (e: 'setNeedToSave', needToSave: boolean): void;
    (e: 'setIsSaving', isSaving: boolean): void;
}>();

const indexStore = useIndexStore();

const { rebootingDeviceAddr, numberingSystem } = storeToRefs(indexStore);

const { api } = useApiStore();

const { storeCommonSettingsFile } = useStoreCommonSettingsFile();

const { toast } = useToast();

const settings = ref<NGCSettings>();

const settingsInit = ref<NGCSettings>();

const isRebootRequired = ref(false);

const rebootTrigger = ref(0);

const topics: (keyof NGCSettings)[] = ['1-wire', 'adc-in', 'bin-out', 'pwm-out'];

const isAdvancedSettingsExpanded = ref<{ oneWire: boolean }>({
    oneWire: false,
});

const oneWiresParams = computed<
    {
        param: Exclude<keyof NGCSettings['1-wire'][number], 'mode'>;
        label: string;
        min: number;
        max: number;
    }[][]
>(() =>
    settings.value === undefined
        ? []
        : settings.value['1-wire'].map((w) => [
              {
                  param: 'cycle-pause',
                  label: 'cycle-delay',
                  min: 5,
                  max: w.mode === 'rom' ? 100 : w.mode === 'sens' ? 1000 : 100,
              },
              {
                  param: 'db-time',
                  label: 'debounce-time',
                  min: 0,
                  max: w.mode === 'rom' ? 100 : 100,
              },
              {
                  param: 'ct-time',
                  label: 'comert-time',
                  min: 50,
                  max: w.mode === 'rom' ? 100 : w.mode === 'sens' ? 500 : 100,
              },
          ]),
);

const fieldsInvalidStatuses = ref<Set<string>>(new Set());

const advancedSettingsHaveError = computed(() => ({
    oneWire: [...fieldsInvalidStatuses.value].some((s) => s.startsWith('1-wire')),
}));

const ignoreUndefined = (value: any) => {
    if (value === undefined) return true;
};

const areThereChanges = computed(() => {
    if (!settings.value || !settingsInit.value) return false;
    switch (settings.value.modbus.mode) {
        case 'off':
            return !isEqualWith(
                omit(settings.value, `modbus.advanced`),
                omit(settingsInit.value, `modbus.advanced`),
                ignoreUndefined,
            );
        case 'variables':
            return !isEqualWith(
                omit(settings.value, `modbus.advanced.ext-devs`),
                omit(settingsInit.value, `modbus.advanced.ext-devs`),
                ignoreUndefined,
            );
        case 'ext-devs':
            return !isEqualWith(
                omit(settings.value, `modbus.advanced.variables`),
                omit(settingsInit.value, `modbus.advanced.variables`),
                ignoreUndefined,
            );
    }
});

const needToSave = computed(() => areThereChanges.value && !fieldsInvalidStatuses.value.size);

watch(needToSave, () => {
    emit('setNeedToSave', needToSave.value);
});

watch(() => props.saveTrigger, save);

const { t } = useI18n({
    messages: {
        en: {
            '1-wire': '1-wire settings',
            'adc-in': 'Analog inputs settings',
            'bin-out': 'Simultaneous activation of discrete outputs',
            'pwm-out': 'PWM outputs frequency',
            'work-mode': 'Mode',
            bus: 'Bus',
            buses: {
                off: 'OFF',
                rom: 'ID',
                sens: 'SENS',
            },
            oneWires: {
                'cycle-pause': 'cycle-delay:',
                'db-time': 'debounce-time:',
                'ct-time': 'comert-time:',
            },
            'adc-avg': 'Use the average value \nfor several measurements',
            input: 'input',
            lim: 'Limits',
            clbr: 'Calibration',
            'lim-min': 'Lower input threshold',
            'lim-max': 'Upper input threshold',
            'clbr-min': 'Lower input value',
            'clbr-max': 'Upper input value',
            delay: 'Delay',
            ms: 'ms',
            output: 'output',
            hz: 'Hz',
            press: 'Press',
            here: 'here',
            forReboot: 'for reboot',
        },
        ru: {
            '1-wire': 'Настройки шин 1-wire',
            'adc-in': 'Настройки аналоговых входов',
            'bin-out': 'Одновременное включение дискретных выходов',
            'pwm-out': 'Частота ШИМ выходов',
            'work-mode': 'Режим работы',
            bus: 'Шина',
            buses: {
                off: 'OFF',
                rom: 'ID',
                sens: 'SENS',
            },
            oneWires: {
                'cycle-pause': 'cycle-delay:',
                'db-time': 'debounce-time:',
                'ct-time': 'comert-time:',
            },
            'adc-avg': 'Использовать среднее значение \nза несколько измерений',
            input: 'вход',
            lim: 'Пределы',
            clbr: 'Калибровка',
            'lim-min': 'Нижний порог входа',
            'lim-max': 'Верхний порог входа',
            'clbr-min': 'Нижнее значение входа',
            'clbr-max': 'Верхнее значение входа',
            delay: 'Задержка',
            ms: 'мс',
            output: 'выход',
            hz: 'Гц',
            press: 'Нажмите',
            here: 'сюда',
            forReboot: 'для перезагрузки',
        },
    },
});

const oneWireBuses = oneWiresModes.map((m) => ({
    text: t(`buses.${m}`),
    value: m,
}));

function setNgcSettings(data: ControllerSettings) {
    settings.value = {
        ...pick(data, ['1-wire', 'adc-in', 'bin-out', 'pwm-out']),
        modbus: {
            ...pick(data.modbus[0], ['rate', 'parity', 'stop', 'mode']),
            advanced: {
                variables: {
                    'cycle-pause':
                        data.modbus[0].mode === 'variables'
                            ? data.modbus[0]['cycle-pause']
                            : undefined,
                    'rd-pause':
                        data.modbus[0].mode === 'variables'
                            ? data.modbus[0]['rd-pause']
                            : undefined,
                    'rd-tmo':
                        data.modbus[0].mode === 'variables' ? data.modbus[0]['rd-tmo'] : undefined,
                    'wr-pause':
                        data.modbus[0].mode === 'variables'
                            ? data.modbus[0]['wr-pause']
                            : undefined,
                    'wr-tmo':
                        data.modbus[0].mode === 'variables' ? data.modbus[0]['wr-tmo'] : undefined,
                },
                'ext-devs': {
                    'cycle-pause':
                        data.modbus[0].mode === 'ext-devs'
                            ? data.modbus[0]['cycle-pause']
                            : undefined,
                    'get-tmo':
                        data.modbus[0].mode === 'ext-devs' ? data.modbus[0]['get-tmo'] : undefined,
                    'ow-scan-tmo':
                        data.modbus[0].mode === 'ext-devs'
                            ? data.modbus[0]['ow-scan-tmo']
                            : undefined,
                    'set-cfg-tmo':
                        data.modbus[0].mode === 'ext-devs'
                            ? data.modbus[0]['set-cfg-tmo']
                            : undefined,
                    'set-tmo':
                        data.modbus[0].mode === 'ext-devs' ? data.modbus[0]['set-tmo'] : undefined,
                },
            },
        },
        numberingSystem: numberingSystem.value,
    };
    isRebootRequired.value = data['reboot-req'];
    settingsInit.value = cloneDeep(settings.value);
}

async function save() {
    emit('setIsSaving', true);
    const current = settings.value;
    const init = settingsInit.value;
    if (!current || !init) return;
    const settingsToSave: PartialDeep<ControllerSettings, { recurseIntoArrays: true }> = {};
    (['1-wire', 'pwm-out', 'bin-out', 'adc-in'] as const).forEach((k) => {
        if (isKeyOfBoth(current, init, k) && !isEqual(current[k], init[k])) {
            if (k === '1-wire') {
                settingsToSave['1-wire'] = current['1-wire'].map(
                    (v, i): Partial<ControllerSettings['1-wire'][number]> =>
                        isEqual(v, init['1-wire'][i]) ? { mode: v.mode } : v,
                );
            } else {
                settingsToSave[k] = current[k] as any;
            }
        }
    });
    if (!isEqual(current.modbus, init.modbus)) {
        settingsToSave.modbus = [];
        settingsToSave.modbus[0] = {
            ...pick(current.modbus, ['rate', 'parity', 'stop', 'mode']),
            ...(current.modbus.mode === 'off' ? {} : current.modbus.advanced[current.modbus.mode]),
        };
    }
    try {
        if (!isEmpty(settingsToSave)) {
            const r = await api.post('set_config', settingsToSave, { timeout: 60000 });
            isRebootRequired.value = r.data['reboot-req'];
        }
        if (current.numberingSystem !== init.numberingSystem) {
            const r = await storeCommonSettingsFile(
                undefined,
                undefined,
                undefined,
                current.numberingSystem,
            );
            if (r === 'error') throw '';
            indexStore.setNumberingSystem(current.numberingSystem);
        }
        if (current.modbus.mode !== init.modbus.mode) {
            if (current.modbus.mode === 'ext-devs' && init.modbus.mode !== 'ext-devs') {
                rebootTrigger.value += 1;
                await until(rebootingDeviceAddr).toBe(0);
                await until(rebootingDeviceAddr).toBe(undefined);
                const r = await api.get<{ list: ExtDevsListRaw }>('get_ext_devs');
                indexStore.setExtDevsList(r.data.list);
            }
            indexStore.setNGCModbusMode(current.modbus.mode);
            const r = await api.get<ControllerSettings>('get_config');
            setNgcSettings(r.data);
        } else {
            settingsInit.value = cloneDeep(settings.value);
        }
    } catch (error) {
        toast.error(t('toast.error.header'), t('toast.error.text'));
    }
    emit('setIsSaving', false);
}

setNgcSettings(props.controllerSettings);
</script>
