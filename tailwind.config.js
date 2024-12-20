/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#47DD4C",
        primaryHover: "#35CB3A",
        grayMd: "#737373",
        graySm: "#d9d9d9",
      },
    },
  },
  plugins: [],
};
