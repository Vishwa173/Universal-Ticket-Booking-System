/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        bebas: ['"Bebas Neue"', 'sans-serif'],
      },
      colors: {
        'dark-blue': '#0a2540',
        'bms-orange': '#f97316',
      },
      backgroundImage: {
      'fade-purple': 'linear-gradient(to bottom, #ede9ff 0%, #f4f0ff 20%, #ffffff 45%)',
    },
    },
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
  ],
}
