<template>
    <!-- eslint-disable max-len -->
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
    >
        <rect
            x="4.69629"
            y="14.123"
            width="13.3333"
            height="1.66667"
            rx="0.833333"
            transform="rotate(-45 4.69629 14.123)"
            fill="#194F76"
        />
        <rect
            x="5.87695"
            y="4.69629"
            width="13.3333"
            height="1.66667"
            rx="0.833333"
            transform="rotate(45 5.87695 4.69629)"
            fill="#194F76"
        />
    </svg>
</template>

<script setup></script>

<style lang="postcss" scoped>
rect {
    transition: all 0.3s;
}

svg:hover rect {
    fill: #58b1ff;
}

svg:active rect {
    fill: #148ef8;
}
</style>
