import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        canvas: "#f4f6f9",
        slate: {
          body: "#334155",
        },
        brand: {
          DEFAULT: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
        },
        // soft, low-saturation category accents
        chip: {
          blue: "#e8f0fe",
          blueText: "#1e40af",
          purple: "#f1ecfb",
          purpleText: "#6d28d9",
          teal: "#e6f7f3",
          tealText: "#0f766e",
          pink: "#fdecef",
          pinkText: "#be185d",
        },
        favor: {
          DEFAULT: "#10b981",
          soft: "#d1fae5",
        },
        risk: {
          info: "#dbeafe",
          infoText: "#1e40af",
          warn: "#fef3c7",
          warnText: "#92400e",
          danger: "#fee2e2",
          dangerText: "#b91c1c",
        },
      },
      borderRadius: {
        card: "16px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(15, 23, 42, 0.04), 0 8px 24px rgba(15, 23, 42, 0.06)",
        soft: "0 1px 2px rgba(15, 23, 42, 0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
