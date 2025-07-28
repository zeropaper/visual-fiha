import type { ToolCall, ToolSet } from "ai";
import type * as _monaco from "monaco-editor";
import { z } from "zod";

export const scriptArgsSchema = z.object({
  role: z.enum(["setup", "animation"]),
  type: z.enum(["worker", "layer"]),
  id: z.string(),
});

export const editorChangeArgsSchema = z.object({
  code: z.string(),
});

export type ToolsCall = ToolCall<
  "updateScript",
  z.infer<typeof editorChangeArgsSchema>
>;

export function handleToolCall(
  {
    toolCall,
  }: {
    toolCall: ToolsCall;
  },
  {
    editor,
  }: {
    editor: _monaco.editor.IStandaloneCodeEditor;
    onSwitchRole: () => void;
  },
) {
  console.log("Handling tool call:", toolCall);
  switch (toolCall.toolName) {
    case "updateScript":
      const { code } = toolCall.args;
      console.log("Changing script to:", code);
      editor.setValue(code);
      break;
    default:
      console.warn("Unknown tool call:", toolCall);
  }
}

export const toolsConfig: ToolSet = {
  updateScript: {
    description: "Update the current script",
    parameters: editorChangeArgsSchema,
  },
};
