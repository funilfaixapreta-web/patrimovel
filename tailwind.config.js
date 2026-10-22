/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Vermelho do logo (#CB2306) e neutros com leve puxada para o vermelho.
        brand: {
          50: "#fdf1ee",
          100: "#fbe1db",
          200: "#f6bfb2",
          500: "#e0401f",
          600: "#cb2306",
          700: "#a81c04",
          800: "#861806",
        },
        ink: {
          DEFAULT: "#1b1514",
          soft: "#3a3230",
          muted: "#6e6461",
        },
        sand: {
          50: "#faf8f7",
          100: "#f4f1ef",
          200: "#e9e4e1",
          300: "#d9d1cd",
        },
        mar: "#0f3b57",
      },
      fontFamily: {
        sans: ['"Onest Variable"', "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
      maxWidth: {
        site: "1240px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(27,21,20,.06), 0 8px 24px -12px rgba(27,21,20,.18)",
        float: "0 12px 40px -12px rgba(27,21,20,.35)",
      },
    },
  },
  plugins: [],
};
