import { useEffect, useState } from "react";
import Markdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import rehypeRaw from "rehype-raw";
import canvasDocs from "../../docs/canvas-api.md?raw";
import inputsDocs from "../../docs/inputs.md?raw";
import noscriptDocs from "../../docs/noscript.md?raw";
import threejsDocs from "../../docs/threejs-api.md?raw";
import workerDocs from "../../docs/worker.md?raw";
import type { LayerConfig } from "../types";
import styles from "./Help.module.css";

type DocTopic = LayerConfig["type"] | "worker" | "noscript" | "inputs";

const docs: Record<DocTopic, string> = {
  canvas: canvasDocs,
  threejs: threejsDocs,
  worker: `# Worker Script Editor`,
  inputs: inputsDocs,
  noscript: `# No Script Editor`,
};

export function Help({
  docTopic: docTopicProp,
  className = styles.root,
}: { docTopic: DocTopic | null; className?: string }) {
  const [docTopic, setDocTopic] = useState<DocTopic | null>(docTopicProp);
  useEffect(() => {
    if (docTopicProp) {
      setDocTopic(docTopicProp);
    } else {
      setDocTopic("noscript");
    }
  }, [docTopicProp]);

  const [helpContent, setHelpContent] = useState<string>("");
  useEffect(() => {
    setHelpContent(docs[docTopic || "worker"] || "");
  }, [docTopic]);
  return (
    <section className={className}>
      <Markdown
        rehypePlugins={[rehypeRaw]}
        components={{
          a(props) {
            console.log("Anchor component props:", props);
            const { href, children, ...rest } = props;
            if (
              href?.[0] === "#" &&
              Object.keys(docs).includes(href.slice(1))
            ) {
              // If the href is a local link to another doc topic
              return (
                <a
                  href={href}
                  onClick={(e) => {
                    e.preventDefault();
                    setDocTopic(href.slice(1) as DocTopic);
                  }}
                  {...rest}
                >
                  {children}
                </a>
              );
            }

            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                {...rest}
              >
                {children}
              </a>
            );
          },
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
        {helpContent}
      </Markdown>
    </section>
  );
}
