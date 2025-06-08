import type { Context, InputConfig, SignalConfig } from "../types";
import createFastContext from "./createFastContext";

const broadcastChannel = new BroadcastChannel("vf-controls");

const { FastContextProvider: AppFastContextProvider, useFastContextFields } =
  createFastContext({
    inputs: [
      { name: "Time", type: "time", value: 0, config: { type: "absolute" } },
      {
        name: "BPM",
        type: "bpm",
        config: { min: 30, max: 300, startAt: 0 },
      },
      {
        name: "Audio",
        type: "audio",
        mode: "mic",
        config: {
          minDecibels: -120,
          maxDecibels: 80,
          smoothingTimeConstant: 0.85,
          fftSize: 1024,
        },
      },
      { name: "MIDI", type: "midi", config: {} },
    ] as InputConfig[],
    signals: [] as SignalConfig[],
    layers: [
      {
        id: "default-canvas",
        active: true,
        setup: "/* Canvas setup code */",
        animation: "/* Canvas animation code */",
        type: "canvas",
      },
      {
        id: "default-threejs",
        active: true,
        setup: "/* Three.js setup code */",
        animation: "/* Three.js animation code */",
        type: "threejs",
      },
    ],
    worker: {
      setup: "/* Worker setup code */",
      animation: "/* Worker animation code */",
    },
  } satisfies Context);

broadcastChannel.addEventListener("message", (event) => {
  console.info(
    "[controls] BroadcastChannel incoming message:",
    event.data,
    event.source,
  );
});

export function useAppFastContextFields<T extends keyof Context>(fields: T[]) {
  const original = useFastContextFields(fields);
  type OG = typeof original;
  return Object.entries(original).reduce((acc, [key, value]) => {
    acc[key as T] = {
      get: (value as OG[keyof OG]).get,
      set: (val) => {
        (value as OG[keyof OG]).set(val);
        broadcastChannel.postMessage({
          type: "update",
          field: key,
          value: (value as OG[keyof OG]).get,
        });
      },
    } as OG[T];
    return acc;
  }, {} as OG);
}

export { AppFastContextProvider, broadcastChannel };
