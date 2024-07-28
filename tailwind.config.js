/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'cc-dark-purple':'#1F2544',
        'cc-purple':'#474F7A',
        'cc-light-purple':'#81689D',
      }
    },
  },
  plugins: [],
}

