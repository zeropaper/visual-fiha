import Layer, { LayerOptions } from './Layer';
import mathTools from '../utils/mathTools';
import miscTools from '../utils/miscTools';
import canvasTools, {
  CTX,
} from './canvasTools';

export interface Canvas2DLayerOptions extends LayerOptions { }

export default class Canvas2DLayer extends Layer {
  constructor(options: Canvas2DLayerOptions) {
    super(options);
    if (!options.id) throw new Error('Missing id option');
    this.#ctx = this.canvas.getContext('2d') as CTX;
    this.api = {
      ...mathTools,
      ...miscTools,
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
