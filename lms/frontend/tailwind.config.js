/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          500: '#4f6ef7',
          600: '#3b5beb',
          700: '#2d47d4',
        },
        surface: '#f8f9fc',
      },
    },
  },
  plugins: [],
}
