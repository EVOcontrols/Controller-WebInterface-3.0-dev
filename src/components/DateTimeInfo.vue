<template>
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
                    m === formattedTime.meridiem
                        ? 'text-[#158ef8] font-semibold'
                        : 'text-[#1c4972]',
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
                class="absolute left-0 -top-5 pl-8 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-[visibility,opacity] z-[1]"
            >
                <div class="rounded-xl bg-[#1b4569] px-6 py-3 whitespace-nowrap">
                    <div
                        v-for="p in ['id', 'wi-ver', 'fw-ver'] as const"
                        :key="p"
                    >
                        <span class="font-semibold text-[#77c3ff] text-sm mr-1">
                            {{ t(`info.${p}`) }}
                        </span>
                        <span
                            class="text-[#a0d5ff] text-sm"
                            :class="{ 'cursor-pointer': p === 'id' && isSupported }"
                            :title="p === 'id' && isSupported ? 'Copy' : ''"
                            @click="
                                p === 'id' && infoData.id && isSupported ? copy(infoData.id) : ''
                            "
                        >
                            {{ infoData[p] }}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import gsm from '@/assets/img/gsm.svg?raw';
import info from '@/assets/img/info.svg?raw';
import { DateTime } from 'luxon';

const indexStore = useIndexStore();

const { lang, notConnected, rebootingDeviceAddr, isLongQueryRunning, controllerDateTime } =
    storeToRefs(indexStore);

const api = indexStore.getApi().api;

const isAborted = indexStore.getApi().isAborted;

const abort = indexStore.getApi().abort;

const { copy, isSupported } = useClipboard();

const infoData = ref<{ id?: string; 'wi-ver': string; 'fw-ver'?: string }>({
    'wi-ver': import.meta.env.VITE_INTERFACE_VERSION,
});

const formattedTime = ref({ time: '', meridiem: '' });

const formattedDay = ref({ weekDay: '', date: '' });

let getDateTimeTimer = 0;

let getInfoDataTimer = 0;

// watch(notConnected, () => {
//   if (!notConnected.value && isAborted.value) {
//     getDateTime();
//   }
// });

watch(lang, () => {
    // abort();
    // clearTimeout(getInfoDataTimer);
    // getInfoData();
    if (!controllerDateTime.value) return;
    parseDate(controllerDateTime.value);
    parseTime(controllerDateTime.value);
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
    if (rebootingDeviceAddr.value === 0 || isLongQueryRunning.value || notConnected.value) {
        getDateTimeTimer = setTimeout(getDateTime, 1000);
        return;
    }
    let timeout = 1000;
    try {
        const r = await api.get('get_time');
        indexStore.setControllerDateTime(r.data);
        parseTime(r.data);
        parseDate(r.data);
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
    } catch (error) {
        if (isAborted.value) {
            return;
        }
        getInfoDataTimer = setTimeout(getInfoData, 1000);
    }
}

onBeforeMount(() => {
    getInfoData();
    getDateTime();
});

onBeforeUnmount(() => {
    clearTimeout(getDateTimeTimer);
    clearTimeout(getInfoDataTimer);
    abort();
});

const { t } = useI18n({
    messages: {
        en: {
            info: {
                id: 'EVO NG ID:',
                'wi-ver': 'Web interface version:',
                'fw-ver': 'Firmware:',
            },
        },
        ru: {
            info: {
                id: 'EVO NG ID:',
                'wi-ver': 'Версия веб-интерфейса:',
                'fw-ver': 'Прошивка:',
            },
        },
    },
});
</script>
