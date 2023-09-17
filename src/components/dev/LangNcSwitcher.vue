<template>
  <div class="">
    <button
      @click="indexStore.setLang(lang === 'ru' ? 'en' : 'ru')"
      class="w-10 text-base text-center border-[#adebff] border rounded-sm uppercase"
    >
      {{ lang }}
    </button>
  </div>
</template>

<script setup lang="ts">
const indexStore = useIndexStore();

const { lang } = storeToRefs(indexStore);
</script>
