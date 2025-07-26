import content from "../../docs/noscript.md?raw";
import { type DocTopic, docTopics } from "./Help";
import styles from "./LandingContent.module.css";
import { AdvancedMarkdown } from "./base/AdvancedMarkdown";

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
                    setDocTopic("noscript");
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
    </div>
  );
}
