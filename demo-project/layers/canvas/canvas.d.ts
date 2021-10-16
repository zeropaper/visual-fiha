declare module "src/utils/mathTools" {
    type Box = {
        width: number;
        height: number;
    };
    const abs: (x: number) => number, acos: (x: number) => number, acosh: (x: number) => number, asin: (x: number) => number, asinh: (x: number) => number, atan: (x: number) => number, atanh: (x: number) => number, atan2: (y: number, x: number) => number, ceil: (x: number) => number, cbrt: (x: number) => number, expm1: (x: number) => number, clz32: (x: number) => number, cos: (x: number) => number, cosh: (x: number) => number, exp: (x: number) => number, floor: (x: number) => number, fround: (x: number) => number, hypot: (...values: number[]) => number, imul: (x: number, y: number) => number, log: (x: number) => number, log1p: (x: number) => number, log2: (x: number) => number, log10: (x: number) => number, max: (...values: number[]) => number, min: (...values: number[]) => number, pow: (x: number, y: number) => number, random: () => number, round: (x: number) => number, sign: (x: number) => number, sin: (x: number) => number, sinh: (x: number) => number, sqrt: (x: number) => number, tan: (x: number) => number, tanh: (x: number) => number, trunc: (x: number) => number, E: number, LN10: number, LN2: number, LOG10E: number, LOG2E: number, PI: number, SQRT1_2: number, SQRT2: number;
    export { abs, acos, acosh, asin, asinh, atan, atanh, atan2, ceil, cbrt, expm1, clz32, cos, cosh, exp, floor, fround, hypot, imul, log, log1p, log2, log10, max, min, pow, random, round, sign, sin, sinh, sqrt, tan, tanh, trunc, E, LN10, LN2, LOG10E, LOG2E, PI, SQRT1_2, SQRT2, };
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
    export const between: (val: number, minVal?: number, maxVal?: number) => boolean;
    export const beatPrct: (now: number, bpm?: number) => number;
    export const beat: (now: number, bpm?: number) => number;
    export const orientation: (width: number, height: number) => "landscape" | "portrait";
    export const objOrientation: (obj: Box) => "landscape" | "portrait";
    export const containBox: (box1: Box, box2: Box) => {
        width: number;
        height: number;
    };
    export const coverBox: (box1: Box, box2: Box) => {
        width: number;
        height: number;
    };
}
declare module "src/utils/blob2DataURI" {
    export default function blob2DataURI(blob: Blob): Promise<unknown>;
}
declare module "src/utils/blobURI2DataURI" {
    export default function blobURI2DataURI(blobURI: string): Promise<unknown>;
}
declare module "src/utils/miscTools" {
    interface ReadInterface {
        (name: string, defaultValue?: any): any;
    }
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
    export const toggle: (read: ReadInterface, name: string) => (on: any, off: any) => boolean;
    export const inOut: (read: ReadInterface, name: string) => (on: any, off: any) => any;
    export const steps: {
        [key: string]: number;
    };
    export const prevStepVals: {
        [key: string]: any;
    };
    export const stepper: (read: ReadInterface, name: string, distance?: number) => number;
    export const merge: (...objs: {
        [k: string]: any;
    }[]) => {
        [k: string]: any;
    };
    const tools: {
        rgba: (r?: number, g?: number, b?: number, a?: number) => string;
        hsla: (h?: number, s?: number, l?: number, a?: number) => string;
        repeat: (times?: number, func?: (...args: any[]) => any) => void;
        noop: (...args: any[]) => any;
        assetDataURI: (asset: any) => Promise<unknown>;
        isFunction: (what: any) => boolean;
        toggle: (read: ReadInterface, name: string) => (on: any, off: any) => boolean;
        inOut: (read: ReadInterface, name: string) => (on: any, off: any) => any;
        stepper: (read: ReadInterface, name: string, distance?: number) => number;
        merge: (...objs: {
            [k: string]: any;
        }[]) => {
            [k: string]: any;
        };
    };
    export default tools;
}
declare module "src/layers/Canvas2D/canvasTools" {
    interface OffscreenCanvas extends HTMLCanvasElement {
    }
    interface OffscreenCanvasRenderingContext2D extends CanvasRenderingContext2D {
    }
    interface ImageCopyCoordinates {
        sx?: number;
        sy?: number;
        sw?: number;
        sh?: number;
        dx?: number;
        dy?: number;
        dw?: number;
        dh?: number;
    }
    export interface CTX extends OffscreenCanvasRenderingContext2D {
    }
    export interface width {
        (divider?: number): number;
    }
    export interface height {
        (divider?: number): number;
    }
    export interface vmin {
        (multiplier: number): number;
    }
    export interface vmax {
        (multiplier: number): number;
    }
    export interface vh {
        (multiplier: number): number;
    }
    export interface vw {
        (multiplier: number): number;
    }
    export interface textLines {
        (lines: string[], opts?: {
            x?: number;
            y?: number;
            lineHeight?: number;
            position?: string;
            fill?: string | false;
            stroke?: string | false;
        }): void;
    }
    export interface mirror {
        (distance?: number, axis?: 'x' | 'y', img?: OffscreenCanvas): void;
    }
    export interface mediaType {
        (url: string): 'image' | 'video';
    }
    export interface clear {
        (): void;
    }
    export interface copy {
        (sx?: number, sy?: number, sw?: number, sh?: number, dx?: number, dy?: number, dw?: number, dh?: number): OffscreenCanvas;
    }
    interface PasteOperation {
        (src: CanvasImageSource & {
            videoWidth?: number;
            videoHeight?: number;
        }, opts?: ImageCopyCoordinates): void;
    }
    export interface pasteImage extends PasteOperation {
    }
    export interface pasteContain extends PasteOperation {
    }
    export interface pasteCover extends PasteOperation {
    }
    export interface fontSize {
        (size: number, unit?: (v: number) => number): void;
    }
    export interface fontFamily {
        (familyName: string): void;
    }
    export interface fontWeight {
        (weight: string | number): void;
    }
    export interface plot {
        (opts?: {
            data?: any[];
            min?: number;
            max?: number;
            samples?: number;
            floor?: number;
            top?: number;
            bottom?: number;
            left?: number;
            right?: number;
            legend?: string;
            color?: string;
            fontSize?: number;
            flipped?: boolean;
        }): void;
    }
    /**
     * Draws a circle
     */
    export interface circle {
        (opts?: {
            x?: number;
            y?: number;
            radius?: number;
            stroke?: string;
            fill?: string;
        }): void;
    }
    export interface polygon {
        (opts?: {
            x?: number;
            y?: number;
            tilt?: number;
            sides?: number;
            radius?: number;
            stroke?: string;
            fill?: string;
        }): void;
    }
    export interface grid {
        (rows: number, cols: number, func: (...args: any[]) => void): void;
    }
    export interface centeredGrid {
        (opts: {
            cols?: number;
            rows?: number;
            dist?: number;
            unit?: (v: number) => number;
        }, cb: (args: {
            x: number;
            y: number;
            r: number;
            c: number;
            n: number;
            d: number;
        }) => void): void;
    }
    interface CTXMethod {
        (...args: any[]): any;
    }
    interface CTXValue<T> {
        (): T;
        (value: T): T;
    }
    export interface Canvas2DAPI {
        width: width;
        height: height;
        vw: vw;
        vh: vh;
        vmin: vmin;
        vmax: vmax;
        textLines: textLines;
        mirror: mirror;
        mediaType: mediaType;
        clear: clear;
        copy: copy;
        pasteImage: pasteImage;
        pasteContain: pasteContain;
        pasteCover: pasteCover;
        fontSize: fontSize;
        fontFamily: fontFamily;
        fontWeight: fontWeight;
        plot: plot;
        circle: circle;
        polygon: polygon;
        grid: grid;
        centeredGrid: centeredGrid;
        clip: CTXMethod;
        createImageData: CTXMethod;
        createLinearGradient: CTXMethod;
        createPattern: CTXMethod;
        createRadialGradient: CTXMethod;
        drawImage: CTXMethod;
        fill: CTXMethod;
        fillText: CTXMethod;
        getImageData: CTXMethod;
        getLineDash: CTXMethod;
        getTransform: CTXMethod;
        isPointInPath: CTXMethod;
        isPointInStroke: CTXMethod;
        measureText: CTXMethod;
        putImageData: CTXMethod;
        scale: CTXMethod;
        setLineDash: CTXMethod;
        setTransform: CTXMethod;
        stroke: CTXMethod;
        strokeText: CTXMethod;
        transform: CTXMethod;
        translate: CTXMethod;
        arc: CTXMethod;
        arcTo: CTXMethod;
        beginPath: CTXMethod;
        bezierCurveTo: CTXMethod;
        clearRect: CTXMethod;
        closePath: CTXMethod;
        ellipse: CTXMethod;
        fillRect: CTXMethod;
        lineTo: CTXMethod;
        moveTo: CTXMethod;
        quadraticCurveTo: CTXMethod;
        rect: CTXMethod;
        resetTransform: CTXMethod;
        restore: CTXMethod;
        rotate: CTXMethod;
        save: CTXMethod;
        strokeRect: CTXMethod;
        globalAlpha: CTXValue<CTX['globalAlpha']>;
        globalCompositeOperation: CTXValue<CTX['globalCompositeOperation']>;
        filter: CTXValue<CTX['filter']>;
        imageSmoothingEnabled: CTXValue<CTX['imageSmoothingEnabled']>;
        imageSmoothingQuality: CTXValue<CTX['imageSmoothingQuality']>;
        strokeStyle: CTXValue<CTX['strokeStyle']>;
        fillStyle: CTXValue<CTX['fillStyle']>;
        shadowOffsetX: CTXValue<CTX['shadowOffsetX']>;
        shadowOffsetY: CTXValue<CTX['shadowOffsetY']>;
        shadowBlur: CTXValue<CTX['shadowBlur']>;
        shadowColor: CTXValue<CTX['shadowColor']>;
        lineWidth: CTXValue<CTX['lineWidth']>;
        lineCap: CTXValue<CTX['lineCap']>;
        lineJoin: CTXValue<CTX['lineJoin']>;
        miterLimit: CTXValue<CTX['miterLimit']>;
        lineDashOffset: CTXValue<CTX['lineDashOffset']>;
        font: CTXValue<CTX['font']>;
        textAlign: CTXValue<CTX['textAlign']>;
        textBaseline: CTXValue<CTX['textBaseline']>;
        direction: CTXValue<CTX['direction']>;
    }
    export default function canvasTools(ctx: CTX): Canvas2DAPI;
}
declare module "src/utils/ScriptRunner" {
    export interface ScriptLog {
        (...args: any[]): void;
    }
    export type ScriptRunnerEventTypes = 'compilationerror' | 'executionerror' | 'log';
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
        readonly type: 'compilationerror' | 'executionerror';
        builderStr?: string;
        code?: string;
    }
    export interface ScriptRunnerLogEvent extends ScriptRunnerEvent {
        data: any;
        readonly type: 'log';
    }
    export interface ScriptRunnerEventListener {
        (event: ScriptRunnerErrorEvent | ScriptRunnerLogEvent): boolean | void;
    }
    export type API = {
        [scriptGlobalName: string]: any;
    };
    export const removeExportCrutch: (str: string) => string;
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
        addEventListener(type: ScriptRunnerEventTypes, callback: ScriptRunnerEventListener): void;
        removeEventListener(type: ScriptRunnerEventTypes, callback: ScriptRunnerEventListener): void;
        dispatchEvent(event: ScriptRunnerErrorEvent | ScriptRunnerLogEvent): boolean;
        exec(): any;
    }
    export default ScriptRunner;
}
declare module "src/utils/Scriptable" {
    import ScriptRunner, { ScriptRunnerEventListener, API } from "src/utils/ScriptRunner";
    export type Cache = {
        [k: string]: any;
    };
    export interface ReadInterface {
        (name: string, defaultValue?: any): any;
    }
    export interface WriteInterface {
        (data: {
            [k: string]: any;
        }): void;
    }
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
        initialize: ({ setup, animation, onCompilationError, onExecutionError, }: ScriptableOptions) => void;
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
    export {};
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
    export {};
}
declare module "src/utils/assetTools" {
    export function clearFetchedAssets(url?: string): void;
    export function loadImage(url: string): Promise<ImageBitmap>;
    export function loadVideo(url: string): Promise<ImageBitmap>;
    export function asset(url: string): Promise<Blob | ImageBitmap>;
}
declare module "scripts-dts/assetTools" {
    import type * as assetTools from "src/utils/assetTools";
    global {
        const clearFetchedAssets: typeof assetTools.clearFetchedAssets;
        const loadImage: typeof assetTools.loadImage;
        const loadVideo: typeof assetTools.loadVideo;
        const asset: typeof assetTools.asset;
    }
    export {};
}
declare module "scripts-dts/canvas" {
    import type { Canvas2DAPI } from "src/layers/Canvas2D/canvasTools";
    import "scripts-dts/scriptRunner";
    import "scripts-dts/mathTools";
    import "scripts-dts/miscTools";
    import "scripts-dts/assetTools";
    global {
        const width: Canvas2DAPI['width'];
        const height: Canvas2DAPI['height'];
        const vmin: Canvas2DAPI['vmin'];
        const vmax: Canvas2DAPI['vmax'];
        const vh: Canvas2DAPI['vh'];
        const vw: Canvas2DAPI['vw'];
        const textLines: Canvas2DAPI['textLines'];
        const mirror: Canvas2DAPI['mirror'];
        const mediaType: Canvas2DAPI['mediaType'];
        const clear: Canvas2DAPI['clear'];
        const copy: Canvas2DAPI['copy'];
        const pasteImage: Canvas2DAPI['pasteImage'];
        const pasteContain: Canvas2DAPI['pasteContain'];
        const pasteCover: Canvas2DAPI['pasteCover'];
        const fontSize: Canvas2DAPI['fontSize'];
        const fontFamily: Canvas2DAPI['fontFamily'];
        const fontWeight: Canvas2DAPI['fontWeight'];
        const plot: Canvas2DAPI['plot'];
        const circle: Canvas2DAPI['circle'];
        const polygon: Canvas2DAPI['polygon'];
        const grid: Canvas2DAPI['grid'];
        const centeredGrid: Canvas2DAPI['centeredGrid'];
        const clip: Canvas2DAPI['clip'];
        const createImageData: Canvas2DAPI['createImageData'];
        const createLinearGradient: Canvas2DAPI['createLinearGradient'];
        const createPattern: Canvas2DAPI['createPattern'];
        const createRadialGradient: Canvas2DAPI['createRadialGradient'];
        const drawImage: Canvas2DAPI['drawImage'];
        const fill: Canvas2DAPI['fill'];
        const fillText: Canvas2DAPI['fillText'];
        const getImageData: Canvas2DAPI['getImageData'];
        const getLineDash: Canvas2DAPI['getLineDash'];
        const getTransform: Canvas2DAPI['getTransform'];
        const isPointInPath: Canvas2DAPI['isPointInPath'];
        const isPointInStroke: Canvas2DAPI['isPointInStroke'];
        const measureText: Canvas2DAPI['measureText'];
        const putImageData: Canvas2DAPI['putImageData'];
        const scale: Canvas2DAPI['scale'];
        const setLineDash: Canvas2DAPI['setLineDash'];
        const setTransform: Canvas2DAPI['setTransform'];
        const stroke: Canvas2DAPI['stroke'];
        const strokeText: Canvas2DAPI['strokeText'];
        const transform: Canvas2DAPI['transform'];
        const translate: Canvas2DAPI['translate'];
        const arc: Canvas2DAPI['arc'];
        const arcTo: Canvas2DAPI['arcTo'];
        const beginPath: Canvas2DAPI['beginPath'];
        const bezierCurveTo: Canvas2DAPI['bezierCurveTo'];
        const clearRect: Canvas2DAPI['clearRect'];
        const closePath: Canvas2DAPI['closePath'];
        const ellipse: Canvas2DAPI['ellipse'];
        const fillRect: Canvas2DAPI['fillRect'];
        const lineTo: Canvas2DAPI['lineTo'];
        const moveTo: Canvas2DAPI['moveTo'];
        const quadraticCurveTo: Canvas2DAPI['quadraticCurveTo'];
        const rect: Canvas2DAPI['rect'];
        const resetTransform: Canvas2DAPI['resetTransform'];
        const restore: Canvas2DAPI['restore'];
        const rotate: Canvas2DAPI['rotate'];
        const save: Canvas2DAPI['save'];
        const strokeRect: Canvas2DAPI['strokeRect'];
        const globalAlpha: Canvas2DAPI['globalAlpha'];
        const globalCompositeOperation: Canvas2DAPI['globalCompositeOperation'];
        const filter: Canvas2DAPI['filter'];
        const imageSmoothingEnabled: Canvas2DAPI['imageSmoothingEnabled'];
        const imageSmoothingQuality: Canvas2DAPI['imageSmoothingQuality'];
        const strokeStyle: Canvas2DAPI['strokeStyle'];
        const fillStyle: Canvas2DAPI['fillStyle'];
        const shadowOffsetX: Canvas2DAPI['shadowOffsetX'];
        const shadowOffsetY: Canvas2DAPI['shadowOffsetY'];
        const shadowBlur: Canvas2DAPI['shadowBlur'];
        const shadowColor: Canvas2DAPI['shadowColor'];
        const lineWidth: Canvas2DAPI['lineWidth'];
        const lineCap: Canvas2DAPI['lineCap'];
        const lineJoin: Canvas2DAPI['lineJoin'];
        const miterLimit: Canvas2DAPI['miterLimit'];
        const lineDashOffset: Canvas2DAPI['lineDashOffset'];
        const font: Canvas2DAPI['font'];
        const textAlign: Canvas2DAPI['textAlign'];
        const textBaseline: Canvas2DAPI['textBaseline'];
        const direction: Canvas2DAPI['direction'];
    }
    export {};
}
