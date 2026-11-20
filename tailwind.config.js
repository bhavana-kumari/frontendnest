/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1C1915",
        muted: "#5F584E",
        paper: "#F4F0E8",
        card: "#FBF8F3",
        line: "#E4DCD0",
        forest: {
          50: "#F1F6F2",
          100: "#DCE8DF",
          700: "#1E5C3A",
          800: "#174A2F",
          900: "#123824",
        },
      },
      fontFamily: {
        sans: ["Outfit", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["Fraunces", "ui-serif", "Georgia", "serif"],
      },
      boxShadow: {
        card: "0 16px 40px rgba(28, 25, 21, 0.06)",
        soft: "0 8px 24px rgba(28, 25, 21, 0.05)",
      },
    },
  },
  plugins: [],
};
