<template>
    <div class="h-full flex flex-col">
        <div class="flex flex-col flex-1 overflow-auto scrollbar-4 relative">
            <div class="relative bg-[#08253d]">
                <div
                    v-for="(rows, topic) in fields"
                    :key="topic"
                    class="mt-8 mx-8 flex flex-col gap-y-6 border-b border-[#0b3d68] last:border-none"
                    :class="[
                        topic === 'rtc' ? 'pb-4' : 'pb-10',
                        { hidden: topic === 'gsm' && cloudMode !== 'gsm' },
                    ]"
                >
                    <h2 class="font-semibold text-xl leading-[1.2] whitespace-pre">
                        {{ t(`${topic}.param`) }}
                    </h2>
                    <div
                        :class="[
                            topic === 'rtc'
                                ? 'table w-max border-spacing-y-6'
                                : 'flex flex-col gap-y-6',
                        ]"
                    >
                        <div
                            v-for="(params, rowIndex) in rows"
                            :key="rowIndex"
                            :class="[
                                topic === 'rtc' ? 'table-row-group' : 'flex flex-row gap-x-3',
                                {
                                    hidden:
                                        topic === 'lan' && params.length > 1 && addrMode === 'dhcp',
                                },
                            ]"
                        >
                            <div
                                v-for="field in params"
                                :key="field.param"
                                class="text-[#6d9cc5] text-sm leading-[1.143]"
                                :class="[
                                    field.orientation === 'h'
                                        ? 'flex-row items-center gap-x-[0.875rem]'
                                        : 'flex-col items-start gap-y-1.5',
                                    topic === 'rtc' ? 'table-row' : 'flex',
                                ]"
                            >
                                <span
                                    v-if="topic !== 'tempUnit' && topic !== 'lang'"
                                    :class="[topic === 'rtc' ? 'table-cell pr-5 align-middle' : '']"
                                >
                                    {{ t(`${topic}.fields.${field.param}.param`) }}
                                </span>
                                <div v-if="topic === 'tempUnit'">
                                    <button
                                        v-for="unit in tempUnits"
                                        :key="unit"
                                        v-html="unit === '°C' ? celsius : fahrenheit"
                                        type="button"
                                        class="group mr-2.5"
                                        :class="{
                                            on: field.value === unit,
                                        }"
                                        @click="field.value = unit"
                                    ></button>
                                </div>
                                <div v-else-if="topic === 'lang' && field.type === 'btn-group'">
                                    <button
                                        v-for="l in field.values"
                                        :key="l.value"
                                        type="button"
                                        class="text-[#4a779e] text-sm leading-[1.143] tracking-[0.071em] hover:text-[#58b1ff] on:text-[#2b9bff] on:font-semibold transition-[color,font-weight] mr-3"
                                        :class="{ on: field.value === l.value }"
                                        @click="field.value = l.value"
                                    >
                                        {{ l.text }}
                                    </button>
                                </div>
                                <ButtonGroup
                                    v-else-if="field.type === 'btn-group'"
                                    :buttons="field.values"
                                    :value="field.value"
                                    @change="
                                        ($event) => {
                                            field.value = $event;
                                            if (
                                                topic === 'lan' &&
                                                ($event === 'dhcp' || $event === 'static')
                                            ) {
                                                addrMode = $event;
                                            } else if (
                                                topic === 'cloud' &&
                                                ($event === 'none' ||
                                                    $event === 'ethernet' ||
                                                    $event === 'gsm')
                                            ) {
                                                cloudMode = $event;
                                            }
                                        }
                                    "
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
                                                {{ timeZones[(field.value || 0) + 12]?.tz }}
                                            </span>
                                            <span class="font-roboto text-[#2b9bff] lowercase">
                                                {{ timeZones[(field.value || 0) + 12]?.time }}
                                            </span>
                                        </button>
                                    </template>
                                    <template #body="{ isOpen, onSelect }">
                                        <div
                                            class="w-full rounded-lg bg-[#0f304b] flex flex-col py-[0.31rem]"
                                            v-if="isOpen"
                                        >
                                            <div
                                                class="max-h-[11.563rem] overflow-auto scrollbar-3 px-1.5"
                                            >
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
                                                    <span
                                                        class="font-roboto text-[#2b9bff] lowercase"
                                                    >
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
                                        :isError="
                                            !!isPasswordMismatch[field.param] ||
                                            !!isPasswordMissed[field.param] ||
                                            !isPassworValid[field.param]
                                        "
                                        :isSuccess="
                                            !isPasswordMismatch[field.param] &&
                                            field.param.includes('repeat') &&
                                            !!field.value &&
                                            !!field.value.length
                                        "
                                        :name="field.param"
                                        :init-value="field.value as string"
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
                                                isPasswordVisible[field.param] =
                                                    !isPasswordVisible[field.param];
                                            }
                                        "
                                    >
                                        <Transition
                                            mode="out-in"
                                            name="scale-y-150"
                                        >
                                            <span
                                                v-html="
                                                    isPasswordVisible[field.param]
                                                        ? openEye
                                                        : closedEye
                                                "
                                                :key="
                                                    isPasswordVisible[field.param]
                                                        ? 'openEye'
                                                        : 'closedEye'
                                                "
                                                class="w-[1.125rem] h-[1.125rem] block group/icon"
                                                :class="{
                                                    on:
                                                        isPasswordFocus[field.param] &&
                                                        !isPasswordMismatch[field.param] &&
                                                        !isPasswordMissed[field.param] &&
                                                        isPassworValid[field.param],
                                                    error:
                                                        isPasswordMismatch[field.param] ||
                                                        isPasswordMissed[field.param] ||
                                                        !isPassworValid[field.param],
                                                    success:
                                                        !isPasswordMismatch[field.param] &&
                                                        field.param.includes('repeat') &&
                                                        !!field.value &&
                                                        !!field.value.length &&
                                                        isPassworValid[field.param],
                                                }"
                                            ></span>
                                        </Transition>
                                    </button>
                                    <div
                                        class="absolute top-full mt-[0.375rem] ml-[0.375rem] left-0 whitespace-nowrap flex items-center gap-[0.375rem] text-[#f83068] opacity-0 invisible transition-[opacity,visibility]"
                                        :class="{
                                            '!opacity-100 !visible':
                                                isPasswordMismatch[field.param],
                                        }"
                                    >
                                        <span v-html="stop"></span>
                                        <div class="h-[1.125rem] flex items-end">
                                            {{ t('errors.password.mismatch') }}
                                        </div>
                                    </div>
                                    <div
                                        class="absolute top-full mt-[0.375rem] ml-[0.375rem] left-0 whitespace-nowrap flex items-center gap-[0.375rem] text-[#37C3A2] opacity-0 invisible transition-[opacity,visibility]"
                                        :class="{
                                            '!opacity-100 !visible':
                                                !isPasswordMismatch[field.param] &&
                                                field.param.includes('repeat') &&
                                                !!field.value &&
                                                !!field.value.length &&
                                                isPassworValid[field.param],
                                        }"
                                    >
                                        <span v-html="doneGreen"></span>
                                        <div class="h-[1.125rem] flex items-end">
                                            {{ t('errors.password.ok') }}
                                        </div>
                                    </div>
                                    <!-- <div
                                        class="absolute left-full ml-3 top-0 bottom-0 whitespace-nowrap my-auto flex items-center text-[#f83068] opacity-0 invisible transition-[opacity,visibility]"
                                        :class="{
                                            '!opacity-100 !visible': isPasswordMissed[field.param],
                                        }"
                                    >
                                        {{ t('errors.password.required') }}
                                    </div> -->
                                </div>
                                <div v-else>
                                    <UiInput
                                        :init-type="field.type"
                                        :init-value="field.value"
                                        :name="field.param"
                                        :placeholder="
                                            topic === 'gsm'
                                                ? t(`${topic}.fields.${field.param}.param`)
                                                : ''
                                        "
                                        class="table-cell"
                                        :class="[field.widthClass]"
                                        :input-type="field.validationType"
                                        :status="field.status"
                                        :minMax="
                                            topic === 'rtc' && field.param === 'interval'
                                                ? [3, undefined]
                                                : undefined
                                        "
                                        :required="
                                            field.isRequired ||
                                            (field.param === 'root-name' &&
                                                !!changesAndErrors.changes.settings?.login?.[
                                                    'root-pass'
                                                ]) ||
                                            (field.param === 'user-name' &&
                                                !!changesAndErrors.changes.settings?.login?.[
                                                    'user-pass'
                                                ])
                                        "
                                        @valueChanged="field.value = $event"
                                        @statusChanged="field.status = $event"
                                    />
                                    <span
                                        class="text-[#4b7ca8] text-sm leading-[1.143] ml-3"
                                        v-if="topic === 'rtc' && field.param === 'interval'"
                                    >
                                        {{ t('minutes') }}
                                    </span>
                                    <!-- <span
                                        class="ml-3 text-sm text-[#f83068] opacity-0 invisible transition-[opacity,visibility]"
                                        v-if="
                                            isKeyOf(isUsernameMissed, field.param) ||
                                            isKeyOf(isUsernameShort, field.param) ||
                                            isKeyOf(isUsernameLong, field.param)
                                        "
                                        :class="{
                                            '!opacity-100 !visible':
                                                (isKeyOf(isUsernameMissed, field.param) &&
                                                    isUsernameMissed[field.param]) ||
                                                (isKeyOf(isUsernameShort, field.param) &&
                                                    isUsernameShort[field.param]) ||
                                                (isKeyOf(isUsernameLong, field.param) &&
                                                    isUsernameLong[field.param]),
                                        }"
                                    >
                                        {{
                                            isKeyOf(isUsernameMissed, field.param) &&
                                            isUsernameMissed[field.param]
                                                ? t('errors.login.required')
                                                : isKeyOf(isUsernameShort, field.param) &&
                                                  isUsernameShort[field.param]
                                                ? t('errors.login.minLength')
                                                : t('errors.login.maxLength')
                                        }}
                                    </span> -->
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div
                    class="absolute top-0 left-0 h-full w-full z-[3]"
                    v-if="isSaving"
                ></div>
            </div>
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
import type {
    CommonControllerSettings,
    CommonSettingsFields,
    ControllerSettings,
    PasswordFieldName,
} from '@/typings/settings';
import ButtonGroup from '@/components/Ui/ButtonGroup.vue';
import UiInput from '@/components/Ui/UiInput.vue';
import type { PartialDeep } from 'type-fest';
import LoginInput from '@/components/Ui/LoginInput.vue';
import openEye from '@/assets/img/open-eye.svg?raw';
import closedEye from '@/assets/img/closed-eye.svg?raw';
import stop from '@/assets/img/stop.svg?raw';
import doneGreen from '@/assets/img/done-green.svg?raw';
import DropDown from '@/components/Ui/DropDown.vue';
import { DateTime } from 'luxon';
import SaveButton from '@/components/Ui/SaveButton.vue';
import { cloneDeep, isEmpty, set } from 'lodash';
import type { Lang, TempUnit } from '@/typings/common';
import type { FuncsNumberPerPage } from '@/typings/funcs';
import celsius from '@/assets/img/settings/celsius.svg?raw';
import fahrenheit from '@/assets/img/settings/fahrenheit.svg?raw';
import { useStoreCommonSettingsFile } from '@/composables/useStoreCommonSettingsFile';

