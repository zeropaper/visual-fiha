/**
 * VisualFiha Display Worker
 *
 * This worker is responsible for rendering visual content in a web worker environment.
 * It handles communication with the main thread, manages layers, and executes scripts.
 */

import type Layer from "@layers/Layer";
import type { TranspilePayload } from "@utils/tsTranspile";
import Canvas2DLayer from "../layers/Canvas2D/Canvas2DLayer";
import ThreeJSLayer from "../layers/ThreeJS/ThreeJSLayer";
import type { AppState, RuntimeData } from "../types";
import type { ComActionHandlers } from "../utils/com";
import { autoBind } from "../utils/com";
import { clearAssetsCache, makeRead } from "../utils/make-read";
import mathTools from "../utils/mathTools";
import type {
  ScriptableCompilationSuccessEvent,
  ScriptableErrorEvent,
  ScriptableEventListener,
} from "../utils/Scriptable";
import Scriptable, { type ScriptableOptions } from "../utils/Scriptable";
import type { DisplayState } from "./types";

interface WebWorker extends Worker {
  location: Location;
  name: string;
}

// Module-level state variables (previously VFWorker class properties)
const defaultStage = {
  width: 600,
  height: 400,
  backgroundColor: "#000000",
};

const workerSelf: WebWorker = self as any;
const workerName = workerSelf.name;
if (!workerName) throw new Error("[worker] worker is not ready");

const displayState = {
  id: "display-worker",
  control: false,
  layers: [] as DisplayState["layers"],
} as DisplayState;

const data = {} as RuntimeData;

// Worker state
let state: DisplayState = {
  stage: defaultStage,
  control: !!workerSelf.name.startsWith("controls-"),
  id: workerName,
  layers: displayState.layers,
  audio: {},
  time: { started: 0, elapsed: 0, duration: 0, percent: 0, isRunning: false },
  bpm: {
    bpm: 120,
    started: 0,
    elapsed: 0,
    isRunning: false,
    percent: 0,
    count: 0,
  },
  midi: {},
  worker: { setup: "", animation: "" },
  assets: [] satisfies DisplayState["assets"],
};

// Canvas and rendering context
const canvas = new OffscreenCanvas(
  state.stage.width || 300,
  state.stage.height || 200,
);
const context = canvas.getContext("2d");
let onScreenCanvas: OffscreenCanvas | null = null;

// Broadcast channel for communication
const coreChannel = new BroadcastChannel("core");

// Scriptable setup and error handlers
clearAssetsCache();
const read = makeRead(data);
const makeErrorHandler = (type: string) => (event: any) => {
  console.warn("[worker]", type, event);
};

const onExecutionError: ScriptableEventListener<ScriptableErrorEvent> = (
  original,
) => {
  const event = { ...original, workerName };
  // console.warn("onExecutionError", event);
  broadcastChannelCom.post("executionerror", event);
};
const onCompilationError: ScriptableEventListener<ScriptableErrorEvent> = (
  original,
) => {
  const event = { ...original, workerName };
  // console.warn("onCompilationError", event);
  broadcastChannelCom.post("compilationerror", event);
};
const onCompilationSuccess: ScriptableEventListener<
  ScriptableCompilationSuccessEvent
> = (original) => {
  const event = { ...original, workerName };
  // console.info("onCompilationSuccess", event);
  broadcastChannelCom.post("compilationsuccess", event);
};

const scriptableOptions: ScriptableOptions = {
  id: "worker",
  api: { ...mathTools, read },
  read,
  onCompilationError: makeErrorHandler("compilation"),
  onExecutionError: makeErrorHandler("execution"),
};

const scriptable = new Scriptable(scriptableOptions);

// =============================================================================
// Helper Functions
// =============================================================================

function resizeLayer(layer: Layer) {
  layer.width = canvas.width;
  layer.height = canvas.height;
  layer.execSetup().catch((err) => {
    console.error("resizeLayer execSetup error", err);
  });
  return layer;
}

function registerDisplay() {
  if (onScreenCanvas == null) return;
  coreChannel.postMessage({
    type: "registerdisplay",
    payload: {
      id: workerName,
      width: onScreenCanvas.width,
      height: onScreenCanvas.height,
    },
  });
}

// =============================================================================
// Layer Management
// =============================================================================

function processLayers(updateLayers: AppState["layers"]) {
  const updateLayerIds = new Set(updateLayers.map((l) => l.id));

  for (const options of updateLayers) {
    const found = state.layers.find((layer) => layer.id === options.id);
    let layer: Layer | null = null;
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
        resizeLayer(layer);
        state.layers.push(layer);
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
      continue;
    }

    layer.active = !!options.active;
    layer.opacity = options.opacity ?? 100;
  }

  // Remove layers that are no longer present in the update
  state.layers = state.layers.filter((layer) => {
    if (!updateLayerIds.has(layer.id)) {
      // Layer was removed - clean up if necessary
      if ("dispose" in layer && typeof layer.dispose === "function") {
        try {
          layer.dispose();
        } catch (err) {
          console.error(`Error disposing layer ${layer.id}:`, err);
        }
      }
      return false;
    }
    return true;
  });

  // sort the state.layers based on the order in updateLayers
  state.layers.sort((a, b) => {
    const indexA = updateLayers.findIndex((l) => l.id === a.id);
    const indexB = updateLayers.findIndex((l) => l.id === b.id);
    return indexA - indexB;
  });
}

