import { useEffect } from "react";
import type {
  AppState,
  InputConfig,
  LayerConfig,
  SignalConfig,
} from "../types";
import ControlsWorker from "./Controls.worker?worker";
import createFastContext from "./createFastContext";
import { defaultAppState } from "./defaultAppState";

declare global {
  interface Window {
    _controlsWorker?: Worker;
  }
}

const exists = typeof window._controlsWorker !== "undefined";
const worker = new ControlsWorker() as Worker;
if (!exists) {
  window._controlsWorker = worker;
  worker.addEventListener("message", (event) => {
    console.info(
      "[controls app] incoming worker message:",
      event.data,
      event.source,
    );
  });
}

export function postMessageToWorker(message: any) {
  worker.postMessage(message);
}

const { FastContextProvider, useFastContextFields } =
  createFastContext(defaultAppState);

export function useAppFastContextFields<T extends keyof AppState>(fields: T[]) {
  const original = useFastContextFields(fields);
  type OG = typeof original;
  return Object.entries(original).reduce((acc, [key, value]) => {
    acc[key as T] = {
      get: (value as OG[keyof OG]).get,
      set: (val) => {
        (value as OG[keyof OG]).set(val);
        worker.postMessage({
          type: "updateconfig",
          payload: {
            field: key,
            value: val,
          },
        });
      },
    } as OG[T];
    return acc;
  }, {} as OG);
}

export function useLayerConfig(id: string) {
  const {
    layers: { get: layers, set },
  } = useAppFastContextFields(["layers"]);
  return [
    layers.find((layer) => layer.id === id),
    (value: LayerConfig | null) => {
      const updated = layers
        .map((layer) =>
          layer.id === id ? (value ? { ...layer, ...value } : null) : layer,
        )
        .filter(Boolean) as LayerConfig[];
      console.info("[layer] update", layers, value, updated);
      worker.postMessage({
        type: "updateconfig",
        payload: {
          field: "layers",
          value: updated,
        },
      });
      set(updated);
    },
  ] as const;
}

export function useInputConfig(name: string) {
  const {
    inputs: { get: inputs, set },
  } = useAppFastContextFields(["inputs"]);
  return [
    inputs.find((input) => input.name === name),
    (value: InputConfig) => {
      set(
        inputs.map((input) =>
          input.name === name ? { ...input, ...value } : input,
        ),
      );
    },
  ] as const;
}

export function useSignalConfig(name: string) {
  const {
    signals: { get: signals, set },
  } = useAppFastContextFields(["signals"]);
  return [
    signals.find((signal) => signal.name === name),
    (value: SignalConfig) => {
      set(
        signals.map((signal) =>
          signal.name === name ? { ...signal, ...value } : signal,
        ),
      );
    },
  ] as const;
}

export function useStageConfig() {
  const {
    stage: { get: stage, set },
  } = useAppFastContextFields(["stage"]);
  return [
    stage,
    (value: Partial<typeof stage>) => {
      set({ ...stage, ...value });
    },
  ] as const;
}

export function AppFastContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    postMessageToWorker({
      type: "init",
      payload: defaultAppState,
    });
  }, []);
  return <FastContextProvider>{children}</FastContextProvider>;
}
