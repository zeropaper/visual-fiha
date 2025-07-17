import { useEffect, useState } from "react";
import canvasDocs from "../../docs/canvas-api.md?raw";
import inputsDocs from "../../docs/inputs.md?raw";
import noscriptDocs from "../../docs/noscript.md?raw";
import workerDocs from "../../docs/runtime-worker.md?raw";
import threejsDocs from "../../docs/threejs-api.md?raw";
import type { LayerConfig } from "../types";
import styles from "./Help.module.css";
import { AdvancedMarkdown } from "./base/AdvancedMarkdown";

type DocTopic = LayerConfig["type"] | "runtimeWorker" | "noscript" | "inputs";

const docs: Record<DocTopic, string> = {
  canvas: canvasDocs,
  threejs: threejsDocs,
  runtimeWorker: workerDocs,
  inputs: inputsDocs,
  noscript: noscriptDocs,
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
    setHelpContent(docs[docTopic || "runtimeWorker"] || "");
  }, [docTopic]);
  return (
    <section className={className}>
      <AdvancedMarkdown
        a={(props) => {
          // console.log("Anchor component props:", props);
          const { href, children, ...rest } = props;
          if (href?.[0] === "#" && Object.keys(docs).includes(href.slice(1))) {
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
            <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
              {children}
            </a>
          );
        }}
      >
        {helpContent}
      </AdvancedMarkdown>
    </section>
  );
}
