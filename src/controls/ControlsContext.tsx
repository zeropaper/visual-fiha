import type { Prettify } from "../types";
import createFastContext from "./createFastContext";

export type AudioInputValue = Record<
  string, // track number as string
  Record<
    string, // channel number as string
    Record<"data" | "min" | "max" | "average" | "median" | (string & {}), any>
  >
>;

export type AudioInputMode = "file" | "files" | "mic";

export interface AudioInputConfig {
  minDecibels: number;
  maxDecibels: number;
  smoothingTimeConstant: number;
  fftSize: number;
}

export interface AudioInputStruct {
  name: "Audio";
  type: "audio";
  mode: AudioInputMode;
  value: AudioInputValue | null;
  config: AudioInputConfig;
}

type Input =
  | AudioInputStruct
  | {
      name: "Time";
      type: "time";
      value: number;
      config: { type: "absolute" | "relative" };
    }
  | {
      name: "BPM";
      type: "bpm";
      value: number;
      config: { min: number; max: number; startAt: number };
    }
  | {
      name: "MIDI";
      type: "midi";
      value: { type: "device"; name: string; values: Record<string, number> }[];
      config?: Record<string, any>;
    };

type Signal = {
  name: string;
  type?: string;
  value?: any;
};

type LayerBase = {
  name: string;
  active: boolean;
  setup: string;
  animation: string;
};

type Layer = Prettify<
  (
    | {
        type: "canvas";
      }
    | {
        type: "threejs";
      }
  ) &
    LayerBase
>;

type Context = {
  inputs: Input[];
  signals: Signal[];
  layers: Layer[];
};

export const {
  FastContextProvider: AppFastContextProvider,
  useFastContextFields: useAppFastContextFields,
} = createFastContext({
  inputs: [
    { name: "Time", type: "time", value: 0, config: { type: "absolute" } },
    {
      name: "BPM",
      type: "bpm",
      value: 120,
      config: { min: 30, max: 300, startAt: 0 },
    },
    {
      name: "Audio",
      type: "audio",
      value: null,
      mode: "mic",
      config: {
        minDecibels: -120,
        maxDecibels: 80,
        smoothingTimeConstant: 0.85,
        fftSize: 1024,
      },
    },
    { name: "MIDI", type: "midi", value: [], config: {} },
  ] as Input[],
  signals: [],
  layers: [],
} satisfies Context);
