<template>
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="4.69531"
      y="14.125"
      width="13.3333"
      height="1.66667"
      rx="0.833333"
      transform="rotate(-45 4.69531 14.125)"
    />
    <rect
      x="5.875"
      y="4.69531"
      width="13.3333"
      height="1.66667"
      rx="0.833333"
      transform="rotate(45 5.875 4.69531)"
    />
  </svg>
</template>

<style lang="postcss" scoped>
svg rect {
  @apply fill-current transition-colors duration-300;
}
.success-toast svg {
  & rect {
    @apply text-[#74FFDE];
  }
  &:hover rect {
    @apply text-[#B9FFDD];
  }
  &:active rect {
    @apply text-[#37C4A2];
  }
}
.error-toast svg {
  & rect {
    @apply text-[#FF7A9F];
  }
  &:hover rect {
    @apply text-[#FEC2D3];
  }
  &:active rect {
    @apply text-[#FF4D7E];
  }
}
.warning-toast svg {
  & rect {
    @apply text-[#77C3FF];
  }
  &:hover rect {
    @apply text-[#A0D5FF];
  }
  &:active rect {
    @apply text-[#2D72FA];
  }
}
</style>
