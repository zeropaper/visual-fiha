// Web Worker for transpiling TypeScript to JavaScript in-browser
/// <reference lib="webworker" />

import type {
  AppState,
  DisplayRegistrationPayload,
  LayerConfig,
  RuntimeData,
} from "../types";
import { autoBind } from "../utils/com";
import type { TranspilePayload } from "./types";

const broadcastChannel = new BroadcastChannel("core");
let refreshInterval: NodeJS.Timeout | null = null;

const tsTranspileWorker = new Worker(
  new URL("./tsTranspile.worker.ts", import.meta.url),
  { type: "classic" },
);

function tsTranspile(code: string, type: string, role: string, id: string) {
  tsTranspileWorker.postMessage({ code, type, role, id });
}

const defaultConfigData: AppState = {
  stage: {
    width: 600,
    height: 400,
    backgroundColor: "#000000",
  },
  inputs: [],
  signals: [],
  layers: [],
  displays: [],
  worker: {
    setup: "",
    animation: "",
  },
};

let configData: AppState = structuredClone(defaultConfigData);

const defaultRuntimeData: RuntimeData = {
  stage: {
    width: 600,
    height: 400,
    backgroundColor: "#000000",
  },
  bpm: {
    bpm: 80,
    started: 0,
    elapsed: 0,
    isRunning: false,
    percent: 0,
  },
  time: {
    started: Date.now(),
    elapsed: 0,
    duration: 0,
    percent: 0,
    isRunning: false,
  },
  audio: {},
  midi: {},
  layers: [],
  worker: {
    setup: "",
    animation: "",
  },
};
let runtimeData: RuntimeData = structuredClone(defaultRuntimeData);

const handlers = {
  start: () => {
    console.info("[controls-worker] Starting controls worker");
    runtimeData.time.started = Date.now();
    runtimeData.time.isRunning = true;
    runtimeData.bpm.started = runtimeData.time.started;
    runtimeData.bpm.isRunning = true;
  },
  pause: () => {
    console.info("[controls-worker] Pausing controls worker");
    runtimeData.time.isRunning = false;
    runtimeData.bpm.isRunning = false;
  },
  resume: () => {
    console.info("[controls-worker] Resuming controls worker");
    runtimeData.time.started = Date.now() - runtimeData.time.elapsed;
    runtimeData.time.isRunning = true;
    runtimeData.bpm.started = Date.now() - runtimeData.bpm.elapsed;
    runtimeData.bpm.isRunning = true;
  },
  reset: () => {
    console.info("[controls-worker] Resetting controls worker");
    runtimeData.time.started = Date.now();
    runtimeData.time.elapsed = 0;
    runtimeData.time.duration = 0;
    runtimeData.time.percent = 0;
    runtimeData.time.isRunning = false;
    runtimeData.bpm.started = Date.now();
    runtimeData.bpm.elapsed = 0;
    runtimeData.bpm.percent = 0;
    runtimeData.bpm.isRunning = false;
  },
  setTime: (value: number) => {
    console.info("[controls-worker] Setting time to %d", value);
    runtimeData.time.started = Date.now() - value;
    runtimeData.time.elapsed = value;
    runtimeData.time.percent = value / (runtimeData.time.duration || 1);
    runtimeData.time.isRunning = false;
    runtimeData.bpm.bpm = runtimeData.bpm.bpm || 120;
    runtimeData.bpm.elapsed = value % (60000 / runtimeData.bpm.bpm);
    runtimeData.bpm.percent =
      runtimeData.bpm.elapsed / (60000 / runtimeData.bpm.bpm);
    runtimeData.bpm.isRunning = false;
  },
  timeDuration: (value: number) => {
    console.info("[controls-worker] Setting time duration to %d", value);
    runtimeData.time.duration = value;
    runtimeData.time.elapsed = 0;
    runtimeData.time.started = Date.now();
    runtimeData.time.percent = 0;
    runtimeData.time.isRunning = false;
    runtimeData.bpm.isRunning = false;
  },
  setBpm: (value: number) => {
    console.info("[controls-worker] Setting BPM to %d", value);
    runtimeData.bpm.bpm = value;
    runtimeData.bpm.started = Date.now();
    runtimeData.bpm.percent = 0;
  },
  inputsdata: (payload: any) => {
    runtimeData = {
      ...runtimeData,
      ...payload,
    };
  },
  updateconfig: (payload: Partial<AppState>) => {
    configData = { ...configData, ...payload };
    if ("layers" in payload) {
      runtimeData.layers = (payload.layers as LayerConfig[]).map(
        (layer, l) => ({
          ...layer,
          ...(runtimeData.layers[l] || {}),
          opacity: layer.opacity ?? 100,
          active: !!layer.active,
        }),
      );
    }
    // propagate to displays
    broadcastChannel.postMessage({
      type: "updateconfig",
      payload: configData,
    });
  },
  init: (payload: AppState) => {
    configData = payload;
    runtimeData = structuredClone(defaultRuntimeData);
    runtimeData.layers = configData.layers.map((layer) => {
      tsTranspile(layer.setup, layer.type, "setup", layer.id);
      tsTranspile(layer.animation, layer.type, "animation", layer.id);
      return layer;
    });
    tsTranspile(configData.worker.setup, "worker", "setup", "worker");
    tsTranspile(configData.worker.animation, "worker", "animation", "worker");

    if (refreshInterval) {
      clearInterval(refreshInterval);
    }
    refreshInterval = setInterval(() => {
      brodastRuntimeData();
    }, 8);
  },
};

