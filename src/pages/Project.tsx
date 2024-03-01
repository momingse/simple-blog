import { FC } from "react";
import ProjectCard from "../components/ProjectCard";

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
      {projectInfo.map((repoInfo) => {
        return <ProjectCard projectInfo={repoInfo} key={repoInfo.html_url} />;
      })}
    </div>
  );
};

Project.getInitialProps = async () => {
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
        image: "project1.png",
      },
    ] as ProjectInfo[],
  };
};

export default Project;
