import {
  AppState,
  // ScriptingData,
} from '../types';
import {
  autoBind,
  ComActionHandlers,
  ComMessageEventListener,
  ChannelPost,
} from '../utils/com';
import type Canvas2DLayer from '../layers/Canvas2D/Canvas2DLayer';
import type ThreeJSLayer from '../layers/ThreeJS/ThreeJSLayer';

interface OffscreenCanvas extends HTMLCanvasElement { }

export interface DisplayOptions {
  id?: string;
  canvas?: HTMLCanvasElement;
}

export interface DisplayState extends Omit<Omit<AppState, 'layers'>, 'displays'> {
  id: string;
  readonly control: boolean;
  width: number;
  height: number;
  layers?: Array<Canvas2DLayer | ThreeJSLayer>;
}

// let data: ScriptingData = {
//   iterationCount: 0,
//   now: 0,
//   deltaNow: 0,
//   frequency: [],
//   volume: [],
// };

const handlers: ComActionHandlers = {
  // updatedata: (payload: typeof data) => {
  //   data = payload;
  // },
};

export default class Display {
  static ensureCanvas = (id: string = 'canvas'): HTMLCanvasElement => {
    let el = document.querySelector(`body>#${id}`) as HTMLCanvasElement;
    if (!el) {
      el = document.createElement('canvas');
      el.id = id;
      document.body.appendChild(el);
      document.body.style.margin = '0';
      document.body.style.padding = '0';
      document.body.style.overflow = 'hidden';
    }

    const { style: parentStyle } = el.parentElement as HTMLElement;
    parentStyle.position = 'relative';
    parentStyle.background = 'black';
    return el;
  };

  static checkSupport = () => {
    // @ts-ignore
    if (typeof OffscreenCanvas === 'undefined') return false;
    try {
      const el = document.createElement('canvas');
      // @ts-ignore
      el.transferControlToOffscreen();
    } catch (e) {
      return false;
    }
    return true;
  };

  constructor(options?: DisplayOptions) {
    const {
      id,
      canvas = Display.ensureCanvas(),
    } = options || {};
    this.#id = id || `display${(Math.random() * 10000).toFixed()}`;

    canvas.width = canvas.parentElement?.clientWidth || canvas.width;
    canvas.height = canvas.parentElement?.clientHeight || canvas.height;
    this.#canvas = canvas;

    this.#worker = new Worker(`/DisplayWorker.js#${this.#id}`);
    const { post, listener } = autoBind(this.#worker, `display-${id}-browser`, handlers);
    this.#post = post;
    this.#listener = listener;
    this.#worker.addEventListener('message', this.#listener);

    // @ts-ignore
    this.#offscreen = canvas.transferControlToOffscreen();
    // @ts-ignore
    this.#worker.postMessage({
      type: 'offscreencanvas',
      payload: { canvas: this.#offscreen },
    }, [this.#offscreen]);
    requestAnimationFrame(() => this.resize());
  }

  #offscreen: OffscreenCanvas;

  #worker: Worker;

  #post: ChannelPost;

  #id: string;

  #canvas: HTMLCanvasElement;

  #listener: ComMessageEventListener;

  get canvas() {
    return this.#canvas;
  }

  get state(): Partial<DisplayState> {
    return {
      id: this.#id,
      width: this.#canvas.width,
      height: this.#canvas.height,
    };
  }

  get post(): ChannelPost {
    return this.#post;
  }

  resize = () => requestAnimationFrame(() => {
    const { canvas } = this;
    this.post('resize', {
      width: canvas.parentElement?.clientWidth || this.#canvas.width,
      height: canvas.parentElement?.clientHeight || this.#canvas.height,
    });
  });
}
