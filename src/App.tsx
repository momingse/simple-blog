import { Route, Routes } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import BlogTemplate from "./components/BlogTemplate";
import { marked } from "marked";

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
  const name = key.match(/\.\/blogs\/(.*)\.md$/)![1];
  let html = "";
  if (match) {
    html = marked(value.default.replace(match?.at(0), ""));
  } else {
    html = marked(value.default);
  }
  return {
    date,
    topics,
    name,
    html,
  };
});

const blogsRoutes = blogsInfo.map(({ name, html }) => {
  return {
    name,
    path: `/blog/${name}`,
    component: <BlogTemplate html={html} />,
  } as RouteInfo;
});

const routesOrder: Readonly<{ [key: string]: number }> = Object.freeze({
  Blog: 1,
  Home: 0,
});

export const routes = Object.keys(PagePathsWithComponents)
  .map((path: string) => {
    const name = path.match(/\.\/pages\/(.*)\.tsx$/)![1];
    return {
      name,
      path: name === "Home" ? "/" : `/${name.toLowerCase()}`,
      component: PagePathsWithComponents[path].default(),
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
        {routes.map(({ path, component: RouteComp }) => {
          return <Route key={path} path={path} element={RouteComp} />;
        })}
        {blogsRoutes.map(({ path, component: RouteComp }) => {
          return <Route key={path} path={path} element={RouteComp} />;
        })}
      </Routes>
    </AppLayout>
  );
}
