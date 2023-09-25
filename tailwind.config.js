/** @type {import('tailwindcss').Config} */
const plugin = require('tailwindcss/plugin');

export default {
  content: ['./index.html', './src/**/*.{vue,css,postcss}', './src/assets/img/**/*.svg'],
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
    plugin(({ addVariant, matchUtilities }) => {
      addVariant('selected', '&.selected');
      addVariant('error', '&.error');
      addVariant('on', '&.on');
      addVariant('off', '&.off');
      matchUtilities(
        {
          scrollbar: (value) => {
            return {
              'scrollbar-width': 'thin',
              'scrollbar-color': '#316694 transparent',
              '&::-webkit-scrollbar': {
                width: `${value}px`,
                background: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                'background-color': '#316694',
                display: 'inline-block',
                'border-top-left-radius': ' 0.375rem',
                'border-bottom-left-radius': '0.375rem',
              },
            };
          },
        },
        { values: { 2: '2', 3: '3', 4: '4' } },
      );
    }),
  ],
};
