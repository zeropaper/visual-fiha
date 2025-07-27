import { AdvancedMarkdown } from "@ui/AdvancedMarkdown";
import { useEffect, useState } from "react";
import canvasDocs from "../../docs/canvas-api.md?raw";
import inputsDocs from "../../docs/inputs.md?raw";
import knownBugsDocs from "../../docs/known-bugs.md?raw";
import layersDocs from "../../docs/layers.md?raw";
import plannedFeaturesDocs from "../../docs/planned-features.md?raw";
import workerDocs from "../../docs/runtime-worker.md?raw";
import threejsDocs from "../../docs/threejs-api.md?raw";
import topicsDocs from "../../docs/topics.md?raw";
import type { LayerConfig } from "../types";
import styles from "./Help.module.css";

export type DocTopic =
  | `${LayerConfig["type"]}-api`
  | "layers"
  | "runtime-worker"
  | "planned-features"
  | "known-bugs"
  | "topics"
  | "inputs";

const docs: Record<DocTopic, string> = {
  "canvas-api": canvasDocs,
  "threejs-api": threejsDocs,
  "runtime-worker": workerDocs,
  "planned-features": plannedFeaturesDocs,
  "known-bugs": knownBugsDocs,
  inputs: inputsDocs,
  layers: layersDocs,
  topics: topicsDocs,
};

export const docTopics = Object.keys(docs) as DocTopic[];

export function Help({
  docTopic: docTopicProp,
  className = styles.root,
}: { docTopic: DocTopic | null; className?: string }) {
  const [docTopic, setDocTopic] = useState<DocTopic | null>(docTopicProp);
  useEffect(() => {
    if (docTopicProp) {
      setDocTopic(docTopicProp);
    } else {
      setDocTopic("topics");
    }
  }, [docTopicProp]);

  const [helpContent, setHelpContent] = useState<string>("");
  useEffect(() => {
    setHelpContent(docs[docTopic || "runtime-worker"] || "");
  }, [docTopic]);
  const allTopicLinks =
    docTopic !== "topics"
      ? `<details><summary>All topics</summary>\n\n${topicsDocs.split("\n").slice(2).join("\n")}\n\n</details>\n\n`
      : "";
  return (
    <section className={className}>
      <AdvancedMarkdown
        a={(props) => {
          const { href, children, ...rest } = props;
          if (href?.[0] === "#") {
            return (
              <a
                href={href}
                onClick={(e) => {
                  e.preventDefault();
                  // If the href is a local link to another doc topic
                  if (Object.keys(docs).includes(href.slice(1))) {
                    setDocTopic(href.slice(1) as DocTopic);
                  } else {
                    console.warn(
                      `No documentation found for topic: ${href.slice(1)}`,
                    );
                    setDocTopic("topics");
                  }
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
        {`${allTopicLinks}#${helpContent.replaceAll(/\n#/g, "\n##").trim()}`}
      </AdvancedMarkdown>
    </section>
  );
}
