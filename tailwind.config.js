/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        chess: {
          board: '#b58863',
          light: '#f0d9b5',
          dark: '#b58863',
          highlight: 'rgba(255, 255, 0, 0.4)'
        }
      }
    },
  },
  plugins: [],
}