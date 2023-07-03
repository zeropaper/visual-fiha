import { type Layer } from "../types";
import { isLayerType } from "./isLayerType";

export function isLayer(layer: unknown): layer is Layer {
  return (
    (layer as Layer).active !== undefined &&
    (layer as Layer).id !== undefined &&
    isLayerType((layer as Layer).type)
  );
}
