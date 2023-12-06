<template>
    <!-- eslint-disable max-len -->
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="15"
        height="15"
        viewBox="0 0 15 15"
        fill="none"
    >
        <path
            d="M5.18305 4.19145C4.93898 3.94738 4.93898 3.55165 5.18305 3.30757C5.42713 3.06349 5.82286 3.06349 6.06694 3.30757L9.81694 7.05757C10.0536 7.29418 10.0618 7.67517 9.83572 7.92184L6.39822 11.6718C6.16497 11.9263 5.76962 11.9435 5.51517 11.7102C5.26072 11.477 5.24353 11.0816 5.47678 10.8272L8.50991 7.51831L5.18305 4.19145Z"
            fill="#4888A3"
        />
    </svg>
</template>

<script setup></script>

<style lang="postcss" scoped>
path {
    transition: all 0.3s;
}

svg:hover path {
    fill: #58b1ff;
}

svg.disabled path {
    fill: #27425c;
}
</style>
