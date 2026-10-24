/** @type {import('tailwindcss').Config} */

// Colors resolve to CSS custom properties (RGB channels, see globals.css) so a
// single token set drives both light and dark mode and Tailwind's opacity
// modifiers (`bg-ink/5`) keep working.
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        page: token("page"),
        surface: token("surface"),
        "surface-muted": token("surface-muted"),
        line: token("line"),
        "line-strong": token("line-strong"),
        ink: token("ink"),
        "ink-secondary": token("ink-secondary"),
        "ink-muted": token("ink-muted"),
        accent: token("accent"),
        "accent-hover": token("accent-hover"),
        "accent-ink": token("accent-ink"),
        "accent-soft": token("accent-soft"),
        success: token("success"),
        "success-soft": token("success-soft"),
        danger: token("danger"),
        "danger-soft": token("danger-soft"),
      },
      fontFamily: {
        sans: [
          '"Plus Jakarta Sans Variable"',
          "system-ui",
          "-apple-system",
          '"Segoe UI"',
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 2px rgb(0 0 0 / 0.04), 0 6px 20px rgb(0 0 0 / 0.05)",
        pill: "0 3px 12px rgb(0 0 0 / 0.08), 0 1px 2px rgb(0 0 0 / 0.04)",
        "pill-hover": "0 6px 20px rgb(0 0 0 / 0.12)",
        overlay: "0 12px 40px rgb(0 0 0 / 0.18)",
      },
      keyframes: {
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 200ms ease-out both",
      },
    },
  },
  plugins: [],
};
