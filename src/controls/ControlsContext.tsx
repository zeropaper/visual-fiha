import { useEffect } from "react";
import type {
  AppState,
  InputConfig,
  LayerConfig,
  SignalConfig,
} from "../types";
import createFastContext from "./createFastContext";
import { defaultAppState } from "./defaultAppState";

const { FastContextProvider, useFastContextFields, useContextWorkerPost } =
  createFastContext<AppState>(
    localStorage.getItem("config")
      ? JSON.parse(localStorage.getItem("config") || "null") || defaultAppState
      : defaultAppState,
    (value: AppState) => {
      localStorage.setItem("config", JSON.stringify(value));
    },
  );

export { useContextWorkerPost };

/**
 * Custom hook to access fields (and setters) from the AppState in a fast context.
 * @param fields - An array of field names from the AppState to access.
 * @returns - An object with getters and setters for the specified fields.
 */
export const useAppFastContextFields = useFastContextFields;

/**
 * Convenience hook to access the layer configuration by its ID.
 * It returns the layer configuration and a setter function to update it.
 * @param id
 * @returns - An array containing the layer configuration and a setter function.
 */
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
      set(updated);
    },
  ] as const;
}

/**
 * Custom hook to access the input configuration by its name.
 * It returns the input configuration and a setter function to update it.
 * @param name
 * @returns - An array containing the input configuration and a setter function.
 */
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

/**
 * Custom hook to access the signal configuration by its name.
 * It returns the signal configuration and a setter function to update it.
 * @param name
 * @returns - An array containing the signal configuration and a setter function.
 */
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

/**
 * Custom hook to access the stage configuration.
 * It returns the stage configuration and a setter function to update it.
 * @returns - An array containing the stage configuration and a setter function.
 */
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
  useEffect(() => {}, []);
  return <FastContextProvider>{children}</FastContextProvider>;
}
