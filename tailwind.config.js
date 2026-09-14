/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#FDFCF7',
          100: '#FAF5E8',
          200: '#F4E7C4',
          300: '#ECD59B',
          400: '#E4C16E',
          500: '#D4AF37', // Brand Barber Gold
          600: '#B89328',
          700: '#8C6C16',
          800: '#5F480A',
          900: '#382A04',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
