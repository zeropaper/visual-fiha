import Markdown, { type Components } from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import rehypeRaw from "rehype-raw";
import styles from "./AdvancedMarkdown.module.css";

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
    <section className={[styles.md, className].join(" ")}>
      <Markdown
        rehypePlugins={[rehypeRaw]}
        components={{
          a:
            AnchorComponent ||
            ((props) => {
              const { children: text } = props;
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
