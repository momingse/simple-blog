import { blogsInfo } from "../App";
import BlogCard from "../components/BlogCard";

export default function Blog() {
  return (
    <div className="flex flex-col justify-center">
      <div className="flex justify-center">
        <div>
          <h1 className="font-light text-4xl text-zinc-900">Blog</h1>
        </div>
      </div>
      <div className="flex flex-col gap-4 w-full justify-center self-center">
        {blogsInfo.map(({ date, topics, name }) => {
          return (
            <BlogCard
              date={date}
              topics={topics}
              name={name}
              key={name}
              to={`/blog/${name}`}
            />
          );
        })}
      </div>
    </div>
  );
}
