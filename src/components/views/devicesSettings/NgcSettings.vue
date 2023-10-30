<template>
  <div>
    <ManageDevice
      :is-reboot-required="isRebootRequired"
      :device-addr="0"
      :device-state="undefined"
      :reboot-trigger="rebootNgcTrigger"
      @ngc-rebooted-manually="emit('ngcRebootedManually')"
    />
    <div class="mt-8 border-b border-[#0b3d68] pb-10 w-full">
      <h2 class="font-semibold text-xl leading-[1.2] whitespace-pre mb-[1.125rem]">
        {{ t('rsSettings') }}
      </h2>
      <div class="flex flex-row items-center">
        <div class="text-[#6d9cc5] text-sm leading-[1.143] mr-6">
          {{ t('portMode') }}
        </div>
        <ButtonGroup
          :buttons="modbusModes.map((v) => ({ text: t(`portModes.${v}`), value: v }))"
          :value="settings.modbus.mode"
          additional-classes="px-4"
          @change="settings.modbus.mode = $event"
        />
      </div>
      <div class="flex flex-row mt-[2.8rem]">
        <div class="text-[#6d9cc5] text-sm leading-[1.143] mr-10">
          {{ t('speed') }}
        </div>
        <InputRange
          :value="settings.modbus.rate"
          @change="settings.modbus.rate = $event"
        />
      </div>
      <div class="flex flex-row items-center mt-[2.5rem]">
        <div class="text-[#6d9cc5] text-sm leading-[1.143] mr-6">
          {{ t('parity') }}
        </div>
        <ButtonGroup
          :buttons="modbusParities.map((v) => ({ text: t(`parities.${v}`), value: v }))"
          :value="settings.modbus.parity"
          additional-classes="px-4"
          @change="settings.modbus.parity = $event"
        />
      </div>
      <div class="flex flex-row items-center mt-[2.75rem]">
        <div class="text-[#6d9cc5] text-sm leading-[1.143] mr-5">
          {{ t('stop') }}
        </div>
        <ButtonGroup
          :buttons="([1, 2] as const).map((v) => ({ text: v.toString(), value: v }))"
          :value="settings.modbus.stop"
          additional-classes="px-4"
          @change="settings.modbus.stop = $event"
        />
      </div>
      <div class="flex flex-row items-center mt-[2.75rem]">
        <div class="text-[#6d9cc5] text-sm leading-[1.143] mr-5 whitespace-pre">
          {{ t('numberingSystem') }}
        </div>
        <ButtonGroup
          :buttons="numberingSystems.map((v) => ({ text: v.toUpperCase(), value: v }))"
          :value="settings.numberingSystem"
          additional-classes="px-4"
          @change="settings.numberingSystem = $event"
        />
      </div>
      <template v-if="settings.modbus.mode !== 'off'">
        <AdvancedSettingsButton
          :is-expanded="!!isAdvancedSettingsExpanded.rs485"
          :is-error="!!advancedSettingsHaveError.rs485"
          @click="isAdvancedSettingsExpanded.rs485 = !isAdvancedSettingsExpanded.rs485"
        />
        <CollapseTransition :duration="300">
          <div
            v-show="isAdvancedSettingsExpanded.rs485"
            class=""
          >
            <div class="table w-max mt-5">
              <div
                v-for="p in rsAdvancedParams[settings.modbus.mode]"
                :key="`${settings.modbus.mode}${p.param}`"
                class="table-row h-[3.43rem] align-top last:h-10"
              >
                <div class="text-[#6d9cc5] text-sm leading-[1.143] table-cell pr-4">
                  {{ `${p.label}:` }}
                </div>
                <UiInput
                  :init-value="
                    isKeyOf(settings.modbus.advanced[settings.modbus.mode], p.param)
                      ? settings.modbus.advanced[settings.modbus.mode][p.param]
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
                      ? fieldsInvalidStatuses.add(`modbus-${p.param}`)
                      : fieldsInvalidStatuses.delete(`modbus-${p.param}`)
                  "
                  @value-changed="
                    (e) => {
                      if (settings.modbus.mode === 'off') return;
                      if (!isKeyOf(settings.modbus.advanced[settings.modbus.mode], p.param)) return;
                      settings.modbus.advanced[settings.modbus.mode][p.param] = e;
                    }
                  "
                />
                <div
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
                </div>
              </div>
            </div>
          </div>
        </CollapseTransition>
      </template>
    </div>
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
          @click="isAdvancedSettingsExpanded.oneWire = !isAdvancedSettingsExpanded.oneWire"
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
                  <div class="text-[#6d9cc5] text-sm leading-[1.143] table-cell pr-9">
                    {{ y ? '' : `${t('bus')} ${i + 1}` }}
                  </div>
                  <div class="text-[#6d9cc5] text-sm leading-[1.143] table-cell pr-2.5">
                    {{ p.label }}
                  </div>
                  <UiInput
                    :init-value="w[p.param]"
                    :name="p.param"
                    initType="number"
                    class="table-cell w-16 text-center !px-2"
                    :min-max="[p.min, p.max]"
                    :status="
                      fieldsInvalidStatuses.has(`1-wire-${i}-${p.param}`) ? 'invalid' : 'valid'
                    "
                    :input-type="['int']"
                    @status-changed="
                      $event === 'invalid' || $event === 'not-allowed'
                        ? fieldsInvalidStatuses.add(`1-wire-${i}-${p.param}`)
                        : fieldsInvalidStatuses.delete(`1-wire-${i}-${p.param}`)
                    "
                    @value-changed="$event === undefined ? '' : (w[p.param] = $event)"
                  />
                  <div
                    class="text-[#ed4272] text-sm leading-[1.143] invisible opacity-0 transition-[opacity,visibility] error:visible error:opacity-100 pl-4 table-cell"
                    :class="{
                      error: fieldsInvalidStatuses.has(`1-wire-${i}-${p.param}`),
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
              :status="fieldsInvalidStatuses.has(`adc-avg-${i}`) ? 'invalid' : 'valid'"
              :input-type="['int']"
              @status-changed="
                $event === 'invalid' || $event === 'not-allowed'
                  ? fieldsInvalidStatuses.add(`adc-avg-${i}`)
                  : fieldsInvalidStatuses.delete(`adc-avg-${i}`)
              "
              @value-changed="
                $event === undefined ? '' : (settings['adc-in']['avg-size'][i] = $event)
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
                :status="fieldsInvalidStatuses.has(`adc-${prefix}-${m}-${i}`) ? 'invalid' : 'valid'"
                :input-type="['int']"
                :nullable="true"
                @status-changed="
                  $event === 'invalid' || $event === 'not-allowed'
                    ? fieldsInvalidStatuses.add(`adc-${prefix}-${m}-${i}`)
                    : fieldsInvalidStatuses.delete(`adc-${prefix}-${m}-${i}`)
                "
                @value-changed="
                  $event === undefined ? '' : (settings['adc-in'][`${prefix}-${m}`][i] = $event)
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
          @value-changed="$event === undefined ? '' : (settings['bin-out']['min-delay'] = $event)"
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
              :status="fieldsInvalidStatuses.has(`pwm-out-${i}`) ? 'invalid' : 'valid'"
              :input-type="['int']"
              @status-changed="
                $event === 'invalid' || $event === 'not-allowed'
                  ? fieldsInvalidStatuses.add(`pwm-out-${i}`)
                  : fieldsInvalidStatuses.delete(`pwm-out-${i}`)
              "
              @value-changed="
                $event === undefined ? '' : (settings['pwm-out']['frequency'][i] = $event)
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
import type { NGCSettings } from '@/typings/settings';
import { cloneDeep, isEqual } from 'lodash-es';
import ManageDevice from './elements/ManageDevice.vue';
import InputRange from './elements/InputRange.vue';