// =============================================================================
// Message Handlers
// =============================================================================

async function getImageFromCanvas(cns: OffscreenCanvas) {
  const blob = await cns.convertToBlob();
  if (!blob) {
    throw new Error("Failed to convert canvas to blob");
  }
  const reader = new FileReader();

  return new Promise<string>((resolve, reject) => {
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = (error) => {
      console.error(
        "[display worker] takeLayerScreenshot FileReader error:",
        error,
      );
      reject(error);
    };
    reader.readAsDataURL(blob);
  });
}

const broadcastChannelHandlers: ComActionHandlers = {
  transpiled: async (payload: TranspilePayload) => {
    const { id, type, role, code } = payload;
    if (type === "worker") {
      scriptable[role as "setup" | "animation"].code = code;
      if (role === "setup") {
        Object.assign(data, (await scriptable.execSetup()) || {});
      }
      return;
    }

    const found = state.layers?.find((layer) => layer.id === id);
    if (!found) {
      console.warn("[display worker] transpiled layer not found", id);
      return;
    }
    found[role as "setup" | "animation"].code = code;

    if (role === "setup") {
      void found.execSetup();
    }
  },

  updateconfig: (update: Partial<AppState>) => {
    state = {
      ...state,
      ...update,
      layers: state.layers || [],
    } satisfies DisplayState;

    if (Array.isArray(update.layers)) {
      processLayers(update.layers);
    }

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
    for (const layer of state.layers) {
      // get a copy of the layer's canvas and add it to the assets as a layer type
      data.assets.push({
        id: layer.id,
        source: "layer",
        canvas: layer.canvas,
      });
    }
  },

  registerdisplaycallback: (payload: { id: string }) => {
    if (payload.id !== workerName) {
      return;
    }
    processLayers(data.layers || []);
  },

  takeLayerScreenshot: (payload: { layerId: string; displayName: string }) => {
    if (!payload.displayName || payload.displayName !== workerName) {
      return;
    }
    if (!payload.layerId) {
      return getImageFromCanvas(canvas);
    }
    const layer = state.layers?.find((layer) => layer.id === payload.layerId);
    if (!layer) {
      console.warn(
        "[display worker] takeLayerScreenshot: layer not found",
        payload.layerId,
      );
      return;
    }

    return getImageFromCanvas(layer.canvas);
  },

  clearAssetsCache: () => {
    clearAssetsCache();
  },
};

const messageHandlers: ComActionHandlers = {
  offscreencanvas: ({ canvas: onscreen }: { canvas: OffscreenCanvas }) => {
    onScreenCanvas = onscreen;
    // Start the render loop now that we have the canvas
    if (!renderStarted) {
      renderStarted = true;
      render();
    }

    // TODO: use autoBind
    registerDisplay();
  },
  resize: ({ width, height }: { width: number; height: number }) => {
    state = {
      ...state,
      stage: {
        ...state.stage,
        width: width || state.stage.width,
        height: height || state.stage.height,
      },
    };
    canvas.width = state.stage.width;
    canvas.height = state.stage.height;
    state.layers?.forEach((l) => {
      resizeLayer(l);
    });

    if (!state.control) {
      coreChannel.postMessage({
        type: "resizedisplay",
        payload: {
          id: workerName,
          width: state.stage.width,
          height: state.stage.height,
        },
      });
    }
  },
};

// =============================================================================
// Rendering Functions
// =============================================================================

// Flag to track if render loop has started and layers are available
let renderStarted = false;
let layersInitialized = false;
const renderLogCounter = 0;

function renderLayers() {
  if (!context) return;
  context.clearRect(0, 0, canvas.width, canvas.height);
  if (!Array.isArray(state.layers)) {
    return;
  }

  // Log once when layers become available
  if (!layersInitialized && state.layers.length > 0) {
    layersInitialized = true;
  }

  state.layers.forEach((layer) => {
    if (!layer.active) return;
    layer.execAnimation();
    context.globalAlpha = Math.max(0, Math.min(1, layer.opacity * 0.01));
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
}

function render() {
  Object.assign(displayState, scriptable.execAnimation() || {});

  if (context && onScreenCanvas != null) {
    renderLayers();

    onScreenCanvas.height = canvas.height;
    onScreenCanvas.width = canvas.width;
    const ctx = onScreenCanvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(
        canvas,
        0,
        0,
        onScreenCanvas.width,
        onScreenCanvas.height,
        0,
        0,
        canvas.width,
        canvas.height,
      );
    }
  }

  requestAnimationFrame(() => {
    render();
  });
}

// =============================================================================
// Communication Setup & Initialization
// =============================================================================

// Initialize communication
const broadcastChannelCom = autoBind(
  coreChannel,
  `${workerName}-broadcastChannel`,
  broadcastChannelHandlers,
);
coreChannel.onmessage = broadcastChannelCom.listener;

const workerCom = autoBind(
  workerSelf,
  `display-${workerName}-worker`,
  messageHandlers,
);
workerSelf.addEventListener("message", workerCom.listener);

// =============================================================================
// Worker Initialization
// =============================================================================

scriptable
  .execSetup()
  .then(() => {
    // Don't start render loop yet - wait for offscreencanvas message
    if (onScreenCanvas !== null) {
      if (!renderStarted) {
        renderStarted = true;
        render();
      }
    }
  })
  .catch(() => {
    console.error("[Display.worker] Cannot run worker initial setup");
  });
