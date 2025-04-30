import type { LayerInfo } from "../types";

export function isLayerType(type: any): type is LayerInfo["type"] {
  return [
    "canvas",
    "threejs",
    // , 'canvas2d', 'webgl', 'webgl2'
  ].includes(type);
}
