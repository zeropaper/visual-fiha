export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type AudioInputValue = Record<
  string, // track number as string
  Record<
    string, // channel number as string
    Record<"data" | "min" | "max" | "average" | "median" | (string & {}), any>
  >
>;

export type AudioInputMode = "file" | "files" | "mic";

export interface AudioInputBaseConfig {
  minDecibels: number;
  maxDecibels: number;
  smoothingTimeConstant: number;
  fftSize: number;
}

export interface AudioInputConfig {
  name: "Audio";
  type: "audio";
  mode: AudioInputMode;
  // value: AudioInputValue | null;
  config: AudioInputBaseConfig;
}

export interface TimeInputConfig {
  name: "Time";
  type: "time";
  // value: number;
  config: { type: "absolute" | "relative" };
}

export interface BPMInputConfig {
  name: "BPM";
  type: "bpm";
  // value: number;
  config: { min: number; max: number; startAt: number };
}

export interface MIDIInputConfig {
  name: "MIDI";
  type: "midi";
  // value: { type: "device"; name: string; values: Record<string, number> }[];
  config?: Record<string, any>;
}

export type InputConfig =
  | AudioInputConfig
  | TimeInputConfig
  | BPMInputConfig
  | MIDIInputConfig;

export type SignalConfig = {
  name: string;
  type?: string;
  value?: any;
};

export type LayerConfigBase = {
  id: string;
  active: boolean;
  setup: string;
  animation: string;
};

export type LayerConfig = Prettify<
  (
    | {
        type: "canvas";
      }
    | {
        type: "threejs";
      }
  ) &
    LayerConfigBase
>;

export type Context = {
  inputs: InputConfig[];
  signals: SignalConfig[];
  layers: LayerConfig[];
  worker: {
    setup: string;
    animation: string;
  };
};

export interface ScriptInfo {
  id: string;
  type: "worker" | "layer";
  role: "setup" | "animation";
}
