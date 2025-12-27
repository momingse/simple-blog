import { FC } from "react";
import { ProjectInfo } from "../pages/Project";
import { Link } from "react-router-dom";
import { ArrowUpRight, Globe } from "lucide-react";

type ProjectCardProps = {
  projectInfo: ProjectInfo;
  index: number;
};

const ProjectCard: FC<ProjectCardProps> = ({ projectInfo, index }) => {
  const { html_url, name, description, tags, image } = projectInfo;
  const isEven = index % 2 === 1;

  return (
    <div
      className={`flex flex-col ${isEven ? "lg:flex-row-reverse" : "lg:flex-row"} items-center gap-12 lg:gap-20`}
    >
      {/* Image Showcase - Minimalist Canvas */}
      <div className="w-full lg:w-[55%] group relative">
        <div className="absolute -inset-4 bg-gray-100/50 rounded-[2.5rem] scale-95 group-hover:scale-100 transition-transform duration-700 -z-10"></div>

        <div className="relative bg-white border border-gray-100 rounded-2xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] overflow-hidden transition-all duration-700 group-hover:shadow-[0_48px_80px_-20px_rgba(0,0,0,0.15)] group-hover:-translate-y-2">
          {/* Minimalist Browser Bar */}
          <div className="flex items-center gap-4 px-5 py-4 bg-gray-50/50 border-b border-gray-100">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-gray-300"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-gray-300"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-gray-300"></div>
            </div>
            <div className="flex-1 max-w-xs h-6 bg-white border border-gray-200 rounded-md flex items-center px-3 gap-2">
              <Globe size={10} className="text-gray-400" />
              <div className="h-1.5 w-24 bg-gray-100 rounded-full"></div>
            </div>
          </div>

          {/* Non-cropping Image Container */}
          <div className="bg-white p-2 sm:p-4 lg:p-6 flex items-center justify-center min-h-[300px] lg:min-h-[400px]">
            <img
              src={`/assets/${image}`}
              alt={name}
              className="w-full h-auto max-h-[500px] object-contain rounded-lg shadow-sm group-hover:scale-[1.02] transition-transform duration-700 ease-out"
            />
          </div>
        </div>
      </div>

      {/* Textual Content */}
      <div className="w-full lg:w-[45%] space-y-8">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <span className="text-4xl font-mono font-light text-gray-400">
              0{index + 1}
            </span>
            <div className="flex flex-wrap gap-2">
              {tags?.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-[10px] font-bold uppercase tracking-widest"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <h3 className="text-4xl font-bold text-gray-900 leading-tight">
            {name}
          </h3>

          <p className="text-lg text-gray-600 leading-relaxed font-light">
            {description}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-gray-100">
          <Link
            to={html_url}
            className="group/link inline-flex items-center gap-2 text-black font-bold hover:text-blue-600 transition-colors"
          >
            View Project{" "}
            <ArrowUpRight
              size={20}
              className="group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform"
            />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
