import Prism from "prismjs";
import "prismjs/components/prism-python";
import "prismjs/components/prism-scss";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-bash"
import { FC, useEffect, useRef, useState } from "react";
import Anchor, { Item } from "./Anchor";

type BlogTemplateProps = {
  html: string;
};

const BlogTemplate: FC<BlogTemplateProps> = ({ html }) => {
  const [items, setItems] = useState<Item[]>([]);
  const blogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Prism.highlightAll();
  }, []);

  useEffect(() => {
    if (!blogRef.current) return;
    const headings = blogRef.current.querySelectorAll("h2, h3");
    const items: Item[] = [];
    headings.forEach((heading) => {
      const level = heading.tagName === "H2" ? 2 : 3;
      const id = heading.textContent!.replace(/ /g, "-") + `---${items.length}`;
      heading.id = id;
      items.push({ title: heading.textContent!, id, level });
    });
    setItems(items);
  }, [])

  return (
    <div className="w-full">
      <div className="m-auto md:flex justify-center">
        <div className="hidden lg:block mr-2 w-44" />
        <div
          ref={blogRef}
          id="blog"
          className="max-w-[666px]"
          dangerouslySetInnerHTML={{ __html: html }}
        />
        <div className="hidden lg:block ml-2 w-44 border-zinc-50">
          <Anchor
            items={items}
            className="sticky top-10 text-zinc-600 text-xs overflow-hidden whitespace-nowrap text-ellipsis"
          />
        </div>
      </div>
    </div>
  );
};

export default BlogTemplate;
