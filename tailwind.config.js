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
          primary: '#0a0a0a',    // Main background
          secondary: '#1a1a1a',  // Cards/sections
          tertiary: '#2a2a2a',   // Hover states
          border: '#333333',     // Borders
          text: {
            primary: '#ffffff',   // Headings
            secondary: '#e5e5e5', // Body text
            muted: '#a3a3a3',    // Muted text
          }
        }
      }
    },
  },
  plugins: [],
}