/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        calm: {
          white: '#F9FAFB',
          sky: {
            50: '#F0F7FF',
            100: '#E3F0FE',
            200: '#BFDBFE',
            300: '#93C5FD',
            800: '#1E3A8A',
          },
          lavender: {
            50: '#FAF8FF',
            100: '#EDE9FE',
            200: '#DDD6FE',
          },
          mint: {
            50: '#ECFDF5',
            100: '#D1FAE5',
            200: '#A7F3D0',
            300: '#6EE7B7',
            800: '#065F46',
          },
        },
      },
      fontFamily: {
        sans: ['Nunito', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 12px 32px -14px rgba(30, 58, 138, 0.22)',
        'soft-sm': '0 6px 18px -10px rgba(30, 58, 138, 0.2)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'pop-in': {
          '0%': { opacity: '0', transform: 'scale(0.92)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        sway: {
          '0%, 100%': { transform: 'rotate(-5deg)' },
          '50%': { transform: 'rotate(5deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out both',
        'fade-in-up': 'fade-in-up 0.5s ease-out both',
        'pop-in': 'pop-in 0.35s ease-out both',
        sway: 'sway 4s ease-in-out infinite',
        float: 'float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
