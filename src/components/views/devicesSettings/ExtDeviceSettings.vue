<template>
  <div>
    <ManageDevice
      :reboot-required="false"
      :device-addr="deviceAddr"
      :device-state="deviceState"
    />
  </div>
</template>

<script lang="ts" setup>
import type { DeviceWorkState } from '@/typings/settings';
import ManageDevice from './elements/ManageDevice.vue';
import type { DeviceAddr } from '@/typings/common';

const props = defineProps<{
  deviceAddr: Exclude<DeviceAddr, 0>;
  deviceState: DeviceWorkState;
}>();
</script>
