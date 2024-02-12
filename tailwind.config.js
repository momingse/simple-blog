/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      animation: {
        "fade-in": "fade-in-frame 0.75s ease-out",
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
