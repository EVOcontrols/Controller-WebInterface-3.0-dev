<template>
  <div class="h-full flex flex-col">
    <div class="flex flex-col flex-1 overflow-y-auto overflow-x-hidden scrollbar-4 relative">
      <template v-if="settings && settingsInit">
        <ExtDevicesSettings
          :active-device-index="activeDeviceIndex"
          :device-count="5"
          :reload-required="reloadRequired"
          :modbus-settings-init="settingsInit.modbus"
          :numbering-system="settings.numberingSystem"
          :fields-invalid-statuses="fieldsInvalidStatuses"
          :advanced-settings-have-error="advancedSettingsHaveError.modbus"
          @select-device="activeDeviceIndex = $event"
          @set-modbus-settings="settings['modbus'] = $event"
          @set-numbering-system="settings.numberingSystem = $event"
        />
        <div
          v-for="topic in topics"
          :key="topic"
          class="mt-8 mx-8 flex flex-col border-b border-[#0b3d68] last:border-none pb-10"
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
              :is-expanded="isAdvancedSettingsExpanded"
              :is-error="!!advancedSettingsHaveError['1-wire']"
              @click="isAdvancedSettingsExpanded = !isAdvancedSettingsExpanded"
            />
            <CollapseTransition :duration="300">
              <div v-show="isAdvancedSettingsExpanded">
                <div class="table w-max mt-5 border-collapse">
                  <div
                    v-for="(w, i) in settings['1-wire']"
                    :key="i"
                    class="table-row-group [&:last-child>div:last-child]:!h-10"
                  >
                    <div
                      v-for="(p, y) in oneWiresParams"
                      :key="p"
                      class="table-row h-[3.43rem] align-top"
                    >
                      <div class="text-[#6d9cc5] text-sm leading-[1.143] table-cell pr-9">
                        {{ y ? '' : `${t('bus')} ${i + 1}` }}
                      </div>
                      <div class="text-[#6d9cc5] text-sm leading-[1.143] table-cell pr-2.5">
                        {{ t(`oneWires.${p}`) }}
                      </div>
                      <UiInput
                        :init-value="w[p]"
                        :name="p"
                        initType="number"
                        class="table-cell w-16 text-center !px-2"
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
                  {{ t('from2To32') }}
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
                      fieldsInvalidStatuses.has(`adc-${prefix}-${m}-${i}`) ? 'invalid' : 'valid'
                    "
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
              :min-max="[0, 200]"
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
              {{ t('from0To200') }}
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
                  {{ t('from50To5000') }}
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
        class="w-[7.563rem]"
        @click="save"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { type ControllerSettings, type DevicesControllerSettings } from '@/typings/settings';
import SaveButton from '@/components/Ui/SaveButton.vue';
import ButtonGroup from '@/components/Ui/ButtonGroup.vue';
import CollapseTransition from '@/components/CollapseTransition.vue';
import UiInput from '@/components/Ui/UiInput.vue';
import AdvancedSettingsButton from '@/components/views/devicesSettings/AdvancedSettingsButton.vue';
import { cloneDeep, get, isEmpty, pick, set } from 'lodash';
import ExtDevicesSettings from '@/components/views/devicesSettings/ExtDevicesSettings.vue';

const indexStore = useIndexStore();

const { api } = useApi();

const { toast } = useToast();

const { storeCommonSettingsFile } = useStoreCommonSettingsFile();

const settings = ref<DevicesControllerSettings>();

const settingsInit = ref<DevicesControllerSettings>();

const reloadRequired = ref(false);

const isSaving = ref(false);

const topics: (keyof DevicesControllerSettings)[] = [
  // 'modbus',
  '1-wire',
  'adc-in',
  'bin-out',
  'pwm-out',
];

const isAdvancedSettingsExpanded = ref<boolean>(false);

const oneWiresParams = ['cycle-pause', 'db-time', 'ct-time'] as const;

const fieldsInvalidStatuses = ref<Set<string>>(new Set());

const activeDeviceIndex = ref(0);

const advancedSettingsHaveError = computed(() => ({
  '1-wire': [...fieldsInvalidStatuses.value].some((s) => s.startsWith('1-wire')),
  modbus: [...fieldsInvalidStatuses.value].some((s) => s.startsWith('modbus')),
}));

const isThereChanges = computed(() => {
  if (!settings.value || !settingsInit.value) return false;
  return JSON.stringify(settings.value) !== JSON.stringify(settingsInit.value);
});

const isSaveButtonDisabled = computed(
  () => isSaving.value || !isThereChanges.value || fieldsInvalidStatuses.value.size > 0,
);

