/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif:   ['"Noto Serif"', 'Georgia', 'serif'],
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        grotesk: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary:   { DEFAULT: '#A4343A', dark: '#8a2a30', light: '#c0484f' },
        secondary: { DEFAULT: '#C9A64B', dark: '#a8882f', light: '#dfc06e' },
        tertiary:  { DEFAULT: '#3B1C22', dark: '#2a1018', light: '#4f2630' },
        neutral:   { DEFAULT: '#1C1C1E', light: '#2a2a2c', dark: '#111113' },
        wine: {
          50:  '#fdf2f3',
          100: '#fce7e9',
          200: '#f9d0d4',
          300: '#f4aab0',
          400: '#ec7a84',
          500: '#e04e5b',
          600: '#cc2f3d',
          700: '#A4343A',
          800: '#8a2a30',
          900: '#3B1C22',
          950: '#2a1018',
        },
      },
      backgroundImage: {
        'vineyard': "url('https://images.unsplash.com/photo-1504279577054-acfeccf8fc52?auto=format&fit=crop&w=1920&q=80')",
        'vineyard-2': "url('https://images.unsplash.com/photo-1474722883778-792e7990302f?auto=format&fit=crop&w=1920&q=80')",
      },
    },
  },
  plugins: [],
}
