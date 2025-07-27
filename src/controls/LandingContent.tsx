import { AdvancedMarkdown } from "@ui/AdvancedMarkdown";
import content from "../../docs/topics.md?raw";
import { type DocTopic, docTopics } from "./Help";
import { Intro } from "./Intro";
import styles from "./LandingContent.module.css";

export function LandingContent({
  onSetDocTopic: setDocTopic,
}: { onSetDocTopic: (topic: DocTopic) => void }) {
  return (
    <div className={styles.landingContent}>
      <AdvancedMarkdown
        a={(props) => {
          // console.log("Anchor component props:", props);
          const { href, children, ...rest } = props;
          if (href?.[0] === "#") {
            // If the href is a local link to another doc topic
            return (
              <a
                href={href}
                onClick={(e) => {
                  e.preventDefault();
                  if (docTopics.includes(href.slice(1) as DocTopic)) {
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
        {`#${content.replaceAll(/\n#/g, "\n##").trim()}`}
      </AdvancedMarkdown>
      <Intro />
    </div>
  );
}
