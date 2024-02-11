import { Link } from "react-router-dom";
import { routes } from "../App";
import IconLink from "./IconLink";
import { Github, Linkedin } from "lucide-react";

const AppHeader = () => {
  return (
    <nav className="flex justify-between py-3 px-7 text-[#9BA4B5]">
      <Link className="hover:text-zinc-900" to={"/"}>
        Momingse
      </Link>
      <ul className="flex gap-4">
        {routes.map(({ name, path }) => {
          return (
            <li key={path}>
              <Link className="hover:text-zinc-900" to={path}>
                {name}
              </Link>
            </li>
          );
        })}
        <IconLink
          className="hover:text-zinc-900"
          path="https://github.com/momingse"
          icon={<Github />}
        />
        <IconLink
          className="hover:text-zinc-900"
          path="https://www.linkedin.com/in/wang-hin-chow-5ab517271/"
          icon={<Linkedin />}
        />
      </ul>
    </nav>
  );
};

export default AppHeader;
