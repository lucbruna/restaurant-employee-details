import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", "[data-theme=\"dark\"]"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--primary)",
          dark: "var(--primary-dark)",
          light: "var(--primary-light)",
        },
        secondary: "var(--secondary)",
        accent: "var(--accent)",
        background: "var(--background)",
        surface: "var(--surface)",
        border: "var(--border)",
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
        },
        success: "var(--success)",
        warning: "var(--warning)",
        error: "var(--error)",
        info: "var(--info)",
      },
      borderRadius: {
        sm: "var(--radius-compact)",
        md: "var(--radius-medium)",
        lg: "var(--radius-large)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-xxl)",
      },
      boxShadow: {
        sm: "var(--shadow-elevation-1)",
        md: "var(--shadow-elevation-2)",
        lg: "var(--shadow-elevation-3)",
        focus: "var(--shadow-focus)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
export default config;
