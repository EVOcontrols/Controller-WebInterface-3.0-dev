<template>
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
        :value="props.settings.mode"
        additional-classes="px-4"
        @change="emit('changeMode', $event)"
      />
    </div>
    <CollapseTransition :duration="300">
      <div v-if="props.settings.mode !== 'off'">
        <div class="flex flex-row mt-[2.8rem]">
          <div class="text-[#6d9cc5] text-sm leading-[1.143] mr-10">
            {{ t('speed') }}
          </div>
          <InputRange
            :value="props.settings.rate"
            @change="emit('changeRate', $event)"
          />
        </div>
        <div class="flex flex-row items-center mt-[2.5rem]">
          <div class="text-[#6d9cc5] text-sm leading-[1.143] mr-6">
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
          <div class="text-[#6d9cc5] text-sm leading-[1.143] mr-5">
            {{ t('stop') }}
          </div>
          <ButtonGroup
            :buttons="([1, 2] as const).map((v) => ({ text: v.toString(), value: v }))"
            :value="props.settings.stop"
            additional-classes="px-4"
            @change="emit('changeStop', $event)"
          />
        </div>
        <div class="flex flex-row items-center mt-[2.75rem]">
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
                v-for="p in rsAdvancedParams[props.settings.mode]"
                :key="`${props.settings.mode}${p.param}`"
                class="table-row h-[3.43rem] align-top last:h-10"
              >
                <div class="text-[#6d9cc5] text-sm leading-[1.143] table-cell pr-4">
                  {{ `${p.label}:` }}
                </div>
                <UiInput
                  :init-value="
                    isKeyOf(props.settings.advanced[props.settings.mode], p.param)
                      ? props.settings.advanced[props.settings.mode][p.param]
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
      </div>
    </CollapseTransition>
  </div>
</template>

<script lang="ts" setup generic="T extends NGCSettings['modbus']">
import type { NGCSettings } from '@/typings/settings';
import ButtonGroup from '@/components/Ui/ButtonGroup.vue';
import InputRange from './InputRange.vue';
import UiInput from '@/components/Ui/UiInput.vue';
import AdvancedSettingsButton from '@/components/views/devicesSettings/elements/AdvancedSettingsButton.vue';
import CollapseTransition from '@/components/CollapseTransition.vue';

const props = defineProps<{
  settings: T;
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
  (
    e: 'changeAdvancedParam',
    param: keyof T['advanced'][Exclude<T['mode'], 'off'>],
    value?: number,
  ): void;
}>();

const isAdvancedSettingsExpanded = ref(false);

const advancedSettingsHaveError = computed(() => props.fieldsInvalidStatuses.size > 0);

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

const { t } = useI18n({
  messages: {
    en: {
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
    },
    ru: {
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
    },
  },
});
</script>
