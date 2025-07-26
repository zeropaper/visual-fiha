/**
 * VisualFiha Display Worker
 *
 * This worker is responsible for rendering visual content in a web worker environment.
 * It handles communication with the main thread, manages layers, and executes scripts.
 */
import VFWorker, { type OffscreenCanvas } from "./VFWorker";

import type { AppState, RuntimeData } from "../types";

import type { TranspilePayload } from "../controls/types";
import Canvas2DLayer from "../layers/Canvas2D/Canvas2DLayer";
import ThreeJSLayer from "../layers/ThreeJS/ThreeJSLayer";
import type { ScriptableEventListener } from "../utils/Scriptable";
import type { ComActionHandlers } from "../utils/com";
import { makeRead } from "../utils/make-read";
import { isDisplayState } from "./isDisplayState";

interface WebWorker extends Worker {
  location: Location;
  name: string;
}

const data = {} as RuntimeData;

const onExecutionError: ScriptableEventListener = (event) => {
  // console.warn("onExecutionError", event);
};
const onCompilationError: ScriptableEventListener = (event) => {
  // console.warn("onCompilationError", event);
};

const onCompilationSuccess: ScriptableEventListener = (event) => {
  // console.info("onCompilationSuccess", event);
};

const worker: WebWorker = self as any;

const read = makeRead(data);

function processLayers(vfWorker: VFWorker, updateLayers: AppState["layers"]) {
  // console.info("[display worker] processing layers", updateLayers);
  for (const options of updateLayers) {
    const found = vfWorker.findStateLayer(options.id);
    let layer: Canvas2DLayer | ThreeJSLayer | null = null;
    if (!found) {
      const completeOptions = {
        ...options,
        read,
        onCompilationError,
        onExecutionError,
        onCompilationSuccess,
      };
      switch (options.type) {
        case "canvas":
          layer = new Canvas2DLayer(completeOptions);
          break;
        case "threejs":
          layer = new ThreeJSLayer(completeOptions);

          break;
        default:
          console.warn(`[display worker] Layer type is not supported`, options);
          break;
      }
      if (layer) {
        vfWorker.state.layers.push(layer);
        vfWorker.resizeLayer(layer);
      }
    } else {
      layer = found;
    }
    if (!layer) {
      continue;
    }
    if (layer.type !== options.type) {
      console.warn(
        `[display worker] Layer type mismatch for ${layer.id}: expected "${layer.type}", got "${options.type}"`,
      );
      return null;
    }
    layer.active = !!options.active;
    layer.opacity = options.opacity ?? 100;
  }

  // sort the vfWorker.state.layers based on the order in updateLayers
  vfWorker.state.layers.sort((a, b) => {
    const indexA = updateLayers.findIndex((l) => l.id === a.id);
    const indexB = updateLayers.findIndex((l) => l.id === b.id);
    return indexA - indexB;
  });
}

const broadcastChannelHandlers = (vfWorker: VFWorker): ComActionHandlers => ({
  transpiled: async (payload: TranspilePayload) => {
    const { id, type, role, code } = payload;
    if (type === "worker") {
      vfWorker.scriptable[role].code = code;
      if (role === "setup") {
        Object.assign(data, (await vfWorker.scriptable.execSetup()) || {});
      }
      return;
    }

    const found = vfWorker.findStateLayer(id);
    if (!found) {
      console.warn("[display worker] transpiled layer not found", id);
      return;
    }
    found[role].code = code;

    if (role === "setup") {
      void found.execSetup();
    }
  },

  updateconfig: (update: Partial<AppState>) => {
    const { scriptable, state } = vfWorker;
    const updated = {
      ...state,
      ...update,
      layers: state.layers || update.layers || [],
    };
    if (Array.isArray(update.layers)) {
      processLayers(vfWorker, update.layers);
    }
    if (!isDisplayState(updated)) {
      throw new Error("updateconfig: invalid state");
    }
    vfWorker.state = updated;
    state.worker = state.worker || {};
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

  runtimedata: (payload: RuntimeData) => {
    Object.assign(data, payload);
  },

  registerdisplaycallback: (payload: {
    id: string;
  }) => {
    if (payload.id !== worker.name) {
      return;
    }
    processLayers(vfWorker, data.layers || []);
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
      stage: {
        ...state.stage,
        width: width || state.stage.width,
        height: height || state.stage.height,
      },
    };
    canvas.width = state.stage.width;
    canvas.height = state.stage.height;
    state.layers?.forEach((l) => vfWorker.resizeLayer(l));

    if (!state.control) {
      broadcastChannelCom.post("resizedisplay", {
        id: worker.name,
        width: state.stage.width,
        height: state.stage.height,
      });
    }
  },
});

const displayWorker = new VFWorker(
  worker,
  broadcastChannelHandlers,
  messageHandlers,
);
