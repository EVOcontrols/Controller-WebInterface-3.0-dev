<template>
  <div class="h-full flex flex-col">
    <div class="flex flex-col flex-1 overflow-auto scrollbar-4 relative">
      <template v-if="settings">
        <div
          v-for="topic in topics"
          :key="topic"
          class="mt-8 mx-8 flex flex-col border-b border-[#0b3d68] last:border-none pb-10"
        >
          <h2 class="font-semibold text-xl leading-[1.2] whitespace-pre">
            {{ t(`${topic}`) }}
          </h2>
          <div v-if="topic === '1-wire'">
            <h3 class="text-sm leading-[1.143] mt-[1.125rem] mb-2">
              {{ t('work-mode') }}
            </h3>
            <div class="table w-max border-spacing-y-3.5">
              <div
                v-for="(w, i) in settings['1-wire']"
                :key="i"
                class="table-row"
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
              :is-expanded="!!isAdvancedSettingsExpanded['1-wire']"
              :is-error="!!advancedSettingsHaveError['1-wire']"
              @click="isAdvancedSettingsExpanded['1-wire'] = !isAdvancedSettingsExpanded['1-wire']"
            />
            <CollapseTransition :duration="300">
              <div v-show="isAdvancedSettingsExpanded['1-wire']">
                <div class="table w-max border-spacing-y-3.5">
                  <div
                    v-for="(w, i) in settings['1-wire']"
                    :key="i"
                    class="table-row"
                  >
                    <div
                      v-for="(p, y) in oneWiresParams"
                      :key="p"
                      class="table-row"
                    >
                      <div class="text-[#6d9cc5] text-sm leading-[1.143] table-cell pr-9">
                        {{ y ? '' : `${t('bus')} ${i + 1}` }}
                      </div>
                      <div class="text-[#6d9cc5] text-sm leading-[1.143] table-cell pr-2.5">
                        {{ t(`oneWires.${p}`) }}
                      </div>
                      <UiInput
                        :init-value="w[p]"
                        initType="number"
                        class="table-cell w-16 text-center"
                        :min-max="[0, undefined]"
                        :status="
                          fieldsInvalidStatuses.has(`1-wire-${i}-${p}`) ? 'invalid' : 'valid'
                        "
                        :input-type="['int']"
                        @status-changed="
                          $event === 'invalid' || $event === 'not-allowed'
                            ? fieldsInvalidStatuses.add(`1-wire-${i}-${p}`)
                            : fieldsInvalidStatuses.delete(`1-wire-${i}-${p}`)
                        "
                        @value-changed="$event === undefined ? '' : (w[p] = $event)"
                      />
                      <div
                        class="text-[#ed4272] text-sm leading-[1.143] invisible opacity-0 transition-[opacity,visibility] error:visible error:opacity-100 pl-4 table-cell"
                        :class="{
                          error: fieldsInvalidStatuses.has(`1-wire-${i}-${p}`),
                        }"
                      >
                        {{ t('positiveInteger') }}
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
                  {{ i ? '' : t('adc-avg') }}
                </div>
                <div class="table-cell pr-2.5">
                  {{ `${t('input')} ${i + 1}:` }}
                </div>
                <UiInput
                  :init-value="settings['adc-in']['avg-size'][i]"
                  initType="number"
                  class="table-cell w-16 text-center"
                  :min-max="[0, 32]"
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
                  {{ t('from0To32') }}
                </div>
              </div>
            </div>
            <div
              class="table w-max border-spacing-y-3.5 mt-[3.3rem]"
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
                    initType="number"
                    class="table-cell w-16 text-center"
                    :min-max="[0, undefined]"
                    :status="
                      fieldsInvalidStatuses.has(`adc-${prefix}-${m}-${i}`) ? 'invalid' : 'valid'
                    "
                    :input-type="['int']"
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
              initType="number"
              class="table-cell w-16 text-center"
              :min-max="[0, undefined]"
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
              {{ t('positiveInteger') }}
            </div>
          </div>
          <div v-else-if="topic === 'pwm-out'">
            <div class="table w-max border-spacing-y-3.5">
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
                  initType="number"
                  class="table-cell w-16 text-center"
                  :min-max="[0, undefined]"
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
                  {{ t('positiveInteger') }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
    <div
      class="h-[3.625rem] flex flex-row justify-end items-center border-t-2 border-[#0b3d68] pr-8"
    >
      <SaveButton
        :isSaving="isSaving"
        :is-disabled="isSaveButtonDisabled"
        @click="save"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { type DevicesControllerSettings } from '@/typings/settings';
import SaveButton from '@/components/Ui/SaveButton.vue';
import ButtonGroup from '@/components/Ui/ButtonGroup.vue';
import CollapseTransition from '@/components/CollapseTransition.vue';
import UiInput from '@/components/Ui/UiInput.vue';
import AdvancedSettingsButton from '@/components/views/devicesSettings/AdvancedSettingsButton.vue';

const { api } = useApi();

const settings = ref<DevicesControllerSettings>();

const isSaving = ref(false);

const isSaveButtonDisabled = ref(true);

const topics: (keyof DevicesControllerSettings)[] = [
  // 'modbus',
  '1-wire',
  'adc-in',
  'bin-out',
  'pwm-out',
];

const isAdvancedSettingsExpanded = ref<Partial<Record<'modbus' | '1-wire', boolean>>>({});

const oneWiresParams = ['cycle-pause', 'db-time', 'ct-time'] as const;

const fieldsInvalidStatuses = ref<Set<string>>(new Set());

const advancedSettingsHaveError = computed(() => ({
  '1-wire': [...fieldsInvalidStatuses.value].some((s) => s.startsWith('1-wire')),
}));

function save() {}

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
      positiveInteger: 'Enter a positive integer',
      'adc-avg': 'Use the average value \nfor several measurements',
      input: 'input',
      from0To32: 'Enter a value from 0 to 32',
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
      positiveInteger: 'Введите положительное целое число',
      'adc-avg': 'Использовать среднее значение \nза несколько измерений',
      input: 'вход',
      from0To32: 'Введите значение от 0 до 32',
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
    },
  },
});

const oneWireBuses = oneWiresModes.map((m) => ({
  text: t(`buses.${m}`),
  value: m,
}));

onMounted(async () => {
  await new Promise((resolve) => setTimeout(resolve, 150));
  try {
    let r = await api.get<DevicesControllerSettings>('get_config');
    settings.value = r.data;
  } catch (error) {
    //
  }
});
</script>
