/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff5f7',
          100: '#ffe4e8',
          200: '#fecdd6',
          300: '#fda4b4',
          400: '#fb718d',
          500: '#f43f68',
          600: '#e11d54',
          700: '#be1245',
          800: '#9f123d',
          900: '#881337',
          pink: '#fdf2f4',
          blush: '#fff8f9',
          surface: '#ffffff',
          charcoal: '#1e1b22',
        },
      },
    },
  },
  plugins: [],
};
