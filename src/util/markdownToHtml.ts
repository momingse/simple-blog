import { marked } from "marked";
import markedKatex from "marked-katex-extension";

export const markdownToHtml = (
  markdown: string,
): { name: string; html: string; date: string; topics: string[] } => {
  const regex =
    /^---\s*\r?\ndate: (\d{2}\/\d{2}\/\d{4})\r?\ntopics: ([^\r\n]+)\s*\r?\n---$/m;
  const match = regex.exec(markdown);
  const date = match?.at(1) || "";
  const topics = match?.at(2)?.split(" ") || [];
  let name;
  const parsedMarkdown = match?.at(0)
    ? markdown.replace(match.at(0)!, "")
    : markdown;

  const html = marked
    .setOptions({
      breaks: true,
      gfm: true,
    })
    .use(
      markedKatex({
        nonStandard: true,
        throwOnError: false, // Don't throw on parse errors
        errorColor: "#FF0000", // Highlight errors in red
        displayMode: false, // Inline mode by default
        output: "html", // Output format
        delimiters: [
          // Try different delimiters if needed
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false },
        ],
      }),
    )
    .use({
      renderer: {
        heading(_, level, raw) {
          if (level == 1) {
            name = raw;
            return `<h1>${raw}</h1>`;
          }
          return false;
        },
        image(href, _, text) {
          // src should be "../../public/blog/xxx.png"
          // remove all before "/blog/"
          href = href.replace(/^.*\/blog\//, "");
          return `<img src="${href}" alt="${text}" lazy="true" />`;
        },
        code(code, lang) {
          const language = lang || "plaintext";

          // We wrap the code block in a container that allows us to style the header (language name)
          return `
          <div class="code-block-wrapper my-8 overflow-y-hidden rounded-xl border border-slate-800 shadow-2xl">
            <div class="flex items-center justify-between bg-slate-800 px-4 py-2 text-xs font-mono text-slate-400">
              <span class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-slate-600"></span>
                <span class="uppercase tracking-widest">${language}</span>
              </span>
              <button class="hover:text-white transition-colors" onclick="navigator.clipboard.writeText(this.parentElement.nextElementSibling.innerText)">
                Copy
              </button>
            </div>
            <pre class="language-${language}"><code class="language-${language}">${code}</code></pre>
          </div>`;
        },
      },
    })
    .parse(parsedMarkdown, { async: false }) as string;

  return {
    date,
    topics,
    name: name ?? "Title not found",
    html,
  };
};
