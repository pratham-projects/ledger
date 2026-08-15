import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        panel: "var(--panel)",
        "panel-2": "var(--panel-2)",
        raised: "var(--raised)",
        border: {
          DEFAULT: "var(--border)",
          2: "var(--border-2)",
        },
        ink: {
          DEFAULT: "var(--text)",
          muted: "var(--muted)",
          "muted-2": "var(--muted-2)",
        },
        accent: "var(--accent)",
        "on-accent": "var(--on-accent)",
        hot: "var(--hot)",
        cool: "var(--cool)",
        blue: "var(--blue)",
        green: "var(--green)",
        amber: "var(--amber)",
        red: "var(--red)",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
      borderRadius: {
        DEFAULT: "var(--radius)",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
