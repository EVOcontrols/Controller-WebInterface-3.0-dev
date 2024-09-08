<template>
    <!-- eslint-disable max-len -->
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
    >
        <path
            d="M7.62302 5.3041C8.08509 5.00158 8.7049 5.13092 9.00742 5.59299C9.30993 6.05505 9.18059 6.67487 8.71852 6.97738C7.03469 8.07979 6 9.95178 6 12.0015C6 15.3152 8.68629 18.0015 12 18.0015C15.3137 18.0015 18 15.3152 18 12.0015C18 9.99697 17.0108 8.16117 15.3876 7.04846C14.932 6.7362 14.8159 6.11378 15.1281 5.65825C15.4404 5.20271 16.0628 5.08656 16.5184 5.39882C18.68 6.88059 20 9.33034 20 12.0015C20 16.4198 16.4183 20.0015 12 20.0015C7.58172 20.0015 4 16.4198 4 12.0015C4 9.27 5.38057 6.77223 7.62302 5.3041Z"
            fill="#2A5D73"
        />
        <rect
            opacity="0.3"
            x="11"
            y="3"
            width="2"
            height="10"
            rx="1"
            fill="#2A5D73"
        />
    </svg>
</template>

<script setup lang="ts"></script>

<style lang="postcss" scoped>
svg path,
svg rect {
    transition: all 0.3s;
}

svg.active path,
svg.active rect {
    fill: #00d6af;
}
</style>