const broadcastHandlers = {
  registerdisplay: (payload: DisplayRegistrationPayload) => {
    console.info('[controls-worker] Registering "%s" display', payload.id);

    configData = structuredClone(configData || defaultConfigData);
    const foundDisplay = configData.displays.find(
      (display) => display.id === payload.id,
    );
    if (foundDisplay) {
      console.info(
        '[controls-worker] Display "%s" already registered, skipping',
        payload.id,
      );
      // return;
    } else {
      console.info(
        '[controls-worker] Display "%s" not found, adding to config',
        payload.id,
      );
      configData.displays.push({
        id: payload.id,
        width: payload.width,
        height: payload.height,
        stagePosition: {
          x: 0,
          y: 0,
        },
        stageSize: {
          width: payload.width,
          height: payload.height,
        },
      });
    }

    broadcastChannel.postMessage({
      type: "registerdisplaycallback",
      payload: {
        id: payload.id,
        config: configData,
      },
    });
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
};

const { listener: mainListener } = autoBind(
  {
    postMessage: (msg) => self.postMessage(msg),
  },
  "controls-worker",
  handlers,
);

const { listener: bcListener } = autoBind(
  broadcastChannel,
  "controls-worker-bc",
  broadcastHandlers,
);

self.addEventListener("message", mainListener);
broadcastChannel.addEventListener("message", bcListener);

function processRuntimeData() {
  const deltaNow = Date.now() - runtimeData.time.started;

  if (runtimeData.time.isRunning) {
    runtimeData.time.elapsed = deltaNow;
    runtimeData.time.percent = runtimeData.time.duration
      ? deltaNow / runtimeData.time.duration
      : 0;
  }

  if (runtimeData.bpm.isRunning) {
    runtimeData.bpm.bpm = runtimeData.bpm.bpm || 120;
    runtimeData.bpm.elapsed = deltaNow % (60000 / runtimeData.bpm.bpm);
    runtimeData.bpm.percent =
      runtimeData.bpm.elapsed / (60000 / runtimeData.bpm.bpm);
  }

  // Update other runtime data as needed
  runtimeData.layers = configData.layers.map((layer, l) => {
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

function brodastRuntimeData() {
  processRuntimeData();
  broadcastChannel.postMessage({
    type: "runtimedata",
    payload: runtimeData,
  });
}

// refreshInterval = setInterval(brodastRuntimeData, 1000 / 60);
refreshInterval = setInterval(brodastRuntimeData, 1);
