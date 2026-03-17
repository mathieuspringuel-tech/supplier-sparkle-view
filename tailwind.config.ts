import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        "table-header": "hsl(var(--table-header-bg))",
        "table-hover": "hsl(var(--table-hover))",
        "confidence-high": {
          bg: "hsl(var(--confidence-high-bg))",
          text: "hsl(var(--confidence-high-text))",
          border: "hsl(var(--confidence-high-border))",
        },
        "confidence-low": {
          bg: "hsl(var(--confidence-low-bg))",
          text: "hsl(var(--confidence-low-text))",
          border: "hsl(var(--confidence-low-border))",
        },
        "target-sbti-validated": {
          bg: "hsl(var(--target-sbti-validated-bg))",
          text: "hsl(var(--target-sbti-validated-text))",
          border: "hsl(var(--target-sbti-validated-border))",
        },
        "target-sbti-committed": {
          bg: "hsl(var(--target-sbti-committed-bg))",
          text: "hsl(var(--target-sbti-committed-text))",
          border: "hsl(var(--target-sbti-committed-border))",
        },
        "target-non-sbti": {
          bg: "hsl(var(--target-non-sbti-bg))",
          text: "hsl(var(--target-non-sbti-text))",
          border: "hsl(var(--target-non-sbti-border))",
        },
        "target-no-targets": {
          bg: "hsl(var(--target-no-targets-bg))",
          text: "hsl(var(--target-no-targets-text))",
          border: "hsl(var(--target-no-targets-border))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
