/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          primary: '#0a0a0a',
          secondary: '#1a1a1a',
          tertiary: '#2a2a2a',
          border: '#333333',
          text: {
            primary: '#ffffff',
            secondary: '#e5e5e5',
            muted: '#a3a3a3',
          }
        }
      },
      keyframes: {
        'pulse-slow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        'bounce-slow': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'glow': {
          '0%, 100%': { textShadow: '0 0 6px #00ffff, 0 0 12px #00ffff' },
          '50%': { textShadow: '0 0 12px #00ffff, 0 0 18px #00ffff' },
        }
      },
      animation: {
        'pulse-slow': 'pulse-slow 3s ease-in-out infinite',
        'bounce-slow': 'bounce-slow 2s infinite',
        'glow': 'glow 2s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}