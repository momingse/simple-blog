import { FC } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

type BlogCardProps = {
  date: string;
  topics: string[];
  name: string;
  to: string;
};

const BlogCard: FC<BlogCardProps> = ({ date, topics, name, to }) => {
  return (
    <Link
      to={to}
      className="group block m-auto p-6 sm:p-8 bg-white border border-gray-50 rounded-[2rem] hover:shadow-xl hover:-translate-y-1 transition-all duration-500 cursor-pointer shadow-lg"
    >
      <div className="flex flex-col gap-4">
        {/* Top Row: Meta Info */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-tighter">
            {date}
          </span>
          <div className="flex gap-2">
            {topics.map((topic) => (
              <span
                key={topic}
                className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-tighter"
              >
                #{topic.replace(/_/g, "-")}
              </span>
            ))}
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-tight flex items-center gap-2">
            {name}
            <ChevronRight
              size={18}
              className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-blue-600"
            />
          </h2>
        </div>
      </div>
    </Link>
  );
};

export default BlogCard;
