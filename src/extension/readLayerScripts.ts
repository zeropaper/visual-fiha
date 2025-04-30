import type { LayerInfo, TypeDirectory } from "../types";
import readScripts from "./readScripts";

export default function readLayerScripts(type: keyof typeof TypeDirectory) {
  return async (info: LayerInfo): Promise<LayerInfo> => ({
    ...info,
    ...(await readScripts(type, info.type, info.id)),
  });
}
