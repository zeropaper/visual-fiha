import type {
  AppState,
  AssetConfig,
  LayerConfig,
  LayerConfigBase,
  RuntimeData,
} from "../types";
import type { ComActionHandlers } from "../utils/com";
import { clearAssetsCache, makeRead } from "../utils/make-read";
import type Scriptable from "../utils/Scriptable";
import type ScriptRunner from "../utils/ScriptRunner";
import type { TranspilePayload } from "../utils/tsTranspile";
import type { DisplayState } from "./types";

const defaultStage = {
  width: 600,
  height: 400,
  backgroundColor: "#000000",
};

// Structural interfaces so the factory has no hard dependency on OffscreenCanvas
// or concrete Layer/Scriptable classes. Enables node-environment testing.

export interface ContextLike {
  clearRect(x: number, y: number, w: number, h: number): void;
  globalAlpha: number;
  drawImage(...args: any[]): void;
}

export interface CanvasLike extends Pick<OffscreenCanvas, "width" | "height"> {
  getContext(type: "2d"): ContextLike | null;
}

export type ScriptablePart = Pick<ScriptRunner, "code">;

export interface ScriptableInterface extends Pick<Scriptable, "execSetup"> {
  setup: ScriptablePart;
  animation: ScriptablePart;
  execAnimation(): unknown;
}

export interface LayerLike
  extends Omit<LayerConfigBase, "setup" | "animation"> {
  type: LayerConfig["type"];
  width: number;
  height: number;
  canvas: { width: number; height: number };
  setup: ScriptablePart;
  animation: ScriptablePart;
  execSetup(): Promise<unknown>;
  execAnimation(): void;
  dispose?(): void;
}

export interface DisplayDeps {
  workerName: string;
  canvas: CanvasLike;
  broadcast: (type: string, payload?: unknown) => void;
  post: (type: string, payload?: unknown) => void;
  scriptable: ScriptableInterface;
  createLayer(type: string, options: Record<string, unknown>): LayerLike | null;
  /** Called when the render loop should start (i.e. onScreenCanvas is ready). */
  onRenderReady?(): void;
}

