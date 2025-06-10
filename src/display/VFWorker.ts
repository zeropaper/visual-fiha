/**
 * VisualFiha Display Worker Rendering Class
 *
 * This class is designed to render visual content in a web worker environment.
 *
 */
import { autoBind } from "../utils/com";
import type { ChannelBindings, ComActionHandlers } from "../utils/com";

import type { DisplayState } from "./types";

import type Canvas2DLayer from "../layers/Canvas2D/Canvas2DLayer";
import type ThreeJSLayer from "../layers/ThreeJS/ThreeJSLayer";
import Scriptable, { type ScriptableOptions } from "../utils/Scriptable";
import { makeRead } from "../utils/make-read";
import * as mathTools from "../utils/mathTools";

export interface OffscreenCanvas extends HTMLCanvasElement {}
interface OffscreenCanvasRenderingContext2D extends CanvasRenderingContext2D {}

interface WebWorker extends Worker {
  location: Location;
  name: string;
}

const defaultStage = {
  width: 600,
  height: 400,
  backgroundColor: "#000000",
};

const displayState = {
  id: "display-worker",
  control: false,
  layers: [] as DisplayState["layers"],
} as DisplayState;

const worker: WebWorker = self as any;

const read = makeRead(displayState);
const makeErrorHandler =
  (type: string) =>
  (event: any): any => {
    console.warn("[worker]", type, event);
  };
const scriptableOptions: ScriptableOptions = {
  id: "worker",
  api: { ...mathTools, read },
  read,
  onCompilationError: makeErrorHandler("compilation"),
  onExecutionError: makeErrorHandler("execution"),
};
const workerName = worker.name;
if (!workerName) throw new Error("[worker] worker is not ready");

export default class VFWorker {
  constructor(
    workerSelf: WebWorker,
    broadcastChannelHandlers: (instance: VFWorker) => ComActionHandlers,
    messageHandlers: (instance: VFWorker) => ComActionHandlers,
  ) {
    this.#worker = workerSelf;

    this.state = {
      stage: defaultStage,
      control: !!this.#worker.name.startsWith("controls-"),
      id: workerName,
      layers: displayState.layers,
    } as DisplayState;
    this.scriptable = new Scriptable(scriptableOptions);

    // @ts-ignore
    this.canvas = new OffscreenCanvas(
      this.state.stage.width || 300,
      this.state.stage.height || 200,
    );
    this.#context = this.canvas.getContext(
      "2d",
    ) as OffscreenCanvasRenderingContext2D;

    // this.#broadcastChannel = new BroadcastChannel(`display-${workerName}`);
    this.#broadcastChannel = new BroadcastChannel("core");

    this.broadcastChannelCom = autoBind(
      {
        postMessage: (message: any) => {
          // console.info("broadcastChannelCom postMessage", message);
          // this.#broadcastChannel.emit("message", message);
        },
      },
      `display-${workerName}-broadcastChannel`,
      broadcastChannelHandlers(this),
    );

    this.#broadcastChannel.onmessage = this.broadcastChannelCom.listener;

    this.workerCom = autoBind(
      this.#worker,
      `display-${workerName}-worker`,
      messageHandlers(this),
    );
    worker.addEventListener("message", this.workerCom.listener);

    try {
      this.scriptable
        .execSetup()
        .then(() => {
          this.render();
        })
        .catch(() => {
          console.error("Cannot run worker initial setup");
        });
    } catch (e) {
      console.error(e);
    }
  }

  #worker: WebWorker;

  #broadcastChannel: BroadcastChannel;

  broadcastChannelCom: ChannelBindings;

  workerCom: ChannelBindings;

  scriptable: Scriptable;

  canvas: OffscreenCanvas;

  onScreenCanvas: OffscreenCanvas | null = null;

  #context: OffscreenCanvasRenderingContext2D;

  state: DisplayState;

  registerDisplay() {
    if (this.onScreenCanvas == null) return;
    this.#broadcastChannel.postMessage({
      type: "registerdisplay",
      payload: {
        id: workerName,
        width: this.onScreenCanvas.width,
        height: this.onScreenCanvas.height,
      },
    });
  }

  resizeLayer(layer: Canvas2DLayer | ThreeJSLayer) {
    layer.width = this.canvas.width;

    layer.height = this.canvas.height;

    layer.execSetup().catch((err) => {
      console.error("resizeLayer execSetup error", err);
    });
    return layer;
  }

  findStateLayer(id: string) {
    return this.state.layers?.find((layer) => id === layer.id);
  }

  renderLayers = () => {
    const { canvas } = this;
    const context = this.#context;
    if (!context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    if (!Array.isArray(this.state.layers)) {
      return;
    }
    this.state.layers.forEach((layer) => {
      if (!layer.active) return;
      layer.execAnimation();
      context.drawImage(
        layer.canvas,
        0,
        0,
        layer.canvas.width,
        layer.canvas.height,
        0,
        0,
        canvas.width,
        canvas.height,
      );
    });
  };

  render() {
    Object.assign(displayState, this.scriptable.execAnimation() || {});

    if (this.#context && this.onScreenCanvas != null) {
      this.renderLayers();

      this.onScreenCanvas.height = this.canvas.height;
      this.onScreenCanvas.width = this.canvas.width;
      const ctx = this.onScreenCanvas.getContext(
        "2d",
      ) as OffscreenCanvasRenderingContext2D;
      ctx.drawImage(
        this.canvas,
        0,
        0,
        this.onScreenCanvas.width,
        this.onScreenCanvas.height,
        0,
        0,
        this.canvas.width,
        this.canvas.height,
      );
    }

    requestAnimationFrame(() => {
      this.render();
    });
  }
}
