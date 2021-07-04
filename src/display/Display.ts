import { ScriptingData } from '../types';
import {
  autoBind,
  ComActionHandlers,
  ComMessageEventListener,
  MessengerPoster,
} from '../utils/com';

export interface DisplayOptions {
  id?: string;
  canvas?: HTMLCanvasElement;
}

export interface DisplayState {
  id: string;
  width: number;
  height: number;
}

let data: ScriptingData = {
  iterationCount: 0,
  now: 0,
  deltaNow: 0,
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
    // canvasStyle.position = 'absolute';
    // canvasStyle.zIndex = '10';
    // canvasStyle.top = '0';
    // canvasStyle.right = '0';
    // canvasStyle.bottom = '0';
    // canvasStyle.left = '0';
    // canvasStyle.background = 'black';
    // canvasStyle.width = 'auto';
    // canvasStyle.height = 'auto';
    return el;
  };

  constructor(options?: DisplayOptions) {
    const {
      id = (Math.random() * 1000).toFixed(),
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
  }

  #worker: Worker;

  #post: MessengerPoster;

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

  get post(): MessengerPoster {
    return this.#post;
  }

  resize = () => requestAnimationFrame(() => {
    const { canvas } = this;
    const rect = canvas.parentElement?.getBoundingClientRect().toJSON();
    if (!rect) return;
    canvas.width = rect.width;
    canvas.height = rect.height;

    this.post('resize', {
      width: canvas.width,
      height: canvas.height,
    });
  });
}
