import { Route, Routes } from "react-router-dom";
import AppLayout from "./compents/AppLayout";
import BlogTemplate from "./compents/BlogTemplate";
import { marked } from "marked";

type RouteInfo = {
  name: string;
  path: string;
  component: any;
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

const routesOrder = Object.freeze({
  Blog: 1,
  Home: 0,
});

export const routes = Object.keys(PagePathsWithComponents)
  .map((path: string) => {
    const name = path.match(/\.\/pages\/(.*)\.tsx$/)![1];
    return {
      name,
      path: name === "Home" ? "/" : `/${name.toLowerCase()}`,
      component: PagePathsWithComponents[path].default,
    } as RouteInfo;
  })
  .sort((a, b) => {
    const aP = routesOrder.hasOwnProperty(a.name) ? routesOrder[a.name] : 100;
    const bP = routesOrder.hasOwnProperty(b.name) ? routesOrder[b.name] : 100;
    return aP - bP;
  });

export function App() {
  return (
    <AppLayout>
      <Routes>
        {routes.map(({ path, component: RouteComp }) => {
          return <Route key={path} path={path} element={<RouteComp />} />;
        })}
        {blogsRoutes.map(({ path, component: RouteComp }) => {
          return <Route key={path} path={path} element={RouteComp} />;
        })}
      </Routes>
    </AppLayout>
  );
}
