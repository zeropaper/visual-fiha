import type { Prettify } from "../types";
import createFastContext from "./createFastContext";

type Input =
  | {
      name: "time";
      type: "time";
      value: number;
      config: { type: "absolute" | "relative" };
    }
  | {
      name: "bpm";
      type: "bpm";
      value: number;
      config: { min: number; max: number; startAt: number };
    }
  | {
      name: "audio";
      type: "audio";
      value: null;
      config: { sampleRate: number };
    }
  | {
      name: "midi";
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
    { name: "time", type: "time", value: 0, config: { type: "absolute" } },
    {
      name: "bpm",
      type: "bpm",
      value: 120,
      config: { min: 30, max: 300, startAt: 0 },
    },
    {
      name: "audio",
      type: "audio",
      value: null,
      config: { sampleRate: 44100 },
    },
    { name: "midi", type: "midi", value: [], config: {} },
  ],
  signals: [],
  layers: [],
} satisfies Context);
