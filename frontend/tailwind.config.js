/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        dts: {
          50: "#000000",
          100: "#dbeafe",
          500: "#2563eb",
          600: "#1d4ed8",
          700: "#1945d6",
          900: "#172554"
        }
      }
    }
  },
  plugins: []
};