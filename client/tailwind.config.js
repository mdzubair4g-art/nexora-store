/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0f172a',
          navy: '#1e1b4b',
          cyan: '#06b6d4',
          orange: '#f97316'
        }
      }
    },
  },
  plugins: [],
}
