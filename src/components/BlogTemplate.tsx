import hljs from "highlight.js";
import { FC, useEffect, useMemo } from "react";
import Anchor from "./Anchor";

type BlogTemplateProps = {
  html: string;
  headingId: string[];
};

const BlogTemplate: FC<BlogTemplateProps> = ({ html, headingId }) => {
  useEffect(() => {
    hljs.highlightAll();
  });

  const items = useMemo(() => {
    return headingId.map((id) => {
      return {
        id,
        title: decodeURI(id),
      };
    });
  }, [headingId]);

  return (
    <div className="w-full">
      <div className="m-auto flex justify-center">
        <div className="hidden lg:block mr-2 w-40" />
        <div
          id="blog"
          className="max-w-[666px]"
          dangerouslySetInnerHTML={{ __html: html }}
        />
        <div className="hidden lg:block ml-2 w-40 border-zinc-50">
          <Anchor
            items={items}
            className="sticky top-10 text-sm text-zinc-600"
            key={items[0].id}
          />
        </div>
      </div>
    </div>
  );
};

export default BlogTemplate;
