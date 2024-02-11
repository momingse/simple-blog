import { FC, HTMLProps, ReactNode } from "react";
import { Link } from "react-router-dom";

type IconLinkProps = {
  className?: HTMLProps<HTMLElement>["className"];
  path: string;
  icon: ReactNode;
};

const IconLink: FC<IconLinkProps> = ({ className = "", path, icon }) => {
  return (
    <Link to={path} className={className}>
      {icon}
    </Link>
  );
};

export default IconLink;
