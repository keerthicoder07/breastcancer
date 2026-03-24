/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: { outfit: ['Outfit', 'sans-serif'] },
      colors: {
        teal: { 400: '#2dd4bf', 500: '#14b8a6' },
        lime: { 300: '#d9f99d' },
      },
      backgroundImage: {
        'grid-pattern': `linear-gradient(rgba(45,212,191,0.03) 1px, transparent 1px),
                         linear-gradient(90deg, rgba(45,212,191,0.03) 1px, transparent 1px)`,
      },
      backgroundSize: { grid: '48px 48px' },
    },
  },
  plugins: [],
}