const router = useRouter();

const { api } = useApiStore();

const indexStore = useIndexStore();

const { controllerDateTime, lang, tempUnit } = storeToRefs(indexStore);

const funcsStore = useFuncsStore();

const { funcsNumberPerPage } = storeToRefs(funcsStore);

const { toast } = useToast();

const { storeCommonSettingsFile } = useStoreCommonSettingsFile();

const isPasswordVisible = ref<Record<string, boolean>>({});

const isPasswordFocus = ref<Record<string, boolean>>({});

const isPasswordMismatch = computed<Partial<Record<PasswordFieldName, boolean>>>(() => ({
    'root-pass-repeat':
        fields.value?.['root-login'][2][0].value !== fields.value?.['root-login'][1][0].value,
    'user-pass-repeat':
        fields.value?.['user-login'][2][0].value !== fields.value?.['user-login'][1][0].value,
}));

const isPassworValid = computed<Partial<Record<PasswordFieldName, boolean>>>(() => {
    const rootPass = fields.value?.['root-login'][1][0].value;
    const userPass = fields.value?.['user-login'][1][0].value;
    const rootPassRepeat = fields.value?.['root-login'][2][0].value;
    const userPassRepeat = fields.value?.['user-login'][2][0].value;
    return {
        'root-pass': rootPass ? /^[a-zA-Z0-9]{1,31}$/.test(rootPass) : true,
        'user-pass': userPass ? /^[a-zA-Z0-9]{1,31}$/.test(userPass) : true,
        'root-pass-repeat': rootPassRepeat ? /^[a-zA-Z0-9]{1,31}$/.test(rootPassRepeat) : true,
        'user-pass-repeat': userPassRepeat ? /^[a-zA-Z0-9]{1,31}$/.test(userPassRepeat) : true,
    };
});

