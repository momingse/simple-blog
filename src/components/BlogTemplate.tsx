import hljs from "highlight.js";
import { FC, useEffect } from "react";

type BlogTemplateProps = {
  html: string;
};

export default function BlogTemplate({ html }) {
  useEffect(() => {
    hljs.highlightAll();
  });

  return (
    <div className="w-full">
      <div
        className="max-w-[666px] m-auto"
        id="blog"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
