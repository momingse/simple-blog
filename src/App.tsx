import { Route, Routes } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import BlogTemplate from "./components/BlogTemplate";
import { markdownToHtml } from "./util/markdownToHtml";

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
  return markdownToHtml(value.default as string);
});

const blogsRoutes: RouteInfo[] = blogsInfo.map(
  ({ name, html, date, topics }) => {
    return {
      name,
      path: `/blog/${name}`,
      component: (
        <BlogTemplate html={html} title={name} date={date} topics={topics} />
      ),
    };
  },
);

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
