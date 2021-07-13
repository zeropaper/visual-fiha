import Scriptable, { ScriptableOptions } from '../utils/Scriptable';
import mathTools from '../utils/mathTools';
import miscTools from '../utils/miscTools';
import canvasTools, {
  CTX,
} from './canvasTools';
// import type { DisplayState } from '../display/Display';

export interface Canvas2DLayerOptions extends Omit<ScriptableOptions, 'type, api, id'> {
  id: string;
  canvas?: HTMLCanvasElement | OffscreenCanvas;
}

export default class Canvas2DLayer extends Scriptable {
  constructor(options: Canvas2DLayerOptions) {
    super(options);
    if (!options.id) throw new Error('Missing id option');
    this.#canvas = (options.canvas || new OffscreenCanvas(600, 400)) as OffscreenCanvas;
    this.#ctx = this.#canvas.getContext('2d') as CTX;
    this.api = {
      ...mathTools,
      ...miscTools,
      ...canvasTools(this.#ctx),
      ...super.api,
    };
    this.execSetup();
  }

  #canvas: HTMLCanvasElement | HTMLImageElement | HTMLVideoElement | OffscreenCanvas;

  #ctx: CTX;

  get context() {
    return this.#ctx;
  }

  get canvas() {
    return this.#canvas;
  }

  get imageData() {
    return this.#ctx.getImageData(0, 0, this.width, this.height);
  }

  get width() {
    return this.#canvas.width as number;
  }

  set width(val) {
    const canvas = this.#canvas;
    canvas.width = val;
  }

  get height() {
    return this.#canvas.height as number;
  }

  set height(val) {
    const canvas = this.#canvas;
    canvas.height = val;
  }
}
