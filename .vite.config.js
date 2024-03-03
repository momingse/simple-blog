import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    minify: false,
    target: "es2019",
  },
  assetsInclude: ["**/*.md"],
});
