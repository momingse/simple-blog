import { FC } from "react";
import { ProjectInfo } from "../pages/Project";
import { Link } from "react-router-dom";

type ProjectCardProps = {
  projectInfo: ProjectInfo;
};

const ProjectCard: FC<ProjectCardProps> = ({ projectInfo }) => {
  const { html_url, name, description, tags, image } = projectInfo;

  return (
    <div>
      <Link
        to={html_url}
        className="block m-auto max-w-[666px] py-2 px-6 cursor-pointer bg-[#fafafa] rounded-xl text-zinc-500 hover:text-zinc-800 shadow-lg hover:border border-gray-200 md:flex"
      >
        <div className="mb-3 md:p-5">
          <img src={`/assets/${image}`} className="max-w-48"/>
        </div>
        <div className="md:p-5">
          <div className="text-xl md:text-2xl pb-2">{name}</div>
          <div className="pb-1">{description}</div>
          <span className="text-sm text-zinc-400 sm:inline-flex flex gap-2 overflow-hidden">
            {tags?.map((tag) => <span key={tag}>{tag}</span>)}
          </span>
        </div>
      </Link>
    </div>
  );
};

export default ProjectCard;
