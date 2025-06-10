// Web Worker for transpiling TypeScript to JavaScript in-browser
/// <reference lib="webworker" />

import type { AppState, LayerConfig, RuntimeData } from "../types";
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

self.addEventListener("message", (event) => {
  switch (event.data.type) {
    case "start":
      runtimeData.time.started = Date.now();
      runtimeData.time.isRunning = true;
      runtimeData.bpm.started = runtimeData.time.started;
      runtimeData.bpm.isRunning = true;
      break;
    case "stop":
      runtimeData.bpm.isRunning = false;
      runtimeData.time.isRunning = false;
      break;
    case "bpm":
      runtimeData.bpm.bpm = event.data.value;
      runtimeData.bpm.cycleDuration = 60000 / runtimeData.bpm.bpm; // Calculate cycle duration in milliseconds
      runtimeData.bpm.cycleElapsed = 0; // Reset cycle elapsed time
      runtimeData.bpm.started = Date.now();
      runtimeData.bpm.percent = 0; // Reset percent
      break;
    case "inputsdata":
      runtimeData = {
        ...runtimeData,
        ...event.data.payload,
      };
      break;
    case "updateconfig":
      const { field, value } = event.data.payload as {
        field: keyof AppState;
        value: any;
      };
      configData[field] = value;
      switch (field) {
        case "layers":
          runtimeData.layers = (value as LayerConfig[]).map((layer, l) => ({
            ...layer,
            ...(runtimeData.layers[l] || {}),
            active: layer.active !== false,
          }));
      }
      broadcastChannel.postMessage({
        type: "updateconfig",
        payload: configData,
      });
      break;
    case "init":
      configData = event.data.payload;
      runtimeData = JSON.parse(JSON.stringify(defaultRuntimeData));
      runtimeData.layers = configData.layers.map((layer, l) => ({
        ...layer,
      }));
      if (refreshInterval !== null) {
        clearInterval(refreshInterval);
      }
      refreshInterval = setInterval(() => {
        brodastRuntimeData();
      }, 1000 / 60);
      break;
    default:
      console.warn("[controls worker] Unknown message type:", event.data.type);
      break;
  }
});

broadcastChannel.addEventListener("message", (event) => {
  switch (event.data.type) {
    case "runtimedata":
      break;
    case "registerdisplay":
      broadcastChannel.postMessage({
        type: "registerdisplaycallback",
        payload: {
          id: event.data.payload.id,
          config: configData,
        },
      });
      break;
    case "transpiled":
      const { role, type, id, code } = event.data.payload as TranspilePayload;
      if (type === "worker") {
        // TODO: run script
        runtimeData.worker[role] = code;
        break;
      }
      runtimeData.layers = runtimeData.layers.map((layer) => {
        if (layer.id === id) {
          layer[role] = code;
        }
        return layer;
      });
      break;
    default:
      console.warn(
        "[controls worker] Unknown broadcast message type:",
        event.data.type,
      );
      break;
  }
});

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
