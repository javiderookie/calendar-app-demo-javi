/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'c-red':    '#E53935',
        'c-dark':   '#0a0a0a',
        'c-card':   '#141414',
        'c-border': '#242424',
      },
    },
  },
  plugins: [],
}
