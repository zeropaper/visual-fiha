import Scriptable, { ScriptableOptions } from '../utils/Scriptable';
import mathTools from '../utils/mathTools';
import miscTools from '../utils/miscTools';
import canvasTools, {
  CTX,
  // ImageCopyCoordinates,
} from './canvasTools';
import type { DisplayState } from '../display/Display';

export interface Canvas2DLayerOptions extends Omit<ScriptableOptions, 'type, api, id'> {
  id: string;
  display: DisplayState & {
    canvas: HTMLCanvasElement | OffscreenCanvas;
  },
  canvas?: HTMLCanvasElement | OffscreenCanvas;
}

// interface CopyInterface {
//   (dest: HTMLCanvasElement | OffscreenCanvas, opts?: ImageCopyCoordinates): void
// }

// type DisplayStateWithCanvas = DisplayState & {
//   canvas: HTMLCanvasElement | OffscreenCanvas
// };

export default class Canvas2DLayer extends Scriptable {
  constructor(options: Canvas2DLayerOptions) {
    super(options);
    this.#canvas = (options.canvas || new OffscreenCanvas(600, 400)) as OffscreenCanvas;
    this.#ctx = this.#canvas.getContext('2d') as CTX;
    this.api = {
      ...mathTools,
      ...miscTools,
      ...canvasTools(this.#ctx),
      read: this.read,
    };

    // this.#display = options.display;
    // this.#displayCtx = this.#display.canvas.getContext('2d')!;
    // const tools = canvasTools(this.#displayCtx);
    // this.cover = (dest, opts = {}) => tools
    //   .pasteCover(this.#canvas, opts);
    // this.contain = (dest, opts = {}) => tools
    //   .pasteContain(this.#canvas, opts);
    // this.drawOn = (dest, opts = {}) => tools
    //   .pasteImage(this.#canvas, opts);
  }

  #canvas: HTMLCanvasElement | HTMLImageElement | HTMLVideoElement | OffscreenCanvas;

  #ctx: CTX;

  // #display: DisplayStateWithCanvas;

  // #displayCtx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

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

  // set display(display: any) {
  //   this.#display = display;
  //   this.#displayCtx = this.#display.canvas.getContext('2d')!;
  //   const tools = canvasTools(this.#displayCtx);
  //   this.cover = (dest, opts = {}) => tools
  //     .pasteCover(this.#canvas, opts);
  //   this.contain = (dest, opts = {}) => tools
  //     .pasteContain(this.#canvas, opts);
  //   this.drawOn = (dest, opts = {}) => tools
  //     .pasteImage(this.#canvas, opts);
  // }

  // cover: CopyInterface;

  // contain: CopyInterface;

  // drawOn: CopyInterface;

  // // drawOn = (dest: HTMLCanvasElement | OffscreenCanvas, opts: ImageCopyCoordinates = {}) => {
  // //   const {
  // //     sx = 0,
  // //     sy = 0,
  // //     sw = dest.width,
  // //     sh = dest.height,
  // //     dx = 0,
  // //     dy = 0,
  // //     dw = this.width,
  // //     dh = this.height,
  // //   } = opts;
  // //   dest.getContext('2d')?.drawImage(this.#canvas, dx, dy, dw, dh, sx, sy, sw, sh);
  // // };
}
