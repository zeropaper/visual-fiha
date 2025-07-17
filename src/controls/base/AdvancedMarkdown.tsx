import Markdown, { type Components } from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import rehypeRaw from "rehype-raw";

export function AdvancedMarkdown({
  children,
  className,
  a: AnchorComponent,
}: {
  children: string | null | undefined;
  className?: string;
  a?: Components["a"];
}) {
  return (
    <section className={className}>
      <Markdown
        rehypePlugins={[rehypeRaw]}
        components={{
          a:
            AnchorComponent ||
            ((props) => {
              const { href, children: text, ...rest } = props;
              // if (
              //   href?.[0] === "#" &&
              //   Object.keys(docs).includes(href.slice(1))
              // ) {
              //   // If the href is a local link to another doc topic
              //   return (
              //     <a
              //       href={href}
              //       onClick={(e) => {
              //         e.preventDefault();
              //         setDocTopic(href.slice(1) as DocTopic);
              //       }}
              //       {...rest}
              //     >
              //       {text}
              //     </a>
              //   );
              // }

              // return (
              //   <a
              //     href={href}
              //     target="_blank"
              //     rel="noopener noreferrer"
              //     {...rest}
              //   >
              //     {text}
              //   </a>
              // );
              return text;
            }),
          code(props) {
            // console.log("Code component props:", props);
            const { children, className, node, ref, ...rest } = props;
            const match = /language-(\w+)/.exec(className || "");
            return match ? (
              <SyntaxHighlighter
                {...rest}
                PreTag="div"
                language={match[1]}
                style={vscDarkPlus}
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            ) : (
              <code {...rest} className={className}>
                {children}
              </code>
            );
          },
        }}
      >
        {children}
      </Markdown>
    </section>
  );
}
