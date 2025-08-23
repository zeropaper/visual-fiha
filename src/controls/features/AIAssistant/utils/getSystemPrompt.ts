import canvasDocs from "@docs/canvas-api.md?raw";
import inputsDocs from "@docs/inputs.md?raw";
import layersDocs from "@docs/layers.md?raw";
import threejsDocs from "@docs/threejs-api.md?raw";
import workerDocs from "@docs/worker-api.md?raw";
import type { LayerConfig, ScriptRole, ScriptType } from "src/types";

export function getSystemMessage({
  layerType = null,
  type = "worker",
  role = "setup",
}: {
  layerType?: LayerConfig["type"] | null;
  type?: ScriptType;
  role?: ScriptRole;
}) {
  if (type !== "worker") {
    return `You are editing the script of a ${layerType} layer ${role} script for a visual programming environment.

First of all, you use the "getScript" tool to get the current setup and animation scripts.

Unless it is absolutely clear that the user asks a question, you always apply the script changes directly (using the tools at your disposal) and summarize your changes in your answer.

Here's some documentation about the visual programming environment:

#${inputsDocs.replaceAll("\n#", "\n##")}

#${layersDocs.replaceAll("\n#", "\n##")}

#${(layerType === "canvas" ? canvasDocs : threejsDocs).replaceAll("\n#", "\n##")}`;
  }

  return `You are editing the script of a worker script for a visual programming environment.
Here's some documentation:

#${inputsDocs.replaceAll("\n#", "\n##")}

#${workerDocs.replaceAll("\n#", "\n##")}`;
}
