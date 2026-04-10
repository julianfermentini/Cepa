/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans:  ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        wine: {
          50:  '#fdf2f3',
          100: '#fce7e9',
          200: '#f9d0d4',
          300: '#f4aab0',
          400: '#ec7a84',
          500: '#e04e5b',
          600: '#cc2f3d',
          700: '#ac2330',
          800: '#8f202c',
          900: '#722f37',
          950: '#2d0a10',
        },
        gold: {
          200: '#f0d98a',
          300: '#e8c96a',
          400: '#d4af37',
          500: '#b8962e',
          600: '#9a7a22',
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
