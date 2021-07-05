import { ScriptingData } from '../types';
import {
  autoBind,
  ComActionHandlers,
  ComMessageEventListener,
  ChannelPost,
} from '../utils/com';
import type Canvas2DLayer from '../layers/Canvas2DLayer';

export interface DisplayOptions {
  id?: string;
  canvas?: HTMLCanvasElement;
}

export interface DisplayState {
  id: string;
  width: number;
  height: number;
  layers?: Canvas2DLayer[];
}

let data: ScriptingData = {
  iterationCount: 0,
  now: 0,
  deltaNow: 0,
};

const handlers: ComActionHandlers = {
  updatedata: (payload: typeof data) => {
    data = payload;
  },
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

    const { style: canvasStyle } = el;
    canvasStyle.background = 'black';
    return el;
  };

  constructor(options?: DisplayOptions) {
    const {
      id = `display${(Math.random() * 10000).toFixed()}`,
      canvas = Display.ensureCanvas(),
    } = options || {};
    this.#id = id;
    this.#canvas = canvas;

    this.#worker = new Worker(`/DisplayWorker.js#${id}`);
    const { post, listener } = autoBind(this.#worker, `display-${id}-browser`, handlers);
    this.#post = post;
    this.#listener = listener;
    this.#worker.addEventListener('message', this.#listener);

    this.resize();
    this.#offscreen = canvas.transferControlToOffscreen();
    this.#worker.postMessage({
      action: 'offscreencanvas',
      payload: { canvas: this.#offscreen },
    }, [this.#offscreen]);
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

  get state(): DisplayState {
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
    const rect = canvas.parentElement?.getBoundingClientRect().toJSON();
    if (rect) {
      this.post('resize', {
        width: rect.width,
        height: rect.height,
      });
    }
  });
}
