import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#0a0e1a",
          panel: "#0f1522",
          card: "#131a29",
          border: "#1f2937",
        },
        status: {
          critique: "#ef4444",
          alerte: "#f97316",
          vigilance: "#eab308",
          normal: "#3b82f6",
          faible: "#22c55e",
        },
      },
      fontFamily: {
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
