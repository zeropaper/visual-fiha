import {
  type ChannelPost,
  type ComActionHandlers,
  type ComMessageEventListener,
  autoBind,
} from "../utils/com";
import DisplayWorker from "./Display.worker.ts?worker";
import type { DisplayOptions, DisplayState } from "./types";

interface OffscreenCanvas extends HTMLCanvasElement {}

const handlers: ComActionHandlers = {};

export default class Display {
  static ensureCanvas = (id = "canvas"): HTMLCanvasElement => {
    // Ensure document.body exists before trying to query or append to it
    if (!document.body) {
      throw new Error(
        "Document body not available. Display must be created after DOM is loaded.",
      );
    }

    let el = document.querySelector(`#${id}`) as HTMLCanvasElement;
    if (!el) {
      el = document.createElement("canvas");
      el.id = id;
      document.body.appendChild(el);
      document.body.style.margin = "0";
      document.body.style.padding = "0";
      document.body.style.overflow = "hidden";
    }

    // Ensure the canvas is in the body
    if (!document.body.contains(el)) {
      document.body.appendChild(el);
    }

    const parentElement = el.parentElement;
    if (parentElement) {
      const { style: parentStyle } = parentElement;
      parentStyle.position = "relative";
      parentStyle.background = "black";
    }
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

    this.#id = id || `display${Date.now()}`;

    canvas.width = canvas.parentElement?.clientWidth ?? canvas.width;
    canvas.height = canvas.parentElement?.clientHeight ?? canvas.height;
    this.#canvas = canvas;

    this.#worker = new DisplayWorker({
      name: this.#id,
    });
    const { post, listener } = autoBind(this.#worker, this.#id, handlers);
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
      [this.#offscreen],
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
      void this.post("resize", size);
    });
}
