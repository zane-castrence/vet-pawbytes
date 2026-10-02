/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        figtree: ["Figtree", "system-ui", "sans-serif"],
        caveat: ["Caveat", "cursive"],
      },
      colors: {
        sky: { 50: "#F0F9FF", 100: "#E0F2FE", 300: "#38BDF8", 500: "#0369A1", 600: "#075985" },
        emerald: { 100: "#D1FAE5", 500: "#047857", 600: "#059669" },
        ink: { 50: "#F9FAFB", 100: "#EEF1F3", 300: "#D8DEE3", 600: "#4B5563", 700: "#374151", 900: "#1F2937" },
      },
    },
  },
  plugins: [],
};

