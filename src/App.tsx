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

// ts-expect-error
const blogsInMD = import.meta.glob("./blogs/*.md", {
  eager: true,
  query: "?raw",
});

const blogsInHTML = Object.entries(blogsInMD).map(([key, value]) => {
  return {
    path: key,
    html: marked(value.default),
  };
});
const blogsRoutes = blogsInHTML.map((blogInHTML) => {
  const name = blogInHTML.path.match(/\.\/blogs\/(.*)\.md$/)![1];
  return {
    name: name,
    path: `/blog/${name}`,
    component: <BlogTemplate html={blogInHTML.html} />,
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