const isPasswordMissed = computed<Partial<Record<PasswordFieldName, boolean>>>(() => ({
    'root-pass':
        !!changesAndErrors.value.changes.settings?.login?.['root-name'] &&
        !changesAndErrors.value.changes.settings?.login?.['root-pass'],
    'user-pass':
        !!changesAndErrors.value.changes.settings?.login?.['user-name'] &&
        !changesAndErrors.value.changes.settings?.login?.['user-pass'],
}));

// const isUsernameMissed = computed(() => ({
//     'root-name':
//         !fields.value?.['root-login'][0][0].value &&
//         !!changesAndErrors.value.changes.settings?.login?.['root-pass'],
//     'user-name':
//         !fields.value?.['user-login'][0][0].value &&
//         !!changesAndErrors.value.changes.settings?.login?.['user-pass'],
// }));

// const isUsernameShort = computed(() => {
//     const rootName = fields.value?.['root-login'][0][0].value;
//     const userName = fields.value?.['user-login'][0][0].value;
//     return {
//         'root-name':
//             rootName &&
//             !!changesAndErrors.value.changes.settings?.login?.['root-pass'] &&
//             rootName.length < 6,
//         'user-name':
//             userName &&
//             !!changesAndErrors.value.changes.settings?.login?.['user-pass'] &&
//             userName.length < 6,
//     };
// });

