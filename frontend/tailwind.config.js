/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-down': {
          '0%': {
            opacity: '0',
            transform: 'translateY(-20px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'bounce-in': {
          '0%, 20%, 40%, 60%, 80%, 100%': {
            transform: 'translateY(0)',
          },
          '10%': {
            transform: 'translateY(-3px)',
          },
          '30%': {
            transform: 'translateY(-2px)',
          },
          '50%': {
            transform: 'translateY(-1px)',
          },
          '70%': {
            transform: 'translateY(-0.5px)',
          },
          '90%': {
            transform: 'translateY(-0.25px)',
          },
        },
      },
      animation: {
        'fade-in': 'fade-in 1s ease-out forwards',
        'fade-in-down': 'fade-in-down 0.7s ease-out forwards',
        'bounce-in': 'bounce-in 0.5s ease-out forwards',
      },
    },
  },
  plugins: [],
  variants: {
    extend: {
      boxShadow: ['hover'],
      scale: ['hover'],
    },
  },
};