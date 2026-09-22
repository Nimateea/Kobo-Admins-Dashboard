/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'sans-serif'] },
      colors: {
        app: {
          main: '#000000',
          sidebar: '#000000',
          card: '#000000',
          hover: '#171717',
          border: '#262626',
          text: '#f4f4f5',
          muted: '#a1a1aa',
          accent: '#6366f1',
        },
      },
    },
  },
  plugins: [],
}
