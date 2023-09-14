/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,css,postcss}', './src/assets/img/tailwind/*.svg'],
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
