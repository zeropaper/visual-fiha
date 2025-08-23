interface Box {
  width: number;
  height: number;
}

const mathTools = {
  abs: Math.abs,
  acos: Math.acos,
  acosh: Math.acosh,
  asin: Math.asin,
  asinh: Math.asinh,
  atan: Math.atan,
  atanh: Math.atanh,
  atan2: Math.atan2,
  ceil: Math.ceil,
  cbrt: Math.cbrt,
  expm1: Math.expm1,
  clz32: Math.clz32,
  cos: Math.cos,
  cosh: Math.cosh,
  exp: Math.exp,
  floor: Math.floor,
  fround: Math.fround,
  hypot: Math.hypot,
  imul: Math.imul,
  log: Math.log,
  log1p: Math.log1p,
  log2: Math.log2,
  log10: Math.log10,
  max: Math.max,
  min: Math.min,
  pow: Math.pow,
  random: Math.random,
  round: Math.round,
  sign: Math.sign,
  sin: Math.sin,
  sinh: Math.sinh,
  sqrt: Math.sqrt,
  tan: Math.tan,
  tanh: Math.tanh,
  trunc: Math.trunc,
  E: Math.E,
  LN10: Math.LN10,
  LN2: Math.LN2,
  LOG10E: Math.LOG10E,
  LOG2E: Math.LOG2E,
  PI: Math.PI,
  SQRT1_2: Math.SQRT1_2,
  SQRT2: Math.SQRT2,
  PI2: Math.PI * 2,
  GR: 1.618033988,
  sDiv: (val: number, div: number): number => val * (1 / div),
  arrayMax: (arr: number[]) =>
    arr.reduce((val, prev) => Math.max(val, prev), 0),
  arrayMin: (arr: number[]) =>
    arr.reduce((val, prev) => Math.min(val, prev), Number.POSITIVE_INFINITY),
  arraySum: (arr: number[]) => arr.reduce((val, prev) => val + prev, 0),
  arrayDiff: (arr: number[]) =>
    Math.abs(mathTools.arrayMax(arr) - mathTools.arrayMin(arr)),
  arrayAvg: (arr: number[]) =>
    mathTools.sDiv(mathTools.arraySum(arr), arr.length),
  arrayMirror: (arr: number[]) => [...arr, ...arr.reverse()],
  arrayDownsample: (arr: number[], samples = 2) => {
    const result: number[] = [];
    arr.forEach((item, i) => {
      if (i % samples === 0) result.push(item);
    });
    return result;
  },
  arraySmooth: (arr: number[], factor = 2) =>
    arr.reduce((acc: number[], _val: number, index: number) => {
      acc.push(mathTools.arrayAvg(arr.slice(index, index + factor)));
      return acc;
    }, []),
  deg2rad: (deg: number) => (mathTools.PI2 / 360) * deg,
  rad2deg: (rad: number) => (360 / mathTools.PI2) * rad,
  cap: (val: number, minVal = 0, maxVal = 127) =>
    Math.min(Math.max(val, minVal), maxVal),
  between: (val: number, minVal = 0, maxVal = 127) =>
    val < maxVal && val > minVal,
  beatPrct: (now: number, bpm = 120) => {
    const timeBetweenBeats = mathTools.sDiv(60, bpm) * 1000;
    return mathTools.cap(
      mathTools.sDiv(now % timeBetweenBeats, timeBetweenBeats),
      0,
      1,
    );
  },
  beat: (now: number, bpm = 120) => {
    console.log("[DERECATED]: beat(), use beatPrct() instead");
    return mathTools.beatPrct(now, bpm);
  },
  getOrientation: (width: number, height: number) =>
    width >= height ? "landscape" : "portrait",
  objOrientation: (obj: Box) => mathTools.getOrientation(obj.width, obj.height),
  containsBox: (box1: Box, box2: Box) => {
    const { width, height } = box1;
    const { width: box2Width, height: box2Height } = box2;
    const { width: box1Width, height: box1Height } = box1;
    const x = (box1Width / box2Width) * width;
    const y = (box1Height / box2Height) * height;
    return { width: x, height: y };
  },
  coversBox: (box1: Box, box2: Box) => {
    const { width, height } = box1;
    const { width: box2Width, height: box2Height } = box2;
    const { width: box1Width, height: box1Height } = box1;
    const x = (box1Width / box2Width) * width;
    const y = (box1Height / box2Height) * height;
    return { width: x, height: y };
  },
};

