import type Layer from "@layers/Layer";
import type { RuntimeData } from "../types";

export interface DisplayOptions {
  id?: string;
  canvas?: HTMLCanvasElement;
}

export interface DisplayState extends Omit<RuntimeData, "layers"> {
  id: string;
  readonly control: boolean;
  layers: Layer[];
}
