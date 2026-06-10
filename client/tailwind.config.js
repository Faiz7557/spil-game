/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'spil-red': '#D21E20',
        'spil-red-hover': '#B5181A',
        'spil-red-light': '#FEE2E2',
        'spil-green': '#2E7D4E',
        'spil-green-hover': '#225D3A',
        'spil-green-light': '#DCFCE7',
        'spil-dark': '#1E293B',
        'spil-charcoal': '#0F172A',
        'spil-grey': '#F8F9FA'
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
