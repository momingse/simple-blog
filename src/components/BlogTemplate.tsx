import Prism from "prismjs";
import "prismjs/components/prism-python";
import "prismjs/components/prism-scss";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-typescript";
import { FC, useEffect, useRef, useState } from "react";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import Anchor, { Item } from "./Anchor";

type BlogTemplateProps = {
  html: string;
  title: string;
  date: string;
  topics: string[];
};

const BlogTemplate: FC<BlogTemplateProps> = ({ html, title, date, topics }) => {
  const [items, setItems] = useState<Item[]>([]);
  const blogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Prism.highlightAll();
  }, [html]);

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
  }, [html]);

  return (
    <div className="w-full">
      <div className="flex justify-center gap-4">
        {/* Main Article Column */}
        <article className="flex-grow w-full max-w-2xl">
          {/* Header Section */}
          <header className="mb-6">
            <div className="flex flex-wrap items-center gap-3">
              {topics.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-indigo-50 text-indigo-600 border border-indigo-100 text-[11px] font-bold uppercase tracking-widest rounded-full hover:bg-indigo-100 transition-colors cursor-default shadow-sm"
                >
                  {tag}
                </span>
              ))}
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.1] tracking-tight mb-4">
              {title}
            </h1>

            <div className="flex items-center gap-6 text-slate-400 text-sm font-medium border-t border-slate-100">
              <span className="flex items-center gap-1.5">
                <Calendar size={16} strokeWidth={2.5} />
                {date}
              </span>
              <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
              <span className="flex items-center gap-1.5">
                <Clock size={16} strokeWidth={2.5} />5 min read
              </span>
            </div>
          </header>

          {/* Markdown Body */}
          <section ref={blogRef} className="relative min-h-[500px]">
            <div id="blog" dangerouslySetInnerHTML={{ __html: html }} />
          </section>

          {/* Post Metadata Footer */}
          <footer className="mt-20 pt-10 border-t border-slate-100">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-slate-500 italic">
                Last updated on {date}
              </div>
            </div>
          </footer>
        </article>

        {/* Sidebar Column - Table of Contents */}
        <aside className="hidden lg:block w-48 flex-shrink-0">
          <div className="sticky top-24">
            <Anchor
              items={items}
              className="text-zinc-600 text-xs overflow-hidden whitespace-nowrap text-ellipsis"
            />
          </div>
        </aside>
      </div>
    </div>
  );
};

export default BlogTemplate;
