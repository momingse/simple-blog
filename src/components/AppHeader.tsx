import { Folder, Github, Linkedin, NotepadText } from "lucide-react";
import { Link } from "react-router-dom";
import { routes } from "../App";
import useBreakpoint from "../util/hook/useBreakpoint";
import IconLink from "./IconLink";
import Home from "../pages/Home";

const routesIconMapping: Readonly<{ [key: string]: JSX.Element }> =
  Object.freeze({
    Blog: <NotepadText />,
    Project: <Folder />,
  });

const AppHeader = () => {
  const isMobile = !useBreakpoint().md;

  return (
    <nav className="flex justify-between py-3 px-7 text-[#9BA4B5]">
      <Link to={"/"}>Harry Chow</Link>
      <ul className="flex gap-4">
        {routes.map(({ name, path }) => {
          if (isMobile) {
            if (!Object.prototype.hasOwnProperty.call(routesIconMapping, name))
              return null;
            return (
              <li key={name}>
                <Link to={path}>{routesIconMapping[name]}</Link>
              </li>
            );
          }
          return (
            <li key={name}>
              <Link to={path}>{name}</Link>
            </li>
          );
        })}
        <IconLink path="https://github.com/momingse" icon={<Github />} />
        <IconLink
          path="https://www.linkedin.com/in/wang-hin-chow-5ab517271/"
          icon={<Linkedin />}
        />
      </ul>
    </nav>
  );
};

export default AppHeader;
