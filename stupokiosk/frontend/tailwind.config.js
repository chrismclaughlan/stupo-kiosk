
// https://maketintsandshades.com/

module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      spacing: {
        '100': '30rem',
        '125': '40rem',
        '150': '50rem',
        '175': '60rem',
        '200': '70rem',
      },
      colors: {
        'theme-1': {
          50: '#f0f7f7',
          100: '#d2e7e6',
          200: '#b4d8d5',
          300: '#95c8c4',
          400: '#77b8b3',
          500: '#68b0ab',  // base
          600: '#5e9e9a',
          700: '#538d89',
          800: '#497b78',
          900: '#3e6a67',
        },

        'theme-2': {
          50: '#f4f9f6',
          100: '#ddece5',
          200: '#c7e0d4',
          300: '#b1d3c3',
          400: '#9ac6b2',
          500: '#8fc0a9',  // base
          600: '#81ad98',
          700: '#729a87',
          800: '#648676',
          900: '#567365',
        },
        
        'theme-3': {
          50: '#fafbf8',
          100: '#eff2ea',
          200: '#e4eadc',
          300: '#d9e2ce',
          400: '#ced9c0',
          500: '#c8d5b9',  // base
          600: '#b4c0a7',
          700: '#a0aa94',
          800: '#8c9582',
          900: '#78806f',
        },

        'theme-4': {
          50: '#fffefc',
          100: '#fefbf5',
          200: '#fdf9ee',
          300: '#fcf7e7',
          400: '#fbf4e0',
          500: '#faf3dd',  // base
          600: '#e1dbc7',
          700: '#c8c2b1',
          800: '#afaa9b',
          900: '#969285',
        },
      }
    },
  },
  variants: {
    extend: {
      backgroundColor: ['active'],
      translate: ['group-hover'],
    },
  },
  plugins: []
}