export function makeDisplayLogic(deps: DisplayDeps) {
  const { workerName } = deps;

  const data = {} as RuntimeData;
  const read = makeRead(data);

  const displayState: Record<string, unknown> = {
    id: workerName,
    control: false,
  };

  type StateType = Omit<DisplayState, "layers"> & { layers: LayerLike[] };

  let state: StateType = {
    stage: { ...defaultStage },
    control: !!workerName.startsWith("controls-"),
    id: workerName,
    layers: [],
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
    assets: [],
  };

  let onScreenCanvas: {
    width: number;
    height: number;
    getContext(type: string): ContextLike | null;
  } | null = null;

  const context = deps.canvas.getContext("2d");

  // ─── Error event forwarders ───────────────────────────────────────────────

  const onExecutionError = (original: unknown) => {
    deps.broadcast("executionerror", { ...(original as object), workerName });
  };

  const onCompilationError = (original: unknown) => {
    deps.broadcast("compilationerror", { ...(original as object), workerName });
  };

  const onCompilationSuccess = (original: unknown) => {
    deps.broadcast("compilationsuccess", {
      ...(original as object),
      workerName,
    });
  };

  // ─── Helpers ─────────────────────────────────────────────────────────────

  function registerDisplay() {
    if (onScreenCanvas == null) return;
    deps.broadcast("registerdisplay", {
      id: workerName,
      width: onScreenCanvas.width,
      height: onScreenCanvas.height,
    });
  }

  function resizeLayer(layer: LayerLike) {
    layer.width = deps.canvas.width;
    layer.height = deps.canvas.height;
    layer.execSetup().catch((err) => {
      console.error("resizeLayer execSetup error", err);
    });
    return layer;
  }

  function processLayers(updateLayers: AppState["layers"]) {
    const updateLayerIds = new Set(updateLayers.map((l) => l.id));

    for (const options of updateLayers) {
      const found = state.layers.find((layer) => layer.id === options.id);
      let layer: LayerLike | null = null;

      if (!found) {
        layer = deps.createLayer(options.type, {
          ...options,
          read,
          onCompilationError,
          onExecutionError,
          onCompilationSuccess,
        });
        if (layer) {
          resizeLayer(layer);
          state.layers.push(layer);
        }
      } else {
        layer = found;
      }

      if (!layer) continue;
      if (layer.type !== options.type) {
        console.warn(
          `[display worker] Layer type mismatch for ${layer.id}: expected "${layer.type}", got "${options.type}"`,
        );
        continue;
      }

      layer.active = !!options.active;
      layer.opacity = options.opacity ?? 100;
    }

    state.layers = state.layers.filter((layer) => {
      if (!updateLayerIds.has(layer.id)) {
        if (typeof layer.dispose === "function") {
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

    state.layers.sort((a, b) => {
      const indexA = updateLayers.findIndex((l) => l.id === a.id);
      const indexB = updateLayers.findIndex((l) => l.id === b.id);
      return indexA - indexB;
    });
  }

  // ─── Broadcast channel handlers ──────────────────────────────────────────

  const broadcastHandlers: ComActionHandlers = {
    transpiled: async (payload: TranspilePayload) => {
      const { id, type, role, code } = payload;
      if (type === "worker") {
        deps.scriptable[role as "setup" | "animation"].code = code;
        if (role === "setup") {
          Object.assign(data, (await deps.scriptable.execSetup()) || {});
        }
        return;
      }

      const found = state.layers.find((layer) => layer.id === id);
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
      } as StateType;

      if (Array.isArray(update.layers)) {
        processLayers(update.layers);
      }

      state.worker = state.worker || {};
      if (
        typeof update.worker?.setup !== "undefined" &&
        update.worker.setup !== deps.scriptable.setup.code
      ) {
        deps.scriptable.setup.code =
          update.worker.setup || deps.scriptable.setup.code;
        state.worker.setup = deps.scriptable.setup.code;
        deps.scriptable.execSetup();
      }
      if (
        typeof update.worker?.animation !== "undefined" &&
        update.worker.animation !== deps.scriptable.animation.code
      ) {
        deps.scriptable.animation.code =
          update.worker.animation || deps.scriptable.animation.code;
        state.worker.animation = deps.scriptable.animation.code;
      }
    },

    runtimedata: (payload: RuntimeData) => {
      Object.assign(data, payload);
      for (const layer of state.layers) {
        (data.assets as AssetConfig[]).push({
          id: layer.id,
          source: "layer",
          canvas: layer.canvas as unknown as OffscreenCanvas,
        });
      }
    },

    registerdisplaycallback: (payload: { id: string }) => {
      if (payload.id !== workerName) return;
      processLayers(data.layers || []);
    },

    takeLayerScreenshot: async (payload: {
      layerId: string;
      displayName: string;
    }) => {
      if (!payload.displayName || payload.displayName !== workerName) return;
      // Canvas blob reading is left to the caller / integration layer
    },

    clearAssetsCache: () => {
      clearAssetsCache();
    },
  };

  // ─── Main thread message handlers ────────────────────────────────────────

  const messageHandlers: ComActionHandlers = {
    offscreencanvas: ({ canvas: onscreen }: { canvas: unknown }) => {
      onScreenCanvas = onscreen as typeof onScreenCanvas;
      deps.onRenderReady?.();
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
      deps.canvas.width = state.stage.width;
      deps.canvas.height = state.stage.height;
      state.layers.forEach((l) => {
        resizeLayer(l);
      });

      if (!state.control) {
        deps.broadcast("resizedisplay", {
          id: workerName,
          width: state.stage.width,
          height: state.stage.height,
        });
      }
    },
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  function renderLayers() {
    if (!context) return;
    context.clearRect(0, 0, deps.canvas.width, deps.canvas.height);
    if (!Array.isArray(state.layers)) return;

    for (const layer of state.layers) {
      if (!layer.active) continue;
      layer.execAnimation();
      context.globalAlpha = Math.max(
        0,
        Math.min(1, (layer.opacity ?? 100) * 0.01),
      );
      context.drawImage(
        layer.canvas,
        0,
        0,
        layer.canvas.width,
        layer.canvas.height,
        0,
        0,
        deps.canvas.width,
        deps.canvas.height,
      );
    }
  }

  function render() {
    Object.assign(displayState, deps.scriptable.execAnimation() || {});

    if (context && onScreenCanvas != null) {
      renderLayers();
      onScreenCanvas.height = deps.canvas.height;
      onScreenCanvas.width = deps.canvas.width;
      const ctx = onScreenCanvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(
          deps.canvas as unknown,
          0,
          0,
          onScreenCanvas.width,
          onScreenCanvas.height,
          0,
          0,
          deps.canvas.width,
          deps.canvas.height,
        );
      }
    }
  }

  // ─── Test seam ───────────────────────────────────────────────────────────

  function getState() {
    return { state, data, displayState };
  }

  return {
    broadcastHandlers,
    messageHandlers,
    getState,
    render,
    renderLayers,
  };
}