const props = defineProps<{
  initSettings: NGCSettings;
  isRebootRequired: boolean;
  rebootNgcTrigger: number;
}>();

const emit = defineEmits<{
  (e: 'change', value: NGCSettings): void;
  (e: 'setIsAllFieldsValid', isValid: boolean): void;
  (e: 'ngcRebootedManually'): void;
}>();

const settings = ref<NGCSettings>(cloneDeep(props.initSettings));

watch(
  settings,
  () => {
    emit('change', cloneDeep(settings.value));
  },
  { deep: true },
);

const topics: (keyof NGCSettings)[] = ['1-wire', 'adc-in', 'bin-out', 'pwm-out'];

const isAdvancedSettingsExpanded = ref<{ rs485: boolean; oneWire: boolean }>({
  rs485: false,
  oneWire: false,
});

const rsAdvancedParams = {
  variables: [
    { param: 'rd-tmo', label: 'rd-tmo', min: 5, max: 50000 },
    { param: 'wr-tmo', label: 'wr-tmo', min: 5, max: 50000 },
    { param: 'rd-pause', label: 'rd-ddy', min: 0, max: 50000 },
    { param: 'wr-pause', label: 'wr-ddy', min: 0, max: 50000 },
    { param: 'cycle-pause', label: 'cm-ddy', min: 0, max: 50000 },
  ],
  'ext-devs': [
    { param: 'get-tmo', label: 'get-tmo', min: 1, max: 50000 },
    { param: 'set-tmo', label: 'set-tmo', min: 1, max: 50000 },
    { param: 'ow-scan-tmo', label: 'ow-scan-tmo', min: 100, max: 50000 },
    { param: 'set-cfg-tmo', label: 'set-cfg-tmo', min: 100, max: 50000 },
    { param: 'cycle-pause', label: 'cycle-pause', min: 0, max: 50000 },
  ],
} as const;

