<template>
  <div
    class="flex flex-col"
    v-if="fields"
  >
    <div
      v-for="(rows, topic) in fields"
      :key="topic"
      class="mt-8 pb-10 px-8"
    >
      <h2 class="font-semibold text-xl leading-[1.2]">
        {{ t(`${topic}.param`) }}
      </h2>
      <div
        v-for="(params, rowIndex) in rows"
        :key="rowIndex"
      >
        <div
          v-for="(field, param) in params"
          :key="param"
          :class="{
            'flex flex-row gap-x-3': field.orientation === 'h',
          }"
        >
          <div
            class="text-[#6d9cc5] text-sm leading-[1.143]"
            :class="{
              'flex flex-row items-center gap-x-[0.875rem]': field.orientation === 'h',
            }"
          >
            {{ t(`${topic}.fields.${field.param}.param`) }}
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
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { type ControllerSettings } from '@/typings/settings';
import ButtonGroup from '@/components/Ui/ButtonGroup.vue';
import { type IsStringLiteral } from 'type-fest';

type CommonControllerSettings = Pick<ControllerSettings, 'lan' | 'cloud' | 'rtc'> & {
  'root-login': Pick<ControllerSettings['login'], 'root-name' | 'root-pass'>;
  'user-login': Pick<ControllerSettings['login'], 'user-name' | 'user-pass'>;
};

type Fields = {
  [P in keyof CommonControllerSettings]: {
    [P2 in keyof CommonControllerSettings[P]]: {
      orientation: 'v' | 'h';
      param: P2;
      value: CommonControllerSettings[P][P2];
    } & (IsStringLiteral<CommonControllerSettings[P][P2]> extends false
      ? {
          type: 'text' | 'number';
        }
      : {
          type: 'btn-group';
          values: Readonly<CommonControllerSettings[P][P2][]>;
        });
  }[keyof CommonControllerSettings[P]][][];
};

const { api } = useApi();

const fields = ref<Fields | undefined>();

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
          type: 'text',
          orientation: 'v',
          value: settings.lan['ip-addr'],
        },
        {
          param: 'ip-mask',
          type: 'text',
          orientation: 'v',
          value: settings.lan['ip-mask'],
        },
        {
          param: 'ip-gate',
          type: 'text',
          orientation: 'v',
          value: settings.lan['ip-gate'],
        },
        {
          param: 'serv-port',
          type: 'text',
          orientation: 'v',
          value: settings.lan['serv-port'],
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
        {
          param: 'main-url',
          type: 'text',
          orientation: 'v',
          value: settings.cloud['main-url'],
        },
        {
          param: 'main-port',
          type: 'number',
          orientation: 'v',
          value: settings.cloud['main-port'],
        },
        {
          param: 'interval',
          type: 'number',
          orientation: 'v',
          value: settings.cloud.interval,
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
        {
          param: 'ntp1-url',
          type: 'text',
          orientation: 'v',
          value: settings.rtc['ntp1-url'],
        },
        {
          param: 'time-zone',
          type: 'number',
          orientation: 'v',
          value: settings.rtc['time-zone'],
        },
        {
          param: 'interval',
          type: 'number',
          orientation: 'v',
          value: settings.rtc.interval,
        },
      ],
    ],
    'root-login': [
      [
        {
          param: 'root-name',
          type: 'text',
          orientation: 'v',
          value: settings.login['root-name'],
        },
        {
          param: 'root-pass',
          type: 'text',
          orientation: 'v',
          value: settings.login['root-pass'],
        },
      ],
    ],
    'user-login': [
      [
        {
          param: 'user-name',
          type: 'text',
          orientation: 'v',
          value: settings.login['user-name'],
        },
        {
          param: 'user-pass',
          type: 'text',
          orientation: 'v',
          value: settings.login['user-pass'],
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
    },
  },
});

onBeforeMount(async () => {
  try {
    const r = await api.get('get_config');
    setFields(r.data);
  } catch (error) {
    //
  }
});
</script>
