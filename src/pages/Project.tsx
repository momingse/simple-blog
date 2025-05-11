import { FC } from "react";
import ProjectCard from "../components/ProjectCard";
import FadeInWrapper from "../components/FadeInWrapper";

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
    <div className="flex flex-col justify-center">
      <div className="flex justify-center">
        <div>
          <h1 className="font-light text-4xl text-zinc-900">Project</h1>
        </div>
      </div>
      <FadeInWrapper
        key={"project"}
        className="flex flex-col gap-4 w-full justify-center self-center"
      >
        {projectInfo.map((repoInfo) => {
          return <ProjectCard projectInfo={repoInfo} key={repoInfo.html_url} />;
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
          "Simple blog support ssr and ssg built with React, Vite and Express",
        name: "simple-blog",
        tags: [
          "react",
          "blog",
          "typescript",
          "ssr",
          "expressjs",
          "ssg",
          "vite",
        ],
        image: "simple-blog.png",
      },
      {
        html_url: "https://github.com/momingse/KTodo",
        description:
          "Kanban like todo website managing your tasks in Kanban board",
        name: "KTodo",
        tags: ["react", "typescript", "kanban-board", "tailwindcss"],
        image: "ktodo.png",
      },
      {
        html_url: "https://github.com/momingse/bomb-man",
        description: "Bomb man game built with React, Express and Socket.io",
        name: "Bomb Man",
        tags: ["react", "typescript", "expressjs", "socket.io"],
        image: "bomb-man.png",
      },
    ] as ProjectInfo[],
  };
};

export default Project;