const oneWiresParams = computed<
  {
    param: Exclude<keyof NGCSettings['1-wire'][number], 'mode'>;
    label: string;
    min: number;
    max: number;
  }[][]
>(() =>
  settings.value['1-wire'].map((w) => [
    {
      param: 'cycle-pause',
      label: 'cycle-delay',
      min: 5,
      max: w.mode === 'rom' ? 100 : w.mode === 'sens' ? 1000 : 100,
    },
    { param: 'db-time', label: 'debounce-time', min: 0, max: w.mode === 'rom' ? 100 : 100 },
    {
      param: 'ct-time',
      label: 'comert-time',
      min: 50,
      max: w.mode === 'rom' ? 100 : w.mode === 'sens' ? 500 : 100,
    },
  ]),
);

const fieldsInvalidStatuses = ref<Set<string>>(new Set());

watch(
  () => props.initSettings,
  () => {
    if (!isEqual(props.initSettings, settings.value)) {
      settings.value = cloneDeep(props.initSettings);
    }
  },
);

watch(
  fieldsInvalidStatuses,
  () => {
    emit('setIsAllFieldsValid', fieldsInvalidStatuses.value.size === 0);
  },
  { deep: true },
);

const advancedSettingsHaveError = computed(() => ({
  oneWire: [...fieldsInvalidStatuses.value].some((s) => s.startsWith('1-wire')),
  rs485: [...fieldsInvalidStatuses.value].some((s) => s.startsWith('modbus')),
}));

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
      rsSettings: 'RS485 bus settings',
      portMode: 'Port mode',
      portModes: {
        off: 'OFF',
        variables: 'MODBUS VARIABLES',
        'ext-devs': 'EXTENSION DEVICES',
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
      rsSettings: 'Настройки шины RS485',
      portMode: 'Режим работы порта',
      portModes: {
        off: 'ОТКЛЮЧЕН',
        variables: 'ПЕРЕМЕННЫЕ MODBUS',
        'ext-devs': 'УСТРОЙСТВА РАСШИРЕНИЯ',
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
</script>
