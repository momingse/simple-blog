import { FC } from "react";
import { Link } from "react-router-dom";

type BlogCardProps = {
  date: string;
  topics: string[];
  name: string;
  to: string;
};

const BlogCard: FC<BlogCardProps> = ({ date, topics, name, to }) => {
  return (
    <Link to={to}>
      <div className="m-auto max-w-[666px] py-2 px-6 cursor-pointer bg-[#fafafa] rounded-xl text-zinc-500 hover:text-zinc-800 shadow-lg hover:border border-gray-200">
        <div className="text-2xl">{name}</div>
        <span className="text-sm text-zinc-400">{date}</span>
        <span className="text-sm text-zinc-400 sm:pl-4 sm:inline-flex flex gap-2">
          {topics.map((topic) => (
            <span key={topic}>{topic}</span>
          ))}
        </span>
      </div>
    </Link>
  );
};

export default BlogCard;
