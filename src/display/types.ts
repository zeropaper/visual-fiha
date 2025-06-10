import type Canvas2DLayer from "../layers/Canvas2D/Canvas2DLayer";
import type ThreeJSLayer from "../layers/ThreeJS/ThreeJSLayer";
import type { RuntimeData } from "../types";

export interface DisplayOptions {
  id?: string;
  canvas?: HTMLCanvasElement;
}

export interface DisplayState extends Omit<RuntimeData, "layers"> {
  id: string;
  readonly control: boolean;
  layers: Array<Canvas2DLayer | ThreeJSLayer>;
}
