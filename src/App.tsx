import { Route, Routes } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import BlogTemplate from "./components/BlogTemplate";
import { marked } from "marked";
import markedKatex from "marked-katex-extension";

type RouteInfo = {
  name: string;
  path: string;
  component: JSX.Element;
};

const PagePathsWithComponents = import.meta.glob("./pages/*.tsx", {
  eager: true,
});

const blogsInMD = import.meta.glob("./blogs/*.md", {
  eager: true,
  query: "?raw",
});

export const blogsInfo = Object.entries(blogsInMD).map(([key, value]) => {
  const regex =
    /^---\s*\r?\ndate: (\d{2}\/\d{2}\/\d{4})\r?\ntopics: ([^\r\n]+)\s*\r?\n---$/m;
  const match = regex.exec(value.default);
  const date = match?.at(1) || "";
  const topics = match?.at(2)?.split(" ") || [];
  let name;
  const mdValue = match
    ? value.default.replace(match.at(0), "")
    : value.default;

  const html = marked
    .use(
      markedKatex({
        nonStandard: true,
        throwOnError: false, // Don't throw on parse errors
        errorColor: "#FF0000", // Highlight errors in red
        displayMode: false, // Inline mode by default
        output: "html", // Output format
        delimiters: [
          // Try different delimiters if needed
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false },
        ],
      }),
    )
    .use({
      renderer: {
        heading(text, level, raw) {
          if (level == 1) {
            name = raw;
            return `<h1>${raw}</h1>`;
          }
          return false;
        },
        image(href, _, text) {
          // src should be "../../public/blog/xxx.png"
          // remove all before "/blog/"
          console.log(href, text);
          href = href.replace(/^.*\/blog\//, "");
          return `<img src="${href}" alt="${text}" lazy="true" />`;
        },
      },
    })
    .parse(mdValue, { async: false }) as string;

  return {
    date,
    topics,
    name: name ?? key.match(/\.\/blogs\/(.*)\.md$/)![1],
    html,
  };
});

const blogsRoutes: RouteInfo[] = blogsInfo
  .map(({ name, html }) => {
    return {
      name,
      path: `/blog/${name}`,
      component: <BlogTemplate html={html} />,
    };
  });

const routesOrder: Readonly<{ [key: string]: number }> = Object.freeze({
  Blog: 1,
  Home: 0,
});

export const routes = Object.keys(PagePathsWithComponents)
  .map((path: string) => {
    const name = path.match(/\.\/pages\/(.*)\.tsx$/)![1];
    const component = PagePathsWithComponents[path].default;
    let props = {};
    try {
      props = component.getInitialProps ? component.getInitialProps() : {};
    } catch (err) {
      console.log(err);
    }
    return {
      name,
      path: name === "Home" ? "/" : `/${name.toLowerCase()}`,
      component: component(props),
    } as RouteInfo;
  })
  .sort((a, b) => {
    const aP = Object.prototype.hasOwnProperty.call(routesOrder, a.name)
      ? routesOrder[a.name]
      : 100;
    const bP = Object.prototype.hasOwnProperty.call(routesOrder, b.name)
      ? routesOrder[b.name]
      : 100;
    return aP - bP;
  });

export function App() {
  return (
    <AppLayout>
      <Routes>
        {routes.map(({ name, path, component: RouteComp }) => {
          return <Route key={name} path={path} element={RouteComp} />;
        })}
        {blogsRoutes.map(({ name, path, component: RouteComp }) => {
          return <Route key={name} path={path} element={RouteComp} />;
        })}
      </Routes>
    </AppLayout>
  );
}
