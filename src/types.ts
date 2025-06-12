export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export interface StageConfig {
  width: number;
  height: number;
  backgroundColor: string;
}

/**
 * Represents the value of an audio input.
 * This type captures the structure of audio input data, including
 * track numbers, channel numbers, and various audio metrics.
 *
 * @typedef {Record<string, Record<string, Record<string, any>>>} AudioInputValue
 * @property {string} track - The track number as a string
 * @property {string} channel - The channel number as a string
 * @property {Record<string, any>} data - Contains audio data metrics such as min, max, average, median, etc.
 * @property {string & {}} - Additional dynamic properties can be added as needed
 */
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
  config: AudioInputBaseConfig;
}

/**
 * Represents the state of a time input.
 * This interface tracks the timing information for a time input,
 * including when it started, how long it has been running, and its
 * current percentage of elapsed time relative to the total duration.
 *
 * @interface TimeInputValue
 * @property {number} started - Timestamp (in ms) when the time input started
 * @property {number} elapsed - Elapsed time in milliseconds since the input started
 * @property {number} duration - Total duration in milliseconds for the time input
 * @property {number} percent - Percentage (0-1) of the elapsed time relative to the duration
 * @property {boolean} isRunning - Whether the time input is currently running
 */
export interface TimeInputValue {
  /**
   * Timestamp (in ms) when the time input started
   */
  started: number;
  /**
   * Elapsed time in milliseconds since the input started
   */
  elapsed: number /**
   * Total duration in milliseconds for the time input
   *
   * @remarks
   * This value should only be set when there is a known duration for the time input.
   * If the duration is not known, it can be set to 0. In the case of a relative time input
   * (like files are used as audio input), this value must be set.
   */;
  duration: number;
  /**
   * Percentage (0-1) of the elapsed time relative to the duration
   */
  percent: number;
  /**
   * Whether the time input is currently running
   */
  isRunning: boolean;
}

export interface TimeInputConfig {
  name: "Time";
  type: "time";
  config: {
    type: "absolute" | "relative";
  };
}

/**
 * Represents the state of a BPM (beats per minute) input.
 * This interface tracks timing information for rhythm-based operations.
 *
 * @interface BPMInputValue
 * @property {number} bpm - The tempo in beats per minute
 * @property {number} started - Timestamp (in ms) when the BPM input was started
 * @property {number} percent - The percentage (0-1) of the current BPM cycle completed
 * @property {number} cycleDuration - Duration of one complete BPM cycle in milliseconds
 * @property {number} cycleElapsed - Time in milliseconds elapsed in the current BPM cycle
 */
export interface BPMInputValue {
  bpm: number;
  started: number;
  elapsed: number;
  isRunning: boolean;
  percent: number;
  cycleDuration: number;
  cycleElapsed: number;
}

export interface BPMInputConfig {
  name: "BPM";
  type: "bpm";
  config: { min: number; max: number; startAt: number };
}

export type MIDIInputValue = Record<string, Record<string, number>>;

export interface MIDIInputConfig {
  name: "MIDI";
  type: "midi";
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

export interface DisplayConfig {
  id: string;
  width: number;
  height: number;
  stagePosition: {
    x: number;
    y: number;
  };
  stageSize: {
    width: number;
    height: number;
  };
}

export type AppState = {
  stage: StageConfig;
  inputs: InputConfig[];
  signals: SignalConfig[];
  layers: LayerConfig[];
  displays: DisplayConfig[];
  worker: {
    setup: string;
    animation: string;
  };
};

export interface RuntimeData {
  stage: StageConfig;
  audio: AudioInputValue;
  time: TimeInputValue;
  bpm: BPMInputValue;
  midi: MIDIInputValue;
  layers: {
    id: string;
    active: boolean;
    type: "canvas" | "threejs";
    animation: string;
    setup: string;
  }[];
  worker: {
    setup: string;
    animation: string;
  };
}

export interface ScriptInfo {
  id: string;
  type: "worker" | "layer";
  role: "setup" | "animation";
}
