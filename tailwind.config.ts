import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: "var(--card)",
        "card-hover": "var(--card-hover)",
        border: "var(--border)",
        primary: "var(--primary)",
        "primary-hover": "var(--primary-hover)",
        secondary: "var(--secondary)",
        accent: "var(--accent)",
        danger: "var(--danger)",
        muted: "var(--muted)",
        team1: "var(--team1)",
        team2: "var(--team2)",
        court: "var(--court)",
        "court-line": "var(--court-line)",
      },
    },
  },
  plugins: [],
};

export default config;
