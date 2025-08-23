type TimeReadPath =
  `time.${"elapsed" | "duration" | "started" | "percent" | "isRunning"}`;

type BPMReadPath =
  `bpm.${"bpm" | "started" | "elapsed" | "isRunning" | "percent" | "count"}`;

type MIDIReadPath = "midi" | `midi.${string}`;

type AudioReadPath =
  | "audio"
  | `audio.${number}.${number}.${"frequency" | "timeDomain"}.${"min" | "max" | "average" | "median" | "data"}`;

type AssetReadPath = `asset.${string}`;

type StageReadPath =
  `stage.${"x" | "y" | "width" | "height" | "rotation" | "scale"}`;

export type ReadPath =
  | TimeReadPath
  | BPMReadPath
  | MIDIReadPath
  | AudioReadPath
  | AssetReadPath
  | StageReadPath;

declare global {
  const read: <R extends ReadPath, T = any>(key: R, defaultValue?: T) => T;
  interface Cache {
    [key: string]: any;
  }
  const cache: Cache;
}
