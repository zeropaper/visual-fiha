import { type Layer } from "../types";

export function isLayerType(type: any): type is Layer["type"] {
  return [
    "canvas",
    "threejs",
    // , 'canvas2d', 'webgl', 'webgl2'
  ].includes(type);
}
