import type { Config } from "tailwindcss";
import { Montserrat, Source_Sans_3 } from "next/font/google";

// Fonts are loaded in layout.tsx — this config only maps the CSS var names
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary
        "bridge-blue": "#0F172A",
        // Accent solids
        "bridge-yellow": "#FACC15",
        "bridge-orange": "#F97316",
        // Neutrals
        "page-bg": "#E2E8F0",
        "card-white": "#FFFFFF",
        "dark-text": "#111827",
        "muted-dark": "rgba(241,245,249,0.8)",
        // Semantic
        "status-success": "#16A34A",
        "status-warning": "#F59E0B",
        "status-error": "#DC2626",
      },
      fontFamily: {
        heading: ["var(--font-montserrat)", "sans-serif"],
        body: ["var(--font-source-sans)", "sans-serif"],
      },
      backgroundImage: {
        "bridge-gradient":
          "linear-gradient(to right, #FACC15, #F97316)",
        "bridge-gradient-diagonal":
          "linear-gradient(135deg, #FACC15, #F97316)",
      },
    },
  },
  plugins: [],
};

export default config;