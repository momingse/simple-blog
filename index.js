import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import dotenv from "dotenv";

dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const resolve = (p) => path.resolve(__dirname, p);
const isProduction = process.env.NODE_ENV === "production";
console.log(process.env.NODE_ENV)
const port = process.env.PORT || 5173;
const base = process.env.BASE || "/";

export default async function createServer() {
  let vite = null;
  if (!isProduction) {
    vite = await (
      await import("vite")
    ).createServer({
      server: {
        middlewareMode: true,
      },
      appType: "custom",
      base,
    });
    app.use(vite.middlewares);
  } else {
    app.use((await import("compression")).default());

    app.use(
      (await import("serve-static")).default(resolve("dist/client"), {
        index: false,
      }),
    );
  }

  app.get("*", async (req, res) => {
    try {
      // const url = req.originalUrl.replace(base, "");
      const url = req.path;

      let template, render;
      if (!isProduction && vite) {
        template = fs.readFileSync(resolve("index.html"), "utf-8");
        template = await vite.transformIndexHtml(url, template); // Inserting react-refresh for local development
        render = (await vite.ssrLoadModule("/src/server.tsx")).SSRRender;
      } else {
        template = fs.readFileSync(resolve("dist/client/index.html"), "utf-8");
        render = (await import("./dist/server/server.js")).SSRRender;
      }

      const appHtml = render(url); //Rendering component without any client side logic de-hydrated like a dry sponge
      const html = template.replace(`<!--app-html-->`, appHtml); //Replacing placeholder with SSR rendered components

      res.status(200).set({ "Content-Type": "text/html" }).end(html); //Outputing final html
    } catch (e) {
      vite?.ssrFixStacktrace(e);
      console.log(e.stack);
      res.status(500).end(e.stack);
    }
  });

  // return { app, vite };
  return app;
}

createServer().then((app) =>
  app.listen(port, () => {
    console.log(`http://localhost:${port}`);
  }),
);
