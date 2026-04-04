/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // Make sure this is still here for class-based dark mode
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // ETO NA YUNG MGA NEW FONTS NATIN
        sans: ['Inter', 'sans-serif'], // Default sans-serif font
        serif: ['Playfair Display', 'serif'], // Elegant serif font for brand name
      }
    },
  },
  plugins: [],
}