import Scriptable, { type ScriptableOptions } from "../utils/Scriptable";

interface OffscreenCanvas extends HTMLCanvasElement {}

export interface LayerOptions extends Omit<ScriptableOptions, "type, api, id"> {
  id: string;
  canvas?: HTMLCanvasElement | OffscreenCanvas;
  active?: boolean;
  opacity?: number; // Opacity in percent (0-100)
}

export default class Layer extends Scriptable {
  constructor(options: LayerOptions) {
    super(options);
    this.active = typeof options.active !== "undefined" ? options.active : true;
    this.opacity = typeof options.opacity === "number" ? options.opacity : 100;
    if (!options.id) throw new Error("Missing id option");
    this.#canvas = (
      options.canvas != null ? options.canvas : new OffscreenCanvas(600, 400)
    ) as OffscreenCanvas;
  }

  active = true;
  opacity = 100;

  #canvas: HTMLCanvasElement | OffscreenCanvas;

  get canvas() {
    return this.#canvas;
  }

  get width() {
    return this.#canvas.width;
  }

  set width(val) {
    const canvas = this.#canvas;
    canvas.width = val;
  }

  get height() {
    return this.#canvas.height;
  }

  set height(val) {
    const canvas = this.#canvas;
    canvas.height = val;
  }

  execAnimation = () => {
    if (!this.active) return;
    this.animation.exec();
  };
}
