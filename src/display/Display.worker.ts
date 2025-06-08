/**
 * VisualFiha Display Worker
 *
 * This worker is responsible for rendering visual content in a web worker environment.
 * It handles communication with the main thread, manages layers, and executes scripts.
 */
import VFWorker, { type OffscreenCanvas } from "./VFWorker";

import type { Context as AppState, ScriptInfo } from "../types";

import Canvas2DLayer from "../layers/Canvas2D/Canvas2DLayer";
import ThreeJSLayer from "../layers/ThreeJS/ThreeJSLayer";
import type { ScriptRunnerEventListener } from "../utils/ScriptRunner";
import type { ComActionHandlers } from "../utils/com";
import { makeRead } from "../utils/make-read";
import { isDisplayState } from "./isDisplayState";

type LayerType = Canvas2DLayer | ThreeJSLayer;

interface WebWorker extends Worker {
  location: Location;
  name: string;
}

const data = {
  iterationCount: 0,
  now: 0,
  deltaNow: 0,
  frequency: [],
  volume: [],
};

const onExecutionError: ScriptRunnerEventListener = (err: any) => {
  console.error("onExecutionError", err);
  return false;
};
const onCompilationError: ScriptRunnerEventListener = (err: any) => {
  console.error("onCompilationError", err);
  return false;
};

const worker: WebWorker = self as any;

const read = makeRead(data);

const broadcastChannelHandlers = (vfWorker: VFWorker): ComActionHandlers => ({
  scriptchange: async (
    payload: ScriptInfo & {
      script: string;
    },
  ) => {
    const { id, type, role, script } = payload;

    if (type === "worker") {
      vfWorker.scriptable[role].code = script;
      if (role === "setup") {
        Object.assign(data, (await vfWorker.scriptable.execSetup()) || {});
      }
    } else {
      void vfWorker.workerCom.post("scriptchange", payload);
      if (type === "layer") {
        const found = vfWorker.findStateLayer(id);
        if (found != null) {
          found[role].code = script;

          if (role === "setup") {
            void found.execSetup();
          }
        } else {
          console.error("scriptchange layer not found", id);
        }
      }
    }
  },
  updatestate: (update: Partial<AppState>) => {
    const { scriptable, state } = vfWorker;

    const layers = Array.isArray(update.layers)
      ? update.layers
          .map((options) => {
            const found = vfWorker.findStateLayer(options.id);
            if (found != null) {
              found.active = !!options.active;
              return found;
            }
            const completeOptions = {
              ...options,
              read,
              onCompilationError,
              onExecutionError,
            };
            switch (options.type) {
              case "canvas":
                return new Canvas2DLayer(completeOptions);
              case "threejs":
                return new ThreeJSLayer(completeOptions);
              default:
                return null;
            }
          })
          .filter(Boolean)
          .map((layer) => layer && vfWorker.resizeLayer(layer))
      : state.layers;
    const updated = {
      ...state,
      ...update,
      layers,
    };
    if (!isDisplayState(updated)) {
      throw new Error("updatestate: invalid state");
    }
    vfWorker.state = updated;
    if (
      typeof update.worker?.setup !== "undefined" &&
      update.worker.setup !== scriptable.setup.code
    ) {
      scriptable.setup.code = update.worker.setup || scriptable.setup.code;
      state.worker.setup = scriptable.setup.code;

      scriptable.execSetup();
    }
    if (
      typeof update.worker?.animation !== "undefined" &&
      update.worker.animation !== scriptable.animation.code
    ) {
      scriptable.animation.code =
        update.worker.animation || scriptable.animation.code;
      state.worker.animation = scriptable.animation.code;
    }
  },
  updatedata: (payload: typeof data) => {
    Object.assign(data, payload);
    // workerCom.post('updatedata', data);
  },
});

const messageHandlers = (vfWorker: VFWorker): ComActionHandlers => ({
  offscreencanvas: ({ canvas: onscreen }: { canvas: OffscreenCanvas }) => {
    vfWorker.onScreenCanvas = onscreen;

    // TODO: use autoBind
    vfWorker.registerDisplay();
  },
  resize: ({ width, height }: { width: number; height: number }) => {
    const { canvas, broadcastChannelCom, state } = vfWorker;
    vfWorker.state = {
      ...state,
      width: width || state.width,
      height: height || state.height,
    };
    canvas.width = state.width;
    canvas.height = state.height;
    state.layers?.forEach((l) => vfWorker.resizeLayer(l));

    if (!state.control) {
      broadcastChannelCom.post("resizedisplay", {
        id: worker.name,
        width: state.width,
        height: state.height,
      });
    }
  },
});

const displayWorker = new VFWorker(
  worker,
  broadcastChannelHandlers,
  messageHandlers,
);

console.info("displayWorker", displayWorker);
