import * as assetTools from "../../utils/assetTools";
import * as mathTools from "../../utils/mathTools";
import miscTools from "../../utils/miscTools";
import Layer, { type LayerOptions } from "../Layer";
import canvasTools, { type CTX } from "./canvasTools";

export interface Canvas2DLayerOptions extends LayerOptions {}

export default class Canvas2DLayer extends Layer {
  readonly type = "canvas";

  constructor(options: Canvas2DLayerOptions) {
    super(options);
    this.#ctx = this.canvas.getContext("2d") as CTX;
    this.api = {
      ...mathTools,
      ...miscTools,
      ...assetTools,
      ...canvasTools(this.#ctx),
      ...super.api,
    };
  }

  #ctx: CTX;

  get context() {
    return this.#ctx;
  }
}
