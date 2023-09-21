<template>
  <div
    class="flex flex-col"
    v-if="fields"
  >
    <div
      v-for="(rows, topic) in fields"
      :key="topic"
      class="mt-8 mx-8 flex flex-col gap-y-6 border-b border-[#0b3d68] last:border-none"
      :class="[topic === 'rtc' ? 'pb-4' : 'pb-10']"
    >
      <h2 class="font-semibold text-xl leading-[1.2]">
        {{ t(`${topic}.param`) }}
      </h2>
      <div :class="[topic === 'rtc' ? 'table w-max border-spacing-y-6' : 'flex flex-col gap-y-6']">
        <div
          v-for="(params, rowIndex) in rows"
          :key="rowIndex"
          :class="[topic === 'rtc' ? 'table-row-group' : 'flex flex-row gap-x-3']"
        >
          <div
            v-for="(field, param) in params"
            :key="param"
            class="text-[#6d9cc5] text-sm leading-[1.143]"
            :class="[
              field.orientation === 'h'
                ? 'flex-row items-center gap-x-[0.875rem]'
                : 'flex-col items-start gap-y-1.5',
              topic === 'rtc' ? 'table-row' : 'flex',
            ]"
          >
            <span :class="[topic === 'rtc' ? 'table-cell pr-5 align-middle' : '']">
              {{ t(`${topic}.fields.${field.param}.param`) }}
            </span>
            <ButtonGroup
              v-if="field.type === 'btn-group'"
              :buttons="
                field.values.map((v) => ({
                  text: t(`${topic}.fields.${field.param}.values.${v}`),
                  value: v,
                }))
              "
              :value="field.value"
              @change="field.value = $event"
            />
            <DropDown
              v-else-if="field.param === 'time-zone'"
              class="table-cell text-[0.813rem]"
            >
              <template #trigger-element="{ onClick }">
                <button
                  class="rounded-lg h-[2.438rem] w-[11.438rem] bg-[#0f304b] flex flex-row items-center justify-between pl-[0.875rem] pr-[2.125rem]"
                  @click="onClick"
                >
                  <span class="font-roboto text-[#8dc5f6]">
                    {{ timeZones[field.value + 12]?.tz }}
                  </span>
                  <span class="font-roboto text-[#2b9bff] lowercase">
                    {{ timeZones[field.value + 12]?.time }}
                  </span>
                </button>
              </template>
              <template #body="{ isOpen, onSelect }">
                <div
                  class="w-full rounded-lg bg-[#0f304b] flex flex-col py-[0.31rem]"
                  v-if="isOpen"
                >
                  <div class="max-h-[11.563rem] overflow-auto scrollbar-3 px-1.5">
                    <div
                      v-for="t in timeZones"
                      :key="t.tz"
                      class="flex flex-row justify-between h-[2.188rem] hover:bg-[#134d7d] shrink-0 items-center pl-2 pr-3 rounded hover:pl-3 transition-[background-color,padding] select-none cursor-pointer on:bg-[#134d7d]"
                      :class="{ on: t.value === field.value }"
                      @click="
                        () => {
                          field.value = t.value;
                          onSelect();
                        }
                      "
                    >
                      <span class="font-roboto text-[#8dc5f6]">
                        {{ t.tz }}
                      </span>
                      <span class="font-roboto text-[#2b9bff] lowercase">
                        {{ t.time }}
                      </span>
                    </div>
                  </div>
                </div>
              </template>
            </DropDown>
            <div
              v-else-if="field.type === 'password'"
              class="relative table-cell"
              :class="[field.widthClass]"
            >
              <LoginInput
                class="w-72"
                inputType="password"
                :isPasswordVisible="!!isPasswordVisible[field.param]"
                :isDisabled="false"
                :isError="!!isPasswordMismatch[field.param]"
                :name="field.param"
                placeholder=""
                autocomplete="new-password"
                :hasFocusOffset="false"
                @change="field.value = $event"
                @focus="isPasswordFocus[field.param] = true"
                @blur="isPasswordFocus[field.param] = false"
              />
              <button
                type="button"
                class="absolute bottom-0 right-3 top-0 my-auto z-[3] w-[1.125rem] h-[1.125rem]"
                @click="
                  () => {
                    isPasswordVisible[field.param] = !isPasswordVisible[field.param];
                  }
                "
              >
                <Transition
                  mode="out-in"
                  name="scale-y-150"
                >
                  <span
                    v-html="isPasswordVisible[field.param] ? openEye : closedEye"
                    :key="isPasswordVisible[field.param] ? 'openEye' : 'closedEye'"
                    class="w-[1.125rem] h-[1.125rem] block group/icon"
                    :class="{
                      on: isPasswordFocus[field.param] && !isPasswordMismatch[field.param],
                      error: isPasswordMismatch[field.param],
                    }"
                  ></span>
                </Transition>
              </button>
              <Transition name="fade-150">
                <div
                  class="absolute left-full ml-3 top-0 bottom-0 whitespace-nowrap my-auto flex items-center text-[#f83068]"
                  v-if="isPasswordMismatch[field.param]"
                >
                  Password mismatch
                </div>
              </Transition>
            </div>
            <UiInput
              v-else
              :init="
                field.type === 'string'
                  ? { valueType: 'string', value: field.value as string }
                  : { valueType: 'number', value: field.value as number }
              "
              class="table-cell"
              :class="[field.widthClass]"
              @valueChanged="field.value = $event.value"
            />
            <span
              class="text-[#4b7ca8] text-sm leading-[1.143] ml-3"
              v-if="topic === 'rtc' && field.param === 'interval'"
            >
              {{ t('minutes') }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { type ControllerSettings } from '@/typings/settings';
import ButtonGroup from '@/components/Ui/ButtonGroup.vue';
import UiInput from '@/components/Ui/UiInput.vue';
import { type IsStringLiteral } from 'type-fest';
import LoginInput from '@/components/Ui/LoginInput.vue';
import openEye from '@/assets/img/open-eye.svg?raw';
import closedEye from '@/assets/img/closed-eye.svg?raw';
import DropDown from '@/components/Ui/DropDown.vue';
import { DateTime } from 'luxon';

type CommonControllerSettings = Pick<ControllerSettings, 'lan' | 'cloud' | 'rtc'> & {
  'root-login': Pick<ControllerSettings['login'], 'root-name' | 'root-pass'> & {
    'root-pass-repeat': string;
  };
  'user-login': Pick<ControllerSettings['login'], 'user-name' | 'user-pass'> & {
    'user-pass-repeat': string;
  };
};

type Fields = {
  [P in keyof CommonControllerSettings]: {
    [P2 in keyof CommonControllerSettings[P]]: {
      orientation: 'v' | 'h';
      param: P2;
      value: CommonControllerSettings[P][P2];
    } & (IsStringLiteral<CommonControllerSettings[P][P2]> extends false
      ? {
          type: 'string' | 'number' | 'password';
          widthClass: string;
        }
      : {
          type: 'btn-group';
          values: Readonly<CommonControllerSettings[P][P2][]>;
        });
  }[keyof CommonControllerSettings[P]][][];
};

const { api } = useApi();

const indexStore = useIndexStore();

const { controllerDateTime, lang } = storeToRefs(indexStore);

const isPasswordVisible = ref<Record<string, boolean>>({});

const isPasswordFocus = ref<Record<string, boolean>>({});

const isPasswordMismatch = computed<Record<string, boolean>>(() => ({
  'root-pass-repeat':
    fields.value?.['root-login'][2][0].value !== fields.value?.['root-login'][1][0].value,
  'user-pass-repeat':
    fields.value?.['user-login'][2][0].value !== fields.value?.['user-login'][1][0].value,
}));

const settingsInit = ref<ControllerSettings>();

const fields = ref<Fields | undefined>();

const timeZones = computed(() => {
  const t = controllerDateTime.value;
  const settings = settingsInit.value;
  if (!t || !settings) return [];
  return [...new Array(26)].map((_, i) => {
    const dt = DateTime.fromFormat(`${t.hour}:${t.min}:${t.sec}`, 'H:m:s').plus({
      hours: i - 12 - settings.rtc['time-zone'],
    });
    const time = dt.toFormat(lang.value === 'ru' ? 'HH:mm' : 'hh:mm');
    const meridiem = lang.value === 'en' ? dt.toFormat('a') : '';
    return {
      tz: `UTC${i > 12 ? '+' : ''}${i - 12}`,
      time: `${time} ${meridiem}`.trim(),
      value: i - 12,
    };
  });
});

function setFields(settings: ControllerSettings) {
  fields.value = {
    lan: [
      [
        {
          param: 'addr-mode',
          type: 'btn-group',
          values: lanAddrModes,
          orientation: 'h',
          value: settings.lan['addr-mode'],
        },
      ],
      [
        {
          param: 'ip-addr',
          type: 'string',
          orientation: 'v',
          value: settings.lan['ip-addr'],
          widthClass: 'w-[14.25rem]',
        },
        {
          param: 'ip-mask',
          type: 'string',
          orientation: 'v',
          value: settings.lan['ip-mask'],
          widthClass: 'w-[14.25rem]',
        },
        {
          param: 'ip-gate',
          type: 'string',
          orientation: 'v',
          value: settings.lan['ip-gate'],
          widthClass: 'w-[14.25rem]',
        },
        {
          param: 'serv-port',
          type: 'string',
          orientation: 'v',
          value: settings.lan['serv-port'],
          widthClass: 'w-[4.875rem]',
        },
      ],
    ],
    cloud: [
      [
        {
          param: 'mode',
          type: 'btn-group',
          values: cloudModes,
          orientation: 'h',
          value: settings.cloud.mode,
        },
      ],
      [
        {
          param: 'main-url',
          type: 'string',
          orientation: 'v',
          value: settings.cloud['main-url'],
          widthClass: 'w-[14.25rem]',
        },
        {
          param: 'main-port',
          type: 'number',
          orientation: 'v',
          value: settings.cloud['main-port'],
          widthClass: 'w-[4.875rem]',
        },
        {
          param: 'interval',
          type: 'number',
          orientation: 'v',
          value: settings.cloud.interval,
          widthClass: 'w-[6.438rem]',
        },
      ],
    ],
    rtc: [
      [
        {
          param: 'source',
          type: 'btn-group',
          values: rtcSources,
          orientation: 'h',
          value: settings.rtc.source,
        },
      ],
      [
        {
          param: 'time-zone',
          type: 'number',
          orientation: 'h',
          value: settings.rtc['time-zone'],
          widthClass: '',
        },
      ],
      [
        {
          param: 'ntp1-url',
          type: 'string',
          orientation: 'h',
          value: settings.rtc['ntp1-url'],
          widthClass: 'w-[14.25rem]',
        },
      ],
      [
        {
          param: 'interval',
          type: 'number',
          orientation: 'h',
          value: settings.rtc.interval,
          widthClass: 'w-[3.563rem]',
        },
      ],
    ],
    'root-login': [
      [
        {
          param: 'root-name',
          type: 'string',
          orientation: 'v',
          value: settings.login['root-name'],
          widthClass: 'w-[17.938rem]',
        },
      ],
      [
        {
          param: 'root-pass',
          type: 'password',
          orientation: 'v',
          value: '',
          widthClass: 'w-[17.938rem]',
        },
      ],
      [
        {
          param: 'root-pass-repeat',
          type: 'password',
          orientation: 'v',
          value: '',
          widthClass: 'w-[17.938rem]',
        },
      ],
    ],
    'user-login': [
      [
        {
          param: 'user-name',
          type: 'string',
          orientation: 'v',
          value: settings.login['user-name'],
          widthClass: 'w-[17.938rem]',
        },
      ],
      [
        {
          param: 'user-pass',
          type: 'password',
          orientation: 'v',
          value: '',
          widthClass: 'w-[17.938rem]',
        },
      ],
      [
        {
          param: 'user-pass-repeat',
          type: 'password',
          orientation: 'v',
          value: '',
          widthClass: 'w-[17.938rem]',
        },
      ],
    ],
  };
}

const { t } = useI18n({
  messages: {
    en: {
      lan: {
        param: 'LAN Settings',
        fields: {
          'addr-mode': {
            param: 'Address obtaining mode',
            values: {
              dhcp: 'DHCP',
              static: 'STATIC',
            },
          },
          'ip-addr': {
            param: 'IP address',
          },
          'ip-mask': {
            param: 'Network mask',
          },
          'ip-gate': {
            param: 'Gateway address',
          },
          'serv-port': {
            param: 'Port',
          },
        },
      },
      cloud: {
        param: 'Cloud',
        fields: {
          mode: {
            param: 'Cloud mode',
            values: {
              none: 'OFF',
              ethernet: 'ETH',
              gsm: 'GSM',
            },
          },
          interval: {
            param: 'Interval',
          },
          'main-url': {
            param: 'Server address',
          },
          'main-port': {
            param: 'Port',
          },
        },
      },
      rtc: {
        param: 'EVO NG clock',
        fields: {
          source: {
            param: 'Clock mode',
            values: {
              ntp: 'NTP',
              gsm: 'GSM',
              cloud: 'CLOUD',
            },
          },
          'ntp1-url': {
            param: 'NTP server address',
          },
          'time-zone': {
            param: 'Time zone',
          },
          interval: {
            param: 'Update every',
          },
        },
      },
      'root-login': {
        param: 'Editing the “Administrator” account',
        fields: {
          'root-name': {
            param: 'Login',
          },
          'root-pass': {
            param: 'New password',
          },
          'root-pass-repeat': {
            param: 'Confirm password',
          },
        },
      },
      'user-login': {
        param: 'Editing the “User” account',
        fields: {
          'user-name': {
            param: 'Login',
          },
          'user-pass': {
            param: 'New password',
          },
          'user-pass-repeat': {
            param: 'Confirm password',
          },
        },
      },
      minutes: 'minutes',
    },
    ru: {
      lan: {
        param: 'Настройки LAN',
        fields: {
          'addr-mode': {
            param: 'Режим получения адреса',
            values: {
              dhcp: 'DHCP',
              static: 'STATIC',
            },
          },
          'ip-addr': {
            param: 'IP адрес',
          },
          'ip-mask': {
            param: 'Маска подсети',
          },
          'ip-gate': {
            param: 'Сетевой шлюз',
          },
          'serv-port': {
            param: 'Порт',
          },
        },
      },
      cloud: {
        param: 'Cloud',
        fields: {
          mode: {
            param: 'Подключение к серверу',
            values: {
              none: 'OFF',
              ethernet: 'ETH',
              gsm: 'GSM',
            },
          },
          interval: {
            param: 'Интервал',
          },
          'main-url': {
            param: 'Адрес сервера',
          },
          'main-port': {
            param: 'Порт',
          },
        },
      },
      rtc: {
        param: 'Часы EVO NG',
        fields: {
          source: {
            param: 'Режим работы',
            values: {
              ntp: 'NTP',
              gsm: 'GSM',
              cloud: 'CLOUD',
            },
          },
          'ntp1-url': {
            param: 'Адрес NTP сервера',
          },
          'time-zone': {
            param: 'Часовой пояс',
          },
          interval: {
            param: 'Обновление каждые',
          },
        },
      },
      'root-login': {
        param: 'Редактирование учетной записи “Администратор”',
        fields: {
          'root-name': {
            param: 'Логин',
          },
          'root-pass': {
            param: 'Новый пароль',
          },
          'root-pass-repeat': {
            param: 'Подтверждение пароля',
          },
        },
      },
      'user-login': {
        param: 'Редактирование учетной записи “Пользователь”',
        fields: {
          'user-name': {
            param: 'Логин',
          },
          'user-pass': {
            param: 'Новый пароль',
          },
          'user-pass-repeat': {
            param: 'Подтверждение пароля',
          },
        },
      },
      minutes: 'минут',
    },
  },
});

onMounted(async () => {
  await new Promise((resolve) => setTimeout(resolve, 150));
  try {
    const r = await api.get('get_config');
    setFields(r.data);
    settingsInit.value = r.data;
  } catch (error) {
    //
  }
});
</script>
