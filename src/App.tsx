import { Link, Route, Routes } from "react-router-dom";
import AppLayout from "./compents/AppLayout";
import { ReactNode } from "react";

type RouteInfo = {
  name: string;
  path: string;
  component: any;
};

const PagePathsWithComponents = import.meta.glob("./pages/*.tsx", {
  eager: true,
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
    let aP = routesOrder[a.name] ?? 100;
    let bP = routesOrder[b.name] ?? 100;
    return aP - bP;
  });

export function App() {
  return (
    <AppLayout>
      <Routes>
        {routes.map(({ path, component: RouteComp }) => {
          return <Route key={path} path={path} element={<RouteComp />} />;
        })}
      </Routes>
    </AppLayout>
  );
}
