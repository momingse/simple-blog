import { BookOpen, Briefcase, Github, Home, Linkedin } from "lucide-react";
import IconLink from "./IconLink";
import { Link } from "react-router-dom";
import { routes } from "../App";
import useEventListener from "../util/hook/useEventListener";

const routesIconMapping: Readonly<{ [key: string]: JSX.Element }> =
  Object.freeze({
    Home: <Home />,
    Blog: <BookOpen />,
    Project: <Briefcase />,
  });

const AppHeader = () => {
  const isScrolled = useEventListener<boolean>("scroll", () => {
    return window.scrollY > 20;
  });

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "py-4 glass border-b border-gray-200 bg-white" : "py-8"}`}
    >
      <div className="max-w-4xl mx-auto px-6 flex items-center justify-between">
        <Link className="flex items-center gap-2 cursor-pointer group" to={"/"}>
          <div className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center font-bold text-lg group-hover:rotate-12 transition-transform">
            H
          </div>
          <span className="font-bold text-xl tracking-tight hidden sm:block">
            Harry Chow
          </span>
        </Link>

        <div className="flex items-center">
          <ul className="flex md:gap-3">
            {routes.map(({ name, path }) => {
              return (
                <li key={name}>
                  <Link
                    to={path}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all hover:bg-gray-100 text-gray-600`}
                  >
                    {routesIconMapping[name]}
                    <span className="text-sm font-medium hidden sm:inline">
                      {name}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="h-6 w-[1px] bg-gray-200 mx-2 hidden sm:block"></div>

          <div className="flex items-center">
            <IconLink
              path="https://github.com/momingse"
              icon={<Github />}
              className="px-3 py-1.5"
            />
            <IconLink
              path="https://www.linkedin.com/in/wang-hin-chow-5ab517271/"
              icon={<Linkedin />}
              className="px-3 py-1.5"
            />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AppHeader;
