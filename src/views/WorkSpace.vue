<template>
  <div class="w-full h-full flex flex-col overflow-hidden">
    <div class="h-[5.063rem] bg-[#092740] flex flex-row w-full items-center">
      <RouterLink
        :to="{ name: 'widgets' }"
        class="ml-10"
        ><span
          v-html="logo"
          class="[&>svg]:h-[1.688rem] [&>svg]:w-[1.688rem]"
        ></span
      ></RouterLink>
      <div class="w-[25rem] flex flex-row items-center justify-end">
        <span class="font-normal text-[2.375rem] leading-[1.158] tracking-[0.03em]">
          {{ formattedTime.time }}
        </span>
        <div
          class="ml-1"
          v-if="formattedTime.meridiem"
        >
          <div
            v-for="m in ['AM', 'PM']"
            :key="m"
            class="text-xs"
            :class="[
              m === formattedTime.meridiem ? 'text-[#158ef8] font-semibold' : 'text-[#1c4972]',
            ]"
          >
            {{ m }}
          </div>
        </div>
        <div class="mx-4">
          <div class="font-semibold text-sm leading-[1.214] tracking-[0.03em] capitalize">
            {{ formattedDay.weekDay }}
          </div>
          <div class="text-[#638bae] text-sm leading-[1.143]">
            {{ formattedDay.date }}
          </div>
        </div>
        <span v-html="gsm"></span>
        <div class="ml-4 relative group">
          <span v-html="info"></span>
          <div
            class="absolute left-0 -top-5 pl-8 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-[visibility,opacity]"
          >
            <div class="rounded-xl bg-[#1b4569] px-6 py-3 whitespace-nowrap">
              <div
                v-for="p in ['id', 'wi-ver', 'fw-ver'] as const"
                :key="p"
              >
                <span class="font-semibold text-[#77c3ff] text-sm mr-1">
                  {{ t(`info.${p}`) }}
                </span>
                <span class="text-[#a0d5ff] text-sm">
                  {{ infoData[p] }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="flex-1"></div>
      <button
        class="group text-[#638bae] hover:text-[#adebff] flex flex-row items-center mr-10 font-semibold text-[0.938rem] leading-[1.2] tracking-[0.03em]"
      >
        <span
          v-html="logout"
          class="mr-2"
        ></span>
        {{ t('logout') }}
      </button>
    </div>
    <RouterView class="flex-1" />
  </div>
</template>

<script setup lang="ts">
import logo from '@/assets/img/logo.svg?raw';
import logout from '@/assets/img/logout.svg?raw';
import gsm from '@/assets/img/gsm.svg?raw';
import info from '@/assets/img/info.svg?raw';
import { useApi } from '@/composables/useApi';
import { DateTime } from 'luxon';

const indexStore = useIndexStore();

const { lang, notConnected } = storeToRefs(indexStore);

const { api, isAborted, abort } = useApi();

const infoData = ref({
  id: '',
  'wi-ver': import.meta.env.VITE_INTERFACE_VERSION,
  'fw-ver': '',
});

const formattedTime = ref({ time: '', meridiem: '' });

const formattedDay = ref({ weekDay: '', date: '' });

let getDateTimeTimer = 0;

watch(notConnected, () => {
  if (!notConnected.value && isAborted.value) {
    getDateTime();
  }
});

watch(lang, () => {
  abort();
  clearTimeout(getDateTimeTimer);
  getInfoData();
});

function parseTime(t: { hour: number; min: number; sec: number }) {
  const dt = DateTime.fromFormat(`${t.hour}:${t.min}:${t.sec}`, 'H:m:s');
  formattedTime.value.time = dt.toFormat(lang.value === 'ru' ? 'HH:mm' : 'hh:mm');
  formattedTime.value.meridiem = lang.value === 'en' ? dt.toFormat('a') : '';
}

function parseDate(d: { year: number; mon: number; day: number }) {
  const dt = DateTime.fromFormat(`${d.year}-${d.mon}-${d.day}`, 'y-M-d', { locale: lang.value });
  formattedDay.value.weekDay = dt.toFormat('EEEE');
  formattedDay.value.date = dt.toFormat(lang.value === 'ru' ? 'd MMMM' : 'MMMM d');
}

async function getDateTime() {
  let timeout = 1000;
  try {
    const r = await api.get('get_time');
    parseTime(r.data);
    if (r.data.hour === 0 && r.data.min === 0 && r.data.sec < 20) {
      parseDate(r.data);
    }
    if (r.data.sec < 30) {
      timeout = 20000;
    } else if (r.data.sec < 40) {
      timeout = 10000;
    } else if (r.data.sec < 50) {
      timeout = 5000;
    } else if (r.data.sec < 58) {
      timeout = 2000;
    }
  } catch (error) {
    if (isAborted.value) {
      return;
    }
  }
  getDateTimeTimer = setTimeout(getDateTime, timeout);
}

async function getInfoData() {
  try {
    const r = await api.get('get_cmn_info');
    infoData.value['fw-ver'] = r.data['fw-ver'];
    infoData.value.id = r.data.id;
    parseTime(r.data.time);
    parseDate(r.data.time);
    getDateTimeTimer = setTimeout(getDateTime, 5000);
  } catch (error) {
    if (isAborted.value) {
      return;
    }
    getDateTimeTimer = setTimeout(getInfoData, 1000);
  }
}

onBeforeMount(getInfoData);

const { t } = useI18n({
  messages: {
    en: {
      logout: 'Log out',
      info: {
        id: 'EVO NG ID:',
        'wi-ver': 'Web interface version:',
        'fw-ver': 'Firmware:',
      },
    },
    ru: {
      logout: 'Выйти',
      info: {
        id: 'EVO NG ID:',
        'wi-ver': 'Версия веб-интерфейса:',
        'fw-ver': 'Прошивка:',
      },
    },
  },
});
</script>
