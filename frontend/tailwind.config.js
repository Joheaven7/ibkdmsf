/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#E8F5F2',
          100: '#C5E8E0',
          200: '#8FD4C4',
          300: '#59BFA8',
          400: '#2DA88C',
          500: '#1FA97A',
          600: '#178A66',
          700: '#126B50',
          800: '#0F5B4F',
          900: '#0A3D35',
          950: '#062820',
        },
        emerald: {
          DEFAULT: '#1FA97A',
          50:  '#ECFDF5',
          100: '#D1FAE5',
          500: '#1FA97A',
          600: '#178A66',
          700: '#126B50',
        },
        accent: {
          gold:       '#D4A017',
          'gold-light': '#F5E6B8',
          'gold-dark':  '#A67C00',
        },
        surface: {
          DEFAULT: '#F5F7F8',
          dark:    '#0F1419',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        display: ['Sora', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(15 91 79 / 0.06), 0 1px 2px -1px rgb(15 91 79 / 0.06)',
        'card-hover': '0 10px 25px -5px rgb(15 91 79 / 0.12), 0 4px 10px -4px rgb(15 91 79 / 0.08)',
      },
      transitionDuration: { DEFAULT: '200ms' },
    },
  },
  plugins: [],
}
