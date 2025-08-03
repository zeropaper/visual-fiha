import type { LayerConfig } from "src/types";

import canvasTypes from "@layers/Canvas2D/canvasTools.editor-types.txt?raw";
import rawThreeBundleTypes from "@layers/ThreeJS/three-bundle.editor-types.txt?raw";
import threeTypes from "@layers/ThreeJS/threeTools.editor-types.txt?raw";

const lines = rawThreeBundleTypes.split("\n");
// wrap the content the `delcare global { namespace Three { } }` to the types
lines[1] = `namespace THREE {
// ----
    ${lines[1]}`;

// add the closing brace to the end
lines[lines.length - 1] = `${lines[lines.length - 1]}
// ----
}`;
const threeBundleTypes = lines.join("\n");

export const extraLibs: Record<
  LayerConfig["type"],
  Record<"setup" | "animation", [string, string][]>
> = {
  canvas: {
    setup: [[canvasTypes, "ts:canvas.d.ts"]],
    animation: [[canvasTypes, "ts:canvas.d.ts"]],
  },
  threejs: {
    setup: [
      [threeTypes, "ts:three.d.ts"],
      [threeBundleTypes, "file://node_modules/@types/three/index.d.ts"],
    ],
    animation: [
      [threeTypes, "ts:three.d.ts"],
      [threeBundleTypes, "file://node_modules/@types/three/index.d.ts"],
    ],
  },
};
