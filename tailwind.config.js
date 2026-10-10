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
        sky: { 50: "#EEF2FF", 100: "#DCE5FF", 300: "#5AB4FF", 500: "#2A3BD9", 600: "#1F2DB0" },
        paw: {
          cobalt: "#2A3BD9",
          pink: "#F06AA6",
          rose: "#D6347F",
          lime: "#D9F25C",
          mint: "#3DAF8A",
          sky: "#5AB4FF",
          orange: "#F2733F",
          violet: "#5B21B6",
          card: "#E9EFFB",
        },
        emerald: { 100: "#D1FAE5", 500: "#047857", 600: "#059669" },
        ink: { 50: "#F9FAFB", 100: "#EEF1F3", 300: "#D8DEE3", 600: "#4B5563", 700: "#374151", 900: "#1F2937" },
      },
    },
  },
  plugins: [],
};

