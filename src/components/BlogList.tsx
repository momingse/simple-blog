import BlogCard from "./BlogCard";
import FadeInWrapper from "../components/FadeInWrapper";
import { FC } from "react";

type BlogInfo = {
  blogsInfo: any[];
};

const BlogList: FC<BlogInfo> = ({ blogsInfo }) => {
  const sortedBlogsInfo = [...blogsInfo].sort((a, b) => {
    const [dayA, monthA, yearA] = a.date.split("/").map(Number);
    const [dayB, monthB, yearB] = b.date.split("/").map(Number);

    if (yearA !== yearB) return yearB - yearA;
    if (monthA !== monthB) return monthB - monthA;
    return dayB - dayA;
  });
  return (
    <FadeInWrapper
      key={"blog"}
      className="flex flex-col gap-4 w-full justify-center self-center pt-3"
      // once={true}
      dependencies={[blogsInfo]}
      delay={0.05}
      duration={0.5}
    >
      {sortedBlogsInfo.map(({ date, topics, name }) => {
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
    </FadeInWrapper>
  );
};

export default BlogList;
