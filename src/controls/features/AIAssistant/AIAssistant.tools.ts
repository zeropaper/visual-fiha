import { tsTranspile } from "@utils/tsTranspile";
import type { ToolCall, ToolSet } from "ai";
import type * as _monaco from "monaco-editor";
import type { LayerConfig } from "src/types";
import { z } from "zod";

export const scriptBaseSchema = z.object({
  role: z.enum(["setup", "animation"]).describe("The role of the script"),
  // id: z.string().default("worker").describe("The ID of the layer, defaults to 'worker'"),
});

export const setScriptSchema = scriptBaseSchema.extend({
  code: z.string().describe("The new script code"),
});

export type ToolsCall = ToolCall<"setScript", z.infer<typeof setScriptSchema>>;

export async function handleToolCall(
  {
    toolCall,
  }: {
    toolCall: ToolsCall;
  },
  {
    editor,
    role,
    type,
    id,
    setSetupScript,
    setAnimationScript,
  }: {
    editor: _monaco.editor.IStandaloneCodeEditor;
    role: "setup" | "animation";
    type: "worker" | "layer";
    id: string;
    setSetupScript: (code: string) => void;
    setAnimationScript: (code: string) => void;
  },
): Promise<{ success: boolean; result?: string; error?: string }> {
  console.log("Handling tool call:", toolCall);
  switch (toolCall.toolName) {
    case "setScript":
      const { code, role: changesRole } = toolCall.args;
      if (changesRole === "setup") {
        setSetupScript(code);
      } else if (changesRole === "animation") {
        setAnimationScript(code);
      }
      // if (changesRole === role) {
      //   editor.setValue(code);
      // }
      const result = await tsTranspile(code, type, changesRole, id);
      console.log("Transpiled code:", result);
      return Promise.resolve({
        success: true,
      });
    default:
      console.warn("Unknown tool call:", toolCall);
      return Promise.resolve({
        success: false,
        error: `Unknown tool call: ${toolCall.toolName}`,
      });
  }
}

export const toolsConfig: ToolSet = {
  setScript: {
    description: "Replace a script of the current layer in the editor",
    parameters: setScriptSchema,
  },
};
