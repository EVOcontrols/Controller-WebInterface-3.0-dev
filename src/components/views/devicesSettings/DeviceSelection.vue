<template>
  <div class="mt-8 mx-8 flex flex-col border-b border-[#0b3d68] last:border-none pb-10">
    <h2 class="font-semibold text-xl leading-[1.2] whitespace-pre mb-5">
      {{ t('selectDevice') }}
    </h2>
    <ScrollBooster
      :arrow-css="{ width: 'w-4', bg: 'bg-[#092740]' }"
      :render-params="{ type: 'row', marginRightClass: 'mr-1' }"
      v-slot="{ onClick }"
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
</template>

<script lang="ts" setup>
import ScrollBooster from '@/components/ScrollBooster.vue';

defineProps<{
  activeDeviceIndex: number;
  deviceCount: number;
}>();

const emit = defineEmits<{
  (e: 'selectDevice', index: number): void;
}>();

const { t } = useI18n({
  messages: {
    en: {
      selectDevice: 'Select device',
    },
    ru: {
      selectDevice: 'Выбор устройства',
    },
  },
});
</script>
