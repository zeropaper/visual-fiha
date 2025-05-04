declare module "src/utils/ScriptRunner" {
  export type ScriptLog = (...args: any[]) => void;
  export type ScriptRunnerEventTypes =
    | "compilationerror"
    | "executionerror"
    | "log";
  export interface ScriptRunnerCodeError extends Error {
    lineNumber?: number;
    columnNumber?: number;
    details?: object[];
  }
  export interface ScriptRunnerEvent {
    defaultPrevented?: boolean;
    readonly type: ScriptRunnerEventTypes;
  }
  export interface ScriptRunnerErrorEvent extends ScriptRunnerEvent {
    error: ScriptRunnerCodeError | ScriptRunnerLintingError;
    readonly type: "compilationerror" | "executionerror";
    builderStr?: string;
    code?: string;
  }
  export interface ScriptRunnerLogEvent extends ScriptRunnerEvent {
    data: any;
    readonly type: "log";
  }
  export type ScriptRunnerEventListener = (
    event: ScriptRunnerErrorEvent | ScriptRunnerLogEvent,
    // biome-ignore lint/suspicious/noConfusingVoidType: <explanation>
  ) => boolean | void;
  export type API = {
    [scriptGlobalName: string]: any;
  };
  class ScriptRunnerLintingError extends Error {
    constructor(details: object[]);
    details: object[];
  }
  class ScriptRunner {
    #private;
    constructor(scope?: any, name?: string);
    get version(): number;
    get scope(): any;
    set scope(newScope: any);
    get api(): API & {
      scriptLog: (...args: any[]) => void;
    };
    set api({ scriptLog, ...api }: API);
    get log(): any[];
    get isAsync(): boolean;
    get code(): string;
    set code(code: string);
    addEventListener(
      type: ScriptRunnerEventTypes,
      callback: ScriptRunnerEventListener,
    ): void;
    removeEventListener(
      type: ScriptRunnerEventTypes,
      callback: ScriptRunnerEventListener,
    ): void;
    dispatchEvent(
      event: ScriptRunnerErrorEvent | ScriptRunnerLogEvent,
    ): boolean;
    exec(): any;
  }
  export default ScriptRunner;
}
declare module "src/utils/Scriptable" {
  import type ScriptRunner from "src/utils/ScriptRunner";
  import type { ScriptRunnerEventListener, API } from "src/utils/ScriptRunner";
  export type Cache = {
    [k: string]: any;
  };
  export type ReadInterface = (name: string, defaultValue?: any) => any;
  export type WriteInterface = (data: {
    [k: string]: any;
  }) => void;
  export type ScriptableOptions = {
    onCompilationError?: ScriptRunnerEventListener;
    onExecutionError?: ScriptRunnerEventListener;
    animation?: string;
    setup?: string;
    read?: ReadInterface;
    api?: API;
    scope?: any;
    id: string;
  };
  export default class Scriptable {
    #private;
    constructor(options?: ScriptableOptions);
    cache: Cache;
    read: ReadInterface;
    get id(): string;
    get api(): API & {
      cache: Cache;
    };
    set api(api: API);
    get setup(): ScriptRunner;
    set setup(sr: ScriptRunner);
    get animation(): ScriptRunner;
    set animation(sr: ScriptRunner);
    initialize: ({
      setup,
      animation,
      onCompilationError,
      onExecutionError,
    }: ScriptableOptions) => void;
    execSetup: () => Promise<any>;
    execAnimation: () => any;
  }
}
declare module "scripts-dts/scriptRunner" {
  import type { ReadInterface, Cache } from "src/utils/Scriptable";
  import type { ScriptLog } from "src/utils/ScriptRunner";
  global {
    const read: ReadInterface;
    const cache: Cache;
    const scriptLog: ScriptLog;
  }
}
declare module "src/utils/mathTools" {
  type Box = {
    width: number;
    height: number;
  };
  const abs: (x: number) => number;
  const acos: (x: number) => number;
  const acosh: (x: number) => number;
  const asin: (x: number) => number;
  const asinh: (x: number) => number;
  const atan: (x: number) => number;
  const atanh: (x: number) => number;
  const atan2: (y: number, x: number) => number;
  const ceil: (x: number) => number;
  const cbrt: (x: number) => number;
  const expm1: (x: number) => number;
  const clz32: (x: number) => number;
  const cos: (x: number) => number;
  const cosh: (x: number) => number;
  const exp: (x: number) => number;
  const floor: (x: number) => number;
  const fround: (x: number) => number;
  const hypot: (...values: number[]) => number;
  const imul: (x: number, y: number) => number;
  const log: (x: number) => number;
  const log1p: (x: number) => number;
  const log2: (x: number) => number;
  const log10: (x: number) => number;
  const max: (...values: number[]) => number;
  const min: (...values: number[]) => number;
  const pow: (x: number, y: number) => number;
  const random: () => number;
  const round: (x: number) => number;
  const sign: (x: number) => number;
  const sin: (x: number) => number;
  const sinh: (x: number) => number;
  const sqrt: (x: number) => number;
  const tan: (x: number) => number;
  const tanh: (x: number) => number;
  const trunc: (x: number) => number;
  const E: number;
  const LN10: number;
  const LN2: number;
  const LOG10E: number;
  const LOG2E: number;
  const PI: number;
  const SQRT1_2: number;
  const SQRT2: number;
  export {
    abs,
    acos,
    acosh,
    asin,
    asinh,
    atan,
    atanh,
    atan2,
    ceil,
    cbrt,
    expm1,
    clz32,
    cos,
    cosh,
    exp,
    floor,
    fround,
    hypot,
    imul,
    log,
    log1p,
    log2,
    log10,
    max,
    min,
    pow,
    random,
    round,
    sign,
    sin,
    sinh,
    sqrt,
    tan,
    tanh,
    trunc,
    E,
    LN10,
    LN2,
    LOG10E,
    LOG2E,
    PI,
    SQRT1_2,
    SQRT2,
  };
  export const PI2: number;
  export const GR = 1.618033988749895;
  export const sDiv: (val: number, div: number) => number;
  export const arrayMax: (arr: number[]) => number;
  export const arrayMin: (arr: number[]) => number;
  export const arraySum: (arr: number[]) => number;
  export const arrayDiff: (arr: number[]) => number;
  export const arrayAvg: (arr: number[]) => number;
  export const arrayMirror: (arr: number[]) => number[];
  export const arrayDownsample: (arr: number[], samples?: number) => number[];
  export const arraySmooth: (arr: number[], factor?: number) => number[];
  export const deg2rad: (deg: number) => number;
  export const rad2deg: (rad: number) => number;
  export const cap: (val: number, minVal?: number, maxVal?: number) => number;
  export const between: (
    val: number,
    minVal?: number,
    maxVal?: number,
  ) => boolean;
  export const beatPrct: (now: number, bpm?: number) => number;
  export const beat: (now: number, bpm?: number) => number;
  export const orientation: (
    width: number,
    height: number,
  ) => "landscape" | "portrait";
  export const objOrientation: (obj: Box) => "landscape" | "portrait";
  export const containBox: (
    box1: Box,
    box2: Box,
  ) => {
    width: number;
    height: number;
  };
  export const coverBox: (
    box1: Box,
    box2: Box,
  ) => {
    width: number;
    height: number;
  };
}
declare module "scripts-dts/mathTools" {
  import type * as mathTools from "src/utils/mathTools";
  global {
    const abs: typeof Math.abs;
    const acos: typeof Math.acos;
    const acosh: typeof Math.acosh;
    const asin: typeof Math.asin;
    const asinh: typeof Math.asinh;
    const atan: typeof Math.atan;
    const atanh: typeof Math.atanh;
    const atan2: typeof Math.atan2;
    const ceil: typeof Math.ceil;
    const cbrt: typeof Math.cbrt;
    const expm1: typeof Math.expm1;
    const clz32: typeof Math.clz32;
    const cos: typeof Math.cos;
    const cosh: typeof Math.cosh;
    const exp: typeof Math.exp;
    const floor: typeof Math.floor;
    const fround: typeof Math.fround;
    const hypot: typeof Math.hypot;
    const imul: typeof Math.imul;
    const log: typeof Math.log;
    const log1p: typeof Math.log1p;
    const log2: typeof Math.log2;
    const log10: typeof Math.log10;
    const max: typeof Math.max;
    const min: typeof Math.min;
    const pow: typeof Math.pow;
    const random: typeof Math.random;
    const round: typeof Math.round;
    const sign: typeof Math.sign;
    const sin: typeof Math.sin;
    const sinh: typeof Math.sinh;
    const sqrt: typeof Math.sqrt;
    const tan: typeof Math.tan;
    const tanh: typeof Math.tanh;
    const trunc: typeof Math.trunc;
    const E: typeof Math.E;
    const LN10: typeof Math.LN10;
    const LN2: typeof Math.LN2;
    const LOG10E: typeof Math.LOG10E;
    const LOG2E: typeof Math.LOG2E;
    const PI: typeof Math.PI;
    const SQRT1_2: typeof Math.SQRT1_2;
    const SQRT2: typeof Math.SQRT2;
    const PI2: typeof mathTools.PI2;
    const GR: typeof mathTools.GR;
    const sDiv: typeof mathTools.sDiv;
    const arrayMax: typeof mathTools.arrayMax;
    const arrayMin: typeof mathTools.arrayMin;
    const arraySum: typeof mathTools.arraySum;
    const arrayDiff: typeof mathTools.arrayDiff;
    const arrayAvg: typeof mathTools.arrayAvg;
    const arrayMirror: typeof mathTools.arrayMirror;
    const arrayDownsample: typeof mathTools.arrayDownsample;
    const arraySmooth: typeof mathTools.arraySmooth;
    const deg2rad: typeof mathTools.deg2rad;
    const rad2deg: typeof mathTools.rad2deg;
    const cap: typeof mathTools.cap;
    const between: typeof mathTools.between;
    const beatPrct: typeof mathTools.beatPrct;
    const beat: typeof mathTools.beat;
    const orientation: typeof mathTools.orientation;
    const objOrientation: typeof mathTools.objOrientation;
    const containBox: typeof mathTools.containBox;
    const coverBox: typeof mathTools.coverBox;
  }
}
declare module "src/utils/blob2DataURI" {
  export default function blob2DataURI(blob: Blob): Promise<unknown>;
}
declare module "src/utils/blobURI2DataURI" {
  export default function blobURI2DataURI(blobURI: string): Promise<unknown>;
}
declare module "src/utils/miscTools" {
  type ReadInterface = (name: string, defaultValue?: any) => any;
  export const noop: (...args: any[]) => any;
  export const rgba: (r?: number, g?: number, b?: number, a?: number) => string;
  export const hsla: (h?: number, s?: number, l?: number, a?: number) => string;
  export const repeat: (times?: number, func?: (...args: any[]) => any) => void;
  export const assetDataURI: (asset: any) => Promise<unknown>;
  export const isFunction: (what: any) => boolean;
  export const toggled: {
    [key: string]: boolean;
  };
  export const prevToggle: {
    [key: string]: any;
  };
  export const toggle: (
    read: ReadInterface,
    name: string,
  ) => (on: any, off: any) => boolean;
  export const inOut: (
    read: ReadInterface,
    name: string,
  ) => (on: any, off: any) => any;
  export const steps: {
    [key: string]: number;
  };
  export const prevStepVals: {
    [key: string]: any;
  };
  export const stepper: (
    read: ReadInterface,
    name: string,
    distance?: number,
  ) => number;
  export const merge: (
    ...objs: {
      [k: string]: any;
    }[]
  ) => {
    [k: string]: any;
  };
  const tools: {
    rgba: (r?: number, g?: number, b?: number, a?: number) => string;
    hsla: (h?: number, s?: number, l?: number, a?: number) => string;
    repeat: (times?: number, func?: (...args: any[]) => any) => void;
    noop: (...args: any[]) => any;
    assetDataURI: (asset: any) => Promise<unknown>;
    isFunction: (what: any) => boolean;
    toggle: (
      read: ReadInterface,
      name: string,
    ) => (on: any, off: any) => boolean;
    inOut: (read: ReadInterface, name: string) => (on: any, off: any) => any;
    stepper: (read: ReadInterface, name: string, distance?: number) => number;
    merge: (
      ...objs: {
        [k: string]: any;
      }[]
    ) => {
      [k: string]: any;
    };
  };
  export default tools;
}
declare module "scripts-dts/miscTools" {
  import type * as miscTools from "src/utils/miscTools";
  global {
    const noop: typeof miscTools.noop;
    const rgba: typeof miscTools.rgba;
    const hsla: typeof miscTools.hsla;
    const repeat: typeof miscTools.repeat;
    const assetDataURI: typeof miscTools.assetDataURI;
    const isFunction: typeof miscTools.isFunction;
    const toggled: typeof miscTools.toggled;
    const prevToggle: typeof miscTools.prevToggle;
    const toggle: typeof miscTools.toggle;
    const inOut: typeof miscTools.inOut;
    const steps: typeof miscTools.steps;
    const prevStepVals: typeof miscTools.prevStepVals;
    const stepper: typeof miscTools.stepper;
    const merge: typeof miscTools.merge;
  }
}
declare module "scripts-dts/worker" {
  import "scripts-dts/scriptRunner";
  import "scripts-dts/mathTools";
  import "scripts-dts/miscTools";
}
