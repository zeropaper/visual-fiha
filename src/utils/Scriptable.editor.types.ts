type TimeReadPath = `time.${"elapsed" | "duration" | "started" | "percent"}`;

type BPMReadPath =
  `bpm.${"bpm" | "started" | "elapsed" | "isRunning" | "percent" | "count"}`;

type MIDIReadPath =
  `midi.${string}.${"note" | "velocity" | "duration" | "channel"}`;

type AudioReadPath =
  `audio.${number}.${number}.${"frequency" | "timeDomain"}.${"min" | "max" | "average" | "median" | "data"}`;

type AssetReadPath =
  `asset.${string}.${"png" | "jpg" | "jpeg" | "gif" | "bmp" | "webp" | "gltf"}`;

export type ReadPath =
  | TimeReadPath
  | BPMReadPath
  | MIDIReadPath
  | AudioReadPath
  | AssetReadPath;

declare global {
  const read: (key: ReadPath, defaultValue?: any) => any;
  interface Cache {
    [key: string]: any;
  }
  const cache: Cache;
  const abs: typeof Math.abs;
  const acos: typeof Math.acos;
  // const acosh: typeof Math.acosh;
  const asin: typeof Math.asin;
  // const asinh: typeof Math.asinh;
  const atan: typeof Math.atan;
  // const atanh: typeof Math.atanh;
  const atan2: typeof Math.atan2;
  const ceil: typeof Math.ceil;
  // const cbrt: typeof Math.cbrt;
  // const expm1: typeof Math.expm1;
  // const clz32: typeof Math.clz32;
  const cos: typeof Math.cos;
  // const cosh: typeof Math.cosh;
  const exp: typeof Math.exp;
  const floor: typeof Math.floor;
  // const fround: typeof Math.fround;
  // const hypot: typeof Math.hypot;
  // const imul: typeof Math.imul;
  const log: typeof Math.log;
  // const log1p: typeof Math.log1p;
  // const log2: typeof Math.log2;
  // const log10: typeof Math.log10;
  const max: typeof Math.max;
  const min: typeof Math.min;
  const pow: typeof Math.pow;
  const random: typeof Math.random;
  const round: typeof Math.round;
  // const sign: typeof Math.sign;
  const sin: typeof Math.sin;
  // const sinh: typeof Math.sinh;
  const sqrt: typeof Math.sqrt;
  const tan: typeof Math.tan;
  // const tanh: typeof Math.tanh;
  // const trunc: typeof Math.trunc;
  const E: typeof Math.E;
  const LN10: typeof Math.LN10;
  const LN2: typeof Math.LN2;
  const LOG10E: typeof Math.LOG10E;
  const LOG2E: typeof Math.LOG2E;
  const PI: typeof Math.PI;
  const SQRT1_2: typeof Math.SQRT1_2;
  const SQRT2: typeof Math.SQRT2;
}
