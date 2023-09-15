/** @type {import('tailwindcss').Config} */
const plugin = require('tailwindcss/plugin');

export default {
  content: ['./index.html', './src/**/*.{vue,css,postcss}', './src/assets/img/*.svg'],
  theme: {
    extend: {
      fontFamily: {
        gilroy: ['Gilroy'],
        roboto: ['Roboto'],
      },
      transitionDuration: {
        DEFAULT: '300ms',
      },
      transitionTimingFunction: {
        DEFAULT: 'ease',
      },
    },
  },
  plugins: [
    plugin(({ addVariant }) => {
      addVariant('selected', '&.selected');
      addVariant('error', '&.error');
      addVariant('on', '&.on');
      addVariant('off', '&.off');
    }),
  ],
};