export default mathTools;

declare global {
  /**
   * Get the absolute value of a number
   * @param x - The number to get the absolute value of
   * @returns The absolute value of the number
   */
  const abs: (typeof mathTools)["abs"];
  /**
   * Get the arc cosine of a number
   * @param x - The number to get the arc cosine of
   * @returns The arc cosine of the number
   */
  const acos: (typeof mathTools)["acos"];
  /**
   * Get the hyperbolic arc cosine of a number
   * @param x - The number to get the hyperbolic arc cosine of
   * @returns The hyperbolic arc cosine of the number
   */
  const acosh: (typeof mathTools)["acosh"];
  /**
   * Get the arc sine of a number
   * @param x - The number to get the arc sine of
   * @returns The arc sine of the number
   */
  const asin: (typeof mathTools)["asin"];
  /**
   * Get the hyperbolic arc sine of a number
   * @param x - The number to get the hyperbolic arc sine of
   * @returns The hyperbolic arc sine of the number
   */
  const asinh: (typeof mathTools)["asinh"];
  /**
   * Get the arc tangent of a number
   * @param x - The number to get the arc tangent of
   * @returns The arc tangent of the number
   */
  const atan: (typeof mathTools)["atan"];
  /**
   * Get the hyperbolic arc tangent of a number
   * @param x - The number to get the hyperbolic arc tangent of
   * @returns The hyperbolic arc tangent of the number
   */
  const atanh: (typeof mathTools)["atanh"];
  /**
   * Get the arc tangent of y/x
   * @param y - The y coordinate
   * @param x - The x coordinate
   * @returns The arc tangent of y/x
   */
  const atan2: (typeof mathTools)["atan2"];
  /**
   * Get the ceiling of a number
   * @param x - The number to get the ceiling of
   * @returns The ceiling of the number
   */
  const ceil: (typeof mathTools)["ceil"];
  /**
   * Get the cube root of a number
   * @param x - The number to get the cube root of
   * @returns The cube root of the number
   */
  const cbrt: (typeof mathTools)["cbrt"];
  /**
   * Get the exponential minus one of a number
   * @param x - The number to get the exponential minus one of
   * @returns The exponential minus one of the number
   */
  const expm1: (typeof mathTools)["expm1"];
  /**
   * Get the number of leading zero bits in a 32-bit integer
   * @param x - The number to count the leading zero bits of
   * @returns The number of leading zero bits in the number
   */
  const clz32: (typeof mathTools)["clz32"];
  /**
   * Get the cosine of a number
   * @param x - The number to get the cosine of
   * @returns The cosine of the number
   */
  const cos: (typeof mathTools)["cos"];
  /**
   * Get the hyperbolic cosine of a number
   * @param x - The number to get the hyperbolic cosine of
   * @returns The hyperbolic cosine of the number
   */
  const cosh: (typeof mathTools)["cosh"];
  /**
   * Get the exponential of a number
   * @param x - The number to get the exponential of
   * @returns The exponential of the number
   */
  const exp: (typeof mathTools)["exp"];
  /**
   * Get the floor of a number
   * @param x - The number to get the floor of
   * @returns The floor of the number
   */
  const floor: (typeof mathTools)["floor"];
  /**
   * Get the nearest single precision float representation of a number
   * @param x - The number to round to single precision
   * @returns The rounded number
   */
  const fround: (typeof mathTools)["fround"];
  /**
   * Get the hypotenuse of two numbers
   * @param x - The first number
   * @param y - The second number
   * @returns The hypotenuse of the two numbers
   */
  const hypot: (typeof mathTools)["hypot"];
  /**
   * Get the integer multiplication of two numbers
   * @param x - The first number
   * @param y - The second number
   * @returns The integer multiplication of the two numbers
   */
  const imul: (typeof mathTools)["imul"];
  /**
   * Get the natural logarithm of a number
   * @param x - The number to get the natural logarithm of
   * @returns The natural logarithm of the number
   */
  const log: (typeof mathTools)["log"];
  /**
   * Get the natural logarithm of 1 + x
   * @param x - The number to get the natural logarithm of
   * @returns The natural logarithm of 1 + x
   */
  const log1p: (typeof mathTools)["log1p"];
  /**
   * Get the base 2 logarithm of a number
   * @param x - The number to get the base 2 logarithm of
   * @returns The base 2 logarithm of the number
   */
  const log2: (typeof mathTools)["log2"];
  /**
   * Get the base 10 logarithm of a number
   * @param x - The number to get the base 10 logarithm of
   * @returns The base 10 logarithm of the number
   */
  const log10: (typeof mathTools)["log10"];
  /**
   * Get the maximum value of two numbers
   * @param x - The first number
   * @param y - The second number
   * @returns The maximum value of the two numbers
   */
  const max: (typeof mathTools)["max"];
  /**
   * Get the minimum value of two numbers
   * @param x - The first number
   * @param y - The second number
   * @returns The minimum value of the two numbers
   */
  const min: (typeof mathTools)["min"];
  /**
   * Get the power of a number
   * @param base - The base number
   * @param exponent - The exponent to raise the base to
   * @returns The result of raising the base to the exponent
   */
  const pow: (typeof mathTools)["pow"];
  /**
   * Get a random number
   * @returns A random number
   */
  const random: (typeof mathTools)["random"];
  /**
   * Get the rounded value of a number
   * @param x - The number to round
   * @returns The rounded number
   */
  const round: (typeof mathTools)["round"];
  /**
   * Get the sign of a number
   * @param x - The number to get the sign of
   * @returns The sign of the number
   */
  const sign: (typeof mathTools)["sign"];
  /**
   * Get the sine of a number
   * @param x - The number to get the sine of
   * @returns The sine of the number
   */
  const sin: (typeof mathTools)["sin"];
  /**
   * Get the hyperbolic sine of a number
   * @param x - The number to get the hyperbolic sine of
   * @returns The hyperbolic sine of the number
   */
  const sinh: (typeof mathTools)["sinh"];
  /**
   * Get the square root of a number
   * @param x - The number to get the square root of
   * @returns The square root of the number
   */
  const sqrt: (typeof mathTools)["sqrt"];
  /**
   * Get the tangent of a number
   * @param x - The number to get the tangent of
   * @returns The tangent of the number
   */
  const tan: (typeof mathTools)["tan"];
  /**
   * Get the hyperbolic tangent of a number
   * @param x - The number to get the hyperbolic tangent of
   * @returns The hyperbolic tangent of the number
   */
  const tanh: (typeof mathTools)["tanh"];
  /**
   * Get the integer part of a number
   * @param x - The number to truncate
   * @returns The integer part of the number
   */
  const trunc: (typeof mathTools)["trunc"];
  /**
   * Euler's number
   */
  const E: (typeof mathTools)["E"];
  /**
   * The natural logarithm of 10
   */
  const LN10: (typeof mathTools)["LN10"];
  /**
   * The natural logarithm of 2
   */
  const LN2: (typeof mathTools)["LN2"];
  /**
   * The base 10 logarithm of E
   */
  const LOG10E: (typeof mathTools)["LOG10E"];
  /**
   * The base 2 logarithm of E
   */
  const LOG2E: (typeof mathTools)["LOG2E"];
  /**
   * PI
   */
  const PI: (typeof mathTools)["PI"];
  /**
   * The square root of 1/2
   */
  const SQRT1_2: (typeof mathTools)["SQRT1_2"];
  /**
   * The square root of 2
   */
  const SQRT2: (typeof mathTools)["SQRT2"];
  /**
   * 2 times PI
   */
  const PI2: (typeof mathTools)["PI2"];
  /**
   * Golden Ratio
   */
  const GR: (typeof mathTools)["GR"];
  /**
   * Safe division avoiding division by zero
   * @param val - The value to be divided
   * @return The result of the division, or 0 if the divisor is 0
   */
  const sDiv: (typeof mathTools)["sDiv"];
  /**
   * Get the maximum value from an array
   * @param arr - The array to search
   * @returns The maximum value found, or undefined if the array is empty
   */
  const arrayMax: (typeof mathTools)["arrayMax"];
  /**
   * Get the minimum value from an array
   * @param arr - The array to search
   * @returns The minimum value found, or undefined if the array is empty
   */
  const arrayMin: (typeof mathTools)["arrayMin"];
  /**
   * Get the average value from an array
   * @param arr - The array to search
   * @returns The average value found, or undefined if the array is empty
   */
  const arrayAvg: (typeof mathTools)["arrayAvg"];
  /**
   * Get the sum of all values in an array
   * @param arr - The array to search
   * @returns The sum of all values found, or 0 if the array is empty
   */
  const arraySum: (typeof mathTools)["arraySum"];
  /**
   * Get the difference between the maximum and minimum values in an array
   * @param arr - The array to search
   * @returns The difference found, or 0 if the array is empty
   */
  const arrayDiff: (typeof mathTools)["arrayDiff"];
  /**
   * Get a mirrored version of the array
   * @param arr - The array to mirror
   * @returns The mirrored array
   */
  const arrayMirror: (typeof mathTools)["arrayMirror"];
  /**
   * Downsample the array to a specific length
   * @param arr - The array to downsample
   * @param length - The desired length of the downsampled array
   * @returns The downsampled array
   */
  const arrayDownsample: (typeof mathTools)["arrayDownsample"];
  /**
   * Smooth the array using a simple moving average
   * @param arr - The array to smooth
   * @param factor - The smoothing factor (default is 2)
   * @returns The smoothed array
   */
  const arraySmooth: (typeof mathTools)["arraySmooth"];
  /**
   * Convert degrees to radians
   * @param degrees - The angle in degrees
   * @returns The angle in radians
   */
  const deg2rad: (typeof mathTools)["deg2rad"];
  /**
   * Convert radians to degrees
   * @param radians - The angle in radians
   * @returns The angle in degrees
   */
  const rad2deg: (typeof mathTools)["rad2deg"];
  /**
   * Cap a value between a minimum and maximum range
   * @param val - The value to cap
   * @param min - The minimum value
   * @param max - The maximum value
   * @returns The capped value
   */
  const cap: (typeof mathTools)["cap"];
  /**
   * Check if a value is between a minimum and maximum range
   * @param val - The value to check
   * @param min - The minimum value
   * @param max - The maximum value
   * @returns True if the value is between the range, false otherwise
   */
  const between: (typeof mathTools)["between"];
  /**
   * Get the percentage of beats in a given time
   * @param time - The time to check
   * @returns The percentage of beats
   */
  const beatPrct: (typeof mathTools)["beatPrct"];
  /**
   * Get the current beat based on the time
   * @param time - The time to check
   * @returns The current beat
   */
  const beat: (typeof mathTools)["beat"];
  /**
   * Get the orientation of the device
   * @returns The orientation of the device
   */
  const getOrientation: (typeof mathTools)["getOrientation"];
  /**
   * Get the orientation of an object
   * @param obj - The object to check
   * @returns The orientation of the object
   */
  const objOrientation: (typeof mathTools)["objOrientation"];
  /**
   * Check if a box contains another box
   * @param outer - The outer box
   * @param inner - The inner box
   * @returns True if the outer box contains the inner box, false otherwise
   */
  const containsBox: (typeof mathTools)["containsBox"];
  /**
   * Check if a box covers another box
   * @param outer - The outer box
   * @param inner - The inner box
   * @returns True if the outer box covers the inner box, false otherwise
   */
  const coversBox: (typeof mathTools)["coversBox"];
}
