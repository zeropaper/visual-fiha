import type {
  AppState,
  DisplayRegistrationPayload,
  LayerConfig,
  RuntimeData,
} from "../types";
import type { TranspilePayload } from "../utils/tsTranspile";
import { defaultAppState } from "./contexts/defaultAppState";

const defaultBPM = 120;

const defaultStageConfig = {
  width: 600,
  height: 400,
  backgroundColor: "#000000",
};

export const defaultRuntimeData: RuntimeData = {
  stage: defaultStageConfig,
  bpm: {
    bpm: defaultBPM,
    started: 0,
    elapsed: 0,
    isRunning: false,
    percent: 0,
    count: 0,
  },
  time: {
    started: 0,
    elapsed: 0,
    duration: 0,
    percent: 0,
    isRunning: false,
  },
  audio: {},
  midi: {},
  layers: [],
  assets: [],
  worker: {
    setup: "",
    animation: "",
  },
};

export interface ControlsDeps {
  broadcast: (type: string, payload?: unknown) => void;
  post: (type: string, payload?: unknown) => void;
  tsTranspile: (
    code: string,
    type: string,
    role: string,
    id: string,
  ) => Promise<TranspilePayload>;
}

export function makeControlsLogic(deps: ControlsDeps) {
  let appState: AppState = structuredClone(defaultAppState);
  let runtimeData: RuntimeData = structuredClone(defaultRuntimeData);
  runtimeData.time.started = Date.now();

  function getState() {
    return { appState, runtimeData };
  }

  function tick() {
    const deltaNow = Date.now() - runtimeData.time.started;

    if (runtimeData.time.isRunning) {
      runtimeData.time.elapsed = deltaNow;
      runtimeData.time.percent = runtimeData.time.duration
        ? deltaNow / runtimeData.time.duration
        : 0;

      if (runtimeData.bpm.isRunning) {
        runtimeData.bpm.bpm = runtimeData.bpm.bpm || defaultBPM;
        runtimeData.bpm.elapsed = deltaNow % (60000 / runtimeData.bpm.bpm);
        runtimeData.bpm.percent =
          runtimeData.bpm.elapsed / (60000 / runtimeData.bpm.bpm);
        runtimeData.bpm.count = Math.floor(
          deltaNow / (60000 / runtimeData.bpm.bpm),
        );
      }

      if (
        runtimeData.time.duration &&
        runtimeData.time.elapsed >= runtimeData.time.duration
      ) {
        handlers.reset();
      }
    }

    runtimeData.layers = appState.layers.map((layer, l) => {
      const existingLayer = runtimeData.layers[l] || {};
      return {
        ...existingLayer,
        ...layer,
        animation: existingLayer.animation || layer.animation || "",
        setup: existingLayer.setup || layer.setup || "",
        active: layer.active !== false,
        id: layer.id || existingLayer.id || `layer-${l}`,
        type: layer.type || existingLayer.type || "canvas",
      };
    });
  }

  const handlers = {
    start: () => {
      runtimeData.time.started = Date.now();
      runtimeData.time.isRunning = true;
      runtimeData.bpm.started = runtimeData.time.started;
      runtimeData.bpm.isRunning = true;
    },
    pause: () => {
      runtimeData.time.isRunning = false;
      runtimeData.bpm.isRunning = false;
    },
    resume: () => {
      runtimeData.time.started = Date.now() - runtimeData.time.elapsed;
      runtimeData.time.isRunning = true;
      runtimeData.bpm.started = Date.now() - runtimeData.bpm.elapsed;
      runtimeData.bpm.isRunning = true;
    },
    reset: () => {
      runtimeData.time.started = Date.now();
      runtimeData.time.elapsed = 0;
      runtimeData.time.percent = 0;
      runtimeData.time.isRunning = false;
      runtimeData.bpm.started = Date.now();
      runtimeData.bpm.elapsed = 0;
      runtimeData.bpm.percent = 0;
      runtimeData.bpm.count = 0;
      runtimeData.bpm.isRunning = false;
    },
    setTime: (value: number) => {
      runtimeData.time.started = Date.now() - value;
      runtimeData.time.elapsed = value;
      runtimeData.time.percent = value / (runtimeData.time.duration || 1);
      runtimeData.bpm.bpm = runtimeData.bpm.bpm || defaultBPM;
      runtimeData.bpm.elapsed = value % (60000 / runtimeData.bpm.bpm);
      runtimeData.bpm.percent =
        runtimeData.bpm.elapsed / (60000 / runtimeData.bpm.bpm);
      runtimeData.bpm.count = Math.floor(value / (60000 / runtimeData.bpm.bpm));
    },
    timeDuration: (value: number) => {
      const wasRunning = runtimeData.time.isRunning;
      runtimeData.time.duration = value;
      runtimeData.time.elapsed = 0;
      runtimeData.time.started = Date.now();
      runtimeData.time.percent = 0;
      runtimeData.time.isRunning = wasRunning;
      runtimeData.bpm.isRunning = wasRunning;
    },
    setBpm: (value: number) => {
      runtimeData.bpm.bpm = value;
      runtimeData.bpm.started = Date.now();
      runtimeData.bpm.percent = 0;
      runtimeData.bpm.elapsed = 0;
      runtimeData.bpm.isRunning = true;
      runtimeData.bpm.count = 0;
    },
    setBpmStart: () => {
      runtimeData.bpm.started = Date.now();
      runtimeData.bpm.elapsed = 0;
      runtimeData.bpm.percent = 0;
      runtimeData.bpm.isRunning = true;
      runtimeData.bpm.count = 0;
    },
    inputsdata: (payload: RuntimeData) => {
      runtimeData = {
        ...runtimeData,
        ...payload,
      };
      runtimeData.assets = appState.assets;
    },
    updateconfig: (payload: Partial<AppState>) => {
      appState = {
        // @ts-expect-error - errors will be overwritten and that's fine, we just want to make sure it's always an array
        errors: [],
        ...appState,
        ...payload,
      } as AppState;
      if ("layers" in payload) {
        runtimeData.layers = (payload.layers as LayerConfig[]).map((layer) => {
          const existing = runtimeData.layers.find((rl) => rl.id === layer.id);
          return {
            ...layer,
            ...(existing || {}),
            opacity: layer.opacity ?? 100,
            active: !!layer.active,
          };
        });
      }
      deps.broadcast("updateconfig", appState);
    },
    init: (payload: AppState) => {
      appState = payload;

      function finish(transpilation: TranspilePayload[]) {
        runtimeData = structuredClone(defaultRuntimeData);
        runtimeData.time.started = Date.now();

        function getTranspiledCode(original: string) {
          const transpiled = transpilation.find((t) => t.original === original);
          return transpiled ? transpiled.code : "";
        }

        runtimeData.layers = appState.layers.map((layer, l) => ({
          ...layer,
          id: layer.id || `layer-${l}`,
          type: layer.type || "canvas",
          setup: getTranspiledCode(layer.setup),
          animation: getTranspiledCode(layer.animation),
        }));

        handlers.reset();
        handlers.timeDuration(
          runtimeData.time.duration || defaultRuntimeData.time.duration,
        );
        tick();
        deps.broadcast("runtimedata", runtimeData);
        deps.broadcast("clearAssetsCache", undefined);
        deps.post("initialized", appState);
      }

      Promise.all([
        ...appState.layers.map((layer) =>
          deps.tsTranspile(layer.setup, layer.type, "setup", layer.id),
        ),
        ...appState.layers.map((layer) =>
          deps.tsTranspile(layer.animation, layer.type, "animation", layer.id),
        ),
        deps.tsTranspile(appState.worker.setup, "worker", "setup", "worker"),
        deps.tsTranspile(
          appState.worker.animation,
          "worker",
          "animation",
          "worker",
        ),
      ])
        .then(finish)
        .catch((err) =>
          console.error("[controls-worker] Initial transpilation error:", err),
        );
    },
  };

  const broadcastHandlers = {
    registerdisplay: (payload: DisplayRegistrationPayload) => {
      appState = structuredClone(appState || defaultAppState);
      const foundDisplay = appState.displays.find(
        (display) => display.id === payload.id,
      );
      if (!foundDisplay) {
        appState.displays.push({
          id: payload.id,
          width: payload.width,
          height: payload.height,
          stagePosition: { x: 0, y: 0 },
          stageSize: { width: payload.width, height: payload.height },
        });
        deps.post("registerdisplay", {
          id: payload.id,
          width: payload.width,
          height: payload.height,
        });
      }
      deps.broadcast("registerdisplaycallback", { id: payload.id });
    },
    transpiled: (payload: TranspilePayload) => {
      const { role, type, id, code } = payload;
      if (type === "worker") {
        runtimeData.worker[role] = code;
        return;
      }
      runtimeData.layers = runtimeData.layers.map((layer) => {
        if (layer.id === id) {
          layer[role] = code;
        }
        return layer;
      });
    },
    executionerror: (payload: any) => {
      console.warn("[controls-worker] Execution error:", payload);
      appState.errors.push(payload);
      deps.post("updateerrors", appState.errors);
    },
    compilationerror: (payload: any) => {
      console.warn("[controls-worker] Compilation error:", payload);
      appState.errors.push(payload);
      deps.post("updateerrors", appState.errors);
    },
    compilationsuccess: (payload: any) => {
      const { id, role } = payload;
      const filtered =
        appState.errors?.filter(
          (error) => error.id !== id && error.role !== role,
        ) || [];
      appState.errors = filtered;
      deps.post("updateerrors", appState.errors);
    },
  };

  return { handlers, broadcastHandlers, getState, tick };
}
