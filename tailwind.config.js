/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      animation: {
        "fade-in": "fade-in-frame 0.75s ease-out",
        "reveal":
          "fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
      keyframes: {
        "fade-in-frame": {
          "0%": {
            opacity: 0,
            visibility: "hidden",
          },
          "100%": {
            opacity: 1,
            visibility: "visible",
          },
        },
        "fade-in-up": {
          "0%": {
            opacity: 0,
            transform: "translateY(2rem)",
          },
          "100%": {
            opacity: 1,
            transform: "translateY(0)",
          },
        },
      },
    },
  },
  plugins: [require("tailwind-highlightjs")],
  safelist: [
    {
      pattern: /hljs+/,
    },
  ],
};
