interface Box {
  width: number;
  height: number;
}

const {
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
} = Math;
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

export const PI2 = Math.PI * 2;

export const GR = 1.618033988;

export const sDiv = (val: number, div: number): number => val * (1 / div);

export const arrayMax = (arr: number[]) =>
  arr.reduce((val, prev) => Math.max(val, prev), 0);

export const arrayMin = (arr: number[]) =>
  arr.reduce((val, prev) => Math.min(val, prev), Number.POSITIVE_INFINITY);

export const arraySum = (arr: number[]) =>
  arr.reduce((val, prev) => val + prev, 0);

export const arrayDiff = (arr: number[]) =>
  Math.abs(arrayMax(arr) - arrayMin(arr));

export const arrayAvg = (arr: number[]) => sDiv(arraySum(arr), arr.length);

export const arrayMirror = (arr: number[]) => [...arr, ...arr.reverse()];

export const arrayDownsample = (arr: number[], samples = 2) => {
  const result: number[] = [];
  arr.forEach((item, i) => {
    if (i % samples === 0) result.push(item);
  });
  return result;
};

export const arraySmooth = (arr: number[], factor = 2) =>
  arr.reduce((acc: number[], val: number, index: number) => {
    acc.push(arrayAvg(arr.slice(index, index + factor)));
    return acc;
  }, []);

export const deg2rad = (deg: number) => (PI2 / 360) * deg;

export const rad2deg = (rad: number) => (360 / PI2) * rad;

export const cap = (val: number, minVal = 0, maxVal = 127) =>
  Math.min(Math.max(val, minVal), maxVal);

export const between = (val: number, minVal = 0, maxVal = 127) =>
  val < maxVal && val > minVal;

export const beatPrct = (now: number, bpm = 120) => {
  const timeBetweenBeats = sDiv(60, bpm) * 1000;
  return cap(sDiv(now % timeBetweenBeats, timeBetweenBeats), 0, 1);
};

export const beat = (now: number, bpm = 120) => {
  console.log("[DERECATED]: beat(), use beatPrct() instead");
  return beatPrct(now, bpm);
};

export const orientation = (width: number, height: number) =>
  width >= height ? "landscape" : "portrait";

export const objOrientation = (obj: Box) => orientation(obj.width, obj.height);

export const containBox = (box1: Box, box2: Box) => {
  const { width, height } = box1;
  const { width: box2Width, height: box2Height } = box2;
  const { width: box1Width, height: box1Height } = box1;
  const x = (box2Width / box1Width) * width;
  const y = (box2Height / box1Height) * height;
  return { width: x, height: y };
};

export const coverBox = (box1: Box, box2: Box) => {
  const { width, height } = box1;
  const { width: box2Width, height: box2Height } = box2;
  const { width: box1Width, height: box1Height } = box1;
  const x = (box1Width / box2Width) * width;
  const y = (box1Height / box2Height) * height;
  return { width: x, height: y };
};

/* 
declare global {
  const abs: typeof abs;
  const acos: typeof acos;
  const acosh: typeof acosh;
  const asin: typeof asin;
  const asinh: typeof asinh;
  const atan: typeof atan;
  const atanh: typeof atanh;
  const atan2: typeof atan2;
  const ceil: typeof ceil;
  const cbrt: typeof cbrt;
  const expm1: typeof expm1;
  const clz32: typeof clz32;
  const cos: typeof cos;
  const cosh: typeof cosh;
  const exp: typeof exp;
  const floor: typeof floor;
  const fround: typeof fround;
  const hypot: typeof hypot;
  const imul: typeof imul;
  const log: typeof log;
  const log1p: typeof log1p;
  const log2: typeof log2;
  const log10: typeof log10;
  const max: typeof max;
  const min: typeof min;
  const pow: typeof pow;
  const random: typeof random;
  const round: typeof round;
  const sign: typeof sign;
  const sin: typeof sin;
  const sinh: typeof sinh;
  const sqrt: typeof sqrt;
  const tan: typeof tan;
  const tanh: typeof tanh;
  const trunc: typeof trunc;
  const E: typeof E;
  const LN10: typeof LN10;
  const LN2: typeof LN2;
  const LOG10E: typeof LOG10E;
  const LOG2E: typeof LOG2E;
  const PI: typeof PI;
  const SQRT1_2: typeof SQRT1_2;
  const SQRT2: typeof SQRT2;
}
*/
