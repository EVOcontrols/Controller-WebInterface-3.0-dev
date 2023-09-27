<template>
  <div class="flex flex-col px-8">
    <div class="mt-8 flex flex-col border-b border-[#0b3d68] pb-10 w-full">
      <h2 class="font-semibold text-xl leading-[1.2] whitespace-pre mb-[1.125rem]">
        {{ t('selectDevice') }}
      </h2>
      <div class="flex flex-row items-center overflow-hidden">
        <div class="relative overflow-x-hidden">
          <ScrollBooster
            :arrow-css="{ width: 'w-7', bg: 'bg-[#092740]' }"
            :render-params="{ type: 'row', marginRightClass: 'mr-1' }"
            v-slot="{ onClick }"
            class="h-8"
            @selectItem="emit('selectDevice', $event)"
          >
            <button
              v-for="i in deviceCount + 1"
              :key="i"
              type="button"
              class="h-[1.563rem] w-[3.188rem] bg-[#1b4569] hover:bg-[#214e76] on:bg-[#148ef8] font-roboto rounded flex items-center justify-center"
              :class="{
                on: i - 1 === activeDeviceIndex,
              }"
              @click="onClick(i - 1)"
            >
              {{ i > 1 ? `IO ${i - 1}` : 'NGC' }}
            </button>
          </ScrollBooster>
        </div>
        <button
          v-html="edit"
          class="group ml-3"
        ></button>
      </div>
    </div>
    <div
      v-if="activeDeviceIndex === 0"
      class="mt-8 flex flex-col border-b border-[#0b3d68] pb-10 w-full"
    >
      <h2 class="font-semibold text-xl leading-[1.2] whitespace-pre mb-[1.125rem]">
        {{ t('manageDevice') }}
      </h2>
      <div class="flex flex-row items-center">
        <div class="text-[#6d9cc5] text-sm leading-[1.143] mr-6">
          {{ reloadRequired ? t('reloadRequired') : t('reloadNoRequired') }}
        </div>
        <PrimaryButton class="!h-8">
          {{ t('reload') }}
        </PrimaryButton>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import ScrollBooster from '@/components/ScrollBooster.vue';
import edit from '@/assets/img/edit.svg?raw';
import PrimaryButton from '@/components/Ui/PrimaryButton.vue';

defineProps<{
  activeDeviceIndex: number;
  deviceCount: number;
  reloadRequired: boolean;
}>();

const emit = defineEmits<{
  (e: 'selectDevice', index: number): void;
}>();

const { t } = useI18n({
  messages: {
    en: {
      selectDevice: 'Select device',
      manageDevice: 'Manage device',
      reloadNoRequired: 'Reload not required',
      reloadRequired: 'Reload required',
      reload: 'Reload',
    },
    ru: {
      selectDevice: 'Выбор устройства',
      manageDevice: 'Управление устройством',
      reloadNoRequired: 'Перезагрузка не требуется',
      reloadRequired: 'Требуется перезагрузка',
      reload: 'Перезагрузка',
    },
  },
});
</script>
