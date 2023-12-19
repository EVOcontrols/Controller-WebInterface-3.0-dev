<template>
    <!-- eslint-disable max-len -->
    <svg
        v-if="props.isHovered"
        :class="{ active: isActive }"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="25"
        viewBox="0 0 24 25"
        fill="none"
    >
        <rect
            y="1"
            width="24"
            height="24"
            rx="5"
            fill="#095170"
            fill-opacity="0.28"
        />
        <g filter="url(#filter0_d_82_24894)">
            <path
                d="M7.62302 6.3041C8.08509 6.00158 8.7049 6.13092 9.00742 6.59299C9.30993 7.05505 9.18059 7.67487 8.71852 7.97738C7.03469 9.07979 6 10.9518 6 13.0015C6 16.3152 8.68629 19.0015 12 19.0015C15.3137 19.0015 18 16.3152 18 13.0015C18 10.997 17.0108 9.16117 15.3876 8.04846C14.932 7.7362 14.8159 7.11378 15.1281 6.65825C15.4404 6.20271 16.0628 6.08656 16.5184 6.39882C18.68 7.88059 20 10.3303 20 13.0015C20 17.4198 16.4183 21.0015 12 21.0015C7.58172 21.0015 4 17.4198 4 13.0015C4 10.27 5.38057 7.77223 7.62302 6.3041Z"
                fill="#2A5D73"
            />
        </g>
        <g
            opacity="0.3"
            filter="url(#filter1_d_82_24894)"
        >
            <rect
                x="11"
                y="4"
                width="2"
                height="10"
                rx="1"
                fill="#2A5D73"
            />
        </g>
        <defs>
            <filter
                id="filter0_d_82_24894"
                x="0"
                y="2.14062"
                width="24"
                height="22.8608"
                filterUnits="userSpaceOnUse"
                color-interpolation-filters="sRGB"
            >
                <feFlood
                    flood-opacity="0"
                    result="BackgroundImageFix"
                />
                <feColorMatrix
                    in="SourceAlpha"
                    type="matrix"
                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                    result="hardAlpha"
                />
                <feOffset />
                <feGaussianBlur stdDeviation="2" />
                <feColorMatrix
                    type="matrix"
                    values="0 0 0 0 0.130625 0 0 0 0 0.33725 0 0 0 0 0.475 0 0 0 1 0"
                />
                <feBlend
                    mode="normal"
                    in2="BackgroundImageFix"
                    result="effect1_dropShadow_82_24894"
                />
                <feBlend
                    mode="normal"
                    in="SourceGraphic"
                    in2="effect1_dropShadow_82_24894"
                    result="shape"
                />
            </filter>
            <filter
                id="filter1_d_82_24894"
                x="7"
                y="0"
                width="10"
                height="18"
                filterUnits="userSpaceOnUse"
                color-interpolation-filters="sRGB"
            >
                <feFlood
                    flood-opacity="0"
                    result="BackgroundImageFix"
                />
                <feColorMatrix
                    in="SourceAlpha"
                    type="matrix"
                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                    result="hardAlpha"
                />
                <feOffset />
                <feGaussianBlur stdDeviation="2" />
                <feColorMatrix
                    type="matrix"
                    values="0 0 0 0 0.130625 0 0 0 0 0.33725 0 0 0 0 0.475 0 0 0 1 0"
                />
                <feBlend
                    mode="normal"
                    in2="BackgroundImageFix"
                    result="effect1_dropShadow_82_24894"
                />
                <feBlend
                    mode="normal"
                    in="SourceGraphic"
                    in2="effect1_dropShadow_82_24894"
                    result="shape"
                />
            </filter>
        </defs>
    </svg>
    <svg
        v-else
        :class="{ active: isActive }"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
    >
        <rect
            width="24"
            height="24"
            rx="5"
            fill="#095170"
            fill-opacity="0.28"
        />
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

<script lang="ts" setup>
const props = defineProps<{
    isHovered: boolean;
    isActive: boolean;
}>();
</script>

<style lang="postcss" scoped>
rect {
    transition: all 0.3s;
}

svg.active path,
svg.active rect,
svg.active rect g path,
svg.active rect g rect {
    fill: #00d6af;
}
</style>
