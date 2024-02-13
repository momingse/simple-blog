import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const toAbsolute = (p) => path.resolve(__dirname, p);

const template = fs.readFileSync(toAbsolute("dist/static/index.html"), "utf-8");
const render = (await import("./dist/server/server.js")).SSRRender;

// determine routes to pre-render from src/pages
const routesToPrerender = fs
  .readdirSync(toAbsolute("src/pages"))
  .map((file) => {
    const name = file.replace(/\.tsx$/, "").toLowerCase();
    return name === "home" ? `/` : `/${name}`;
  });

const blogsToPrereneder = fs
  .readdirSync(toAbsolute("src/blogs"))
  .map((file) => {
    return "/blog/" + encodeURI(file.replace(/\.md$/, ""));
  });

(async () => {
  // pre-render each route...
  for (const url of routesToPrerender) {
    const appHtml = render(url);

    const html = template.replace(`<!--app-html-->`, appHtml);

    const filePath = `dist/static${url === "/" ? "/index" : url}.html`;
    fs.writeFileSync(toAbsolute(filePath), html);
    console.log("pre-rendered:", filePath);
  }

  fs.mkdirSync(toAbsolute("dist/static/blog", { recursive: true }));
  for (const url of blogsToPrereneder) {
    const appHtml = render(url);

    const html = template.replace(`<!--app-html-->`, appHtml);

    const filePath = `dist/static${url === "/" ? "/index" : url}.html`;
    fs.writeFileSync(toAbsolute(filePath), html);
    console.log("pre-rendered:", filePath);
  }
})();
