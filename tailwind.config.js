/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#050d1a',
          800: '#0a1628',
          700: '#0f2040',
          600: '#162b54',
          500: '#1e3a6e',
        },
        accent: {
          blue: '#3b82f6',
          cyan: '#06b6d4',
          green: '#10b981',
          red: '#ef4444',
          yellow: '#f59e0b',
          purple: '#8b5cf6',
        }
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
