import Scriptable, { ScriptableOptions } from '../utils/Scriptable';
import mathTools from '../utils/mathTools';
import miscTools from '../utils/miscTools';
import canvasTools, { CTX } from './canvasTools';

export interface Canvas2DLayerOptions extends Omit<ScriptableOptions, 'type, api, id'> {
  id: string;
  canvas?: HTMLCanvasElement | OffscreenCanvas;
}

export default class Canvas2DLayer extends Scriptable {
  constructor(options: Canvas2DLayerOptions) {
    super(options);
    this.#canvas = (options.canvas || new OffscreenCanvas(300, 150)) as OffscreenCanvas;
    this.#ctx = this.#canvas.getContext('2d') as CTX;
    this.api = {
      ...mathTools,
      ...miscTools,
      ...canvasTools(this.#ctx),
      read: this.read,
    };
  }

  #canvas: HTMLCanvasElement | HTMLImageElement | HTMLVideoElement | OffscreenCanvas;

  #ctx: CTX;

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

  drawOn = (dest: HTMLCanvasElement | OffscreenCanvas, measurments: {
    sx?: number;
    sy?: number;
    sw?: number;
    sh?: number;
    dx?: number;
    dy?: number;
    dw?: number;
    dh?: number;
  } = {}) => {
    const {
      sx = 0,
      sy = 0,
      sw = dest.width,
      sh = dest.height,
      dx = 0,
      dy = 0,
      dw = this.width,
      dh = this.height,
    } = measurments;
    dest.getContext('2d')?.drawImage(this.#canvas, dx, dy, dw, dh, sx, sy, sw, sh);
  };
}