// const isUsernameLong = computed(() => {
//     const rootName = fields.value?.['root-login'][0][0].value;
//     const userName = fields.value?.['user-login'][0][0].value;
//     return {
//         'root-name':
//             rootName &&
//             !!changesAndErrors.value.changes.settings?.login?.['root-pass'] &&
//             rootName.length > 31,
//         'user-name':
//             userName &&
//             !!changesAndErrors.value.changes.settings?.login?.['user-pass'] &&
//             userName.length > 31,
//     };
// });

const isSaveButtonDisabled = computed(() => {
    return (
        (isEmpty(changesAndErrors.value.changes.settings) &&
            isEmpty(changesAndErrors.value.changes.files)) ||
        changesAndErrors.value.isErrors ||
        isPasswordMismatch.value['root-pass-repeat'] ||
        isPasswordMismatch.value['user-pass-repeat'] ||
        isPasswordMissed.value['root-pass'] ||
        isPasswordMissed.value['user-pass'] ||
        !isPassworValid.value['user-pass'] ||
        !isPassworValid.value['root-pass']
    );
});

const fields = ref<CommonSettingsFields | undefined>();

const fieldsInit = ref<CommonSettingsFields | undefined>();

const isSaving = ref(false);

const addrMode = ref<'dhcp' | 'static' | undefined>();

