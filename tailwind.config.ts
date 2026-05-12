import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        green: {
          DEFAULT: "#4a7c59",
          hover: "#3d6b4a",
          soft: "rgba(74, 124, 89, 0.08)",
        },
        charcoal: "#1a2332",
        bg: "#f5f5f5",
        grey: {
          100: "#ececec",
          200: "#d8d8d8",
          400: "#8a8f97",
          600: "#4a4f57",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "sans-serif",
        ],
      },
      borderRadius: {
        card: "14px",
        sm2: "10px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(26, 35, 50, 0.04), 0 4px 16px rgba(26, 35, 50, 0.06)",
        cardHover:
          "0 4px 8px rgba(26, 35, 50, 0.06), 0 12px 32px rgba(26, 35, 50, 0.10)",
        header: "0 1px 0 rgba(26, 35, 50, 0.06)",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
