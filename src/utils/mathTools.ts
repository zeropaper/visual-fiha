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
