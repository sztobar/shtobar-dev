const colors = require('tailwindcss/colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'dark-bg': colors.stone['900'],
        'dark-text': colors.stone['100'],
      },
    },
  },
  plugins: [],
};
