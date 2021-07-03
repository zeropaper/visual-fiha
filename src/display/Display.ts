import { ComEventData } from '../types';

export interface DisplayOptions {
  id?: string;
  canvas?: HTMLCanvasElement;
}

export interface DisplayState {
  id: string;
  width: number;
  height: number;
}

export default class Display {
  static ensureCanvas = (id: string = 'canvas'): HTMLCanvasElement => {
    let el = document.querySelector(`body>#${id}`) as HTMLCanvasElement;
    if (!el) {
      el = document.createElement('canvas');
      el.id = id;
      document.body.appendChild(el);
      document.body.style.margin = '0';
      document.body.style.padding = '0';
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
    this.resize();
    this.#worker = new Worker(`/DisplayWorker.js#${id}`);
    this.#worker.addEventListener('message', this.#handleWorkerMessage);
  }

  #worker: Worker;

  #id: string;

  #canvas: HTMLCanvasElement;

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

  #handleWorkerMessage = (event: MessageEvent<ComEventData>) => {
    console.info('[display] message from worker', event);
  };

  post = (message: ComEventData) => {
    this.#worker.postMessage(message);
  };

  resize = () => {
    const { canvas } = this;
    const rect = canvas.parentElement?.getBoundingClientRect().toJSON();
    if (!rect) return;
    canvas.width = rect.width;
    canvas.height = rect.height;
    this.post({
      action: 'resize',
      payload: {
        width: canvas.width,
        height: canvas.height,
      },
    });
  };
}
