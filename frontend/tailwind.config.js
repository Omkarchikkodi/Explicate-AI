/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Playfair Display'", "Georgia", "serif"],
        body: ["'DM Sans'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        ink: {
          50: "#f5f4f0",
          100: "#e8e5dc",
          200: "#cec9b8",
          300: "#b0a98e",
          400: "#948d70",
          500: "#7d7559",
          600: "#655f47",
          700: "#504b38",
          800: "#3c3829",
          900: "#1e1d15",
          950: "#0f0e0a",
        },
        accent: {
          DEFAULT: "#c8693a",
          light: "#e8855a",
          dark: "#a84f24",
        },
        surface: {
          DEFAULT: "#f9f7f2",
          dark: "#1a1914",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease forwards",
        "slide-up": "slideUp 0.5s cubic-bezier(0.16,1,0.3,1) forwards",
        "pulse-slow": "pulse 3s ease-in-out infinite",
        typing: "typing 1.2s steps(3) infinite",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        typing: {
          "0%, 100%": { content: "''" },
          "33%": { content: "'.'" },
          "66%": { content: "'..'" },
        },
      },
    },
  },
  plugins: [],
};
