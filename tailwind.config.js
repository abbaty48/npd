/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*/*.{js,jsx,ts,tsx}",
    "./src/ui/components/*.tsx",
    "./src/ui/components/*/*.tsx",
    "./src/ui/pages/*.tsx",
  ],
  theme: {
    extend: {
      fontFamily: {
        'saira': 'sairaregular',
      },
    },
  },
  plugins: [],
}
