export default {
  input: "server.js",
  output: {
    dir: "dist",
    format: "cjs",
  },
  external: ["express", "vite", "fs", "path"],
};
