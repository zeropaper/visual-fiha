import Layer, { LayerOptions } from '../Layer';
import * as mathTools from '../../utils/mathTools';
import miscTools from '../../utils/miscTools';
import * as assetTools from '../../utils/assetTools';
import canvasTools, {
  CTX,
} from './canvasTools';

export interface Canvas2DLayerOptions extends LayerOptions { }

export default class Canvas2DLayer extends Layer {
  constructor(options: Canvas2DLayerOptions) {
    super(options);
    this.#ctx = this.canvas.getContext('2d') as CTX;
    this.api = {
      ...mathTools,
      ...miscTools,
      ...assetTools,
      ...canvasTools(this.#ctx),
      ...super.api,
    };
    this.execSetup();
  }

  #ctx: CTX;

  get context() {
    return this.#ctx;
  }
}
