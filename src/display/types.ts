import type Canvas2DLayer from "../layers/Canvas2D/Canvas2DLayer";
import type ThreeJSLayer from "../layers/ThreeJS/ThreeJSLayer";
import type { Context as AppState } from "../types";

export interface DisplayOptions {
  id?: string;
  canvas?: HTMLCanvasElement;
}

export interface DisplayState
  extends Omit<Omit<AppState, "layers">, "displays"> {
  id: string;
  readonly control: boolean;
  width: number;
  height: number;
  layers?: Array<Canvas2DLayer | ThreeJSLayer>;
}
