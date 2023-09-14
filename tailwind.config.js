/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}', './src/assets/img/tailwind/*.svg'],
  theme: {
    extend: {
      fontFamily: {
        gilroy: ['Gilroy'],
        roboto: ['Roboto'],
      },
    },
  },
  plugins: [],
};
