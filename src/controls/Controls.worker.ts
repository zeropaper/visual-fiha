// Web Worker for transpiling TypeScript to JavaScript in-browser
/// <reference lib="webworker" />

import type { AppState, LayerConfig, RuntimeData } from "../types";
import { autoBind } from "../utils/com";
import type { TranspilePayload } from "./types";

const broadcastChannel = new BroadcastChannel("core");
let refreshInterval: NodeJS.Timeout | null = null;

let configData: AppState = {
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

const defaultRuntimeData: RuntimeData = {
  stage: {
    width: 600,
    height: 400,
    backgroundColor: "#000000",
  },
  bpm: {
    bpm: 0,
    started: 0,
    elapsed: 0,
    isRunning: false,
    percent: 0,
    cycleDuration: 0,
    cycleElapsed: 0,
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
  worker: {
    setup: "",
    animation: "",
  },
};
let runtimeData: RuntimeData = JSON.parse(JSON.stringify(defaultRuntimeData));
let started = Date.now();

const handlers = {
  start: () => {
    runtimeData.time.started = Date.now();
    runtimeData.time.isRunning = true;
    runtimeData.bpm.started = runtimeData.time.started;
    runtimeData.bpm.isRunning = true;
  },
  stop: () => {
    runtimeData.bpm.isRunning = false;
    runtimeData.time.isRunning = false;
  },
  bpm: (value: number) => {
    runtimeData.bpm.bpm = value;
    runtimeData.bpm.cycleDuration = 60000 / runtimeData.bpm.bpm;
    runtimeData.bpm.cycleElapsed = 0;
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
    runtimeData = JSON.parse(JSON.stringify(defaultRuntimeData));
    runtimeData.layers = configData.layers.map((layer, l) => ({ ...layer }));
    if (refreshInterval !== null) {
      clearInterval(refreshInterval);
    }
    refreshInterval = setInterval(() => {
      brodastRuntimeData();
    }, 1000 / 60);
  },
};

const broadcastHandlers = {
  runtimedata: () => {},
  registerdisplay: (payload: { id: string }) => {
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
  const now = Date.now();
  const deltaNow = now - started;
  started = now;

  runtimeData.time.elapsed += deltaNow;
  runtimeData.time.duration = runtimeData.time.duration || 0; // Default to 0 if not set

  runtimeData.bpm.elapsed += deltaNow;
  runtimeData.bpm.bpm = runtimeData.bpm.bpm || 120; // Default to 120 BPM if not set
  runtimeData.bpm.cycleElapsed += deltaNow;
  runtimeData.bpm.percent = runtimeData.bpm.elapsed % runtimeData.bpm.bpm; // Assuming bpm is in beats per minute
  if (runtimeData.bpm.cycleElapsed >= runtimeData.bpm.cycleDuration) {
    runtimeData.bpm.cycleElapsed = 0; // Reset cycle elapsed time
    runtimeData.bpm.percent = 0; // Reset percent at the end of the cycle
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

refreshInterval = setInterval(brodastRuntimeData, 1000 / 60);
