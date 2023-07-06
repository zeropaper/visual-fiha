/* eslint-disable @typescript-eslint/ban-ts-comment */
import { type AppState } from "../types";
import {
  autoBind,
  type ComActionHandlers,
  type ComMessageEventListener,
  type ChannelPost,
} from "../utils/com";
import type Canvas2DLayer from "../layers/Canvas2D/Canvas2DLayer";
import type ThreeJSLayer from "../layers/ThreeJS/ThreeJSLayer";

interface OffscreenCanvas extends HTMLCanvasElement {}

export interface DisplayOptions {
  id?: string;
  canvas?: HTMLCanvasElement;
}

export interface DisplayState
  extends Omit<Omit<AppState, "layers">, "displays"> {
  id: string;
  readonly control: boolean;
  width: number;
  height: number;
  layers?: Array<Canvas2DLayer | ThreeJSLayer>;
}

const handlers: ComActionHandlers = {};

export default class Display {
  static ensureCanvas = (id: string = "canvas"): HTMLCanvasElement => {
    let el = document.querySelector(`body>#${id}`) as HTMLCanvasElement;
    if (!el) {
      el = document.createElement("canvas");
      el.id = id;
      document.body.appendChild(el);
      document.body.style.margin = "0";
      document.body.style.padding = "0";
      document.body.style.overflow = "hidden";
    }

    const { style: parentStyle } = el.parentElement as HTMLElement;
    parentStyle.position = "relative";
    parentStyle.background = "black";
    return el;
  };

  static checkSupport = () => {
    if (typeof OffscreenCanvas === "undefined") return false;
    try {
      const el = document.createElement("canvas");
      el.transferControlToOffscreen();
    } catch (e) {
      return false;
    }
    return true;
  };

  constructor(options?: DisplayOptions) {
    const { id, canvas = Display.ensureCanvas() } = options ?? {};
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    this.#id = id || `display${(Math.random() * 10000).toFixed()}`;

    canvas.width = canvas.parentElement?.clientWidth ?? canvas.width;
    canvas.height = canvas.parentElement?.clientHeight ?? canvas.height;
    this.#canvas = canvas;

    this.#worker = new Worker(`/Display.worker.js#${this.#id}`);
    const { post, listener } = autoBind(
      this.#worker,
      `display-${this.#id}-browser`,
      handlers
    );
    this.#post = post;
    this.#listener = listener;
    this.#worker.addEventListener("message", this.#listener);

    // @ts-expect-error
    this.#offscreen = canvas.transferControlToOffscreen();
    this.#worker.postMessage(
      {
        type: "offscreencanvas",
        payload: { canvas: this.#offscreen },
      },
      // @ts-expect-error
      [this.#offscreen]
    );
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

  resize = () =>
    requestAnimationFrame(() => {
      const { canvas } = this;
      const size = {
        width: canvas.parentElement?.clientWidth ?? this.#canvas.width,
        height: canvas.parentElement?.clientHeight ?? this.#canvas.height,
      };
      console.info("[display] resize", !!canvas.parentElement, size);
      void this.post("resize", size);
    });
}
