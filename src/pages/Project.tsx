import { FC } from "react";
import ProjectCard from "../components/ProjectCard";
import FadeInWrapper from "../components/FadeInWrapper";
import { Code, ChevronRight } from "lucide-react";

export type ProjectInfo = {
  html_url: string;
  description: string | null;
  name: string;
  tags?: string[];
  image: string;
  [key: string]: any;
};

type ProjectProps = {
  projectInfo: ProjectInfo[];
};

export interface SSR<T> extends FC<T> {
  getInitialProps: () => Promise<T> | T;
}

const Project: SSR<ProjectProps> = ({ projectInfo }) => {
  return (
    <div className="space-y-32 py-10">
      {/* Hero Section */}
      <div className="space-y-4">
        <FadeInWrapper key={"title"}>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-[1px] w-12 bg-black"></div>
            <span className="text-xs font-bold uppercase tracking-[0.2em]">
              Portfolio
            </span>
          </div>
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tighter text-gray-900 leading-none">
            Selected <span className="text-gray-400">Works.</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-xl leading-relaxed">
            A focused selection of digital products, combining technical rigor
            with aesthetic clarity.
          </p>
        </FadeInWrapper>
      </div>

      {/* Projects List */}
      <FadeInWrapper key={"project"} className="space-y-40">
        {projectInfo.map((repoInfo, idx) => {
          return (
            <ProjectCard
              projectInfo={repoInfo}
              key={repoInfo.html_url}
              index={idx}
            />
          );
        })}
      </FadeInWrapper>
    </div>
  );
};

Project.getInitialProps = () => {
  return {
    projectInfo: [
      {
        html_url: "https://github.com/momingse/simple-blog",
        description:
          "A robust, high-performance blog platform supporting Server-Side Rendering (SSR) and Static Site Generation (SSG). Built with React, Vite, and Express, it features a custom Markdown engine and AI-powered content summaries.",
        name: "simple-blog",
        tags: ["react", "ssr", "vite", "expressjs"],
        image: "simple-blog.png",
      },
      {
        html_url: "https://github.com/momingse/KTodo",
        description:
          "A developer-first task management tool inspired by Kanban methodologies. Features include real-time synchronization, drag-and-drop task prioritization, and deep keyboard shortcuts for high-productivity workflows.",
        name: "KTodo",
        tags: ["typescript", "tailwindcss", "kanban"],
        image: "ktodo.png",
      },
      {
        html_url: "https://github.com/momingse/bomb-man",
        description:
          "An experimental real-time multiplayer arcade game. I implemented low-latency networking using Socket.io and custom physics synchronization to ensure a smooth competitive experience directly in the browser.",
        name: "Bomb Man",
        tags: ["socket.io", "canvas", "websockets"],
        image: "bomb-man.png",
      },
    ] as ProjectInfo[],
  };
};

export default Project;
