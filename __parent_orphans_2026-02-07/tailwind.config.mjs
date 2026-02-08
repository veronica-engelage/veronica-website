/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        /* brand palette (raw) */
        /* brand */
ink: "#0b1211",
teal: "#0f2f2b",
linen: "#f6f3ed",
ivory: "#f4f2ed",
charcoal: "#1f2326",
brass: "#b08a4b",
orange: "#f4a340",
focus: "#b08a4b",
error: "#b4533c",


        /* semantic tokens (CSS variables) */
        bg: "rgb(var(--bg) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        text: "rgb(var(--text) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        border: "rgb(var(--border) / <alpha-value>)",
        brand: "rgb(var(--brand) / <alpha-value>)",
        brandContrast: "rgb(var(--brand-contrast) / <alpha-value>)",
        prestige: "rgb(var(--prestige) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["var(--font-raleway)", "system-ui", "sans-serif"],
        serif: ["var(--font-lora)", "serif"],
      },
    },
  },
  plugins: [],
}

