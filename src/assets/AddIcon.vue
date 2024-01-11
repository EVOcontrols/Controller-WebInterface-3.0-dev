<template>
    <!-- eslint-disable max-len -->
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
    >
        <rect
            x="2.66406"
            y="7.33594"
            width="10.6667"
            height="1.33333"
            rx="0.666667"
            fill="#148EF8"
        />
        <rect
            x="8.66406"
            y="2.66406"
            width="10.6667"
            height="1.33333"
            rx="0.666667"
            transform="rotate(90 8.66406 2.66406)"
            fill="#148EF8"
        />
    </svg>
</template>

<script setup></script>

<style lang="postcss" scoped>
rect {
    transition: all 0.3s;
}

svg.disabled rect {
    fill: #3e688e;
}

svg:active rect {
    fill: #adebff;
}
</style>
