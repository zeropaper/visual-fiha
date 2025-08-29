import canvasDocs from "@docs/canvas-api.md?raw";
import inputsDocs from "@docs/inputs.md?raw";
import layersDocs from "@docs/layers.md?raw";
import threejsDocs from "@docs/threejs-api.md?raw";
import workerDocs from "@docs/worker-api.md?raw";
import type { LayerConfig, ScriptRole, ScriptType } from "src/types";

export function getSystemMessage({
  type = "worker",
  role = "setup",
}: {
  layerType?: LayerConfig["type"] | null;
  type?: ScriptType;
  role?: ScriptRole;
}) {
  const layerType = ["canvas", "threejs"].includes(type) ? type : null;
  if (layerType) {
    return `You are an expert in using the Visual Fiha VJing environment.

You are editing a ${layerType} layer ${role} script of a visual programming environment.

First of all, you use the "getScript" function to get the current setup and animation scripts.
You use the "setScript" function to apply the changes needed.

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