async function save() {
  isSaving.value = true;
  const current = settings.value;
  const init = settingsInit.value;
  if (!current || !init) return;
  const settingsToSave: any = {};
  Object.keys(current).forEach((k1) => {
    if (!isKeyOfBoth(current, init, k1)) return;
    if (k1 === 'numberingSystem') return;
    const v1 = current[k1];
    const v2 = init[k1];
    if (Array.isArray(v1) && Array.isArray(v2)) {
      settingsToSave[k1] = [...new Array(v1.length)].map(() => ({}));
      v1.forEach((v3, i) => {
        const v4 = v2[i];
        Object.keys(v3).forEach((k2) => {
          if (!isKeyOfBoth(v3, v4, k2)) return;
          const v5 = v3[k2];
          const v6 = v4[k2];
          if (typeof v5 === 'object' && typeof v6 === 'object') {
            if (Array.isArray(v5) && Array.isArray(v6)) {
              if (JSON.stringify(v5) !== JSON.stringify(v6)) {
                set(settingsToSave[k1][i], [k2], v5);
              }
            } else {
              Object.keys(v5).forEach((k3) => {
                if (!isKeyOfBoth(v5, v6, k3)) return;
                const v7 = v5[k3];
                const v8 = v6[k3];
                if (v7 !== v8) {
                  set(settingsToSave[k1][i], [k2, k3], v7);
                }
              });
            }
          } else if (v5 !== v6) {
            set(settingsToSave[k1][i], [k2], v5);
          }
        });
      });
      if (!settingsToSave[k1].filter((v9: any) => Object.keys(v9).length).length) {
        delete settingsToSave[k1];
      } else {
        settingsToSave[k1].reverse();
        const indexToCut = settingsToSave[k1].findIndex((v10: any) => Object.keys(v10).length);
        if (indexToCut !== -1) {
          settingsToSave[k1].splice(0, indexToCut);
        }
        settingsToSave[k1].reverse();
        const keys = new Set<string>();
        settingsToSave[k1].forEach((v10: any) => {
          Object.keys(v10).forEach((k4) => {
            keys.add(k4);
          });
        });
        if (k1 === '1-wire') keys.add('mode');
        keys.forEach((k4) => {
          settingsToSave[k1].forEach((v10: any, i: number) => {
            if (!v10[k4]) v10[k4] = get(current, [k1, i, k4]);
          });
        });
      }
    } else {
      Object.keys(v1).forEach((k2) => {
        if (!isKeyOfBoth(v1, v2, k2)) return;
        const v3 = v1[k2];
        const v4 = v2[k2];
        if (typeof v3 === 'object' && typeof v4 === 'object') {
          if (Array.isArray(v3) && Array.isArray(v4)) {
            if (JSON.stringify(v3) !== JSON.stringify(v4)) {
              set(settingsToSave, [k1, k2], v3);
            }
          }
        } else if (v3 !== v4) {
          if (!settingsToSave[k1]) settingsToSave[k1] = {};
          set(settingsToSave, [k1, k2], v3);
        }
      });
    }
  });
  try {
    if (!isEmpty(settingsToSave)) {
      const r = await api.post('set_config', settingsToSave);
      reloadRequired.value = r.data['reboot-req'];
    }
    if (current.numberingSystem !== init.numberingSystem) {
      const r = await storeCommonSettingsFile(
        undefined,
        undefined,
        undefined,
        current.numberingSystem,
      );
      if (r === 'error') throw '';
    }
    settingsInit.value = cloneDeep(settings.value);
  } catch (error) {
    toast.error(t('toast.error.header'), t('toast.error.text'));
  }
  isSaving.value = false;
}

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
      from2To32: 'Enter a value from 2 to 32',
      from0To200: 'Enter a value from 0 to 200',
      from50To5000: 'Enter a value from 50 to 5000',
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
      toast: {
        success: 'Saved',
        error: {
          header: 'Error',
          text: 'Check entered values',
        },
      },
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
      from2To32: 'Введите значение от 2 до 32',
      from0To200: 'Введите значение от 0 до 200',
      from50To5000: 'Введите значение от 50 до 5000',
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
      toast: {
        success: 'Сохранено',
        error: {
          header: 'Ошибка',
          text: 'Проверьте введённые значения',
        },
      },
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
    let r = await api.get<ControllerSettings>('get_config');
    settings.value = {
      ...pick(r.data, ['1-wire', 'adc-in', 'bin-out', 'pwm-out', 'modbus']),
      numberingSystem: indexStore.numberingSystem,
    };
    settingsInit.value = cloneDeep(settings.value);
    reloadRequired.value = r.data['reboot-req'];
  } catch (error) {
    //
  }
});
</script>
