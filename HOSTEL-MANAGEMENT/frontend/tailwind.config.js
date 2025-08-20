/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#2563eb',
          dark: '#1e40af',
        },
        booked: '#ef4444',
        available: '#22c55e',
        pending: '#f59e0b',
        accent: '#06b6d4',
        indigoSoft: '#c7d2fe',
      },
      boxShadow: {
        glow: '0 10px 30px -12px rgba(37,99,235,0.45)'
      },
      keyframes: {
        fadeUp: { '0%': { opacity: 0, transform: 'translateY(16px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        pulseSoft: { '0%,100%': { opacity: 1 }, '50%': { opacity: .7 } }
      },
      animation: {
        fadeUp: 'fadeUp .6s ease both',
        pulseSoft: 'pulseSoft 2.5s ease-in-out infinite'
      }
    },
  },
  plugins: [],
}