const cloudMode = ref<'none' | 'ethernet' | 'gsm' | undefined>();

const timeZones = computed(() => {
    const t = controllerDateTime.value;
    const tzInit = fieldsInit.value?.rtc
        .find((f) => f.find((p) => p.param === 'time-zone'))
        ?.find((p) => p.param === 'time-zone')?.value as number;
    if (!t || !tzInit) return [];
    return [...new Array(26)].map((_, i) => {
        const dt = DateTime.fromFormat(`${t.hour}:${t.min}:${t.sec}`, 'H:m:s').plus({
            hours: i - 12 - tzInit,
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

const changesAndErrors = computed(() => {
    const changes: {
        settings?: PartialDeep<ControllerSettings>;
        files?: { funcsNumberPerPage?: `${FuncsNumberPerPage}`; tempUnit?: TempUnit; lang?: Lang };
    } = {};
    let isErrors = false;
    const currentFields = fields.value;
    const init = fieldsInit.value;
    if (init && currentFields) {
        (Object.keys(currentFields) as (keyof CommonControllerSettings)[]).forEach((topic) => {
            // if (isErrors) return;
            currentFields[topic].forEach((row, rowIndex) => {
                // if (isErrors) return;
                row.forEach((param, paramIndex) => {
                    // if (isErrors) return;
                    if (/^(root|user)-pass$/.test(param.param)) {
                        if (param.value) {
                            set(changes, ['settings', 'login', param.param], md5(param.value));
                        }
                    } else if (
                        !/^(root|user)-pass-repeat$/.test(param.param) &&
                        param.value !== init[topic][rowIndex][paramIndex].value
                    ) {
                        if (/^(root|user)-name$/.test(param.param)) {
                            if (param.value) {
                                set(changes, ['settings', 'login', param.param], param.value);
                            }
                        } else if (
                            param.type === 'btn-group' ||
                            param.type !== 'number' ||
                            param.status !== 'empty'
                        ) {
                            if (
                                (
                                    [
                                        'funcsNumberPerPage',
                                        'tempUnit',
                                        'lang',
                                    ] as (keyof CommonControllerSettings)[]
                                ).includes(topic)
                            ) {
                                set(changes, ['files', param.param], param.value);
                            } else {
                                set(changes, ['settings', topic, param.param], param.value);
                            }
                        }
                    }
                    if (!isErrors && param.type !== 'btn-group') {
                        isErrors =
                            param.status === 'invalid' ||
                            param.status === 'not-allowed' ||
                            (param.status === 'empty' &&
                                ['apn', 'user', 'password'].includes(param.param));
                    }
                });
            });
        });
        if (
            changes.settings?.login?.['root-pass'] &&
            !changes.settings.login['root-name'] &&
            fields.value?.['root-login'][0][0].value
        ) {
            set(
                changes,
                ['settings', 'login', 'root-name'],
                fields.value?.['root-login'][0][0].value,
            );
        }
        if (
            changes.settings?.login?.['user-pass'] &&
            !changes.settings.login['user-name'] &&
            fields.value?.['user-login'][0][0].value
        ) {
            set(
                changes,
                ['settings', 'login', 'user-name'],
                fields.value?.['user-login'][0][0].value,
            );
        }
    }
    return { changes, isErrors };
});

function setFields(settings: ControllerSettings) {
    fields.value = {
        lan: [
            [
                {
                    param: 'addr-mode',
                    type: 'btn-group',
                    values: lanAddrModes.map((v) => ({
                        text: t(`lan.fields.addr-mode.values.${v}`),
                        value: v,
                    })),
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
                    status: 'valid',
                    validationType: ['ip'],
                    isRequired: true,
                },
                {
                    param: 'ip-mask',
                    type: 'string',
                    orientation: 'v',
                    value: settings.lan['ip-mask'],
                    widthClass: 'w-[14.25rem]',
                    status: 'valid',
                    validationType: ['ip'],
                    isRequired: true,
                },
                {
                    param: 'ip-gate',
                    type: 'string',
                    orientation: 'v',
                    value: settings.lan['ip-gate'],
                    widthClass: 'w-[14.25rem]',
                    status: 'valid',
                    validationType: ['ip'],
                    isRequired: true,
                },
                {
                    param: 'serv-port',
                    type: 'number',
                    orientation: 'v',
                    value: settings.lan['serv-port'],
                    widthClass: 'w-[4.875rem]',
                    status: 'valid',
                    validationType: ['int'],
                },
            ],
        ],
        cloud: [
            [
                {
                    param: 'mode',
                    type: 'btn-group',
                    values: cloudModes.map((v) => ({
                        text: t(`cloud.fields.mode.values.${v}`),
                        value: v,
                    })),
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
                    status: 'valid',
                    validationType: ['ip', 'url'],
                },
                {
                    param: 'main-port',
                    type: 'number',
                    orientation: 'v',
                    value: settings.cloud['main-port'],
                    widthClass: 'w-[4.875rem]',
                    status: 'valid',
                    validationType: ['int'],
                },
                {
                    param: 'interval',
                    type: 'number',
                    orientation: 'v',
                    value: settings.cloud.interval,
                    widthClass: 'w-[6.438rem]',
                    status: 'valid',
                    validationType: ['int'],
                },
            ],
        ],
        gsm: [
            [
                {
                    param: 'mode',
                    type: 'btn-group',
                    values: gsmModes.map((v) => ({
                        text: t(`gsm.fields.mode.values.${v}`),
                        value: v,
                    })),
                    orientation: 'h',
                    value: settings.gsm.mode,
                },
            ],
            [
                {
                    param: 'apn',
                    type: 'string',
                    orientation: 'v',
                    value: settings.gsm.apn,
                    widthClass: 'w-[14.25rem]',
                    status: 'valid',
                    validationType: ['string'],
                },
                {
                    param: 'user',
                    type: 'string',
                    orientation: 'v',
                    value: settings.gsm.user,
                    widthClass: 'w-[14.25rem]',
                    status: 'valid',
                    validationType: ['string'],
                },
                {
                    param: 'password',
                    type: 'string',
                    orientation: 'v',
                    value: settings.gsm.password,
                    widthClass: 'w-[14.25rem]',
                    status: 'valid',
                    validationType: ['string'],
                },
            ],
        ],
        rtc: [
            [
                {
                    param: 'source',
                    type: 'btn-group',
                    values: rtcSources.map((v) => ({
                        text: t(`rtc.fields.source.values.${v}`),
                        value: v,
                    })),
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
                    status: 'valid',
                },
            ],
            [
                {
                    param: 'ntp1-url',
                    type: 'string',
                    orientation: 'h',
                    value: settings.rtc['ntp1-url'],
                    widthClass: 'w-[14.25rem]',
                    status: 'valid',
                    validationType: ['ip', 'url'],
                },
            ],
            [
                {
                    param: 'interval',
                    type: 'number',
                    orientation: 'h',
                    value: settings.rtc.interval / 60,
                    widthClass: 'w-[3.563rem] !text-center !px-2',
                    status: 'valid',
                    validationType: ['int'],
                },
            ],
        ],
        gnss: [
            [
                {
                    param: 'latitude',
                    type: 'string',
                    orientation: 'v',
                    value: settings.gnss.latitude,
                    widthClass: 'w-[14.25rem]',
                    status: 'valid',
                    validationType: ['latitude'],
                },
                {
                    param: 'longitude',
                    type: 'string',
                    orientation: 'v',
                    value: settings.gnss.longitude,
                    widthClass: 'w-[14.25rem]',
                    status: 'valid',
                    validationType: ['longitude'],
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
                    status: 'valid',
                    isRequired: true,
                },
            ],
            [
                {
                    param: 'root-pass',
                    type: 'password',
                    orientation: 'v',
                    value: '',
                    widthClass: 'w-[17.938rem]',
                    status: 'valid',
                    isRequired: true,
                },
            ],
            [
                {
                    param: 'root-pass-repeat',
                    type: 'password',
                    orientation: 'v',
                    value: '',
                    widthClass: 'w-[17.938rem]',
                    status: 'valid',
                    isRequired: true,
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
                    status: 'valid',
                    isRequired: true,
                },
            ],
            [
                {
                    param: 'user-pass',
                    type: 'password',
                    orientation: 'v',
                    value: '',
                    widthClass: 'w-[17.938rem]',
                    status: 'valid',
                    isRequired: true,
                },
            ],
            [
                {
                    param: 'user-pass-repeat',
                    type: 'password',
                    orientation: 'v',
                    value: '',
                    widthClass: 'w-[17.938rem]',
                    status: 'valid',
                    isRequired: true,
                },
            ],
        ],
        funcsNumberPerPage: [
            [
                {
                    param: 'funcsNumberPerPage',
                    type: 'btn-group',
                    orientation: 'h',
                    value: `${funcsNumberPerPage.value}`,
                    values: funcsNumbersPerPage.map((v) => ({
                        text: v.toString(),
                        value: `${v}`,
                    })),
                },
            ],
        ],
        tempUnit: [
            [
                {
                    param: 'tempUnit',
                    type: 'btn-group',
                    orientation: 'h',
                    value: tempUnit.value,
                    values: tempUnits.map((v) => ({
                        text: v,
                        value: v,
                    })),
                },
            ],
        ],
        lang: [
            [
                {
                    param: 'lang',
                    type: 'btn-group',
                    orientation: 'h',
                    value: lang.value,
                    values: langs.map((v) => ({
                        text: v === 'en' ? 'ENG' : 'РУС',
                        value: v,
                    })),
                },
            ],
        ],
    };
    fieldsInit.value = cloneDeep(fields.value);
}

async function save() {
    isSaving.value = true;
    const { changes } = changesAndErrors.value;
    if (changes.settings?.rtc?.interval) {
        changes.settings.rtc.interval *= 60;
    }
    if (changes.settings?.gsm && cloudMode.value !== 'gsm') {
        delete changes.settings.gsm;
    }
    try {
        if (changes.files) {
            const r = await storeCommonSettingsFile(
                changes.files.lang,
                changes.files.tempUnit,
                changes.files.funcsNumberPerPage
                    ? (parseInt(changes.files.funcsNumberPerPage) as FuncsNumberPerPage)
                    : undefined,
            );
            if (r === 'error') {
                throw '';
            }
        }
        if (changes.settings) {
            const r = await api.post('set_config', changes.settings);
            const newIp = changes.settings?.lan?.['ip-addr'];
            const newPort = changes.settings?.lan?.['serv-port'];
            if (r.data['reboot-req']) {
                setRebootToast();
            }
            if (newIp || newPort) {
                const initIp = fieldsInit.value?.lan
                    .find((row) => row.find((p) => p.param === 'ip-addr'))
                    ?.find((p) => p.param === 'ip-addr')?.value as string;
                const initPort = fieldsInit.value?.lan
                    .find((row) => row.find((p) => p.param === 'serv-port'))
                    ?.find((p) => p.param === 'serv-port')?.value as number;
                window.location.host = `${newIp || initIp}:${newPort || initPort}`;
                return;
            }
        }
        (['root-login', 'user-login'] as (keyof CommonControllerSettings)[]).forEach((topic) => {
            fields.value?.[topic].forEach((row) =>
                row.forEach((p) => {
                    if (
                        p.param === 'root-pass' ||
                        p.param === 'root-pass-repeat' ||
                        p.param === 'user-pass' ||
                        p.param === 'user-pass-repeat'
                    ) {
                        p.value = '';
                    }
                }),
            );
            fieldsInit.value = cloneDeep(fields.value);
            if (changes.files?.lang) {
                indexStore.setLang(changes.files.lang);
            }
        });
    } catch (error) {
        toast.error(t('toast.error.header'), t('toast.error.text'));
        console.log(error);
    }
    isSaving.value = false;
}

function setRebootToast() {
    const toastId = toast.info(
        t('toast.reboot.rebootRequired'),
        [
            `${t('toast.reboot.press')} `,
            {
                text: t('toast.reboot.here'),
                action: () => {
                    indexStore.deleteToast(toastId);
                    router.push({ name: 'devices' });
                },
            },
            ` ${t('toast.reboot.forReboot')}`,
        ],
        0,
    );
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
            gsm: {
                param: 'GSM',
                fields: {
                    mode: {
                        param: 'Modem operating mode',
                        values: {
                            auto: 'AUTO',
                            nbiot: 'NBIOT',
                            'cat-m': 'CAT-M',
                            off: 'OFF',
                        },
                    },
                    apn: {
                        param: 'APN',
                    },
                    user: {
                        param: 'Login',
                    },
                    password: {
                        param: 'Password',
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
            gnss: {
                param: 'EVO NG location',
                fields: {
                    latitude: {
                        param: 'Latitude',
                    },
                    longitude: {
                        param: 'Longitude',
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
            funcsNumberPerPage: {
                param: 'The number of items in the list \non the “Functions” page',
                fields: {
                    funcsNumberPerPage: {
                        param: 'Number of functions',
                    },
                },
            },
            tempUnit: {
                param: 'Temperature unit',
            },
            lang: {
                param: 'Language',
            },
            minutes: 'minutes',
            errors: {
                login: {
                    minLength: 'The minimum login length is 6 characters',
                    maxLength: 'The maximum login length is 31 characters',
                    required: 'Login is required when changing password',
                },
                password: {
                    mismatch: 'Password does not match',
                    required: 'Password is required when changing login',
                    ok: 'Password matches',
                },
            },
            toast: {
                success: 'Saved',
                error: {
                    header: 'Error',
                    text: 'Check entered values',
                },
                reboot: {
                    rebootRequired: 'Reboot required',
                    press: 'Press',
                    here: 'here',
                    forReboot: 'for reboot',
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
            gsm: {
                param: 'GSM',
                fields: {
                    mode: {
                        param: 'Режим работы модема',
                        values: {
                            auto: 'AUTO',
                            nbiot: 'NBIOT',
                            'cat-m': 'CAT-M',
                            off: 'OFF',
                        },
                    },
                    apn: {
                        param: 'APN',
                    },
                    user: {
                        param: 'Логин',
                    },
                    password: {
                        param: 'Пароль',
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
            gnss: {
                param: 'Местоположение EVO NG',
                fields: {
                    latitude: {
                        param: 'Широта',
                    },
                    longitude: {
                        param: 'Долгота',
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
            funcsNumberPerPage: {
                param: 'Количество элементов в списке \nна странице “Функции”',
                fields: {
                    funcsNumberPerPage: {
                        param: 'Количество',
                    },
                },
            },
            tempUnit: {
                param: 'Единица измерения температуры',
            },
            lang: {
                param: 'Язык',
            },
            minutes: 'минут',
            errors: {
                login: {
                    minLength: 'Минимальная длина логина 6 символов',
                    maxLength: 'Максимальная длина логина 31 символ',
                    required: 'Логин обязателен при смене пароля',
                },
                password: {
                    mismatch: 'Пароль не совпадает',
                    required: 'Пароль обязателен при смене логина',
                    ok: 'Пароль совпадает',
                },
            },
            toast: {
                success: 'Сохранено',
                error: {
                    header: 'Ошибка',
                    text: 'Проверьте введённые значения',
                },
                reboot: {
                    rebootRequired: 'Требуется перезагрузка',
                    press: 'Нажмите',
                    here: 'сюда',
                    forReboot: 'для перезагрузки',
                },
            },
        },
    },
});

onMounted(async () => {
    await new Promise((resolve) => setTimeout(resolve, 150));
    try {
        let r = await api.get<ControllerSettings>('get_config');
        addrMode.value = r.data.lan['addr-mode'];
        cloudMode.value = r.data.cloud.mode;
        setFields(r.data);
    } catch (error) {
        //
    }
});
</script>
