/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        asphalt: {
          DEFAULT: '#0F1113',
          100: '#1A1D21',
          200: '#2B2F33',
        },
        panel: '#1D2023',
        line: '#2B2F33',
        paper: '#F3F1EA',
        amber: {
          DEFAULT: '#FF6A13',
          dim: '#B94F0F',
        },
        green: '#3CC17A',
        red: '#E8493B',
        steel: '#8A9199',
        'steel-light': '#C7CCD1',
      },
      fontFamily: {
        display: ['Rajdhani', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}