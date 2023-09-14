<template>
  <div class="h-full w-full bg-[linear-gradient(108.08deg,#143554_-1.91%,#0a1b2b_98.91%)]">
    {{ t('hello') }}
  </div>
</template>

<script lang="ts" setup>
const { t } = useI18n({
  messages: {
    en: {
      hello: 'hello',
    },
    ru: {
      hello: 'привет',
    },
  },
});
</script>
