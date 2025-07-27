import type { ComponentProps } from "react";
import Markdown_ from "react-markdown";

export function Markdown(props: ComponentProps<typeof Markdown_>) {
  return <Markdown_ {...props}>{props.children}</Markdown_>;
}
