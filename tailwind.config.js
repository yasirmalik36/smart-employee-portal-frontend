/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{html,js,ts,jsx,tsx}', // Scans your HTML, JS, TS, and React files for Tailwind classes
  ],
  theme: {
    extend: {
      colors: {
        primary: "#ffc107",
        secondary: "#ff9800",
        grayBg: "#f9fafb",
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),       // Adds better styling for forms
    require('@tailwindcss/typography'), // Adds typography utilities
    require('@tailwindcss/aspect-ratio')// Adds aspect ratio utilities
  ],
};
