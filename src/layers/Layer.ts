import Scriptable, { ScriptableOptions } from '../utils/Scriptable';

export interface LayerOptions extends Omit<ScriptableOptions, 'type, api, id'> {
  id: string;
  canvas?: HTMLCanvasElement | OffscreenCanvas;
  active?: boolean;
}

export default class Layer extends Scriptable {
  constructor(options: LayerOptions) {
    super(options);
    if (!options.id) throw new Error('Missing id option');
    this.#canvas = (options.canvas || new OffscreenCanvas(600, 400)) as OffscreenCanvas;
    this.execSetup();
  }

  #canvas: HTMLCanvasElement | OffscreenCanvas;

  get canvas() {
    return this.#canvas;
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
