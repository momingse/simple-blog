import Prism from "prismjs";
import "prismjs/components/prism-python";
import "prismjs/components/prism-scss";
import "prismjs/components/prism-sql";
import { useEffect, useMemo, useState } from "react";
import Anchor from "./Anchor";

type BlogTemplateProps = {
  html: string;
  headingId: {
    level: 2 | 3;
    id: string;
  }[];
};

const BlogTemplate: FC<BlogTemplateProps> = ({ html, headingId }) => {
  useEffect(() => {
    Prism.highlightAll();
  }, []);

  const items = useMemo(() => {
    return headingId.map(({ id, level }) => {
      const title = decodeURI(id.replace(/---\d+$/, ""));
      return {
        id,
        title,
        level,
      };
    });
  }, [headingId]);

  return (
    <div className="w-full">
      <div className="m-auto md:flex justify-center">
        <div className="hidden lg:block mr-2 w-44" />
        <div
          id="blog"
          className="max-w-[666px]"
          dangerouslySetInnerHTML={{ __html: html }}
        />
        <div className="hidden lg:block ml-2 w-44 border-zinc-50">
          <Anchor
            items={items}
            className="sticky top-10 text-zinc-600 text-xs overflow-hidden whitespace-nowrap text-ellipsis"
            key={items[0].id}
          />
        </div>
      </div>
    </div>
  );
};

export default BlogTemplate;
